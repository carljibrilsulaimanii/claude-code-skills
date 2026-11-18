/*
  page-snapshot.js -- hubspot-page-port
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-11-18
  Lives:   skills/hubspot-page-port/scripts/page-snapshot.js
  Run:     in the browser console on each page at 1440px; save each result as JSON and
           run port_diff.py. Use it when the two pages are on different sites.
  What:    lists every visible text block with its formatting, font, size, colour,
           alignment and section background, plus background images and images.
  Why:     a ported page passed a copy check while losing its source's background
           images, accent font, bold phrases and capitalisation. This makes the look
           comparable, not just the words.
*/
(() => {
  const vis = (e) => {
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  const file = (bi) => (bi.match(/url\("?([^")]+)"?\)/g) || []).map((u) => u.replace(/url\("?|"?\)/g, '').split('/').pop().split('?')[0]);
  // Background of the nearest ancestor that paints one (colour, gradient or image).
  const sectionBg = (e) => {
    const imgs = []; let color = null;
    for (let p = e; p && p !== document.documentElement; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') imgs.push(...(file(cs.backgroundImage).length ? file(cs.backgroundImage) : ['gradient']));
      if (!color && cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') color = cs.backgroundColor;
      if (color && imgs.length) break;
    }
    return { color, images: [...new Set(imgs)] };
  };
  // Inline formatting inside a block: which words are bold / italic / in an accent span.
  const marks = (e) => {
    const out = [];
    e.querySelectorAll('strong,b,em,i,u,span,a').forEach((m) => {
      const t = m.textContent.trim(); if (!t) return;
      const cs = getComputedStyle(m), pcs = getComputedStyle(m.parentElement);
      const diff = [];
      if (cs.fontFamily !== pcs.fontFamily) diff.push('font:' + cs.fontFamily.split(',')[0].replace(/"/g, ''));
      if (cs.fontStyle !== pcs.fontStyle) diff.push(cs.fontStyle);
      if (+cs.fontWeight >= 600 && +pcs.fontWeight < 600) diff.push('bold');
      if (cs.color !== pcs.color) diff.push('color:' + cs.color);
      if (cs.textDecorationLine !== pcs.textDecorationLine && cs.textDecorationLine !== 'none') diff.push(cs.textDecorationLine);
      if (diff.length) out.push(t.slice(0, 60) + ' [' + diff.join(' ') + ']');
    });
    return [...new Set(out)];
  };
  const blocks = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,button,a.btn,a[class*=button],summary')]
    .filter((e) => vis(e) && e.textContent.trim() && !(e.tagName === 'P' && e.closest('li')))
    .map((e) => {
      const cs = getComputedStyle(e);
      return {
        y: Math.round(e.getBoundingClientRect().top + scrollY),
        tag: e.tagName,
        text: e.textContent.replace(/\s+/g, ' ').trim(),
        font: cs.fontFamily.split(',')[0].replace(/"/g, ''),
        size: Math.round(parseFloat(cs.fontSize)),
        weight: cs.fontWeight,
        color: cs.color,
        align: cs.textAlign,
        marks: marks(e),
        bg: sectionBg(e),
      };
    });
  const backgrounds = [];
  document.querySelectorAll('*').forEach((e) => {
    const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
    if (cs.backgroundImage !== 'none' && r.width > 500 && r.height > 100)
      backgrounds.push({ y: Math.round(r.top + scrollY), h: Math.round(r.height), image: file(cs.backgroundImage)[0] || 'gradient', color: cs.backgroundColor });
  });
  const images = [...document.images].filter(vis).map((i) => ({ y: Math.round(i.getBoundingClientRect().top + scrollY), w: Math.round(i.getBoundingClientRect().width), file: (i.currentSrc || i.src).split('/').pop().split('?')[0] }));
  return JSON.stringify({ url: location.href, width: innerWidth, blocks, backgrounds, images });
})();
