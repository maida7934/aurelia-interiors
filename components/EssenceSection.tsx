"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./EssenceSection.module.css";

gsap.registerPlugin(ScrollTrigger);

/* ── Fixed random offsets per character ───────────────────────────
   Pre-defined so the scatter looks organic but doesn't change
   between re-renders. Each entry: [xOffset, yOffset, rotation, scale] */
const CHAR_SCATTER: [number, number, number, number][] = [
  [-60,  80,  -14, 0.7],   // E
  [ 45, -65,   18, 0.6],   // S
  [-35,  50,  -10, 0.75],  // S
  [ 70, -40,   12, 0.65],  // E
  [-50,  70,  -16, 0.7],   // N
  [ 40, -55,    8, 0.6],   // C
  [-30,  45,   20, 0.75],  // E
];

const ESSENCE_CHARS = "ESSENCE".split("");

export default function EssenceSection() {
  const wrapperRef      = useRef<HTMLDivElement>(null);
  const creamCurtainRef = useRef<HTMLDivElement>(null);
  const sceneRef        = useRef<HTMLDivElement>(null);
  const charRefs        = useRef<(HTMLSpanElement | null)[]>([]);
  const line1Ref        = useRef<HTMLParagraphElement>(null);
  const line2Ref        = useRef<HTMLParagraphElement>(null);
  const line3Ref        = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const chars = charRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (chars.length === 0) return;

    const ctx = gsap.context(() => {

      /* ============================================================
         PHASE 1 — Character assembly (ESSENCE heading spawns first)
         ============================================================
         Trigger: the wrapper element.
           start: wrapper top enters viewport from below
           end:   wrapper top reaches 30% from viewport top

         The characters assemble over this full range. The cream
         curtain does NOT become fully opaque until the characters
         have finished — it starts fading in at 40% of the timeline
         and reaches full opacity at 100%.
         ============================================================ */

      // ── Set initial scattered state ────────────────────────────
      chars.forEach((char, i) => {
        const [x, y, rot, sc] = CHAR_SCATTER[i];
        gsap.set(char, {
          x,
          y,
          rotation: rot,
          scale: sc,
          opacity: 0,
        });
      });

      // ── Main timeline: characters first, then curtain catches up ──
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top bottom",       // section enters from below
          end: "top 10%",            // much longer scroll range (90vh)
          scrub: 2.5,                // smoother, more controlled scrub
        },
      });

      // ── Characters assemble first (0 → 0.55 of timeline) ──────
      tl.to(
        chars,
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          ease: "power3.out",
          stagger: 0.06,
          duration: 0.55,
        },
        0
      );

      // ── Cream curtain: starts fading in early but only hits
      //    full opacity AFTER characters have fully assembled ─────
      //    Starts at 0.1, ends at 0.75 → gives it a long, gentle fade
      //    that finishes well after the last character lands.
      tl.fromTo(
        creamCurtainRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "power2.inOut",
          duration: 0.45,       // shorter duration starting later = finishes after chars
        },
        0.35                    // delayed start — chars are mostly assembled by now
      );

      /* ============================================================
         PHASE 2 — Content lines slide up with smooth clip-path reveal
         ============================================================
         Each line slides up from below with opacity + translateY,
         staggered for a cascading, cinematic feel.
         ============================================================ */
      const contentTl = gsap.timeline({
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "top 45%",       // delays the start so it happens after ESSENCE finishes building (at 50%)
          end: "top -40%",        // stretches the animation duration so it happens while the text is fully visible
          scrub: 2,
        },
      });

      // Helper to animate words inside a line container
      const animateWords = (container: HTMLElement | null, startTime: number) => {
        if (!container) return;
        const words = container.querySelectorAll(`.${styles.word}`);
        contentTl.fromTo(
          words,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, ease: "power2.out", stagger: 0.04, duration: 0.6 },
          startTime
        );
      };

      animateWords(line1Ref.current, 0.08);
      animateWords(line2Ref.current, 0.22);
      animateWords(line3Ref.current, 0.38);
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>

      {/* ── Cream curtain — fades over the entire hero ──────────── */}
      <div
        ref={creamCurtainRef}
        className={styles.creamCurtain}
        aria-hidden="true"
      />

      {/* ── Scene — transparent, text floats over the curtain ───── */}
      <div ref={sceneRef} className={styles.scene}>

        {/* ── ESSENCE — each character is a separate span ────── */}
        <h2 className={styles.essenceHeading} aria-label="Essence">
          {ESSENCE_CHARS.map((char, i) => (
            <span
              key={i}
              ref={(el) => { charRefs.current[i] = el; }}
              className={styles.essenceChar}
              aria-hidden="true"
            >
              {char}
            </span>
          ))}
        </h2>

        <p ref={line1Ref} className={`${styles.quoteLine} ${styles.line1}`}>
          {"Spaces are not filled first and refined later.".split(" ").map((word, i) => (
            <span key={i} className={styles.word}>{word}&nbsp;</span>
          ))}
        </p>

        <p ref={line2Ref} className={`${styles.quoteLine} ${styles.line2}`}>
          {"They are shaped through light, form, and intention. Every element belongs within the space it creates.".split(" ").map((word, i) => (
            <span key={i} className={styles.word}>{word}&nbsp;</span>
          ))}
        </p>

        <p ref={line3Ref} className={`${styles.quoteLine} ${styles.line3}`}>
          {"Once complete, the space begins to live on its own.".split(" ").map((word, i) => (
            <span key={i} className={styles.word}>{word}&nbsp;</span>
          ))}
        </p>

      </div>
    </div>
  );
}
