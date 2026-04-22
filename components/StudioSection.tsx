"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./StudioSection.module.css";
import { triggerPageTransition } from "./PageTransition";

gsap.registerPlugin(ScrollTrigger);

/* ── Box content ─────────────────────────────────────────────────── */
const BOX_CONTENT = [
  {
    id: 1,
    number: 1,
    text: "Every space we design begins with a conversation — understanding how you live, move, and feel within your home.",
    imgSrc: "/design2.jpeg",
  },
  {
    id: 2,
    number: 2,
    text: "Light, proportion, and material are the foundations of our practice. We treat each surface as an opportunity for quiet expression.",
    imgSrc: "/design1.jpeg",
  },
  {
    id: 3,
    number: 3,
    text: "Aurelia brings together artisanal craftsmanship and refined modern sensibility — spaces that feel both collected and calm.",
    imgSrc: "/design4.jpeg",
  },
  {
    id: 4,
    number: null,
    image: true, // parallax image box
    text: null,
  },
  {
    id: 5,
    number: 4,
    text: "We do not follow trends. We listen to the architecture, the light, and the people who will inhabit the space.",
    imgSrc: "/design5.jpeg",
  },
  {
    id: 6,
    number: 5,
    text: "From concept to completion, the studio guides every detail — ensuring coherence, integrity, and lasting beauty in each project.",
    imgSrc: "/design6.jpeg",
  },
];

export default function StudioSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const box4ContainerRef = useRef<HTMLDivElement>(null);
  const box4ImgRef = useRef<HTMLImageElement>(null);
  const smallImgRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in the paragraph
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 85%",
          },
        }
      );

      // Box 4 — image parallax scroll
      if (box4ImgRef.current && box4ContainerRef.current) {
        gsap.fromTo(
          box4ImgRef.current,
          { y: "8%" },
          {
            y: "-8%",
            ease: "none",
            scrollTrigger: {
              trigger: box4ContainerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    }, sectionRef);

    // ── Mouse-follow depth effect for small box images ──────────
    const imgs = smallImgRefs.current.filter(Boolean) as HTMLImageElement[];
    const STRENGTH = 15; // max px the image can shift

    function handleMouseMove(e: MouseEvent) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Normalised mouse position: -1 to +1 from centre
      const mx = (e.clientX / vw - 0.5) * 2;
      const my = (e.clientY / vh - 0.5) * 2;

      imgs.forEach((img) => {
        gsap.to(img, {
          x: mx * STRENGTH,
          y: my * STRENGTH,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section className={styles.studioSection} ref={sectionRef}>
      <div className={styles.container}>

        {/* ── Intro paragraph ── */}
        <div className={styles.paragraphContainer}>
          <div className={styles.paragraphWrapper}>
            <p className={styles.paragraphText} ref={textRef}>
              Interior design, for us, begins with understanding how a space is meant to be lived in.
              Every project is approached as a balance of light, form, and material, where each element
              is considered in relation to the whole. We focus on creating environments that feel intentional
              and composed, where textures, proportions, and spatial flow work together seamlessly.
            </p>
            <button className={styles.aboutBtn} onClick={async (e) => {
              e.preventDefault();
              await triggerPageTransition();
              window.scrollTo({ top: 0, behavior: "instant" });
            }}>
              <span className={styles.aboutBtnText}>About Us</span>
              <div className={styles.aboutBtnFill}></div>
            </button>
          </div>
        </div>

        {/* ── Boxes ── */}
        <div className={styles.boxesContainer}>
          {BOX_CONTENT.map((box, boxIdx) => (
            <div
              key={box.id}
              ref={box.image ? box4ContainerRef : undefined}
              className={`${styles.box} ${styles[`box${box.id}`]}`}
            >
              {/* Circled number */}
              {box.number !== null && (
                <div className={styles.boxNumber}>{box.number}</div>
              )}

              {box.image ? (
                /* ── Box 4: parallax image ── */
                <div className={styles.box4ImageWrap}>
                  <img
                    ref={box4ImgRef}
                    src="/design7.jpeg"
                    alt="Aurelia Interiors — studio"
                    className={styles.box4Img}
                    draggable={false}
                  />
                </div>
              ) : (
                /* ── Text boxes ── */
                <>
                  {box.imgSrc && (
                    <div className={styles.smallBoxImageWrap}>
                      <img
                        ref={(el) => { smallImgRefs.current[boxIdx] = el; }}
                        src={box.imgSrc}
                        alt=""
                        className={styles.smallBoxImg}
                        draggable={false}
                      />
                    </div>
                  )}
                  <p className={styles.boxText}>{box.text}</p>
                </>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
