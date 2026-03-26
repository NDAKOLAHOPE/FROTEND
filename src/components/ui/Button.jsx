export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ' +
    'active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ' +
    'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950';

  const styles = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
    soft:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20',
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

