export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ease-in-out ' +
    'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ' +
    'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950';

  const styles = {
    primary:
      'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/30',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    soft:
      'bg-brand-50 text-brand-900 hover:bg-brand-100 dark:bg-slate-800 dark:text-brand-300 dark:hover:bg-slate-700',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/30',
  };

  return (
    <button
      type={type}
      className={[base, styles[variant] ?? styles.primary, className].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

