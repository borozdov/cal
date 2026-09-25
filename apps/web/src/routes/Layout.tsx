import { Link, Outlet } from 'react-router';
import { ThemeToggle } from '../theme/ThemeToggle.js';
import { MyPolls } from './MyPolls.js';
import styles from './Layout.module.css';

export function Layout() {
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
