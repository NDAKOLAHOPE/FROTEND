export default function Card({ children, className = '' }) {
  return (
    <div
      className={[
        'rounded-xl bg-gradient-to-br from-white/80 to-brand-50/30 shadow-sm hover:shadow-xl hover:shadow-brand-500/20 transition-all duration-300 hover:-translate-y-0.5',
        'dark:bg-gradient-to-br dark:from-slate-900/50 dark:to-brand-950/20 dark:hover:shadow-brand-500/10',
        'backdrop-blur-sm',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

