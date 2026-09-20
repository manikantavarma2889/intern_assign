type Check = { label: string; pass: boolean };

export function evaluatePassword(pw: string): { checks: Check[]; score: number } {
  const checks: Check[] = [
    { label: '8+ characters', pass: pw.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(pw) },
    { label: 'Lowercase', pass: /[a-z]/.test(pw) },
    { label: 'Number', pass: /[0-9]/.test(pw) },
    { label: 'Symbol', pass: /[^A-Za-z0-9]/.test(pw) },
  ];
  const passed = checks.filter((c) => c.pass).length;
  return { checks, score: passed };
}

const LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

export default function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const { checks, score } = evaluatePassword(value);
  const pct = (score / 5) * 100;
  const color =
    score <= 1 ? 'var(--color-coral)' : score <= 3 ? '#d4a12a' : 'var(--color-mint)';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 rounded-full bg-[color:var(--color-border)] overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span className="text-[11px] font-mono uppercase tracking-widest" style={{ color }}>
          {LABELS[score]}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`text-[11px] font-mono ${
              c.pass ? 'text-[color:var(--color-mint)]' : 'text-[color:var(--color-muted)]'
            }`}
          >
            {c.pass ? '✓' : '·'} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
