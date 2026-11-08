'use strict';

/* ---- Corruption-network graph ----
   Force-directed SVG graph. Person nodes (from PEOPLE) + hub nodes (from data/network.json).
   Click a person → dossier modal. Hover/click an edge → "why connected" panel. Wheel = zoom, drag = pan. */

const NET = {
  svg: null, g: null, nodes: [], edges: [], width: 0, height: 0,
  zoom: { k: 1, x: 0, y: 0 }, sel: null, dragNode: null, panning: false,
};

async function loadNetworkData() {
  const res = await fetch('data/network.json');
  if (!res.ok) throw new Error('network.json HTTP ' + res.status);
  return res.json();
}

function netLabel(obj) {
  if (!obj || typeof obj !== 'object') return '';
  return obj[lang] != null ? obj[lang] : (obj.en || obj.ro || '');
}

function buildNetwork(netData) {
  const byId = new Map(PEOPLE.map(p => [p.id, p]));
  NET.nodes = [];
  const hubById = new Map();

  for (const h of (netData.hubs || [])) {
    const n = {
      id: h.id, kind: 'hub',
      label: netLabel(h.name), note: netLabel(h.note),
      x: 0, y: 0, vx: 0, vy: 0,
    };
    hubById.set(h.id, n); NET.nodes.push(n);
  }
  for (const p of PEOPLE) {
    NET.nodes.push({
      id: p.id, kind: 'person', person: p,
      label: p.name, img: p.image,
      x: 0, y: 0, vx: 0, vy: 0,
    });
  }
  NET.edges = (netData.edges || [])
    .filter(e => e.w > 0 && (byId.has(e.a) || hubById.has(e.a)) && (byId.has(e.b) || hubById.has(e.b)))
    .map(e => ({ raw: { a: e.a, b: e.b, w: e.w }, label: netLabel(e.label) }));

  // initial positions: circle
  const W = NET.width = document.getElementById('netSvg').clientWidth || 1000;
  const H = NET.height = document.getElementById('netSvg').clientHeight || 620;
  const R = Math.min(W, H) * 0.42;
  NET.nodes.forEach((n, i) => {
    const ang = (i / NET.nodes.length) * Math.PI * 2;
    n.x = W / 2 + Math.cos(ang) * R;
    n.y = H / 2 + Math.sin(ang) * R;
  });
  // 600 ticks force sim
  for (let i = 0; i < 600; i++) tick();

  renderNetwork();
}

function tick() {
  const n = NET.nodes;
  const W = NET.width, H = NET.height;
  const CX = W / 2, CY = H / 2;
  const edges = NET.edges.map(e => ({
    src: n.find(x => x.id === e.raw.a),
    dst: n.find(x => x.id === e.raw.b),
    w: e.raw.w,
  })).filter(e => e.src && e.dst);

  // repulsion between all pairs
  for (let i = 0; i < n.length; i++) {
    for (let j = i + 1; j < n.length; j++) {
      const dx = n[j].x - n[i].x, dy = n[j].y - n[i].y;
      let d2 = dx * dx + dy * dy;
      if (d2 < 1) d2 = 1;
      const rx = (n[j].kind === 'hub' || n[i].kind === 'hub') ? 24000 : 20000;
      if (d2 < rx * 4) {
        const d = Math.sqrt(d2);
        const f = rx / d2;
        const fx = dx / d * f, fy = dy / d * f;
        n[i].vx -= fx; n[i].vy -= fy;
        n[j].vx += fx; n[j].vy += fy;
      }
    }
  }
  // spring along edges
  const ideal = { 1: 150, 2: 140, 3: 130 };
  for (const e of edges) {
    const dx = e.dst.x - e.src.x, dy = e.dst.y - e.src.y;
    const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const f = (d - ideal[e.w] * 1.1) * 0.02;
    const fx = dx / d * f, fy = dy / d * f;
    e.src.vx += fx; e.src.vy += fy;
    e.dst.vx -= fx; e.dst.vy -= fy;
  }
  // centering + damping + integrate
  for (const node of n) {
    node.vx += (CX - node.x) * 0.012;
    node.vy += (CY - node.y) * 0.012;
    node.vx *= 0.86; node.vy *= 0.86;
    if (node !== NET.panningFocus) {
      node.x += Math.max(-14, Math.min(14, node.vx));
      node.y += Math.max(-14, Math.min(14, node.vy));
    }
  }
}

function renderNetwork() {
  const svg = document.getElementById('netSvg');
  NET.svg = svg;
  const W = svg.clientWidth || 1000, H = svg.clientHeight || 620;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const edges = NET.edges.map(e => ({
    raw: e.raw, label: e.label,
    src: NET.nodes.find(n => n.id === e.raw.a),
    dst: NET.nodes.find(n => n.id === e.raw.b),
  })).filter(e => e.src && e.dst);

  let html = `<g id="netVP" transform="translate(${NET.zoom.x},${NET.zoom.y}) scale(${NET.zoom.k})">`;
  // edges
  for (const e of edges) {
    const width = 1 + e.raw.w * 1.2;
    html += `<line class="net-edge" x1="${e.src.x}" y1="${e.src.y}" x2="${e.dst.x}" y2="${e.dst.y}"
      stroke="${e.raw.w >= 3 ? 'rgba(229,72,77,.55)' : 'rgba(154,154,168,.4)'}" stroke-width="${width}"
      data-a="${e.src.id}" data-b="${e.dst.id}" cursor="pointer"></line>`;
  }
  // nodes
  for (const node of NET.nodes) {
    if (node.kind === 'person') {
      const r = 30;
      html += `<g class="net-node" transform="translate(${node.x},${node.y})" data-id="${node.id}" cursor="pointer">
        <circle r="${r + 3}" fill="#e5484d" opacity="0.25"></circle>
        <circle r="${r}" fill="#16161f" stroke="#3a3a4c" stroke-width="1.5"></circle>
        <clipPath id="clip-${node.id}"><circle r="${r - 2}"></clipPath>
        <image href="${node.img}" x="${-r + 2}" y="${-r + 2}" width="${2 * r - 4}" height="${2 * r - 4}"
               clip-path="url(#clip-${node.id})" preserveAspectRatio="xMidYMin slice"
               onerror="this.setAttribute('href','${PLACEHOLDER}')"></image>
        <text y="${r + 18}" class="net-label person" text-anchor="middle"></text>
      </g>`;
    } else {
      const s = 15;
      html += `<g class="net-node hub" transform="translate(${node.x},${node.y})" data-id="${node.id}" cursor="pointer">
        <rect x="${-s - 7}" y="${-s - 7}" width="${2 * s + 14}" height="${2 * s + 14}" rx="6"
              fill="rgba(229,72,77,.15)" stroke="#e5484d" stroke-width="1.4"></rect>
        <text class="hub-ic" y="7" text-anchor="middle" font-size="18">⚖</text>
        <text class="net-label hub" text-anchor="middle" y="${s + 24}"></text>
      </g>`;
    }
  }
  html += '</g>';
  svg.innerHTML = html;

  // fill the labels after (textContent, no HTML injection)
  svg.querySelectorAll('.net-node').forEach(g => {
    const node = NET.nodes.find(n => n.id === g.dataset.id);
    const t = g.querySelector('.net-label');
    if (t) t.textContent = node.label;
    if (node.kind === 'person') {
      g.addEventListener('click', () => {
        if (node.__wasDragged) { node.__wasDragged = false; return; }  // ignore click right after a drag
        openDossier(node.person, rankOfPerson(node.person));
      });
    } else {
      g.addEventListener('click', () => {
        if (node.__wasDragged) { node.__wasDragged = false; return; }  // ignore click right after a drag
        // pin the hub explanation + briefly highlight its connections
        showWhy('⚖ ' + node.label + ' — ' + node.note, true);
        const svg = document.getElementById('netSvg');
        svg.querySelectorAll('.net-edge').forEach(l => l.classList.remove('net-edge--lit'));
        svg.querySelectorAll('.net-edge').forEach(l => {
          if (l.dataset.a === node.id || l.dataset.b === node.id) l.classList.add('net-edge--lit');
        });
      });
    }
    dragify(g, node);
  });
  // edge tooltips + info panel
  svg.querySelectorAll('.net-edge').forEach(l => {
    l.addEventListener('mouseover', () => {
      const a = NET.nodes.find(n => n.id === l.dataset.a);
      const b = NET.nodes.find(n => n.id === l.dataset.b);
      showWhy(netEdgeText(a, b), false);
    });
    l.addEventListener('click', () => {
      const a = NET.nodes.find(n => n.id === l.dataset.a);
      const b = NET.nodes.find(n => n.id === l.dataset.b);
      showWhy(netEdgeText(a, b), true);
    });
  });
}

function rankOfPerson(p) {
  return [...PEOPLE].sort((a, b) => ((a.powerRank ?? 99) - (b.powerRank ?? 99))).indexOf(p) + 1;
}

function netEdgeText(a, b) {
  const e = NET.edges.find(x =>
    (x.raw.a === a?.id && x.raw.b === b?.id) || (x.raw.a === b?.id && x.raw.b === a?.id));
  if (!e) return '';
  return `⚠ ${a?.label ?? b?.label} ↔ ${b?.label ?? a?.label} — ${e.label}`;
}

function showWhy(text, sticky) {
  const box = document.getElementById('whyBox');
  if (!box) return;
  if (text) {
    box.textContent = text;
    box.classList.add('visible');
    box.classList.toggle('locked', !!sticky);
  } else if (!sticky) {
    box.classList.remove('visible', 'locked');
    box.textContent = '';
  }
}

/* ---- interactions: drag ONE node; the rest stay frozen ---- */
function updateNodeDom(node) {
  const svg = document.getElementById('netSvg');
  const g = svg.querySelector(`.net-node[data-id="${node.id}"]`);
  if (!g) return;
  g.setAttribute('transform', `translate(${node.x},${node.y})`);
  // only incident edges move
  svg.querySelectorAll('.net-edge').forEach(l => {
    if (l.dataset.a === node.id) {
      l.setAttribute('x1', node.x); l.setAttribute('y1', node.y);
    } else if (l.dataset.b === node.id) {
      l.setAttribute('x2', node.x); l.setAttribute('y2', node.y);
    }
  });
}

function dragify(g, node) {
  let dragging = false, moved = 0, sx = 0, sy = 0;
  g.addEventListener('pointerdown', e => {
    dragging = true; moved = 0; sx = e.clientX; sy = e.clientY;
    g.setPointerCapture?.(e.pointerId);
    e.preventDefault();
    const move = ev => {
      if (!dragging) return;
      const dx = (ev.clientX - sx) / (NET.zoom.k || 1);
      const dy = (ev.clientY - sy) / (NET.zoom.k || 1);
      moved += Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy);
      sx = ev.clientX; sy = ev.clientY;
      node.x += dx; node.y += dy;
      // move ONLY this node: update DOM locally, no forces, no other nodes
      updateNodeDom(node);
    };
    const up = () => {
      dragging = false;
      if (moved > 6) node.__wasDragged = true;   // swallow the trailing click
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });
}

function setupNetworkInteractions() {
  const svg = document.getElementById('netSvg');
  // wheel zoom
  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const scale = e.deltaY < 0 ? 1.1 : 0.9;
    const vp = svg.querySelector('#netVP');
    if (!vp) return;
    NET.zoom.k = Math.min(4, Math.max(0.4, NET.zoom.k * scale));
    const tr = new DOMMatrixReadOnly(getComputedStyle(vp).transform);
    vp.setAttribute('transform', `translate(${NET.zoom.x},${NET.zoom.y}) scale(${NET.zoom.k})`);
  }, { passive: false });
  // pan on empty space
  svg.addEventListener('pointerdown', e => {
    if (e.target !== svg) return;
    startPan(e);
  });
  function startPan(e) {
    let sx = e.clientX, sy = e.clientY, ox = NET.zoom.x, oy = NET.zoom.y;
    const move = ev => {
      NET.zoom.x = ox + (ev.clientX - sx);
      NET.zoom.y = oy + (ev.clientY - sy);
      const vp = svg.querySelector('#netVP');
      if (vp) vp.setAttribute('transform', `translate(${NET.zoom.x},${NET.zoom.y}) scale(${NET.zoom.k})`);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
}

async function showNetworkView() {
  document.getElementById('grid').classList.add('hidden');
  document.getElementById('toolbar').classList.add('hidden');
  document.getElementById('networkView').classList.remove('hidden');
  try {
    if (!NET.edges.length) {
      const data = await loadNetworkData();
      buildNetwork(data);
      setupNetworkInteractions();
    } else {
      renderNetwork();
    }
  } catch (err) {
    document.getElementById('whyBox').textContent = '⚠ network.json failed: ' + err.message;
  }
}

function showGridView() {
  document.getElementById('networkView').classList.add('hidden');
  document.getElementById('grid').classList.remove('hidden');
  document.getElementById('toolbar').classList.remove('hidden');
}
