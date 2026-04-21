"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./OriginObjectsSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const PHASE1_END = 0.30;     // Phase 1 animation completes
const CROSSFADE_START = 0.40; // Hold until here, then crossfade starts
const CROSSFADE_END = 0.48;   // Crossfade completes
const PHASE2_START = 0.50;    // Phase 2 animation starts moving
const N = 4;                  // Number of cards

const TITLES = [
  "(I) Material Palette",
  "(II) Spatial Composition",
  "(III) Light & Shadow",
  "(IV) Tactile Harmony",
];

/* ── Per-card descriptions shown in the left panel ──────────── */
const CARD_DESCS = [
  "Every material carries a story — from hand-selected marble veins to the grain of aged oak. Our palette begins where nature ends, curating textures that speak of permanence and poetry.",
  "Space is not merely occupied; it is composed. Each room is orchestrated like a symphony — proportion, rhythm, and negative space converging to create harmony that resonates.",
  "Light sculpts what architecture frames. We design for the sun's migration, crafting interiors where shadows become features and golden hours become daily rituals.",
  "The final measure of a space is how it feels beneath your fingertips. Every surface, every edge, every threshold is calibrated for an encounter that lingers in memory.",
];

/* ── Card Images ────────────────────────────────────────────── */
const CARD_IMAGES = [
  "/design6.jpeg",
  "/design1.jpeg",
  "/hero.jpeg",
  "/design5.jpeg",
];

/* ── Pill images — using the available scroll.jpeg for now ──── */
const PILL_IMAGES = [
  "/design7.jpeg",
  "/design4.jpeg",
  "/design2.jpeg",
  "/design5.jpeg",
];

export default function OriginObjectsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);

  // Phase 1 refs
  const splitStageRef = useRef<HTMLDivElement>(null);
  const wordOriginRef = useRef<HTMLSpanElement>(null);
  const wordObjectsRef = useRef<HTMLSpanElement>(null);
  const pillsWrapRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Phase 2 refs
  const cardsStageRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descRef = useRef<HTMLParagraphElement>(null);
  const descTextsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const splitStage = splitStageRef.current;
    const cardsStage = cardsStageRef.current;
    const pinContainer = pinContainerRef.current;
    if (!section || !splitStage || !cardsStage || !pinContainer) return;

    const pills = pillRefs.current.filter(Boolean) as HTMLDivElement[];
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    const descTexts = descTextsRef.current.filter(Boolean) as HTMLSpanElement[];

    let prevCardIdx = 0;

    /* ── ScrollTrigger — pins the container and scrubs ──── */
    const st = ScrollTrigger.create({
      trigger: pinContainer,
      start: "top top",
      end: "+=800%",        // 800vh of pinning scroll (doubled for slower pace)
      pin: true,
      scrub: 1.4,           // 1.4s lag — buttery smooth
      onUpdate: (self) => {
        const p = self.progress;
        updatePhase1(p);
        crossfade(p);
        updatePhase2(p);
      },
    });

    /* ════════════════════════════════════════════════════════════
       PHASE 1 — Words split apart, pills rise in
       ════════════════════════════════════════════════════════════ */
    function updatePhase1(p: number) {
      const p1 = gsap.utils.clamp(0, 1, p / PHASE1_END);
      const e1 = gsap.parseEase("power2.inOut")(p1);

      // Words spread apart
      if (wordOriginRef.current) {
        gsap.set(wordOriginRef.current, { x: -e1 * 140 });
      }
      if (wordObjectsRef.current) {
        gsap.set(wordObjectsRef.current, { x: e1 * 140 });
      }

      // Gap opens to fit all 4 pills: 4×54 + 3×7 = 237px
      const FULL_W = 4 * 54 + 3 * 7;
      if (pillsWrapRef.current) {
        gsap.set(pillsWrapRef.current, { width: e1 * FULL_W });
      }

      // Pills rise in one by one — staggered entrance
      pills.forEach((pill, i) => {
        const start = 0.25 + i * 0.15;
        const t = gsap.utils.clamp(0, 1, (p1 - start) / (1 - start));
        const te = gsap.parseEase("power2.inOut")(t);
        gsap.set(pill, { y: (1 - te) * 36, opacity: te });
      });
    }

    /* ════════════════════════════════════════════════════════════
       CROSSFADE — Phase 1 fades out, Phase 2 fades in
       ════════════════════════════════════════════════════════════ */
    function crossfade(p: number) {
      const progress = gsap.utils.clamp(0, 1, (p - CROSSFADE_START) / (CROSSFADE_END - CROSSFADE_START));
      const fade1 = 1 - progress;
      const fade2 = progress;

      gsap.set(splitStage, {
        opacity: fade1,
        pointerEvents: fade1 > 0.1 ? "auto" : "none",
      });
      gsap.set(cardsStage, {
        opacity: fade2,
        pointerEvents: fade2 > 0.1 ? "auto" : "none",
      });
    }

    /* ════════════════════════════════════════════════════════════
       PHASE 2 — Card stack lift/hold/exit
       ════════════════════════════════════════════════════════════ */
    function updatePhase2(p: number) {
      if (p <= CROSSFADE_START) return;

      // Normalize p2 to 0→1 across phase 2's scroll range
      const p2 = gsap.utils.clamp(0, 1, (p - PHASE2_START) / (1 - PHASE2_START));
      const slot = p2 * N;
      const cur = Math.floor(gsap.utils.clamp(0, N - 0.001, slot));
      const frac = slot - cur; // 0→1 within this card's slice

      // Update counter
      if (counterRef.current) {
        counterRef.current.textContent = `${cur + 1}/${N}`;
      }

      // Update description text — crossfade between paragraphs
      if (cur !== prevCardIdx || p2 < 0.01) {
        descTexts.forEach((span, i) => {
          if (i === cur) {
            gsap.to(span, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
          } else {
            gsap.to(span, { opacity: 0, y: i < cur ? -12 : 12, duration: 0.3, ease: "power2.in" });
          }
        });
        prevCardIdx = cur;
      }

      cards.forEach((card, i) => {
        const restY = -i * 12;
        const restS = 1 - i * 0.04;

        // Get the line divider element for this card
        const dividerEl = card.querySelector(`.${styles.cardDivider}`) as HTMLElement | null;

        if (i < cur) {
          // Already gone — hidden above
          gsap.set(card, { y: -420, scale: 0.9, opacity: 0, zIndex: 1 });
          if (dividerEl) gsap.set(dividerEl, { opacity: 0 });
        } else if (i === cur) {
          // Active card — lifts from stack then exits upward
          // EXCEPT the last card: it stays in place so the page scrolls naturally
          const isLastCard = i === N - 1;
          const entryT = gsap.utils.clamp(0, 1, frac / 0.4);
          const eEntry = gsap.parseEase("power2.inOut")(entryT);

          // Show line divider on active card
          if (dividerEl) {
            gsap.set(dividerEl, { opacity: eEntry, scaleX: eEntry });
          }

          if (isLastCard) {
            // Last card — lift from stack then hold in place (no exit)
            gsap.set(card, {
              y: gsap.utils.interpolate(restY, restY - 72, eEntry),
              scale: gsap.utils.interpolate(restS, 1.05, eEntry),
              opacity: 1,
              zIndex: N + 10,
            });
          } else {
            const exitT = gsap.utils.clamp(0, 1, (frac - 0.6) / 0.4);
            const eExit = gsap.parseEase("power2.inOut")(exitT);

            if (exitT > 0) {
              gsap.set(card, {
                y: gsap.utils.interpolate(restY - 72, -400, eExit),
                scale: gsap.utils.interpolate(1.05, 0.92, eExit),
                opacity: 1 - eExit,
                zIndex: N + 10,
              });
              if (dividerEl) gsap.set(dividerEl, { opacity: 1 - eExit });
            } else {
              gsap.set(card, {
                y: gsap.utils.interpolate(restY, restY - 72, eEntry),
                scale: gsap.utils.interpolate(restS, 1.05, eEntry),
                opacity: 1,
                zIndex: N + 10,
              });
            }
          }
        } else {
          // Waiting in stack — compress forward as current card exits
          const stackPos = i - cur;
          const shiftT = gsap.utils.clamp(0, 1, frac / 0.5);
          const eShift = gsap.parseEase("power2.inOut")(shiftT);

          // Hide divider on non-active cards
          if (dividerEl) gsap.set(dividerEl, { opacity: 0 });

          gsap.set(card, {
            y: gsap.utils.interpolate(
              restY,
              -(stackPos - 1) * 12,
              eShift * (stackPos === 1 ? 1 : 0.5)
            ),
            scale: gsap.utils.interpolate(
              restS,
              1 - (stackPos - 1) * 0.04,
              eShift * (stackPos === 1 ? 1 : 0.4)
            ),
            opacity: 1,
            zIndex: N - stackPos,
          });
        }
      });
    }

    return () => {
      st.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.wrapper}>
      <div ref={pinContainerRef} className={styles.pinContainer}>

        {/* ── Phase 1: Split text + pill reveal ── */}
        <div
          ref={splitStageRef}
          className={styles.splitStage}
        >
        <div className={styles.splitRow}>
          <span ref={wordOriginRef} className={styles.word}>
            Origin
          </span>

          <div ref={pillsWrapRef} className={styles.pillsWrap}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                ref={(el) => {
                  pillRefs.current[i] = el;
                }}
                className={styles.pill}
              >
                <img
                  src={PILL_IMAGES[i]}
                  alt={`Interior detail ${i + 1}`}
                  draggable={false}
                />
              </div>
            ))}
          </div>

          <span ref={wordObjectsRef} className={styles.word}>
            Objects
          </span>
        </div>
      </div>

        {/* ── Phase 2: Card stack with flanking text ── */}
        <div
          ref={cardsStageRef}
          className={styles.cardsStage}
        >
        <div className={styles.sideLeft}>
          <p ref={descRef} className={styles.cardDesc}>
            {CARD_DESCS.map((desc, i) => (
              <span
                key={i}
                ref={(el) => {
                  descTextsRef.current[i] = el;
                }}
                className={styles.descText}
                style={{
                  opacity: i === 0 ? 1 : 0,
                  transform: i === 0 ? 'translateY(0)' : 'translateY(12px)',
                }}
              >
                {desc}
              </span>
            ))}
          </p>
        </div>

        <div className={styles.stackWrap}>
          {/* Cards rendered in reverse order so last is visually on top */}
          {[...TITLES].reverse().map((title, renderIdx) => {
            // renderIdx 0 = data-index 3, renderIdx 1 = data-index 2, etc.
            const dataIdx = N - 1 - renderIdx;
            return (
              <div
                key={title}
                ref={(el) => {
                  cardRefs.current[dataIdx] = el;
                }}
                className={styles.card}
                data-index={dataIdx}
                style={{
                  transform: `translateY(${-dataIdx * 12}px) scale(${1 - dataIdx * 0.04})`,
                  zIndex: N - dataIdx,
                }}
              >
                <img src={CARD_IMAGES[dataIdx]} alt={title} draggable={false} />
                {/* ── Line divider across middle of card ── */}
                <div className={styles.cardDivider}>
                  <div className={styles.dividerLine} />
                  <span className={styles.dividerLabel}>{TITLES[dataIdx]}</span>
                  <div className={styles.dividerLine} />
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.sideRight}>
          <span ref={counterRef} className={styles.counter}>
            1/{N}
          </span>
          </div>
        </div>
      </div>
    </section>
  );
}
