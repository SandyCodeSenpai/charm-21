# Charm 21

A 21-day plan (Oct 1 to Oct 21) for presence, charm and boldness, drawn from Robert Greene's *The Art of Seduction* and Mark Manson's *Models*. It's an offline-first PWA with no build step and no dependencies.

- **Now**: a 21-segment ring, a "right now" card that picks your next move by time of day, missions, flip cards for fixing lines, a presence meter and a nightly journal
- **Path**: the three-week trail
- **Guide**: text and voice rules, plus Greene's tactics sorted into full / light / dark
- **Evidence**: reps, streak, presence and filler trends, the journal, and a JSON backup
- **Reminders**: up to 8 web-push notifications a day, sent by `.github/workflows/reminders.yml` (GitHub Actions cron → `push/send.mjs`). The copy lives in `notify.js`. Secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `PUSH_SUBSCRIPTIONS` (a JSON array of codes from the app's Reminders sheet)

Progress is stored in `localStorage` on the device only.

To run locally: `python3 -m http.server` and open http://localhost:8000
