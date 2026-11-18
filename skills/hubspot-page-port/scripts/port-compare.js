/*
  port-compare.js -- hubspot-page-port
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-11-18
  Lives:   skills/hubspot-page-port/scripts/port-compare.js
  Run:     in ONE browser tab at 1440px: run on the SOURCE page ("source saved"), navigate
           the same tab to the NEW page, set window.PORT_YEAR = ['2026','2027'] if the
           year changes, run again. The snapshot rides in window.name, which survives
           navigation between subdomains of one site.
  What:    compares every visible text block (copy, capitalisation, bold / italic /
           accent words, font, size, weight, colour, alignment, section background)
           and the background images of the two pages.
  Why:     a ported page passed a copy check while losing its source's background
           images, accent font, bold phrases and capitalisation. This makes the look
           comparable, not just the words.
*/
(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const file = (bi) => (bi.match(/url\("?([^")]+)"?\)/g) || []).map((u) => u.replace(/url\("?|"?\)/g, '').split('/').pop().split('?')[0]);
  // Background of the nearest ancestor that paints anything (colour or image).
  const sectionBg = (e) => {
    for (let p = e; p && p !== document.documentElement; p = p.parentElement) {
      const cs = getComputedStyle(p); const img = cs.backgroundImage !== 'none';
      if (img || cs.backgroundColor !== 'rgba(0, 0, 0, 0)') return { color: cs.backgroundColor, images: img ? (file(cs.backgroundImage)[0] ? 'image' : 'gradient') : 'none' };
    }
    return { color: 'none', images: 'none' };
  };
  const marks = (e) => {
    const out = [];
    e.querySelectorAll('strong,b,em,i,u,span,a').forEach((m) => {
      const t = m.textContent.trim(); if (!t) return;
      const cs = getComputedStyle(m), pcs = getComputedStyle(m.parentElement); const d = [];
      if (cs.fontFamily.split(',')[0] !== pcs.fontFamily.split(',')[0]) d.push('font:' + cs.fontFamily.split(',')[0].replace(/"/g, ''));
      if (cs.fontStyle !== pcs.fontStyle) d.push(cs.fontStyle);
      if (+cs.fontWeight >= 600 && +pcs.fontWeight < 600) d.push('bold');
      if (cs.color !== pcs.color) d.push('colour');
      if (d.length) out.push(t.slice(0, 40) + ' [' + d.join(' ') + ']');
    });
    return [...new Set(out)].sort();
  };
  const snap = () => ({
    url: location.href,
    blocks: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,summary')]
      .filter((e) => vis(e) && e.textContent.trim() && !(e.tagName === 'P' && e.closest('li')))
      .map((e) => { const cs = getComputedStyle(e); return { tag: e.tagName, text: e.textContent.replace(/\s+/g, ' ').trim(), font: cs.fontFamily.split(',')[0].replace(/"/g, ''), size: Math.round(parseFloat(cs.fontSize)), weight: cs.fontWeight, color: cs.color, align: cs.textAlign, marks: marks(e), bg: sectionBg(e) }; }),
    bgImages: [...new Set([...document.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 500 && r.height > 100 && getComputedStyle(e).backgroundImage.includes('url('); }).map((e) => file(getComputedStyle(e).backgroundImage)[0]))],
  });
  let saved = null; try { saved = JSON.parse(window.name); } catch (e) {}
  if (!saved || !saved.__portSource || saved.url === location.href) {
    const s = snap(); s.__portSource = true; window.name = JSON.stringify(s);
    return 'source saved: ' + s.blocks.length + ' text blocks, ' + s.bgImages.length + ' background images. Now navigate this tab to the new page and run again.';
  }
  const [yf, yt] = window.PORT_YEAR || [null, null];
  const norm = (t) => { t = t.replace(/&amp;/g, '&').replace(/^[●•\-\s]+/, '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...').replace(/\s+/g, ' ').trim(); return yf ? t.split(yf).join(yt) : t; };
  const key = (t) => norm(t).toLowerCase().replace(/[^a-z0-9]/g, '');
  const now = snap(); const pool = {};
  now.blocks.forEach((b) => (pool[key(b.text)] = pool[key(b.text)] || []).push(b));
  const R = { missing: [], capitalisation: [], formatting: [], style: [], background: [] };
  saved.blocks.forEach((s) => {
    const n = (pool[key(s.text)] || []).shift();
    if (!n) { R.missing.push(s.tag + ' ' + s.text.slice(0, 80)); return; }
    if (norm(s.text) !== norm(n.text)) R.capitalisation.push(norm(s.text).slice(0, 60) + '  ->  ' + n.text.slice(0, 60));
    const sm = s.marks.map((m) => (yf ? m.split(yf).join(yt) : m)).join(' | '), nm = n.marks.join(' | ');
    if (sm !== nm) R.formatting.push(s.text.slice(0, 45) + ': source ' + (sm || 'plain') + ' / new ' + (nm || 'plain'));
    const d = ['font', 'weight', 'color', 'align'].filter((a) => String(s[a]) !== String(n[a])).map((a) => a + ' ' + s[a] + ' -> ' + n[a]);
    if (Math.abs(s.size - n.size) > 2) d.push('size ' + s.size + ' -> ' + n.size);
    if (d.length) R.style.push(s.text.slice(0, 45) + ': ' + d.join('; '));
    if (s.bg.color !== n.bg.color || s.bg.images !== n.bg.images) R.background.push(s.text.slice(0, 45) + ': source ' + s.bg.color + ' ' + s.bg.images + ' / new ' + n.bg.color + ' ' + n.bg.images);
  });
  const extra = Object.values(pool).flat().map((b) => b.tag + ' ' + b.text.slice(0, 80));
  const out = { source: saved.url, page: location.href };
  Object.entries(R).forEach(([k, v]) => (out[k + ' (' + v.length + ')'] = v));
  out['only on new page (' + extra.length + ')'] = extra;
  out.backgroundImages = { source: saved.bgImages, new: now.bgImages };
  window.name = '';
  return out;
})();
