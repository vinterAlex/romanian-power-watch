'use strict';

const DATA_DIR = 'data';
const MANIFEST = `${DATA_DIR}/files.json`;

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">' +
    '<rect width="640" height="360" fill="#1d1d29"/>' +
    '<text x="320" y="190" font-family="sans-serif" font-size="34" fill="#4a4a5c" text-anchor="middle">no image</text></svg>'
  );

let PEOPLE = [];
let lang = 'en';
const state = { query: '', status: 'all', party: 'all', sort: 'hierarchy' };

/* ---------------- i18n (UI strings) ---------------- */
const I18N = {
  en: {
    kicker: 'Documents the crimes · the damage · the money',
    subtitle: 'Documented corruption & abuse-of-power record of Romania\'s political leadership — 12 figures who held or influence power, reconstructed from real sources. Last verified: 9 Nov 2026.',
    statsNote: 'Money = sums referenced in the tracked cases (public funds at stake, damages cited by prosecutors, costs imposed on the population) — NOT proven stolen amounts.',
    searchPh: '🔍  Search names, cases, topics…',
    noResults: 'No figure matches your filters.',
    close: 'Close',
    sortHierarchy: 'Sort: hierarchy of power (President first)',
    sortSeverity: 'Sort: highest severity first',
    sortMoney: 'Sort: most money involved first',
    sortCases: 'Sort: most documented cases first',
    sortName: 'Sort: alphabetical',
    filterAll: 'All statuses',
    status_in_power: 'In power',
    status_former: 'Former',
    status_convicted: 'Convicted',
    severity: 'Severity',
    casesCount: 'cases documented',
    moneyInvolved: 'money tracked',
    openDossier: 'Open full dossier',
    statFigures: 'figures tracked',
    statCases: 'documented cases',
    statMoney: 'public money in tracked cases',
    statFlagged: 'convicted or under investigation',
    statInPower: 'currently holding power',
    impactLabel: 'Impact on the population',
    tabDossiers: 'Dossiers (hierarchy of power)',
    tabNetwork: 'Corruption network',
    netLegend: 'Click a person → full dossier · hover a red line → why they\'re connected · click a line to pin · scroll = zoom, drag = pan',
    disclaimer: '⚠ This dossier aggregates allegations, court findings and journalistic investigations. Some subjects were acquitted, had cases closed, or deny wrongdoing. Every statement is attributed and linked to its source. The presumption of innocence applies; severity scores are editorial ratings of the documented public record, not legal judgments.',
    footerMeta: 'Sources: Reuters, AP, France 24, BBC, Politico, Euronews, RFE/RL, DW, Euractiv, G4Media, Recorder, PressOne, Digi24, HotNews. Last verified: 8 Nov 2026. Corrections: CORECTII.md.',
  },
  ro: {
    kicker: 'Documentează infracțiunile · dauna · banii',
    subtitle: 'Bilanțul corupției și al abuzurilor de putere ale conducerii politice din România — 12 figuri care au deținut puterea sau o influențează, reconstruit din surse reale. Ultima verificare: 9 nov. 2026.',
    statsNote: 'Bani = sumele menționate în dosarele urmărite (fonduri publice în joc, prejudicii CITATE de procurori, costuri impuse populației) — NU sume dovedit furate.',
    searchPh: '🔍  Caută nume, dosare, subiecte…',
    noResults: 'Nicio figură nu se potrivește filtrelor tale.',
    close: 'Închide',
    sortHierarchy: 'Ordonare: ierarhia puterii (președintele primul)',
    sortSeverity: 'Ordonare: severitate descrescătoare',
    sortMoney: 'Ordonare: cei mai mulți bani mai întâi',
    sortCases: 'Ordonare: cele mai multe dosare mai întâi',
    sortName: 'Ordonare: alfabetic',
    filterAll: 'Toate',
    status_in_power: 'La putere',
    status_former: 'Fost',
    status_convicted: 'Condamnat',
    severity: 'Severitate',
    casesCount: 'dosare documentate',
    moneyInvolved: 'bani urmăriți',
    openDossier: 'Deschide dosarul complet',
    statFigures: 'figuri urmărite',
    statCases: 'dosare documentate',
    statMoney: 'bani publici în dosarele urmărite',
    statFlagged: 'condamnați sau anchetați penal',
    statInPower: 'în funcție acum',
    impactLabel: 'Impact asupra populației',
    tabDossiers: 'Dosarele (ierarhia puterii)',
    tabNetwork: 'Rețeaua corupției',
    netLegend: 'Click pe o persoană → dosarul complet · hover pe o linie roșie → de ce sînt conectați · click pe linie pentru fixare · scroll = zoom, drag = mișcare',
    disclaimer: '⚠ Acest dosar agregă acuzații, constatări judecătorești și investigații jurnalistice. Unele subiecte au fost achitate, au avut dosare clasate sau neagă vina. Fiecare afirmație este atribuită și are legătură către sursă. Prezumția de nevinovăție se aplică; scorurile de severitate sunt aprecieri editoriale ale bilanțului public documentat, nu hotărâri legale.',
    footerMeta: 'Surse: Reuters, AP, France 24, BBC, Politico, Euronews, RFE/RL, DW, Euractiv, G4Media, Recorder, PressOne, Digi24, HotNews. Ultima verificare: 8 nov. 2026. Corecturi: CORECTII.md.',
  }
};

/* ---------------- Init ---------------- */
async function init() {
  lang = localStorage.getItem('lang') || 'en';
  setLang(lang);
  document.getElementById('lang-en').addEventListener('click', () => setLang('en'));
  document.getElementById('lang-ro').addEventListener('click', () => setLang('ro'));

  document.getElementById('search').addEventListener('input', e => {
    state.query = e.target.value.trim().toLowerCase();
    render();
  });
  document.getElementById('sort').addEventListener('change', e => {
    state.sort = e.target.value;
    render();
  });

  PEOPLE = await loadData();
  buildChips();
  buildStats();
  render();
}

async function loadData() {
  try {
    const res = await fetch(MANIFEST);
    const files = await res.json();
    const people = await Promise.all(files.map(async f => {
      const r = await fetch(`${DATA_DIR}/${f}`);
      if (!r.ok) throw new Error(`${f}: HTTP ${r.status}`);
      return r.json();
    }));
    return people.filter(Boolean);
  } catch (err) {
    console.error('Failed to load data', err);
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    const c = document.createElement('div');
    c.className = 'empty';
    c.textContent = err.message;
    grid.appendChild(c);
    return [];
  }
}

/* ---------------- i18n helpers ---------------- */
function setLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  document.documentElement.lang = l;
  document.getElementById('lang-en').classList.toggle('active', l === 'en');
  document.getElementById('lang-ro').classList.toggle('active', l === 'ro');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[l][key] != null) el.textContent = I18N[l][key];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t('searchPh');
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    el.setAttribute('aria-label', t(key));
  });
  buildChips();
  buildSortOptions();
  buildStats();
  render();
}

function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key; }

/* ---------------- Filters & sort ---------------- */
function buildChips() {
  const statuses = ['all', 'in_power', 'former', 'convicted'];
  const parties = ['all', 'PSD', 'PNL'];
  const sWrap = document.getElementById('statusChips');
  const pWrap = document.getElementById('partyChips');
  sWrap.innerHTML = '';
  pWrap.innerHTML = '';
  statuses.forEach(s => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (state.status === s ? ' active' : '');
    b.textContent = s === 'all' ? t('filterAll') : t('status_' + s);
    b.addEventListener('click', () => { state.status = s; buildChips(); render(); });
    sWrap.appendChild(b);
  });
  parties.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (state.party === p ? ' active' : '');
    b.textContent = p === 'all' ? '⚖ parties' : p;
    b.addEventListener('click', () => { state.party = p; buildChips(); render(); });
    pWrap.appendChild(b);
  });
}

function buildSortOptions() {
  const sel = document.getElementById('sort');
  sel.innerHTML = '';
  [['hierarchy', 'sortHierarchy'], ['severity', 'sortSeverity'], ['money', 'sortMoney'], ['cases', 'sortCases'], ['name', 'sortName']].forEach(([v, k]) => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = t(k);
    if (state.sort === v) o.selected = true;
    sel.appendChild(o);
  });
}

function filteredPeople() {
  let list = PEOPLE.slice();

  if (state.status !== 'all') list = list.filter(p => p.status === state.status);
  if (state.party !== 'all') list = list.filter(p => (p.party || '').toUpperCase() === state.party);

  if (state.query) {
    const q = state.query.toLowerCase();
    list = list.filter(p => {
      const hay = [
        p.name, p.party,
        p.statusLabel && p.statusLabel[lang],
        p.summary && p.summary[lang],
        ...(p.cases || []).flatMap(c => [
          c.title && c.title[lang],
          c.text && c.text[lang],
          c.impact && c.impact[lang],
          c.date,
        ]),
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  const moneyOf = p => (p.cases || []).reduce((s, c) => s + (c.money || 0), 0);
  switch (state.sort) {
    case 'money': list.sort((a, b) => moneyOf(b) - moneyOf(a)); break;
    case 'cases': list.sort((a, b) => (b.cases?.length || 0) - (a.cases?.length || 0)); break;
    case 'name': list.sort((a, b) => a.name.localeCompare(b.name, lang === 'ro' ? 'ro' : 'en')); break;
    case 'hierarchy':
      list.sort((a, b) =>
        ((a.powerRank ?? 99) - (b.powerRank ?? 99)) || ((b.severity || 0) - (a.severity || 0)));
      break;
    case 'severity':
    default:
      list.sort((a, b) => (b.severity || 0) - (a.severity || 0));
  }
  return list;
}

function rankOf(person) {
  const sorted = [...PEOPLE].sort((a, b) => (b.severity || 0) - (a.severity || 0));
  return sorted.indexOf(person) + 1;
}

/* ---------------- Stats bar ---------------- */
function buildStats() {
  const totalCases = PEOPLE.reduce((s, p) => s + (p.cases?.length || 0), 0);
  const totalMoney = PEOPLE.reduce((s, p) => s + (p.cases || []).reduce((x, c) => x + (c.money || 0), 0), 0);
  const flagged = PEOPLE.filter(p => p.status === 'convicted' || p.status === 'under_investigation').length;
  const inPower = PEOPLE.filter(p => p.status === 'in_power').length;

  const items = [
    { n: String(PEOPLE.length), label: t('statFigures'), cls: '' },
    { n: String(totalCases), label: t('statCases'), cls: 'stat__num--blue' },
    { n: fmtMoney(totalMoney), label: t('statMoney'), cls: 'stat__num--red' },
    { n: String(flagged), label: t('statFlagged'), cls: 'stat__num--amber' },
    { n: String(inPower), label: t('statInPower'), cls: 'stat__num--green' },
  ];
  const bar = document.getElementById('statsbar');
  bar.innerHTML = '';
  items.forEach(it => {
    const d = document.createElement('div');
    d.className = 'stat';
    d.innerHTML = `<div class="stat__num ${it.cls}"></div><div class="stat__label"></div>`;
    d.children[0].textContent = it.n;
    d.children[1].textContent = it.label;
    bar.appendChild(d);
  });
}

function fmtMoney(v) {
  if (!v || v <= 0) return '€0';
  if (v >= 1e9) return '€' + (v / 1e9).toFixed(v % 1e9 === 0 ? 0 : 1) + 'B';
  if (v >= 1e6) return '€' + (v / 1e6).toFixed(v % 1e6 === 0 ? 0 : 1) + 'm';
  if (v >= 1e3) return '€' + (v / 1e3).toFixed(v % 1e3 === 0 ? 0 : 1) + 'k';
  return '€' + v;
}

/* ---------------- Rendering ---------------- */
function render() {
  const list = filteredPeople();
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const total = PEOPLE.length;

  document.getElementById('count').textContent = `${list.length} / ${total}`;
  grid.innerHTML = '';
  empty.classList.toggle('hidden', list.length > 0);

  list.forEach((p, idx) => grid.appendChild(createCard(p, idx + 1)));
}

function createCard(p, rank) {
  const art = document.createElement('article');
  art.className = 'card';
  const casesN = p.cases?.length || 0;
  const money = (p.cases || []).reduce((sum, c) => sum + (c.money || 0), 0);

  art.innerHTML = `
    <span class="card__rank">#${rank}</span>
    <img class="card__img" src="${p.image || ''}" alt="${escapeHtml(p.name)}"
         onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
    <div class="card__body">
      <h3 class="card__name"></h3>
      <div class="badges">
        <span class="badge badge--party"></span>
        <span class="badge badge--status"></span>
      </div>
      <p class="card__status"></p>
      <div class="sevwrap">
        <span class="sevlabel">${t('severity')}</span>
        <div class="sevbar"><div class="sevbar__fill" style="width:${Math.min(100, (p.severity || 0) * 10)}%"></div></div>
        <span class="sevnum">${p.severity || 0}/10</span>
      </div>
      <div class="card__meta">
        <span>${casesN} ${t('casesCount')}</span>
        <span>${money > 0 ? t('moneyInvolved') + ': ' + fmtMoney(money) : ''}</span>
      </div>
      <button type="button" class="card__open"></button>
    </div>`;

  art.querySelector('.card__name').textContent = p.name;
  art.querySelector('.badge--party').textContent = p.party || '';
  art.querySelector('.badge--party').classList.add('badge--psd');
  art.querySelector('.badge--status').textContent = t('status_' + p.status);
  art.querySelector('.badge--status').classList.add('badge--status-' + p.status);
  art.querySelector('.card__status').textContent = p.statusLabel?.[lang] || '';
  const btn = art.querySelector('.card__open');
  btn.textContent = t('openDossier');
  btn.addEventListener('click', () => openDossier(p, rank));
  return art;
}

/* ---------------- Modal ---------------- */
function openDossier(p, rank) {
  const body = document.getElementById('modalBody');
  const casesHtml = (p.cases || []).map(() => `
    <div class="case">
      <h4 class="case__title"><span class="case__date"></span><span class="case__titletext"></span></h4>
      <div class="case__statusline"></div>
      <p class="case__text"></p>
      <div class="case__low"></div>
      <div class="impact">
        <span class="impact__label"></span>
        <span class="impact__text"></span>
      </div>
      <a class="case__src" target="_blank" rel="noopener noreferrer" href=""></a>
    </div>
  `).join('');

  body.innerHTML = `
    <div class="modal__hero">
      <img class="modal__img" src="${p.image || ''}" alt=""
           onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
      <div>
        <h2 id="modalName"></h2>
        <div class="badges">
          <span class="badge badge--party"></span>
          <span class="badge badge--status"></span>
        </div>
        <p class="card__status"></p>
        <div class="sevwrap">
          <span class="sevlabel">${t('severity')}</span>
          <div class="sevbar"><div class="sevbar__fill" style="width:${Math.min(100, (p.severity || 0) * 10)}%"></div></div>
          <span class="sevnum">${p.severity || 0}/10</span>
        </div>
      </div>
    </div>
    <div class="modal__cases">${casesHtml}</div>`;

  body.querySelector('#modalName').textContent = `#${rank} ${p.name}`;
  body.querySelector('.badge--party').textContent = p.party || '';
  body.querySelector('.badge--party').classList.add('badge--psd');
  body.querySelector('.badge--status').textContent = t('status_' + p.status);
  body.querySelector('.badge--status').classList.add('badge--status-' + p.status);
  body.querySelector('.card__status').textContent = p.statusLabel?.[lang] || '';

  const caseEls = body.querySelectorAll('.case');
  (p.cases || []).forEach((c, i) => {
    const el = caseEls[i];
    el.querySelector('.case__date').textContent = c.date || '';
    el.querySelector('.case__titletext').textContent = c.title?.[lang] || '';
    el.querySelector('.case__statusline').innerHTML = c.caseStatus ? '<span class="case__badge"></span>' : '';
    if (c.caseStatus) {
      const b = el.querySelector('.case__badge');
      b.textContent = '⚖ ' + (c.caseStatus[lang] || '');
      b.classList.toggle('case__badge--open', !!c.caseStatus.open);
    }
    el.querySelector('.case__text').textContent = c.text?.[lang] || '';
    el.querySelector('.impact__label').textContent = t('impactLabel');
    el.querySelector('.impact__text').textContent = c.impact?.[lang] || '';
    const low = el.querySelector('.case__low');
    if (c.money) low.innerHTML = `<span class="case__money"></span>`, low.querySelector('span').textContent = fmtMoney(c.money);
    const src = el.querySelector('.case__src');
    src.href = c.source?.url || '#';
    src.textContent = '📄 ' + (c.source?.label?.[lang] || c.source?.url || 'source');
  });

  document.getElementById('modalBack').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDossier() {
  document.getElementById('modalBack').classList.add('hidden');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeDossier);
document.getElementById('modalBack').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeDossier();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDossier(); });

/* ---------------- Utils ---------------- */
function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

document.addEventListener('DOMContentLoaded', init);
