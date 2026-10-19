/**
 * Jetons de design. Les outils (ombre étagée, verre, grille de 8) restent identiques ;
 * seul le `theme` change d'une marque à l'autre. Voir le skill (§ Système premium).
 */
export const grid = (n: number) => n * 8; // grille de 8 px
export const radii = { card: 32, pill: 999, thumb: 24, sheet: 44 };

// ombre étagée (proche + lointaine), teintée de la couleur de la marque — "r,g,b"
export const layerShadow = (rgb = "60,44,20") =>
  `0 2px 8px rgba(${rgb},0.06), 0 30px 60px rgba(${rgb},0.14)`;

export const innerHi = "inset 0 1px 0 rgba(255,255,255,0.55)";

export const glass = (alpha = 0.62) => ({
  background: `rgba(255,252,246,${alpha})`,
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  border: "1px solid rgba(255,255,255,0.6)",
});

// échelle typographique (px pour 1080 de large)
export const type = { display: 120, title: 72, heading: 50, body: 38, label: 30 };

/** The Insight Lab — thème clair premium (série Reels : aucun fond noir). */
export const theme = {
  bg: "#F8F3EA",          // ivoire
  surface: "#FFFDF8",     // carte
  surfaceAlt: "#EEE1C6",  // champagne
  ink: "#1D1B18",         // encre
  muted: "#6E665B",       // gris chaud
  primary: "#B88A3E",     // or
  primaryHi: "#D8B66C",   // or clair
  primaryDeep: "#8C6526", // or profond : texte or sur fond clair
  accent: "#B88A3E",      // une seule couleur d'accent : l'or
  success: "#5E7A4F",     // vert olive discret (validation)
  hairline: "rgba(60,44,20,0.10)",
  shadowRgb: "60,44,20",
  grad: {
    brand: "linear-gradient(135deg,#D8B66C,#B88A3E 55%,#8C6526)",
    deep: "radial-gradient(90% 60% at 50% 38%,#FFFDF8,#F8F3EA 55%,#EFE4D0)",
  },
};
export type Theme = typeof theme;

/** Variante « signature » (bleu nuit, or, blanc chaud) — uniquement si le brief la demande. */
export const themeNuit: Theme = {
  ...theme,
  bg: "#0F1B2D", surface: "#16263D", surfaceAlt: "#1D3150",
  ink: "#FBF6EC", muted: "#AEB6C4", primaryDeep: "#D8B66C",
  hairline: "rgba(251,246,236,0.10)", shadowRgb: "0,0,0",
  grad: { ...theme.grad, deep: "radial-gradient(80% 60% at 50% 38%,#1D3150,#0F1B2D)" },
};
