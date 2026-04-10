"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./HeroSection.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const doorRef = useRef<HTMLDivElement>(null);
  const textLeftRef = useRef<HTMLDivElement>(null);
  const textRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ── Lenis smooth scroll ───────────────────────────────────
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // ── Set initial door dimensions via GSAP (owns the transform) ──
    gsap.set(doorRef.current, {
      xPercent: -50,
      width: "34%",
      height: "60%",
    });

    // ── Scroll-driven timeline with PIN ──────────────────────
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=3000",       // 3000px of scroll for the animation
          scrub: 1.5,
          pin: true,           // hero stays fixed while scrolling
          anticipatePin: 1,
        },
      });

      // Door expands from small → covers entire viewport
      // width goes past 100% so the rounded top corners move off-screen
      tl.to(
        doorRef.current,
        {
          width: "130%",
          height: "130%",
          borderTopLeftRadius: "0px",
          borderTopRightRadius: "0px",
          ease: "power1.inOut",
          duration: 1,
        },
        0
      );

      // Subtle background scale (very gentle parallax depth)
      tl.fromTo(
        bgRef.current,
        { scale: 1 },
        { scale: 1.04, ease: "none", duration: 1 },
        0
      );

      // Text drifts upward as door opens
      tl.to(
        textLeftRef.current,
        { y: -120, ease: "none", duration: 1 },
        0
      );
      tl.to(
        textRightRef.current,
        { y: -120, ease: "none", duration: 1 },
        0
      );
    }, heroRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <section ref={heroRef} className={styles.hero}>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className={styles.navbar}>
        <div className={styles.navBrand}>
          <span className={styles.brandAurelia}>Aurelia</span>
          <span className={styles.brandInteriors}>Interiors</span>
        </div>
        <button className={styles.menuBtn} aria-label="Open navigation menu">
          <span className={styles.menuLines}>
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
          </span>
          <span className={styles.menuLabel}>MENU</span>
        </button>
      </nav>

      {/* LAYER 1 ── Sharp background image (full viewport, normal) */}
      <img
        ref={bgRef}
        src="/hero.jpeg"
        alt="Curated interior space by Aurelia Interiors"
        className={styles.bgImage}
        draggable={false}
      />

      {/* LAYER 2 ── Frost overlay: blurred image + skin-colour wash
          This covers the entire viewport. The door window (layer 3)
          sits on top and reveals the sharp image through it.
      */}
      <div className={styles.frostLayer} aria-hidden="true">
        <img
          src="/hero.jpeg"
          alt=""
          className={styles.frostImage}
          draggable={false}
        />
        <div className={styles.frostColor} />
      </div>

      {/* LAYER 3 ── Door window: arch-shaped reveal
          overflow:hidden clips the door shape.
          Inside, doorImagePin is 100vw × 100vh anchored bottom-center
          so the sharp image aligns perfectly with the background.
          GSAP expands the door's width/height → reveals more.
      */}
      <div ref={doorRef} className={styles.doorWindow}>
        <div className={styles.doorImagePin}>
          <img
            src="/hero.jpeg"
            alt=""
            className={styles.doorImage}
            draggable={false}
          />
        </div>
      </div>

      {/* LAYER 4 ── Side text */}
      <div ref={textLeftRef} className={`${styles.sideText} ${styles.left}`}>
        <p className={styles.sideTextBody}>
          Where creativity meets comfort in every corner. We turn your vision
          into a living experience.
        </p>
      </div>

      <div ref={textRightRef} className={`${styles.sideText} ${styles.right}`}>
        <p className={styles.sideTextBody}>
          Minimal, modern, and meaningful interiors. Designed to feel as good
          as they look.
        </p>
      </div>
    </section>
  );
}
