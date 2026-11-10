// supabase/functions/api/index.ts
// One edge function for the whole study. Deploy with verify_jwt = false (participants are anonymous; the pid is the key).
// Secrets (Supabase > Edge Functions > Secrets, never in the frontend or GitHub):
//   ANTHROPIC_API_KEY, ADMIN_TOKEN, and optionally MODEL, CANVAS_SECONDS, ALLOW_FORCED_CONDITION, ALLOW_PREVIEW_PID, SURVEY_URL
// Request: POST { action, pid, ... }  ->  JSON.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { BLOCKS, BLOCK_KEYS, BLOCK_BY_KEY, IDEAS, MAX_BOX_CHARS, MIN_FILLED_BOXES, TEXT, THEME_KEYS, DEFAULT_ASSIGNED_IDEA } from "../_shared/content.ts";
import { parseReply, systemPrompt } from "../_shared/prompts.ts";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const env = (k: string, d = "") => Deno.env.get(k) ?? d;
const MODEL = env("MODEL", "claude-sonnet-5-5");
const CANVAS_SECONDS = parseInt(env("CANVAS_SECONDS", "1200"));
const MAX_USER_MESSAGES = 60, MAX_MESSAGE_CHARS = 1500, MAX_OUTPUT_TOKENS = 1200;
const PID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });
const err = (msg: string, status = 400) => json({ error: msg }, status);

type Boxes = Record<string, string>;
function cleanBoxes(raw: any): Boxes {
  raw = raw && typeof raw === "object" ? raw : {};
  const out: Boxes = {
    title: String(raw.title ?? "").slice(0, 80), tagline: String(raw.tagline ?? "").slice(0, 140),
    theme: THEME_KEYS.includes(raw.theme) ? raw.theme : THEME_KEYS[0],
  };
  for (const k of BLOCK_KEYS) out[k] = String(raw[k] ?? "").slice(0, MAX_BOX_CHARS);
  return out;
}
const filledCount = (b: Boxes) => BLOCK_KEYS.filter((k) => (b[k] ?? "").trim()).length;
const logEvent = (pid: string, page: string, type: string, detail?: unknown) =>
  db.from("events").insert({ pid, page, event_type: type, detail: detail == null ? null : String(detail).slice(0, 500) });

async function getParticipant(pid: unknown) {
  if (typeof pid !== "string" || !PID_RE.test(pid)) return null;
  const { data } = await db.from("participants").select("*").eq("pid", pid).maybeSingle();
  return data;
}

async function chatHistory(pid: string) {
  const { data } = await db.from("messages").select("role,content,box,suggestions,kind").eq("pid", pid).order("id");
  return (data ?? []).map((m) => ({
    role: m.role, content: m.content, box: m.box, kind: m.kind ?? "",
    box_title: BLOCK_BY_KEY[m.box ?? ""]?.title ?? "", suggestions: (m.suggestions as string[]) ?? [],
  }));
}

// The conversation as the AI sees it: suggestions it gave are written out in its own turns.
function llmHistory(h: Awaited<ReturnType<typeof chatHistory>>) {
  const out: { role: string; content: string }[] = [];
  for (const m of h) {
    let text = m.content;
    if (m.role === "assistant" && m.suggestions.length) text += "\nMy suggestions: " + m.suggestions.join(" | ");
    if (m.role === "assistant" && (m.kind === "auto" || m.kind === "reopen") && m.box_title)
      text = `[I opened the box "${m.box_title}" and said:] ` + text;
    out.push({ role: m.role, content: text });
  }
  // Anthropic needs alternating turns that start with the user
  const merged: { role: string; content: string }[] = [];
  for (const m of out) {
    if (!m.content.trim()) continue;
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) last.content += "\n\n" + m.content; else merged.push({ ...m });
  }
  while (merged.length && merged[0].role !== "user") merged.shift();
  return merged;
}

async function callClaude(system: string, messages: { role: string; content: string }[]) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": env("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, system, messages, max_tokens: MAX_OUTPUT_TOKENS }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const d = await r.json();
  const text = (d.content ?? []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
  return { text, model: d.model ?? MODEL };
}

async function askAI(p: any, boxes: Boxes, boxKey: string, mode: "open" | "reopen" | "chat") {
  const history = llmHistory(await chatHistory(p.pid));
  if (mode === "open") history.push({ role: "user", content: "I just opened this box. What do you suggest?" });
  if (mode === "reopen") history.push({ role: "user", content: "I'm back at this box and I've worked on it. What do you think?" });
  // merge again in case the pushed turn follows another user turn
  const merged: typeof history = [];
  for (const m of history) { const l = merged[merged.length - 1]; if (l && l.role === m.role) l.content += "\n\n" + m.content; else merged.push(m); }
  const { text, model } = await callClaude(systemPrompt(p.idea_index, boxes, boxKey, mode), merged);
  const { reply, suggestions } = parseReply(text);
  if (!reply.trim()) throw new Error("empty reply");
  return { reply, suggestions, model };
}

async function saveCanvas(pid: string, boxes: Boxes) {
  const { data: row } = await db.from("canvas").select("boxes").eq("pid", pid).maybeSingle();
  const old = cleanBoxes(row?.boxes);
  const changes = ["title", "tagline", "theme", ...BLOCK_KEYS].filter((k) => boxes[k] !== old[k]).map((k) => ({ pid, box: k, text: boxes[k] }));
  if (changes.length) await db.from("canvas_log").insert(changes);
  await db.from("canvas").update({ boxes, updated_at: new Date().toISOString() }).eq("pid", pid);
}

async function aiParticipant(pid: unknown) {
  const p = await getParticipant(pid);
  return p && p.condition === "canvas_ai" ? p : null;
}

// ---- researcher exports -------------------------------------------------------------------------------------------
const safeCell = (v: unknown) => {
  let s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;      // stop spreadsheet formula injection
  return `"${s.replaceAll('"', '""')}"`;
};
async function exportCsv(name: string) {
  const tables: Record<string, string> = { participants: "pid", canvas: "pid", canvas_log: "id", messages: "id", events: "id" };
  if (!(name in tables)) return err("unknown export", 404);
  const rows: any[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from(name).select("*").order(tables[name]).range(from, from + 999);
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < 1000) break;
  }
  const cols = rows.length ? Object.keys(rows[0]) : [];
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => safeCell(r[c])).join(","))].join("\n");
  return new Response("﻿" + csv, { headers: { ...cors, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename=${name}.csv` } });
}

// ---- router -------------------------------------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  let body: any = {};
  try { body = await req.json(); } catch (_) { /* empty */ }
  const action = String(body.action ?? "");
  const now = new Date().toISOString();

  try {
    // Researcher: { action:"export", name:"messages", token }
    if (action === "export") {
      const token = env("ADMIN_TOKEN");
      if (!token || String(body.token ?? "") !== token) return err("forbidden", 403);
      return await exportCsv(String(body.name ?? ""));
    }

    // Register (or look up) a participant, assign the condition. { pid, src?, cond? }
    if (action === "start") {
      let pid = String(body.pid ?? "").trim();
      if (!pid && env("ALLOW_PREVIEW_PID") === "1") pid = "PREVIEW-" + crypto.randomUUID().slice(0, 8);
      if (!PID_RE.test(pid)) return err("missing_pid");
      let p = await getParticipant(pid);
      if (!p) {
        let condition: string;
        if (env("ALLOW_FORCED_CONDITION") === "1" && ["canvas_ai", "canvas_noai"].includes(body.cond)) condition = body.cond;
        else {
          const { data, error } = await db.rpc("assign_condition", { p_pid: pid });
          if (error) throw error;
          condition = data as string;
        }
        const idea = DEFAULT_ASSIGNED_IDEA;
        const src = body.src ? String(body.src).slice(0, 40) : null;
        await db.from("participants").upsert({ pid, condition, idea_index: idea, src }, { onConflict: "pid", ignoreDuplicates: true });
        await logEvent(pid, "study", "registered", condition);
        p = await getParticipant(pid);
      } else await db.from("participants").update({ last_seen: now }).eq("pid", pid);
      const { data: chosen } = await db.from("events").select("id").eq("pid", pid).eq("event_type", "idea_chosen").limit(1);
      return json({ pid, condition: p.condition, idea_index: p.idea_index, chosen: !!chosen?.length });
    }

    const p = await getParticipant(body.pid);
    if (!p) return err("unknown participant", 404);
    const pid: string = p.pid;

    // Intro: the participant chooses one of the five ideas (only before any box has text). { idea }
    if (action === "idea") {
      const n = parseInt(body.idea);
      if (!(n >= 1 && n <= IDEAS.length)) return err("bad idea");
      const { data: c } = await db.from("canvas").select("boxes").eq("pid", pid).maybeSingle();
      const started = c && BLOCK_KEYS.some((k) => String((c.boxes as any)?.[k] ?? "").trim());
      if (started) return json({ ok: false, idea: p.idea_index });
      await db.from("participants").update({ idea_index: n }).eq("pid", pid);
      await logEvent(pid, "intro", "idea_chosen", n);
      return json({ ok: true, idea: n });
    }

    // Open the canvas page: creates the canvas, the greeting and the timer once. Returns everything the page needs.
    if (action === "state") {
      let { data: saved } = await db.from("canvas").select("*").eq("pid", pid).maybeSingle();
      if (saved?.submitted_at) return json({ submitted: true });
      if (!saved) {
        const row = { pid, boxes: cleanBoxes({}), started_at: now, updated_at: now };
        await db.from("canvas").insert(row);
        saved = row as any;
      }
      const ai = p.condition === "canvas_ai";
      if (ai) {
        const { data: any1 } = await db.from("messages").select("id").eq("pid", pid).limit(1);
        if (!any1?.length) await db.from("messages").insert({ pid, role: "assistant", content: TEXT.ai_opening, model: "static", kind: "greeting" });
      }
      await logEvent(pid, "canvas", "page_view");
      const history = ai ? await chatHistory(pid) : [];
      const started = new Date(saved!.started_at ?? now).getTime();
      return json({
        submitted: false, condition: p.condition, ai, idea_index: p.idea_index, boxes: cleanBoxes(saved!.boxes), history,
        seeded_boxes: history.filter((m) => m.kind === "auto" || m.kind === "reopen").map((m) => m.box),
        seconds_left: Math.max(0, Math.floor(CANVAS_SECONDS - (Date.now() - started) / 1000)),
      });
    }

    // Autosave. { boxes }
    if (action === "save") {
      const { data: s } = await db.from("canvas").select("submitted_at").eq("pid", pid).maybeSingle();
      if (!s) return err("unknown participant", 404);
      if (s.submitted_at) return json({ ok: true, submitted: true });
      await saveCanvas(pid, cleanBoxes(body.boxes));
      return json({ ok: true });
    }

    // Hand in. { boxes, how: "button" | "timeout" }
    if (action === "submit") {
      const { data: s } = await db.from("canvas").select("submitted_at").eq("pid", pid).maybeSingle();
      if (!s) return err("unknown participant", 404);
      if (s.submitted_at) return json({ ok: true });
      const how = body.how === "timeout" ? "timeout" : "button";
      const boxes = cleanBoxes(body.boxes);
      const enough = filledCount(boxes) >= MIN_FILLED_BOXES;
      if (how === "button" && !enough) return json({ error: "need_more", min: MIN_FILLED_BOXES }, 400);
      await saveCanvas(pid, boxes);
      await db.from("canvas").update({ submitted_at: now, how_submitted: how, complete: enough }).eq("pid", pid);
      await logEvent(pid, "canvas", "submitted", how);
      const survey = env("SURVEY_URL");
      return json({ ok: true, survey_url: survey ? survey + (survey.includes("?") ? "&" : "?") + "pid=" + encodeURIComponent(pid) : "" });
    }

    // AI suggestions when a box is opened (cached), or a fresh reaction on return (max 3 per box). { box, boxes, refresh }
    if (action === "suggest") {
      const ap = await aiParticipant(pid);
      if (!ap) return err("no AI for this participant", 403);
      const box = String(body.box ?? "");
      if (!BLOCK_BY_KEY[box]) return err("unknown box");
      const refresh = !!body.refresh;
      const { data: stored } = await db.from("messages").select("content,suggestions").eq("pid", pid).eq("kind", "auto").eq("box", box).limit(1);
      if (stored?.length && !refresh) return json({ reply: stored[0].content, suggestions: stored[0].suggestions ?? [], cached: true });
      if (refresh) {
        const { count } = await db.from("messages").select("id", { count: "exact", head: true }).eq("pid", pid).eq("kind", "reopen").eq("box", box);
        if ((count ?? 0) >= 3) return err("limit", 429);
      }
      try {
        const r = await askAI(ap, cleanBoxes(body.boxes), box, refresh ? "reopen" : "open");
        await db.from("messages").insert({ pid, role: "assistant", content: r.reply, model: r.model, box, suggestions: r.suggestions, kind: refresh ? "reopen" : "auto" });
        return json({ reply: r.reply, suggestions: r.suggestions });
      } catch (e) {
        console.error("AI error:", String(e));
        await logEvent(pid, "canvas", "ai_error", String(e).slice(0, 300));
        return err(TEXT.ai_error, 502);
      }
    }

    // Normal chat. { box, boxes, message, quick: "more" | "feedback" }
    if (action === "chat") {
      const ap = await aiParticipant(pid);
      if (!ap) return err("no AI for this participant", 403);
      const text = String(body.message ?? "").trim().slice(0, MAX_MESSAGE_CHARS);
      if (!text) return err("empty message");
      const box = BLOCK_BY_KEY[String(body.box)] ? String(body.box) : BLOCKS[0].key;
      const quick = body.quick === "more" || body.quick === "feedback";
      if (!quick) {
        const { count } = await db.from("messages").select("id", { count: "exact", head: true }).eq("pid", pid).eq("role", "user").neq("kind", "quick");
        if ((count ?? 0) >= MAX_USER_MESSAGES) return err("message limit reached", 429);
      }
      await db.from("messages").insert({ pid, role: "user", content: text, box, kind: quick ? "quick" : "reply" });
      try {
        const r = await askAI(ap, cleanBoxes(body.boxes), box, "chat");
        await db.from("messages").insert({ pid, role: "assistant", content: r.reply, model: r.model, box, suggestions: r.suggestions, kind: "reply" });
        return json({ reply: r.reply, suggestions: r.suggestions });
      } catch (e) {
        console.error("AI error:", String(e));
        await logEvent(pid, "canvas", "ai_error", String(e).slice(0, 300));
        return err(TEXT.ai_error, 502);
      }
    }

    // Behaviour log. { events: [{ page, type, detail }] }
    if (action === "event") {
      const evs = Array.isArray(body.events) ? body.events : [body];
      const rows = evs.slice(0, 50).filter((e: any) => e && /^[a-z_]{1,40}$/.test(String(e.type ?? "")))
        .map((e: any) => ({ pid, page: String(e.page ?? "").slice(0, 20), event_type: e.type, detail: e.detail == null ? null : String(e.detail).slice(0, 500) }));
      if (rows.length) await db.from("events").insert(rows);
      return json({ ok: true });
    }

    return err("unknown action");
  } catch (e) {
    console.error(String(e));
    return err("server error", 500);
  }
});
