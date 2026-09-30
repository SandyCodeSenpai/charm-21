const STORE_KEY = "charm21-v1";
const $view = document.getElementById("view");
const $layer = document.getElementById("layer");
const $fab = document.getElementById("fab");

// ── State ─────────────────────────────────────────────────────────
let state = load();
function load() {
  let s;
  try { s = JSON.parse(localStorage.getItem(STORE_KEY)); } catch {}
  s ||= {};
  s.days ||= {};
  s.notify ||= { level: "relentless", code: null, badge: true };
  return s;
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
  updateBadge();
}
function dayState(i) {
  return (state.days[i] ||= { tasks: {}, reps: 0, confidence: null, reflection: "", fillers: null });
}

// ── Dates & time of day ───────────────────────────────────────────
function dateOf(i) { return new Date(PLAN_YEAR, PLAN_MONTH, i + 1); }
function todayIndex() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - new Date(PLAN_YEAR, PLAN_MONTH, 1)) / 86400000);
}
const inPlan = i => i >= 0 && i <= 20;
function fmtDate(i, opts = { weekday: "short", month: "short", day: "numeric" }) {
  return dateOf(i).toLocaleDateString(undefined, opts);
}
const weekOf = i => WEEKS[Math.floor(i / 7)];
function phase() {
  const h = new Date().getHours();
  return h >= 5 && h < 11 ? "dawn" : h >= 11 && h < 17 ? "day" : h >= 17 && h < 21 ? "dusk" : "night";
}
const GREETING = { dawn: "Good morning", day: "Good afternoon", dusk: "Good evening", night: "Late night" };

// ── Tasks & completion ────────────────────────────────────────────
function tasksFor(i) {
  const d = DAYS[i], s = dayState(i), w = weekOf(i);
  return [
    { id: "warmup", text: d.lines.length ? "Read today's lines out loud. Slow, and let each one land low." : "60 seconds talking out loud. Slow, every sentence ends low.", sub: "Voice warm-up" },
    ...d.missions.map((m, k) => ({ id: "m" + k, text: m, sub: `Mission ${k + 1}` })),
    { id: "reps", text: `Talk to ${w.target} stranger${w.target > 1 ? "s" : ""}`, sub: `${s.reps} of ${w.target} · tap + after each one`, auto: true, meter: Math.min(1, s.reps / w.target) },
    { id: "checkin", text: "Evening check-in", sub: "Confidence + one honest paragraph", auto: true },
  ].map(t => ({ ...t, done: t.id === "reps" ? s.reps >= w.target : t.id === "checkin" ? s.confidence != null && s.reflection.trim().length > 0 : !!s.tasks[t.id] }));
}
function pct(i) {
  const t = tasksFor(i);
  return Math.round((t.filter(x => x.done).length / t.length) * 100);
}
function streak() {
  let i = Math.min(todayIndex(), 20);
  if (i < 0) return 0;
  if (pct(i) < 100) i--;
  let n = 0;
  while (i >= 0 && pct(i) === 100) { n++; i--; }
  return n;
}
function nextAction(i) {
  const h = new Date().getHours();
  const order = h < 11 ? ["warmup", "m0", "reps", "m1", "checkin"]
    : h < 19 ? ["m0", "reps", "m1", "warmup", "checkin"]
    : h < 21 ? ["m1", "reps", "checkin", "m0", "warmup"]
    : ["checkin", "m1", "reps", "m0", "warmup"];
  const tasks = Object.fromEntries(tasksFor(i).map(t => [t.id, t]));
  const id = order.find(k => !tasks[k].done);
  const d = DAYS[i], s = dayState(i), w = weekOf(i);
  if (!id) return { label: "Day complete.", text: i < 20 ? `That's who you are now. Tomorrow: ${DAYS[i + 1].title}.` : "Twenty-one days. Go look at the evidence.", btn: i < 20 ? null : ["See the evidence", "tab:evidence"] };
  if (id === "warmup") return { label: "Warm up your voice.", text: tasks.warmup.text, btn: ["Open the lines", "go:lines"] };
  if (id === "m0" || id === "m1") return { label: `Mission ${+id[1] + 1}.`, text: d.missions[+id[1]], btn: ["Mark it done", "task:" + id] };
  if (id === "reps") return { label: "Talk to a stranger.", text: `${s.reps} of ${w.target} today. One real sentence counts. The scary one counts double.`, btn: ["I just did one", "rep"] };
  return { label: "Check in.", text: d.reflect, btn: ["Rate today", "go:checkin"] };
}

// ── Helpers ───────────────────────────────────────────────────────
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad2 = n => String(n).padStart(2, "0");
const ICON = {
  check: `<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  left: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  right: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>`,
  chev: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>`,
  flip: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>`,
};
let toastTimer;
function toast(msg, undo) {
  document.querySelectorAll(".toast").forEach(t => t.remove());
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span>${esc(msg)}</span>${undo ? `<button>Undo</button>` : ""}`;
  if (undo) t.querySelector("button").onclick = () => { undo(); t.remove(); };
  document.body.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), undo ? 4000 : 2400);
}
const CHEERS = ["Evidence collected.", "That's who you are now.", "Scared and did it anyway.", "Your nervous system just learned something.", "One more than yesterday."];
const cheer = () => CHEERS[Math.floor(Math.random() * CHEERS.length)];
const ALL_QUOTES = [...DAYS.map(d => d.quote), ...EXTRA_QUOTES];
const FEEL = n => n <= 2 ? "Frozen" : n <= 4 ? "In my head" : n <= 6 ? "Getting there" : n <= 8 ? "Present" : "Fearless";
function buzz() { navigator.vibrate?.(12); }

// ── Routing ───────────────────────────────────────────────────────
let tab = "now";
let viewing = Math.max(0, Math.min(todayIndex(), 20));
const flipped = new Set(); // "day:card" keys, so flips survive re-renders

document.querySelector(".dock").addEventListener("click", e => {
  const b = e.target.closest("button[data-tab]");
  if (b) go(b.dataset.tab);
});
function go(t, keepDay) {
  tab = t;
  if (t === "now" && !keepDay) viewing = Math.max(0, Math.min(todayIndex(), 20));
  render(true);
}

function render(enter) {
  document.documentElement.dataset.phase = phase();
  document.querySelectorAll(".dock button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  ({ now: renderNow, path: renderPath, guide: renderGuide, evidence: renderEvidence })[tab]();
  $view.classList.remove("view-enter");
  if (enter) { void $view.offsetWidth; $view.classList.add("view-enter"); window.scrollTo(0, 0); }
  renderFab();
  document.getElementById("bell").className = "bell " + (state.notify.code ? "on" : "off");
}
function rerender() { const y = scrollY; render(); scrollTo(0, y); }

// ── Now ───────────────────────────────────────────────────────────
function ringSVG(v) {
  const ti = todayIndex(), c = 130, r = 112, step = 360 / 21, gap = 2.4;
  const pt = (a, rad) => [c + rad * Math.cos((a * Math.PI) / 180), c + rad * Math.sin((a * Math.PI) / 180)];
  let segs = "";
  for (let k = 0; k < 21; k++) {
    const a0 = -90 + k * step + gap / 2, a1 = a0 + step - gap;
    const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
    const p = pct(k);
    const stroke = p === 100 ? "url(#emb)" : p > 0 ? `rgba(242,165,65,${0.25 + 0.5 * p / 100})` : k <= ti ? "rgba(255,244,232,.16)" : "rgba(255,244,232,.08)";
    segs += `<path d="M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)}" stroke="${stroke}" stroke-width="${k === ti ? 14 : 10}" fill="none"/>`;
  }
  const [mx, my] = pt(-90 + (v + 0.5) * step, r + 17);
  return `<svg viewBox="0 0 260 260" aria-hidden="true">
    <defs><linearGradient id="emb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7c77d"/><stop offset=".5" stop-color="#f2a541"/><stop offset="1" stop-color="#e4572e"/></linearGradient></defs>
    ${segs}<circle cx="${mx.toFixed(2)}" cy="${my.toFixed(2)}" r="3.5" fill="#f5eee6"/></svg>`;
}

function renderNow() {
  const i = viewing, d = DAYS[i], s = dayState(i), w = weekOf(i), ti = todayIndex(), ph = phase();
  const isToday = i === ti;
  const sub = ti < 0 ? (ti === -1 ? "Starts tomorrow" : `Starts in ${-ti} days`) : `Day ${i + 1} of 21`;

  let now;
  if (ti < 0) now = { eyebrow: "Tonight", label: "Read Day 1. Turn on reminders.", text: "Tomorrow at 7:25 your first brief lands. Walk in already knowing the move.", btn: ["Set up reminders", "sheet:remind"] };
  else if (ti > 20) now = { eyebrow: "After the 21", label: "Keep running the guide.", text: "The plan is done. The habits aren't. Open the Field Guide before any date.", btn: ["Open the guide", "tab:guide"] };
  else if (!isToday) now = { eyebrow: i < ti ? "Looking back" : "Looking ahead", label: `This is Day ${i + 1}.`, text: `Today is Day ${ti + 1}: ${DAYS[ti].title}.`, btn: ["Back to today", "today"] };
  else { const a = nextAction(i); now = { eyebrow: "Right now", ...a }; }

  const tasks = tasksFor(i);
  const lines = d.lines;
  $view.innerHTML = `
    <section class="hero">
      <div class="eyebrow">${esc(GREETING[ph])} · ${esc(fmtDate(i, { month: "short", day: "numeric" }))}</div>
      <div class="ring-wrap">
        ${ringSVG(i)}
        <div class="ring-center"><div class="numeral">${pad2(i + 1)}</div><div class="numeral-sub">${esc(sub)}</div></div>
        <div class="day-arrows">
          <button data-act="prev" aria-label="Previous day" ${i === 0 ? "disabled" : ""}>${ICON.left}</button>
          <button data-act="next" aria-label="Next day" ${i === 20 ? "disabled" : ""}>${ICON.right}</button>
        </div>
      </div>
      <div class="eyebrow ember">Week ${w.n} · ${esc(w.name)}</div>
      <h1>${esc(d.title)}</h1>
      <div class="chip"><i></i>${esc(d.source)} · ${pct(i)}% done</div>
    </section>

    <section class="now">
      <div class="eyebrow">${esc(now.eyebrow)}</div>
      <div class="label">${esc(now.label)}</div>
      <p>${esc(now.text)}</p>
      ${now.btn ? `<button class="btn hot" data-act="${now.btn[1]}">${esc(now.btn[0])}</button>` : ""}
    </section>

    <section class="section">
      <div class="section-head"><h2>The principle</h2></div>
      <div class="principle">${esc(d.principle)}</div>
      <div class="source">${esc(d.source)}</div>
    </section>

    <section class="section" id="sec-missions">
      <div class="section-head"><h2>Today's work</h2><span class="muted small">${tasks.filter(t => t.done).length}/${tasks.length}</span></div>
      <div class="missions">
        ${tasks.map((t, k) => `
          <button class="mission ${t.done ? "done" : ""}" data-act="${t.auto ? "auto:" + t.id : "task:" + t.id}" data-id="${t.id}">
            <span class="no">${pad2(k + 1)}</span>
            <span class="t">${esc(t.text)}<span class="sub">${esc(t.sub)}</span>${t.meter != null ? `<span class="meter"><i style="width:${t.meter * 100}%"></i></span>` : ""}</span>
            <span class="check">${ICON.check}</span>
          </button>`).join("")}
      </div>
    </section>

    ${lines.length ? `
    <section class="section" id="sec-lines">
      <div class="section-head"><h2>Fix the line</h2><span class="muted small">Say yours first, then flip</span></div>
      <div class="flips">
        ${lines.map((l, k) => `
          <button class="flip ${flipped.has(i + ":" + k) ? "on" : ""}" data-act="flip:${k}" aria-label="Flip card ${k + 1}">
            <div class="flip-inner">
              <div class="face front"><span class="tag">Flat</span><div class="said">${esc(l.flat)}</div><span class="cta">${ICON.flip} How would you say it? Tap to flip</span></div>
              <div class="face back"><span class="tag">Better</span><div class="said">${esc(l.better)}</div><span class="cta">${ICON.flip} Now say it out loud. Slow.</span></div>
            </div>
          </button>`).join("")}
      </div>
    </section>` : ""}

    <section class="section" id="sec-checkin">
      <div class="section-head"><h2>Tonight</h2><span class="muted small">${ph === "dusk" || ph === "night" ? "Now's the time" : "Fill in before bed"}</span></div>
      <div class="checkin">
        <div class="eyebrow">How present were you today?</div>
        <div class="signal">
          ${Array.from({ length: 10 }, (_, k) => `<button data-conf="${k + 1}" class="${s.confidence >= k + 1 ? "lit" : ""}" style="height:${22 + k * 8.6}%" aria-label="${k + 1} out of 10"><span>${k + 1}</span></button>`).join("")}
        </div>
        <div class="signal-read"><span class="word">${s.confidence ? FEEL(s.confidence) : "Tap a bar"}</span><span class="num">${s.confidence ? s.confidence + " / 10" : ""}</span></div>
        <textarea id="reflection" placeholder="${esc(d.reflect)}">${esc(s.reflection)}</textarea>
        ${d.memo ? `
        <div class="stepper">
          <div><div style="font-weight:800">Memo fillers</div><div class="muted small">yeah · like · basically · multiple</div></div>
          <div class="ctl"><button data-act="fill-" aria-label="Fewer">−</button><span class="v">${s.fillers ?? 0}</span><button data-act="fill+" aria-label="More">+</button></div>
        </div>` : ""}
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h2>Fuel</h2><button class="btn sm ghost" data-act="quote">Another →</button></div>
      <div class="fuel" id="quoteBox"><div class="q">${esc(d.quote.text)}</div><div class="by">${esc(d.quote.by)}</div></div>
    </section>
  `;
}

function renderFab() {
  const show = tab === "now" && inPlan(todayIndex()) && viewing <= todayIndex();
  $fab.hidden = !show;
  if (!show) return;
  const s = dayState(viewing), t = weekOf(viewing).target;
  $fab.style.setProperty("--p", Math.min(100, (s.reps / t) * 100));
  document.getElementById("fabCnt").textContent = `${s.reps}/${t}`;
}
$fab.addEventListener("click", () => logRep());
function logRep() {
  const s = dayState(viewing), t = weekOf(viewing).target;
  s.reps++; save(); buzz();
  $fab.classList.remove("hit"); void $fab.offsetWidth; $fab.classList.add("hit");
  if (tab === "now") rerender();
  toast(s.reps === t ? `Target hit. ${cheer()}` : `Rep ${s.reps}. ${cheer()}`, () => { s.reps = Math.max(0, s.reps - 1); save(); rerender(); });
}

function focusSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  const target = el.querySelector(".checkin, .missions, .flips") || el;
  target.classList.remove("flash"); void target.offsetWidth; target.classList.add("flash");
}
function handleGo(where) {
  if (where === "evidence") return go("evidence");
  if (tab !== "now" || viewing !== todayIndex()) go("now");
  if (where === "reps") { $fab.classList.remove("hint"); void $fab.offsetWidth; $fab.classList.add("hint"); return; }
  if (["missions", "lines", "checkin"].includes(where)) setTimeout(() => focusSection("sec-" + where), 120);
}

// ── Events on the main view ───────────────────────────────────────
$view.addEventListener("click", e => {
  const conf = e.target.closest("[data-conf]");
  if (conf) { dayState(viewing).confidence = +conf.dataset.conf; save(); buzz(); rerender(); return; }
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const [act, arg] = el.dataset.act.split(":");
  const s = dayState(viewing);
  switch (act) {
    case "task": {
      s.tasks[arg] = !s.tasks[arg]; save(); buzz(); rerender();
      if (s.tasks[arg]) {
        document.querySelector(`.mission[data-id="${arg}"]`)?.classList.add("just");
        toast(pct(viewing) === 100 ? "Day complete. That's who you are now." : cheer());
      }
      break;
    }
    case "auto":
      if (arg === "reps") handleGo("reps"); else focusSection("sec-checkin");
      break;
    case "rep": logRep(); break;
    case "go": focusSection("sec-" + arg); break;
    case "tab": go(arg); break;
    case "today": go("now"); break;
    case "sheet": openReminders(); break;
    case "prev": viewing--; render(true); break;
    case "next": viewing++; render(true); break;
    case "flip": { const key = viewing + ":" + arg; flipped.has(key) ? flipped.delete(key) : flipped.add(key); el.classList.toggle("on"); buzz(); break; }
    case "fill+": s.fillers = (s.fillers ?? 0) + 1; save(); rerender(); break;
    case "fill-": s.fillers = Math.max(0, (s.fillers ?? 0) - 1); save(); rerender(); break;
    case "quote": {
      const q = ALL_QUOTES[Math.floor(Math.random() * ALL_QUOTES.length)];
      const box = document.getElementById("quoteBox");
      box.innerHTML = `<div class="q">${esc(q.text)}</div><div class="by">${esc(q.by)}</div>`;
      box.classList.remove("view-enter"); void box.offsetWidth; box.classList.add("view-enter");
      break;
    }
    case "day": viewing = +arg; go("now", true); break;
    case "export": exportData(); break;
    case "import": document.getElementById("importFile").click(); break;
    case "reset":
      if (confirm("Erase all progress? This can't be undone.")) { state.days = {}; save(); render(); }
      break;
  }
});
let saveTimer;
$view.addEventListener("input", e => {
  if (e.target.id !== "reflection") return;
  dayState(viewing).reflection = e.target.value;
  clearTimeout(saveTimer); saveTimer = setTimeout(save, 300);
});
$view.addEventListener("change", e => {
  if (e.target.id === "reflection") { save(); const t = e.target.value; rerender(); if (t.trim()) toast("Saved. " + cheer()); }
  if (e.target.id === "importFile") importData(e.target.files[0]);
});

// Swipe between days on Now
let tx = null, ty = null;
$view.addEventListener("touchstart", e => { if (tab === "now" && !e.target.closest("textarea")) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; } }, { passive: true });
$view.addEventListener("touchend", e => {
  if (tx == null) return;
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  tx = null;
  if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
  if (dx < 0 && viewing < 20) { viewing++; render(true); }
  if (dx > 0 && viewing > 0) { viewing--; render(true); }
});

// ── Path ──────────────────────────────────────────────────────────
function renderPath() {
  const ti = todayIndex();
  $view.innerHTML = `
    <div class="eyebrow ember">The path</div>
    <h1>Twenty-one <em>days.</em></h1>
    <p class="muted" style="margin-top:12px">Oct 1 to Oct 21. Tap any day to open it.</p>
    ${WEEKS.map(w => {
      const idx = [0, 1, 2, 3, 4, 5, 6].map(k => (w.n - 1) * 7 + k);
      return `
      <section class="week">
        <div class="week-title"><span class="eyebrow">Week ${w.n}</span></div>
        <div class="display" style="font-size:44px;font-style:italic">${esc(w.name)}</div>
        <div class="week-sub">${esc(w.tagline)} · ${esc(fmtDate(idx[0], { month: "short", day: "numeric" }))}–${esc(fmtDate(idx[6], { day: "numeric" }))} · ${w.target} rep${w.target > 1 ? "s" : ""} a day</div>
        <div class="trail">
          ${idx.map(i => {
            const p = pct(i);
            return `<button class="stop ${i === ti ? "today" : ""} ${i > ti ? "future" : ""}" data-act="day:${i}">
              <span class="node ${p === 100 ? "full" : ""}" style="--p:${p}"><span>${i + 1}</span></span>
              <span><span class="meta">${esc(fmtDate(i))}${i === ti ? `<span class="pill-today">Today</span>` : ""}${p > 0 && p < 100 ? ` · ${p}%` : ""}</span><span class="name" style="display:block">${esc(DAYS[i].title)}</span></span>
            </button>`;
          }).join("")}
        </div>
      </section>`;
    }).join("")}
  `;
}

// ── Guide ─────────────────────────────────────────────────────────
const TIER_STYLE = [
  { k: "Texting", h: "Text rules", c: "#f5eee6" },
  { k: "Speaking", h: "Voice rules", c: "#f5eee6" },
  { k: "Use freely", h: "Greene at full power", c: "#8fd19e" },
  { k: "Light touch", h: "Greene, the light version", c: "#f2a541" },
  { k: "Know it, don't run it", h: "The dark chapters", c: "#ef8a73" },
  { k: "Before any move", h: "Secure or scared?", c: "#b9b3ff" },
];
function renderGuide() {
  $view.innerHTML = `
    <div class="eyebrow ember">Field guide</div>
    <h1>Read this <em>before</em> you walk in.</h1>
    <p class="muted" style="margin:12px 0 26px">Before a date, a hard conversation, or any time you're tempted to play a game.</p>
    ${TOOLKIT.map((sec, k) => `
      <details class="tier" style="--c:${TIER_STYLE[k]?.c}" ${k === 5 ? "open" : ""}>
        <summary><span><span class="k">${esc(TIER_STYLE[k]?.k || "")}</span><span class="h">${esc(TIER_STYLE[k]?.h || sec.title)}</span></span><span class="chev">${ICON.chev}</span></summary>
        <ul>${sec.items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      </details>`).join("")}
  `;
}

// ── Evidence ──────────────────────────────────────────────────────
function area(values, max, color) {
  const pts = values.map((v, i) => (v == null ? null : [i, v])).filter(Boolean);
  if (pts.length < 2) return `<div class="empty">Log two days to see the line.</div>`;
  const W = 320, H = 140, px = 6, py = 10, span = Math.max(6, pts.at(-1)[0]);
  const x = i => px + (i / span) * (W - px * 2), y = v => H - py - (v / max) * (H - py * 2);
  const line = pts.map(([i, v], k) => `${k ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const fill = `${line} L${x(pts.at(-1)[0]).toFixed(1)},${H - py} L${x(pts[0][0]).toFixed(1)},${H - py} Z`;
  const id = "g" + Math.random().toString(36).slice(2, 7);
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".35"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${[0.25, 0.5, 0.75].map(f => `<line x1="0" x2="${W}" y1="${py + f * (H - py * 2)}" y2="${py + f * (H - py * 2)}" stroke="rgba(255,244,232,.07)"/>`).join("")}
    <path d="${fill}" fill="url(#${id})"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
    ${pts.map(([i, v]) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="${color}"/>`).join("")}
  </svg>`;
}
function renderEvidence() {
  const idx = DAYS.map((_, i) => i);
  const done = idx.filter(i => pct(i) === 100).length;
  const reps = idx.reduce((a, i) => a + (state.days[i]?.reps || 0), 0);
  const confs = idx.map(i => state.days[i]?.confidence ?? null);
  const logged = confs.filter(c => c != null);
  const avg = logged.length ? (logged.reduce((a, b) => a + b, 0) / logged.length).toFixed(1) : "–";
  const fills = idx.map(i => (DAYS[i].memo ? state.days[i]?.fillers ?? null : null));
  const refl = idx.filter(i => state.days[i]?.reflection?.trim()).reverse();

  $view.innerHTML = `
    <div class="eyebrow ember">Evidence</div>
    <h1>Confidence is <em>evidence.</em></h1>
    <p class="muted" style="margin-top:12px">Every rep is proof. This is the pile.</p>
    <div class="stats">
      <div class="stat hero-stat"><div class="v">${reps}</div><div class="k">conversations with strangers you almost didn't have</div></div>
      <div class="stat"><div class="v">${done}<small>/21</small></div><div class="k">days complete</div></div>
      <div class="stat"><div class="v">${streak()}</div><div class="k">day streak</div></div>
      <div class="stat"><div class="v">${avg}</div><div class="k">avg presence</div></div>
      <div class="stat"><div class="v" style="font-size:26px;line-height:1.15;font-style:italic">${logged.length ? FEEL(Math.round(+avg)) : "–"}</div><div class="k">your usual state</div></div>
    </div>

    <section class="section">
      <div class="section-head"><h2>Presence</h2><span class="muted small">1–10 each night</span></div>
      <div class="chart">${area(confs, 10, "#f2a541")}</div>
    </section>
    <section class="section">
      <div class="section-head"><h2>Fillers</h2><span class="muted small">memo days · lower wins</span></div>
      <div class="chart">${area(fills, Math.max(5, ...fills.filter(f => f != null)), "#ef8a73")}</div>
    </section>
    <section class="section">
      <div class="section-head"><h2>Journal</h2></div>
      ${refl.length ? refl.map(i => `<div class="entry"><div class="d">Day ${i + 1} · ${esc(DAYS[i].title)}${state.days[i].confidence ? ` · ${state.days[i].confidence}/10` : ""}</div><div class="txt">${esc(state.days[i].reflection)}</div></div>`).join("") : `<p class="muted">Your evening check-ins collect here.</p>`}
    </section>
    <section class="section">
      <div class="section-head"><h2>Backup</h2></div>
      <p class="muted small">Progress lives only on this phone. Export once a week.</p>
      <div class="row">
        <button class="btn sm" data-act="export">Export</button>
        <button class="btn sm" data-act="import">Import</button>
        <button class="btn sm ghost" data-act="reset" style="color:var(--bad)">Reset</button>
      </div>
      <input type="file" id="importFile" accept="application/json" hidden>
    </section>
  `;
}
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `charm21-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function importData(file) {
  if (!file) return;
  file.text().then(t => {
    const data = JSON.parse(t);
    if (!data || typeof data.days !== "object") throw new Error();
    state = { ...load(), ...data }; save(); render(); toast("Backup restored");
  }).catch(() => toast("That file isn't a Charm 21 backup"));
}

// ── Reminders (push) ──────────────────────────────────────────────
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const pushCapable = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
let installPrompt = null; // Chrome/Android: captured so we can offer a real Install button
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installPrompt = e; });
addEventListener("appinstalled", () => { installPrompt = null; toast("Installed. Open it from your home screen."); });

function b64uToBytes(s) {
  const b = atob((s + "=".repeat((4 - (s.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(b, c => c.charCodeAt(0));
}
const toCode = obj => btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function openSheet(html, onClick) {
  $layer.innerHTML = `<div class="scrim"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grabber"></div>${html}</div>`;
  const scrim = $layer.querySelector(".scrim"), sheet = $layer.querySelector(".sheet");
  requestAnimationFrame(() => { scrim.classList.add("open"); sheet.classList.add("open"); });
  scrim.onclick = closeSheet;
  sheet.onclick = onClick;
  let sy = null;
  sheet.addEventListener("touchstart", e => { if (sheet.scrollTop <= 0) sy = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener("touchend", e => { if (sy != null && e.changedTouches[0].clientY - sy > 90) closeSheet(); sy = null; });
}
function closeSheet() {
  const scrim = $layer.querySelector(".scrim"), sheet = $layer.querySelector(".sheet");
  if (!sheet) return;
  scrim.classList.remove("open"); sheet.classList.remove("open");
  setTimeout(() => { $layer.innerHTML = ""; }, 400);
}

function remindersHTML() {
  const n = state.notify, lvl = n.level;
  const ti = todayIndex(), previewDay = Math.max(0, Math.min(ti, 20));
  let status;
  if (isIOS && !standalone) {
    status = `<div class="status warn"><span class="dot"></span><div><b>Install first.</b> iPhone only allows notifications for apps on the Home Screen.
      <ol class="steps"><li>Tap <b>Share</b> in Safari</li><li>Tap <b>Add to Home Screen</b></li><li>Open Charm 21 from your Home Screen and come back here</li></ol></div></div>`;
  } else if (!pushCapable) {
    status = `<div class="status warn"><span class="dot"></span><div>This browser can't receive push. Use Safari on iPhone (installed to Home Screen) or Chrome.</div></div>`;
  } else if (Notification.permission === "denied") {
    status = `<div class="status warn"><span class="dot"></span><div><b>Blocked.</b> Settings → Notifications → Charm 21 → Allow Notifications. Then come back.</div></div>`;
  } else if (n.code) {
    status = `<div class="status ok"><span class="dot"></span><div><b>This phone is subscribed</b> at <b>${LEVELS[lvl].name}</b>.
      ${n.pendingCode ? `<div style="margin-top:8px">Last step: send the code below to Claude so the reminder server knows where to find you.</div>` : ""}
      <div class="code" id="code">${esc(n.code)}</div>
      <div class="row" style="margin-top:10px"><button class="btn sm" data-r="copy">Copy code</button>${navigator.share ? `<button class="btn sm" data-r="share">Share</button>` : ""}<button class="btn sm ghost" data-r="sent">${n.pendingCode ? "I sent it" : "Sent ✓"}</button></div></div></div>`;
  } else {
    status = `<div class="status"><span class="dot"></span><div><b>Off.</b> Pick an intensity, then turn them on.</div></div>`;
  }
  const counts = Object.fromEntries(Object.keys(LEVELS).map(k => [k, SLOTS.filter(s => s.levels.includes(k)).length]));
  return `
    <div class="eyebrow ember">Reminders</div>
    <h1>Let the plan <em>find you.</em></h1>
    <p class="muted" style="margin-top:10px">Pushed to your lock screen at set times, with the day's actual mission, line and question in each one.</p>
    ${status}
    ${installPrompt && !standalone ? `<button class="toggle" data-r="install"><span><div style="font-weight:800">Install on this phone</div><div class="muted small">Home-screen icon, full screen, badge on the icon</div></span><span class="btn sm">Install</span></button>` : ""}
    <div class="section-head" style="margin-top:28px"><h2>Intensity</h2></div>
    <div class="levels">
      ${Object.entries(LEVELS).map(([k, v]) => `
        <button class="level ${k === lvl ? "on" : ""}" data-r="level:${k}">
          <span><div class="n">${v.name}</div><div class="b">${v.blurb}</div></span>
          <span class="c">${counts[k]}<small> /day</small></span>
        </button>`).join("")}
    </div>
    ${pushCapable && !(isIOS && !standalone) && Notification.permission !== "denied" ? `
      <div class="row" style="margin-top:18px">
        <button class="btn hot" data-r="enable">${n.code ? "Re-subscribe" : "Turn on reminders"}</button>
        ${Notification.permission === "granted" ? `<button class="btn" data-r="test">Test</button>` : ""}
      </div>` : ""}
    <div class="section-head" style="margin-top:32px"><h2>${ti < 0 ? "Day 1's schedule" : "Today's schedule"}</h2><span class="muted small">Pacific time</span></div>
    <div class="sched">
      ${SLOTS.map(sl => {
        const m = buildMessage(sl.id, ti === -1 && sl.id === "checkin" ? -1 : previewDay);
        const on = sl.levels.includes(lvl);
        return `<div class="slot ${on ? "" : "off"}"><div class="time">${sl.time}</div><div><div class="ttl">${esc(m?.title || sl.label)}</div><div class="body">${esc(m?.body || "")}</div></div></div>`;
      }).join("")}
    </div>
    ${"setAppBadge" in navigator ? `
    <button class="toggle" data-r="badge"><span><div style="font-weight:800">Icon badge</div><div class="muted small">Unfinished items for today on the app icon</div></span><span class="switch ${n.badge ? "on" : ""}"></span></button>` : ""}
    <div class="row" style="margin-top:18px"><button class="btn ghost" data-r="close">Done</button></div>
  `;
}
function openReminders() { openSheet(remindersHTML(), onRemindersClick); }
function refreshSheet() {
  const sheet = $layer.querySelector(".sheet");
  if (sheet) { const y = sheet.scrollTop; sheet.innerHTML = `<div class="grabber"></div>${remindersHTML()}`; sheet.scrollTop = y; }
  render();
}
async function onRemindersClick(e) {
  const el = e.target.closest("[data-r]");
  if (!el) return;
  const [act, arg] = el.dataset.r.split(":");
  const n = state.notify;
  if (act === "close") return closeSheet();
  if (act === "install" && installPrompt) { installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; return refreshSheet(); }
  if (act === "level") {
    n.level = arg;
    if (n.code) await makeCode(true);
    save(); refreshSheet();
  }
  if (act === "enable") {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { toast("Notifications not allowed"); return refreshSheet(); }
      await makeCode(true);
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification("Reminders are on", { body: "Send your code to Claude and the first brief lands at 7:25.", icon: "icons/icon-192.png", badge: "icons/badge-96.png", tag: "welcome" });
      save(); refreshSheet();
    } catch (err) { toast("Couldn't subscribe: " + (err.message || err)); }
  }
  if (act === "test") {
    const reg = await navigator.serviceWorker.ready;
    const m = buildMessage("morning", Math.max(0, Math.min(todayIndex(), 20)));
    reg.showNotification(m.title, { body: m.body, icon: "icons/icon-192.png", badge: "icons/badge-96.png", tag: "test", data: { go: "now" } });
  }
  if (act === "copy") { await navigator.clipboard.writeText(n.code).then(() => toast("Code copied"), () => toast("Long-press the code to copy")); }
  if (act === "share") { navigator.share({ title: "Charm 21 reminder code", text: n.code }).catch(() => {}); }
  if (act === "sent") { n.pendingCode = false; save(); refreshSheet(); }
  if (act === "badge") { n.badge = !n.badge; save(); refreshSheet(); }
}
async function makeCode(markPending) {
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64uToBytes(VAPID_PUBLIC_KEY) });
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const code = toCode({ s: sub.toJSON(), l: state.notify.level, tz });
  if (code !== state.notify.code && markPending) state.notify.pendingCode = true;
  state.notify.code = code;
}
document.getElementById("bell").addEventListener("click", openReminders);

function updateBadge() {
  if (!("setAppBadge" in navigator)) return;
  const ti = todayIndex();
  if (!state.notify?.badge || !inPlan(ti)) return navigator.clearAppBadge?.().catch(() => {});
  const left = tasksFor(ti).filter(t => !t.done).length;
  (left ? navigator.setAppBadge(left) : navigator.clearAppBadge()).catch(() => {});
}

// ── Onboarding ────────────────────────────────────────────────────
function onboarding() {
  const ti = todayIndex();
  const slides = [
    `<div class="big">Twenty‑one <em>days.</em></div><p>You don't wait to feel confident. You act, and the feeling catches up. ${ti < 0 ? `Day 1 is ${fmtDate(0, { weekday: "long" })}.` : ""}</p>`,
    `<div class="big">Three <em>weeks.</em></div><div class="weeks">${WEEKS.map(w => `<div><b>${w.name}</b><span>${w.tagline}</span></div>`).join("")}</div>`,
    `<div class="big">Tap <em>+</em> after every stranger.</div><p>That orange button is your rep counter. Every tap is evidence. Every evening, one bar and one honest paragraph.</p>`,
    `<div class="big">Let it <em>find you.</em></div><p>Up to 8 pushes a day: the brief, your missions, a line to fix, a question at night.</p>`,
  ];
  let k = 0;
  const el = document.createElement("div");
  el.className = "onboard";
  const draw = () => {
    el.innerHTML = `<div class="ambient"></div><div class="slides"><div class="slide">${slides[k]}</div></div>
      <div class="dots">${slides.map((_, j) => `<i class="${j === k ? "on" : ""}"></i>`).join("")}</div>
      <div class="actions">
        <button class="btn ghost" data-o="skip">${k === slides.length - 1 ? "Later" : "Skip"}</button>
        <button class="btn hot" data-o="next">${k === slides.length - 1 ? "Set up reminders" : "Next"}</button>
      </div>`;
  };
  const finish = openRem => { state.onboarded = true; save(); el.remove(); if (openRem) openReminders(); };
  el.addEventListener("click", e => {
    const o = e.target.closest("[data-o]")?.dataset.o;
    if (o === "skip") finish(false);
    if (o === "next") { if (k < slides.length - 1) { k++; draw(); } else finish(true); }
  });
  draw();
  document.body.appendChild(el);
}

// ── Boot ──────────────────────────────────────────────────────────
render(true);
updateBadge();
if (!state.onboarded) onboarding();
const q = new URLSearchParams(location.search).get("go");
if (q) { handleGo(q); history.replaceState(null, "", location.pathname); }
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
  navigator.serviceWorker.addEventListener("message", e => e.data?.go && handleGo(e.data.go));
}
// Refresh phase/greeting and the right-now card when the app comes back to the foreground.
document.addEventListener("visibilitychange", () => { if (!document.hidden && !$layer.innerHTML) rerender(); });
