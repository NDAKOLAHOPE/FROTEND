export default function Card({ children, className = '' }) {
  return (
    <div
      className={[
        'rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30',
        'shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 card-glow',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}