import { useEffect, useMemo, useState } from 'react';
import { http } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function MessagesPage() {
  const { role } = useAuth();
  const canManage = role === 'ADMIN' || role === 'TEACHER';

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [parentId, setParentId] = useState('');
  const [draft, setDraft] = useState('');

  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const loadStudents = async () => {
    const url = role === 'PARENT' ? '/students/my' : '/students';
    const res = await http.get(url);
    setStudents(res.data);
    if (!selectedStudentId && res.data?.[0]?.id) setSelectedStudentId(String(res.data[0].id));
  };

  const loadMessages = async () => {
    if (!selectedStudentId) return;
    const res = await http.get(`/messages?studentId=${encodeURIComponent(selectedStudentId)}`);
    setItems(res.data);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (alive) await loadStudents();
      } catch (e) {
        if (alive) setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!alive) return;
        await loadMessages();
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId, role]);

  const send = async () => {
    setError(null);
    try {
      const payload = canManage
        ? { studentId: Number(selectedStudentId), parentId: Number(parentId), message: draft }
        : { studentId: Number(selectedStudentId), message: draft };
      await http.post('/messages', payload);
      setDraft('');
      await loadMessages();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Messages</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Parent-teacher communication</p>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-200">Student</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} (#{s.id})
                </option>
              ))}
            </select>
          </label>

          {canManage && (
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Parent ID</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                type="number"
                placeholder="e.g. 1"
              />
            </label>
          )}

          <div className="flex flex-col gap-2">
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">New message</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 min-h-[40px] dark:border-slate-800 dark:bg-slate-950"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write your message…"
              />
            </label>
            <button
              type="button"
              onClick={send}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-sm font-medium mb-3">Conversation</div>
        {items.length === 0 ? (
          <div className="text-sm text-slate-600 dark:text-slate-300">No messages.</div>
        ) : (
          <div className="space-y-3">
            {[...items].reverse().map((m) => (
              <div
                key={m.id}
                className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Parent #{m.parentId} • {m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'}
                </div>
                <div className="mt-1 text-sm">{m.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

