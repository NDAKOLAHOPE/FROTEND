export default function Card({ children, className = '' }) {
  return (
    <div
      className={[
        'rounded-xl border border-brand-200/50 bg-gradient-to-br from-white to-brand-50/30 shadow-sm',
        'dark:border-brand-900/30 dark:bg-gradient-to-br dark:from-slate-900/50 dark:to-brand-950/20',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

