"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./OriginObjectsSection.module.css";

gsap.registerPlugin(ScrollTrigger);

/* ── Constants ────────────────────────────────────────────────── */
const PHASE1 = 0.38;    // Phase 1 occupies first 38% of scroll
const N = 4;             // Number of cards

const TITLES = [
  "(I) Material Palette",
  "(II) Spatial Composition",
  "(III) Light & Shadow",
  "(IV) Tactile Harmony",
];

const CARD_DESC =
  "Once envisioned, each space evolves from its foundation — blending form, function, and narrative to create an enduring environment.";

/* ── Pill images — using the available scroll.jpeg for now ──── */
const PILL_IMAGES = [
  "/design7.jpeg",
  "/design4.jpeg",
  "/design2.jpeg",
  "/design5.jpeg",
];

export default function OriginObjectsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Phase 1 refs
  const splitStageRef = useRef<HTMLDivElement>(null);
  const wordOriginRef = useRef<HTMLSpanElement>(null);
  const wordObjectsRef = useRef<HTMLSpanElement>(null);
  const pillsWrapRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Phase 2 refs
  const cardsStageRef = useRef<HTMLDivElement>(null);
  const cardNameRef = useRef<HTMLParagraphElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const splitStage = splitStageRef.current;
    const cardsStage = cardsStageRef.current;
    if (!section || !splitStage || !cardsStage) return;

    const pills = pillRefs.current.filter(Boolean) as HTMLDivElement[];
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

    /* ── ScrollTrigger — pins nothing, just tracks progress ──── */
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.4,           // 1.4s lag — buttery smooth
      onUpdate: (self) => {
        const p = self.progress;
        updatePhase1(p);
        crossfade(p);
        updatePhase2(p);
      },
      onToggle: (self) => {
        // Show/hide the fixed stages based on whether section is in view
        if (self.isActive) {
          splitStage.style.display = "flex";
          cardsStage.style.display = "flex";
        } else {
          splitStage.style.display = "none";
          cardsStage.style.display = "none";
        }
      },
    });

    /* ════════════════════════════════════════════════════════════
       PHASE 1 — Words split apart, pills rise in
       ════════════════════════════════════════════════════════════ */
    function updatePhase1(p: number) {
      const p1 = gsap.utils.clamp(0, 1, p / PHASE1);
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
      // Phase 1 fades out between 38%–45% of total scroll
      const fade1 = 1 - gsap.utils.clamp(0, 1, (p - 0.38) / 0.07);
      // Phase 2 fades in over the same window
      const fade2 = gsap.utils.clamp(0, 1, (p - 0.38) / 0.07);

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
      if (p <= PHASE1) return;

      // Normalize p2 to 0→1 across phase 2's scroll range
      const p2 = gsap.utils.clamp(0, 1, (p - PHASE1) / (1 - PHASE1));
      const slot = p2 * N;
      const cur = Math.floor(gsap.utils.clamp(0, N - 0.001, slot));
      const frac = slot - cur; // 0→1 within this card's slice

      // Update text
      if (cardNameRef.current) {
        cardNameRef.current.textContent = TITLES[cur];
      }
      if (counterRef.current) {
        counterRef.current.textContent = `${cur + 1}/${N}`;
      }

      cards.forEach((card, i) => {
        const restY = -i * 12;
        const restS = 1 - i * 0.04;

        if (i < cur) {
          // Already gone — hidden above
          gsap.set(card, { y: -420, scale: 0.9, opacity: 0, zIndex: 1 });
        } else if (i === cur) {
          // Active card — lifts from stack then exits upward
          const entryT = gsap.utils.clamp(0, 1, frac / 0.4);
          const exitT = gsap.utils.clamp(0, 1, (frac - 0.6) / 0.4);
          const eEntry = gsap.parseEase("power2.inOut")(entryT);
          const eExit = gsap.parseEase("power2.inOut")(exitT);

          if (exitT > 0) {
            gsap.set(card, {
              y: gsap.utils.interpolate(restY - 72, -400, eExit),
              scale: gsap.utils.interpolate(1.05, 0.92, eExit),
              opacity: 1 - eExit,
              zIndex: N + 10,
            });
          } else {
            gsap.set(card, {
              y: gsap.utils.interpolate(restY, restY - 72, eEntry),
              scale: gsap.utils.interpolate(restS, 1.05, eEntry),
              opacity: 1,
              zIndex: N + 10,
            });
          }
        } else {
          // Waiting in stack — compress forward as current card exits
          const stackPos = i - cur;
          const shiftT = gsap.utils.clamp(0, 1, frac / 0.5);
          const eShift = gsap.parseEase("power2.inOut")(shiftT);

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

      {/* ── Phase 1: Split text + pill reveal ── */}
      <div
        ref={splitStageRef}
        className={styles.splitStage}
        style={{ display: "none" }}
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
        style={{ display: "none" }}
      >
        <div className={styles.sideLeft}>
          <p ref={cardNameRef} className={styles.cardName}>
            {TITLES[0]}
          </p>
          <p className={styles.cardDesc}>{CARD_DESC}</p>
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
                <img src="/design4.jpeg" alt={title} draggable={false} />
                <span className={styles.cardLabel}>{title}</span>
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
    </section>
  );
}
