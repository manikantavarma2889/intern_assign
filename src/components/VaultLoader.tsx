export default function VaultLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-[color:var(--color-border)]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[color:var(--color-brass)] vault-spin" />
        <div className="absolute inset-2 rounded-full border border-[color:var(--color-border-strong)]" />
      </div>
      <div className="font-mono text-xs tracking-[0.3em] uppercase text-[color:var(--color-muted)]">{label}</div>
    </div>
  );
}
