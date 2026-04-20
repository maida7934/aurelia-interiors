"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./HeroSection.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const spacerRef = useRef<HTMLDivElement>(null);
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
      width: "30%",
      height: "60%",
    });

    // Position text vertically via GSAP so transforms are conflict-free
    gsap.set([textLeftRef.current, textRightRef.current], {
      yPercent: -50,
    });

    // ── Scroll-driven timeline (NO pin — hero is CSS fixed) ──────
    //    Trigger: the spacer div that lives in normal flow.
    //    start: spacer top at viewport top (scroll = 0)
    //    end:   spacer bottom at viewport bottom
    //    Active scroll range = spacerHeight - viewportHeight = 1500px
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: spacerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
      });

      // Door expands from small → covers entire viewport
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

      // Text drifts upward AND grows as door opens
      tl.to(
        textLeftRef.current,
        { y: -130, scale: 1.18, ease: "none", duration: 1 },
        0
      );
      tl.to(
        textRightRef.current,
        { y: -130, scale: 1.18, ease: "none", duration: 1 },
        0
      );
    }, spacerRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      {/* Spacer sits in normal document flow and provides scroll height.
          The hero itself is position:fixed so it stays at the viewport top
          while the spacer scrolls past, driving the door animation. */}
      <div ref={spacerRef} className={styles.heroSpacer} />

      {/* Hero — fixed at viewport top, z-index 1.
          The next section (Essence) has z-index 10 and naturally
          scrolls up over this fixed hero. */}
      <section ref={heroRef} className={styles.hero}>



        {/* LAYER 1 ── Sharp background image */}
        <img
          ref={bgRef}
          src="/hero.jpeg"
          alt="Curated interior space by Aurelia Interiors"
          className={styles.bgImage}
          draggable={false}
        />

        {/* LAYER 2 ── Frost overlay */}
        <div className={styles.frostLayer} aria-hidden="true">
          <img
            src="/hero.jpeg"
            alt=""
            className={styles.frostImage}
            draggable={false}
          />
          <div className={styles.frostColor} />
        </div>

        {/* LAYER 3 ── Door window */}
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
    </>
  );
}
