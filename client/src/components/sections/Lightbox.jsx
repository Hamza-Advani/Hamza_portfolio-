import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { optimizeImage } from '../../lib/media.js';

export default function Lightbox({ items, index, onClose, onIndex }) {
  const open = index !== null && index !== undefined;
  const item = open ? items[index] : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % items.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + items.length) % items.length);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, index, items.length, onClose, onIndex]);

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#050713]/90 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button onClick={onClose} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur transition hover:border-[#a34fff] hover:bg-[#853bff]/40" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <motion.div className="rounded-2xl bg-[linear-gradient(135deg,rgb(163_79_255/0.6),rgb(38_139_255/0.6))] p-px shadow-[0_30px_120px_-30px_rgb(133_59_255/0.7)]" initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
          <img
            key={item.image}
            src={optimizeImage(item.image, 1800)}
            alt={item.title}
            className="block max-h-[74vh] w-auto max-w-[calc(100vw-2rem)] rounded-2xl bg-white object-contain"
          />
          </motion.div>
          <p className="mt-5 max-w-2xl text-center text-sm text-white/85">{item.title}{items.length > 1 && <span className="ml-2 font-mono text-xs text-white/50">{index + 1} / {items.length}</span>}</p>
          {items.length > 1 && (
            <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => onIndex((index - 1 + items.length) % items.length)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur transition hover:border-[#a34fff] hover:bg-[#853bff]/40" aria-label="Previous">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => onIndex((index + 1) % items.length)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur transition hover:border-[#a34fff] hover:bg-[#853bff]/40" aria-label="Next">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
