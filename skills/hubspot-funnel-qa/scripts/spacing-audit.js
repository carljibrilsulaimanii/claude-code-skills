/*
  spacing-audit.js -- hubspot-funnel-qa
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-11-19
  Lives:   skills/hubspot-funnel-qa/scripts/spacing-audit.js
  Run:     paste into the browser console (or a javascript tool call) on a loaded page, at 1440px
           and again at 375px.
  What:    Walks every section top to bottom and measures the vertical gap between each pair of
           stacked blocks (headings, paragraphs, lists, buttons, images, videos, cards) that
           overlap horizontally. Flags gaps that are too tight for the pair:
             heading -> media/grid/card under 24px, heading -> text under 8px,
             text or button -> button under 16px, button -> text under 10px,
             anything -> anything under 4px, and overlaps (negative gaps).
  Why:     Spacing was judged by eye on scaled-down screenshots and kept coming back as
           "fix spacing". This measures it. On a page with a source, fix each finding by
           matching the source, not by a house rule.
*/
(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 20 && r.height > 6 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity !== 0; };
  const kind = (e) => {
    if (/^H[1-6]$/.test(e.tagName)) return 'heading';
    if (e.matches('a.hs-elevate-button, a[class*="button"], button, .bb-btn')) return 'button';
    if (e.matches('img, video, iframe, .bb-camps, .bb-video, .bb-photos, .hs-elevate-card, [class*="card"]')) return 'media';
    if (e.matches('p, li, ul, ol, summary, figcaption')) return 'text';
    return null;
  };
  const sel = 'h1,h2,h3,h4,h5,h6,p,ul,ol,summary,a.hs-elevate-button,a.bb-btn,button,img,video,iframe,.bb-camps,.bb-photos';
  const secName = (s) => { const h = s.querySelector('h1,h2,h3,h4'); return h ? h.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) : '(no heading)'; };
  const sections = [...document.querySelectorAll('[class*="dnd-section"]')].filter(vis);
  const out = [];
  sections.forEach((s) => {
    const items = [...s.querySelectorAll(sel)]
      .filter((e) => vis(e) && kind(e) && !e.parentElement.closest('li, figure figcaption, a.hs-elevate-button, .bb-camps, .bb-photos, details:not([open])'))
      .filter((e) => !(e.tagName === 'P' && e.closest('li')))
      .map((e) => ({ e, k: kind(e), r: e.getBoundingClientRect() }))
      .sort((a, b) => a.r.top - b.r.top);
    // Section edges: first block to the section top, last block to the section bottom.
    const sr = s.getBoundingClientRect(); const edge = innerWidth < 768 ? 28 : 44;
    if (items.length) {
      const top = Math.round(items[0].r.top - sr.top), bottom = Math.round(sr.bottom - Math.max(...items.map((x) => x.r.bottom)));
      if (top < edge) out.push({ section: secName(s), gap: top, need: edge, above: 'section top', below: items[0].k + ': ' + (items[0].e.textContent || items[0].e.alt || '').trim().slice(0, 35) });
      if (bottom < edge) out.push({ section: secName(s), gap: bottom, need: edge, above: 'last block', below: 'section bottom' });
    }
    for (let i = 1; i < items.length; i++) {
      const b = items[i];
      // the closest block above that overlaps horizontally and isn't an ancestor/descendant
      let a = null;
      for (let j = i - 1; j >= 0; j--) {
        const c = items[j];
        if (c.e.contains(b.e) || b.e.contains(c.e)) continue;
        if (c.r.right <= b.r.left || c.r.left >= b.r.right) continue;
        if (c.r.bottom <= b.r.top + 2) { if (!a || c.r.bottom > a.r.bottom) a = c; }
      }
      if (!a) continue;
      const gap = Math.round(b.r.top - a.r.bottom);
      let min = 4;
      if (a.k === 'heading' && b.k === 'media') min = 24;
      else if (a.k === 'heading' && b.k === 'text') min = 8;
      else if ((a.k === 'text' || a.k === 'button') && b.k === 'button') min = 16;
      else if (a.k === 'button' && b.k === 'text') min = 10;
      if (gap < min) out.push({ section: secName(s), gap, need: min, above: a.k + ': ' + (a.e.textContent || a.e.alt || a.e.tagName).replace(/\s+/g, ' ').trim().slice(0, 35), below: b.k + ': ' + (b.e.textContent || b.e.alt || b.e.tagName).replace(/\s+/g, ' ').trim().slice(0, 35) });
    }
  });
  return { width: innerWidth, sections: sections.length, problems: out.length, list: out.slice(0, 40) };
})();
