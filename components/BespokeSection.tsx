"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./BespokeSection.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function BespokeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    if (!section || !inner) return;

    // The section slides up from below, creating a seamless transition
    // from the Origin Objects pinned section
    gsap.set(inner, { y: 120, opacity: 0 });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 95%",
      end: "top 20%",
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        const eased = gsap.parseEase("power2.out")(p);
        gsap.set(inner, {
          y: (1 - eased) * 120,
          opacity: eased,
        });
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div ref={innerRef} className={styles.inner}>
        <div className={styles.leftCol}>
          <img
            src="/design6.jpeg"
            alt="Aurelia Bespoke"
            className={styles.image}
            draggable={false}
          />
        </div>
        <div className={styles.rightCol}>
          <div className={styles.content}>
            
            <div className={styles.headingWrap}>
              <h2 className={styles.heading}>
                <span className={styles.word1}>AURELIA</span>
                <span className={styles.word2}>BESPOKE</span>
                <span className={styles.word3}>FURNITURE</span>
                <span className={styles.word4}>Collection</span>
              </h2>
            </div>
            
            <div className={styles.availability}>
              <div className={styles.line}></div>
              <span className={styles.availText}>(AVAILABLE NOW)</span>
            </div>
            
            <p className={styles.paragraph}>
              The very first bespoke furniture line is rich and raw, powerful and
              luxurious. A presence that anchors your space and memory. Sensual and
              bold, cosmopolitan and timeless.
            </p>
            
            <a href="#" className={styles.link}>
              <span className={styles.arrows}>»</span> VISIT OUR ATELIER
            </a>
            
          </div>
        </div>
      </div>
    </section>
  );
}
