"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./OriginObjectsSection.module.css";

gsap.registerPlugin(ScrollTrigger);

/* ── Scroll budget ───────────────────────────────────────────────
   0.00 → 0.46   Phase 1: words start huge+centred, shrink+spread;
                 cards slide in one-by-one from the gap between words
   0.46 → 0.60   Cards gather into a deck; words fade out together
   0.60 → 0.72   Dead zone — split fully invisible, nothing yet
   0.72 → 0.82   Phase 2 fades in
   0.82 → 1.00   Card cycling: front card lifts, rises, arcs behind
   ─────────────────────────────────────────────────────────────── */
const P1_END = 0.46;
const GATHER_START = 0.46;
const GATHER_END = 0.60;
const P2_FADE_START = 0.60;
const P2_FADE_END = 0.74;
const P2_CARDS_START = 0.82;
const N = 4;

const TITLES = [
  "(I) Material Palette",
  "(II) Spatial Composition",
  "(III) Light & Shadow",
  "(IV) Tactile Harmony",
];

const CARD_DESCS = [
  "Every material carries a story — from hand-selected marble veins to the grain of aged oak. Our palette begins where nature ends, curating textures that speak of permanence and poetry.",
  "Space is not merely occupied; it is composed. Each room is orchestrated like a symphony — proportion, rhythm, and negative space converging to create harmony that resonates.",
  "Light sculpts what architecture frames. We design for the sun's migration, crafting interiors where shadows become features and golden hours become daily rituals.",
  "The final measure of a space is how it feels beneath your fingertips. Every surface, every edge, every threshold is calibrated for an encounter that lingers in memory.",
];

const CARD_IMAGES = ["/design6.jpeg", "/design1.jpeg", "/hero.jpeg", "/design5.jpeg"];
const PILL_IMAGES = ["/design7.jpeg", "/design4.jpeg", "/design2.jpeg", "/design5.jpeg"];

/* ── Helpers ─────────────────────────────────────────────────── */
function eio(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
function eOut(t: number) { return 1 - (1 - t) * (1 - t); }
function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function norm(v: number, a: number, b: number) { return clamp((v - a) / (b - a), 0, 1); }

function deckRestY(i: number) { return -i * 13; }
function deckRestScale(i: number) { return 1 - i * 0.042; }

export default function OriginObjectsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const splitStageRef = useRef<HTMLDivElement>(null);
  const wLRef = useRef<HTMLSpanElement>(null);
  const wRRef = useRef<HTMLSpanElement>(null);
  const iCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardsStageRef = useRef<HTMLDivElement>(null);
  const dCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descTextsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const pinContainer = pinContainerRef.current;
    const splitStage = splitStageRef.current;
    const cardsStage = cardsStageRef.current;
    const wL = wLRef.current;
    const wR = wRRef.current;
    if (!section || !pinContainer || !splitStage || !cardsStage || !wL || !wR) return;

    const iCards = iCardRefs.current.filter(Boolean) as HTMLDivElement[];
    const dCards = dCardRefs.current.filter(Boolean) as HTMLDivElement[];
    const descTexts = descTextsRef.current.filter(Boolean) as HTMLSpanElement[];

    // ── Word measurement cache — measure ONCE, never re-measure mid-animation ──
    // We set fontSize first at max size, measure the width, then animate from there.
    let wLWidthAtMax = 0;
    let wRWidthAtMax = 0;

    function measureWords() {
      const vw = window.innerWidth;
      const maxSize = vw * 0.13;
      // Temporarily set to max size to measure
      wL.style.fontSize = `${maxSize}px`;
      wR.style.fontSize = `${maxSize}px`;
      wLWidthAtMax = wL.offsetWidth;
      wRWidthAtMax = wR.offsetWidth;
    }
    measureWords();

    // Re-measure on resize
    const onResize = () => {
      measureWords();
    };
    window.addEventListener("resize", onResize);

    let prevCardIdx = -1;

    const st = ScrollTrigger.create({
      trigger: pinContainer,
      start: "top top",
      end: "+=1000%",
      pin: true,
      scrub: 2.4,
      onUpdate: (self) => {
        const p = self.progress;
        renderPhase1(p);
        renderCrossfade(p);
        renderPhase2(p);
      },
    });

    /* ════════════════════════════════════════════════════
       PHASE 1
       Words use transform:translate ONLY (no left/top change)
       so there's zero layout jitter.
       Cards spawn from inside the gap between word edges.
       ════════════════════════════════════════════════════ */
    function renderPhase1(p: number) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cx = vw / 2;
      const cy = vh / 2;

      const p1 = norm(p, 0, P1_END);
      const e1 = eio(p1);

      // ── Font size: big → small ──────────────────────────────────
      const maxFs = vw * 0.13;
      const minFs = vw * 0.054;
      const fontSize = lerp(maxFs, minFs, e1);

      // Apply font size without touching position
      wL.style.fontSize = `${fontSize}px`;
      wR.style.fontSize = `${fontSize}px`;

      // ── Word position via transform only — STABLE, no jitter ──
      // Both words share left:50% (= cx) as their CSS anchor point.
      // At e1=0:  "Origin" right-edge touches cx, "Objects" left-edge touches cx
      //           → they meet at the centre of the viewport, perfectly centred.
      // At e1=1:  each word has been pushed outward by wordPush, reaching the edges.
      const wordPush = e1 * vw * 0.30;

      const wLW = wL.offsetWidth;   // current rendered width (shrinks with fontSize)
      const wRW = wR.offsetWidth;

      // Left word: anchor is left:50% = cx (left edge of element at cx by default).
      // We want its RIGHT edge at (cx - wordPush).
      // So left edge should be at (cx - wordPush - wLW), i.e. translateX = (-wordPush - wLW).
      const txL = -wordPush - wLW;

      // Right word: anchor is left:50% = cx.
      // We want its LEFT edge at (cx + wordPush).
      // Left edge is already at cx (transform origin), so translateX = +wordPush.
      const txR = wordPush;

      wL.style.transform = `translate(${txL}px, -50%)`;
      wR.style.transform = `translate(${txR}px, -50%)`;

      // ── Inline cards ────────────────────────────────────────────
      const CARD_W = clamp(vw * 0.115, 100, 150);
      const CARD_H = CARD_W * 1.52;
      const GAP = vw * 0.011;

      const totalW = N * CARD_W + (N - 1) * GAP;
      const spreadLeft = cx - totalW / 2; // leftmost card's left edge in spread

      // At e1=1 the gap between words is:
      // left word right-edge = cx - wordPush(at max) = cx - 0.30*vw
      // right word left-edge = cx + wordPush(at max) = cx + 0.30*vw
      // gap = 0.60*vw
      // Cards spread within that gap (spreadLeft to spreadLeft+totalW)

      // Gather: all 4 cards converge to centre of viewport
      const gatherT = eio(norm(p, GATHER_START, GATHER_END));

      // Stagger windows within p1
      const slideWins: [number, number][] = [
        [0.10, 0.38],
        [0.26, 0.54],
        [0.42, 0.70],
        [0.58, 0.86],
      ];


      iCards.forEach((card, i) => {
        card.style.width = `${CARD_W}px`;
        card.style.height = `${CARD_H}px`;

        const slideT = eio(norm(p1, slideWins[i][0], slideWins[i][1]));

        // Spread: card i centre in absolute viewport coords
        const spreadAbsCX = spreadLeft + i * (CARD_W + GAP) + CARD_W / 2;

        // Gather: all cards converge to viewport centre with tiny stack offsets
        const gatherAbsCX = cx + (i - 1.5) * 5;

        // Interpolate spread ↔ gather
        const targetAbsCX = lerp(spreadAbsCX, gatherAbsCX, gatherT);

        // CSS anchor is left:50% = cx, so translateX = targetAbsCX - cx
        // At slideT=0 card sits at cx (hidden, opacity 0); slides to targetAbsCX
        const txCard = lerp(0, targetAbsCX - cx, slideT);

        // Vertical: CSS top:50% = cy, so -CARD_H/2 centres the card
        const cardRestTY = -CARD_H / 2;
        const deckTY = cardRestTY + deckRestY(i);
        const curTY = lerp(cardRestTY, deckTY, gatherT);

        const gatherScale = lerp(1, deckRestScale(i), gatherT);
        const radius = Math.round(lerp(12, 18, gatherT));

        card.style.transform = `translate(${txCard}px, ${curTY}px) scale(${gatherScale})`;
        card.style.opacity = String(slideT);
        card.style.zIndex = String(10 - i);
        card.style.borderRadius = `${radius}px`;
      });
    }

    /* ════════════════════════════════════════════════════
       CROSSFADE — strict sequential
       ════════════════════════════════════════════════════ */
    function renderCrossfade(p: number) {
      const fadeOut = eio(norm(p, GATHER_START, GATHER_END));
      const fadeIn = eio(norm(p, P2_FADE_START, P2_FADE_END));

      splitStage.style.opacity = String(1 - fadeOut);
      splitStage.style.pointerEvents = fadeOut < 0.95 ? "auto" : "none";

      cardsStage.style.opacity = String(fadeIn);
      cardsStage.style.pointerEvents = fadeIn > 0.05 ? "auto" : "none";
    }

    /* ════════════════════════════════════════════════════
       PHASE 2 — Card cycling with smooth arc-behind exit
       ════════════════════════════════════════════════════ */
    function renderPhase2(p: number) {
      if (p < P2_FADE_START) {
        dCards.forEach((c, i) => {
          c.style.transform = `translateY(${deckRestY(i)}px) scale(${deckRestScale(i)})`;
          c.style.opacity = "1";
          c.style.zIndex = String(10 - i);
        });
        return;
      }

      const p2 = norm(p, P2_CARDS_START, 1.0);
      const LEAD = 0.025;
      const adj = Math.max(0, (p2 - LEAD) / (1 - LEAD)) * N;
      const cur = Math.floor(clamp(adj, 0, N - 0.0001));
      const frac = adj - cur;

      if (counterRef.current) {
        counterRef.current.textContent = `${cur + 1}/${N}`;
      }

      // Description crossfade
      if (cur !== prevCardIdx) {
        descTexts.forEach((span, i) => {
          if (i === cur) {
            gsap.to(span, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
          } else {
            gsap.to(span, {
              opacity: 0,
              y: i < cur ? -14 : 14,
              duration: 0.45,
              ease: "power2.in",
            });
          }
        });
        prevCardIdx = cur;
      }

      dCards.forEach((card, i) => {
        const divEl = card.querySelector(`.${styles.cardDivider}`) as HTMLElement | null;

        let ty: number, sc: number, op: number, zi: number;

        if (i < cur) {
          // ── Dismissed — resting behind the deck ──────────────
          // After arcing up and over, card lands at back of stack.
          // Use a fixed back-of-stack position so it doesn't jump.
          ty = deckRestY(N - 1);
          sc = deckRestScale(N - 1);
          op = 1;
          zi = 1;
          if (divEl) divEl.style.opacity = "0";

        } else if (i === cur) {
          // ── ACTIVE CARD ──────────────────────────────────────
          // frac 0.00→0.40  Entry: lifts up from stack
          // frac 0.40→0.60  Hold: stays at lifted position
          // frac 0.60→0.80  Rise: goes up above deck (z stays high)
          // frac 0.80→1.00  Arc behind: descends with z flipped low

          const isLast = i === N - 1;
          const baseY = deckRestY(0);
          const LIFT = 80;

          // Smooth continuous curve rather than hard branches:
          // We compute the full path as a single interpolation chain.

          const entryT = eio(norm(frac, 0.00, 0.42));  // lift phase
          const riseT = eio(norm(frac, 0.58, 0.80));  // rise above deck
          const dropT = eio(norm(frac, 0.80, 1.00));  // drop behind

          const liftedY = baseY - LIFT;
          const peakY = baseY - LIFT - 280;          // well above deck
          const backY = deckRestY(N - 1);            // rest at back

          if (!isLast && dropT > 0) {
            // Descending behind — z flips to back
            ty = lerp(peakY, backY, dropT);
            sc = lerp(0.84, deckRestScale(N - 1), dropT);
            op = 1;
            zi = 2;
            if (divEl) divEl.style.opacity = "0";

          } else if (!isLast && riseT > 0) {
            // Rising above deck — still in front
            ty = lerp(liftedY, peakY, riseT);
            sc = lerp(1.04, 0.84, riseT);
            op = 1;
            zi = 30;
            if (divEl) divEl.style.opacity = String(1 - riseT);

          } else {
            // Entry lift (or last card hold)
            ty = lerp(baseY, liftedY, entryT);
            sc = lerp(deckRestScale(0), 1.04, entryT);
            op = 1;
            zi = 30;
            if (divEl) divEl.style.opacity = String(entryT * 0.9);
          }

        } else {
          // ── Waiting in stack ────────────────────────────────
          const stackPos = i - cur;
          // Compress forward gently as current card exits (frac > 0.55)
          const compT = eio(norm(frac, 0.52, 1.00));
          ty = lerp(deckRestY(stackPos), deckRestY(Math.max(0, stackPos - 1)), compT);
          sc = lerp(deckRestScale(stackPos), deckRestScale(Math.max(0, stackPos - 1)), compT);
          op = 1;
          zi = 15 - stackPos;
          if (divEl) divEl.style.opacity = "0";
        }

        card.style.transform = `translateY(${ty}px) scale(${sc})`;
        card.style.opacity = String(op);
        card.style.zIndex = String(zi);
      });
    }

    return () => {
      window.removeEventListener("resize", onResize);
      st.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.wrapper}>
      <div ref={pinContainerRef} className={styles.pinContainer}>

        {/* ── Phase 1 ── */}
        <div ref={splitStageRef} className={styles.splitStage}>
          <span ref={wLRef} className={styles.word}>Origin</span>

          {[0, 1, 2, 3].map((i) => (
            <div
              key={`ic-${i}`}
              ref={(el) => { iCardRefs.current[i] = el; }}
              className={styles.inlineCard}
            >
              <img src={PILL_IMAGES[i]} alt={`Object preview ${i + 1}`} draggable={false} />
            </div>
          ))}

          <span ref={wRRef} className={styles.word}>Objects</span>
        </div>

        {/* ── Phase 2 ── */}
        <div ref={cardsStageRef} className={styles.cardsStage}>

          <div className={styles.sideLeft}>
            <p className={styles.cardDesc}>
              {CARD_DESCS.map((desc, i) => (
                <span
                  key={i}
                  ref={(el) => { descTextsRef.current[i] = el; }}
                  className={styles.descText}
                  style={{
                    opacity: i === 0 ? 1 : 0,
                    transform: i === 0 ? "translateY(0)" : "translateY(14px)",
                  }}
                >
                  {desc}
                </span>
              ))}
            </p>
          </div>

          <div className={styles.stackWrap}>
            {[...TITLES].reverse().map((title, renderIdx) => {
              const di = N - 1 - renderIdx;
              return (
                <div
                  key={title}
                  ref={(el) => { dCardRefs.current[di] = el; }}
                  className={styles.card}
                  data-index={di}
                  style={{
                    transform: `translateY(${deckRestY(di)}px) scale(${deckRestScale(di)})`,
                    zIndex: N - di,
                  }}
                >
                  <img src={CARD_IMAGES[di]} alt={title} draggable={false} />
                  <div className={styles.cardDivider}>
                    <div className={styles.dividerLine} />
                    <span className={styles.dividerLabel}>{TITLES[di]}</span>
                    <div className={styles.dividerLine} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.sideRight}>
            <span ref={counterRef} className={styles.counter}>1/{N}</span>
          </div>

        </div>
      </div>
    </section>
  );
}