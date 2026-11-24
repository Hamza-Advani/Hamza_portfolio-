import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrandMark } from '../brand/BrandMark.jsx';

/** Branded intro loader shown on first visit until site data has loaded. */
export default function PageLoader({ done }) {
  const [visible, setVisible] = useState(true);
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (done && minElapsed) setVisible(false);
  }, [done, minElapsed]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-bg"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          role="status"
          aria-label="Loading"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="relative grid h-24 w-24 place-items-center">
              <motion.span
                aria-hidden="true"
                className="absolute inset-2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)] blur-md"
                animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <BrandMark animate className="relative h-20 w-20 text-ink" />
            </div>
            <div className="h-px w-40 overflow-hidden bg-line">
              <motion.div
                className="h-full bg-gradient-to-r from-violet via-iris to-brand-lime"
                initial={{ x: '-100%' }}
                animate={{ x: done ? '0%' : '-30%' }}
                transition={{ duration: done ? 0.4 : 1.6, ease: 'easeOut' }}
              />
            </div>
            <p className="eyebrow">Muhammad Hamza</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
