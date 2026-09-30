// Notification schedule + copy. Shared by the app (settings preview) and push/send.mjs (the sender).
// Times are local (America/Los_Angeles). Crons in .github/workflows/reminders.yml are the same times in UTC (PDT = UTC-7).

const VAPID_PUBLIC_KEY = "BJs1YRsqSfhmMXH5vHE1uP4ccCfEfl2lZn9yE1LEI9cf9LHLbizWmnK61C_s8EyfEvf8naHtHFAwz-PSPKM_eyk";

const LEVELS = {
  essential: { name: "Essential", blurb: "Morning brief and evening check-in" },
  coach: { name: "Coach", blurb: "Plus both missions and a midday rep nudge" },
  relentless: { name: "Relentless", blurb: "Everything: voice warm-up, a line to fix, fuel" },
};

const SLOTS = [
  { id: "morning",  time: "7:25",  label: "Morning brief",   levels: ["essential", "coach", "relentless"] },
  { id: "voice",    time: "8:40",  label: "Voice warm-up",   levels: ["relentless"] },
  { id: "mission1", time: "9:55",  label: "Mission 1",       levels: ["coach", "relentless"] },
  { id: "reps",     time: "12:25", label: "Rep check",       levels: ["coach", "relentless"] },
  { id: "line",     time: "14:55", label: "Fix this line",   levels: ["relentless"] },
  { id: "mission2", time: "17:25", label: "Mission 2",       levels: ["coach", "relentless"] },
  { id: "fuel",     time: "19:25", label: "Fuel",            levels: ["relentless"] },
  { id: "checkin",  time: "21:25", label: "Evening check-in", levels: ["essential", "coach", "relentless"] },
];

const REP_NUDGES = [
  "Lunch line, barista, gym. One real sentence counts.",
  "Ask someone how their day is actually going. Then follow up.",
  "Compliment a choice, not a look. Then walk away smiling.",
  "Hold eye contact through their whole answer. That's the rep.",
  "The scary one is the one that counts.",
];

const firstSentence = s => (s.match(/^.*?[.!?](\s|$)/) || [s])[0].trim();

// Returns { title, body, go, tag } or null. dayIdx: 0 = Oct 1.
function buildMessage(slotId, dayIdx) {
  if (dayIdx === -1 && slotId === "checkin") {
    return { title: "Tomorrow it begins", body: `Day 1 · ${DAYS[0].title}. Read it tonight so you walk in ready.`, go: "now", tag: "eve" };
  }
  if (dayIdx === 21 && slotId === "morning") {
    return { title: "21 days. Done.", body: "You collected the evidence. Open it and see how far you came.", go: "evidence", tag: "finale" };
  }
  if (dayIdx < 0 || dayIdx > 20) return null;

  const d = DAYS[dayIdx], n = dayIdx + 1, w = WEEKS[Math.floor(dayIdx / 7)];
  const tag = `${slotId}-${n}`;
  switch (slotId) {
    case "morning": {
      const lead = dayIdx % 7 === 0 ? `Week ${w.n} begins: ${w.name}. ` : d.source === "Review" ? "Review day. " : "";
      return { title: `Day ${n} · ${d.title}`, body: lead + firstSentence(d.principle), go: "now", tag };
    }
    case "voice": {
      const l = d.lines[0];
      return {
        title: "Voice warm-up · 2 min",
        body: l ? `Out loud, slow, pitch drops at the end: "${l.better}"` : "60 seconds out loud. Slow. Every sentence ends low.",
        go: "lines", tag,
      };
    }
    case "mission1": return { title: "Mission 1 of 2", body: d.missions[0], go: "missions", tag };
    case "mission2": return { title: "Mission 2 of 2", body: d.missions[1], go: "missions", tag };
    case "reps":
      return { title: `Rep check · ${w.target} today`, body: REP_NUDGES[dayIdx % REP_NUDGES.length], go: "reps", tag };
    case "line": {
      const l = d.lines[1] || d.lines[0];
      return l
        ? { title: "Fix this line", body: `"${l.flat}"  How would you say it better?`, go: "lines", tag }
        : { title: "Review", body: d.missions[0], go: "missions", tag };
    }
    case "fuel": return { title: "Fuel", body: `"${d.quote.text}"  ${d.quote.by}`, go: "now", tag };
    case "checkin":
      return {
        title: dayIdx === 20 ? "Last check-in" : "Evening check-in",
        body: `Rate today, then answer: ${d.reflect}`,
        go: "checkin", tag,
      };
  }
  return null;
}

if (typeof module !== "undefined") module.exports = { VAPID_PUBLIC_KEY, LEVELS, SLOTS, buildMessage };
