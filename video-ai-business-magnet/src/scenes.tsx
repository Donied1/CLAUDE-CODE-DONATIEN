import React from 'react';
import {AbsoluteFill, Easing, Img, staticFile} from 'remotion';
import {CONTENT_W, P, SANS, SERIF, cues as c, design, fit, interp, rand, ramp, useG, useSpring} from './lib';

const center: React.CSSProperties = {
  position: 'absolute', left: design.safe.left, width: CONTENT_W, textAlign: 'center',
};

// Texte qui monte derriere un cache (opacite verrouillee a 0 avant le repere)
const Reveal: React.FC<{at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, dur = 0.7, children, style}) => {
  const t = useG();
  const p = ramp(t, at, dur);
  return (
    <div style={{overflow: 'hidden', padding: '0.12em 0.1em 0.2em', ...style}}>
      <div style={{transform: `translateY(${(1 - p) * 120}%)`, opacity: p === 0 ? 0 : 1}}>{children}</div>
    </div>
  );
};

const Kicker: React.FC<{children: string}> = ({children}) => (
  <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: '0.32em', color: P.gold}}>{children}</div>
);

// ---------- 1. ACCROCHE ----------
export const Hook: React.FC = () => {
  const t = useG();
  const hit = useSpring(c.hookHit, {damping: 9, stiffness: 170, mass: 0.8});
  const shake = t > c.hookHit && t < c.hookHit + 0.35 ? Math.sin(t * 90) * 14 * (1 - (t - c.hookHit) / 0.35) : 0;
  const flash = interp(t, [c.hookHit, c.hookHit + 0.5], [0.35, 0]);
  const out = ramp(t, c.toolsIn - 0.35, 0.35);
  const l1 = 'Vous payez';
  const l2 = 'un abonnement IA…';
  const l3 = 'pour rien ?';
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translateX(${shake}px) scale(${1 + out * 0.08})`}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 55%, ${P.gold} 0%, transparent 60%)`, opacity: flash}} />
      <div style={{...center, top: 640}}>
        <Reveal at={c.hookLine1}>
          <div style={{fontFamily: SANS, fontWeight: 800, color: P.ink, fontSize: fit(l1, CONTENT_W, SANS, 800, 120), letterSpacing: '-0.03em'}}>{l1}</div>
        </Reveal>
        <Reveal at={c.hookLine2}>
          <div style={{fontFamily: SANS, fontWeight: 800, color: P.ink, fontSize: fit(l2, CONTENT_W, SANS, 800, 104), letterSpacing: '-0.03em'}}>{l2}</div>
        </Reveal>
        <div style={{
          marginTop: 40, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: P.gold,
          fontSize: fit(l3, CONTENT_W, SERIF, 700, 200), opacity: t < c.hookHit ? 0 : 1,
          transform: `scale(${interp(hit, [0, 1], [2.2, 1])})`, textShadow: `0 0 60px ${P.goldDeep}`,
        }}>{l3}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. OUTILS SANS METHODE ----------
const TOOLS = ['Texte', 'Images', 'Vidéos', 'Avatars', 'Voix', 'Publicités'];
export const Tools: React.FC = () => {
  const t = useG();
  const fall = ramp(t, c.noMethod, 0.8, Easing.in(Easing.quad));
  const titleOut = ramp(t, c.noMethod - 0.1, 0.3);
  const out = ramp(t, c.billIn - 0.3, 0.3);
  const head = 'Tout le monde a accès à l’IA.';
  const no1 = 'Mais sans méthode…';
  const no2 = 'elle ne vous sert à rien.';
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{...center, top: 360, opacity: 1 - titleOut}}>
        <Reveal at={c.toolsIn + 0.1}>
          <div style={{fontFamily: SANS, fontWeight: 800, color: P.ink, fontSize: fit(head, CONTENT_W, SANS, 800, 86), letterSpacing: '-0.03em'}}>{head}</div>
        </Reveal>
      </div>
      {TOOLS.map((name, i) => {
        const at = c.toolsChips + i * c.chipStep;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const s = useSpring(at);
        const col = i % 2, row = Math.floor(i / 2);
        const x = design.safe.left + 40 + col * 470;
        const y = 640 + row * 210;
        const d = rand(i, 3);
        const fx = (d - 0.5) * 500 * fall;
        const fy = fall * (1300 + d * 600);
        const rot = (d - 0.5) * 120 * fall;
        return (
          <div key={name} style={{
            position: 'absolute', left: x, top: y, width: 420, height: 160, borderRadius: 32,
            background: `linear-gradient(140deg, ${P.panel}, #1C1810)`, border: `2px solid ${P.goldDeep}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22,
            fontFamily: SANS, fontWeight: 600, fontSize: 52, color: P.cream,
            opacity: t < at ? 0 : 1 - Math.min(1, fall * 1.6),
            transform: `translate(${fx}px, ${fy}px) rotate(${rot}deg) scale(${s})`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
            <span style={{width: 18, height: 18, borderRadius: 9, background: P.gold, boxShadow: `0 0 18px ${P.gold}`}} />
            {name}
          </div>
        );
      })}
      <div style={{...center, top: 720}}>
        <Reveal at={c.noMethodLine1 - 0.1}>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: P.gold, fontSize: fit(no1, CONTENT_W, SERIF, 700, 112)}}>{no1}</div>
        </Reveal>
        <Reveal at={c.noMethodLine2 - 0.1}>
          <div style={{fontFamily: SANS, fontWeight: 800, color: P.ink, fontSize: fit(no2, CONTENT_W, SANS, 800, 80), letterSpacing: '-0.02em'}}>{no2}</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3. L'ABONNEMENT INUTILE ----------
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'];
export const Bill: React.FC = () => {
  const t = useG();
  const inS = useSpring(c.billIn, {damping: 16, stiffness: 120, mass: 0.9});
  const out = ramp(t, c.quoteIn - 0.35, 0.35);
  const zero = useSpring(c.billZero, {damping: 8, stiffness: 200, mass: 0.6});
  const paid = MONTHS.filter((_, i) => t >= c.billMonths + i * c.monthStep + 0.12).length;
  const last = 'Un abonnement inutile.';
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{
        position: 'absolute', left: 130, width: 820, top: 300, borderRadius: 44, padding: '56px 64px',
        background: `linear-gradient(160deg, #17141B, ${P.panel})`, border: `2px solid rgba(201,168,76,0.45)`,
        boxShadow: '0 40px 120px rgba(0,0,0,0.7)', transform: `translateY(${(1 - inS) * 300}px)`, opacity: inS,
      }}>
        <Kicker>ABONNEMENT IA</Kicker>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 34, color: P.muted, marginTop: 10}}>Prélèvement mensuel</div>
        <div style={{marginTop: 34}}>
          {MONTHS.map((m, i) => {
            const at = c.billMonths + i * c.monthStep;
            const row = ramp(t, at, 0.3);
            const st = ramp(t, at + 0.12, 0.18, Easing.out(Easing.back(3)));
            return (
              <div key={m} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 84,
                borderBottom: '1px solid rgba(232,227,216,0.1)', opacity: row, transform: `translateX(${(1 - row) * -40}px)`}}>
                <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 42, color: P.cream}}>{m}</span>
                <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.12em', color: P.gold,
                  border: `3px solid ${P.gold}`, borderRadius: 12, padding: '6px 16px',
                  opacity: st > 0 ? 1 : 0, transform: `rotate(-8deg) scale(${interp(st, [0, 1], [2, 1])})`}}>PAYÉ ✓</span>
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 44}}>
          <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, color: P.cream}}>Résultats concrets</span>
          <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 120, lineHeight: 1, color: t >= c.billZero ? P.alert : P.muted,
            transform: `scale(${t >= c.billZero ? interp(zero, [0, 1], [1.8, 1]) : 1})`}}>0</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 130, width: 820, top: 1290, fontFamily: SANS, fontWeight: 600, fontSize: 34, color: P.muted, textAlign: 'center', opacity: ramp(t, c.billMonths, 0.4)}}>
        {paid} mois payé{paid > 1 ? 's' : ''}
      </div>
      <div style={{...center, top: 1400}}>
        <Reveal at={c.billZero + 0.3}>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: P.gold, fontSize: fit(last, CONTENT_W - 60, SERIF, 700, 92), whiteSpace: 'nowrap'}}>{last}</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. LA PHRASE DU SITE + FIL D'OR ----------
export const Quote: React.FC = () => {
  const t = useG();
  const out = ramp(t, c.offerIn - 0.35, 0.35);
  const q1a = 'L’IA ne fait pas vendre';
  const q1b = 'toute seule.';
  const q2a = 'C’est la stratégie qui';
  const q2b = 'fait la différence.';
  const big = fit(q1a, CONTENT_W, SANS, 800, 88);
  const serif = fit(q2a, CONTENT_W, SERIF, 700, 96);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{...center, top: 760}}>
        <Reveal at={c.quoteIn + 0.15}><div style={{fontFamily: SANS, fontWeight: 800, color: P.ink, fontSize: big, letterSpacing: '-0.03em'}}>{q1a}</div></Reveal>
        <Reveal at={c.quoteIn + 0.35}><div style={{fontFamily: SANS, fontWeight: 800, color: P.ink, fontSize: big, letterSpacing: '-0.03em'}}>{q1b}</div></Reveal>
      </div>
      <div style={{...center, top: 1190}}>
        <Reveal at={c.quoteLine2}><div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: P.gold, fontSize: serif}}>{q2a}</div></Reveal>
        <Reveal at={c.quoteLine2 + 0.2}><div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: P.gold, fontSize: serif}}>{q2b}</div></Reveal>
        <div style={{marginTop: 30, fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: '0.28em', color: P.muted, opacity: ramp(t, c.quoteLine2 + 0.8, 0.6)}}>— THE INSIGHT LAB</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. L'OFFRE ----------
const DOMAINS = ['les entrepreneurs', 'les freelances', 'les créateurs de contenu', 'votre domaine'];
export const Offer: React.FC = () => {
  const t = useG();
  const out = ramp(t, c.benefitsIn - 0.3, 0.3);
  const title = useSpring(c.offerTitle, {damping: 14, stiffness: 110, mass: 1});
  const sweep = interp(t, [c.offerTitle + 0.3, c.offerTitle + 1.3], [-30, 130]);
  const idx = Math.min(DOMAINS.length - 1, Math.max(0, Math.floor((t - c.offerDomain) / c.domainStep)));
  const local = t - c.offerDomain - idx * c.domainStep;
  const roll = ramp(local + 0.0001, 0, 0.28);
  const word = DOMAINS[idx];
  const wSize = fit(word, CONTENT_W - 80, SERIF, 700, 92);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{...center, top: 470, opacity: ramp(t, c.offerIn, 0.4)}}><Kicker>LA FORMATION</Kicker></div>
      <div style={{...center, top: 540, transform: `scale(${interp(title, [0, 1], [0.85, 1])})`, opacity: t < c.offerTitle ? 0 : title}}>
        {['AI Business', 'Magnet'].map((w) => (
          <div key={w} style={{
            fontFamily: SANS, fontWeight: 800, fontSize: fit('AI Business', CONTENT_W, SANS, 800, 150), lineHeight: 1.05, letterSpacing: '-0.04em',
            backgroundImage: `linear-gradient(100deg, ${P.goldDeep} 0%, ${P.gold} ${sweep - 20}%, #FFF4CF ${sweep}%, ${P.gold} ${sweep + 20}%, ${P.goldDeep} 100%)`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          }}>{w}</div>
        ))}
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 38, color: P.cream, marginTop: 18}}>par The Insight Lab</div>
      </div>
      <div style={{...center, top: 1080, opacity: ramp(t, c.offerDomain - 0.4, 0.4)}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 46, color: P.ink}}>Taillée sur mesure pour</div>
        <div style={{marginTop: 30, height: 150, borderRadius: 75, border: `2px solid ${P.gold}`, background: 'rgba(201,168,76,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: wSize, color: P.gold, transform: `translateY(${(1 - roll) * 100}%)`, opacity: t < c.offerDomain ? 0 : 1}}>{word}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6. CE QUE VOUS APPRENEZ ----------
const ITEMS = ['Des avatars IA', 'Des vidéos professionnelles', 'Des publicités UGC'];
const PERKS = ['Sur vos propres projets', 'Accompagnement personnalisé', 'Aucune compétence technique'];
export const Benefits: React.FC = () => {
  const t = useG();
  const out = ramp(t, c.cta - 0.35, 0.35);
  const head = 'Vous apprenez à créer :';
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <div style={{...center, top: 380}}>
        <Reveal at={c.benefitsIn}><div style={{fontFamily: SANS, fontWeight: 800, fontSize: fit(head, CONTENT_W, SANS, 800, 80), color: P.ink, letterSpacing: '-0.03em'}}>{head}</div></Reveal>
      </div>
      {ITEMS.map((it, i) => {
        const at = [c.benefit0, c.benefit1, c.benefit2][i] - 0.1;
        const p = ramp(t, at, 0.5);
        const check = ramp(t, at + 0.1, 0.4);
        return (
          <div key={it} style={{position: 'absolute', left: design.safe.left + 20, top: 600 + i * 170, display: 'flex', alignItems: 'center', gap: 36,
            opacity: p, transform: `translateX(${(1 - p) * 80}px)`}}>
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="44" fill="none" stroke={P.gold} strokeWidth="4" opacity={0.5} />
              <path d="M28 50 L42 64 L70 34" fill="none" stroke={P.gold} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
            </svg>
            <span style={{fontFamily: SANS, fontWeight: 600, fontSize: fit(it, CONTENT_W - 150, SANS, 600, 60), color: P.cream}}>{it}</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: design.safe.left, width: CONTENT_W, top: 1180, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        {PERKS.map((pk, i) => {
          const p = ramp(t, c.perksIn + i * c.perkStep, 0.4);
          return (
            <div key={pk} style={{fontFamily: SANS, fontWeight: 600, fontSize: 38, color: P.gold, padding: '14px 34px', borderRadius: 40,
              border: '2px solid rgba(201,168,76,0.5)', background: 'rgba(201,168,76,0.07)', opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>{pk}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 7. APPEL A L'ACTION ----------
export const Cta: React.FC = () => {
  const t = useG();
  const logo = useSpring(c.ctaLogo, {damping: 12, stiffness: 120, mass: 0.9});
  const url = useSpring(c.ctaUrl);
  const glow = 0.5 + 0.5 * Math.sin(t * 3);
  const join = 'Rejoignez AI Business Magnet';
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 30%, rgba(201,168,76,${0.18 + glow * 0.06}) 0%, transparent 55%)`, opacity: ramp(t, c.cta, 0.6)}} />
      <Img src={staticFile('brand/logo.png')} style={{position: 'absolute', left: 540 - 220, top: 280, width: 440,
        opacity: t < c.ctaLogo ? 0 : 1, transform: `scale(${logo}) rotate(${(1 - logo) * -25}deg)`}} />
      <div style={{...center, top: 800}}>
        <Reveal at={c.ctaLogo + 0.5}><div style={{fontFamily: SANS, fontWeight: 800, fontSize: fit(join, CONTENT_W, SANS, 800, 74), color: P.ink, letterSpacing: '-0.03em'}}>{join}</div></Reveal>
        <Reveal at={c.ctaLogo + 0.75}><div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 52, color: P.cream}}>et faites enfin travailler l’IA pour vous.</div></Reveal>
      </div>
      <div style={{position: 'absolute', left: design.safe.left, width: CONTENT_W, top: 1110, display: 'flex', justifyContent: 'center', opacity: t < c.ctaUrl ? 0 : 1, transform: `scale(${url})`}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: fit('theinsightlab.net/ai-business-magnet', CONTENT_W - 100, SANS, 800, 46), color: P.bg,
          background: `linear-gradient(100deg, ${P.goldLight}, ${P.gold})`, padding: '30px 44px', borderRadius: 60, boxShadow: `0 0 ${30 + glow * 30}px rgba(201,168,76,0.55)`}}>
          theinsightlab.net/ai-business-magnet
        </div>
      </div>
      <div style={{...center, top: 1290, fontFamily: SANS, fontWeight: 600, fontSize: 36, color: P.cream, opacity: ramp(t, c.ctaUrl + 0.5, 0.5)}}>
        Infos sur WhatsApp : +971 55 695 7882
      </div>
      <div style={{...center, top: 1420, fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: '0.3em', color: P.gold, opacity: ramp(t, c.ctaUrl + 1.0, 0.6)}}>
        DES IDÉES À L’IMPACT.
      </div>
    </AbsoluteFill>
  );
};
