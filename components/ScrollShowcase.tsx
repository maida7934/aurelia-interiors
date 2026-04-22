"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ScrollShowcase.module.css";
import { triggerPageTransition } from "./PageTransition";

gsap.registerPlugin(ScrollTrigger);

/* ── Satellite image config ─────────────────────────────────────
   Each entry: cssClass, movement direction & parallax speed.
   tx/ty = percentage-based translate targets.
   ─────────────────────────────────────────────────────────────── */
interface SatelliteConfig {
  id: string;
  className: string;
  tx: number;
  ty: number;
  speed: number;
  src: string;
}

const SATELLITES: SatelliteConfig[] = [
  { id: "left1", className: "left1", tx: -120, ty: -40, speed: 1.0, src: "/design2.jpeg" },
  { id: "left2", className: "left2", tx: -130, ty: -10, speed: 0.9, src: "/design3.jpeg" },
  { id: "smallTR", className: "smallTR", tx: 100, ty: -80, speed: 1.2, src: "/design4.jpeg" },
  { id: "right1", className: "right1", tx: 120, ty: -30, speed: 1.0, src: "/design5.jpeg" },
  { id: "right2", className: "right2", tx: 130, ty: 40, speed: 0.9, src: "/design6.jpeg" },
  { id: "bottomCenter", className: "bottomCenter", tx: 0, ty: 120, speed: 1.0, src: "/design7.jpeg" },
];

export default function ScrollShowcase() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const designTextRef = useRef<HTMLDivElement>(null);
  const creamBottomRef = useRef<HTMLDivElement>(null);
  const darkBgRef = useRef<HTMLDivElement>(null);
  const satelliteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ladderRef = useRef<HTMLDivElement>(null);
  const ladderWordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ============================================================
         Master timeline — pinned, scroll-scrubbed
         ============================================================
         Two-phase animation:
           Phase 1 (0 → 0.45): Container EXPANDS to fill viewport
           Phase 2 (0.55 → 1.0): Container SHRINKS into an arch doorway
         
         Scroll runway = 400vh for both phases.
         ============================================================ */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "+=400%",
          pin: canvasRef.current,
          scrub: 1.5,
          anticipatePin: 1,
        },
      });

      /* ============================================================
         PHASE 1 — Container mask expansion (0 → 0.45)
         ============================================================
         The container grows from 46%×35% → nearly fullscreen.
         The image inside is already full-viewport-sized,
         so expanding the container simply reveals more of it.
         ============================================================ */
      tl.to(
        centerRef.current,
        {
          width: "calc(100% - 48px)",
          height: "calc(100% - 48px)",
          borderRadius: "4px",
          ease: "power2.inOut",
          duration: 0.45,
        },
        0
      );

      /* ── Satellite images: push outward during Phase 1 ──────── */
      SATELLITES.forEach((sat, i) => {
        const el = satelliteRefs.current[i];
        if (!el) return;

        tl.to(
          el,
          {
            x: `${sat.tx * sat.speed}%`,
            y: `${sat.ty * sat.speed}%`,
            ease: "power1.in",
            duration: 0.45,
          },
          0
        );

        tl.to(
          el,
          {
            opacity: 0,
            ease: "power2.in",
            duration: 0.2,
          },
          0.25
        );
      });

      /* ── "Design your space" text: push up and away ─────────── */
      tl.to(
        designTextRef.current,
        {
          y: "-180%",
          opacity: 0,
          ease: "power1.in",
          duration: 0.35,
        },
        0
      );

      /* ── Center overlay text: fade out early ───────────────── */
      tl.to(
        `.${styles.centerOverlay}`,
        {
          opacity: 0,
          ease: "power2.in",
          duration: 0.15,
        },
        0.08
      );

      /* ── Project counter: fade out ─────────────────────────── */
      tl.to(
        `.${styles.projectCounter}`,
        {
          opacity: 0,
          ease: "power2.in",
          duration: 0.15,
        },
        0.1
      );

      /* ── Bottom tagline: fade out ──────────────────────────── */
      tl.to(
        `.${styles.bottomTagline}`,
        {
          opacity: 0,
          y: 40,
          ease: "power2.in",
          duration: 0.15,
        },
        0.15
      );

      /* ============================================================
         PHASE 2 — Arch morph + co-motion slide (0.55 → 1.0)
         ============================================================
         The dark background and arch move TOGETHER at the same speed.
         
         Layout (z-order):
           Layer          | Z  | Role
           ───────────────┼────┼──────────────────────────────
           Cream panel    | 4  | Revealed below as both slide up
           Dark background| 5  | 71% tall, arch sits on its bottom edge
           Arch (center)  | 10 | Morphs into arch, rests ON the dark bg
         
         Both darkBg and arch translate upward by the same amount,
         so the arch stays glued to the dark bg's bottom edge.
         Cream is revealed in the space they vacate.
         ============================================================ */

      const upwardShift = -(window.innerHeight * 0.20); // 20vh in pixels

      /* ── A. Cream panel: fade in (hidden by darkBg on top) ───────── */
      tl.to(
        creamBottomRef.current,
        {
          opacity: 1,
          ease: "power1.in",
          duration: 0.1,
        },
        0.48
      );

      /* ── B. Dark background: fade in simultaneously ────────────── */
      tl.to(
        darkBgRef.current,
        {
          opacity: 1,
          ease: "power1.in",
          duration: 0.1,
        },
        0.48
      );

      /* ── C. Arch morph + slide up ──────────────────────────────── */
      tl.to(
        centerRef.current,
        {
          width: "18%",
          height: "42%",
          borderRadius: "999px 999px 0 0",
          boxShadow: "0 12px 80px rgba(0, 0, 0, 0.7)",
          y: upwardShift,               // Move up WITH dark bg
          ease: "power2.inOut",
          duration: 0.45,
        },
        0.55
      );

      /* ── D. Dark background: slide up at SAME speed ────────────── */
      tl.to(
        darkBgRef.current,
        {
          y: upwardShift,               // Same shift = same speed
          ease: "power2.inOut",          // Same ease = move in lockstep
          duration: 0.45,
        },
        0.55
      );

      /* ============================================================
         Navbar Color Swap
         ============================================================ */
      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top 20%",
        end: "bottom top",
        onEnter: () => {
          const root = document.documentElement.style;
          root.setProperty("--nav-color", "#f1eade");
          root.setProperty("--nav-color-alt", "#f1eade");
          root.setProperty("--nav-btn-bg", "rgba(255, 255, 255, 0.1)");
          root.setProperty("--nav-btn-border", "rgba(255, 255, 255, 0.2)");
          root.setProperty("--nav-bg", "linear-gradient(to bottom, rgba(20, 17, 14, 0.35) 0%, rgba(20, 17, 14, 0.1) 60%, transparent 100%)");
        },
        onLeaveBack: () => {
          const root = document.documentElement.style;
          root.removeProperty("--nav-color");
          root.removeProperty("--nav-color-alt");
          root.removeProperty("--nav-btn-bg");
          root.removeProperty("--nav-btn-border");
          root.removeProperty("--nav-bg");
        },
        onEnterBack: () => {
          const root = document.documentElement.style;
          root.setProperty("--nav-color", "#f1eade");
          root.setProperty("--nav-color-alt", "#f1eade");
          root.setProperty("--nav-btn-bg", "rgba(255, 255, 255, 0.1)");
          root.setProperty("--nav-btn-border", "rgba(255, 255, 255, 0.2)");
          root.setProperty("--nav-bg", "linear-gradient(to bottom, rgba(20, 17, 14, 0.35) 0%, rgba(20, 17, 14, 0.1) 60%, transparent 100%)");
        },
        onLeave: () => {
          const root = document.documentElement.style;
          root.removeProperty("--nav-color");
          root.removeProperty("--nav-color-alt");
          root.removeProperty("--nav-btn-bg");
          root.removeProperty("--nav-btn-border");
          root.removeProperty("--nav-bg");
        },
      });

      /* ============================================================
         PHASE 3 — Ladder text reveal on the cream panel
         ============================================================
         The "Fully Equipped Design Studio" text appears at the bottom
         of the canvas over the cream panel as the arch slides up.
         Each word staggers in from below.
         ============================================================ */
      const ladderWords = ladderWordRefs.current.filter(Boolean) as HTMLSpanElement[];

      // Start hidden
      ladderWords.forEach((word) => {
        gsap.set(word, { opacity: 0, y: 60 });
      });
      if (ladderRef.current) {
        gsap.set(ladderRef.current, { opacity: 0 });
      }

      // Fade in the container
      tl.to(
        ladderRef.current,
        {
          opacity: 1,
          ease: "power1.in",
          duration: 0.05,
        },
        0.78
      );

      // Stagger-reveal each word
      ladderWords.forEach((word, i) => {
        tl.to(
          word,
          {
            opacity: 1,
            y: 0,
            ease: "power3.out",
            duration: 0.08,
          },
          0.80 + i * 0.04
        );
      });

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div ref={canvasRef} className={styles.canvas}>

        {/* ── Center container (the expanding mask/window) ──────── */}
        <div ref={centerRef} className={styles.centerCard}>
          {/* Image is ALWAYS full-viewport-sized.
              The container's overflow:hidden clips it.
              As the container expands → more image revealed. */}
          <img
            className={styles.centerImage}
            src="/design1.jpeg"
            alt="Featured interior — scroll to explore"
            draggable={false}
          />
          <div className={styles.centerOverlay}>
            <span className={styles.centerTitle}>Inner Chamber</span>
            <div className={styles.centerNav}>
              <button className={styles.navArrow} aria-label="Previous project" onClick={async (e) => {
                e.preventDefault();
                await triggerPageTransition();
                window.scrollTo({ top: 0, behavior: "instant" });
              }}>
                ←
              </button>
              <button className={styles.navArrow} aria-label="Next project" onClick={async (e) => {
                e.preventDefault();
                await triggerPageTransition();
                window.scrollTo({ top: 0, behavior: "instant" });
              }}>
                →
              </button>
            </div>
          </div>
          <span className={styles.projectCounter}>27</span>
        </div>

        {/* ── "Design your space" text ────────────────────────── */}
        <div ref={designTextRef} className={styles.designText}>
          <span className={styles.designWord}>Design</span><br />
          <span className={styles.yourSpaceWord}>your space</span>
        </div>

        {/* ── Satellite images ───────────────────────────────── */}
        {SATELLITES.map((sat, i) => (
          <div
            key={sat.id}
            ref={(el) => { satelliteRefs.current[i] = el; }}
            className={`${styles.imgCard} ${styles[sat.className]}`}
          >
            <img
              src={sat.src}
              alt={`Interior showcase ${i + 1}`}
              draggable={false}
            />
          </div>
        ))}

        {/* ── Bottom tagline ─────────────────────────────────── */}
        <span className={styles.bottomTagline}>Imagine Possible</span>

        {/* ── Dark parallax background — moves UP behind the arch ─ */}
        <div ref={darkBgRef} className={styles.darkBg} aria-hidden="true" />

        {/* ── Cream bottom panel — site bg below arch ────────── */}
        <div ref={creamBottomRef} className={styles.creamBottom} aria-hidden="true" />

        {/* ── Ladder text — "Fully Equipped Design Studio" ──── */}
        <div ref={ladderRef} className={styles.ladderContainer}>
          <span ref={(el) => { ladderWordRefs.current[0] = el; }} className={`${styles.ladderWord} ${styles.word1}`}>
            Fully
          </span>
          <span ref={(el) => { ladderWordRefs.current[1] = el; }} className={`${styles.ladderWord} ${styles.word2}`}>
            Equipped
          </span>
          <span ref={(el) => { ladderWordRefs.current[2] = el; }} className={`${styles.ladderWord} ${styles.word3}`}>
            Design
          </span>
          <span ref={(el) => { ladderWordRefs.current[3] = el; }} className={`${styles.ladderWord} ${styles.word4}`}>
            Studio
          </span>
        </div>
      </div>
    </div>
  );
}
