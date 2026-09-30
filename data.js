// 21-day plan content. Day n runs on October n, 2026.
// "principle" text is written in our own words from the books' ideas; "quote" entries are real, attributed quotes.

const PLAN_YEAR = 2026;
const PLAN_MONTH = 9; // 0-indexed: October

const WEEKS = [
  { n: 1, name: "Presence", tagline: "Get out of your head", target: 1 },
  { n: 2, name: "Charm", tagline: "Make them feel interesting", target: 2 },
  { n: 3, name: "Lead", tagline: "Be bold, stay unattached", target: 3 },
];

const DAYS = [
  // ── Week 1: Presence ───────────────────────────────────────────
  {
    title: "Attention goes outward",
    source: "Greene · the Charmer",
    principle:
      "Insecurity is self-focus. The voice asking \"how am I coming across\" goes quiet the moment you get genuinely curious about the other person. The Charmer makes every conversation about them, and that is also the cure for feeling self-conscious.",
    missions: [
      "In every conversation today, notice one specific detail about the other person (what they're wearing, reading, doing)",
      "Ask one follow-up question about someone's answer instead of moving on",
    ],
    lines: [
      { flat: "how's it going", better: "you look like you're having a better day than me. what happened" },
      { flat: "cool", better: "wait, how did you end up doing that" },
    ],
    quote: { text: "You can make more friends in two months by becoming interested in other people than you can in two years by trying to get other people interested in you.", by: "Dale Carnegie" },
    reflect: "When did you catch yourself in your own head today? What pulled you out?",
  },
  {
    title: "Start with the point",
    source: "Voice",
    memo: true,
    principle:
      "Starting with \"yeah\" and fillers like \"a couple of\", \"multiple\" and \"basically\" make you sound unsure. Your first sentence should be the answer. Point first, reason second. Stop when you're done.",
    missions: [
      "Record 60s: \"what's the best trip you've taken and why\". Count every \"yeah\" and filler",
      "In real conversations, pause one beat instead of saying \"yeah\" before you answer",
    ],
    lines: [
      { flat: "yeah so basically i went to a couple of places", better: "goa. best trip i've had. the food alone was worth it" },
      { flat: "yeah i think maybe it depends", better: "honestly, no. here's why" },
    ],
    quote: { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", by: "Will Durant" },
    reflect: "How many fillers were in your memo? What number do you want to beat?",
  },
  {
    title: "Slow down, land the ending",
    source: "Voice · Greene presence",
    memo: true,
    principle:
      "Slow down about 20%. Let your pitch drop at the end of a sentence, because a rising ending sounds like you're asking permission. When someone finishes answering, pause for a second before you reply. The pause tells them you were listening.",
    missions: [
      "Re-record yesterday's prompt slower. Every sentence ends lower than it started",
      "In one real conversation, pause a full second after they finish before you reply",
    ],
    lines: [
      { flat: "i'm into photography? (rising)", better: "i'm into photography. (falling, then stop)" },
      { flat: "we could maybe get coffee?", better: "let's get coffee." },
    ],
    quote: { text: "We suffer more often in imagination than in reality.", by: "Seneca" },
    reflect: "Did slowing down feel awkward or powerful? Where did you rush?",
  },
  {
    title: "Put music on feeling words",
    source: "Voice",
    memo: true,
    principle:
      "Your voice is deep and calm, and that's an asset. Its weakness is going flat when you're thinking. If your voice doesn't show interest, the other person won't hear any. Let your pitch rise and fall on the words that carry feeling.",
    missions: [
      "Say each of these out loud 5 times with real melody: \"that's wild\", \"wait, really?\", \"no way\", \"i love that\"",
      "React to one story today with your voice, not just your words",
    ],
    lines: [
      { flat: "that's interesting", better: "wait, that's wild" },
      { flat: "ok nice", better: "no way. then what" },
    ],
    quote: { text: "The sovereign voluntary path to cheerfulness, if our cheerfulness be lost, is to sit up cheerfully and to act and speak as if cheerfulness were already there.", by: "William James" },
    reflect: "Play back your memo. Which word had the most life in it?",
  },
  {
    title: "Say it once",
    source: "Manson · non-neediness",
    principle:
      "Over-explaining is a way of asking for approval. Secure people say something once and let it stand. No \"haha\" to soften it, no \"if that's ok\", no three sentences of justification.",
    missions: [
      "Send 3 messages today with no softeners: no \"haha\", \"just\", \"sorry\" or \"if that's ok\"",
      "Say no to one small thing without giving a reason",
    ],
    lines: [
      { flat: "sorry for the late reply haha was super busy with work and stuff", better: "long day. how was yours" },
      { flat: "i was thinking maybe we could do something this weekend if you're free, no pressure", better: "free saturday? let's do something" },
    ],
    quote: { text: "First say to yourself what you would be; and then do what you have to do.", by: "Epictetus" },
    reflect: "Which softener was hardest to delete? What were you afraid would happen?",
  },
  {
    title: "Eyes and names",
    source: "Greene · presence",
    principle:
      "Keep eye contact while they're talking, and look away while you're thinking, not while they're speaking. Say their name once in a conversation, not more. Both tell someone they have your full attention.",
    missions: [
      "Keep eye contact through someone's whole answer at least 3 times today",
      "Use one person's name once, naturally",
    ],
    lines: [
      { flat: "thanks", better: "thanks, [name]. appreciate it" },
      { flat: "have a good one", better: "good talking to you, [name]" },
    ],
    quote: { text: "Remember that a person's name is to that person the sweetest and most important sound in any language.", by: "Dale Carnegie" },
    reflect: "How did people react when you held eye contact? Did anything shift?",
  },
  {
    title: "Week 1 review",
    source: "Review",
    memo: true,
    principle:
      "Confidence is evidence. This week you collected some. Look at it honestly: what you did, what you avoided, and what got easier.",
    missions: [
      "Re-record the Day 2 prompt. Compare your fillers, pace and endings",
      "Write down the 3 moments this week when you did the scary thing",
    ],
    lines: [],
    quote: { text: "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult.", by: "Seneca" },
    reflect: "What changed between Day 2 and today? What is still the weakest?",
  },

  // ── Week 2: Charm ──────────────────────────────────────────────
  {
    title: "Statements over questions",
    source: "Greene · insinuation",
    principle:
      "Interview questions feel like filling in a form. A guess about someone (\"you seem like...\") is more fun and shows you're paying attention. If you're wrong, they'll correct you, and that keeps the conversation going.",
    missions: [
      "Replace 3 questions today with statements or guesses",
      "Try one playful guess on a stranger or a match",
    ],
    lines: [
      { flat: "what do you do for fun", better: "you seem like someone with a weirdly specific hobby" },
      { flat: "where are you from", better: "you have big city energy. not from here right" },
    ],
    quote: { text: "Talk to a man about himself and he will listen for hours.", by: "Benjamin Disraeli" },
    reflect: "Which guess landed? Which one fell flat, and why?",
  },
  {
    title: "Follow the thread",
    source: "Manson · genuine interest",
    principle:
      "Most people ask a question, get an answer and jump to a new topic. Stay with it. Go one level deeper, from facts to feelings: why that, what it's like, what they love about it.",
    missions: [
      "In one conversation, ask 3 follow-ups on the same topic",
      "Ask one \"why\" question about a choice someone made",
    ],
    lines: [
      { flat: "cool. what else do you like", better: "wait why that one tho. what got you into it" },
      { flat: "nice, i like hiking too", better: "what's the best part for you, the view or being alone for a bit" },
    ],
    quote: { text: "We have two ears and one mouth, so we should listen more than we say.", by: "Zeno of Citium" },
    reflect: "What did you learn about someone today that you'd never have heard with small talk?",
  },
  {
    title: "The callback",
    source: "Greene · attention to detail",
    principle:
      "Remember something small they said and bring it up later. Almost nobody does this, and it makes people feel seen. That feeling is what they'll remember about you.",
    missions: [
      "Bring back one thing someone told you earlier (yesterday, or earlier in the chat)",
      "Keep a note on your phone: one detail about each person you talk to this week",
    ],
    lines: [
      { flat: "how was your day", better: "did the presentation go ok? you were nervous about it" },
      { flat: "hey", better: "how's the sourdough situation. still alive?" },
    ],
    quote: { text: "Do the thing you fear, and the death of fear is certain.", by: "Ralph Waldo Emerson" },
    reflect: "How did they react to the callback?",
  },
  {
    title: "Hint, don't state",
    source: "Greene · insinuation",
    principle:
      "Saying things too directly leaves nothing to imagine. A hint lets them fill in the gap, and what they imagine is stronger than anything you could say. Compliment something specific, and suggest rather than announce.",
    missions: [
      "Give one specific compliment that isn't about looks: their taste, their humor, a choice they made",
      "Turn one plain statement into a hint",
    ],
    lines: [
      { flat: "you're fun", better: "you'd be dangerous at karaoke" },
      { flat: "you look nice", better: "that jacket is doing a lot of work for you" },
    ],
    quote: { text: "Courage is resistance to fear, mastery of fear, not absence of fear.", by: "Mark Twain" },
    reflect: "Write the best hint you used today, or the one you wish you'd used.",
  },
  {
    title: "Tease, then warm",
    source: "Greene · mixed signals, clean version",
    principle:
      "Teasing on its own reads as arrogant, and sweetness on its own reads as flat. Tease lightly, then show warmth in the same breath. The contrast is what makes it engaging. Tease people about their choices, never their insecurities.",
    missions: [
      "Send one tease followed by warmth",
      "Tease a friend today about something they're proud of",
    ],
    lines: [
      { flat: "that's nice", better: "ok that's lowkey nerdy. i kinda love it" },
      { flat: "you're funny", better: "you're a menace. i like it" },
    ],
    quote: { text: "Life shrinks or expands in proportion to one's courage.", by: "Anaïs Nin" },
    reflect: "Did the tease land as playful or as mean? What made the difference?",
  },
  {
    title: "Own one flaw",
    source: "Greene · strategic vulnerability",
    principle:
      "Perfection is intimidating and fake. Admit one real flaw calmly, without apologising for it. A flaw you own calmly shows security. A flaw you confess anxiously shows need.",
    missions: [
      "Share one real flaw or fear with someone today, calmly, with a smile",
      "Notice whether it made the conversation closer or more awkward",
    ],
    lines: [
      { flat: "i'm really bad at cooking sorry lol", better: "i can't cook to save my life. i make great reservations tho" },
      { flat: "i'm kind of awkward", better: "i'm better at the second conversation than the first. fair warning" },
    ],
    quote: { text: "Vulnerability is not winning or losing; it's having the courage to show up and be seen when we have no control over the outcome.", by: "Brené Brown" },
    reflect: "What did you share? How did it feel a minute later?",
  },
  {
    title: "Have a real opinion",
    source: "Manson · polarize",
    memo: true,
    principle:
      "Agreeing with everything makes you forgettable. Have a real take, say it kindly and stand by it. Some people won't like it. That means the filter is working.",
    missions: [
      "Disagree with someone today, warmly and clearly",
      "Week 2 review: record 60s on \"what makes someone interesting to you\"",
    ],
    lines: [
      { flat: "haha yeah same", better: "nah i disagree. pineapple on pizza is a crime" },
      { flat: "yeah whatever you want", better: "honestly i'd pick the thai place. better vibe" },
    ],
    quote: { text: "Who you are is defined by what you're willing to struggle for.", by: "Mark Manson" },
    reflect: "Where did you agree just to keep things smooth this week?",
  },

  // ── Week 3: Lead ───────────────────────────────────────────────
  {
    title: "Enter their world",
    source: "Greene · enter their spirit",
    principle:
      "Match their energy before you try to lead it. If they're playful, play. If they're calm, slow down. People are drawn to what feels familiar.",
    missions: [
      "In a chat, match the other person's message length and tone for the whole conversation",
      "Ask someone to show you something they love (a song, a place, a video)",
    ],
    lines: [
      { flat: "i don't really watch anime", better: "ok sell me on it. which one do i start with" },
      { flat: "(she sends one line, you send a paragraph)", better: "(one line back. match her length)" },
    ],
    quote: { text: "If you want to improve, be content to be thought foolish and stupid.", by: "Epictetus" },
    reflect: "What did someone show you today? What did it tell you about them?",
  },
  {
    title: "Don't be always available",
    source: "Greene · poeticize your presence",
    principle:
      "Being available 24/7 kills curiosity. Have a life they only see part of. Reply when it suits you, not instantly every time. This isn't a game. Go and actually live that life.",
    missions: [
      "Don't reply instantly to non-urgent messages today. Live your day and reply later",
      "Do one thing just for you (gym, a class, a walk somewhere new) and don't post about it",
    ],
    lines: [
      { flat: "haha sorry i was just waiting for your text", better: "just got back from the gym. what'd i miss" },
      { flat: "(replies within 5 seconds, every time)", better: "(reply when you're free. no apology)" },
    ],
    quote: { text: "Waste no more time arguing about what a good man should be. Be one.", by: "Marcus Aurelius" },
    reflect: "What did you do today that was only for you?",
  },
  {
    title: "Keep a little suspense",
    source: "Greene · keep them in suspense",
    principle:
      "Predictable is boring. Suggest specific, slightly surprising plans, and leave a story unfinished. Mystery just means not telling everything at once.",
    missions: [
      "Plan one specific idea (not \"drinks sometime\"): a place, a time and a reason",
      "In one chat, leave a story half-told: \"remind me to tell you about ___\"",
    ],
    lines: [
      { flat: "we should hang out sometime", better: "there's a taco spot i think you'd judge me for liking. thursday?" },
      { flat: "i went to a concert last week", better: "long story involving a concert and the wrong train. remind me to tell you" },
    ],
    quote: { text: "A journey of a thousand miles begins with a single step.", by: "Laozi" },
    reflect: "What thread did you leave open? Did they pull on it?",
  },
  {
    title: "The bold move",
    source: "Greene · master the bold move",
    principle:
      "Hesitation kills tension. Leading shows you want them without needing them. Ask directly, suggest the plan and take the initiative. A clear no still counts as a win, because it's information and it's a rep.",
    missions: [
      "Make one direct invite today (a match, a friend, anyone) with a day and a place",
      "Start one thing you'd normally wait for someone else to start",
    ],
    lines: [
      { flat: "would you maybe want to meet up sometime if you're free?", better: "you're fun. drinks thursday?" },
      { flat: "let me know if you ever want to hang", better: "i'm taking you to that ramen place. saturday 7?" },
    ],
    quote: { text: "You miss 100% of the shots you don't take.", by: "Wayne Gretzky" },
    reflect: "Who did you ask, and what happened? How did it feel before and after?",
  },
  {
    title: "Willing to lose",
    source: "Greene · give them space to fall",
    principle:
      "Once you've shown interest, let them come to you. Don't chase a slow reply with three more messages. Being fine if it doesn't work out is both the most attractive and the least anxious place to be.",
    missions: [
      "If a chat goes quiet, don't double-text. Let it breathe",
      "Write down: \"If this doesn't work out, I'll be fine because ___\"",
    ],
    lines: [
      { flat: "hey?? did you see my message", better: "(send nothing. live your day)" },
      { flat: "you probably don't want to but...", better: "i'd like to see you again. your call" },
    ],
    quote: { text: "Some things are within our power, while others are not.", by: "Epictetus" },
    reflect: "What did you want to send but didn't? How do you feel about it now?",
  },
  {
    title: "The mind-game check",
    source: "Greene · the dark chapters, honestly",
    principle:
      "The dark tactics (jealousy, going hot and cold, making someone feel lacking) only work if you truly don't care, and they attract fragile people. Before any move, ask yourself: am I doing this because I feel secure, or because I'm scared? If it's because you're scared, don't send it.",
    missions: [
      "Catch one moment when you wanted to play a game. Write down what you were actually feeling",
      "Replace it with the honest version: say what you want",
    ],
    lines: [
      { flat: "(ignore her for 2 days so she misses me)", better: "had fun last night. same time next week?" },
      { flat: "(post a pic with someone to make her jealous)", better: "(just have a real social life. no staging)" },
    ],
    quote: { text: "The impediment to action advances action. What stands in the way becomes the way.", by: "Marcus Aurelius" },
    reflect: "Secure or scared: which one drove you more this week?",
  },
  {
    title: "Who you are now",
    source: "Integration",
    memo: true,
    principle:
      "That's 21 days of reps. You didn't wait until you felt confident. You acted, and the feeling is catching up. Write down who you are now, in the present tense, and keep going.",
    missions: [
      "Final 60s memo on \"what makes someone interesting to you\". Compare it with Day 14 and Day 2",
      "Write your identity statement: \"I'm someone who ___\"",
    ],
    lines: [],
    quote: { text: "The credit belongs to the man who is actually in the arena.", by: "Theodore Roosevelt" },
    reflect: "Write it: \"I'm someone who ___\"",
  },
];

// Extra quotes for the "another one" button.
const EXTRA_QUOTES = [
  { text: "Don't just sit there. Do something. The answers will follow.", by: "Mark Manson" },
  { text: "The future belongs to those who learn more skills and combine them in creative ways.", by: "Robert Greene" },
  { text: "While we are postponing, life speeds by.", by: "Seneca" },
];

const TOOLKIT = [
  {
    title: "Text rules",
    items: [
      "Short beats long. Match the length of her messages.",
      "One question per message, max.",
      "Specific beats generic. Playful beats earnest early on.",
      "No softeners: \"haha\", \"just\", \"sorry\", \"if that's ok\".",
      "You don't have to reply within 10 seconds. Pauses are fine.",
      "Lead the ask: day + place. \"drinks thursday?\"",
    ],
  },
  {
    title: "Voice rules",
    items: [
      "Slow down by about 20%.",
      "Pitch drops at the end of a sentence. A rising end sounds like asking permission.",
      "Pause after she answers. It shows you're listening.",
      "Put melody on feeling words: \"that's wild\", \"wait, really?\"",
      "Start with the point. Never with \"yeah\".",
      "Eye contact while she talks. Say her name once.",
    ],
  },
  {
    title: "Greene, full power (use freely)",
    items: [
      "Insinuation: hint, don't state.",
      "Suspense: be a little unpredictable.",
      "Poeticize presence: don't be available 24/7.",
      "Attention to detail: bring back the small thing.",
      "Enter their spirit: match first, then lead.",
      "Strategic vulnerability: own one flaw calmly.",
      "Space to fall: show interest, then let them come.",
      "The bold move: you lead.",
    ],
  },
  {
    title: "Greene, light version only",
    items: [
      "Mixed signals → tease, then warm, in the same conversation.",
      "Object of desire → have a real social life. Don't stage jealousy.",
      "Temptation → hint at a plan: \"you'd have to earn it tho\".",
      "Coquette → warm, but not always available.",
    ],
  },
  {
    title: "Greene, dark (know it, don't run it)",
    items: [
      "Making her feel lacking (negging) only works on fragile people.",
      "Pleasure mixed with pain creates a trauma bond, not love.",
      "Isolating someone is the textbook sign of abuse.",
      "Deception: once it's found out, it's over, and people talk.",
      "These only work if you truly don't care. An insecure guy playing cold cracks, and ends up looking more needy.",
    ],
  },
  {
    title: "The check",
    items: [
      "Before any move: am I doing this because I feel secure, or because I'm scared?",
      "If it's because you're scared, don't send it. Say what you actually want instead.",
    ],
  },
];
