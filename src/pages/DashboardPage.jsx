import { useEffect, useMemo, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { http } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';

Chart.register(...registerables);

export default function DashboardPage() {
  const { role } = useAuth();
  const [summary, setSummary] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [gradeTerms, setGradeTerms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const barCanvasRef = useRef(null);
  const lineCanvasRef = useRef(null);
  const barChartInstanceRef = useRef(null);
  const lineChartInstanceRef = useRef(null);

  const isParent = role === 'PARENT' || role === 'MERE' || role === 'mere';

  const cards = useMemo(() => {
    if (!summary) return [];
    if (isParent) {
      return [
        { title: 'Enfants', value: summary.childrenCount, icon: '👥', color: 'primary' },
        { title: 'Paiements en attente', value: summary.pendingPaymentsCount, icon: '⏳', color: 'amber' },
      ];
    }
    return [
      { title: 'Students', value: summary.studentsCount, icon: '👥', color: 'primary' },
      { title: 'Users', value: summary.usersCount, icon: '👤', color: 'accent' },
      { title: 'Paid', value: summary.payments?.paidCount ?? 0, icon: '✅', color: 'emerald' },
      { title: 'Pending', value: summary.payments?.pendingCount ?? 0, icon: '⏳', color: 'amber' },
    ];
  }, [summary, isParent]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
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
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!summary) return;
    if (isParent) return;
    const paid = summary.payments?.paidCount ?? 0;
    const pending = summary.payments?.pendingCount ?? 0;

    const barCtx = barCanvasRef.current?.getContext('2d');
    if (barCtx) {
      if (barChartInstanceRef.current) barChartInstanceRef.current.destroy();
      barChartInstanceRef.current = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Paid', 'Pending'],
          datasets: [{ label: 'Payments', data: [paid, pending], backgroundColor: ['#8b5cf6', '#f59e0b'] }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }, [summary, isParent]);

  useEffect(() => {
    if (!gradeTerms) return;
    const lineCtx = lineCanvasRef.current?.getContext('2d');
    if (lineCtx) {
      if (lineChartInstanceRef.current) lineChartInstanceRef.current.destroy();
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: isParent ? 2 : 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/60 dark:bg-slate-900/60 p-5 animate-pulse">
              <div className="h-4 bg-slate-200/50 dark:bg-slate-700/50 rounded mb-3" />
              <div className="h-8 bg-slate-200/50 dark:bg-slate-700/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Vue d'ensemble de votre établissement
          </p>
        </div>
        {notifications && (
          <div className="hidden md:block rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Alertes (7j)</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Paiements en attente</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{notifications.pendingPayments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Messages récents</span>
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
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{c.icon}</span>
              <span className={`text-xs px-2 py-1 rounded-full bg-${c.color}-100/50 dark:bg-${c.color}-900/30 text-${c.color}-700 dark:text-${c.color}-300`}>
                {c.title}
              </span>
            </div>
            <div className={`text-3xl font-bold text-${c.color}-600 dark:text-${c.color}-400`}>{c.value ?? 0}</div>
          </div>
        ))}
      </div>

      {isParent && summary?.children?.length > 0 && (
        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 transition-all duration-300 hover:shadow-xl">
          <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Mes enfants</div>
          <div className="space-y-2">
            {summary.children.map((child) => (
              <div key={child.id} className="rounded-xl bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-slate-800/50 dark:to-slate-700/50 p-3">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {child.firstName} {child.lastName}
                </span>
                {child.className && (
                  <span className="ml-2 text-xs text-slate-600 dark:text-slate-400">({child.className})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isParent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 h-64 transition-all duration-300 hover:shadow-xl">
            <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Statut des paiements</div>
            <div className="h-52">
              <canvas ref={barCanvasRef} />
            </div>
          </div>

          <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 h-64 transition-all duration-300 hover:shadow-xl">
            <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Évolution des notes</div>
            <div className="h-52">
              <canvas ref={lineCanvasRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}