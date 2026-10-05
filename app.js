(() => {
  'use strict';
  const D = RDR.data, S = RDR.story;
  const CAT = Object.fromEntries(D.cats.map(c => [c.id, c]));
  const REG = Object.fromEntries(D.regions.map(r => [r.id, r]));
  const ITEM = Object.fromEntries(D.items.map(i => [i.id, i]));
  const CH = S.chapters;
  const MISSION = {};
  for (const ch of CH) for (const [id, n, opt] of ch.missions) MISSION[id] = { id, n, opt: !!opt, ch: ch.n };
  const START = Object.fromEntries(S.starts.map(s => [s.id, s]));
  const GROUPS = { main: 'Main collectibles', hunt: 'Hunting & wildlife', side: 'Side missions & unique items', money: 'Money & valuables', explore: 'Exploring & secrets', world: 'World: places, pickups & services' };
  const GROUPED = new Set(['card', 'treasure', 'hunt', 'exotic', 'gear', 'loot', 'pamph', 'trinket', 'poi', 'secret', 'early', 'horse', 'stranger', 'crime', 'event', 'shack', 'pickup', 'game', 'herb', 'fishspot', 'service']);
  // reference layers: shown on the map but not counted towards 100%
  const REF = new Set(['event', 'shack', 'pickup', 'game', 'herb', 'fishspot', 'service']);
  const ICON = {
    dino: 'icons/dino.png', carving: 'icons/carving.png', dream: 'icons/dream.png', card: 'icons/card.svg',
    treasure: 'icons/treasure.png', grave: 'icons/grave.png', animal: 'icons/animal.png', fish: 'icons/fish.png',
    hunt: 'icons/hunt.svg', exotic: 'icons/sp_orchid_lady_of_the_night.png', gang: 'icons/gang.svg', gear: 'icons/weapon.svg', loot: 'icons/goldbar.svg', pamph: 'icons/pamphlet.svg', trinket: 'icons/trinket.svg', poi: 'icons/poi.svg', secret: 'icons/secret.svg', early: 'icons/weapon.svg', horse: 'icons/horse.png', stranger: 'icons/stranger.png', crime: 'icons/crime.png', event: 'icons/event.png', shack: 'icons/shack.png', pickup: 'icons/pickup.png', game: 'icons/game.png', herb: 'icons/herb.png', fishspot: 'icons/fishspot.png', service: 'icons/service.png',
  };
  const iconOf = it => it.ic ? (/^(weapon|hat|goldbar|stash)$/.test(it.ic) ? `icons/${it.ic}.svg` : `icons/${it.ic}.png`) : ICON[it.c];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---- persisted state (per-viewer, so localStorage is the right home) ----
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: progress lasts this visit only */ } };
  const done = new Set(load('rdr2map.done', []).filter(id => ITEM[id]));
  const story = new Set(load('rdr2map.story', []));
  // ponytail: exotics have ~250 spawn markers, so they start hidden to keep the first view readable
  // non-collectible layers: one master switch turns them all on/off; the checklist picks which ones show
  const NONCOL = ['early', 'secret', 'poi', 'stranger', 'crime', 'event', 'shack', 'pickup', 'game', 'herb', 'fishspot', 'service'];
  let layersOn = load('rdr2map.layersOn', true);
  const DEFAULT_HIDDEN = ['exotic', 'poi', 'stranger', 'crime', 'event', 'shack', 'pickup', 'game', 'herb', 'fishspot', 'service'];
  const hiddenCats = new Set(load('rdr2map.hiddenCats', DEFAULT_HIDDEN));
  const plants = new Set(load('rdr2map.plants', [])); // herbs work like Wildlife: only the plants you pick go on the map
  { // categories added since this browser last visited start hidden if they're busy layers
    const known = new Set(load('rdr2map.knownCats', D.cats.map(c => c.id)));
    for (const c of D.cats) if (!known.has(c.id) && DEFAULT_HIDDEN.includes(c.id)) hiddenCats.add(c.id);
    save('rdr2map.knownCats', D.cats.map(c => c.id)); save('rdr2map.hiddenCats', [...hiddenCats]);
  }
  const openCats = new Set(load('rdr2map.openCats', []));
  const openChs = new Set(load('rdr2map.openChs', []));
  let showDone = load('rdr2map.showDone', false);
  let tab = load('rdr2map.tab', 'items');
  const wildOn = new Set(load('rdr2map.wild', [])); // nothing is shown until the user switches an animal on
  let region = null;
  let query = '';
  const $ = id => document.getElementById(id);
  const mobileMQ = matchMedia('(max-width: 800px)');
  const canHover = matchMedia('(hover: hover)').matches;

  // ---- story progress & unlock rules ----
  const chName = n => n > CH.length ? 'the end of the story' : CH[n - 1].name;
  const chDone = n => story.has('chdone-' + n);
  const reached = n => n <= 1 || chDone(n - 1);
  const currentCh = () => { for (const c of CH) if (!chDone(c.n)) return c.n; return CH.length + 1; };
  const met = t => { const m = /^ch(\d)$/.exec(t); return m ? reached(+m[1]) : t.startsWith('item:') ? done.has(t.slice(5)) : story.has(t); };

  // collections that open in order: treasure steps one by one, hunting/exotic lists one list at a time
  const chainPrev = {};
  {
    const byGroup = {};
    for (const it of D.items) if (['treasure', 'hunt', 'exotic'].includes(it.c)) (byGroup[it.c + '|' + it.g] ||= []).push(it);
    const lists = {};
    for (const [k, its] of Object.entries(byGroup)) {
      const c = k.split('|')[0];
      if (c === 'treasure') its.forEach((it, i) => { if (i) chainPrev[it.id] = [its[i - 1].id]; });
      else (lists[c] ||= []).push(its);
    }
    for (const groups of Object.values(lists)) groups.forEach((its, i) => { if (i) its.forEach(it => { chainPrev[it.id] = groups[i - 1].map(x => x.id); }); });
  }
  // Arthur can't settle in New Austin, so its collectibles wait for the Epilogue
  const inNewAustin = it => it.r.length > 0 && it.r.every(r => REG[r].state === 'New Austin');
  const reqsOf = it => [...(S.catReq[it.c] || []), ...(S.itemReq[it.id] || []), ...(it.q || []), ...(inNewAustin(it) ? ['ch7'] : [])];
  const needs = it => done.has(it.id) ? [] : [
    ...[...new Set(reqsOf(it))].filter(t => !met(t)),
    ...(chainPrev[it.id] || []).filter(id => !done.has(id)).map(id => 'item:' + id),
  ];
  const unlocked = it => needs(it).length === 0;

  function tokLabel(t) {
    const m = /^ch(\d)$/.exec(t);
    if (m) return +m[1] > CH.length ? 'Finish the story (after Epilogue Part 2)' : `Reach ${chName(+m[1])}`;
    if (t.startsWith('item:')) return `Collect “${ITEM[t.slice(5)].n}” first`;
    if (START[t]) return `Meet ${START[t].who} — “${START[t].mission}”`;
    if (MISSION[t]) return `Complete “${MISSION[t].n}”`;
    return t;
  }
  function chip(t) {
    const tickable = !t.startsWith('item:');
    const go = START[t] ? `<button class="chip-go" data-start="${t}" title="Show on map" aria-label="Show on map">⌖</button>`
      : (/^ch\d$/.test(t) || MISSION[t]) ? `<button class="chip-go" data-gostory="${t}" title="Open story progress" aria-label="Open story progress">→</button>`
      : `<button class="chip-go" data-loc="${t.slice(5)}" title="Show on map" aria-label="Show on map">⌖</button>`;
    return `<li class="chip">${tickable ? `<button class="chip-tick" data-story="${t}" aria-label="Mark done: ${esc(tokLabel(t))}"></button>` : '<span class="chip-dot"></span>'}
      <span>${esc(tokLabel(t))}</span>${go}</li>`;
  }

  // completing anything in chapter N means every earlier chapter is behind you
  function reachChapter(n) {
    for (let k = 1; k < n; k++) {
      story.add('chdone-' + k);
      for (const [mid, , opt] of CH[k - 1].missions) if (!opt) story.add(mid);
    }
  }
  function setStory(id, on) {
    const m = /^chdone-(\d)$/.exec(id), c = /^ch(\d)$/.exec(id);
    if (c) { if (on) reachChapter(+c[1]); else for (let k = +c[1] - 1; k <= CH.length; k++) story.delete('chdone-' + k); }
    else if (m) { if (on) reachChapter(+m[1] + 1); else for (let k = +m[1]; k <= CH.length; k++) story.delete('chdone-' + k); }
    else if (on) {
      story.add(id);
      const s = START[id], ms = MISSION[id];
      if (ms) reachChapter(ms.ch);
      if (s) { reachChapter(s.ch); if (s.after) story.add(s.after); }
    } else story.delete(id);
    save('rdr2map.story', [...story]);
    refresh();
  }

  // ---- map ----
  const bounds = L.latLngBounds([-190, 0], [0, 256]);
  const map = L.map('map', {
    crs: L.CRS.Simple, minZoom: 1, maxZoom: 9, zoomControl: false,
    // free zoom (no snapping after a pinch), smooth wheel, firm edges, gentle glide after a flick
    zoomSnap: 0, zoomDelta: 0.5, wheelPxPerZoomLevel: 90, wheelDebounceTime: 20,
    maxBounds: bounds.pad(0.15), maxBoundsViscosity: 1, inertiaDeceleration: 2600, easeLinearity: 0.25,
  });
  L.tileLayer('tiles/{z}/{x}_{y}.jpg', {
    bounds, noWrap: true, minNativeZoom: 2, maxNativeZoom: 7, keepBuffer: 4, updateWhenZooming: false,
    attribution: 'Map &copy; Rockstar Games &middot; data: <a href="https://github.com/jeanropke/RDOMap">RDOMap</a>, <a href="https://github.com/the0neWhoKnocks/red-dead-redemption-2-map">rdr2-map</a>',
  }).addTo(map);
  if (canHover) L.control.zoom({ position: 'topright' }).addTo(map); // touch screens pinch instead
  const layersCtl = L.control({ position: 'topright' });
  layersCtl.onAdd = () => {
    const el = L.DomUtil.create('div', 'layers-ctl');
    L.DomEvent.disableClickPropagation(el); L.DomEvent.disableScrollPropagation(el);
    return el;
  };
  layersCtl.addTo(map);
  let layersOpen = false;
  function renderLayers() {
    const el = layersCtl.getContainer(), cats = NONCOL.map(id => D.cats.find(c => c.id === id)).filter(Boolean);
    const shown = cats.filter(c => !hiddenCats.has(c.id)).length;
    el.innerHTML = `<button class="layers-btn ${layersOn ? 'on' : ''}" data-lyr-open aria-expanded="${layersOpen}">🗺 Places${layersOn ? ` · ${shown}` : ' · off'}</button>
      ${layersOpen ? `<div class="layers-panel">
        <label class="layers-master"><span>Places &amp; services</span><span class="switch-ui"><input type="checkbox" role="switch" data-lyr-master ${layersOn ? 'checked' : ''}><span></span></span></label>
        <div class="layers-quick"><button class="link" data-lyr-all>Show all</button><button class="link" data-lyr-none>Hide all</button></div>
        ${cats.map(c => `<label class="layers-row ${layersOn ? '' : 'dim'}"><input type="checkbox" data-lyr="${c.id}" ${hiddenCats.has(c.id) ? '' : 'checked'}>
          <span class="pin sm" style="--c:${c.color}"><img src="${ICON[c.id]}" alt=""></span><span>${esc(c.name)}</span></label>`).join('')}
      </div>` : ''}`;
  }
  function setLayers(fn) {
    fn(); save('rdr2map.layersOn', layersOn); save('rdr2map.hiddenCats', [...hiddenCats]);
    refresh(); renderLayers();
  }
  layersCtl.getContainer().addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-lyr-open]')) { layersOpen = !layersOpen; renderLayers(); }
    else if (t.closest('[data-lyr-all]')) setLayers(() => { layersOn = true; NONCOL.forEach(c => hiddenCats.delete(c)); });
    else if (t.closest('[data-lyr-none]')) setLayers(() => NONCOL.forEach(c => hiddenCats.add(c)));
  });
  layersCtl.getContainer().addEventListener('change', e => {
    const d = e.target.dataset;
    if ('lyrMaster' in d) setLayers(() => { layersOn = e.target.checked; });
    else if (d.lyr) setLayers(() => { e.target.checked ? hiddenCats.delete(d.lyr) : hiddenCats.add(d.lyr); if (e.target.checked) layersOn = true; });
  });
  const HOME = L.latLngBounds([-168, 12], [-24, 222]);
  // keep fitted areas clear of the bottom sheet on phones
  const sheetH = () => sheet === 'peek' ? 150 + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab')) || 0) : $('side').offsetHeight;
  const sheetPad = () => mobileMQ.matches ? { paddingTopLeft: [16, 60], paddingBottomRight: [16, sheetH() + 16] } : { padding: [30, 30] };
  const goHome = (animate = true) => animate ? map.flyToBounds(HOME, { ...sheetPad(), duration: 0.8 }) : map.fitBounds(HOME, sheetPad());
  // pins grow smoothly with zoom (18px far out -> 32px close in), updated every animation frame
  const setPinSize = () => map.getContainer().style.setProperty('--ps', Math.round(Math.max(18, Math.min(32, 18 + (map.getZoom() - 2) * 4.7))) + 'px');
  map.on('zoom', setPinSize); setPinSize();

  // regions
  const regionLayers = {};
  let popupClosedAt = 0;
  const regionStyle = id => {
    if (region === id) return { color: '#f2d27a', weight: 2.5, fillColor: '#f2d27a', fillOpacity: 0.06, dashArray: null };
    return { color: '#5a1c14', weight: 1, opacity: 0.35, fillOpacity: 0, dashArray: '4 4' };
  };
  L.geoJSON(D.geo, {
    style: f => regionStyle(f.properties.id),
    onEachFeature: (f, layer) => {
      const id = f.properties.id;
      regionLayers[id] = layer;
      if (canHover) layer.bindTooltip(() => {
        const [d, t] = progress(regionItems(id));
        return `<b>${esc(REG[id].name)}</b><span>${esc(REG[id].state)} &middot; ${d}/${t}</span>`;
      }, { sticky: true, className: 'region-tip', direction: 'top', offset: [0, -8] });
      layer.on('mouseover', () => { if (region !== id) layer.setStyle({ fillColor: '#f2d27a', fillOpacity: 0.16, weight: 2, color: '#f2d27a', opacity: 0.9 }); });
      layer.on('mouseout', () => layer.setStyle(regionStyle(id)));
      layer.on('click', () => { if (Date.now() - popupClosedAt > 400) selectRegion(id); }); // a tap that only closes a popup keeps the view
    },
  }).addTo(map);

  // darken everything outside the selected region
  let shade = null;
  function setShade(id) {
    shade?.remove(); shade = null;
    if (!id) return;
    const f = D.geo.features.find(f => f.properties.id === id).geometry;
    const polys = f.type === 'Polygon' ? [f.coordinates] : f.coordinates;
    const holes = polys.map(p => p[0].map(([x, y]) => [y, x]));
    shade = L.polygon([[[-600, -300], [-600, 600], [300, 600], [300, -300]], ...holes],
      { stroke: false, fillColor: '#120d08', fillOpacity: 0.45, interactive: false }).addTo(map);
  }

  // markers; panPad is mutated as the sheet moves so popups never open under it
  const panPad = L.point(16, 16);
  const popOpts = { className: 'rdr-popup', maxWidth: 280, minWidth: 220, autoPanPaddingTopLeft: [16, 60], autoPanPaddingBottomRight: panPad };
  const pinIcon = (html, cls = '') => L.divIcon({ className: 'pin-wrap ' + cls, iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -14], html });
  const markers = {}; // item id -> [{m, r}]
  // pins sharing an exact spot (trinkets crafted at one fence...) fan out by a few pixels; the coordinates stay true
  const atSpot = {};
  for (const it of D.items) for (const ll of it.l) (atSpot[ll] ||= []).push(it.id);
  const fan = (ll, id) => {
    const ids = atSpot[ll], n = ids.indexOf(id), a = 2 * Math.PI * n / ids.length, r = ids.length > 1 ? 16 : 0;
    return [16 - Math.round(r * Math.cos(a)), 16 + Math.round(r * Math.sin(a))];
  };
  for (const it of D.items) {
    markers[it.id] = it.l.map((ll, i) => {
      const icon = pinIcon(`<div class="pin" style="--c:${CAT[it.c].color}"><img src="${iconOf(it)}" alt=""></div>`);
      icon.options.iconAnchor = fan(ll, it.id);
      const m = L.marker(ll, { icon, title: it.n, riseOnHover: true, keyboard: false });
      m.bindPopup(() => popupHtml(it), popOpts);
      return { m, r: it.lr[i], i };
    });
  }
  // story start points (people to meet first) and the current chapter's camp
  const startMarkers = {};
  for (const s of S.starts) {
    const m = L.marker(s.l, { icon: pinIcon('<div class="pin start-pin"><b>!</b></div>', 'start'), title: s.who, riseOnHover: true, keyboard: false, zIndexOffset: 500 });
    m.bindPopup(() => startPopup(s), popOpts);
    startMarkers[s.id] = m;
  }
  const campMarker = L.marker([0, 0], { icon: pinIcon('<div class="pin camp-pin"><b>★</b></div>', 'camp'), title: 'Gang camp', keyboard: false, zIndexOffset: 400 });
  campMarker.bindPopup(() => {
    const c = CH[currentCh() - 1];
    return `<div class="pop"><div class="pop-cat">Main story &middot; ${esc(c.name)}</div><div class="pop-title">${esc(c.place)} camp</div>
      <p>Main story missions for ${esc(c.name)} start from the gang's camp here (approximate pin).</p>
      <button class="btn" data-tab="story">Open story progress</button></div>`;
  }, popOpts);

  // no licensed screenshot set exists for every spot, so link straight to image and video results for that exact place
  function lookLinks(q) {
    const e = encodeURIComponent('RDR2 ' + q);
    return `<div class="pop-links"><a href="https://www.google.com/search?tbm=isch&q=${e}" target="_blank" rel="noopener">📷 Photos of this spot</a>
      <a href="https://www.youtube.com/results?search_query=${e}" target="_blank" rel="noopener">▶ Video</a></div>`;
  }
  const unlockNames = s => esc(CAT[s.unlocks]?.name || s.unlocks);
  function startPopup(s) {
    const isDone = story.has(s.id);
    return `<div class="pop">
      <div class="pop-head"><span class="pin sm start-pin"><b>!</b></span>
        <div><div class="pop-cat">Meet first &middot; ${esc(chName(s.ch))}+</div><div class="pop-title">${esc(s.who)}</div></div></div>
      <div class="pop-sub">${esc(s.mission)} &middot; unlocks ${unlockNames(s)}</div>
      <p>${esc(s.d)}${s.approx ? ' <i>(approximate pin)</i>' : ''}</p>
      ${!reached(s.ch) ? `<p class="pop-rw">Not available until ${esc(chName(s.ch))}.</p>` : ''}
      ${lookLinks(s.who + ' ' + s.mission + ' location')}
      <button class="btn ${isDone ? 'ghost' : ''}" data-story="${s.id}" data-on="${isDone ? 0 : 1}">${isDone ? 'Mark as not done' : '✓ Mark as done'}</button>
    </div>`;
  }

  const illustration = it => RDR.illustration(it); // illus.js
  function popupHtml(it) {
    const c = CAT[it.c], isDone = done.has(it.id), to = it.tos ? it.tos[chIdx(it)] : it.to;
    const sub = [it.g, it.sub].filter(Boolean).map(esc).join(' &middot; ');
    return `<div class="pop">
      <div class="pop-head"><span class="pin sm" style="--c:${c.color}"><img src="${iconOf(it)}" alt=""></span>
        <div><div class="pop-cat">${esc(c.name)}</div><div class="pop-title">${esc(it.n)}</div></div></div>
      ${it.img ? `<div class="pop-art"><img src="${it.img}" alt="${esc(it.n)}"></div>`
        : illustration(it) ? `<div class="pop-art drawn">${illustration(it)}</div>` : ''}
      ${sub ? `<div class="pop-sub">${sub}</div>` : ''}
      ${it.d ? `<p>${esc(it.d)}</p>` : ''}
      ${it.rw ? `<p class="pop-rw">Set reward: ${esc(it.rw)}</p>` : ''}
      <div class="pop-reg">${it.r.map(r => esc(REG[r].name)).join(', ')}</div>
      ${it.l.length ? lookLinks(`${c.name.replace(/s$/, '')} ${it.n} ${it.c === 'card' ? it.g : it.sub || ''} location`) : ''}
      ${to && to[2] ? `<p class="pop-rw">Spot for when you're camped at ${esc(to[2])}: ${to[3]} spawn points close together. Mail it from ${esc(to[1])}.</p>` : ''}
      ${it.wild || to ? `<div class="pop-links">${it.wild ? `<button class="btn ghost sm" data-habitat="${it.wild}">Show where it lives</button>` : ''}${to ? `<button class="btn ghost sm" data-goto="${to[0].join(',')}">${it.c === 'hunt' ? 'Deliver' : 'Part'}: ${esc(to[1])}</button>` : ''}</div>` : ''}
      ${it.guide ? `<a class="guide-link" href="${esc(it.guide)}" target="_blank" rel="noopener">Full guide ↗</a>` : ''}
      <button class="btn ${isDone ? 'ghost' : ''}" data-toggle="${it.id}">${isDone ? 'Mark as not collected' : '✓ Mark as collected'}</button>
    </div>`;
  }
  map.on('popupclose', () => { document.body.classList.remove('popup-open'); popupClosedAt = Date.now(); });
  map.on('popupopen', e => {
    document.body.classList.add('popup-open');
    if (mobileMQ.matches && sheet !== 'peek') setSheet('peek');
    const el = e.popup.getElement();
    const b = el.querySelector('[data-toggle]');
    if (b) b.onclick = () => { map.closePopup(); toggle(b.dataset.toggle); };
    const s = el.querySelector('[data-story]');
    if (s) s.onclick = () => { map.closePopup(); setStory(s.dataset.story, s.dataset.on === '1'); };
    const h = el.querySelector('[data-habitat]');
    if (h) h.onclick = () => { map.closePopup(); setWild(h.dataset.habitat, true); };
    const g = el.querySelector('[data-goto]');
    if (g) g.onclick = () => { map.closePopup(); flyToPoint(g.dataset.goto.split(',').map(Number), null); };
    const t = el.querySelector('[data-tab]');
    if (t) t.onclick = () => { map.closePopup(); setTab('story'); if (mobileMQ.matches) setSheet('full'); };
  });

  // items without a map pin (hunting and gang requests) open in a detail sheet instead of a map popup
  function showDetail(it) {
    const dlg = $('detail');
    dlg.innerHTML = `<button class="dlg-close" aria-label="Close">✕</button>${popupHtml(it)}`;
    dlg.querySelector('.dlg-close').onclick = () => dlg.close();
    dlg.querySelector('[data-toggle]').onclick = () => { dlg.close(); toggle(it.id); };
    dlg.showModal();
  }
  $('detail').addEventListener('click', e => { if (e.target.id === 'detail') e.target.close(); }); // tap outside closes

  // ---- logic ----
  const matches = it => !query || (it.n + ' ' + (it.g || '') + ' ' + (it.sub || '') + ' ' + it.d).toLowerCase().includes(query);
  const regionItems = id => D.items.filter(i => i.r.includes(id) && !REF.has(i.c));
  const progress = list => [list.filter(i => done.has(i.id)).length, list.length];
  const scoped = () => D.items.filter(i => (!region || i.r.includes(region)) && matches(i));

  function toggle(id, force) {
    const on = force ?? !done.has(id);
    on ? done.add(id) : done.delete(id);
    save('rdr2map.done', [...done]);
    refresh();
  }

  // hunting requests carry one spot per camp; show the one for the chapter you're in
  const chIdx = it => { let k = -1; if (it.lch) { const cc = currentCh(); k = 0; it.lch.forEach((c, j) => { if (c <= cc) k = j; }); } return k; };
  const shownHere = (it, x) => (!region || x.r === region) && (!it.lch || x.i === chIdx(it));
  function refreshMarkers() {
    for (const it of D.items) {
      const visibleItem = !hiddenCats.has(it.c) && (layersOn || !NONCOL.includes(it.c)) && (showDone || !done.has(it.id)) && matches(it) && unlocked(it) && (it.c !== 'herb' || plants.has(it.g));
      for (const x of markers[it.id]) {
        const m = x.m, show = visibleItem && shownHere(it, x);
        if (show && !map.hasLayer(m)) m.addTo(map);
        if (!show && map.hasLayer(m)) m.remove();
        if (show) m.getElement()?.classList.toggle('done', done.has(it.id));
      }
    }
    for (const s of S.starts) {
      const m = startMarkers[s.id], show = !story.has(s.id) && !query;
      if (show && !map.hasLayer(m)) m.addTo(map);
      if (!show && map.hasLayer(m)) m.remove();
      if (show) m.getElement()?.classList.toggle('later', !reached(s.ch));
    }
    const camp = CH[currentCh() - 1]?.camp;
    if (camp && !query) { campMarker.setLatLng(camp); if (!map.hasLayer(campMarker)) campMarker.addTo(map); }
    else campMarker.remove();
  }

  function selectRegion(id) {
    region = id;
    for (const [rid, layer] of Object.entries(regionLayers)) layer.setStyle(regionStyle(rid));
    setShade(id);
    if (id) {
      if (tab !== 'items') setTab('items');
      if (mobileMQ.matches) setSheet('half');
      map.flyToBounds(regionLayers[id].getBounds(), { ...sheetPad(), duration: 0.8 });
    }
    refresh();
    $('list').scrollTop = 0;
  }

  function flyToPoint(ll, marker) {
    if (mobileMQ.matches) setSheet('peek');
    // aim slightly below the point on phones so it lands above the sheet
    const z = Math.max(map.getZoom(), 6);
    const c = mobileMQ.matches ? map.unproject(map.project(L.latLng(ll), z).add([0, (sheetH() - 120) / 2]), z) : ll;
    map.flyTo(c, z, { duration: 0.8 });
    if (marker) map.once('moveend', () => marker.openPopup());
  }

  // ---- bottom sheet (phones) ----
  let sheet = 'peek';
  function setSheet(s) {
    sheet = s;
    const side = $('side');
    side.style.height = '';
    side.dataset.sheet = s;
    $('sheet-btn').textContent = s === 'full' ? '▾' : '▴';
    $('sheet-btn').setAttribute('aria-label', s === 'full' ? 'Collapse list' : 'Expand list');
    requestAnimationFrame(() => { panPad.y = (mobileMQ.matches ? side.offsetHeight : 0) + 16; });
  }
  {
    // drag the header to resize; a tap cycles peek -> half -> full -> peek
    const side = $('side'), grab = $('grab');
    let y0 = null, h0 = 0, moved = false;
    grab.addEventListener('pointerdown', e => {
      if (!mobileMQ.matches || e.target.closest('button:not(#sheet-btn)')) return;
      y0 = e.clientY; h0 = side.offsetHeight; moved = false;
      side.classList.add('dragging');
    });
    window.addEventListener('pointermove', e => {
      if (y0 === null) return;
      const dy = y0 - e.clientY;
      if (Math.abs(dy) > 6) moved = true;
      if (moved) side.style.height = Math.max(120, Math.min(window.innerHeight - 40, h0 + dy)) + 'px';
    });
    const end = () => {
      if (y0 === null) return;
      y0 = null; side.classList.remove('dragging');
      if (!moved) return setSheet(sheet === 'peek' ? 'half' : sheet === 'half' ? 'full' : 'peek');
      const f = side.offsetHeight / window.innerHeight;
      setSheet(f < 0.33 ? 'peek' : f < 0.75 ? 'half' : 'full');
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    $('search').addEventListener('focus', () => { if (mobileMQ.matches) setSheet('full'); });
  }

  // ---- sidebar ----
  const bar = (d, t) => `<div class="bar"><i style="width:${t ? (100 * d / t).toFixed(1) : 0}%"></i></div>`;

  function setTab(t) {
    tab = t; save('rdr2map.tab', t);
    document.body.dataset.tab = t;
    $('search').placeholder = t === 'wild' ? 'Search wildlife…' : t === 'chal' ? 'Search challenges…' : 'Search collectibles…';
    for (const b of document.querySelectorAll('[data-tabbtn]')) b.setAttribute('aria-selected', b.dataset.tabbtn === t);
    renderList();
    $('list').scrollTop = 0;
  }

  function renderHeader() {
    const [d, t] = progress(D.items.filter(i => !REF.has(i.c)));
    const p = t ? Math.floor(100 * d / t) : 0;
    $('pct').textContent = p + '%';
    $('ring').style.setProperty('--p', (t ? d / t : 0) * 360 + 'deg');
    const cc = currentCh();
    $('overall-count').textContent = `${d} / ${t} collected · ${cc > CH.length ? 'Story complete' : chName(cc)}`;
    if (region) {
      const r = REG[region], [rd, rt] = progress(regionItems(region));
      $('scope').innerHTML = `<div class="scope-region"><div><div class="scope-state">${esc(r.state)}</div>
        <div class="scope-name">${esc(r.name)}</div></div><button class="close" id="clear-region" aria-label="Show all regions">✕</button></div>
        <div class="scope-prog">${bar(rd, rt)}<span>${rd}/${rt}</span></div>`;
      $('clear-region').onclick = () => { selectRegion(null); goHome(); };
    } else {
      $('scope').innerHTML = `<div class="scope-hint">Click a region on the map to list only what's there.</div>`;
    }
  }

  function itemRow(it) {
    const isDone = done.has(it.id);
    const sub = it.c === 'card' ? `#${it.num}` : it.sub || '';
    return `<li class="item ${isDone ? 'is-done' : ''}">
      <label class="pick" aria-label="Collected: ${esc(it.n)}"><input type="checkbox" data-id="${it.id}" ${isDone ? 'checked' : ''}><span class="tick"></span></label>
      <button class="view" data-view="${it.id}">
        ${it.img ? `<img class="thumb" src="${it.img}" alt="" loading="lazy">` : ''}
        <span class="txt"><span class="nm">${esc(it.n)}</span>${sub ? `<span class="meta">${esc(sub)}</span>` : ''}
        ${it.d ? `<span class="desc">${esc(it.d)}</span>` : ''}</span></button>
      ${it.l.length ? `<button class="loc" data-loc="${it.id}" title="Show on map" aria-label="Show ${esc(it.n)} on map">⌖</button>` : ''}
    </li>`;
  }

  // unlocked items as rows; locked ones folded into "N more after …" rows grouped by what they wait for
  function itemRows(its) {
    let html = '';
    const lockedBy = new Map();
    for (const it of its) {
      const n = needs(it);
      if (!n.length) { html += itemRow(it); continue; }
      const k = n.join('|');
      lockedBy.set(k, [...(lockedBy.get(k) || []), it]);
    }
    for (const [k, its] of lockedBy) {
      html += `<li class="locked-row"><div class="lock-h">🔒 ${its.length > 1 ? `${its.length} more unlock` : `${esc(its[0].n)} unlocks`} after:</div><ul class="chips">${k.split('|').map(chip).join('')}</ul></li>`;
    }
    return html;
  }

  function renderItems() {
    const list = scoped();
    let html = '';
    const lockedTotal = D.items.filter(i => !unlocked(i)).length;
    if (lockedTotal && !query) {
      const cc = currentCh();
      html += `<div class="story-banner"><div><b>${lockedTotal}</b> collectibles are waiting on story progress. You're set to <b>${esc(chName(cc))}</b>.</div>
        <button class="pill sm" data-gostory="ch${cc}">Update story progress</button></div>`;
    }
    for (const [gid, gname] of Object.entries(GROUPS)) {
      const cats = D.cats.filter(c => c.group === gid);
      let sect = '';
      for (const c of cats) {
        const all = D.items.filter(i => i.c === c.id && (!region || i.r.includes(region)));
        if (!all.length) continue;
        const [d, t] = progress(all);
        const its = list.filter(i => i.c === c.id);
        if (query && !its.length) continue;
        const open = openCats.has(c.id) || (query && its.length);
        const catNeeds = [...new Set(S.catReq[c.id] || [])].filter(t => !met(t));
        let body = '';
        if (catNeeds.length) {
          body = `<div class="cat-lock"><div class="lock-h">🔒 Locked — do these first:</div><ul class="chips">${catNeeds.map(chip).join('')}</ul></div>`;
        } else if (open) {
          if (c.id === 'herb') {
            body = `<p class="note pad">Pick the plants you're looking for. Only those go on the map.</p><div class="plant-pick">${[...new Set(its.map(i => i.g))].sort().map(g => `<button class="plant ${plants.has(g) ? 'on' : ''}" data-plant="${esc(g)}" aria-pressed="${plants.has(g)}">${esc(g)} <small>${its.filter(i => i.g === g).length}</small></button>`).join('')}</div>`
              + (plants.size ? `<button class="link plant-clear" data-plant="">Clear all</button>` : '');
          } else if (GROUPED.has(c.id)) {
            for (const g of [...new Set(its.map(i => i.g))]) {
              const gi = its.filter(i => i.g === g), allG = all.filter(i => i.g === g);
              const [gd, gt] = progress(allG);
              const rw = gi[0].rw ? `<span class="rw">Reward: ${esc(gi[0].rw)}</span>` : '';
              body += `<div class="sub-h"><span>${esc(g)}</span><span class="${gd === gt ? 'full' : ''}">${gd}/${gt}</span>${rw}</div><ul>${itemRows(gi)}</ul>`;
            }
          } else body = `<ul>${itemRows(its)}</ul>`;
          if (REF.has(c.id)) body += '<p class="note">Reference layer: not counted towards 100%.</p>';
        }
        const hidden = hiddenCats.has(c.id) || (!layersOn && NONCOL.includes(c.id));
        sect += `<section class="cat ${open ? 'open' : ''} ${d === t ? 'complete' : ''} ${catNeeds.length ? 'is-locked' : ''}" style="--c:${c.color}">
          <div class="cat-h">
            <button class="cat-btn" data-open="${c.id}" aria-expanded="${!!open}">
              <span class="pin sm"><img src="${ICON[c.id]}" alt=""></span>
              <span class="cat-name">${catNeeds.length ? '🔒 ' : ''}${esc(c.name)}</span>
              <span class="cat-count">${d}/${t}</span>
              <span class="chev">▾</span>
            </button>
            <button class="eye ${hidden ? 'off' : ''}" data-eye="${c.id}" title="${hidden ? 'Show' : 'Hide'} on map" aria-label="${hidden ? 'Show' : 'Hide'} ${esc(c.name)} on map">${hidden ? '◌' : '◉'}</button>
          </div>
          ${bar(d, t)}
          ${body && (open || catNeeds.length) ? `<div class="cat-body">${body}</div>` : ''}
        </section>`;
      }
      if (sect) html += `<h2 class="grp">${gname}</h2>${sect}`;
    }
    if (region) {
      html += `<p class="note pad">Gang member requests aren't tied to a region — close the region to see them.</p>`;
    } else if (!query) {
      html += `<h2 class="grp">Regions</h2><div class="regions">`;
      for (const st of [...new Set(D.regions.map(r => r.state))]) {
        html += `<div class="state">${esc(st)}${st === 'New Austin' && !reached(7) ? ' · opens in the Epilogue' : ''}</div>`;
        for (const r of D.regions.filter(r => r.state === st)) {
          const [d, t] = progress(regionItems(r.id));
          html += `<button class="reg ${d === t ? 'complete' : ''}" data-region="${r.id}"><span>${esc(r.name)}</span><span class="cat-count">${d}/${t}</span>${bar(d, t)}</button>`;
        }
      }
      html += `</div>`;
    }
    if (!html) html = `<p class="note pad">Nothing matches “${esc(query)}”.</p>`;
    return html;
  }

  // what opens at each chapter, for the progression timeline
  function opensAt(n) {
    const out = [];
    for (const c of D.cats) {
      const req = S.catReq[c.id] || [];
      const chs = req.map(t => /^ch(\d)$/.exec(t)).filter(Boolean).map(m => +m[1]);
      if (Math.max(1, ...chs) !== n) continue;
      const people = req.filter(t => START[t] || MISSION[t]).map(t => START[t] ? `meet ${START[t].who}` : `“${MISSION[t].n}”`);
      out.push(`<li class="opens-item"><span class="pin xs" style="--c:${c.color}"><img src="${ICON[c.id]}" alt=""></span>${esc(c.name)}${people.length ? ` <span class="muted">— ${esc(people.join(', '))}</span>` : ''}</li>`);
    }
    const extra = D.items.filter(it => [...(S.itemReq[it.id] || []), ...(it.q || []), ...(inNewAustin(it) ? ['ch7'] : [])].includes('ch' + n) && !(S.catReq[it.c] || []).includes('ch' + n));
    if (extra.length) out.push(`<li class="opens-item muted">+ ${extra.length} more collectibles${n === 7 ? ' (New Austin opens)' : ''}</li>`);
    return out.length ? `<div class="opens"><div class="opens-h">Opens in this chapter</div><ul>${out.join('')}</ul></div>` : '';
  }

  function renderStory() {
    const cc = currentCh();
    let html = `<div class="story-now"><label for="cur-ch">I'm currently in</label>
      <select id="cur-ch">${CH.map(c => `<option value="${c.n}" ${c.n === cc ? 'selected' : ''}>${esc(c.name)} — ${esc(c.place)}</option>`).join('')}
      <option value="${CH.length + 1}" ${cc > CH.length ? 'selected' : ''}>Finished the story</option></select>
      <p class="note">Pick your chapter, or tick missions as you play. Collectibles unlock as you go.</p></div><ol class="timeline">`;
    for (const c of CH) {
      const state = chDone(c.n) ? 'done' : c.n === cc ? 'current' : 'future';
      const req = c.missions.filter(([, , opt]) => !opt);
      const md = c.missions.filter(([id]) => story.has(id)).length;
      const open = openChs.has(c.n) || (c.n === cc && !openChs.has(-c.n));
      const starts = S.starts.filter(s => s.ch === c.n);
      let body = '';
      if (open) {
        body += opensAt(c.n);
        if (starts.length) {
          body += `<div class="opens-h">Meet first</div><ul>`;
          for (const s of starts) {
            const isDone = story.has(s.id);
            body += `<li class="item start-row ${isDone ? 'is-done' : ''}"><label><input type="checkbox" data-mission="${s.id}" ${isDone ? 'checked' : ''}><span class="tick"></span>
              <span class="txt"><span class="nm">${esc(s.who)}</span><span class="meta">${esc(s.mission)} · unlocks ${unlockNames(s)}</span>
              <span class="desc">${esc(s.d)}</span></span></label>
              <button class="loc" data-start="${s.id}" title="Show on map" aria-label="Show ${esc(s.who)} on map">⌖</button></li>`;
          }
          body += `</ul>`;
        }
        body += `<div class="opens-h">Missions</div><ul>`;
        for (const [id, n, opt] of c.missions) {
          const isDone = story.has(id);
          const unlocks = D.cats.filter(k => (S.catReq[k.id] || []).includes(id)).map(k => k.name);
          const tr = Object.entries(S.itemReq).filter(([, q]) => q.includes(id)).length;
          const tag = [opt ? 'optional' : '', unlocks.length ? `unlocks ${unlocks.join(', ')}` : '', tr ? `unlocks ${tr} collectible${tr > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · ');
          body += `<li class="item ${isDone ? 'is-done' : ''}"><label><input type="checkbox" data-mission="${id}" ${isDone ? 'checked' : ''}><span class="tick"></span>
            <span class="txt"><span class="nm">${esc(n)}</span>${tag ? `<span class="meta">${esc(tag)}</span>` : ''}</span></label></li>`;
        }
        body += `</ul>${c.camp ? `<button class="link camp-link" data-camp="${c.n}">⌖ Show ${esc(c.place)} camp on the map</button>` : ''}
          <label class="ch-done"><input type="checkbox" data-chdone="${c.n}" ${chDone(c.n) ? 'checked' : ''}> <span>${esc(c.name)} complete</span></label>`;
      }
      html += `<li class="ch ${state} ${open ? 'open' : ''}"><span class="node" aria-hidden="true">${state === 'done' ? '✓' : c.n > CH.length - 2 ? 'E' : c.n}</span>
        <button class="ch-btn" data-ch="${c.n}" aria-expanded="${open}"><span class="ch-name">${esc(c.name)}<span class="ch-place">${esc(c.place)}</span></span>
          <span class="cat-count">${md}/${c.missions.length}</span><span class="chev">▾</span></button>
        ${bar(req.filter(([id]) => story.has(id)).length, req.length)}
        ${open ? `<div class="ch-body">${body}</div>` : ''}</li>`;
    }
    return html + `</ol>`;
  }

  // ---- wildlife habitats (loaded on demand: index first, each area file only when switched on) ----
  const WILD_COLORS = ['#e4473c', '#4fa3d9', '#f2d27a', '#8fbf5a', '#b77fd1', '#e88a3a', '#3fc1b0', '#f07fb0', '#c7c7c7', '#7d8cf0'];
  let wildIndex = null;
  const wildLayers = {};
  const loadWildIndex = () => wildIndex ? Promise.resolve(wildIndex)
    : fetch('wildlife.json').then(r => r.json()).then(d => (wildIndex = d));
  const wildColor = id => WILD_COLORS[[...wildOn].indexOf(id) % WILD_COLORS.length];
  function wildPopup(sp) {
    return `<div class="pop">
      <div class="pop-cat">${esc(sp.g)} &middot; habitat</div><div class="pop-title">${esc(sp.n)}</div>
      ${sp.img ? `<div class="pop-art"><img src="${sp.img}" alt="${esc(sp.n)}"></div>` : ''}
      <p><b>When:</b> ${esc(sp.cond)}</p>
      ${sp.hab ? `<p><b>Where:</b> ${esc(sp.hab)}</p>` : ''}
      ${sp.temper ? `<div class="hunt-box"><div class="hunt-row">${sp.size ? `<span class="tag-chip">${esc(sp.size)}</span>` : ''}<span class="tag-chip t-${esc(sp.temper.toLowerCase().replace(/\s+/g, '-'))}">${esc(sp.temper)}</span></div>
        ${sp.kit ? `<dl class="kit"><dt>Weapon</dt><dd>${esc(sp.kit[0])}</dd><dt>Ammo</dt><dd>${esc(sp.kit[1])}</dd><dt>Also works</dt><dd>${esc(sp.kit[2])}</dd><dt>Aim</dt><dd>${esc(sp.kit[3])}</dd></dl>` : ''}
        <ul class="hunt-tips">${(sp.tips || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
      ${sp.latin ? `<button class="btn sound" data-sound="${esc(sp.latin)}">🔊 Play its call</button><div class="sound-credit" data-credit="${esc(sp.latin)}"></div>` : ''}
      ${sp.spots ? `<p class="pop-rw">${sp.spots.toLocaleString()} spawn spots inside this border. The brighter the heat map, the more spawn spots are packed there.</p>` : ''}
      ${sp.g.startsWith('Legendary') ? '<p class="pop-rw">The circle is its search area around the game-data spawn point. Tick it off in the Collectibles tab.</p>' : ''}
      <button class="btn ghost" data-wildoff="${sp.id}">Hide ${esc(sp.n)}</button></div>`;
  }
  async function setWild(id, on, fly = true) {
    on ? wildOn.add(id) : wildOn.delete(id);
    save('rdr2map.wild', [...wildOn]);
    wildLayers[id]?.remove(); delete wildLayers[id];
    if (on) {
      const sp = (await loadWildIndex()).find(s => s.id === id);
      const { a: rings, p: pts } = await fetch(`wild/${id}.json`).then(r => r.json());
      if (!wildOn.has(id)) return; // switched off while loading
      const c = wildColor(id);
      const area = L.polygon(rings, { color: c, weight: 2, opacity: 0.95, fillColor: c, fillOpacity: pts.length ? 0.06 : 0.18 })
        .bindPopup(() => wildPopup(sp), popOpts);
      // heat map of the spawn points: where they cluster is where you'll most often find the animal
      const heat = pts.length && L.heatLayer ? L.heatLayer(pts, { radius: 14, blur: 16, minOpacity: 0.25, max: Math.min(8, Math.max(1, pts.length / 150)),
        gradient: { 0.3: '#3b2a5c', 0.55: '#b3261e', 0.8: '#f2a33a', 1: '#fff3b0' } }) : null;
      wildLayers[id] = L.layerGroup(heat ? [heat, area] : [area]).addTo(map);
      wildLayers[id].getBounds = () => area.getBounds();
      wildLayers[id].setStyle = o => area.setStyle(o);
      if (fly) {
        if (mobileMQ.matches) setSheet('peek');
        map.flyToBounds(wildLayers[id].getBounds(), { ...sheetPad(), maxZoom: 5, duration: 0.8 });
      }
    }
    // recolour so each visible animal keeps a distinct border colour
    for (const k of wildOn) wildLayers[k]?.setStyle({ color: wildColor(k), fillColor: wildColor(k) });
    renderLegend();
    if (tab === 'wild') renderList();
  }
  // ---- animal calls: a real recording of the species from Wikimedia Commons (free-licensed), looked up on demand ----
  const player = new Audio();
  const soundCache = {};
  async function findSound(latin) {
    if (latin in soundCache) return soundCache[latin];
    const q = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=10'
      + '&gsrsearch=' + encodeURIComponent(`"${latin}" filetype:audio`) + '&prop=videoinfo&viprop=url|derivatives|extmetadata&viextmetadatafilter=LicenseShortName';
    try {
      const d = await fetch(q).then(r => r.json());
      const canOgg = !!player.canPlayType('audio/ogg; codecs="vorbis"');
      for (const p of Object.values(d.query?.pages || {}).sort((a, b) => a.index - b.index)) {
        const vi = p.videoinfo?.[0]; if (!vi) continue;
        const mp3 = (vi.derivatives || []).find(x => /mpeg|mp3/i.test(x.type || x.transcodekey || ''));
        const src = mp3?.src || (/\.(mp3|wav|m4a)$/i.test(vi.url) || (canOgg && /\.(ogg|oga)$/i.test(vi.url)) ? vi.url : null);
        if (src) return (soundCache[latin] = { src, title: p.title.replace(/^File:/, ''), page: vi.descriptionurl, lic: vi.extmetadata?.LicenseShortName?.value || '' });
      }
    } catch { /* offline or blocked: fall through to "not found" */ }
    return (soundCache[latin] = null);
  }
  function showCredit(latin, root) {
    const el = root.querySelector(`[data-credit="${CSS.escape(latin)}"]`), s = soundCache[latin];
    if (!el) return;
    el.innerHTML = s ? `Real recording of this species: <a href="${s.page}" target="_blank" rel="noopener">${esc(s.title)}</a>${s.lic ? ` (${esc(s.lic)})` : ''}, Wikimedia Commons.`
      : s === null ? `No recording found. <a href="https://www.youtube.com/results?search_query=${encodeURIComponent('RDR2 ' + latin + ' sound')}" target="_blank" rel="noopener">Search for one ▶</a>` : '';
  }
  map.on('popupopen', e => { const b = e.popup.getElement().querySelector('[data-sound]'); if (b) findSound(b.dataset.sound).then(() => showCredit(b.dataset.sound, e.popup.getElement())); });
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-sound]'); if (!b) return;
    const latin = b.dataset.sound, root = b.closest('.pop') || document;
    if (!player.paused && player.dataset.latin === latin) { player.pause(); b.textContent = '🔊 Play its call'; return; }
    // iOS only allows play() straight from a tap, so start it synchronously when the recording is already known
    if (!(latin in soundCache)) { b.textContent = 'Finding a recording…'; await findSound(latin); }
    showCredit(latin, root);
    const s = soundCache[latin];
    if (!s) { b.textContent = '🔇 No recording'; return; }
    player.src = s.src; player.dataset.latin = latin;
    player.play().then(() => { b.textContent = '⏸ Stop'; }).catch(() => { b.textContent = '🔊 Tap again to play'; });
    player.onended = () => { b.textContent = '🔊 Play its call'; };
  });

  function renderLegend() {
    let el = $('wild-legend');
    if (!el) { el = document.createElement('div'); el.id = 'wild-legend'; document.body.appendChild(el); }
    const on = wildIndex ? wildIndex.filter(s => wildOn.has(s.id)) : [];
    el.hidden = !on.length;
    el.innerHTML = on.map(s => `<button data-wildfly="${s.id}"><i style="background:${wildColor(s.id)}"></i>${esc(s.n)}</button>`).join('')
      + (on.length ? '<button class="wl-clear" data-wildclear="1" aria-label="Hide all habitats">✕</button>' : '');
  }
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-wildfly]'), c = e.target.closest('[data-wildclear]'), off = e.target.closest('[data-wildoff]');
    if (f) map.flyToBounds(wildLayers[f.dataset.wildfly].getBounds(), { ...sheetPad(), maxZoom: 5, duration: 0.8 });
    if (c) [...wildOn].forEach(id => setWild(id, false, false));
    if (off) { map.closePopup(); setWild(off.dataset.wildoff, false, false); }
  });

  function renderWild() {
    if (!wildIndex) { loadWildIndex().then(() => tab === 'wild' && renderList()); return '<p class="note pad">Loading wildlife…</p>'; }
    const q = query;
    let html = `<div class="wild-intro">Switch an animal on to see the area where it spawns, outlined on the map, plus when it appears.
      Areas are drawn around every spawn point in the game's data${wildOn.size ? ` · <button class="link" data-wildclear="1">hide all (${wildOn.size})</button>` : ''}</div>`;
    for (const g of ['Legendary animals', 'Legendary fish', 'Animals', 'Birds', 'Fish', 'Wild horses']) {
      const list = wildIndex.filter(s => s.g === g && (!q || s.n.toLowerCase().includes(q)));
      if (!list.length) continue;
      html += `<h2 class="grp">${g}</h2><ul class="wild-list">`;
      for (const s of list) {
        const on = wildOn.has(s.id);
        html += `<li class="wild-row ${on ? 'on' : ''}" style="--c:${on ? wildColor(s.id) : 'var(--line)'}">
          ${s.img ? `<img class="thumb" src="${s.img}" alt="" loading="lazy">` : '<span class="thumb"></span>'}
          <span class="txt"><span class="nm">${esc(s.n)}${s.temper && s.temper !== 'Harmless' ? ` <span class="tag-chip sm t-${esc(s.temper.toLowerCase().replace(/\s+/g, '-'))}">${esc(s.temper)}</span>` : ''}</span><span class="desc">${esc(s.cond)}</span></span>
          <label class="switch-ui"><input type="checkbox" role="switch" data-wild="${s.id}" ${on ? 'checked' : ''} aria-label="Show ${esc(s.n)} habitat"><span></span></label></li>`;
      }
      html += '</ul>';
    }
    return html;
  }

  // ---- challenges: 9 lists of 10 ranks; the game opens each rank only after the one before ----
  const CHAL = RDR.challenges;
  const chalLayer = L.layerGroup().addTo(map);
  let chalOn = null;
  const chalKey = (c, n) => `chal-${c.id}-${n}`;
  const chalCur = c => { let n = 1; while (n <= 10 && story.has(chalKey(c, n))) n++; return n; }; // 11 = list finished
  function setChal(k, on) {
    const [, id, n] = /^(.+)-(\d+)$/.exec(k), c = CHAL.find(x => x.id === id);
    for (let i = 1; i <= 10; i++) if (on && i <= +n) story.add(chalKey(c, i)); else if (!on && i >= +n) story.delete(chalKey(c, i));
    save('rdr2map.story', [...story]);
    renderList();
  }
  async function showChal(k) {
    chalLayer.clearLayers();
    if (chalOn === k) { chalOn = null; return renderList(); }
    chalOn = k;
    const [, id, n] = /^(.+)-(\d+)$/.exec(k), c = CHAL.find(x => x.id === id), r = c.ranks[n - 1];
    const pts = r.pts || [];
    if (r.route && pts.length > 1) L.polyline(pts.map(p => p.slice(0, 2)), { color: '#f2d27a', weight: 3, opacity: 0.9, dashArray: '6 8', interactive: false }).addTo(chalLayer);
    pts.forEach((p, i) => L.marker(p.slice(0, 2), { icon: pinIcon(`<div class="pin chal-pin"><b>${r.route ? i + 1 : '★'}</b></div>`, 'camp'), zIndexOffset: 600, title: p[2] })
      .bindPopup(`<div class="chal-pop"><div class="pop-kicker">${esc(c.n)} #${n}</div><b>${esc(p[2].replace(/^\d+\. /, ''))}</b><p>${esc(r.t)}</p></div>`, popOpts).addTo(chalLayer));
    renderList();
    for (const w of r.wild || []) await setWild(w, true, false);
    if (pts.length === 1) flyToPoint(pts[0].slice(0, 2), null);
    else if (pts.length) { if (mobileMQ.matches) setSheet('peek'); map.flyToBounds(L.latLngBounds(pts.map(p => p.slice(0, 2))), { ...sheetPad(), maxZoom: 6, duration: 0.8 }); }
    else if (r.wild) { if (mobileMQ.matches) setSheet('peek'); map.flyToBounds(wildLayers[r.wild[0]].getBounds(), { ...sheetPad(), maxZoom: 5, duration: 0.8 }); }
  }
  function renderChal() {
    const total = CHAL.reduce((s, c) => s + chalCur(c) - 1, 0);
    let html = `<div class="wild-intro">${total}/90 ranks done. Each list appears in your game the first time you do its opening task; after that its ranks open one at a time, in order.
      Tick the rank you've reached (earlier ones tick too), and tap ⌖ for where to go: numbered pins are the order to do them in.</div>`;
    for (const c of CHAL) {
      const cur = chalCur(c), open = openCats.has('chal-' + c.id) || !!query;
      const ranks = c.ranks.map((r, i) => [r, i + 1]).filter(([r]) => !query || (r.t + ' ' + r.how).toLowerCase().includes(query));
      if (query && !ranks.length) continue;
      let body = '';
      if (open) {
        body = `<p class="note chal-unlock"><b>Unlock:</b> ${esc(c.unlock)}</p><ul>`;
        for (const [r, n] of ranks) {
          const k = `${c.id}-${n}`, isDone = n < cur, need = (r.q || []).filter(t => !met(t));
          body += `<li class="item chal ${isDone ? 'is-done' : ''} ${n > cur ? 'is-later' : ''} ${n === cur ? 'is-cur' : ''}">
            <label><input type="checkbox" data-chal="${k}" ${isDone ? 'checked' : ''}><span class="tick"></span>
              <span class="txt"><span class="nm"><span class="rank">${n}</span>${esc(r.t)}</span>${isDone ? '' : `<span class="desc">${esc(r.how)}</span>`}</span></label>
            ${r.pts || r.wild ? `<button class="loc ${chalOn === k ? 'on' : ''}" data-chmap="${k}" title="${chalOn === k ? 'Hide from map' : 'Show on map'}" aria-label="Show rank ${n} on map">⌖</button>` : ''}
            ${need.length && !isDone ? `<div class="chal-need"><div class="lock-h">🔒 Needs first:</div><ul class="chips">${need.map(chip).join('')}</ul></div>` : ''}
          </li>`;
        }
        body += '</ul>';
      }
      const t = c.ranks[Math.min(cur, 10) - 1].t;
      html += `<section class="cat ${open ? 'open' : ''} ${cur > 10 ? 'complete' : ''}" style="--c:#c9a86a">
        <div class="cat-h"><button class="cat-btn" data-open="chal-${c.id}" aria-expanded="${open}">
          <span class="cat-name">${esc(c.n)}<span class="chal-next">${cur > 10 ? 'Complete' : `Next: #${cur} ${esc(t)}`}</span></span>
          <span class="cat-count">${cur - 1}/10</span><span class="chev">▾</span></button></div>
        ${bar(cur - 1, 10)}${open ? `<div class="cat-body">${body}</div>` : ''}</section>`;
    }
    return html || `<p class="note pad">Nothing matches “${esc(query)}”.</p>`;
  }

  function renderList() {
    const el = $('list'), top = el.scrollTop;
    el.innerHTML = (tab === 'story' ? renderStory() : tab === 'wild' ? renderWild() : tab === 'chal' ? renderChal() : renderItems()) + footerHtml();
    el.scrollTop = top;
    const sel = $('cur-ch');
    if (sel) sel.onchange = () => {
      const n = +sel.value;
      for (let k = n; k <= CH.length; k++) story.delete('chdone-' + k);
      reachChapter(n);
      save('rdr2map.story', [...story]);
      refresh();
    };
  }

  function refresh() { renderHeader(); renderList(); refreshMarkers(); }

  $('list').addEventListener('click', e => {
    const v = e.target.closest('[data-view]');
    if (v) {
      const it = ITEM[v.dataset.view];
      if (!it.l.length) return showDetail(it);
      return v.parentElement.querySelector('[data-loc]').click();
    }
    const cm = e.target.closest('[data-chmap]');
    if (cm) return showChal(cm.dataset.chmap);
    const pl = e.target.closest('[data-plant]');
    if (pl) {
      const id = pl.dataset.plant;
      if (!id) plants.clear(); else if (plants.has(id)) plants.delete(id);
      else { plants.add(id); save('rdr2map.plants', [...plants]); return goTo(D.items.filter(i => i.c === 'herb' && i.g === id)); }
      save('rdr2map.plants', [...plants]); return refresh();
    }
    const t = e.target.closest('[data-open],[data-eye],[data-loc],[data-region],[data-story],[data-start],[data-gostory],[data-ch],[data-camp]');
    if (!t) return;
    const ds = t.dataset;
    if (ds.open) {
      openCats.has(ds.open) ? openCats.delete(ds.open) : openCats.add(ds.open);
      save('rdr2map.openCats', [...openCats]); renderList();
    } else if (ds.eye) {
      if (!layersOn && NONCOL.includes(ds.eye)) { layersOn = true; hiddenCats.delete(ds.eye); save('rdr2map.layersOn', true); }
      else hiddenCats.has(ds.eye) ? hiddenCats.delete(ds.eye) : hiddenCats.add(ds.eye);
      save('rdr2map.hiddenCats', [...hiddenCats]); refresh(); renderLayers();
    } else if (ds.region) {
      selectRegion(ds.region);
    } else if (ds.story) {
      setStory(ds.story, true);
    } else if (ds.start) {
      const s = START[ds.start];
      refreshMarkers();
      flyToPoint(s.l, map.hasLayer(startMarkers[s.id]) ? startMarkers[s.id] : null);
    } else if (ds.gostory) {
      const m = /^ch(\d)$/.exec(ds.gostory);
      const n = m ? Math.min(+m[1], CH.length) : MISSION[ds.gostory].ch;
      openChs.add(n); save('rdr2map.openChs', [...openChs]);
      setTab('story');
      if (mobileMQ.matches) setSheet('full');
    } else if (ds.ch) {
      const n = +ds.ch, cc = currentCh();
      const open = openChs.has(n) || (n === cc && !openChs.has(-n));
      openChs.delete(n); openChs.delete(-n);
      if (!open) openChs.add(n); else if (n === cc) openChs.add(-n); // -n remembers "closed" for the auto-open current chapter
      save('rdr2map.openChs', [...openChs]); renderList();
    } else if (ds.camp) {
      flyToPoint(CH[+ds.camp - 1].camp, null);
    } else if (ds.loc) goTo(ITEM[ds.loc]);
  });
  function goTo(its) {
    if (!Array.isArray(its)) its = [its];
    const it = its[0];
    hiddenCats.delete(it.c); save('rdr2map.hiddenCats', [...hiddenCats]);
    if (NONCOL.includes(it.c) && !layersOn) { layersOn = true; save('rdr2map.layersOn', true); renderLayers(); }
    if (it.c === 'herb') { plants.add(it.g); save('rdr2map.plants', [...plants]); }
    const ms = its.flatMap(it => markers[it.id].filter(x => shownHere(it, x)).map(x => x.m));
    if (done.has(it.id) && !showDone) { showDone = true; $('show-done').checked = true; save('rdr2map.showDone', true); }
    refresh();
    if (ms.length === 1) flyToPoint(ms[0].getLatLng(), ms[0]);
    else if (ms.length) {
      if (mobileMQ.matches) setSheet('peek');
      map.flyToBounds(L.latLngBounds(ms.map(m => m.getLatLng())), { ...sheetPad(), maxZoom: 6, duration: 0.8 });
    }
  }
  $('list').addEventListener('change', e => {
    const ds = e.target.dataset;
    if (ds.id) toggle(ds.id, e.target.checked);
    else if (ds.mission) setStory(ds.mission, e.target.checked);
    else if (ds.chdone) setStory('chdone-' + ds.chdone, e.target.checked);
    else if (ds.wild) setWild(ds.wild, e.target.checked);
    else if (ds.chal) setChal(ds.chal, e.target.checked);
  });
  for (const b of document.querySelectorAll('[data-tabbtn]')) b.addEventListener('click', () => setTab(b.dataset.tabbtn));
  let qt;
  $('search').addEventListener('input', e => {
    clearTimeout(qt);
    qt = setTimeout(() => { query = e.target.value.trim().toLowerCase(); if (query && tab === 'story') setTab('items'); refresh(); }, 120);
  });
  $('show-done').checked = showDone;
  $('show-done').addEventListener('change', e => { showDone = e.target.checked; save('rdr2map.showDone', showDone); refreshMarkers(); });

  // ---- progress backup (Safari can clear data of sites not opened for 7 days) ----
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  function footerHtml() {
    const tip = isIOS && !standalone && !load('rdr2map.tipClosed', false)
      ? `<div class="tip"><b>Tip:</b> tap <b>Share</b> → <b>Add to Home Screen</b>. It opens full-screen like an app, and Safari won't clear your progress. <button class="link" data-act="tip">Dismiss</button></div>` : '';
    return `${tip}<h2 class="grp">Your progress</h2><div class="prog-actions">
      <button class="pill" data-act="backup">Back up</button><button class="pill" data-act="restore">Restore</button>
      <button class="pill danger" data-act="reset">Reset</button></div>
      <p class="note">Collectibles and story progress are saved on this device. Back up gives you a code you can restore later or on another device.</p>`;
  }
  async function act(a) {
    if (a === 'tip') { save('rdr2map.tipClosed', true); renderList(); }
    if (a === 'reset' && confirm('Reset all collected items and story progress? This cannot be undone.')) {
      done.clear(); story.clear(); save('rdr2map.done', []); save('rdr2map.story', []); refresh();
    }
    if (a === 'backup') {
      const code = 'RDR2MAP:' + btoa(JSON.stringify({ d: [...done], s: [...story] }));
      try {
        if (navigator.share) await navigator.share({ title: 'RDR2 map progress', text: code });
        else { await navigator.clipboard.writeText(code); alert('Backup code copied to clipboard.'); }
      } catch (e) { if (e.name !== 'AbortError') prompt('Copy this backup code:', code); }
    }
    if (a === 'restore') {
      const code = prompt('Paste your backup code:');
      if (!code) return;
      try {
        const data = JSON.parse(atob(code.trim().replace(/^RDR2MAP:/, '')));
        const ids = (Array.isArray(data) ? data : data.d).filter(id => ITEM[id]); // older codes were a bare array
        const st = Array.isArray(data) ? [] : data.s || [];
        if (!confirm(`Restore ${ids.length} collected items and ${st.length} story steps? This replaces your current progress.`)) return;
        done.clear(); ids.forEach(id => done.add(id)); save('rdr2map.done', [...done]);
        story.clear(); st.forEach(id => story.add(id)); save('rdr2map.story', [...story]);
        refresh();
      } catch { alert("That doesn't look like a valid backup code."); }
    }
  }
  $('list').addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) act(b.dataset.act); });

  setSheet('peek');
  setTab(tab);
  if (wildOn.size) loadWildIndex().then(() => [...wildOn].forEach(id => setWild(id, true, false)));
  refresh();
  renderLayers();
  goHome(false);
  mobileMQ.addEventListener('change', () => setSheet(sheet));
})();
