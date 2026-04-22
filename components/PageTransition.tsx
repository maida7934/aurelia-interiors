"use client";

import { forwardRef, useImperativeHandle, useRef, useState, useCallback } from "react";
import styles from "./PageTransition.module.css";

export interface PageTransitionHandle {
  /** Fire the tile transition. Resolves after the curtain fully covers, then auto-retracts. */
  play: () => Promise<void>;
}

const TILE_COUNT = 5;
/** Total time for tiles to fully cover the viewport (last tile delay + transition) */
const COVER_DURATION = 1400;
/** How long the curtain stays fully opaque before retracting */
const HOLD_DURATION = 400;

const PageTransition = forwardRef<PageTransitionHandle>(function PageTransition(_, ref) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const play = useCallback(() => {
    return new Promise<void>((resolve) => {
      setActive(true);

      // After tiles fully cover → resolve so caller can scroll
      setTimeout(() => {
        resolve();

        // Hold briefly, then retract
        setTimeout(() => {
          setActive(false);
        }, HOLD_DURATION);
      }, COVER_DURATION);
    });
  }, []);

  useImperativeHandle(ref, () => ({ play }), [play]);

  return (
    <div
      ref={loaderRef}
      className={`${styles.loader} ${active ? styles.loaderActive : ""}`}
    >
      <div className={styles.loaderBrand}>
        <span className={styles.brandAurelia}>Aurelia</span>
        <span className={styles.brandInteriors}>Interiors</span>
      </div>
      {Array.from({ length: TILE_COUNT }, (_, i) => (
        <div key={i} className={styles.tile} />
      ))}
    </div>
  );
});

export default PageTransition;
