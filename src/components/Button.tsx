import { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline';
  loading?: boolean;
  children: ReactNode;
};

export default function Button({
  variant = 'primary',
  loading,
  children,
  disabled,
  className = '',
  ...rest
}: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brass)]/40 focus:ring-offset-2 focus:ring-offset-[color:var(--color-bg)]';
  const styles =
    variant === 'primary'
      ? 'text-[#0a0f0d] brass-gradient hover:brightness-110 active:brightness-95 shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_10px_30px_-10px_rgba(232,176,92,0.5)]'
      : variant === 'outline'
      ? 'border border-[color:var(--color-border-strong)] text-[color:var(--color-text)] hover:border-[color:var(--color-brass)]/60 hover:bg-[color:var(--color-surface)]'
      : 'text-[color:var(--color-text-dim)] hover:text-[color:var(--color-text)]';

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`${base} ${styles} ${className}`}
    >
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}
