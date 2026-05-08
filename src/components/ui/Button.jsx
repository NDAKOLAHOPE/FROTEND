export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 ease-out ' +
    'active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed ' +
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 ' +
    'relative overflow-hidden btn-glow';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const styles = {
    primary:
      'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 hover:shadow-xl shadow-lg shadow-primary-500/30 hover:-translate-y-0.5',
    ghost:
      'bg-transparent text-slate-700 hover:bg-white/60 hover:shadow-md dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:shadow-md hover:-translate-y-0.5 hover:text-primary-600',
    soft:
      'bg-primary-50/50 text-primary-700 hover:bg-primary-100/60 hover:shadow-md dark:bg-slate-800/50 dark:text-primary-300 dark:hover:bg-slate-700/60 dark:hover:shadow-md hover:-translate-y-0.5',
    danger:
      'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 hover:shadow-xl shadow-lg shadow-rose-500/30 hover:-translate-y-0.5',
  };

  return (
    <button
      type={type}
      className={[base, sizes[size] ?? sizes.md, styles[variant] ?? styles.primary, className].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}