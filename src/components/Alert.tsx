import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { ReactNode } from 'react';

type Variant = 'error' | 'success' | 'info';

export default function Alert({
  variant = 'info',
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  const cfg =
    variant === 'error'
      ? { Icon: AlertCircle, tone: 'text-[color:var(--color-coral)]', border: 'border-[color:var(--color-coral)]/30', bg: 'bg-[color:var(--color-coral)]/[0.06]' }
      : variant === 'success'
      ? { Icon: CheckCircle2, tone: 'text-[color:var(--color-mint)]', border: 'border-[color:var(--color-mint)]/30', bg: 'bg-[color:var(--color-mint)]/[0.06]' }
      : { Icon: Info, tone: 'text-[color:var(--color-cyan)]', border: 'border-[color:var(--color-cyan)]/30', bg: 'bg-[color:var(--color-cyan)]/[0.06]' };

  return (
    <div className={`flex gap-3 rounded-lg border ${cfg.border} ${cfg.bg} p-3.5`}>
      <cfg.Icon size={16} className={`${cfg.tone} shrink-0 mt-0.5`} />
      <div className="text-sm text-[color:var(--color-text-dim)] leading-relaxed">{children}</div>
    </div>
  );
}
