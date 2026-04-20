"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ScrollShowcase.module.css";

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
}

const SATELLITES: SatelliteConfig[] = [
  { id: "left1",        className: "left1",        tx: -120, ty: -40,  speed: 1.0  },
  { id: "left2",        className: "left2",        tx: -130, ty: -10,  speed: 0.9  },
  { id: "smallTR",      className: "smallTR",      tx:  100, ty: -80,  speed: 1.2  },
  { id: "right1",       className: "right1",       tx:  120, ty: -30,  speed: 1.0  },
  { id: "right2",       className: "right2",       tx:  130, ty:  40,  speed: 0.9  },
  { id: "bottomCenter", className: "bottomCenter", tx:    0, ty: 120,  speed: 1.0  },
];

export default function ScrollShowcase() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const designTextRef = useRef<HTMLDivElement>(null);
  const satelliteRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ============================================================
         Master timeline — pinned, scroll-scrubbed
         ============================================================
         The canvas is pinned at viewport top.
         Total scroll runway = 250vh.
         scrub: 1.5 for smooth, slightly lagged coupling.
         ============================================================ */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "+=250%",
          pin: canvasRef.current,
          scrub: 1.5,
          anticipatePin: 1,
        },
      });

      /* ============================================================
         CENTER CONTAINER — mask expansion (NOT image scaling)
         ============================================================
         The image inside is always full-viewport-sized.
         We expand the CONTAINER from its initial 46%×35%
         to nearly fill the viewport (with 8px margin all sides).
         overflow: hidden on the container = masking.
         
         This creates the "image unfolding/expanding" illusion
         without any scaling distortion.
         ============================================================ */
      tl.to(
        centerRef.current,
        {
          width: "calc(100% - 16px)",
          height: "calc(100% - 16px)",
          borderRadius: "4px",
          ease: "power2.inOut",
          duration: 1,
        },
        0
      );

      /* ============================================================
         SATELLITE IMAGES — push outward as container claims space
         ============================================================
         Each satellite translates in its own direction at its own
         speed, creating parallax depth. They begin moving BEFORE
         the container reaches them, so there's never overlap.
         Fade out during the second half of the scroll.
         ============================================================ */
      SATELLITES.forEach((sat, i) => {
        const el = satelliteRefs.current[i];
        if (!el) return;

        // Push outward
        tl.to(
          el,
          {
            x: `${sat.tx * sat.speed}%`,
            y: `${sat.ty * sat.speed}%`,
            ease: "power1.in",
            duration: 1,
          },
          0
        );

        // Fade out in the second half
        tl.to(
          el,
          {
            opacity: 0,
            ease: "power2.in",
            duration: 0.4,
          },
          0.5
        );
      });

      /* ============================================================
         "DESIGN YOUR SPACE" TEXT — pushes upward and fades away
         ============================================================
         Same parallax treatment as the satellites:
         moves up and away as the center container expands beneath it.
         ============================================================ */
      tl.to(
        designTextRef.current,
        {
          y: "-180%",
          opacity: 0,
          ease: "power1.in",
          duration: 0.7,
        },
        0
      );

      /* ── Center overlay text: fade out early in scroll ──────── */
      tl.to(
        `.${styles.centerOverlay}`,
        {
          opacity: 0,
          ease: "power2.in",
          duration: 0.3,
        },
        0.15
      );

      /* ── Project counter: fade out ─────────────────────────── */
      tl.to(
        `.${styles.projectCounter}`,
        {
          opacity: 0,
          ease: "power2.in",
          duration: 0.3,
        },
        0.2
      );

      /* ── Bottom tagline: fade out ──────────────────────────── */
      tl.to(
        `.${styles.bottomTagline}`,
        {
          opacity: 0,
          y: 40,
          ease: "power2.in",
          duration: 0.3,
        },
        0.3
      );

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
            src="/scroll.jpeg"
            alt="Featured interior — scroll to explore"
            draggable={false}
          />
          <div className={styles.centerOverlay}>
            <span className={styles.centerTitle}>Inner Chamber</span>
            <div className={styles.centerNav}>
              <button className={styles.navArrow} aria-label="Previous project">
                ←
              </button>
              <button className={styles.navArrow} aria-label="Next project">
                →
              </button>
            </div>
          </div>
          <span className={styles.projectCounter}>27</span>
        </div>

        {/* ── "Design your space" text ────────────────────────── */}
        <div ref={designTextRef} className={styles.designText}>
          Design your space
        </div>

        {/* ── Satellite images ───────────────────────────────── */}
        {SATELLITES.map((sat, i) => (
          <div
            key={sat.id}
            ref={(el) => { satelliteRefs.current[i] = el; }}
            className={`${styles.imgCard} ${styles[sat.className]}`}
          >
            <img
              src="/scroll.jpeg"
              alt={`Interior showcase ${i + 1}`}
              draggable={false}
            />
          </div>
        ))}

        {/* ── Bottom tagline ─────────────────────────────────── */}
        <span className={styles.bottomTagline}>Imagine Possible</span>
      </div>
    </div>
  );
}
