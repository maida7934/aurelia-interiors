import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
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
    </footer>
  );
}
