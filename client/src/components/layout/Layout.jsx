import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { useSite } from '../../context/SiteContext.jsx';
import { ErrorState, Spinner } from '../ui.jsx';

export function RouteFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Spinner className="h-7 w-7" />
    </div>
  );
}

export default function Layout() {
  const { pathname, hash } = useLocation();
  const { error, profile, reload } = useSite();

  useEffect(() => {
    // Links like /#projects scroll to their section instead (see useScrollToHashOnLoad).
    if (!hash) window.scrollTo({ top: 0, behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <Navbar />
      <main id="main" className="min-h-screen">
        {error && !profile ? (
          <div className="container-x pt-40 pb-20">
            <ErrorState title="Couldn't load the site" error={error} onRetry={reload} />
          </div>
        ) : (
          <Suspense fallback={<RouteFallback />}>{profile ? <Outlet /> : <RouteFallback />}</Suspense>
        )}
      </main>
      <Footer />
    </>
  );
}
