"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./Navbar.module.css";
import PageTransition, { type PageTransitionHandle } from "./PageTransition";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const transitionRef = useRef<PageTransitionHandle>(null);

  const handleBrandClick = useCallback(async () => {
    // Fire the tile transition
    if (transitionRef.current) {
      await transitionRef.current.play();
    }

    // Scroll to top (hero section) — instant so user doesn't see movement behind tiles
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
      <nav className={styles.navbar}>
        <div
          className={styles.navBrand}
          onClick={handleBrandClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleBrandClick();
          }}
        >
          <span className={styles.brandAurelia}>Aurelia</span>
          <span className={styles.brandInteriors}>Interiors</span>
        </div>
        <button 
          className={styles.menuBtn} 
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={styles.menuLines}>
            <span className={`${styles.menuLine} ${menuOpen ? styles.openLine1 : ''}`} />
            <span className={`${styles.menuLine} ${menuOpen ? styles.openLine2 : ''}`} />
          </span>
          <span className={styles.menuLabel}>{menuOpen ? 'CLOSE' : 'MENU'}</span>
        </button>
      </nav>

      {/* ── Fullscreen Menu Overlay ── */}
      <div className={`${styles.menuOverlay} ${menuOpen ? styles.overlayOpen : ''}`}>
        <div className={styles.menuCircle}>
          <ul className={styles.menuList}>
            <li><a href="#" onClick={() => setMenuOpen(false)}>Home</a></li>
            <li><a href="#" onClick={() => setMenuOpen(false)}>About Us</a></li>
            <li><a href="#" onClick={() => setMenuOpen(false)}>Contact</a></li>
            <li><a href="#" onClick={() => setMenuOpen(false)}>Work</a></li>
            <li><a href="#" onClick={() => setMenuOpen(false)}>Projects</a></li>
          </ul>
        </div>
      </div>

      {/* ── Page Transition Overlay ── */}
      <PageTransition ref={transitionRef} />
    </>
  );
}
