/*
  contrast-audit.js -- hubspot-funnel-qa
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-11-19
  Lives:   skills/hubspot-funnel-qa/scripts/contrast-audit.js
  Run:     paste into the browser console (or a javascript tool call) on a loaded page, at 1440px
           and again at 375px. Returns every visible text run whose colour is too close to the
           background it sits on.
  What:    For every visible text node (headings, paragraphs, list items, accent spans, buttons),
           finds the nearest background behind it: a background colour, or a background image
           classified by file name (your green background images count as green, the cream ones as
           cream). Computes the WCAG contrast ratio and lists anything under 3:1 (large text) or
           4.5:1 (body text), with the section's first heading so it can be found.
  Why:     Accent words in the brand green were set on a green band. Contrast 1.05:1;
           they were invisible and went live. A screenshot pass missed it; this doesn't.
  Setup:   edit GREEN_IMG / DARK_IMG / CREAM_IMG to match your own background image file
           names, so image backgrounds are classified by colour.
*/
(() => {
  const GREEN_IMG = /green-bg|bg-green/i;
  const DARK_IMG = /dark-bg|bg-dark/i;
  const CREAM_IMG = /cream-bg|bg-cream/i;
  const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
  const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const bgOf = (el) => {
    for (let p = el; p && p !== document.documentElement; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        const u = cs.backgroundImage;
        if (DARK_IMG.test(u)) return { c: [50, 49, 52], src: 'charcoal image' };
        if (GREEN_IMG.test(u)) return { c: [22, 178, 110], src: 'green image' };
        if (CREAM_IMG.test(u)) return { c: [248, 238, 228], src: 'cream image' };
        const g = u.match(/rgba?\([^)]+\)/); if (g) { const v = rgb(g[0]); if (v.length < 4 || v[3] > 0.5) return { c: v.slice(0, 3), src: 'gradient' }; }
      }
      const c = rgb(cs.backgroundColor);
      if (c.length && (c.length < 4 || c[3] > 0.5)) return { c: c.slice(0, 3), src: 'colour' };
    }
    return { c: [255, 255, 255], src: 'page' };
  };
  const sectionName = (el) => {
    const s = el.closest('[class*="dnd_area-row-"], section, [class*="dnd-section"]');
    const h = s && s.querySelector('h1,h2,h3');
    return h ? h.textContent.replace(/\s+/g, ' ').trim().slice(0, 50) : '';
  };
  const out = []; const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode; const txt = t.textContent.replace(/\s+/g, ' ').trim();
    if (txt.length < 2) continue;
    const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    if (!r.width || !r.height || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    if (el.closest('script,style,noscript,[aria-hidden="true"]')) continue;
    const bg = bgOf(el); const fg = rgb(cs.color);
    const size = parseFloat(cs.fontSize); const bold = +cs.fontWeight >= 600;
    const large = size >= 24 || (size >= 18.66 && bold);
    const cr = ratio(fg.slice(0, 3), bg.c);
    if (cr < (large ? 3 : 4.5)) out.push({ ratio: +cr.toFixed(2), text: txt.slice(0, 60), color: cs.color, bg: bg.src + ' ' + bg.c.join(','), size, section: sectionName(el) });
    // House style: text sitting straight on a green or charcoal band is white (GHL source). Dark text there
    else if ((bg.src === 'green image' || bg.src === 'charcoal image' || (bg.src === 'colour' && lum(bg.c) < 0.45 && bg.c[1] > bg.c[0] + 40)) && lum(fg.slice(0, 3)) < 0.2)
      out.push({ ratio: +cr.toFixed(2), text: txt.slice(0, 60), color: cs.color, bg: bg.src + ' (house style: white text on green/charcoal)', size, section: sectionName(el) });
  }
  return { width: innerWidth, problems: out.length, list: out.slice(0, 40) };
})();
