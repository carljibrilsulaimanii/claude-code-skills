/* crawl.js -- multi-page funnel crawler for hubspot-funnel-qa
   Author:  Jibril Sulaiman (with Claude Code)
   Date:    2026-10-15 (merged from two working crawlers)
   Deploy:  Paste into the browser console (or a javascript tool) with ONE tab open on
            the funnel's origin, e.g. https://offer.example.com. Not deployed anywhere.
   What:    Same-origin fetch() pulls every page in one pass and prints titles, meta,
            share images, dead buttons, payment links (both hosts), test links, the
            order module's link and test flag, form ids, dates, stale years, foreign
            vocabulary, spec-phrase coverage and the live-redirect check.
   Why:     Far faster than clicking through pages, and it catches the defect classes
            in references/defects.md that a page-by-page look misses.

   WHAT THIS CANNOT SEE -- check these on a LOADED page instead:
     - tracking pixels    -> HubSpot injects them at runtime
     - Stripe price/bump  -> checkout renders client-side; open the payment link
     - CTA pop-ups        -> hidden in the DOM until their trigger fires
     - desktop vs mobile  -> run the diff at the bottom of this file

   Get SLUGS from HubSpot > Content > Landing pages filtered by the funnel, NOT from a
   list someone handed you. Edit the CONFIG block, run, read the table. */

// ---------------------------------------------------------------- CONFIG
const SLUGS = [
  'registration',
  'confirmation-page',
  'toolkit-order',
  'toolkit-confirmation',
  'watch-now',
  'replay-sign-in',
  'replay',
];

// Payment link hosts. Branded custom domain uses /b/<id>; Stripe's own host has no /b/.
const PAY_RE = /(?:pay\.example\.com\/b|buy\.stripe\.com)\/[A-Za-z0-9_]+/g;

// Optional: payment link id -> product and price, from your product checklist.
const PAY_IDS = {
  // 'aBcDeF123': 'Toolkit $37 (+optional bump)',
};

// Words that should NOT appear on this funnel: the funnel it was cloned from, plus
// dead seasonal framing. A single phrase search misses variants, so list several.
const FOREIGN = /other topic|other product name|starter kit/gi;
const DEAD_FRAMING = /new year|start 20\d\d|enter the new year/gi;
const STALE_YEARS = /20(?:1\d|2[0-5])/g; // years before this campaign

// Distinctive phrases from the spec doc. Searched in RAW HTML, so collapsed accordions
// and inactive modules count as present ("hidden is not absent").
const SPEC_PHRASES = {
  // 'step 1 body': 'allow up to 30 minutes',
};

// Optional: the order module's wrapper attributes (see references/stripe.md, check 1).
const MODULE_LINK_ATTR = /data-stripe-url="([^"]*)"[^>]*data-test-mode="([^"]*)"/g;

// Optional: confirmation-page live redirect (defects.md #40). Set to null to skip.
const LIVE_REDIRECT = { config: /window\.liveClassConfig\s*=/g,
                        script: /Live_Redirect[^"']*\.js/g,
                        start: /start:\s*"([^"]*)"/ };
// ---------------------------------------------------------------- END CONFIG

const results = [];
const idOf = u => (u || '').split('/').pop();

for (const slug of SLUGS) {
  // Past the cache: a plain ?cb= has returned stale HTML a minute after publish.
  const res = await fetch('/' + slug + '?v=' + Math.random().toString(36).slice(2),
                          { cache: 'reload' });
  if (res.status !== 200) { results.push({ slug, url: location.origin + '/' + slug, status: res.status }); continue; }
  const html = await res.text();

  const pick = re => { const m = html.match(re); return m ? m[1].trim() : ''; };
  const doc = document.createElement('div');
  doc.innerHTML = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                      .replace(/<style[\s\S]*?<\/style>/gi, '');
  const text = (doc.textContent || '').replace(/\s+/g, ' ');

  // Buttons with no destination, or a relative ?... href that reloads this page.
  // HubSpot's own tell for unwired buttons: aria-label="Link not set, button inactive".
  const dead = [...doc.querySelectorAll('a')]
    .filter(a => {
      const h = a.getAttribute('href');
      const t = (a.textContent || '').trim();
      if (t.length < 3 || t.length > 60) return false;
      return !h || h === '#' || /^\?/.test(h);
    })
    .map(a => a.textContent.trim().replace(/\s+/g, ' ').slice(0, 45));

  const pay = [...new Set(html.match(PAY_RE) || [])].map(u => 'https://' + u);

  results.push({
    slug,
    url: location.origin + '/' + slug,
    status: 200,
    title: pick(/<title[^>]*>([^<]*)</i),
    description: pick(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i) || 'EMPTY',
    ogImage: pick(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)/i) || 'MISSING',
    robots: pick(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)/i) || 'none',
    deadButtons: [...new Set(dead)],
    // Full URLs and the product each one charges, because a bare id is not a task.
    payLinks: pay.map(u => ({ url: u, product: PAY_IDS[idOf(u)] || 'look up' })),
    testLinks: pay.filter(u => /\/test_/.test(u)),
    // The ONE link the order module sends buyers to, and its test flag.
    moduleLinks: MODULE_LINK_ATTR ? [...html.matchAll(MODULE_LINK_ATTR)]
      .map(m => ({ url: m[1] || '(EMPTY)', test: m[2] })) : [],
    // Form GUIDs, to resolve to names and match against the page's purpose.
    formIds: [...new Set((html.match(/formId:\s*['"]([0-9a-f-]{36})['"]/g) || [])
                .map(m => m.match(/[0-9a-f-]{36}/)[0]))],
    // A choice field on an order form only matters if something routes it.
    choiceFields: (html.match(/<(?:select|input[^>]*type=["']radio)[^>]*name="[^"]*"/g) || []).length,
    dates: [...new Set(text.match(
      /\b(?:(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day,?\s*)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2}(?:st|nd|rd|th)?\b(?:,?\s*20\d\d)?/gi
    ) || [])].slice(0, 10),
    times: [...new Set(text.match(/\d{1,2}(?::\d\d)?\s*[ap]m\s*(?:[ECMP][SD]?T)?/gi) || [])],
    staleYears: [...new Set(text.match(STALE_YEARS) || [])],
    foreignWords: [...new Set(text.match(FOREIGN) || [])],
    deadFraming: [...new Set(text.match(DEAD_FRAMING) || [])],
    // "($99 Value)" items, to check they sum to the stated total.
    itemValues: text.match(/\$[\d,]+(?:\.\d\d)?(?=\s*Value)/gi) || [],
    statedTotal: (text.match(/Total Value:\s*\$[\d,]+(?:\.\d\d)?/i) || [''])[0],
    specMissing: Object.entries(SPEC_PHRASES)
      .filter(([, phrase]) => !html.includes(phrase)).map(([label]) => label),
    live: LIVE_REDIRECT ? ((html.match(LIVE_REDIRECT.config) || []).length + '/' +
          (html.match(LIVE_REDIRECT.script) || []).length + ' ' + pick(LIVE_REDIRECT.start)) : '',
  });
}

console.table(results.map(r => ({
  url: r.url,
  status: r.status,
  title: r.title,
  desc: r.description === 'EMPTY' ? 'EMPTY' : 'set',
  og: r.ogImage === 'MISSING' ? 'MISSING' : 'set',
  robots: r.robots,
  dead: (r.deadButtons || []).length,
  pay: (r.payLinks || []).length,
  test: (r.testLinks || []).length,
  module: (r.moduleLinks || []).map(m => idOf(m.url) + (m.test === 'true' ? ' TEST' : '')).join(', '),
  forms: (r.formIds || []).length,
  foreign: (r.foreignWords || []).length,
  framing: (r.deadFraming || []).length,
  dates: (r.dates || []).join(' | '),
  live: /confirmation/.test(r.slug || '') ? r.live : '',
})));

// Titles used on more than one page break tab and share-preview identification.
const titles = results.filter(r => r.title).map(r => r.title);
const dupes = [...new Set(titles.filter((t, i) => titles.indexOf(t) !== i))];
if (dupes.length) console.warn('DUPLICATE PAGE TITLES:', dupes);

// Test mode on a published page is a Blocker: buyers can't pay.
const testing = results.filter(r => (r.testLinks || []).length ||
  (r.moduleLinks || []).some(m => m.test === 'true'));
if (testing.length) console.warn('TEST MODE LIVE:', testing.map(r => r.url));

// Order pages with a choice field: find the router, or everyone pays one link.
const choices = results.filter(r => r.choiceFields && (r.moduleLinks || []).length);
if (choices.length) console.warn('CHOICE ON AN ORDER FORM (check routing):', choices.map(r => r.url));

JSON.stringify(results, null, 1);

/* ---------------------------------------------------------------------------
   DESKTOP vs MOBILE DIFF -- the check most worth running and easiest to skip.
   Run on a LOADED page, not via fetch. Two module sets share one DOM, so this
   compares what is actually VISIBLE at each width.

   1. Resize the window to 1440 wide, load the page, run:

      function vis(e){let p=e;while(p){const c=getComputedStyle(p);
        if(c.display==='none'||c.visibility==='hidden')return false;p=p.parentElement;}return true;}
      const leaves=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,span,a,strong,div,button')]
        .filter(e=>e.children.length===0&&(e.textContent||'').trim().length>1);
      window.__D=[...new Set(leaves.filter(vis).map(e=>e.textContent.trim().replace(/\s+/g,' ')))];
      window.__D.length

   2. Resize to 375 wide WITHOUT reloading (a reload clears __D), then run:

      function vis(e){let p=e;while(p){const c=getComputedStyle(p);
        if(c.display==='none'||c.visibility==='hidden')return false;p=p.parentElement;}return true;}
      const leaves=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,span,a,strong,div,button')]
        .filter(e=>e.children.length===0&&(e.textContent||'').trim().length>1);
      const M=new Set(leaves.filter(vis).map(e=>e.textContent.trim().replace(/\s+/g,' ')));
      JSON.stringify({desktopOnly:window.__D.filter(t=>!M.has(t)),
                      mobileOnly:[...M].filter(t=>!window.__D.includes(t))},null,1)

   Anything listed is either a deliberate responsive choice or a defect. Decide which,
   one by one, and say which side is correct -- sometimes it is mobile.
   --------------------------------------------------------------------------- */
