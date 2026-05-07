import { useEffect, useState } from 'react';
import { http } from '../api/http.js';

export default function NotificationsPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await http.get('/notifications/summary');
        if (!alive) return;
        setSummary(res.data);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Computed alerts (7 days)</p>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {!summary ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl shadow-md bg-gradient-to-br from-white/60 to-slate-50/60 dark:from-slate-900/60 dark:to-slate-800/40 p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Pending payments</div>
            <div className="text-3xl font-bold mt-2 text-brand-600 dark:text-brand-400">{summary.pendingPayments}</div>
          </div>
          <div className="rounded-2xl shadow-md bg-gradient-to-br from-white/60 to-slate-50/60 dark:from-slate-900/60 dark:to-slate-800/40 p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Recent messages</div>
            <div className="text-3xl font-bold mt-2 text-brand-600 dark:text-brand-400">{summary.recentMessages}</div>
          </div>
        </div>
      )}
    </div>
  );
}

