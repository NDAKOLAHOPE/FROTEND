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
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Computed alerts (7 days)</p>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {!summary ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-sm text-slate-600 dark:text-slate-300">Pending payments</div>
            <div className="text-2xl font-semibold mt-1">{summary.pendingPayments}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-sm text-slate-600 dark:text-slate-300">Recent messages</div>
            <div className="text-2xl font-semibold mt-1">{summary.recentMessages}</div>
          </div>
        </div>
      )}
    </div>
  );
}

