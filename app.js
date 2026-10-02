(() => {
  'use strict';
  const D = RDR.data;
  const CAT = Object.fromEntries(D.cats.map(c => [c.id, c]));
  const REG = Object.fromEntries(D.regions.map(r => [r.id, r]));
  const ITEM = Object.fromEntries(D.items.map(i => [i.id, i]));
  const GROUPS = { main: 'Main collectibles', hunt: 'Hunting & wildlife', side: 'Side missions & unique items', money: 'Money & valuables' };
  const GROUPED = new Set(['card', 'treasure', 'hunt', 'exotic', 'gear', 'loot']);
  const ICON = {
    dino: 'icons/dino.png', carving: 'icons/carving.png', dream: 'icons/dream.png', card: 'icons/card.svg',
    treasure: 'icons/treasure.png', grave: 'icons/grave.png', animal: 'icons/animal.png', fish: 'icons/fish.png',
    hunt: 'icons/hunt.svg', exotic: 'icons/sp_orchid_lady_of_the_night.png', gang: 'icons/gang.svg', gear: 'icons/weapon.svg', loot: 'icons/goldbar.svg',
  };
  const iconOf = it => it.ic ? (/^(weapon|hat|goldbar|stash)$/.test(it.ic) ? `icons/${it.ic}.svg` : `icons/${it.ic}.png`) : ICON[it.c];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---- persisted state (per-viewer, so localStorage is the right home) ----
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: progress lasts this visit only */ } };
  const done = new Set(load('rdr2map.done', []).filter(id => ITEM[id]));
  // ponytail: exotics have ~250 spawn markers, so they start hidden to keep the first view readable
  const hiddenCats = new Set(load('rdr2map.hiddenCats', ['exotic']));
  const openCats = new Set(load('rdr2map.openCats', []));
  let showDone = load('rdr2map.showDone', false);
  let region = null;
  let query = '';
  const $ = id => document.getElementById(id);
  const mobileMQ = matchMedia('(max-width: 800px)');
  const canHover = matchMedia('(hover: hover)').matches;

  // ---- map ----
  const bounds = L.latLngBounds([-190, 0], [0, 256]);
  const map = L.map('map', {
    crs: L.CRS.Simple, minZoom: 1, maxZoom: 9, zoomSnap: 0.5, zoomControl: false,
    maxBounds: bounds.pad(0.15), maxBoundsViscosity: 0.8,
  });
  L.tileLayer('tiles/{z}/{x}_{y}.jpg', {
    bounds, noWrap: true, minNativeZoom: 2, maxNativeZoom: 7,
    attribution: 'Map &copy; Rockstar Games &middot; data: <a href="https://github.com/jeanropke/RDOMap">RDOMap</a>, <a href="https://github.com/the0neWhoKnocks/red-dead-redemption-2-map">rdr2-map</a>',
  }).addTo(map);
  if (canHover) L.control.zoom({ position: 'topright' }).addTo(map); // touch screens pinch instead
  const HOME = L.latLngBounds([-168, 12], [-24, 222]);
  // keep fitted areas clear of the bottom sheet on phones
  const sheetPad = () => mobileMQ.matches ? { paddingTopLeft: [16, 16], paddingBottomRight: [16, $('side').offsetHeight + 16] } : { padding: [30, 30] };
  const goHome = (animate = true) => animate ? map.flyToBounds(HOME, { ...sheetPad(), duration: 0.8 }) : map.fitBounds(HOME, sheetPad());
  const setZoomClass = () => map.getContainer().dataset.zoom = Math.max(2, Math.min(6, Math.floor(map.getZoom())));
  map.on('zoomend', setZoomClass); setZoomClass();

  // regions
  const regionLayers = {};
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
      layer.on('click', () => selectRegion(id));
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
  const markers = {}; // item id -> [{m, r}]
  for (const it of D.items) {
    markers[it.id] = it.l.map((ll, i) => {
      const m = L.marker(ll, {
        icon: L.divIcon({
          className: 'pin-wrap', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -14],
          html: `<div class="pin" style="--c:${CAT[it.c].color}"><img src="${iconOf(it)}" alt=""></div>`,
        }),
        title: it.n, riseOnHover: true, keyboard: false,
      });
      m.bindPopup(() => popupHtml(it), { className: 'rdr-popup', maxWidth: 280, minWidth: 220, autoPanPaddingTopLeft: [16, 60], autoPanPaddingBottomRight: panPad });
      return { m, r: it.lr[i] };
    });
  }

  function popupHtml(it) {
    const c = CAT[it.c], isDone = done.has(it.id);
    const sub = [it.g, it.sub].filter(Boolean).map(esc).join(' &middot; ');
    return `<div class="pop">
      <div class="pop-head"><span class="pin sm" style="--c:${c.color}"><img src="${iconOf(it)}" alt=""></span>
        <div><div class="pop-cat">${esc(c.name)}</div><div class="pop-title">${esc(it.n)}</div></div></div>
      ${sub ? `<div class="pop-sub">${sub}</div>` : ''}
      ${it.d ? `<p>${esc(it.d)}</p>` : ''}
      ${it.rw ? `<p class="pop-rw">Set reward: ${esc(it.rw)}</p>` : ''}
      <div class="pop-reg">${it.r.map(r => esc(REG[r].name)).join(', ')}</div>
      <button class="btn ${isDone ? 'ghost' : ''}" data-toggle="${it.id}">${isDone ? 'Mark as not collected' : '✓ Mark as collected'}</button>
    </div>`;
  }
  map.on('popupopen', e => {
    if (mobileMQ.matches && sheet !== 'peek') setSheet('peek');
    const b = e.popup.getElement().querySelector('[data-toggle]');
    if (b) b.onclick = () => { map.closePopup(); toggle(b.dataset.toggle); };
  });

  // ---- logic ----
  const matches = it => !query || (it.n + ' ' + (it.g || '') + ' ' + (it.sub || '') + ' ' + it.d).toLowerCase().includes(query);
  const regionItems = id => D.items.filter(i => i.r.includes(id));
  const progress = list => [list.filter(i => done.has(i.id)).length, list.length];
  const scoped = () => D.items.filter(i => (!region || i.r.includes(region)) && matches(i));

  function toggle(id, force) {
    const on = force ?? !done.has(id);
    on ? done.add(id) : done.delete(id);
    save('rdr2map.done', [...done]);
    refresh();
  }

  function refreshMarkers() {
    for (const it of D.items) {
      const visibleItem = !hiddenCats.has(it.c) && (showDone || !done.has(it.id)) && matches(it);
      for (const { m, r } of markers[it.id]) {
        const show = visibleItem && (!region || r === region);
        if (show && !map.hasLayer(m)) m.addTo(map);
        if (!show && map.hasLayer(m)) m.remove();
        if (show) m.getElement()?.classList.toggle('done', done.has(it.id));
      }
    }
  }

  function selectRegion(id) {
    region = id;
    for (const [rid, layer] of Object.entries(regionLayers)) layer.setStyle(regionStyle(rid));
    setShade(id);
    if (id) {
      if (mobileMQ.matches) setSheet('half');
      map.flyToBounds(regionLayers[id].getBounds(), { ...sheetPad(), duration: 0.8 });
    }
    refresh();
    document.getElementById('list').scrollTop = 0;
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

  function renderHeader() {
    const [d, t] = progress(D.items);
    const p = t ? Math.floor(100 * d / t) : 0;
    $('pct').textContent = p + '%';
    $('ring').style.setProperty('--p', (t ? d / t : 0) * 360 + 'deg');
    $('overall-count').textContent = `${d} / ${t} collected`;
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
      <label><input type="checkbox" data-id="${it.id}" ${isDone ? 'checked' : ''}>
        <span class="tick"></span>
        <span class="txt"><span class="nm">${esc(it.n)}</span>${sub ? `<span class="meta">${esc(sub)}</span>` : ''}
        ${it.d ? `<span class="desc">${esc(it.d)}</span>` : ''}</span></label>
      ${it.l.length ? `<button class="loc" data-loc="${it.id}" title="Show on map" aria-label="Show ${esc(it.n)} on map">⌖</button>` : ''}
    </li>`;
  }

  function renderList() {
    const list = scoped();
    let html = '';
    for (const [gid, gname] of Object.entries(GROUPS)) {
      const cats = D.cats.filter(c => c.group === gid);
      let sect = '';
      for (const c of cats) {
        const all = D.items.filter(i => i.c === c.id && (!region || i.r.includes(region)));
        if (!all.length) continue;
        const [d, t] = progress(all);
        const its = list.filter(i => i.c === c.id);
        const open = openCats.has(c.id) || (query && its.length);
        if (query && !its.length) continue;
        let body = '';
        if (open) {
          if (GROUPED.has(c.id)) {
            const groups = [...new Set(its.map(i => i.g))];
            for (const g of groups) {
              const gi = its.filter(i => i.g === g), allG = all.filter(i => i.g === g);
              const [gd, gt] = progress(allG);
              const rw = gi[0].rw ? `<span class="rw">Reward: ${esc(gi[0].rw)}</span>` : '';
              body += `<div class="sub-h"><span>${esc(g)}</span><span class="${gd === gt ? 'full' : ''}">${gd}/${gt}</span>${rw}</div><ul>${gi.map(itemRow).join('')}</ul>`;
            }
          } else body = `<ul>${its.map(itemRow).join('')}</ul>`;
        }
        const hidden = hiddenCats.has(c.id);
        sect += `<section class="cat ${open ? 'open' : ''} ${d === t ? 'complete' : ''}" style="--c:${c.color}">
          <div class="cat-h">
            <button class="cat-btn" data-open="${c.id}" aria-expanded="${!!open}">
              <span class="pin sm"><img src="${ICON[c.id]}" alt=""></span>
              <span class="cat-name">${esc(c.name)}</span>
              <span class="cat-count">${d}/${t}</span>
              <span class="chev">▾</span>
            </button>
            ${c.id === 'hunt' || c.id === 'gang' ? '<span class="eye-ph"></span>' : `<button class="eye ${hidden ? 'off' : ''}" data-eye="${c.id}" title="${hidden ? 'Show' : 'Hide'} on map" aria-label="${hidden ? 'Show' : 'Hide'} ${esc(c.name)} on map">${hidden ? '◌' : '◉'}</button>`}
          </div>
          ${bar(d, t)}
          ${open ? `<div class="cat-body">${body}${c.id === 'hunt' || c.id === 'gang' ? '<p class="note">Not tied to a map location.</p>' : ''}</div>` : ''}
        </section>`;
      }
      if (sect) html += `<h2 class="grp">${gname}</h2>${sect}`;
    }
    if (region) {
      html += `<p class="note pad">Hunting requests and gang member requests aren't tied to a region — close the region to see them.</p>`;
    } else if (!query) {
      html += `<h2 class="grp">Regions</h2><div class="regions">`;
      for (const st of [...new Set(D.regions.map(r => r.state))]) {
        html += `<div class="state">${esc(st)}</div>`;
        for (const r of D.regions.filter(r => r.state === st)) {
          const [d, t] = progress(regionItems(r.id));
          html += `<button class="reg ${d === t ? 'complete' : ''}" data-region="${r.id}"><span>${esc(r.name)}</span><span class="cat-count">${d}/${t}</span>${bar(d, t)}</button>`;
        }
      }
      html += `</div>`;
    }
    if (!html) html = `<p class="note pad">Nothing matches “${esc(query)}”.</p>`;
    html += footerHtml();
    const el = $('list'), top = el.scrollTop;
    el.innerHTML = html;
    el.scrollTop = top;
  }

  function refresh() { renderHeader(); renderList(); refreshMarkers(); }

  $('list').addEventListener('click', e => {
    const t = e.target.closest('[data-open],[data-eye],[data-loc],[data-region]');
    if (!t) return;
    if (t.dataset.open) {
      const id = t.dataset.open;
      openCats.has(id) ? openCats.delete(id) : openCats.add(id);
      save('rdr2map.openCats', [...openCats]); renderList();
    } else if (t.dataset.eye) {
      const id = t.dataset.eye;
      hiddenCats.has(id) ? hiddenCats.delete(id) : hiddenCats.add(id);
      save('rdr2map.hiddenCats', [...hiddenCats]); refresh();
    } else if (t.dataset.region) {
      selectRegion(t.dataset.region);
    } else if (t.dataset.loc) {
      const it = ITEM[t.dataset.loc];
      hiddenCats.delete(it.c);
      const ms = markers[it.id].filter(x => !region || x.r === region).map(x => x.m);
      if (done.has(it.id) && !showDone) { showDone = true; $('show-done').checked = true; save('rdr2map.showDone', true); }
      refresh();
      if (mobileMQ.matches) setSheet('peek');
      if (ms.length === 1) {
        // aim slightly below the marker on phones so it lands above the sheet
        const z = Math.max(map.getZoom(), 6), ll = ms[0].getLatLng();
        const c = mobileMQ.matches ? map.unproject(map.project(ll, z).add([0, ($('side').offsetHeight - 120) / 2]), z) : ll;
        map.flyTo(c, z, { duration: 0.8 });
        map.once('moveend', () => ms[0].openPopup());
      } else if (ms.length) {
        map.flyToBounds(L.latLngBounds(ms.map(m => m.getLatLng())), { ...sheetPad(), maxZoom: 6, duration: 0.8 });
      }
    }
  });
  $('list').addEventListener('change', e => {
    if (e.target.dataset.id) toggle(e.target.dataset.id, e.target.checked);
  });
  let qt;
  $('search').addEventListener('input', e => {
    clearTimeout(qt);
    qt = setTimeout(() => { query = e.target.value.trim().toLowerCase(); refresh(); }, 120);
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
      <p class="note">Progress is saved on this device. Back up gives you a code you can restore later or on another device.</p>`;
  }
  async function act(a) {
    if (a === 'tip') { save('rdr2map.tipClosed', true); renderList(); }
    if (a === 'reset' && confirm('Reset all collected progress? This cannot be undone.')) { done.clear(); save('rdr2map.done', []); refresh(); }
    if (a === 'backup') {
      const code = 'RDR2MAP:' + btoa(JSON.stringify([...done]));
      try {
        if (navigator.share) await navigator.share({ title: 'RDR2 map progress', text: code });
        else { await navigator.clipboard.writeText(code); alert('Backup code copied to clipboard.'); }
      } catch (e) { if (e.name !== 'AbortError') prompt('Copy this backup code:', code); }
    }
    if (a === 'restore') {
      const code = prompt('Paste your backup code:');
      if (!code) return;
      try {
        const ids = JSON.parse(atob(code.trim().replace(/^RDR2MAP:/, ''))).filter(id => ITEM[id]);
        if (!confirm(`Restore ${ids.length} collected items? This replaces your current progress.`)) return;
        done.clear(); ids.forEach(id => done.add(id)); save('rdr2map.done', [...done]); refresh();
      } catch { alert("That doesn't look like a valid backup code."); }
    }
  }
  $('list').addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) act(b.dataset.act); });

  setSheet('peek');
  refresh();
  goHome(false);
  mobileMQ.addEventListener('change', () => setSheet(sheet));
})();
