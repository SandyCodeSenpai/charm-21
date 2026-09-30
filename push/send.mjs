// Sends one reminder slot to every subscribed device. Run by .github/workflows/reminders.yml.
// Env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTIONS (JSON array of codes from the app),
//      SCHEDULE (the cron that fired) or SLOT (manual run), optional DAY (override day index for tests).
import fs from "node:fs";
import vm from "node:vm";
import webpush from "web-push";

const root = new URL("..", import.meta.url);
const ctx = vm.createContext({});
for (const f of ["data.js", "notify.js"]) vm.runInContext(fs.readFileSync(new URL(f, root), "utf8"), ctx);
const { SLOTS, buildMessage, PLAN_YEAR, PLAN_MONTH } = vm.runInContext("({ SLOTS, buildMessage, PLAN_YEAR, PLAN_MONTH })", ctx);

// UTC cron → slot. Keep in sync with the workflow's schedule list.
const CRON_TO_SLOT = {
  "25 14 * * *": "morning",
  "40 15 * * *": "voice",
  "55 16 * * *": "mission1",
  "25 19 * * *": "reps",
  "55 21 * * *": "line",
  "25 0 * * *": "mission2",
  "25 2 * * *": "fuel",
  "25 4 * * *": "checkin",
};

const slotId = process.env.SLOT || CRON_TO_SLOT[process.env.SCHEDULE];
const slot = SLOTS.find(s => s.id === slotId);
if (!slot) { console.log(`No slot for schedule "${process.env.SCHEDULE}" / SLOT "${process.env.SLOT}"`); process.exit(0); }

const raw = process.env.PUSH_SUBSCRIPTIONS?.trim();
if (!raw) { console.log("No PUSH_SUBSCRIPTIONS secret yet. Nothing to send."); process.exit(0); }
const subs = JSON.parse(raw).map(c => (typeof c === "string" ? JSON.parse(Buffer.from(c, "base64url").toString()) : c));

webpush.setVapidDetails("mailto:charm21@users.noreply.github.com", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

function dayIndexIn(tz) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric" })
    .formatToParts(new Date()).map(p => [p.type, +p.value]));
  const local = Date.UTC(parts.year, parts.month - 1, parts.day);
  return Math.round((local - Date.UTC(PLAN_YEAR, PLAN_MONTH, 1)) / 86400000);
}

let sent = 0, failed = 0;
for (const { s, l = "relentless", tz = "America/Los_Angeles" } of subs) {
  const forced = process.env.SLOT && process.env.SLOT_FORCE === "true";
  if (!forced && !slot.levels.includes(l)) { console.log(`skip: ${slotId} not in level ${l}`); continue; }
  const day = process.env.DAY ? +process.env.DAY : dayIndexIn(tz);
  const msg = buildMessage(slotId, day);
  if (!msg) { console.log(`skip: nothing for ${slotId} on day index ${day}`); continue; }
  try {
    await webpush.sendNotification(s, JSON.stringify(msg), { TTL: 3 * 3600, urgency: "normal", topic: slotId });
    sent++; console.log(`sent ${slotId} (day index ${day}): ${msg.title}`);
  } catch (e) {
    failed++; console.log(`failed (${e.statusCode}): ${e.body || e.message}${e.statusCode === 410 ? "  → subscription expired, re-enable in the app" : ""}`);
  }
}
console.log(`done: ${sent} sent, ${failed} failed`);
if (failed && !sent) process.exit(1);
