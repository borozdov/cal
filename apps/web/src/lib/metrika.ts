/**
 * Yandex Metrika. The number below is the only place the counter is named; while it is
 * null the app loads no third-party script at all. vite.config.ts injects the loader and
 * the noscript pixel into index.html from here, so the HTML holds no counter literal.
 *
 * The counter measures our own traffic and nothing else: Metrika does not feed the search
 * index. Indexing is covered by the sitemap.
 */
export const METRIKA_ID: number | null = 113576831;

/**
 * One template literal, one line, and it stays that way: a loader written as several
 * literals joined by `+` once shipped broken, because the build folded the concatenation
 * and dropped the `','ym');` between the two counter numbers.
 *
 * `defer: true` turns off the automatic first hit. This is an SPA and the organizer page
 * carries a secret token in its path, so every hit, the first one included, is sent by
 * trackHit() with that token cut out. `ecommerce`, `referrer` and `url` from the panel
 * snippet are left out: nothing writes to a dataLayer, and the other two are what the
 * counter reads by itself.
 */
export const metrikaScript = (id: number): string =>
  `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<e.scripts.length;j++){if(e.scripts[j].src===r){return}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${id}','ym');ym(${id},'init',{ssr:true,defer:true,webvisor:true,clickmap:true,accurateTrackBounce:true,trackLinks:true});`;

export const metrikaPixel = (id: number): string => `https://mc.yandex.ru/watch/${id}`;

export type Goal = 'theme_toggle' | 'poll_create' | 'poll_respond' | 'poll_confirm' | 'ics_download';

type Params = Record<string, string | number>;
type Metrika = (id: number, action: string, ...args: unknown[]) => void;

function callMetrika(action: string, ...args: unknown[]): void {
  if (METRIKA_ID === null) return;
  const ym = (window as unknown as { ym?: Metrika }).ym;
  if (typeof ym !== 'function') return;
  try {
    ym(METRIKA_ID, action, ...args);
  } catch {
    // Analytics is never a reason for the app to fail.
  }
}

/** The organizer token grants edit rights, so it never leaves for Yandex. */
export const publicPath = (path: string): string =>
  path.replace(/^(\/p\/[^/]+\/admin)\/[^/]+/, '$1');

/** Reports a page view for the current route. */
export const trackHit = (path: string, referer?: string): void => {
  callMetrika('hit', `${location.origin}${publicPath(path)}`, {
    title: document.title,
    ...(referer ? { referer } : {}),
  });
};

/** Reports a goal if a counter is configured and loaded. Silent otherwise, never throwing. */
export const trackGoal = (goal: Goal, params?: Params): void => {
  callMetrika('reachGoal', goal, params);
};
