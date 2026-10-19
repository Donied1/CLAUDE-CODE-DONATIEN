import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

/**
 * Polices locales (SIL OFL) servies depuis public/fonts : aucun accès réseau au rendu.
 * SERIF = Cormorant Garamond (titres) ; SANS = Manrope variable 200-800 (texte, interface).
 * Pour une autre marque : déposer ses .woff2 dans public/fonts et compléter FACES.
 * (Chargement CSS + document.fonts : plus fiable ici que @remotion/fonts, qui bloquait le rendu.)
 */
export const SERIF = "Cormorant";
export const SANS = "Manrope";

const FACES: [string, string, string, string][] = [
  [SERIF, "cormorant-garamond-latin-600-normal.woff2", "600", "normal"],
  [SERIF, "cormorant-garamond-latin-700-normal.woff2", "700", "normal"],
  [SERIF, "cormorant-garamond-latin-600-italic.woff2", "600", "italic"],
  [SANS, "manrope-latin-wght-normal.woff2", "200 800", "normal"],
];

let ready: Promise<unknown> | null = null;
const loadAll = () => {
  if (ready) return ready;
  const el = document.createElement("style");
  el.textContent = FACES.map(([fam, file, w, st]) =>
    `@font-face{font-family:"${fam}";src:url("${staticFile(`fonts/${file}`)}") format("woff2");font-weight:${w};font-style:${st};font-display:block}`).join("\n");
  document.head.appendChild(el);
  const loads = FACES.map(([fam, , w, st]) => document.fonts.load(`${st} ${w.split(" ")[0]} 40px "${fam}"`));
  ready = Promise.all(loads).catch((e) => console.error("Police non chargée", e));
  return ready;
};

/** À appeler en tête de CHAQUE composition : le rendu attend que les polices soient prêtes. */
export const useBrandFonts = () => {
  const [handle] = useState(() => delayRender("Chargement des polices de la marque"));
  useEffect(() => { loadAll().then(() => continueRender(handle)); }, [handle]);
};

/** Typographie française : espace fine insécable avant ; : ! ? » et après « */
export const fr = (s: string) => s.replace(/ ?([;:!?»])/g, "\u202F$1").replace(/« ?/g, "«\u202F");
