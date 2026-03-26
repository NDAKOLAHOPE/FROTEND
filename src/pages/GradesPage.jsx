import { useEffect, useMemo, useState } from 'react';
import { http } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function GradesPage() {
  const { role } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const canManage = role === 'ADMIN' || role === 'TEACHER';

  const [form, setForm] = useState({
    studentId: '',
    subject: '',
    score: '',
    term: 'T1',
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const url = role === 'PARENT' ? '/grades/my' : '/grades';
        const res = await http.get(url);
        if (!alive) return;
        setItems(res.data);
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
  }, [role]);

  const avgByTerm = useMemo(() => {
    const map = new Map();
    for (const g of items) {
      const t = g.term ?? '—';
      const prev = map.get(t) ?? { sum: 0, n: 0 };
      map.set(t, { sum: prev.sum + Number(g.score), n: prev.n + 1 });
    }
    return Array.from(map.entries()).map(([term, v]) => ({
      term,
      avg: v.n ? v.sum / v.n : 0,
    }));
  }, [items]);

  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      await http.post('/grades', {
        studentId: Number(form.studentId),
        subject: form.subject,
        score: Number(form.score),
        term: form.term || undefined,
      });
      const url = role === 'PARENT' ? '/grades/my' : '/grades';
      const res = await http.get(url);
      setItems(res.data);
    } catch (e2) {
      setError(e2?.response?.data?.message ?? e2?.message ?? 'Erreur');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Grades</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Add/edit grades + averages</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm font-medium mb-3">Averages by term</div>
          {avgByTerm.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-slate-300">No data.</div>
          ) : (
            <div className="space-y-2">
              {avgByTerm.map((r) => (
                <div key={r.term} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{r.term}</span>
                  <span className="font-semibold">{r.avg.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {canManage && (
          <form
            onSubmit={submitCreate}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-sm font-medium mb-3">Add grade</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-slate-700 dark:text-slate-200">Student ID</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                  value={form.studentId}
                  onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
                  type="number"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700 dark:text-slate-200">Subject</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700 dark:text-slate-200">Score</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                  value={form.score}
                  onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
                  type="number"
                  step="0.01"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700 dark:text-slate-200">Term</span>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                  value={form.term}
                  onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
                />
              </label>
            </div>
            {error && <div className="text-red-600 text-sm mt-3">{error}</div>}
            <button className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium">
              Add grade
            </button>
          </form>
        )}
      </div>

      {error && !canManage && <div className="text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">Loading…</div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Student</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Score</th>
                <th className="p-3">Term</th>
              </tr>
            </thead>
            <tbody>
              {items.map((g) => (
                <tr key={g.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-3 font-medium">{g.id}</td>
                  <td className="p-3">{g.studentId}</td>
                  <td className="p-3">{g.subject}</td>
                  <td className="p-3 font-semibold">{Number(g.score).toFixed(2)}</td>
                  <td className="p-3">{g.term ?? '—'}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-3 text-slate-600">
                    No grades yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

