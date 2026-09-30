const STORE_KEY = "charm21-v1";
const $view = document.getElementById("view");

// ── State ─────────────────────────────────────────────────────────
let state = load();
function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || { days: {} }; }
  catch { return { days: {} }; }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
}
function dayState(i) {
  return (state.days[i] ||= { tasks: {}, reps: 0, confidence: null, reflection: "", fillers: null });
}

// ── Dates ─────────────────────────────────────────────────────────
function dateOf(i) { return new Date(PLAN_YEAR, PLAN_MONTH, i + 1); }
function todayIndex() {
  const now = new Date();
  const start = new Date(PLAN_YEAR, PLAN_MONTH, 1);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - start) / 86400000);
}
function fmtDate(i, opts = { weekday: "short", month: "short", day: "numeric" }) {
  return dateOf(i).toLocaleDateString(undefined, opts);
}
function weekOf(i) { return WEEKS[Math.floor(i / 7)]; }

// ── Tasks & completion ────────────────────────────────────────────
function tasksFor(i) {
  const d = DAYS[i], s = dayState(i), w = weekOf(i);
  const warm = d.lines.length
    ? "Warm-up: read today's lines out loud. Slow, pitch drops at the end"
    : "Warm-up: 60s talking out loud, slow, every sentence ends low";
  return [
    { id: "warmup", text: warm, done: !!s.tasks.warmup },
    ...d.missions.map((m, k) => ({ id: "m" + k, text: m, done: !!s.tasks["m" + k] })),
    { id: "reps", text: `Talk to ${w.target} stranger${w.target > 1 ? "s" : ""} (${s.reps}/${w.target})`, done: s.reps >= w.target, auto: true },
    { id: "checkin", text: "Evening check-in: confidence + reflection", done: s.confidence != null && s.reflection.trim().length > 0, auto: true },
  ];
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

// ── Helpers ───────────────────────────────────────────────────────
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function toast(msg) {
  document.querySelectorAll(".toast").forEach(t => t.remove());
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2300);
}
const CHEERS = ["Rep logged. Evidence collected.", "That's who you are now.", "One more than yesterday.", "Scared and did it anyway. That's the whole game.", "Your nervous system just learned something."];
const cheer = () => CHEERS[Math.floor(Math.random() * CHEERS.length)];
const ALL_QUOTES = [...DAYS.map(d => d.quote), ...EXTRA_QUOTES];

// ── Routing ───────────────────────────────────────────────────────
let tab = "today";
let viewing = Math.max(0, Math.min(todayIndex(), 20));

document.querySelector(".tabs").addEventListener("click", e => {
  const b = e.target.closest("button[data-tab]");
  if (!b) return;
  tab = b.dataset.tab;
  if (tab === "today") viewing = Math.max(0, Math.min(todayIndex(), 20));
  render();
});

function render() {
  document.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  const ti = todayIndex();
  document.getElementById("topMeta").textContent =
    ti < 0 ? `Starts ${fmtDate(0, { month: "short", day: "numeric" })}` :
    ti > 20 ? "Plan complete" : `Day ${ti + 1} of 21`;
  ({ today: renderDay, plan: renderPlan, toolkit: renderToolkit, progress: renderProgress })[tab]();
  window.scrollTo(0, 0);
}

// ── Day view ──────────────────────────────────────────────────────
function renderDay() {
  const i = viewing, d = DAYS[i], s = dayState(i), w = weekOf(i), ti = todayIndex();
  let banner = "";
  if (ti < 0 && i === 0) banner = `<div class="banner">Starts ${fmtDate(0)}. Read Day 1 tonight so you walk in ready.</div>`;
  else if (ti > 20 && i === 20) banner = `<div class="banner">21 days done. Keep running the toolkit. Scroll to Progress to see how far you came.</div>`;
  else if (i !== ti && ti >= 0 && ti <= 20) banner = `<div class="banner">You're viewing ${i < ti ? "a past" : "a future"} day. <button class="btn small" data-act="goto-today">Go to today</button></div>`;

  const tasks = tasksFor(i);
  const p = pct(i);
  $view.innerHTML = `
    ${banner}
    <div class="eyebrow">Week ${w.n} · ${esc(w.name)} · Day ${i + 1}</div>
    <h1>${esc(d.title)}</h1>
    <div class="source">${esc(fmtDate(i))} · ${esc(d.source)}</div>
    <div class="bar"><i style="width:${p}%"></i></div>
    <div class="bar-label">${p}% done today</div>

    <h2>The principle</h2>
    <div class="card principle">${esc(d.principle)}</div>

    <h2>Today's missions</h2>
    <div class="card">
      ${tasks.map(t => `
        <div class="task ${t.done ? "done" : ""} ${t.auto ? "auto" : ""}" ${t.auto ? "" : `data-task="${t.id}"`}>
          <div class="box">${t.done ? "✓" : ""}</div><div class="txt">${esc(t.text)}</div>
        </div>`).join("")}
    </div>

    ${d.lines.length ? `
    <h2>Say it better</h2>
    <div class="card">
      ${d.lines.map(l => `<div class="line"><div class="flat">${esc(l.flat)}</div><div class="better">${esc(l.better)}</div></div>`).join("")}
    </div>` : ""}

    <h2>Stranger reps</h2>
    <div class="card counter">
      <div><div class="n">${s.reps}</div><div class="sub">target ${w.target} today</div></div>
      <div class="stepper">
        <button class="btn round" data-act="rep-" aria-label="Remove rep">−</button>
        <button class="btn round primary" data-act="rep+" aria-label="Add rep">+</button>
      </div>
    </div>

    ${d.memo ? `
    <h2>Voice memo fillers</h2>
    <div class="card">
      <input type="number" min="0" inputmode="numeric" id="fillers" value="${s.fillers ?? ""}" placeholder="0">
      <div class="hint">Count every "yeah", "like", "basically", "a couple of", "multiple". Lower is better.</div>
    </div>` : ""}

    <h2>Confidence today</h2>
    <div class="card">
      <div class="scale">${Array.from({ length: 10 }, (_, k) => `<button data-conf="${k + 1}" class="${s.confidence === k + 1 ? "on" : ""}">${k + 1}</button>`).join("")}</div>
      <div class="hint">1 = stuck in my head all day · 10 = fully present, did the scary thing</div>
    </div>

    <h2>Reflection</h2>
    <div class="card">
      <textarea id="reflection" placeholder="${esc(d.reflect)}">${esc(s.reflection)}</textarea>
      <div class="hint">${esc(d.reflect)}</div>
    </div>

    <h2>Fuel</h2>
    <div class="card quote" id="quoteBox">
      <div class="q">“${esc(d.quote.text)}”</div>
      <div class="by">${esc(d.quote.by)}</div>
    </div>
    <button class="btn small" data-act="quote">Another one</button>

    <div class="day-nav">
      ${i > 0 ? `<button class="btn" data-act="prev">← Day ${i}</button>` : "<span></span>"}
      ${i < 20 ? `<button class="btn" data-act="next">Day ${i + 2} →</button>` : "<span></span>"}
    </div>
  `;
}

$view.addEventListener("click", e => {
  const task = e.target.closest("[data-task]");
  if (task) {
    const s = dayState(viewing);
    s.tasks[task.dataset.task] = !s.tasks[task.dataset.task];
    save(); rerenderKeepScroll();
    if (s.tasks[task.dataset.task]) toast(pct(viewing) === 100 ? "Day complete. That's who you are now." : cheer());
    return;
  }
  const conf = e.target.closest("[data-conf]");
  if (conf) {
    dayState(viewing).confidence = +conf.dataset.conf;
    save(); rerenderKeepScroll(); return;
  }
  const act = e.target.closest("[data-act]")?.dataset.act;
  if (!act) return;
  const s = dayState(viewing);
  if (act === "rep+") { s.reps++; save(); rerenderKeepScroll(); toast(cheer()); }
  else if (act === "rep-") { s.reps = Math.max(0, s.reps - 1); save(); rerenderKeepScroll(); }
  else if (act === "prev") { viewing--; render(); }
  else if (act === "next") { viewing++; render(); }
  else if (act === "goto-today") { viewing = todayIndex(); render(); }
  else if (act === "quote") {
    const q = ALL_QUOTES[Math.floor(Math.random() * ALL_QUOTES.length)];
    document.getElementById("quoteBox").innerHTML = `<div class="q">“${esc(q.text)}”</div><div class="by">${esc(q.by)}</div>`;
  }
  else if (act === "open-day") { viewing = +e.target.closest("[data-day]").dataset.day; tab = "today"; render(); }
  else if (act === "export") exportData();
  else if (act === "import") document.getElementById("importFile").click();
  else if (act === "reset") {
    if (confirm("Erase all progress? This can't be undone.")) { state = { days: {} }; save(); render(); }
  }
});

let saveTimer;
$view.addEventListener("input", e => {
  const s = dayState(viewing);
  if (e.target.id === "reflection") s.reflection = e.target.value;
  else if (e.target.id === "fillers") s.fillers = e.target.value === "" ? null : Math.max(0, +e.target.value);
  else return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 300);
});
$view.addEventListener("change", e => {
  if (e.target.id === "reflection" || e.target.id === "fillers") { save(); rerenderKeepScroll(); }
  if (e.target.id === "importFile") importData(e.target.files[0]);
});

function rerenderKeepScroll() {
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
}

// ── Plan view ─────────────────────────────────────────────────────
function renderPlan() {
  const ti = todayIndex();
  $view.innerHTML = WEEKS.map(w => {
    const idx = [0, 1, 2, 3, 4, 5, 6].map(k => (w.n - 1) * 7 + k);
    return `
      <div class="week-head"><b>Week ${w.n}: ${esc(w.name)}</b><span>${esc(w.tagline)}</span></div>
      <div class="grid">
        ${idx.map(i => {
          const p = pct(i);
          const cls = [p === 100 ? "full" : p > 0 ? "part" : "", i === ti ? "today" : ""].join(" ");
          return `<div class="cell ${cls}" data-act="open-day" data-day="${i}">${i + 1}<small>${fmtDate(i, { weekday: "narrow" })}</small></div>`;
        }).join("")}
      </div>
      <div class="plan-list" style="margin-top:10px">
        ${idx.map(i => `
          <div class="card" data-act="open-day" data-day="${i}">
            <div class="source">Day ${i + 1} · ${esc(fmtDate(i))} · ${pct(i)}%</div>
            <div class="t">${esc(DAYS[i].title)}</div>
          </div>`).join("")}
      </div>`;
  }).join("");
}

// ── Toolkit view ──────────────────────────────────────────────────
function renderToolkit() {
  $view.innerHTML = `
    <h1>Toolkit</h1>
    <p class="source">Read before a date, before a hard conversation, or when you want to play a game.</p>
    ${TOOLKIT.map(sec => `
      <h2>${esc(sec.title)}</h2>
      <div class="card tk ${sec.title.includes("dark") ? "dark" : ""}"><ul>${sec.items.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    `).join("")}
  `;
}

// ── Progress view ─────────────────────────────────────────────────
function spark(values, max, label) {
  const pts = values.map((v, i) => v == null ? null : [i, v]).filter(Boolean);
  if (pts.length < 2) return `<div class="hint">Log at least 2 days of ${label} to see the trend.</div>`;
  const W = 300, H = 110, pad = 8;
  const x = i => pad + (i / 20) * (W - pad * 2);
  const y = v => H - pad - (v / max) * (H - pad * 2);
  const d = pts.map(([i, v], k) => `${k ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <line x1="${pad}" x2="${W - pad}" y1="${H - pad}" y2="${H - pad}" stroke="var(--line)"/>
    <path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
    ${pts.map(([i, v]) => `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="var(--accent)"/>`).join("")}
  </svg>`;
}

function renderProgress() {
  const idx = DAYS.map((_, i) => i);
  const done = idx.filter(i => pct(i) === 100).length;
  const reps = idx.reduce((a, i) => a + (state.days[i]?.reps || 0), 0);
  const confs = idx.map(i => state.days[i]?.confidence ?? null);
  const logged = confs.filter(c => c != null);
  const avg = logged.length ? (logged.reduce((a, b) => a + b, 0) / logged.length).toFixed(1) : "–";
  const fills = idx.map(i => DAYS[i].memo ? (state.days[i]?.fillers ?? null) : null);
  const maxFill = Math.max(5, ...fills.filter(f => f != null));
  const refl = idx.filter(i => state.days[i]?.reflection?.trim()).reverse();

  $view.innerHTML = `
    <h1>Progress</h1>
    <div class="stats">
      <div class="stat"><div class="v">${done}/21</div><div class="k">days complete</div></div>
      <div class="stat"><div class="v">${streak()}</div><div class="k">day streak</div></div>
      <div class="stat"><div class="v">${reps}</div><div class="k">stranger reps</div></div>
      <div class="stat"><div class="v">${avg}</div><div class="k">avg confidence</div></div>
    </div>

    <h2>Confidence (1–10)</h2>
    <div class="card">${spark(confs, 10, "confidence")}</div>

    <h2>Memo fillers (lower is better)</h2>
    <div class="card">${spark(fills, maxFill, "memo fillers")}</div>

    <h2>Reflections</h2>
    <div class="card">
      ${refl.length ? refl.map(i => `<div class="log-entry"><div class="d">Day ${i + 1} · ${esc(DAYS[i].title)}</div>${esc(state.days[i].reflection)}</div>`).join("") : `<div class="hint">Your evening reflections show up here.</div>`}
    </div>

    <h2>Backup</h2>
    <div class="card">
      <p class="source">Progress lives only on this device. Export now and then so you don't lose it.</p>
      <div class="row">
        <button class="btn" data-act="export">Export</button>
        <button class="btn" data-act="import">Import</button>
        <button class="btn" data-act="reset" style="color:var(--bad)">Reset</button>
      </div>
      <input type="file" id="importFile" accept="application/json" hidden>
    </div>
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
    state = data; save(); render(); toast("Backup restored");
  }).catch(() => toast("That file isn't a Charm 21 backup"));
}

// ── Boot ──────────────────────────────────────────────────────────
render();
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
