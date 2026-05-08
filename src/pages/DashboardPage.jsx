import { useEffect, useMemo, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { http } from '../api/http.js';

Chart.register(...registerables);

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [gradeTerms, setGradeTerms] = useState([]);
  const [error, setError] = useState(null);

  const barCanvasRef = useRef(null);
  const lineCanvasRef = useRef(null);
  const barChartInstanceRef = useRef(null);
  const lineChartInstanceRef = useRef(null);

  const cards = useMemo(() => {
    if (!summary) return [];
    return [
      { title: 'Students', value: summary.studentsCount },
      { title: 'Users', value: summary.usersCount },
      { title: 'Paid', value: summary.payments?.paidCount ?? 0 },
      { title: 'Pending', value: summary.payments?.pendingCount ?? 0 },
    ];
  }, [summary]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [s, n, terms] = await Promise.all([
          http.get('/dashboard/summary'),
          http.get('/notifications/summary'),
          http.get('/grades/analytics/terms'),
        ]);
        if (!alive) return;
        setSummary(s.data);
        setNotifications(n.data);
        setGradeTerms(Array.isArray(terms.data) ? terms.data : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!summary) return;
    const paid = summary.payments?.paidCount ?? 0;
    const pending = summary.payments?.pendingCount ?? 0;

    const barCtx = barCanvasRef.current?.getContext('2d');
    if (barCtx) {
      if (barChartInstanceRef.current) {
        barChartInstanceRef.current.destroy();
      }

      barChartInstanceRef.current = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Paid', 'Pending'],
          datasets: [
            {
              label: 'Payments',
              data: [paid, pending],
              backgroundColor: ['#8b5cf6', '#f59e0b'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }, [summary]);

  useEffect(() => {
    if (!gradeTerms) return;
    const lineCtx = lineCanvasRef.current?.getContext('2d');
    if (lineCtx) {
      if (lineChartInstanceRef.current) {
        lineChartInstanceRef.current.destroy();
      }

      const labels = gradeTerms.map((t) => t.term);
      const data = gradeTerms.map((t) => t.avg);

      lineChartInstanceRef.current = new Chart(lineCtx, {
        type: 'line',
        data: {
          labels: labels.length ? labels : ['—'],
          datasets: [
            {
              label: 'Average score',
              data: data.length ? data : [0],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59,130,246,0.15)',
              tension: 0.35,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }, [gradeTerms]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Statistics & summaries
          </p>
        </div>
        {notifications && (
          <div className="hidden md:block rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Next notifications (7d)</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Pending payments</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{notifications.pendingPayments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Recent messages</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{notifications.recentMessages}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="text-rose-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">{c.title}</div>
            <div className="text-3xl font-bold mt-2 text-primary-600 dark:text-primary-400">{c.value ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 h-64 transition-all duration-300 hover:shadow-xl">
          <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Payment status</div>
          <div className="h-52">
            <canvas ref={barCanvasRef} />
          </div>
        </div>

        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 h-64 transition-all duration-300 hover:shadow-xl">
          <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Grades analytics</div>
          <div className="h-52">
            <canvas ref={lineCanvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}