export default function Select({ label, error, className = '', children, ...props }) {
  return (
    <label className="block w-full">
      {label ? (
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </span>
      ) : null}
      <select
        className={[
          'mt-2 w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition',
          'border-brand-200/60 text-slate-900',
          'focus:ring-2 focus:ring-brand-500 focus:border-brand-400 focus:bg-brand-50/30',
          'dark:bg-slate-950 dark:border-brand-900/30 dark:text-slate-100',
          'dark:focus:bg-slate-900/50',
          error ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </select>
      {error ? <div className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</div> : null}
    </label>
  );
}

