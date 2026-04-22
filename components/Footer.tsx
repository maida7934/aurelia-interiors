"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Footer.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    const veil = veilRef.current;
    const content = contentRef.current;
    if (!footer || !veil || !content) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footer,
        start: "top bottom", // Starts when the very top of the footer enters from below
        end: "bottom bottom", // Ends when the footer is fully visible
        scrub: true,
      }
    });

    // Content stays anchored (parallax effect) and fades/scales in slightly
    tl.fromTo(
      content,
      { yPercent: -30, opacity: 0.5, scale: 0.95 },
      { yPercent: 0, opacity: 1, scale: 1, ease: "none" },
      0
    );

    // The veil acts as the "curtain" overlay that lifts upward off the footer
    tl.fromTo(
      veil,
      { yPercent: 0 },
      { yPercent: -100, ease: "none" },
      0
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <footer ref={footerRef} className={styles.footer}>
      {/* The veil overlay */}
      <div ref={veilRef} className={styles.veil} />

      <div ref={contentRef} className={styles.contentWrap}>
        <div className={styles.main}>
          {/* ── Column 1: Get in Touch + Brand ── */}
          <div className={styles.col}>
            <span className={styles.label}>(GET IN TOUCH)</span>
            <h2 className={styles.brand}>AURELIA</h2>
          </div>

          {/* ── Column 2: Location ── */}
          <div className={styles.col}>
            <span className={styles.label}>(LOCATION)</span>
            <p className={styles.info}>
              Palazzo Aurelia,<br />
              Milan, Italy
            </p>
          </div>

          {/* ── Column 3: Contact ── */}
          <div className={styles.col}>
            <span className={styles.label}>(CONTACT)</span>
            <a href="mailto:INFO@AURELIAINTERIORS.COM" className={styles.contactLink}>
              INFO@AURELIAINTERIORS.COM
            </a>
            <a href="tel:+390287654300" className={styles.contactLink}>
              +39 02 8765 4300
            </a>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <span className={styles.copyright}>
            ©{new Date().getFullYear()} Aurelia Interiors. All rights reserved.
          </span>
          <span className={styles.bottomLink}>Manage cookies</span>
          <span className={styles.credit}>
            Designed by&ensp;<span className={styles.creditAccent}>✦</span>&ensp;Aurelia Studio
          </span>
        </div>
      </div>
    </footer>
  );
}
