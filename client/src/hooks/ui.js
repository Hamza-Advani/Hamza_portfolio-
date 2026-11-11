import { useEffect, useState } from 'react';

export function useTypewriter(words, { typeMs = 70, deleteMs = 35, holdMs = 1600 } = {}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words?.length) return;
    const word = words[index % words.length];
    let t;
    if (!deleting && text === word) t = setTimeout(() => setDeleting(true), holdMs);
    else if (deleting && text === '') {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
    } else {
      t = setTimeout(
        () => setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
        deleting ? deleteMs : typeMs,
      );
    }
    return () => clearTimeout(t);
  }, [text, deleting, index, words, typeMs, deleteMs, holdMs]);

  return text;
}

export function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [threshold]);
  return scrolled;
}
