import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { storage, type MyPoll } from '../lib/storage.js';
import styles from './MyPolls.module.css';

// Header menu with the meetings this device created: the way back to an admin page.
export function MyPolls() {
  const location = useLocation();
  const [polls, setPolls] = useState<MyPoll[]>(storage.myPolls);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Re-read after navigation: creating a meeting adds to the list.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPolls(storage.myPolls());
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (polls.length === 0) return null;

  return (
    <div className={styles.root} ref={rootRef}>
      <button type="button" className={styles.trigger} aria-expanded={open} onClick={() => setOpen(!open)}>
        МОИ ВСТРЕЧИ
      </button>
      {open && (
        <div className={styles.panel}>
          <Link to="/" className={styles.item}>
            <span className={styles.plus}>+</span> НОВАЯ ВСТРЕЧА
          </Link>
          {polls.map((p) => (
            <Link key={p.slug} to={`/p/${p.slug}/admin/${p.adminToken}`} className={styles.item}>
              {p.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
