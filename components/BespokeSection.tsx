"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./BespokeSection.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function BespokeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bespokeImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reveals = revealRefs.current.filter(Boolean) as HTMLDivElement[];

    // Set initial state — each inner element starts pushed below its clip mask
    reveals.forEach((el) => {
      const inner = el.querySelector(`.${styles.revealInner}`) as HTMLElement;
      if (inner) {
        gsap.set(inner, { yPercent: 130, opacity: 0 });
      }
    });

    // Create staggered scroll-triggered reveal
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 92%",
      onEnter: () => {
        reveals.forEach((el, i) => {
          const inner = el.querySelector(`.${styles.revealInner}`) as HTMLElement;
          if (!inner) return;

          gsap.to(inner, {
            yPercent: 0,
            opacity: 1,
            duration: 1.4,
            delay: i * 0.12,
            ease: "power4.out",
          });
        });
      },
      once: true,
    });

    // ── Mouse-follow depth effect for the bespoke image ─────────
    const img = bespokeImgRef.current;
    const STRENGTH = 18; // max px shift

    function handleMouseMove(e: MouseEvent) {
      if (!img) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mx = (e.clientX / vw - 0.5) * 2;
      const my = (e.clientY / vh - 0.5) * 2;

      gsap.to(img, {
        x: mx * STRENGTH,
        y: my * STRENGTH,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      st.kill();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>

        {/* ── Image — clip-reveal from below ── */}
        <div className={styles.leftCol}>
          <div
            ref={(el) => { revealRefs.current[0] = el; }}
            className={styles.revealClip}
          >
            <div className={styles.revealInner}>
              <img
                ref={bespokeImgRef}
                src="/design6.jpeg"
                alt="Aurelia Bespoke"
                className={styles.image}
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* ── Right column — each element has its own clip-reveal ── */}
        <div className={styles.rightCol}>
          <div className={styles.content}>

            {/* Heading words — each wrapped for individual clip */}
            <div className={styles.headingWrap}>
              <h2 className={styles.heading}>
                <div
                  ref={(el) => { revealRefs.current[1] = el; }}
                  className={`${styles.revealClip} ${styles.clip1}`}
                >
                  <span className={`${styles.revealInner} ${styles.word1}`}>AURELIA</span>
                </div>
                <div
                  ref={(el) => { revealRefs.current[2] = el; }}
                  className={`${styles.revealClip} ${styles.clip2}`}
                >
                  <span className={`${styles.revealInner} ${styles.word2}`}>BESPOKE</span>
                </div>
                <div
                  ref={(el) => { revealRefs.current[3] = el; }}
                  className={`${styles.revealClip} ${styles.clip3}`}
                >
                  <span className={`${styles.revealInner} ${styles.word3}`}>FURNITURE</span>
                </div>
                <div
                  ref={(el) => { revealRefs.current[4] = el; }}
                  className={`${styles.revealClipAbsolute} ${styles.clip4}`}
                >
                  <span className={`${styles.revealInner} ${styles.word4}`}>Collection</span>
                </div>
              </h2>
            </div>

            {/* Availability line */}
            <div
              ref={(el) => { revealRefs.current[5] = el; }}
              className={styles.revealClip}
            >
              <div className={`${styles.revealInner} ${styles.availability}`}>
                <div className={styles.line}></div>
                <span className={styles.availText}>(AVAILABLE NOW)</span>
              </div>
            </div>

            {/* Paragraph */}
            <div
              ref={(el) => { revealRefs.current[6] = el; }}
              className={styles.revealClip}
            >
              <p className={`${styles.revealInner} ${styles.paragraph}`}>
                The very first bespoke furniture line is rich and raw, powerful and
                luxurious. A presence that anchors your space and memory. Sensual and
                bold, cosmopolitan and timeless.
              </p>
            </div>

            {/* CTA link */}
            <div
              ref={(el) => { revealRefs.current[7] = el; }}
              className={styles.revealClip}
            >
              <a href="#" className={`${styles.revealInner} ${styles.link}`}>
                <span className={styles.arrows}>»</span> VISIT OUR ATELIER
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
