import type { HTMLAttributes } from 'react';
import styles from './Banner.module.css';

interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'error';
}

export function Banner({ variant = 'default', className, ...rest }: BannerProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : undefined}
      className={[styles.banner, variant === 'error' ? styles.error : '', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}
