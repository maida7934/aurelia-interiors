import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
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
  );
}
