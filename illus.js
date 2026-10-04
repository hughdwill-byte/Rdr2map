// Drawn illustrations for items without game art, in the style of 1890s steel engravings and
// lithographed cigarette cards: ink linework, cross-hatching and aged paper. Pure SVG, no image files.
(() => {
  const INK = '#2b1d10', SEPIA = '#5a3d22', PAPER = '#ead9b5', PAPER2 = '#cdb183', RUST = '#8a3a22', BRASS = '#b48a3c', WOOD = '#6e4526';
  let uid = 0;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const wrap = (t, n, max = 3) => { const out = []; let l = ''; for (const x of String(t).split(/\s+/)) { if ((l + ' ' + x).trim().length > n && l) { out.push(l); l = x; } else l = (l + ' ' + x).trim(); } if (l) out.push(l); return out.slice(0, max); };
  const text = (lines, x, y, size, attrs = '') => lines.map((l, i) => `<text x="${x}" y="${y + i * size * 1.18}" font-size="${size}" text-anchor="middle" font-family="'IM Fell English SC',Georgia,serif" fill="${INK}" ${attrs}>${esc(l)}</text>`).join('');

  // shared defs: ink wobble, paper grain, hatching (ids are unique per drawing so several popups can coexist)
  const defs = k => `<defs>
    <filter id="ink${k}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>
    <filter id="ink2${k}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="23"/><feDisplacementMap in="SourceGraphic" scale="2.4"/></filter>
    <pattern id="g${k}" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><line x1="0" y1="0" x2="0" y2="2.6" stroke="#3a2c20" stroke-width=".45"/></pattern>
    <filter id="grain${k}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="2" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    <radialGradient id="pg${k}" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="#f1e6cc"/><stop offset=".8" stop-color="#e6d6b2"/><stop offset="1" stop-color="#d6c094"/></radialGradient>
    <pattern id="h${k}" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3.2" stroke="${INK}" stroke-width=".7"/></pattern>
    <pattern id="x${k}" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V3.2M0 0H3.2" stroke="${INK}" stroke-width=".6"/></pattern>
    <pattern id="w${k}" width="6" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)"><path d="M0 1.2q1.5-.9 3 0t3 0" stroke="#3a2412" stroke-width=".5" fill="none"/></pattern>
  </defs>`;
  const sketch = (k, inner) => `<style>
      .sw${k} *{stroke:none!important}
      .sh${k} *{fill:url(#g${k})!important;stroke:none!important}
      .sl${k} *{fill:none!important;stroke:#2e2219!important;stroke-width:.85px!important}
      .sl${k} text,.sw${k} text,.sh${k} text{display:none}
      .st${k} *:not(text){display:none}
    </style>
    <g class="sw${k}" opacity=".32">${inner}</g>
    <g class="sh${k}" opacity=".55" filter="url(#ink2${k})">${inner}</g>
    <g class="sl${k}" filter="url(#ink${k})" opacity=".9">${inner}</g>
    <g class="sl${k}" filter="url(#ink2${k})" opacity=".45" transform="translate(.7 .5)">${inner}</g>
    <g class="st${k}">${inner}</g>`;
  const paper = (k, inner, w = 200, h = 124) => `<svg viewBox="0 0 ${w} ${h}" class="illus" role="img">${defs(k)}
    <rect width="${w}" height="${h}" fill="url(#pg${k})"/><rect width="${w}" height="${h}" fill="#000" filter="url(#grain${k})" opacity=".9"/>
    <g stroke-linejoin="round" stroke-linecap="round">${sketch(k, inner)}</g></svg>`;
  const S = `stroke="${INK}" stroke-width="1.6"`, s = `stroke="${INK}" stroke-width=".9"`;

  // ---------- subjects (drawn in a 200x124 box) ----------
  const D = {
    // single-action "Cattleman/Schofield" style revolver
    revolver: k => `
      <path d="M96 45h84v8H96z" fill="#3b3128" ${S}/><path d="M100 53h58v4h-58z" fill="#4b4036" ${s}/><path d="M175 42h3v3h-3z" fill="${INK}"/>
      <path d="M58 40h40v24H64q-6-2-6-10z" fill="#3b3128" ${S}/>
      <rect x="74" y="38" width="22" height="25" rx="3" fill="#4d4238" ${S}/><path d="M78 39v23M83 39v23M88 39v23M92 39v23" ${s}/>
      <path d="M60 41l-10-9q-3-2-1 2l6 9" fill="#3b3128" ${S}/>
      <path d="M62 60q-10 16-16 34q-1 7 6 8l12 1q6 0 7-6l9-32z" fill="${WOOD}" ${S}/><path d="M60 64q-8 14-12 30l12 2q5-14 10-30z" fill="url(#w${k})" opacity=".9"/>
      <path d="M75 64q-3 15 9 15q11 0 11-15" fill="none" stroke="${INK}" stroke-width="2.2"/><path d="M84 64q3 5-1 10" fill="none" ${S}/>
      <path d="M96 45h84" stroke="#a89a8a" stroke-width=".6"/><circle cx="60" cy="98" r="1.2" fill="${BRASS}"/>`,
    // C96 "broomhandle" semi-automatic pistol
    pistol: k => `
      <path d="M92 44h86v7H92z" fill="#3b3128" ${S}/><path d="M52 40h46v18H52z" fill="#3b3128" ${S}/><path d="M56 40l2-6h18l2 6" fill="#3b3128" ${S}/>
      <path d="M78 58h16v26H78z" fill="#4b4036" ${S}/><path d="M80 62h12M80 67h12M80 72h12M80 77h12" ${s}/>
      <path d="M54 58q-4 18-12 30q-2 6 5 8l10 1q6-1 6-6l2-33z" fill="${WOOD}" ${S}/><path d="M50 62q-2 14-8 26l12 4q2-16 6-30z" fill="url(#x${k})" opacity=".6"/>
      <path d="M62 58q-3 14 7 14q9 0 9-8" fill="none" stroke="${INK}" stroke-width="2.2"/><path d="M69 58q3 5-1 9" fill="none" ${S}/>`,
    // lever-action repeater / rifle
    lever: k => `
      <path d="M86 50h102v6H86z" fill="#3b3128" ${S}/><path d="M88 56h84v4H88z" fill="#4b4036" ${s}/><path d="M184 47h3v3h-3z" fill="${INK}"/>
      <path d="M60 46h30v16H60z" fill="${BRASS}" ${S}/><path d="M64 50h20" ${s}/>
      <path d="M100 56h40v5h-40z" fill="${WOOD}" ${s}/>
      <path d="M64 62q-8 18 8 18q16 0 14-18" fill="none" stroke="${INK}" stroke-width="2.4"/><path d="M73 62q3 5-1 9" fill="none" ${S}/>
      <path d="M60 50L14 60q-6 2-6 8v8q0 4 6 3l18-3 30-14z" fill="${WOOD}" ${S}/><path d="M14 62l44-10v6L16 72z" fill="url(#w${k})"/><path d="M8 66v10" stroke="${INK}" stroke-width="3"/>`,
    // bolt-action / rolling block / sniper
    bolt: k => `
      <path d="M86 50h104v5H86z" fill="#3b3128" ${S}/><path d="M66 46h26v12H66z" fill="#3b3128" ${S}/>
      <path d="M78 46q2-10 10-12" fill="none" stroke="${INK}" stroke-width="2.4"/><circle cx="88" cy="34" r="3" fill="#3b3128" ${s}/>
      <path d="M92 55h70l-6 6H92z" fill="${WOOD}" ${s}/><path d="M72 58q-2 12 7 12q9 0 9-12" fill="none" stroke="${INK}" stroke-width="2.2"/><path d="M79 58q3 4-1 8" fill="none" ${S}/>
      <path d="M66 50L18 58q-8 2-8 8v10q0 4 6 3l16-4 34-15z" fill="${WOOD}" ${S}/><path d="M18 62l46-8v4L20 70z" fill="url(#w${k})"/><path d="M10 64v12" stroke="${INK}" stroke-width="3"/>`,
    // side-by-side double-barrel shotgun
    double: k => `
      <path d="M84 46h104v5H84z" fill="#3b3128" ${S}/><path d="M84 51h104v5H84z" fill="#4b4036" ${S}/>
      <path d="M62 44h26v16H62z" fill="#8f8478" ${S}/><path d="M66 48q6 4 14 0M66 54q6 4 14 0" ${s}/>
      <path d="M66 44l-4-8 6 1 4 7" fill="#3b3128" ${s}/><path d="M74 44l-2-8 6 1 2 7" fill="#3b3128" ${s}/>
      <path d="M96 56h46l-4 6H96z" fill="${WOOD}" ${s}/><path d="M66 60q-2 13 8 13q10 0 10-13" fill="none" stroke="${INK}" stroke-width="2.2"/><path d="M74 60q3 5-1 9" fill="none" ${S}/>
      <path d="M62 50L16 58q-8 2-8 8v10q0 4 6 3l18-4 30-15z" fill="${WOOD}" ${S}/><path d="M16 62l44-8v4L18 70z" fill="url(#w${k})"/>`,
    // pump / repeating / semi-auto shotgun
    pump: k => `
      <path d="M86 46h102v6H86z" fill="#3b3128" ${S}/><path d="M86 52h96v4H86z" fill="#4b4036" ${s}/>
      <rect x="112" y="52" width="34" height="9" rx="2" fill="${WOOD}" ${S}/><path d="M116 52v9M121 52v9M126 52v9M131 52v9M136 52v9M141 52v9" ${s}/>
      <path d="M60 44h30v16H60z" fill="#3b3128" ${S}/><path d="M64 60q-2 13 8 13q10 0 10-13" fill="none" stroke="${INK}" stroke-width="2.2"/><path d="M72 60q3 5-1 9" fill="none" ${S}/>
      <path d="M60 48L14 58q-6 2-6 8v10q0 4 6 3l18-4 28-14z" fill="${WOOD}" ${S}/><path d="M14 62l44-10v4L16 70z" fill="url(#w${k})"/>`,
    knife: k => `
      <path d="M70 56l78-14q22-2 36 8q-14 2-30 10l-84 6z" fill="#cfc6b8" ${S}/><path d="M78 58l70-12" ${s}/><path d="M150 48q16-2 30 2" stroke="#fff" stroke-width=".8" opacity=".7"/>
      <path d="M64 46h8v26h-8z" fill="${BRASS}" ${S}/>
      <path d="M22 54h42v12H22q-6 0-6-6t6-6z" fill="#cbb48c" ${S}/><path d="M22 56h40v8H22z" fill="url(#x${k})" opacity=".5"/><circle cx="32" cy="60" r="1.6" fill="${BRASS}"/><circle cx="48" cy="60" r="1.6" fill="${BRASS}"/>`,
    hatchet: k => `
      <path d="M20 66l124-8 2 7-124 9z" fill="${WOOD}" ${S}/><path d="M24 68l118-7" ${s} opacity=".6"/>
      <path d="M130 50h14v22h-14z" fill="#5c5249" ${S}/><path d="M144 46q26 4 30 16q-4 12-30 16z" fill="#8a8178" ${S}/><path d="M168 48q8 12 0 28" stroke="#e8e0d4" stroke-width="1.2" fill="none"/>
      <path d="M150 52v20" ${s}/>`,
    tomahawk: k => `
      <path d="M22 68l130-10 1 6-130 11z" fill="${WOOD}" ${S}/><path d="M60 62l6 18M66 61l8 18" stroke="${RUST}" stroke-width="2"/><path d="M62 78q-6 14 2 22M70 78q2 14 12 18" stroke="${INK}" stroke-width="1" fill="none"/>
      <path d="M140 52q24-6 40 4q-6 12-24 14z" fill="#8a8178" ${S}/><path d="M138 56q-8-14 0-20q6 2 6 14" fill="#5c5249" ${S}/>`,
    bow: k => `<path d="M86 10q-28 52 0 104" fill="none" stroke="${WOOD}" stroke-width="5"/><path d="M86 10q-28 52 0 104" fill="none" ${s}/><path d="M86 10v104" stroke="${INK}" stroke-width=".8"/>
      <path d="M40 62h124" ${S}/><path d="M164 62l-10-5v10z" fill="#5c5249" ${s}/><path d="M42 62l-8-5M42 62l-8 5M48 62l-8-5M48 62l-8 5" stroke="${RUST}" stroke-width="1.4"/>`,
    // hats
    stetson: k => `<path d="M24 80q76 26 152 0q-4 10-20 12q-56 10-112 0q-16-2-20-12z" fill="#4a3a2a" ${S}/>
      <path d="M58 82q-6-38 18-46q12-4 24 4q12-8 24-4q24 8 18 46q-42 8-84 0z" fill="#5a4632" ${S}/><path d="M60 72q40 8 80 0v8q-40 8-80 0z" fill="#2b2016" ${s}/>
      <path d="M70 46q30-8 60 0" ${s}/><path d="M62 50q-4 14-2 26M138 50q4 14 2 26" fill="none" stroke="url(#h${k})" stroke-width="5" opacity=".7"/>`,
    bowler: k => `<path d="M34 84q66 18 132 0q-2 8-14 10q-52 8-104 0q-12-2-14-10z" fill="#2f2620" ${S}/>
      <path d="M58 84q-2-50 42-52q44 2 42 52q-42 8-84 0z" fill="#3b3028" ${S}/><path d="M60 74q40 8 80 0v8q-40 8-80 0z" fill="#1d1712" ${s}/><path d="M74 46q8-8 22-8" stroke="#a89a8a" stroke-width="1.4" fill="none"/>`,
    tophat: k => `<path d="M38 92q62 14 124 0q-2 8-14 10q-48 6-96 0q-12-2-14-10z" fill="#2a221c" ${S}/>
      <path d="M66 92l-4-70q38-8 76 0l-4 70q-34 6-68 0z" fill="#3a3028" ${S}/><path d="M64 78q36 6 72 0v8q-36 6-72 0z" fill="#1a1410" ${s}/><path d="M74 28v56" stroke="#8a7c6c" stroke-width="1.6"/>`,
    sombrero: k => `<path d="M10 82q90 30 180 0q-8 14-40 18q-50 6-100 0q-32-4-40-18z" fill="#c8a868" ${S}/><path d="M18 86q82 24 164 0" fill="none" stroke="${RUST}" stroke-width="2"/>
      <path d="M70 84q-2-44 30-58q32 14 30 58q-30 6-60 0z" fill="#d6b878" ${S}/><path d="M72 74q28 6 56 0v8q-28 6-56 0z" fill="${RUST}" ${s}/><path d="M80 50l40 0M76 62h48" stroke="url(#h${k})" stroke-width="4"/>`,
    cap: k => `<path d="M50 80q50 10 100 0l-4-30q-46-16-92 0z" fill="#3a4250" ${S}/><path d="M50 80q-6 10 40 12q30 0 60-12q-50 8-100 0z" fill="#1e2228" ${S}/><path d="M56 66q44 8 88 0" stroke="${BRASS}" stroke-width="2"/><circle cx="100" cy="56" r="5" fill="${BRASS}" ${s}/>`,
    helmet: k => `<path d="M46 86q-6-60 54-64q60 4 54 64z" fill="#8f8478" ${S}/><path d="M46 86h108" stroke="${INK}" stroke-width="3"/><path d="M60 80q40-8 80 0" ${s}/>
      <path d="M100 22v64" ${s}/><path d="M50 50q-24-10-30-30q14 6 30 18M150 50q24-10 30-30q-14 6-30 18" fill="#e8dcc0" ${S}/><circle cx="70" cy="70" r="2" fill="${INK}"/><circle cx="130" cy="70" r="2" fill="${INK}"/>`,
    furcap: k => `<path d="M54 82q-6-50 46-54q52 4 46 54q-46 8-92 0z" fill="#7a6248" ${S}/><path d="M54 82q-6-50 46-54q52 4 46 54" fill="none" stroke="url(#x${k})" stroke-width="10" opacity=".6"/>
      <path d="M140 66q30 6 40 34q-10 6-16-4q-6-16-26-20z" fill="#7a6248" ${S}/><path d="M152 72l6 8M162 80l6 8M170 90l4 6" stroke="${INK}" stroke-width="3"/>`,
    mask: k => `<path d="M48 30q52-26 104 0q10 46-22 64q-30 14-60 0q-32-18-22-64z" fill="#e8dcc6" ${S}/><path d="M58 36q42-18 84 0" ${s}/>
      <ellipse cx="80" cy="56" rx="13" ry="10" fill="${INK}"/><ellipse cx="120" cy="56" rx="13" ry="10" fill="${INK}"/><path d="M96 68l4 10 4-10z" fill="${INK}"/><path d="M80 84h40M86 80v8M94 80v8M102 80v8M110 80v8" ${s}/>`,
    sword: k => `<path d="M40 60l120-6 14 4-14 4-120 4z" fill="#cfc6b8" ${S}/><path d="M60 62l96-5" ${s}/><path d="M118 52l6 14M132 54l-6 10" stroke="${RUST}" stroke-width="1.2" opacity=".7"/>
      <path d="M30 48q4 14 0 26l6 0q4-14 0-26z" fill="${BRASS}" ${S}/><path d="M12 58h20v8H12z" fill="#3b3128" ${S}/><circle cx="10" cy="62" r="4" fill="${BRASS}" ${s}/>`,
    cleaver: k => `<path d="M20 66l90-6 1 8-90 7z" fill="${WOOD}" ${S}/><path d="M108 40h66v36h-66z" fill="#8a8178" ${S}/><path d="M108 76h66" stroke="#e8e0d4" stroke-width="1.2"/><circle cx="160" cy="48" r="3" fill="${PAPER}" ${s}/>`,
    skullcap: k => `<path d="M56 82q-4-48 44-50q48 2 44 50q-44 8-88 0z" fill="#2a2a3a" ${S}/><path d="M100 32v52M70 40q-6 20-6 44M130 40q6 20 6 44" ${s} opacity=".6"/><circle cx="100" cy="30" r="5" fill="${RUST}" ${s}/>`,
    miner: k => `<path d="M48 84q-4-50 52-54q56 4 52 54z" fill="#7a6a4a" ${S}/><path d="M40 84h120" stroke="${INK}" stroke-width="4"/><rect x="90" y="40" width="20" height="14" rx="3" fill="${BRASS}" ${S}/><circle cx="100" cy="47" r="4" fill="#fff6c8" ${s}/><path d="M100 26l-4-10 8 0z" fill="${RUST}"/>`,
    tricorn: k => `<path d="M30 70q30-30 70-8q40-22 70 8q-20 18-70 16q-50 2-70-16z" fill="#2a221c" ${S}/><path d="M60 64q40-26 80 0" fill="#3a3028" ${S}/><path d="M40 72q60 18 120 0" stroke="${BRASS}" stroke-width="1.4" fill="none"/>`,
    morion: k => `<path d="M40 82q60-24 120 0q-10 8-20 6q-40-10-80 0q-10 2-20-6z" fill="#8f8478" ${S}/><path d="M64 80q-4-44 36-48q40 4 36 48" fill="#9c9488" ${S}/><path d="M76 66q24-50 48 0" fill="#7a7068" ${S}/><path d="M100 30v50" ${s}/>`,
    campaign: k => `<path d="M24 80q76 18 152 0q-6 8-22 10q-54 8-108 0q-16-2-22-10z" fill="#7a5a32" ${S}/><path d="M62 82l10-42q10-10 14 0q6-8 14-8t14 8q4-10 14 0l10 42q-38 8-76 0z" fill="#8a6a3e" ${S}/><path d="M64 72q36 6 72 0v6q-36 6-72 0z" fill="#3b2a1a" ${s}/><path d="M100 32v24" ${s}/>`,
    feathered: k => `${''}<path d="M24 80q76 26 152 0q-4 10-20 12q-56 10-112 0q-16-2-20-12z" fill="#6a2a3a" ${S}/><path d="M58 82q-6-38 18-46q12-4 24 4q12-8 24-4q24 8 18 46q-42 8-84 0z" fill="#7a3a4a" ${S}/><path d="M132 70q30-40 50-58q-6 30-44 64z" fill="#3a7a8a" ${S}/><path d="M136 70l42-54" ${s}/>`,
    ramskull: k => `<path d="M70 30q30-14 60 0q6 30-10 56q-20 14-40 0q-16-26-10-56z" fill="#e8dcc6" ${S}/><path d="M70 36q-34-10-40 16q-2 22 22 20q-10-8-4-18q6-8 22-4zM130 36q34-10 40 16q2 22-22 20q10-8 4-18q-6-8-22-4z" fill="#b8a886" ${S}/><path d="M38 50q8-8 16 0M146 50q8-8 16 0" ${s}/>
      <ellipse cx="88" cy="50" rx="7" ry="6" fill="${INK}"/><ellipse cx="112" cy="50" rx="7" ry="6" fill="${INK}"/><path d="M96 70h8l-4 12z" fill="${INK}"/>`,
    catskull: k => `<path d="M62 44q38-30 76 0q4 30-18 46q-20 10-40 0q-22-16-18-46z" fill="#e8dcc6" ${S}/><path d="M64 46l-6-26 22 14M136 46l6-26-22 14" fill="#e8dcc6" ${S}/>
      <ellipse cx="84" cy="56" rx="10" ry="8" fill="${INK}"/><ellipse cx="116" cy="56" rx="10" ry="8" fill="${INK}"/><path d="M96 72h8l-4 6z" fill="${INK}"/><path d="M92 84l-4 8M108 84l4 8" stroke="${INK}" stroke-width="2"/>`,
    pig: k => `<path d="M56 36q44-30 88 0q12 40-14 58q-30 14-60 0q-26-18-14-58z" fill="#e2a89a" ${S}/><path d="M60 40l-12-14 22 6M140 40l12-14-22 6" fill="#d4948a" ${S}/>
      <circle cx="84" cy="52" r="5" fill="${INK}"/><circle cx="116" cy="52" r="5" fill="${INK}"/><ellipse cx="100" cy="72" rx="16" ry="11" fill="#d4948a" ${S}/><ellipse cx="94" cy="72" rx="3" ry="4" fill="${INK}"/><ellipse cx="106" cy="72" rx="3" ry="4" fill="${INK}"/>`,
    // collectibles
    bone: k => `<path d="M40 70q-14-4-12-16q4-10 14-6q4-12 16-8q8 4 6 14l70-8q2-12 14-12q12 2 10 14q12 0 12 12q-2 10-14 8q-2 12-14 10q-10-2-8-12l-70 8q2 10-8 14q-12 2-14-10z" fill="#efe2c4" ${S}/>
      <path d="M66 62l70-8v8l-70 8z" fill="url(#h${k})" opacity=".6"/><path d="M44 52q6 0 8 6M150 48q6 2 6 8" ${s}/><path d="M60 60l-3 10M140 52l2 10" ${s} opacity=".6"/>`,
    dream: k => `<path d="M30 8q60 16 140 4" stroke="${WOOD}" stroke-width="4" fill="none"/><path d="M100 13v10" ${s}/>
      <circle cx="100" cy="48" r="25" fill="none" stroke="${WOOD}" stroke-width="4"/><circle cx="100" cy="48" r="25" fill="none" ${s}/>
      <path d="M100 23l14 42-36-26h44l-36 26z M100 23l-22 16M100 23l22 16M75 48h50" fill="none" stroke="${INK}" stroke-width=".7"/><circle cx="100" cy="48" r="3" fill="${RUST}"/>
      <path d="M80 70q-3 16 0 26M100 73q-2 18 0 30M120 70q3 16 0 26" ${s}/>
      ${[[80, 96], [100, 103], [120, 96]].map(([x, y]) => `<path d="M${x} ${y}q-6 8 0 20q6-12 0-20z" fill="#e8dcc6" ${s}/><path d="M${x} ${y + 2}v16" stroke="${INK}" stroke-width=".5"/>`).join('')}`,
    carving: k => `<path d="M14 112q8-74 70-94q60-10 92 30q14 30 10 64z" fill="#b2a58c" ${S}/><path d="M24 100q10-50 50-70" fill="none" stroke="url(#x${k})" stroke-width="16" opacity=".35"/>
      <g stroke="#3a2a1a" stroke-width="2.2" fill="none"><circle cx="104" cy="44" r="7"/><path d="M104 51v24M90 60h28M104 75l-10 14M104 75l10 14"/><path d="M60 80q10-14 20 0M128 76l16-10 8 12"/><path d="M136 44l8-8 8 8-8 8z"/></g>`,
    grave: k => `<path d="M10 112q40-12 90-10t90 10z" fill="#6f7a4a" ${s}/>
      <path d="M62 106V42q38-34 76 0v64z" fill="#a9a196" ${S}/><path d="M66 106V44q34-30 68 0" fill="none" stroke="url(#h${k})" stroke-width="6" opacity=".35"/>
      <path d="M100 30v14M94 36h12" stroke="${INK}" stroke-width="2"/>`,
    map: k => `<path d="M24 18l50 8 50-8 52 8v82l-52-8-50 8-50-8z" fill="${PAPER}" ${S}/><path d="M74 26v82M124 18v82" ${s} opacity=".5"/>
      <path d="M40 40q12-6 22 2M44 70l6-10 6 10 6-10 6 10" ${s}/><path d="M140 40q10 8 20 0M138 84q8-8 18 0" ${s}/>
      <path d="M40 88q30-36 64-18t52-34" stroke="${RUST}" stroke-width="2.2" stroke-dasharray="5 4" fill="none"/>
      <path d="M150 30l12 12M162 30l-12 12" stroke="#8a1b1b" stroke-width="3.2"/><circle cx="36" cy="96" r="7" fill="none" ${s}/><path d="M36 89v14M29 96h14" ${s}/>`,
    goldbar: k => `<path d="M30 92l16-22h64l16 22z" fill="#c99b2e" ${S}/><path d="M74 92l16-22h64l16 22z" fill="#d8ad3e" ${S}/><path d="M52 70l16-22h64l16 22z" fill="#e6c25a" ${S}/>
      <path d="M68 52h60" stroke="#fff2c0" stroke-width="1.2"/>${text(['999 FINE'], 100, 64, 7, `fill="${SEPIA}"`)}`,
    chest: k => `<rect x="46" y="54" width="108" height="46" fill="${WOOD}" ${S}/><path d="M46 54q54-40 108 0z" fill="#7d5333" ${S}/>
      <path d="M46 62h108M46 92h108M64 54v46M136 54v46" stroke="#3b3128" stroke-width="3"/><rect x="94" y="62" width="12" height="16" rx="2" fill="${BRASS}" ${s}/><circle cx="100" cy="69" r="2" fill="${INK}"/>
      <rect x="46" y="54" width="108" height="46" fill="url(#w${k})" opacity=".35"/>`,
    pamphlet: (k, it) => `<path d="M58 10h84v104H58z" fill="#efe2c2" ${S}/><path d="M62 14h76v96H62z" fill="none" ${s}/>
      ${text(['RECIPE'], 100, 26, 7, 'letter-spacing="2"')}${text(wrap(it.n.replace(/ Pamphlet$/, ''), 14, 3).map(x => x.toUpperCase()), 100, 40, 9, 'font-weight="bold"')}
      <path d="M70 76h60M70 82h60M70 88h44M70 94h52M70 100h36" stroke="${INK}" stroke-width=".7"/>${text(['— 1899 —'], 100, 108, 5)}`,
    horse: (k, it) => { const n = (it.n || '').toLowerCase();
      const coat = /white|cremello|perlino/.test(n) ? '#e8e0cc' : /black|raven|seal/.test(n) ? '#2a221c' : /grey|gray|silver|dapple|rose/.test(n) ? '#9a948a'
        : /gold|palomino|buckskin|champagne|amber|flaxen/.test(n) ? '#c8a050' : /chestnut|red|strawberry|chocolate/.test(n) ? '#8a4a2a' : '#5c4632';
      const spots = /appaloosa|leopard|overo|paint|brindle|tiger/.test(n);
      return `<path d="M56 120q-4-34 10-56q6-20 26-30l4-14 6 12q10-2 20 4q14 10 20 26q4 10-6 14q-8 2-14-6q-6-6-12-4q-6 18 0 54z" fill="${coat}" ${S}/>
      <path d="M92 34q-16 10-24 36q-6 22-4 50" fill="none" stroke="url(#h${k})" stroke-width="10" opacity=".55"/>
      ${spots ? [[78, 96], [84, 80], [70, 108], [92, 104], [76, 68]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="${INK}" opacity=".7"/>`).join('') : ''}
      <path d="M96 22q-14 6-22 20q-6 12-14 18" stroke="${INK}" stroke-width="3" fill="none"/><circle cx="122" cy="40" r="2.2" fill="${INK}"/><path d="M138 66q4 2 6 0" ${s}/>`; },
    trinket: (k, it) => {
      const n = it.n.toLowerCase();
      const charm = /feather/.test(n) ? `<path d="M100 40q18 24 0 66q-18-42 0-66z" fill="#d8ccb4" ${S}/><path d="M100 44v62" ${s}/>`
        : /antler|horn/.test(n) ? `<path d="M100 104q-4-30 6-52l12-14M106 66l-18-12M110 56l16-6" fill="none" stroke="#cdb88e" stroke-width="7"/><path d="M100 104q-4-30 6-52l12-14M106 66l-18-12M110 56l16-6" fill="none" ${s}/>`
        : /eye/.test(n) ? `<circle cx="100" cy="72" r="16" fill="#c9a13b" ${S}/><ellipse cx="100" cy="72" rx="4" ry="12" fill="${INK}"/>`
        : /shell/.test(n) ? `<path d="M80 92q20-48 40 0q-20 10-40 0z" fill="#9c8a62" ${S}/><path d="M86 86l14-28 14 28M92 88l8-18 8 18" ${s}/>`
        : /heart/.test(n) ? `<path d="M100 104q-30-20-24-38q6-12 24-2q18-10 24 2q6 18-24 38z" fill="#8a3a2a" ${S}/>`
        : `<path d="M100 40q14 30 6 62q-6 6-12 0q-8-32 6-62z" fill="#efe2c4" ${S}/><path d="M100 46q6 26 2 52" ${s}/>`;
      return `<path d="M60 12q40 40 80 0" stroke="#4a3a2a" stroke-width="1.6" fill="none"/>${[70, 82, 94, 106, 118, 130].map(x => `<circle cx="${x}" cy="${12 + 40 * (1 - ((x - 100) / 40) ** 2) * .5}" r="2.4" fill="${RUST}" ${s}/>`).join('')}<circle cx="100" cy="34" r="3" fill="${BRASS}" ${s}/>${charm}`;
    },
  };

  // ---------- one drawing per weapon type (outlines get the pencil-sketch treatment) ----------
  const STEEL = '#55504a', STEEL2 = '#8c867e', BONE = '#e6dcc4';
  const guard = (x, y, w = 20) => `<path d="M${x} ${y}q-3 15 ${w * .45} 15q${w * .55} 0 ${w * .55}-15" fill="none" stroke="${INK}" stroke-width="2.2"/><path d="M${x + w * .45} ${y}q3 5-1 10" fill="none" ${s}/>`;
  const stock = (x, y, k) => `<path d="M${x} ${y}L16 ${y + 8}q-8 2-8 9v10q0 4 6 3l18-4 ${x - 32} ${-16}z" fill="${WOOD}" ${S}/><path d="M16 ${y + 12}l${x - 18}-9v4L18 ${y + 20}z" fill="url(#w${k})"/><path d="M8 ${y + 14}v12" stroke="${INK}" stroke-width="3"/>`;
  const axeHaft = `<path d="M18 74q66-6 128-10l1 7q-62 4-128 10z" fill="${WOOD}" ${S}/><path d="M24 76q60-6 118-9" stroke="${INK}" stroke-width=".5" opacity=".6"/>`;
  const rust = (on) => on ? `<g fill="${RUST}" opacity=".75"><ellipse cx="146" cy="88" rx="4" ry="3"/><ellipse cx="140" cy="58" rx="3" ry="2"/><ellipse cx="152" cy="96" rx="2.5" ry="2"/></g>` : '';
  const D0 = { ...D };
  const W = {
    cattleman: k => `<path d="M98 44h84v7H98z" fill="${STEEL}" ${S}/><path d="M100 51h48v4h-48z" fill="${STEEL2}" ${s}/><path d="M178 41h3v3h-3z" fill="${INK}"/>
      <path d="M60 38h40v26H64q-6-2-6-10z" fill="${STEEL}" ${S}/><rect x="74" y="37" width="24" height="26" rx="4" fill="${STEEL2}" ${S}/><path d="M79 38v24M85 38v24M91 38v24" ${s}/><circle cx="101" cy="58" r="2" fill="${PAPER}" ${s}/>
      <path d="M62 40q-6-8-14-10l2 4q6 2 8 9z" fill="${STEEL}" ${S}/>
      <path d="M62 62q-6 6-11 18q-5 13-1 20q6 4 14 2q4-14 8-27l2-13z" fill="${WOOD}" ${S}/><path d="M56 70q-4 12-4 24" stroke="url(#w${k})" stroke-width="8"/>${guard(75, 64)}`,
    schofield: k => `<path d="M98 43h86v8H98z" fill="${STEEL}" ${S}/><path d="M98 43h86" stroke="${STEEL2}" stroke-width="2"/><path d="M100 51h40v3h-40z" fill="${STEEL2}" ${s}/>
      <path d="M60 38h40v26H64q-6-2-6-10z" fill="${STEEL}" ${S}/><rect x="76" y="39" width="20" height="23" rx="3" fill="${STEEL2}" ${S}/><path d="M81 40v21M86 40v21M91 40v21" ${s}/>
      <path d="M96 38l6-6 4 4-4 6" fill="${STEEL}" ${S}/><circle cx="99" cy="62" r="2.4" fill="${STEEL2}" ${s}/>
      <path d="M62 40q-6-7-13-9l2 4q6 2 7 8z" fill="${STEEL}" ${S}/>
      <path d="M62 62q-6 6-11 18q-5 13-1 20q6 4 14 2q4-14 8-27l2-13z" fill="${WOOD}" ${S}/>${guard(75, 64)}`,
    doubleaction: k => `<path d="M98 45h76v7H98z" fill="${STEEL}" ${S}/><path d="M170 42h3v3h-3z" fill="${INK}"/>
      <path d="M60 40h40v24H66q-6-2-6-10z" fill="${STEEL}" ${S}/><rect x="74" y="38" width="24" height="25" rx="5" fill="${STEEL2}" ${S}/><path d="M80 39v23M86 39v23M92 39v23" ${s}/>
      <path d="M64 40q-3-6-8-6l1 6z" fill="${STEEL}" ${S}/>
      <path d="M64 62q-10 10-10 24q0 10 8 12q8 0 10-8q-6-12 2-26z" fill="#3a2a1e" ${S}/>${guard(76, 64, 24)}`,
    volcanic: k => `<path d="M96 44h86v6H96z" fill="${STEEL}" ${S}/><path d="M96 50h80v5H96z" fill="${STEEL2}" ${S}/><path d="M176 50h4v5h-4z" fill="${BRASS}" ${s}/>
      <path d="M62 40h36v18H62z" fill="${BRASS}" ${S}/><path d="M66 44h28" ${s}/>
      <path d="M62 58q-6 10-8 22q-1 10 6 12q8 2 10-6l2-28z" fill="${WOOD}" ${S}/>
      <path d="M70 58q-6 22 10 22q14 0 16-22" fill="none" stroke="${INK}" stroke-width="2.4"/><path d="M80 58q3 5-1 9" fill="none" ${s}/>`,
    carbine: k => `<path d="M88 50h72v6H88z" fill="${STEEL}" ${S}/><path d="M90 56h56v4H90z" fill="${STEEL2}" ${s}/><path d="M96 56h30v6H96z" fill="${WOOD}" ${s}/>
      <path d="M60 46h30v16H60z" fill="${STEEL}" ${S}/><circle cx="66" cy="54" r="4" fill="none" stroke="${BRASS}" stroke-width="1.6"/>
      <path d="M64 62q-8 18 8 18q16 0 14-18" fill="none" stroke="${INK}" stroke-width="2.4"/><path d="M73 62q3 5-1 9" fill="none" ${s}/>${stock(60, 50, k)}`,
    lancaster: k => `<path d="M86 50h104v6H86z" fill="${STEEL}" ${S}/><path d="M88 56h96v4H88z" fill="${STEEL2}" ${s}/><path d="M184 56h4v4h-4z" fill="${STEEL}" ${s}/>
      <path d="M92 55h62l-4 8H92z" fill="${WOOD}" ${S}/><path d="M60 46h30v16H60z" fill="${BRASS}" ${S}/><path d="M64 51h20" ${s}/>
      <path d="M64 62q-8 18 8 18q16 0 14-18" fill="none" stroke="${INK}" stroke-width="2.4"/><path d="M73 62q3 5-1 9" fill="none" ${s}/>${stock(60, 50, k)}`,
    litchfield: k => `<path d="M86 49h104v8H86z" fill="${STEEL}" ${S}/><path d="M86 53h104" stroke="${STEEL2}" stroke-width="1.2"/><path d="M88 57h90v4H88z" fill="${STEEL2}" ${s}/>
      <path d="M96 57h40v7H96z" fill="${WOOD}" ${S}/><path d="M58 45h32v18H58z" fill="${STEEL}" ${S}/><path d="M62 50h22M62 56h22" ${s}/>
      <path d="M60 63q-12 24 10 24q22 0 18-24" fill="none" stroke="${INK}" stroke-width="2.6"/><path d="M72 63q3 5-1 9" fill="none" ${s}/>${stock(58, 51, k)}`,
    rollingblock: k => `<path d="M88 50h104v5H88z" fill="${STEEL}" ${S}/><path d="M92 55h70l-6 6H92z" fill="${WOOD}" ${S}/>
      <path d="M62 44h28v18H62z" fill="${STEEL2}" ${S}/><circle cx="82" cy="50" r="6" fill="${STEEL}" ${S}/><path d="M78 50h8" ${s}/>
      <path d="M68 44q-4-12 4-16l2 4q-4 4-2 12" fill="${STEEL}" ${S}/>${guard(68, 62, 18)}${stock(62, 50, k)}`,
    double: k => D0.double(k),
    pump: k => D0.pump(k),
    semiauto: k => `<path d="M90 46h98v5H90z" fill="${STEEL}" ${S}/><path d="M90 51h90v5H90z" fill="${STEEL2}" ${s}/><path d="M96 51h48v8H96z" fill="${WOOD}" ${S}/>
      <path d="M58 62V46q0-10 12-10h22v26z" fill="${STEEL}" ${S}/><path d="M62 46h26" ${s}/>${guard(64, 62)}${stock(58, 52, k)}`,
    hatchet: (k, it) => `${axeHaft}<path d="M138 44h14v10h-14z" fill="${STEEL}" ${S}/><path d="M136 54h18v18h-18z" fill="${STEEL2}" ${S}/>
      <path d="M137 72l-7 24q15 10 32 0l-6-24z" fill="${STEEL2}" ${S}/><path d="M131 94q15 9 30 0" stroke="#efe8dc" stroke-width="1.4" fill="none"/>${rust(/rust/i.test(it.n))}`,
    doublebit: (k, it) => `${axeHaft}<path d="M136 54h18v18h-18z" fill="${STEEL2}" ${S}/>
      <path d="M137 54l-7-24q15-10 32 0l-6 24z" fill="${STEEL2}" ${S}/><path d="M137 72l-7 24q15 10 32 0l-6-24z" fill="${STEEL2}" ${S}/>
      <path d="M131 32q15-9 30 0M131 94q15 9 30 0" stroke="#efe8dc" stroke-width="1.4" fill="none"/>${rust(/rust/i.test(it.n))}`,
    hunterhatchet: (k, it) => `${axeHaft}<path d="M137 34h16v20h-16z" fill="${STEEL}" ${S}/><path d="M137 38h16" ${s}/><path d="M136 54h18v18h-18z" fill="${STEEL2}" ${S}/>
      <path d="M137 72l-5 20q14 8 28 0l-4-20z" fill="${STEEL2}" ${S}/><path d="M133 90q13 7 26 0" stroke="#efe8dc" stroke-width="1.4" fill="none"/>${rust(/rust/i.test(it.n))}`,
    hewing: (k, it) => `${axeHaft}<path d="M138 46h14v8h-14z" fill="${STEEL}" ${S}/><path d="M136 54h18v18h-18z" fill="${STEEL2}" ${S}/>
      <path d="M137 72l-22 32q24 10 46-4l-5-28z" fill="${STEEL2}" ${S}/><path d="M117 103q22 8 43-4" stroke="#efe8dc" stroke-width="1.4" fill="none"/>`,
    viking: (k, it) => `<path d="M18 74q66-6 128-10l1 7q-62 4-128 10z" fill="${WOOD}" ${S}/><path d="M40 72l4 8M52 71l4 8M64 70l4 8" stroke="${INK}" stroke-width="1"/>
      <path d="M138 46h14v8h-14z" fill="${STEEL}" ${S}/><path d="M136 54h18v18h-18z" fill="${STEEL2}" ${S}/>
      <path d="M137 72q-6 10-18 14q-6 8 0 18q20 6 42-6l-5-26z" fill="${STEEL2}" ${S}/><path d="M121 102q20 5 39-5" stroke="#efe8dc" stroke-width="1.4" fill="none"/>`,
    cleaver: k => D0.cleaver(k),
    tomahawk: k => `<path d="M24 70l118-8 1 6-118 9z" fill="${WOOD}" ${S}/>
      <path d="M134 44q14-6 22 6q6 14-2 30q-10 8-20-4q-8-16 0-32z" fill="#8c8478" ${S}/><path d="M138 52q8-4 12 4M140 66q8 2 12-4" ${s}/>
      <path d="M128 58l20 10M128 66l20-8M130 62h18" stroke="${RUST}" stroke-width="1.6"/>
      <path d="M118 68q-2 14 4 24M112 68q-6 14-2 26" stroke="${INK}" stroke-width=".9" fill="none"/>
      <path d="M122 92q-4 8 0 16q4-8 0-16zM110 94q-4 8 0 16q4-8 0-16z" fill="${BONE}" ${s}/>`,
    wideknife: k => `<path d="M70 52l92-6q14 0 22 10q-10 8-24 8l-90 4z" fill="#cfc6b8" ${S}/><path d="M76 58l84-6" ${s}/>
      <path d="M64 46h8v26h-8z" fill="${BRASS}" ${S}/><path d="M22 54h42v12H22q-6 0-6-6t6-6z" fill="#3a2a1e" ${S}/><circle cx="34" cy="60" r="1.6" fill="${BRASS}"/><circle cx="50" cy="60" r="1.6" fill="${BRASS}"/>`,
    bowie: k => `<path d="M70 56l80-12q20-2 34 6q-12 0-20 4q-12 6-24 8l-70 6z" fill="#cfc6b8" ${S}/><path d="M78 58l70-11" ${s}/>
      <path d="M64 44h7v30h-7z" fill="${BRASS}" ${S}/><path d="M64 44q-14-2-16 6M64 74q-14 2-16-6" fill="none" stroke="${BRASS}" stroke-width="2"/>
      <path d="M22 54h42v12H22q-6 0-6-6t6-6z" fill="${WOOD}" ${S}/><path d="M24 57h38v6H24z" fill="url(#w${k})"/>`,
    antlerknife: k => `<path d="M72 56l78-12q22-2 34 8q-14 2-30 10l-82 6z" fill="#cfc6b8" ${S}/><path d="M80 58l70-12" ${s}/><path d="M64 48h8v22h-8z" fill="${STEEL}" ${S}/>
      <path d="M18 56q20-4 46-2v12q-26 2-46-2q-6-4 0-8z" fill="${BONE}" ${S}/><path d="M28 56q2-6 6-8M44 66q2 6 6 8M26 66l-2 4" ${s}/><circle cx="34" cy="60" r="1.2" fill="${INK}"/><circle cx="48" cy="61" r="1.2" fill="${INK}"/>`,
    cutlass: k => `<path d="M58 60q50-14 110-2l-6 4 4 3-6 2 3 4q-50-8-105-3z" fill="#cfc6b8" ${S}/><path d="M66 62q46-10 96-2" ${s}/>
      <path d="M58 52q-14-10-30 0q-8 8-2 18l4-2q-4-8 2-12q10-6 22 2z" fill="${BRASS}" ${S}/><path d="M22 56h36v8H22z" fill="#3a2a1e" ${S}/><circle cx="20" cy="60" r="4" fill="${BRASS}" ${s}/>
      <path d="M58 48v24" stroke="${BRASS}" stroke-width="4"/><path d="M110 56l4 8M138 55l-3 8" stroke="${RUST}" stroke-width="1.2" opacity=".7"/>`,
  };
  Object.assign(D, W);

  // cigarette card: 1890s chromolithograph with ornate border, tinted vignette chosen by set, caption and number
  const CARD_SCENE = {
    'Amazing Inventions': k => `<circle cx="100" cy="46" r="15" fill="#8f8478" ${S}/><circle cx="100" cy="46" r="5" fill="${PAPER}" ${s}/>${[...Array(10)].map((_, i) => `<rect x="98" y="27" width="4" height="6" fill="#8f8478" ${s} transform="rotate(${i * 36} 100 46)"/>`).join('')}`,
    'Breeds of Horses': k => `<path d="M82 74q-2-16 6-26q4-10 14-14l2-8 4 7q12 2 16 14q2 6-4 8q-4 0-8-4q-4 8-2 23z" fill="#6b4a2b" ${s}/>`,
    'Famous Gunslingers & Outlaws': k => `<path d="M76 74q2-14 14-18q-8-6-6-16q4-10 16-10t16 10q2 10-6 16q12 4 14 18z" fill="#4a3a2a" ${s}/><path d="M82 32q18-8 36 0l-2 4q-16-6-32 0z" fill="#2b2016"/>`,
    'Fauna of North America': k => `<path d="M74 70q4-18 20-20l8-12q2-8 8-6l-2 8q10 4 14 16q2 10-4 14z" fill="#7a5a3a" ${s}/><path d="M106 34l-4-10M110 32l4-12" stroke="${INK}" stroke-width="1.4"/>`,
    'Flora of North America': k => `<path d="M100 74V46" stroke="#4a6b2a" stroke-width="2"/>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="100" cy="36" rx="5" ry="10" fill="#b8423a" ${s} transform="rotate(${a} 100 44)"/>`).join('')}<circle cx="100" cy="44" r="4" fill="${BRASS}"/>`,
    'Fairest Flowers & Gems of Beauty': k => `<path d="M100 30l16 14-16 28-16-28z" fill="#5a8ab0" ${S}/><path d="M84 44h32M100 30l-6 14 6 28 6-28z" ${s}/>`,
    'Marvels of Travel & Locomotion': k => `<g transform="translate(-12 2)"><path d="M70 64h50v-16h14v-10h8v26h10v8H70z" fill="#3b3128" ${s}/><circle cx="84" cy="72" r="6" fill="#5c5249" ${s}/><circle cx="104" cy="72" r="6" fill="#5c5249" ${s}/><circle cx="130" cy="70" r="8" fill="#5c5249" ${s}/><path d="M138 36q8-10 18-6" stroke="#8f8478" stroke-width="4" fill="none"/></g>`,
    'Prominent Americans': k => `<path d="M78 76q2-16 12-20q-8-6-6-16q4-12 16-12t16 12q2 10-6 16q10 4 12 20z" fill="#3a3028" ${s}/><path d="M92 58l8 8 8-8" stroke="${PAPER}" stroke-width="1.5" fill="none"/>`,
    'Stars of the Stage': k => `<path d="M78 76q2-14 12-20q-8-8-6-18q4-12 16-12q14 0 16 12q2 10-6 18q10 6 12 20z" fill="#7a3a4a" ${s}/><path d="M82 30q18-14 36 0q-4 6-8 2q-10-8-20 0q-4 4-8-2z" fill="#3a2020"/>`,
    "The World's Champions": k => `<path d="M80 76l4-20q-6-4-4-12l8-4q2-10 12-10t12 10l8 4q2 8-4 12l4 20z" fill="#7a5a3a" ${s}/><circle cx="82" cy="46" r="6" fill="${RUST}" ${s}/><circle cx="118" cy="46" r="6" fill="${RUST}" ${s}/>`,
    'Vistas, Scenery & Cities of America': k => `<path d="M64 74l18-28 10 14 14-26 24 40z" fill="#7a8a9a" ${s}/><path d="M100 34l-6 10 6-2 6 2z" fill="#fff"/><path d="M64 74h66" ${s}/>`,
    'Artists, Painters, Writers & Poets': k => `<path d="M78 70q20-34 44-30q-24 12-36 34z" fill="#efe2c4" ${s}/><path d="M86 66l-8 10" stroke="${INK}" stroke-width="2"/><ellipse cx="114" cy="62" rx="14" ry="10" fill="#c8a868" ${s}/><circle cx="110" cy="58" r="2" fill="${RUST}"/><circle cx="118" cy="60" r="2" fill="#4a6b8a"/>`,
  };
  const SET_SHORT = { 'Artists, Painters, Writers & Poets': 'Artists & Poets', 'Fairest Flowers & Gems of Beauty': 'Gems of Beauty', 'Famous Gunslingers & Outlaws': 'Famous Gunslingers',
    'Marvels of Travel & Locomotion': 'Marvels of Travel', 'Vistas, Scenery & Cities of America': 'Vistas of America', 'Fauna of North America': 'Fauna of America' };
  const SHIP = k => `<path d="M68 66h64l-8 10H76z" fill="#3b3128" ${s}/><path d="M84 66V40M100 66V34M116 66V42" ${s}/><path d="M86 42l12 20H86zM102 36l12 26h-12z" fill="#efe2c4" ${s}/><path d="M60 78q40 6 80 0" stroke="#4a6b8a" stroke-width="1.5" fill="none"/>`;
  const BALLOON = k => `<ellipse cx="100" cy="40" rx="18" ry="20" fill="#b8423a" ${s}/><path d="M86 52l8 16h12l8-16" fill="none" ${s}/><rect x="94" y="66" width="12" height="8" fill="${WOOD}" ${s}/>`;
  const SPIDER = k => `<ellipse cx="100" cy="52" rx="9" ry="11" fill="${INK}"/><circle cx="100" cy="38" r="6" fill="${INK}"/><path d="M100 54l-6 4 4 4z" fill="${RUST}"/>${[-1, 1].map(d => [30, 10, -10, -28].map(a => `<path d="M100 46q${d * 18} ${-a / 3} ${d * 28} ${-a / 2 + 8}" stroke="${INK}" stroke-width="1.6" fill="none"/>`).join('')).join('')}`;
  const SNAKE = k => `<path d="M64 70q14-14 28-2t28-4 16-22q-2-8-10-6" fill="none" stroke="#7a6a3a" stroke-width="6"/><path d="M64 70q14-14 28-2t28-4 16-22q-2-8-10-6" fill="none" stroke="${INK}" stroke-width="1" stroke-dasharray="3 3"/><circle cx="124" cy="36" r="1.5" fill="${INK}"/>`;
  const BIRD = k => `<path d="M60 52q20-18 40-4q20-14 40 4q-16-2-28 6l-12 14-12-14q-12-8-28-6z" fill="#5c4632" ${s}/><path d="M96 48l4-8 4 8z" fill="${BRASS}"/>`;
  const FISH = k => `<path d="M66 50q30-20 60 0q-30 20-60 0zM126 50l14-10v20z" fill="#7a8a6a" ${s}/><circle cx="76" cy="47" r="2" fill="${INK}"/><path d="M92 40q4 10 0 20M104 38q4 12 0 24" ${s}/>`;
  function card(it, k) {
    const nm = it.n.toLowerCase();
    const pick = /locomotive|train|railroad|railway|engine/.test(nm) ? CARD_SCENE['Marvels of Travel & Locomotion'] : /ship|boat|steamer|liner|clipper|yacht|canoe/.test(nm) ? SHIP
      : /balloon|airship|zeppelin/.test(nm) ? BALLOON : /spider|tarantula|scorpion/.test(nm) ? SPIDER : /snake|rattle|gila|serpent/.test(nm) ? SNAKE
      : /eagle|hawk|owl|pelican|crane|heron|duck|bird|condor|vulture|turkey|parrot|egret/.test(nm) ? BIRD : /\b(trout|bass|fish|sturgeon|salmon|gar|pike|perch|catfish)\b/.test(nm) ? FISH : null;
    const scene = (pick || CARD_SCENE[it.g] || (() => ''))(k);
    return `<svg viewBox="0 0 200 124" class="illus" role="img">${defs(k)}<rect width="200" height="124" fill="#1d1712"/>
      <g transform="rotate(-2.5 100 62)"><rect x="54" y="4" width="92" height="116" rx="3" fill="#efe0bc" stroke="#6b4a2b" stroke-width="2"/>
      <rect x="54" y="4" width="92" height="116" rx="3" fill="#000" filter="url(#grain${k})"/>
      <rect x="58" y="8" width="84" height="108" fill="none" stroke="${RUST}" stroke-width=".8"/><rect x="60" y="10" width="80" height="104" fill="none" stroke="${RUST}" stroke-width=".4"/>
      <rect x="64" y="16" width="72" height="64" fill="#d9c79e" stroke="${SEPIA}" stroke-width=".8"/><rect x="64" y="16" width="72" height="64" fill="url(#h${k})" opacity=".12"/>
      <clipPath id="cv${k}"><rect x="64" y="16" width="72" height="64"/></clipPath>
      <g clip-path="url(#cv${k})"><g stroke-linejoin="round" transform="translate(100 48) scale(.85) translate(-100 -48)">${sketch(k, scene)}</g></g>
      ${text(wrap(it.n, 17, 2), 100, 89, 7.2, 'font-weight="bold"')}
      <path d="M72 102h56" stroke="${RUST}" stroke-width=".5"/>${text([(SET_SHORT[it.g] || it.g || '').toUpperCase()], 100, 108, 4.4, `fill="${SEPIA}" letter-spacing=".6"`)}
      ${it.num ? `<text x="134" y="24" font-size="5" text-anchor="end" font-family="Georgia,serif" fill="${SEPIA}">No. ${it.num}</text>` : ''}</g></svg>`;
  }

  function kind(it) {
    const n = it.n.toLowerCase();
    if (it.c === 'gear' || it.c === 'early') {
      if (it.g === 'Masks') return /ram/.test(n) ? 'ramskull' : /cat/.test(n) ? 'catskull' : /pig/.test(n) ? 'pig' : 'mask';
      if (it.g === 'Hats') return /sombrero/.test(n) ? 'sombrero' : /top hat/.test(n) ? 'tophat' : /derby|bowler/.test(n) ? 'bowler' : /morion/.test(n) ? 'morion'
        : /viking/.test(n) ? 'helmet' : /racoon|raccoon|fur/.test(n) ? 'furcap' : /skull cap/.test(n) ? 'skullcap' : /miner/.test(n) ? 'miner' : /tricorn/.test(n) ? 'tricorn'
        : /mountie/.test(n) ? 'campaign' : /exotic/.test(n) ? 'feathered' : /officer|military/.test(n) ? 'cap' : 'stetson';
      if (/sword|sabre|saber|cutlass/.test(n)) return 'cutlass'; if (/cleaver/.test(n)) return 'cleaver'; if (/tomahawk/.test(n)) return 'tomahawk';
      if (/double bit/.test(n)) return 'doublebit'; if (/viking/.test(n)) return 'viking'; if (/hewing/.test(n)) return 'hewing'; if (/hunter hatchet/.test(n)) return 'hunterhatchet'; if (/hatchet|axe/.test(n)) return 'hatchet';
      if (/antler knife/.test(n)) return 'antlerknife'; if (/wide.blade/.test(n)) return 'wideknife'; if (/knife|machete/.test(n)) return 'bowie'; if (/\bbow\b/.test(n)) return 'bow';
      if (/semi.?auto(matic)? shotgun/.test(n)) return 'semiauto'; if (/pump|repeating shotgun/.test(n)) return 'pump'; if (/shotgun|sawed|sawn/.test(n)) return 'double';
      if (/rolling block/.test(n)) return 'rollingblock'; if (/bolt|carcano|springfield|sniper/.test(n)) return 'bolt';
      if (/carbine/.test(n)) return 'carbine'; if (/litchfield|evans/.test(n)) return 'litchfield'; if (/lancaster|repeater|rifle|winchester|henry/.test(n)) return 'lancaster';
      if (/midnight|volcanic/.test(n)) return 'volcanic'; if (/mauser|semi-auto|semi-automatic|m1899/.test(n)) return 'pistol';
      if (/schofield|flaco/.test(n)) return 'schofield'; if (/double.action|micah/.test(n)) return 'doubleaction';
      return 'cattleman';
    }
    return { dino: 'bone', dream: 'dream', carving: 'carving', grave: 'grave', treasure: 'map', pamph: 'pamphlet', horse: 'horse', trinket: 'trinket' }[it.c]
      || (it.c === 'loot' ? (it.g === 'Gold Bars' ? 'goldbar' : 'chest') : null);
  }

  window.RDR = window.RDR || {};
  RDR.illustration = it => {
    const k = ++uid;
    if (it.c === 'card') return card(it, k);
    const kd = kind(it); if (!kd) return '';
    let inner = D[kd](k, it);
    if (kd === 'grave') inner += text(wrap(it.n.replace(/'s Grave$|’s Grave$| Grave$/i, ''), 12, 2).map(x => x.toUpperCase()), 100, 62, 6.5, 'font-weight="bold"') + text(['R.I.P.'], 100, 92, 5);
    return paper(k, inner);
  };
})();
