import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';

import styles from './button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual variant of the button
   * @default 'secondary'
   */
  variant?: ButtonVariant;

  /**
   * The size of the button
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * Whether the button should take full width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Whether the button is in an active state (e.g., selected filter)
   * @default false
   */
  active?: boolean;

  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Icon to display before the button text
   */
  startIcon?: ReactNode;

  /**
   * Icon to display after the button text
   */
  endIcon?: ReactNode;

  /**
   * Button content
   */
  children?: ReactNode;
}

/**
 * A reusable Button component with multiple variants and sizes.
 * Supports icons, loading states, and full accessibility.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'medium',
      fullWidth = false,
      active = false,
      loading = false,
      startIcon,
      endIcon,
      children,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      active && styles.active,
      loading && styles.loading,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || loading}
        type={type}
        {...props}
      >
        {loading && (
          <span aria-label="Loading" className={styles.spinner}>
            <svg
              fill="none"
              height="16"
              viewBox="0 0 16 16"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeDasharray="10 20"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </span>
        )}
        {!loading && startIcon && <span className={styles.icon}>{startIcon}</span>}
        {children && <span className={styles.content}>{children}</span>}
        {!loading && endIcon && <span className={styles.icon}>{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
