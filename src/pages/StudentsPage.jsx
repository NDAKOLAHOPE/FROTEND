import { useEffect, useMemo, useState } from 'react';
import { http } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function StudentsPage() {
  const { role } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const canManage = role === 'ADMIN' || role === 'TEACHER';

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    className: '',
  });

  const [progressItems, setProgressItems] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressNote, setProgressNote] = useState('');
  const [progressStudentId, setProgressStudentId] = useState('');
  const [progressError, setProgressError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const url = role === 'PARENT' ? '/students/my' : '/students';
        const res = await http.get(url);
        if (!alive) return;
        setStudents(res.data);
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

  useEffect(() => {
    if (!progressStudentId && students.length > 0) {
      setProgressStudentId(String(students[0].id));
    }
  }, [students, progressStudentId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setProgressLoading(true);
        setProgressError(null);

        if (role === 'PARENT') {
          const res = await http.get('/progress/my');
          if (!alive) return;
          setProgressItems(res.data);
          return;
        }

        if (!progressStudentId) {
          if (!alive) return;
          setProgressItems([]);
          return;
        }

        const res = await http.get(`/progress?studentId=${encodeURIComponent(progressStudentId)}`);
        if (!alive) return;
        setProgressItems(res.data);
      } catch (e) {
        if (!alive) return;
        setProgressError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
      } finally {
        if (alive) setProgressLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [role, progressStudentId]);

  const submitProgress = async () => {
    setProgressError(null);
    try {
      await http.post('/progress', {
        studentId: Number(progressStudentId),
        note: progressNote,
      });
      setProgressNote('');

      // reload
      if (role === 'PARENT') {
        const res = await http.get('/progress/my');
        setProgressItems(res.data);
      } else {
        const res = await http.get(`/progress?studentId=${encodeURIComponent(progressStudentId)}`);
        setProgressItems(res.data);
      }
    } catch (e) {
      setProgressError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      await http.post('/students', {
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob ? form.dob : undefined,
        className: form.className ? form.className : undefined,
      });
      setForm({ firstName: '', lastName: '', dob: '', className: '' });
      const res = await http.get(role === 'PARENT' ? '/students/my' : '/students');
      setStudents(res.data);
    } catch (e2) {
      setError(e2?.response?.data?.message ?? e2?.message ?? 'Erreur');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Students</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">CRUD + parent assignment</p>
      </div>

      {canManage && (
        <form
          onSubmit={submitCreate}
          className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">First name</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Last name</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">DOB</span>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                value={form.dob}
                onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Class</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                value={form.className}
                onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))}
                placeholder="e.g. 6A"
              />
            </label>
          </div>
          <button className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium">
            Create student
          </button>
        </form>
      )}

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">Loading…</div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">DOB</th>
                <th className="p-3">Class</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-3 font-medium">{s.id}</td>
                  <td className="p-3">{s.firstName} {s.lastName}</td>
                  <td className="p-3">{s.dob ? new Date(s.dob).toLocaleDateString() : '—'}</td>
                  <td className="p-3">{s.className ?? '—'}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td className="p-3 text-slate-600" colSpan="4">
                    No students yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Progress notes */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Progress notes</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Suivi de l'évolution (progress)
            </div>
          </div>
        </div>

        {progressError && <div className="text-red-600 text-sm">{progressError}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-200">Student</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
              value={progressStudentId}
              onChange={(e) => setProgressStudentId(e.target.value)}
              disabled={students.length === 0}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} (#{s.id})
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-slate-700 dark:text-slate-200">Note</span>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 min-h-[80px] dark:border-slate-800 dark:bg-slate-950"
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              placeholder="Ex: Amélioration sur le trimestre, objectif atteint..."
            />
          </label>

          <button
            type="button"
            onClick={submitProgress}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium"
            disabled={students.length === 0 || !progressNote.trim() || !progressStudentId}
          >
            Save progress
          </button>
        </div>

        <div className="pt-2">
          {progressLoading ? (
            <div className="text-sm text-slate-600 dark:text-slate-300">Loading…</div>
          ) : progressItems.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-slate-300">No progress notes.</div>
          ) : (
            <div className="space-y-2">
              {progressItems.slice(0, 10).map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Student #{p.studentId} •{' '}
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}
                  </div>
                  <div className="mt-1 text-sm whitespace-pre-wrap">{p.note ?? '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

