import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
            <div className="relative grid h-20 w-20 place-items-center">
              <motion.span
                className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,var(--violet),var(--aqua),var(--iris),var(--violet))]"
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
              />
              <span className="absolute inset-[2px] rounded-[14px] bg-bg" />
              <motion.span className="relative font-display text-2xl font-bold" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                MH
              </motion.span>
            </div>
            <div className="h-px w-40 overflow-hidden bg-line">
              <motion.div
                className="h-full bg-gradient-to-r from-violet via-iris to-aqua"
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
