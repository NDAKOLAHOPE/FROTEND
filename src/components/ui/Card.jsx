export default function Card({ children, className = '' }) {
  return (
    <div
      className={[
        'rounded-2xl border border-slate-200/70 bg-white shadow-sm',
        'dark:border-slate-800/70 dark:bg-slate-900/60',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

