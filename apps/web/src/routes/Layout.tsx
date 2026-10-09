import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { publicPath, trackHit } from '../lib/metrika.js';
import { ThemeToggle } from '../theme/ThemeToggle.js';
import { MyPolls } from './MyPolls.js';
import styles from './Layout.module.css';

// The counter is initialised with `defer: true`, so every page view is reported here,
// the first one included. The referer of an in-app move is the previous route.
function useMetrikaHits() {
  const { pathname, search } = useLocation();
  const previous = useRef<string | null>(null);
  useEffect(() => {
    const path = pathname + search;
    if (path === previous.current) return; // StrictMode re-runs the effect in dev
    trackHit(path, previous.current === null ? undefined : `${location.origin}${publicPath(previous.current)}`);
    previous.current = path;
  }, [pathname, search]);
}

export function Layout() {
  useMetrikaHits();
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          CAL <span className={styles.signature}>BY BOROZDOV</span>
        </Link>
        <div className={styles.right}>
          <MyPolls />
          <ThemeToggle />
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
