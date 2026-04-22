"use client";

import { forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect } from "react";
import styles from "./PageTransition.module.css";

export const triggerPageTransition = (): Promise<void> => {
  return new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent("play-page-transition", { detail: { resolve } })
    );
  });
};

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

  useEffect(() => {
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      play().then(() => {
        if (customEvent.detail?.resolve) {
          customEvent.detail.resolve();
        }
      });
    };
    window.addEventListener("play-page-transition", handleEvent);
    return () => window.removeEventListener("play-page-transition", handleEvent);
  }, [play]);

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
