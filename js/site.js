// Pteronautics: the umbrella site for Atlas, Works and Loom.
//
// The live figures come straight from the programs, which GitHub Pages serves beside this site on the same
// origin (…/pteronautics-atlas/, …/pteronautics-works/ and …/pteronautics-loom/). They are imported (or, for Loom,
// framed) at run time, so this page always shows the programs as they are; if one cannot be reached (or a module
// moves), its figures fall back to text and every link still works. To run locally, serve the folder that holds
// all four repositories (see README).

const ATLAS = new URL('../pteronautics-atlas/', document.baseURI).href;
const WORKS = new URL('../pteronautics-works/', document.baseURI).href;
const LOOM = new URL('../pteronautics-loom/', document.baseURI).href;
const $ = sel => document.querySelector(sel);

// ---------------------------------------------------------------- tiny DOM helpers (no dependency on either program)
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}
const fx = (v, d = 1) => (typeof v === 'number' && isFinite(v) ? v.toFixed(d) : '—');
const minus = s => String(s).replace(/^-/, '−');
const fsig = (v, n = 3) => (typeof v === 'number' && isFinite(v) ? +v.toPrecision(n) + '' : '—');

// ---------------------------------------------------------------- brand and theme (same behaviour as Atlas and Works)
const BRAND_SVG = `<svg viewBox="0 4 100 100" aria-hidden="true">
<path class="bm-fill" d="M50 10 L54 24 L53 36 C62 35 70 33 78 31 C86 36 92 44 96 54 C80 52 68 56 60 66 L56 76 L50 70 L44 76 L40 66 C32 56 20 52 4 54 C8 44 14 36 22 31 C30 33 38 35 47 36 L46 24 Z"/>
<path class="bm-line" d="M50 10 L54 24 L53 36 C62 35 70 33 78 31 C86 36 92 44 96 54 C80 52 68 56 60 66 L56 76 L50 70 L44 76 L40 66 C32 56 20 52 4 54 C8 44 14 36 22 31 C30 33 38 35 47 36 L46 24 Z"/>
<path class="bm-line" d="M50 72 L50 84"/><path class="bm-flame" d="M50 82 L54 89 L50 97 L46 89 Z"/></svg>`;
for (const el of document.querySelectorAll('[data-brand]')) el.innerHTML = BRAND_SVG;

const THEME_KEY = 'pteronautics-theme';
const resolved = () => { const t = document.documentElement.dataset.theme; return t === 'light' || t === 'dark' ? t : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; };
const ICON = { sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2 V4 M12 20 V22 M2 12 H4 M20 12 H22 M4.9 4.9 L6.3 6.3 M17.7 17.7 L19.1 19.1 M4.9 19.1 L6.3 17.7 M17.7 6.3 L19.1 4.9"/>', moon: '<path d="M20 14.5 A8 8 0 1 1 9.5 4 A6.5 6.5 0 0 0 20 14.5 Z"/>' };
const themeBtn = $('[data-theme-btn]');
function applyTheme() {
  document.documentElement.dataset.resolvedTheme = resolved();
  const dark = resolved() === 'dark';
  themeBtn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[dark ? 'sun' : 'moon']}</svg>`;
  themeBtn.title = themeBtn.ariaLabel = dark ? 'Switch to the light theme' : 'Switch to the dark theme';
  dispatchEvent(new Event('themechange'));
}
themeBtn.addEventListener('click', () => {
  const t = resolved() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(THEME_KEY, t); } catch { }
  applyTheme();
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
applyTheme();

const whenVisible = (el, fn) => {
  if (typeof IntersectionObserver === 'undefined') return fn();
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: '400px' });
  io.observe(el);
};
const fallback = (el, text) => el && el.replaceChildren(h('div', { class: 's-ph' }, text));

// ---------------------------------------------------------------- Atlas: the tools, with Atlas's own preview drawings
// (titles and one-line summaries follow the Atlas home page; the drawings are imported live from Atlas)
const ATLAS_TOOLS = [
  ['Aerodynamics', [
    ['airfoil', 'Airfoil Lab', 'Viscous airfoil analysis with live pressure, streamlines, boundary layer, transition and stall.'],
    ['wings', 'Wings & 3D Aero', 'Lift across the span, tip vortices and induced drag, and where a wing stalls first.'],
    ['compressible', 'Shocks & Nozzles', 'Shocks, expansion fans and nozzles you can see, down to Mach diamonds in the plume.'],
    ['cfd', 'Fluid Flow Sandbox', 'Real-time 2-D viscous flow on your GPU: draw obstacles and drag them through the fluid.']]],
  ['Propulsion', [
    ['cycles', 'Thermodynamic Cycles', 'Otto, Diesel, Brayton and pulse cycles, in a running cylinder or a gas turbine.'],
    ['rocket', 'Rocket Engines', 'Size a liquid engine from a thrust requirement, burn a solid grain back, stage a launcher.'],
    ['turbine', 'Jet Engine Cycles', 'Turbojets to scramjets station by station, with a cut-away and a T–s diagram.'],
    ['heat', 'Heat Transfer', 'Layered walls, convection correlations, and radiation from the Planck spectrum to shields.'],
    ['rotors', 'Propellers & Rotors', 'Blade element momentum theory, helicopter power and autorotation, multirotor endurance.']]],
  ['Structures', [
    ['structures', 'Structures Workbench', 'Free-body diagrams, frames and trusses, 2-D FEA, sections, vibration and buckling.'],
    ['materials', 'Fatigue & Composites', 'Crack growth cycle by cycle, and laminates built ply by ply.', 'planned']]],
  ['Flight & space', [
    ['flight', 'Flight & Atmosphere', 'The standard atmosphere, performance, the envelope and stability for five aircraft.'],
    ['gnc', 'Guidance & Navigation', 'Control loops, fly-by-wire, autopilots, navigation and INS/GNSS filtering.'],
    ['orbits', 'Orbital Mechanics', 'The six elements in 3D, transfers, ground tracks and Δv budgets from the pad to Mars.'],
    ['launch', 'Launch & Reentry', 'Stage a rocket to orbit through max-Q, then bring a capsule home.', 'planned'],
    ['spacecraft', 'Spacecraft Systems', 'Pointing, thermal balance, and power and link budgets.', 'planned']]],
  ['Reference', [
    ['formulas', 'Formula Library', 'Aerospace formulas you can solve for any variable, with a plot and units.']]],
];
{
  // one grid: the two foundational tools wide, the other twelve in rows of four, then the planned tools
  const box = $('[data-atlas-tools]');
  const live = ATLAS_TOOLS.flatMap(([group, tools]) => tools.filter(t => !t[3]).map(t => [group, ...t]));
  const planned = ATLAS_TOOLS.flatMap(([group, tools]) => tools.filter(t => t[3]).map(t => [group, ...t]));
  const WIDE = new Set(['airfoil', 'wings']);
  const card = (PREVIEWS, [group, id, title, blurb, status]) => {
    const art = PREVIEWS && PREVIEWS[id] ? (() => { try { return PREVIEWS[id](); } catch { return ''; } })() : '';
    const inner = [h('div', { class: 'card-preview', html: art }),
      h('div', { class: 'm-body' }, h('span', { class: 'm-group' }, group), h('div', { class: 'm-title' }, h('b', {}, title), status ? h('span', { class: 'tag' }, status) : null), h('span', {}, blurb))];
    return status ? h('div', { class: 'm-card pnl dim' }, ...inner) : h('a', { class: 'm-card pnl' + (WIDE.has(id) ? ' wide' : ''), href: `${ATLAS}#/${id}` }, ...inner);
  };
  const paint = (PREVIEWS = null) => box.replaceChildren(
    h('div', { class: 's-tools' }, live.map(t => card(PREVIEWS, t))),
    h('div', { class: 's-group-head' }, h('h3', {}, 'Coming next to Atlas')),
    h('div', { class: 's-tools planned' }, planned.map(t => card(PREVIEWS, t))));
  paint();
  import(ATLAS + 'js/previews.js').then(m => paint(m.PREVIEWS)).catch(() => { });
}

// ---------------------------------------------------------------- Works: hero, coupling demo and the airfoil solver
async function loadWorks() {
  const [dom, graph, fw, seeds, vehicle, v3d, planform, gview, lab, client, airfoil] = await Promise.all([
    'src/ui/dom.js', 'src/engine/graph.js', 'src/analyses/fixedWing.js', 'src/model/seeds.js', 'src/model/vehicle.js',
    'src/ui/view3d.js', 'src/ui/planform.js', 'src/ui/graphView.js', 'src/ui/airfoilLab.js', 'src/workers/client.js', 'src/adapters/airfoil.js',
  ].map(p => import(WORKS + p)));
  return { dom, ...graph, ...fw, ...seeds, ...vehicle, ...v3d, ...planform, ...gview, ...lab, ...client, ...airfoil };
}

loadWorks().then(W => {
  const outputsOf = g => { const o = {}; for (const id of g.order) o[id] = g.outputs(id); return o; };
  const base = W.kestrel(), g0 = new W.CouplingGraph(W.fixedWingNodes()); g0.runSync(base);
  const ref = outputsOf(g0);

  // ---- hero: Kestrel in 3D with its live numbers, and an Atlas drawing beside it ----
  {
    const holder = $('[data-hero3d]'), cam = { ...W.defaultCamera(), yaw: -128, pitch: 20 };
    const view = W.mountView3d(holder, base, ref, { clmap: true, load: true, cg: false }, cam, { chrome: false, autoRotate: true });
    addEventListener('themechange', () => view.redraw());
    new ResizeObserver(() => view.redraw()).observe(holder);
    const p = ref.performance, st = ref.stability;
    const chip = (label, value, unit) => h('div', { class: 's-chip' }, h('span', {}, label), h('b', {}, value, unit ? h('small', {}, unit) : null));
    $('[data-hero-chips]').replaceChildren(chip('L/D max', fx(p.LDmax, 1)), chip('Endurance', fx(p.endurance, 0), 'min'), chip('Static margin', minus(fx(st.SM, 1)), '% MAC'));
  }

  // ---- the coupling demo ----
  {
    const doc = W.clone(base), graph = new W.CouplingGraph(W.fixedWingNodes());
    graph.runSync(doc);
    const ctl = $('[data-demo-controls]'), view = $('[data-demo-view]'), gbox = $('[data-demo-graph]'), ghead = $('[data-demo-graph-head]'), stats = $('[data-demo-stats]');
    const w = W.firstOf(doc, 'wing'), bat = W.firstOf(doc, 'battery');
    const SLIDERS = [
      { path: `${w.id}.span`, label: 'Wing span', unit: 'm', min: 2.4, max: 4.0, step: 0.02, get: () => w.span, note: 'Span: geometry → aero and mass → stability, performance, requirements.' },
      { path: `${w.id}.sweep`, label: 'Wing sweep', unit: '°', min: -5, max: 25, step: 0.5, get: () => w.sweep, note: 'Sweep: geometry → aero → stability and performance.' },
      { path: `${bat.id}.x`, label: 'Battery position', unit: 'm', min: 0.3, max: 1.0, step: 0.01, get: () => bat.x, note: 'Battery position: only mass and what follows it. Geometry and aero stay current.' },
      { path: 'mission.cruiseSpeed', label: 'Cruise speed', unit: 'm/s', min: 16, max: 34, step: 0.5, get: () => doc.mission.cruiseSpeed, note: 'Cruise speed: sections and aero, then stability and performance.' },
    ];
    const slow = () => new Promise(r => setTimeout(r, 55));
    const note = h('div', { class: 's-demo-note' }, 'Drag a slider and watch the graph go stale and recompute.');
    function edit(path, value) { graph.invalidate(W.applyEdit(doc, path, value)); graph.run(doc, { yield: slow }); }
    function reset() {
      const fresh = W.kestrel();
      for (const c of doc.components) Object.assign(c, fresh.components.find(x => x.id === c.id));
      Object.assign(doc.mission, fresh.mission);
      graph.invalidateAll(); SLIDERS.forEach(sl => sl.sync()); graph.run(doc, { yield: slow });
    }
    ctl.replaceChildren(h('div', { class: 'sec-row' }, h('span', { class: 'sec' }, 'Edit Kestrel'), h('button', { class: 'tg sm', type: 'button', onclick: reset }, 'Reset')),
      ...SLIDERS.map(sl => {
        const out = h('b', { class: 'mono' }), r = h('input', { type: 'range', min: sl.min, max: sl.max, step: sl.step, 'aria-label': sl.label });
        const fill = () => { r.style.setProperty('--fill', ((+r.value - sl.min) / (sl.max - sl.min) * 100) + '%'); out.textContent = `${fsig(+r.value, 3)} ${sl.unit}`; };
        sl.sync = () => { r.value = sl.get(); fill(); };
        r.addEventListener('input', () => { fill(); edit(sl.path, +r.value); note.textContent = sl.note; });
        sl.sync();
        return h('label', { class: 's-slider' }, h('span', {}, sl.label, out), r);
      }), note, h('a', { class: 's-link', href: WORKS + '#/v/kestrel' }, 'Open Kestrel in Works →'));
    const paintGraph = () => { const sm = W.graphSummary(graph); ghead.className = sm.cls; ghead.textContent = sm.text; gbox.replaceChildren(W.graphSvg(graph)); };
    const paintView = () => { try { view.replaceChildren(W.vehicleView(doc, outputsOf(graph), { clmap: true, load: true, mac: false, cg: true, items: false }, { w: view.clientWidth || 520, h: view.clientHeight || 420 }).svg); } catch { } };
    const paintStats = () => {
      const o = outputsOf(graph), p = o.performance, st = o.stability, m = o.mass, rq = o.requirements;
      const delta = (v, r, d, good) => { if (!isFinite(v) || !isFinite(r) || Math.abs(v - r) < 10 ** -d / 2) return h('span', { class: 'stat-s' }, 'as designed'); const up = v > r; return h('span', { class: 'stat-s ' + (up === good ? 'good' : 'bad') }, `${up ? '▲' : '▼'} ${fx(Math.abs(v - r), d)} from the design`); };
      const card = (l, v, u, d) => h('div', { class: 'stat' }, h('span', { class: 'stat-l' }, l), h('span', { class: 'stat-v' }, v, u ? h('small', {}, u) : null), d);
      stats.replaceChildren(
        card('Lift-to-drag, max', fx(p?.LDmax, 1), '', delta(p?.LDmax, ref.performance.LDmax, 1, true)),
        card('Endurance', fx(p?.endurance, 0), 'min', delta(p?.endurance, ref.performance.endurance, 0, true)),
        card('Stall speed', fx(p?.Vs, 1), 'm/s', delta(p?.Vs, ref.performance.Vs, 1, false)),
        card('Static margin', st ? minus(fx(st.SM, 1)) : '—', '% MAC', st ? h('span', { class: 'stat-s' + (st.SM < 5 || st.SM > 20 ? ' bad' : '') }, st.SM < 0 ? 'unstable: CG behind the NP' : st.SM < 5 ? 'below the 5% minimum' : st.SM > 20 ? 'above the 20% maximum' : 'within 5–20%') : null),
        card('Takeoff mass', fx(m?.total, 2), 'kg', delta(m?.total, ref.mass.total, 2, false)),
        card('Requirements met', rq ? `${rq.met} / ${rq.total}` : '—', '', h('span', { class: 'stat-s' }, rq ? `${rq.marginal} marginal · ${rq.failing} failing` : '')));
    };
    graph.on(ev => { paintGraph(); if (ev.done) { paintView(); paintStats(); } });
    paintGraph(); paintStats(); requestAnimationFrame(paintView);
    let lastW = 0;
    new ResizeObserver(() => { if (Math.abs(view.clientWidth - lastW) > 4) { lastW = view.clientWidth; paintView(); } }).observe(view);
    addEventListener('themechange', paintView);
  }

  // ---- the shared airfoil solver at Kestrel's mid-semispan ----
  {
    const g = ref.geometry, atm = ref.atmosphere.cruise, eta = 0.45, c = g.P.chord(eta), V = base.mission.cruiseSpeed;
    let near = null; for (const p of ref.aero.spanLoad(ref.stability.CLtrim)) if (!near || Math.abs(p.eta - eta) < Math.abs(near.eta - eta)) near = p;
    const op = { code: String(g.wing.rootAirfoil), mode: 'cl', cl: +near.cl.toFixed(3), Re: Math.round(atm.rho * V * c / atm.mu / 1000) * 1000, Ma: +(V / atm.a).toFixed(3), ncrit: 9, viscous: true, npanel: W.NPANEL };
    const cpBox = $('[data-lab-cp]'), blBox = $('[data-lab-bl]'), cap = $('[data-lab-caption]');
    let res = null;
    const paint = () => {
      if (!res) return;
      cpBox.replaceChildren(h('h4', {}, 'Pressure and boundary layer', h('span', { class: 'sub' }, '−Cp against x/c')), W.cpView(res));
      blBox.replaceChildren(h('h4', {}, 'Boundary layer on the section', h('span', { class: 'sub' }, 'displacement thickness × 8')), W.blStrip(res, 640, 190));
    };
    whenVisible(cpBox, () => new W.AirfoilWorker().point(op).then(r => {
      res = r; paint();
      const tr = r.transition || [];
      cap.textContent = `NACA ${op.code} at η ${eta}: chord ${fx(c * 1000, 0)} mm, Re ${fx(op.Re / 1e6, 2)} M, cℓ ${fx(r.coef.cl, 2)} at α ${minus(fx(r.alpha, 1))}°; cd ${fx(r.coef.cd, 4)}, upper transition at ${tr[1]?.x != null ? fx(tr[1].x, 2) + 'c' : '—'}. Solved on this page in ${fx(r.timeMs, 0)} ms.`;
    }).catch(e => { fallback(cpBox, 'The solver could not run here.'); fallback(blBox, e.message); cap.textContent = ''; }));
    addEventListener('themechange', paint);
  }
}).catch(err => {
  // Works could not be loaded: keep the page whole, with the links
  console.warn('Pteronautics: the live figures from Works are unavailable', err);
  $('[data-hero3d]').replaceChildren(h('div', { class: 's-hero-off' }, h('span', { 'data-brand': '', class: 'brand-mark big', html: BRAND_SVG }), h('p', {}, 'The live 3D view loads from Works.'), h('a', { class: 'btn', href: WORKS + '' }, 'Open Works →')));
  $('[data-hero-caption]').textContent = 'Kestrel, the sample aircraft in Works.';
  $('[data-demo]').replaceChildren(h('div', { class: 's-ph wide' }, 'The interactive demo loads from Works, which could not be reached just now. ', h('a', { href: WORKS + '#/v/kestrel' }, 'Open Kestrel in Works →')));
  fallback($('[data-lab-cp]'), 'The airfoil solver loads from Works.'); fallback($('[data-lab-bl]'), 'Not available just now.');
  $('[data-lab-caption]').textContent = '';
});

// ---- an Atlas drawing floats in the hero beside the Works aircraft ----
import(ATLAS + 'js/previews.js').then(({ PREVIEWS }) => {
  const el = $('[data-hero-atlas]'); if (!PREVIEWS.airfoil) return;
  el.replaceChildren(h('a', { class: 'm-card s-hero-card', href: `${ATLAS}#/airfoil`, 'aria-hidden': null },
    h('div', { class: 'card-preview', html: PREVIEWS.airfoil() }), h('span', {}, h('b', {}, 'Atlas'), ' · Airfoil Lab')));
}).catch(() => { });

// ---------------------------------------------------------------- Loom: the CubeSat sample, live in a frame
// Loom's embed page builds a sample model and shows one of its views, read-only (pan, zoom, select). It is drawn
// by Loom with Loom's own styles, so it sits in a frame; the tabs choose the view, and the frame follows the
// site's theme.
{
  const box = $('[data-loom]'), tabs = $('[data-loom-tabs]'), frameBox = $('[data-loom-frame]'), cap = $('[data-loom-caption]');
  const VIEWS = [
    ['v:home', 'Systems V', 'The Systems V: how far each stage is, from stakeholder needs down to the parts and back up through verification.'],
    ['Power system structure', 'Blocks', 'A block definition diagram: the spacecraft, its electrical power system and what they are made of.'],
    ['Power flow', 'Activity', 'An activity diagram: harvesting, storing and regulating power, in swimlanes for the blocks that do each step.'],
    ['Energy budget', 'Equations', 'A parametric diagram: the orbit-average power, solved live and checked against its 7 W requirement.'],
    ['Power requirements', 'Requirements', 'A requirement diagram: what satisfies each requirement and which test verifies it.'],
    ['Power modes', 'States', 'A state machine: the power system\'s safe, sunlit and eclipse modes.'],
  ];
  let frame = null, current = '';
  const src = (view) => `${LOOM}embed.html?sample=cubesat&view=${encodeURIComponent(view)}&theme=${resolved()}`;
  const show = (view) => {
    current = view;
    for (const b of tabs.querySelectorAll('button')) b.setAttribute('aria-selected', String(b.dataset.view === view));
    const v = VIEWS.find(x => x[0] === view);
    if (!frame) {
      frame = h('iframe', { title: 'A live view of the CubeSat sample in Pteronautics Loom', loading: 'lazy', src: src(view) });
      frame.addEventListener('load', () => frameBox.querySelector('.s-ph')?.remove());
      frameBox.append(frame);
    } else frame.src = src(view);
    cap.textContent = `${v ? v[2] : ''} The CubeSat power system sample, running in Loom: drag to pan, scroll to zoom.`;
  };
  if (box) {
    tabs.replaceChildren(...VIEWS.map(([view, label]) => h('button', { type: 'button', role: 'tab', 'data-view': view, 'aria-selected': 'false', onclick: () => show(view) }, label)));
    whenVisible(box, () => {
      // only frame Loom when it is there; otherwise keep the link
      fetch(LOOM + 'embed.html', { method: 'HEAD' }).then(r => { if (!r.ok) throw new Error(String(r.status)); show(VIEWS[0][0]); })
        .catch(() => { fallback(frameBox, 'The live model loads from Loom, which could not be reached just now.'); tabs.hidden = true; cap.textContent = ''; });
    });
    addEventListener('themechange', () => { frame?.contentWindow?.postMessage({ theme: resolved() }, location.origin); });
  }
}
