"use client";

import { useState } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navBrand}>
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
    </>
  );
}
