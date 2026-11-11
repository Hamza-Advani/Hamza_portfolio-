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
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button onClick={onClose} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <motion.img
            key={item.image}
            src={optimizeImage(item.image, 1800)}
            alt={item.title}
            className="max-h-[78vh] w-auto max-w-full rounded-xl shadow-2xl"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          />
          <p className="mt-4 max-w-2xl text-center text-sm text-white/80">{item.title}</p>
          {items.length > 1 && (
            <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => onIndex((index - 1 + items.length) % items.length)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => onIndex((index + 1) % items.length)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next">
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
