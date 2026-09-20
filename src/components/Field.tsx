import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  icon?: ReactNode;
  toggleReveal?: boolean;
};

const Field = forwardRef<HTMLInputElement, Props>(function Field(
  { label, hint, error, icon, toggleReveal, type = 'text', className = '', ...rest },
  ref
) {
  const [reveal, setReveal] = useState(false);
  const inputType = toggleReveal ? (reveal ? 'text' : 'password') : type;

  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[11px] font-mono tracking-[0.18em] uppercase text-[color:var(--color-muted)]">
          {label}
        </span>
        {hint && <span className="text-[11px] text-[color:var(--color-muted)]">{hint}</span>}
      </div>
      <div
        className={`relative flex items-center rounded-lg border transition-colors bg-[color:var(--color-surface)] ${
          error
            ? 'border-[color:var(--color-coral)]/60'
            : 'border-[color:var(--color-border)] focus-within:border-[color:var(--color-brass)]/60'
        }`}
      >
        {icon && (
          <div className="pl-3 text-[color:var(--color-muted)] flex items-center">{icon}</div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={`flex-1 bg-transparent px-3.5 py-3 text-[15px] text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)] outline-none ${className}`}
          {...rest}
        />
        {toggleReveal && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            className="px-3 text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] transition-colors"
            aria-label={reveal ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <div className="mt-1.5 text-xs text-[color:var(--color-coral)]">{error}</div>
      )}
    </label>
  );
});

export default Field;
