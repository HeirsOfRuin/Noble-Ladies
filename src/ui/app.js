// The screens. Reads the engine (view, houseView, peopleView, newsView,
// planProblem), computes nothing itself.
//
// Patterns every screen keeps (game-building rules):
//  - Empty and locked states say why and what would change them (rule 6).
//  - The game autosaves after every input; a save code moves it anywhere.
//  - A throw never leaves a dead button: busy is released in finally, and the
//    error screen offers the save (Touchline lost a career to a greyed-out Continue).

import { newGame, advance, view, houseView, peopleView, newsView, planProblem, planCost } from '../engine/turn.js';
import { SAVE_KEY, serialize, deserialize, toCode, fromCode } from '../engine/state.js';
import { STORAGE_OK, lsGet, lsSet } from './storage.js';
import { registerSW, installPrompt } from './sw-register.js';
import { dateLabel } from '../engine/clock.js';

const app = document.getElementById('app');
let state = null;
let tab = 'play';
let modal = null;
let busy = false;
let banner = null;
let install = null;
let draft = null;      // { place, actions: [{ id, target, label }] } while planning
let picking = null;    // an action id waiting for its target

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (n) => Number(n).toLocaleString('en-GB');
const signed = (n) => (n > 0 ? `+${num(n)}` : num(n));
const pct = (p) => `${Math.round(p * 100)}%`;
const MULTI = new Set(['gift', 'letter']); // the engine allows these twice, for different people

function save() { if (state) lsSet(SAVE_KEY, serialize(state)); }
function load() {
  const raw = lsGet(SAVE_KEY);
  if (!raw) return null;
  try { return deserialize(raw); } catch (e) { banner = `The saved game could not be read (${e.message}).`; return null; }
}

function freshDraft() {
  return { place: state.place || 'court', actions: [] };
}

// ---- title ----------------------------------------------------------------

function title() {
  const saved = load();
  app.innerHTML = `
    <main class="title">
      <p class="kicker">Paris, 1400 to 1422</p>
      <h1>The Lady of Saint-Pol</h1>
      <p class="lede">You are seventeen, of a middling house, and your father is negotiating your marriage. The king is mad, the princes are quarrelling, and you cannot command anyone. You can only persuade, write, wait, and choose whom to trust.</p>
      ${STORAGE_OK ? '' : '<p class="warn">This browser is refusing to store anything for this page, so progress will not be kept. Open the game in its own tab, or copy a save code from the menu before you leave.</p>'}
      ${banner ? `<p class="warn">${esc(banner)}</p>` : ''}
      <div class="stack">
        ${saved ? `<button class="primary" data-act="continue">Continue <small>${esc(view(saved).date)}</small></button>` : ''}
        <label class="namefield">Her name <input id="lady-name" maxlength="24" value="Marguerite" autocomplete="off" spellcheck="false"></label>
        <button ${saved ? '' : 'class="primary"'} data-act="new">New game</button>
        <button data-act="load-code">Load a save code</button>
        ${install ? '<button data-act="install">Install on this device</button>' : ''}
      </div>
      <p class="hint">A first playable build. Text only; the art comes later.</p>
    </main>`;
}

// ---- frame ----------------------------------------------------------------

function render() {
  if (!state) return title();
  const v = view(state);
  const tabs = [['play', 'Play'], ['house', 'House'], ['people', 'People'], ['news', 'News'], ['menu', 'Menu']];
  const hp = v.health < 30 ? 'low' : '';
  app.innerHTML = `
    <header class="hud">
      <span class="turn">${esc(v.date)}</span>
      <span class="act">Act ${v.act} · age ${v.age}</span>
      <span class="purse ${v.money < 0 ? 'low' : ''}">${num(v.money)} l.</span>
      <span>Name ${v.rep}</span>
      <span class="${hp}">Health ${v.health}</span>
    </header>
    ${banner ? `<p class="banner">${esc(banner)} <button data-act="dismiss">OK</button></p>` : ''}
    <main class="panel">${tab === 'play' ? playTab(v) : tab === 'house' ? houseTab() : tab === 'people' ? peopleTab() : tab === 'news' ? newsTab() : menuTab()}</main>
    <nav class="tabs">${tabs.map(([id, label]) => `<button data-tab="${id}" class="${tab === id ? 'on' : ''}">${label}</button>`).join('')}</nav>
    ${modal ? `<div class="scrim"><div class="sheet">${modal}</div></div>` : ''}`;
}

// ---- play -----------------------------------------------------------------

function choiceButtons(choices) {
  return `<div class="stack">${choices.map((c, i) => `
    <button data-choice="${i}" class="choice" ${c.locked ? 'disabled' : ''}>
      <strong>${esc(c.label)}</strong>
      ${c.note ? `<small>${esc(c.note)}</small>` : ''}
      ${c.locked ? `<span class="stake">${esc(c.why)}</span>` : c.stake ? `<span class="stake">${esc(c.stake)}</span>` : ''}
    </button>`).join('')}</div>`;
}

/** Prose with paragraph breaks; the drop capital goes on the first paragraph only. */
function paras(text, cls = 'prose') {
  return String(text).split(/\n\n+/).map((p, i) => `<p class="${i ? 'para' : cls}">${esc(p)}</p>`).join('');
}

function playTab(v) {
  if (v.over || state.over) return endingView();
  if (v.phase === 'scene') {
    const sc = v.scene;
    return `<p class="kicker">${esc(sc.when)} · Lesson: ${esc(sc.lesson)}</p>
      <blockquote class="governess">${esc(sc.governess)}<cite>Dame Guillemette, your governess</cite></blockquote>
      ${paras(sc.text)}
      ${sc.reports.length ? `<div class="box"><p class="label">What you have been told</p><ul>${sc.reports.map((r) => `<li>${esc(r)}</li>`).join('')}</ul><p class="hint">Reports are only as good as the people who bring them.</p></div>` : ''}
      ${choiceButtons(sc.choices)}`;
  }
  if (v.phase === 'card') {
    const c = v.card;
    if (c.margin) return `<p class="kicker">${esc(c.when || '')}</p>
      <h2>${esc(c.title)}</h2>
      <blockquote class="margin">${esc(c.text)}<cite>${esc(state.lady.name)}, in her own hand</cite></blockquote>
      ${c.lines.length ? `<p class="hint">${esc(c.lines.join(' '))}</p>` : ''}
      ${choiceButtons(c.choices)}`;
    return `<p class="kicker">${esc(c.when || '')}${c.arc ? ` · ${esc(c.arc)}` : ''}${v.cardsLeft > 1 ? ` · ${v.cardsLeft - 1} more after this` : ''}</p>
      <h2 class="${c.history ? 'history' : ''}">${esc(c.title)}</h2>
      ${c.text ? paras(c.text) : ''}
      ${c.lines.length ? `<ul class="lines">${c.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
      ${choiceButtons(c.choices)}`;
  }
  return planView(v);
}

function planView(v) {
  if (!draft) draft = freshDraft();
  const P = v.plan.places.find((p) => p.place === draft.place);
  const problem = planProblem(state, { place: draft.place, actions: draft.actions });
  const left = Math.max(0, state.money) - planCost(state, draft.place, draft.actions);
  const chosen = draft.actions.map((a, i) => `<li>${esc(a.label)} <button class="link" data-unpick="${i}">remove</button></li>`).join('');
  return `
    <p class="kicker">${esc(v.actTitle)} · Paris is ${esc(v.plan.controlLabel)}</p>
    ${v.plan.warnings.length ? `<div class="box warnbox"><p class="label">Talk you have heard lately</p><ul>${v.plan.warnings.map((w) => `<li>${esc(w)}</li>`).join('')}</ul><p class="hint">Some of this is true. The News tab says who told you.</p></div>` : ''}
    <h2>Where will you spend the half-year?</h2>
    <div class="places">${v.plan.places.map((p) => `
      <button data-place="${p.place}" class="place ${draft.place === p.place ? 'on' : ''}">
        <strong>${esc(p.label)}</strong>
        <span class="${p.net < 0 ? 'neg' : 'pos'}">${signed(p.net)} l. before actions</span>
        <small>Rents ${num(p.rents)}${p.pensions ? ` · pensions ${num(p.pensions)}` : ''} · costs ${num(p.cost)}${p.spend ? ` · his spending ${num(p.spend)}` : ''}${p.interest ? ` · interest ${num(p.interest)}` : ''}</small>
        <small>${p.slots} actions. ${esc(p.lines.join(' '))}</small>
      </button>`).join('')}</div>
    <h2>What will you do? <small>${draft.actions.length} of ${P.slots}</small></h2>
    ${chosen ? `<ol class="chosen">${chosen}</ol>` : '<p class="hint">Choose up to ' + P.slots + ' actions below. Most go through someone: their reliability is shown once you have used them.</p>'}
    <div class="stack actions">${P.actions.filter((a) => a.ok || !/^Only/.test(a.why || '')).map((a) => {
      const taken = !a.targets?.length || !MULTI.has(a.id) ? draft.actions.some((x) => x.id === a.id) : false;
      const short = a.ok && !taken && a.cost > left;
      const open = a.ok && !taken && !short && draft.actions.length < P.slots;
      return `
      <button data-pick="${a.id}" ${open ? '' : 'disabled'} class="act">
        <strong>${esc(a.label)}</strong> <span class="cost">${a.cost ? `${num(a.cost)} l.` : 'free'}</span>
        <small>${esc(!a.ok ? a.why : taken ? 'Already in your plan.' : short ? `Costs ${num(a.cost)}; ${num(left)} left after your plan.` : a.note)}</small>
        ${a.via ? `<span class="stake">Through ${esc(a.via.name)} (${esc(a.via.word)})${a.delay ? ` · answer in ${a.delay} half-year${a.delay > 1 ? 's' : ''}` : ''}</span>` : a.delay ? `<span class="stake">Result in ${a.delay} half-year${a.delay > 1 ? 's' : ''}</span>` : ''}
        ${a.chance ? `<span class="stake">${esc(a.chance)}</span>` : ''}
      </button>`; }).join('')}</div>
    <div class="commit">
      ${problem ? `<p class="warn">${esc(problem)}</p>` : ''}
      <button class="primary" data-action="commit" ${problem ? 'disabled' : ''}>End the half-year</button>
    </div>`;
}

function targetSheet(id) {
  const P = view(state).plan.places.find((p) => p.place === draft.place);
  const a = P.actions.find((x) => x.id === id);
  return `<h2>${esc(a.label)}</h2><p class="hint">${esc(a.note)}</p>
    <div class="stack">${a.targets.map((t) => `<button data-target="${esc(t.id)}" ${t.ok ? '' : 'disabled'}><strong>${esc(t.label)}</strong><small>${esc(t.ok ? t.detail : t.why)}</small></button>`).join('')}</div>
    <button data-act="close">Cancel</button>`;
}

function endingView() {
  const e = state.ending;
  const how = { survived: 'She lived to see the end of the reign.', dead: 'Her life ended before the reign did.', ruined: 'The house was ruined.' }[state.outcome];
  return `<p class="kicker">The end · ${esc(how)}</p>
    <h2>${esc(e.grade)}</h2>
    <table class="score">${e.parts.map((p) => `<tr><td>${esc(p.label)}</td><td class="num">${p.n} / ${p.of}</td></tr>`).join('')}
      <tr class="total"><td>Legacy</td><td class="num">${e.total} / 100</td></tr></table>
    <blockquote class="chronicle">${esc(e.epitaph)}</blockquote>
    ${e.lastWords ? `<blockquote class="margin">${esc(e.lastWords)}<cite>${esc(state.lady.name)}</cite></blockquote>` : ''}
    <button class="primary" data-act="new">Begin again</button>`;
}

// ---- house, people, news, menu -------------------------------------------

function bar(n) { return `<span class="bar"><i style="width:${Math.max(0, Math.min(100, n))}%"></i></span>`; }

function houseTab() {
  const h = houseView(state);
  const v = view(state);
  const H = h.husband;
  const traits = H ? Object.entries(H.traits).map(([k, n]) => `${k} ${'●'.repeat(n)}${'○'.repeat(5 - n)}`).join(' · ') : '';
  const counsel = H && v.phase === 'plan' ? `<p class="label">Your counsel to him</p><div class="chips">${Object.entries(h.counselOptions).map(([k, label]) => `<button data-counsel="${k}" class="${h.counsel === k ? 'on' : ''}">${esc(label)}</button>`).join('')}</div><p class="hint">Counsel travels by letter: write to him (an action) and he may take it. He listens ${esc(H.heed)}.</p>` : '';
  const W = h.want;
  return `<h2>${esc(h.lady.title)}</h2>
    ${h.said.length ? `<p class="said">What is said of her: <em>${esc(h.said.join(', '))}</em>.</p>` : '<p class="hint">Nobody has made up their mind about her yet. Her choices will.</p>'}
    ${W ? `<div class="box ${W.achieved ? 'done' : ''}"><p class="label">What you want: ${esc(W.label)}</p><p>${esc(W.goal)}</p><p class="small">${esc(W.progress)}${W.achieved ? ' <b>Achieved.</b>' : ''}</p></div>` : ''}
    <div class="box"><p class="label">Brécourt</p><p class="small">${esc(h.brecourt)}</p></div>
    <p>Age ${h.age}. ${h.lands} holding${h.lands === 1 ? '' : 's'}${h.landsStart ? ` of the ${h.landsStart} the house began with` : ''}.${h.pregnant ? ' You are with child.' : ''}</p>
    <table class="stats">
      <tr><td>Good name</td><td>${bar(v.rep)}</td><td class="num">${v.rep}</td></tr>
      <tr><td>Information</td><td>${bar(v.info)}</td><td class="num">${v.info}</td></tr>
      <tr><td>Household</td><td>${bar(v.hh)}</td><td class="num">${v.hh}</td></tr>
      <tr><td>Health</td><td>${bar(v.health)}</td><td class="num">${v.health}</td></tr>
      <tr><td>Queen's favour</td><td>${bar(v.fav.queen)}</td><td class="num">${v.fav.queen}</td></tr>
      <tr><td>${esc(h.exposure[0].label)} favour</td><td>${bar(v.fav.arm)}</td><td class="num">${v.fav.arm}</td></tr>
      <tr><td>Burgundy favour</td><td>${bar(v.fav.bur)}</td><td class="num">${v.fav.bur}</td></tr>
    </table>
    <div class="box"><p class="label">If Paris changed hands tomorrow</p>
      <ul>${h.exposure.map((x) => `<li>To ${esc(x.label)} you are ${esc(x.word)}.</li>`).join('')}</ul>
      ${h.hedging ? '<p class="warn">You stand well with both parties. Either can find that out.</p>' : ''}
      <p class="hint">Ties to the losing side bring fines and confiscation; ties to the winners bring rewards. Being on your estates when it happens halves the cost.</p></div>
    <h2>Your husband</h2>
    ${H ? `<p><strong>${esc(H.name)}</strong>. ${esc({ present: 'At home with you.', away: 'Away with the army.', captured: 'A prisoner in England.', dead: 'Dead.' }[H.status])} His party: ${esc(H.lean)}. ${esc(h.regard || '')}</p><p class="small">${traits}</p>
      ${H.ransom ? `<p class="warn">Ransom: ${num(H.ransom.paid)} of ${num(H.ransom.total)} l. paid.</p>` : ''}${counsel}`
      : h.widowed ? '<p>You are a widow, and govern your own affairs: one more action each half-year.</p>' : '<p class="empty">Not yet married.</p>'}
    <h2>Children</h2>
    ${h.children.length ? `<ul class="kids">${h.children.map((c) => `<li>${esc(c.name)}, ${c.sex}${c.alive ? `, ${c.age || 'under one'}${c.age ? ' years' : ''}${c.betrothed ? ` · promised to ${esc(c.betrothed.name)}` : ''}${c.risk ? ` · sickness risk ${pct(c.risk)} this half-year` : ''}` : ' (died)'}</li>`).join('')}</ul>` : '<p class="empty">No children yet. They come while your husband is at home with you.</p>'}
    ${h.pregnant ? `<p class="hint">Risk in childbed: ${pct(h.birthRisk.estates)} on the estates, ${pct(h.birthRisk.court)} at court. Rest and good health lower it.</p>` : ''}
    <h2>Income</h2>
    ${h.pensions.length ? `<ul>${h.pensions.map((p) => `<li>${esc(p.from)}: ${num(p.amount)} l. a half-year${p.paying ? '' : ' (not paying while the other party holds Paris)'}</li>`).join('')}</ul>` : '<p class="empty">No pensions. Petition a patron at court for one.</p>'}
    ${h.cause ? `<p class="warn">Before the Parlement: ${h.cause.holdings} holding${h.cause.holdings > 1 ? 's' : ''} (${esc(h.cause.kind)}), ${h.cause.progress} of 3 hearings.</p>` : ''}
    ${h.score ? `<h2>Legacy so far</h2><table class="score">${h.score.parts.map((p) => `<tr><td>${esc(p.label)}</td><td class="num">${p.n} / ${p.of}</td></tr>`).join('')}<tr class="total"><td>${esc(h.score.grade)}</td><td class="num">${h.score.total}</td></tr></table>` : ''}
    <h2>Ledger</h2>${ledger()}`;
}

function ledger() {
  const rows = state.ledger.slice(-25).reverse();
  if (!rows.length) return '<p class="empty">Nothing yet: from your wedding on, every livre in or out appears here.</p>';
  return `<table class="ledger">${rows.map((r) => `<tr><td>${esc(dateLabel(r.turn))}</td><td>${esc(r.reason)}</td><td class="num">${signed(r.amount)}</td></tr>`).join('')}</table>`;
}

function peopleTab() {
  const ps = peopleView(state);
  const row = (p) => `<li class="person ${p.alive ? '' : 'gone'}">
      <strong>${esc(p.name)}</strong> <small>${esc(p.role)} · ${esc(p.faction)}${p.real ? ' · historical' : ''}</small>
      ${p.alive ? `<div class="pair"><span>Trusts you ${bar(p.trust)}</span><span>Needs you ${bar(p.use)}</span></div><small>As a go-between: ${esc(p.word)}.${p.onBoard ? '' : ' Not yet at court.'}</small>` : `<small>${esc(p.goneHow || 'gone')}.</small>`}
      <p class="small">${esc(p.note)}</p></li>`;
  return `<h2>People</h2><p class="hint">Trust: does this person believe you. Need: do you matter to them. Reliability shows once you have used someone twice.</p><ul class="people">${ps.map(row).join('')}</ul>`;
}

function newsTab() {
  const ns = newsView(state);
  if (!ns.length) return '<h2>News</h2><p class="empty">Nothing yet. News comes to you at court, through gossip, and in letters. On the estates it comes late, if at all.</p>';
  return `<h2>News and rumour</h2><p class="hint">What you have heard, who told you, and how reliable they have proved.</p>
    <ul class="news">${ns.map((n) => `<li><small>${esc(n.date)} · ${esc(n.from)} (${esc(n.word)})${n.status === 'true' ? ' · <b>came true</b>' : n.status === 'false' ? ' · came to nothing' : ''}</small><p>${esc(n.text)}</p></li>`).join('')}</ul>`;
}

function menuTab() {
  return `<h2>Menu</h2><div class="stack">
    <button data-act="export">Copy a save code</button>
    <button data-act="load-code">Load a save code</button>
    <button data-act="quit">Back to the title</button>
  </div>
  <h2>How it works</h2>
  <ul class="small">
    <li>Each turn is half a year. Choose court or your estates, then two or three actions.</li>
    <li>Almost everything goes through someone: a patron's household, your steward, your chamberwoman, your procureur. They can be slow, careless or false.</li>
    <li>History is fixed. When Paris changes hands, your ties to each side decide what it costs you. Warnings come first, mixed with false ones.</li>
    <li>The game ends in October 1422, or earlier if you die or are ruined. Your legacy is your house's lands, your children and their matches, your good name, your wealth and your own fate.</li>
  </ul>
  <p class="hint">Saves live in this browser on this device. A save code moves a game anywhere.</p>`;
}

function report(r) {
  const acct = Object.entries(r.account || {});
  return `<h2>${esc(r.date)}</h2>
    ${r.lines.length ? `<ul class="lines">${r.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
    ${acct.length ? `<table class="ledger">${acct.map(([k, n]) => `<tr><td>${esc(k)}</td><td class="num">${signed(n)}</td></tr>`).join('')}</table>` : ''}
    <p>Purse: ${num(r.money)} livres.</p>
    <button class="primary" data-act="close">Continue</button>`;
}

function fail(err) {
  console.error(err);
  modal = `<h2>Something went wrong</h2>
    <p>${esc(err?.message || err)}</p>
    <p>Your game was saved before this. Copy this code somewhere safe, then reload:</p>
    <textarea readonly rows="4">${state ? esc(toCode(state)) : ''}</textarea>
    <button class="primary" data-act="close">Close</button>`;
  render();
}

function step(input) {
  const { state: next, record } = advance(state, input);
  state = next;
  save();
  return record;
}

app.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act],[data-tab],[data-action],[data-choice],[data-place],[data-pick],[data-unpick],[data-target],[data-counsel]');
  if (!t || busy) return;
  busy = true;
  try {
    const d = t.dataset;
    if (d.tab) { tab = d.tab; }
    else if (d.choice !== undefined) { step({ type: state.phase === 'scene' ? 'scene' : 'card', choice: Number(d.choice) }); draft = null; }
    else if (d.place) { draft = { place: d.place, actions: draft.actions.filter((a) => view(state).plan.places.find((p) => p.place === d.place).actions.find((x) => x.id === a.id)?.ok) }; }
    else if (d.pick) {
      const P = view(state).plan.places.find((p) => p.place === draft.place);
      const a = P.actions.find((x) => x.id === d.pick);
      if (a.targets) { picking = a.id; modal = targetSheet(a.id); }
      else draft.actions.push({ id: a.id, label: a.label });
    }
    else if (d.target !== undefined) {
      const P = view(state).plan.places.find((p) => p.place === draft.place);
      const a = P.actions.find((x) => x.id === picking);
      const tg = a.targets.find((x) => x.id === d.target);
      draft.actions.push({ id: picking, target: d.target, label: `${a.label}: ${tg.label}` });
      picking = null; modal = null;
    }
    else if (d.unpick !== undefined) { draft.actions.splice(Number(d.unpick), 1); }
    else if (d.counsel) { step({ type: 'counsel', value: d.counsel }); }
    else if (d.action === 'commit') {
      const record = step({ type: 'plan', place: draft.place, actions: draft.actions.map(({ id, target }) => ({ id, target })) });
      draft = null; tab = 'play';
      modal = report(record);
    } else {
      const act = d.act;
      if (act === 'new') { const name = document.getElementById('lady-name')?.value; state = newGame({ seed: (Math.random() * 2 ** 31) >>> 0, name }); tab = 'play'; modal = null; draft = null; save(); }
      else if (act === 'continue') { state = load(); draft = null; }
      else if (act === 'close') { modal = null; picking = null; }
      else if (act === 'dismiss') { banner = null; }
      else if (act === 'quit') { state = null; modal = null; draft = null; }
      else if (act === 'install') { install?.(); }
      else if (act === 'export') { modal = `<h2>Save code</h2><textarea readonly rows="5">${esc(toCode(state))}</textarea><button class="primary" data-act="close">Done</button>`; }
      else if (act === 'load-code') {
        const code = prompt('Paste a save code');
        if (code) { try { state = fromCode(code); save(); tab = 'play'; modal = null; draft = null; } catch (err) { banner = err.message; } }
      }
    }
    render();
    if (d.tab || d.action || d.choice !== undefined) window.scrollTo(0, 0);
  } catch (err) { fail(err); } finally { busy = false; }
});

addEventListener('error', (e) => fail(e.error || e.message));
addEventListener('unhandledrejection', (e) => fail(e.reason));

installPrompt((go) => { install = go; if (!state) title(); });
render();
registerSW({ onUpdate: (reload) => { banner = 'A new version is ready.'; modal = null; render(); app.querySelector('.banner')?.insertAdjacentHTML('beforeend', ' <button data-act="reload-now">Reload</button>'); app.querySelector('[data-act="reload-now"]')?.addEventListener('click', reload); } });

// For tools/smoke.mjs and tools/check-bundle.mjs: read-only access to the game.
globalThis.__game = { get state() { return state; } };
