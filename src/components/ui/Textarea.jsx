export default function Textarea({ label, error, className = '', ...props }) {
  return (
    <label className="block w-full">
      {label ? (
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </span>
      ) : null}
      <textarea
        className={[
          'mt-2 w-full rounded-xl border bg-white/80 px-4 py-2.5 text-sm transition resize-none',
          'border-primary-200/60 text-slate-900 placeholder:text-slate-400',
          'focus:ring-2 focus:ring-primary-500 focus:border-primary-400 focus:bg-white',
          'dark:bg-slate-900/60 dark:border-primary-900/30 dark:text-slate-100 dark:placeholder:text-slate-500',
          'dark:focus:bg-slate-900/80',
          'backdrop-blur-sm',
          error ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error ? <div className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</div> : null}
    </label>
  );
}