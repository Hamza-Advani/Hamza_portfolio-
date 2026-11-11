import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { useSite } from '../../context/SiteContext.jsx';
import { ErrorState, Spinner } from '../ui.jsx';
import PageLoader from './PageLoader.jsx';

export function RouteFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Spinner className="h-7 w-7" />
    </div>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const { loading, error, profile, reload } = useSite();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <>
      <PageLoader done={!loading} />
      <div className="noise" aria-hidden="true" />
      <Navbar />
      <main id="main" className="min-h-screen">
        {error && !profile ? (
          <div className="container-x pt-40 pb-20">
            <ErrorState title="Couldn't load the site" error={error} onRetry={reload} />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Suspense fallback={<RouteFallback />}>{profile ? <Outlet /> : <RouteFallback />}</Suspense>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      <Footer />
    </>
  );
}
