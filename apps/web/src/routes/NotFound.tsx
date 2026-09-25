import { Link } from 'react-router';
import buttonStyles from '../primitives/Button.module.css';
import styles from './NotFound.module.css';

export function NotFound({ message = 'Такой страницы нет' }: { message?: string }) {
  return (
    <div className={styles.page}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>{message}</h1>
      <p className={styles.hint}>Проверь ссылку — или создай новую встречу.</p>
      <Link to="/" className={[buttonStyles.button, buttonStyles.primary].join(' ')}>
        СОЗДАТЬ ВСТРЕЧУ
      </Link>
    </div>
  );
}
