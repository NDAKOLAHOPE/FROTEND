import { useEffect, useState } from 'react';
import { http } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Parent-teacher communication</p>
      </div>

      {error && <div className="text-rose-600 text-sm">{error}</div>}

      <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 transition-all duration-300 hover:shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-200">Student</span>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
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
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
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
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 min-h-[40px] dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write your message…"
              />
            </label>
            <Button
              type="button"
              onClick={send}
            >
              Send
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 transition-all duration-300 hover:shadow-xl">
        <div className="text-sm font-semibold mb-3 text-slate-900 dark:text-white">Conversation</div>
        {items.length === 0 ? (
          <div className="text-sm text-slate-600 dark:text-slate-400">No messages.</div>
        ) : (
          <div className="space-y-3">
            {[...items].reverse().map((m) => (
              <div
                key={m.id}
                className="rounded-xl bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-slate-800/50 dark:to-slate-700/50 p-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Parent #{m.parentId} • {m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'}
                </div>
                <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{m.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}