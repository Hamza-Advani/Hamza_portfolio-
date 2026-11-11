import { motion } from 'framer-motion';
import { ArrowLeft, House } from 'lucide-react';
import { Seo } from '../lib/seo.jsx';
import { Button } from '../components/ui.jsx';

export default function NotFound({ what = 'page' }) {
  return (
    <section className="relative grid min-h-[90vh] place-items-center overflow-hidden px-4 pt-24 text-center">
      <Seo title="Not found" noindex />
      <div className="grid-bg mask-fade-b absolute inset-0 -z-10" />
      <div>
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-gradient font-display text-[34vw] font-bold leading-none tracking-tighter md:text-[16rem]"
          aria-hidden="true"
        >
          404
        </motion.p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">This {what} doesn&apos;t exist.</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          <span className="font-mono text-sm text-iris">Segmentation fault (core dumped)</span> — just kidding. The link may be broken or the {what} may have moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/" variant="primary"><House className="h-4 w-4" /> Back home</Button>
          <Button variant="outline" onClick={() => window.history.back()}><ArrowLeft className="h-4 w-4" /> Go back</Button>
        </div>
      </div>
    </section>
  );
}
