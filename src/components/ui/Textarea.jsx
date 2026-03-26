export default function Textarea({ label, error, className = '', ...props }) {
  return (
    <label className="block w-full">
      {label ? (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
      ) : null}
      <textarea
        className={[
          'mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm',
          'border-slate-200/80 text-slate-900 placeholder:text-slate-400',
          'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          'dark:bg-slate-950 dark:border-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500',
          error ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </label>
  );
}

