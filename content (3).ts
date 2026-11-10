// content.ts: everything participants read, plus the facts the AI may quote. Generated from the Flask app's content.py.
// Copy this file to BOTH src/lib/content.ts and supabase/functions/_shared/content.ts (same content).
export type Idea = { name: string; what: string };
export type Block = { key: string; title: string; lean: string; question: string; tips: string[]; example: string; icon: string };

export const IDEAS: Idea[] = [
  {
    "name": "Dog walking and pet sitting",
    "what": "Walk dogs and look after pets for owners who are at work or away, in your neighbourhood, around your own shifts or lectures."
  },
  {
    "name": "Odd jobs and flat-pack assembly",
    "what": "Help neighbours and busy people with flat-pack furniture, hanging shelves, garden tidying and small repairs, booked by message."
  },
  {
    "name": "Reselling on Vinted and eBay",
    "what": "Find second-hand clothes, trainers or gadgets (charity shops, car boot sales, your own wardrobe) and resell them online at a profit."
  },
  {
    "name": "Online help for small businesses",
    "what": "Small businesses such as cafes, salons, tradespeople and online shops are too busy for office tasks. From home, in the hours you choose, you could answer their emails and messages, manage bookings, update spreadsheets or their online shop, or post on their Instagram and Facebook. You are paid per task or per hour."
  },
  {
    "name": "Tutoring and homework help",
    "what": "Help school pupils with homework, reading or maths, or practise English with learners, online or at home, outside school hours."
  }
];

export const IDEA_FACTS: Record<string, string[]> = {
  "Dog walking and pet sitting": [
    "About 41% of UK households own a dog, roughly 15.5 million dogs, up from 33% in 2021 (UK Pet Food survey 2026).",
    "Reasoning, not a statistic: owners with long or irregular working hours, and flats in big cities, need walkers most."
  ],
  "Odd jobs and flat-pack assembly": [
    "Taskrabbit's own UK data (a vendor, so treat as a guide): furniture assembly averages about £26 an hour, about £33 in London and about £36 in Edinburgh and Glasgow.",
    "Reasoning, not a statistic: renters, new movers and busy people in big cities pay for assembly because they lack tools or time."
  ],
  "Reselling on Vinted and eBay": [
    "Vinted has roughly 17 million UK users (SpendMapper data) and its group revenue grew about 38% in 2025 to nearly £1bn.",
    "HMRC: the trading allowance is £1,000 a year before tax matters. Buying items to resell is more likely to count as trading than selling your own things. Platforms report accounts with 30+ sales or about 2,000 euros a year (MoneyHelper). Tell people to check gov.uk.",
    "Reasoning, not a statistic: big cities have more charity shops, student areas and buyers who collect in person, so stock is easier to find and sell."
  ],
  "Online help for small businesses": [
    "The UK has about 5.6 million private businesses and about 4.1 million (74%) have no employees, so owners do their own admin (gov.uk 2026).",
    "Reasoning, not a statistic: cafes, salons, tradespeople and online shops lose time on messages, bookings and social media and will pay to hand it over."
  ],
  "Tutoring and homework help": [
    "In England and Wales about 29% of secondary pupils have had private tuition, 45% in London against 27% in the rest of England; Year 11 is the busiest (Sutton Trust 2025).",
    "Parents pay about £24 an hour on average (Sutton Trust, survey year not stated)."
  ]
};

export const IDEA_MENUS: Record<string, string[]> = {
  "Odd jobs and flat-pack assembly": [
    "Rough UK prices per job: TV mounting £100-200; flat-pack assembly £80-160 (about £20-35 an hour); putting up shelves £80-160; curtain rails £45-160; hanging pictures or mirrors £45-100; fixing doors or handles £70-130; regrouting or small tiling £150-300; gutter clean £30-50; garden tidy about £25 an hour.",
    "Handymen charge about £30 an hour on average and about £50 in London, and many set a £40-60 minimum call-out, so bundle small jobs into one visit.",
    "Best money for a beginner (reasoning): jobs paid per job that take 1-2 hours with few tools, such as TV mounting, shelves, curtain rails, mirrors, or a bed plus wardrobe in one visit. Weak: single small jobs and gutters (£30-50 for ladder work).",
    "Avoid as a beginner: electrics, gas and plumbing. They need qualifications and insurance, so tell them to check."
  ],
  "Reselling on Vinted and eBay": [
    "Items people often resell (reasoning, not data): branded trainers (Nike, Adidas, New Balance), sportswear and outdoor jackets, vintage denim, kids' branded clothes, Lego sets, retro games. Where to find stock: car boot sales, charity shops in wealthier areas, house clearances, your own wardrobe.",
    "Profit rule: buy price + platform fees + postage + your time must leave a clear gain. Tell them to check each platform's current fees."
  ],
  "Dog walking and pet sitting": [
    "Jobs to choose from (reasoning): midday walks for people working long hours, group walks of 2-4 dogs (more income per hour than single walks), puppy visits, drop-in feeding for cats, holiday stays at the owner's home. Tell them to check insurance and local council rules before taking several dogs."
  ],
  "Online help for small businesses": [
    "Tasks owners hand over (reasoning): answering customer messages, managing bookings, updating opening hours and listings, posting on Instagram and Facebook, invoices in a spreadsheet, adding products to an online shop. Best first customers: salons, cafes and tradespeople near you, because they can be reached in person."
  ],
  "Tutoring and homework help": [
    "Subjects and pupils to choose from (reasoning): GCSE maths and English (Year 11 is the busiest year), A-level maths and sciences, primary reading and maths, English practice for learners. Online sessions let you reach families in London and other big cities, where tuition is more common."
  ]
};

export const BLOCKS: Block[] = [
  {
    "key": "problem",
    "title": "The problem",
    "lean": "Lean Canvas: Problem",
    "question": "What annoys or worries your customers most? How do they cope today?",
    "tips": [
      "Describe the problem in your customer's own words.",
      "What do they do instead right now, and what does that cost them?",
      "Would they pay to fix it, or only complain about it?"
    ],
    "example": "Bikes break at the worst moment. Shops open when people work, and repairs take days.",
    "icon": "🧩"
  },
  {
    "key": "customers",
    "title": "Who pays",
    "lean": "Lean Canvas: Customer segments",
    "question": "Who has this problem, and who would pay you first?",
    "tips": [
      "Pick one narrow group, not everyone.",
      "Where could you find ten of them this week?",
      "Who feels the problem most strongly?"
    ],
    "example": "Students in my halls who cycle to lectures and can't leave a bike at a shop for days.",
    "icon": "👥"
  },
  {
    "key": "uvp",
    "title": "Why choose you",
    "lean": "Lean Canvas: Unique value proposition",
    "question": "In one sentence: why would someone pick you instead of the alternative?",
    "tips": [
      "Say what they get, not what you do.",
      "Would it still beat a shop or a friend who can help?",
      "Make it specific enough that a stranger could repeat it."
    ],
    "example": "Your bike fixed at your door in 30 minutes, for a price you know in advance.",
    "icon": "💎"
  },
  {
    "key": "solution",
    "title": "What you do",
    "lean": "Lean Canvas: Solution",
    "question": "What will you actually do to fix their problem?",
    "tips": [
      "List the 1 to 3 things you would really do.",
      "Keep it to what you can deliver alone in your spare hours.",
      "Which part could you test this week?"
    ],
    "example": "I bring a tool kit, fix punctures, brakes and gears, and send a price by text first.",
    "icon": "🛠️"
  },
  {
    "key": "channels",
    "title": "How they find you",
    "lean": "Lean Canvas: Channels",
    "question": "Where will your first customers hear about you, and how do they book?",
    "tips": [
      "Name the exact place: a group, a platform, a street.",
      "Which channel is free and quick?",
      "How do they book and pay?"
    ],
    "example": "Two student Facebook groups and flyers in halls. They book by text and pay by transfer.",
    "icon": "📣"
  },
  {
    "key": "income",
    "title": "Money in",
    "lean": "Lean Canvas: Revenue streams",
    "question": "What will you charge, and how often will a customer pay?",
    "tips": [
      "Price per job, hour or item?",
      "How many customers a month make it worth your time?",
      "Will anyone come back and pay again?"
    ],
    "example": "A flat fee per job plus parts at cost. Eight jobs a month would be worth my evenings.",
    "icon": "💷"
  },
  {
    "key": "costs",
    "title": "Money out",
    "lean": "Lean Canvas: Cost structure",
    "question": "What does it cost to start and to keep going?",
    "tips": [
      "What must you buy before the first customer?",
      "Which costs come back every month (fees, travel, supplies)?",
      "What is the cheapest way to start?"
    ],
    "example": "Tools and spare parts to start, then travel and parts top-ups each month.",
    "icon": "🧾"
  },
  {
    "key": "metrics",
    "title": "Numbers to watch",
    "lean": "Lean Canvas: Key metrics",
    "question": "Which 2 or 3 numbers will show that it is working?",
    "tips": [
      "Pick 2 or 3 numbers you can count every week.",
      "Include one about money and one about customers.",
      "What number would make you change plan or stop?"
    ],
    "example": "Jobs per week, profit per job, and how many customers book a second time.",
    "icon": "📊"
  },
  {
    "key": "edge",
    "title": "Your edge",
    "lean": "Lean Canvas: Unfair advantage",
    "question": "What do you have that others can't easily copy or buy?",
    "tips": [
      "Think of contacts, skills, location, access or reputation.",
      "Hard work and low prices are easy to copy.",
      "What do your shifts or studies give you that others lack?"
    ],
    "example": "I live in the halls where my customers are, and I already repair friends' bikes.",
    "icon": "⭐"
  }
];
export const BLOCK_KEYS = BLOCKS.map((b) => b.key);
export const BLOCK_BY_KEY: Record<string, Block> = Object.fromEntries(BLOCKS.map((b) => [b.key, b]));

export const EXAMPLE_BUSINESS = "a mobile bike-repair business";
export const MIN_WORDS_TO_UNLOCK = 3;
export const MIN_FILLED_BOXES = 5;
export const MAX_BOX_CHARS = 600;
export const DEFAULT_ASSIGNED_IDEA = 3;
export const THEMES = [
  {
    "key": "indigo",
    "name": "Indigo",
    "color": "#4f46e5"
  },
  {
    "key": "teal",
    "name": "Teal",
    "color": "#0f766e"
  },
  {
    "key": "rose",
    "name": "Rose",
    "color": "#be123c"
  },
  {
    "key": "amber",
    "name": "Amber",
    "color": "#b45309"
  },
  {
    "key": "slate",
    "name": "Slate",
    "color": "#334155"
  }
];
export const THEME_KEYS = THEMES.map((t) => t.key);

export const TEXT: Record<string, string> = {
  "intro_title": "Design your own side business",
  "intro_lead": "You now have time to turn an idea into a real plan. Below are five side businesses that people in the UK can start next to studying or a main job, including shift work, with little money and flexible hours. The best way to develop an idea is to brainstorm it step by step. To begin, choose the idea you would like to work on.",
  "intro_choose": "Tap an idea to choose it",
  "intro_chosen": "Your choice",
  "intro_task": "You chose {name}. Now design your own business around it on a lean canvas. That is simply a one-page business plan with nine short boxes: what problem you solve, who pays, why they pick you, what you do, how they find you, money in, money out, the numbers to watch and your edge. Each box you complete unlocks the next, and at the end you have a one-slide plan with your own business name, pitch and colour.",
  "intro_ai": "An AI co-founder works with you the whole way. Each time you open a box it shares suggestions and asks you questions, and you can reply, ask for ideas or ask for feedback. You decide what goes on the slide.",
  "intro_noai": "You will build the slide on your own. Each box comes with guiding questions, tips and an example to help you brainstorm.",
  "intro_time": "You have {minutes} minutes. Your slide is saved automatically while you work.",
  "start": "Start building",
  "canvas_title": "Lean canvas",
  "your_idea": "Your idea",
  "banner_ai": "Your AI co-founder is ready. Open a box: it will challenge your thinking and suggest ideas. Reply, then make them yours.",
  "banner_noai": "Work through the boxes one by one. Each box you complete unlocks the next.",
  "name_label": "Business name",
  "name_placeholder": "Give your business a name",
  "tagline_label": "One-line pitch",
  "tagline_placeholder": "What does your business do, in one sentence?",
  "colour_label": "Slide colour",
  "preview": "Preview slide",
  "preview_title": "Your slide",
  "close": "Close",
  "hybrid_label": "Side business",
  "progress": "{n} of {total} boxes done",
  "locked": "Unlocks after \"{prev}\"",
  "empty_box": "Click to start",
  "editor_placeholder": "Write your answer here…",
  "editor_hint": "At least {n} words to continue",
  "done_next": "Done, next box",
  "done_last": "Done, preview my slide",
  "unlocked": "Box unlocked: {name}",
  "all_done": "All nine boxes done. Preview your slide, then hand it in.",
  "submit": "Hand in my slide",
  "saved": "Saved",
  "need_more": "Please fill in at least {n} boxes before you hand in your slide.",
  "confirm_title": "Hand in your slide?",
  "confirm_text": "You cannot change it afterwards.",
  "confirm_yes": "Yes, hand in",
  "confirm_no": "Keep working",
  "timeup": "Time is up. Your slide has been handed in.",
  "done_title": "Thank you",
  "done_text": "Your slide has been saved. You can now continue with the survey.",
  "done_button": "Continue",
  "ai_title": "AI co-founder",
  "ai_opening": "Hi, I'm your AI co-founder. In every box I'll challenge your thinking and give you ideas to react to. Reply any time, and disagree with me if you like. Start with the first box.",
  "ai_placeholder": "Reply to your co-founder…",
  "ai_thinking": "Thinking of suggestions for \"{box}\"…",
  "ai_for_box": "Suggestions for \"{box}\"",
  "ai_use": "Add to my box",
  "ai_used": "Added",
  "ai_quick_more": "More suggestions",
  "ai_quick_feedback": "Give me feedback",
  "ai_back_to": "Back to \"{box}\"",
  "ai_new": "Your co-founder has new suggestions",
  "tab_ai": "Co-founder",
  "tab_guide": "Guide",
  "tab_write": "Write",
  "tab_slide": "Slide",
  "intro_next": "Next",
  "intro_back": "Back",
  "intro_ideas_title": "Five ideas",
  "intro_task_title": "Your task",
  "ai_error": "Sorry, I'm having trouble right now. Please try again in a moment.",
  "ai_disclaimer": "Your conversation is recorded for research purposes. Please don't share your name, address or employer. The AI can make mistakes.",
  "guide_title": "Guide",
  "guide_think": "Things to think about",
  "guide_example": "Example, for {name}",
  "notice": "Your answers are recorded for research purposes. Please don't share your name, address or employer."
};
