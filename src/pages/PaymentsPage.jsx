import { useEffect, useState } from 'react';
import { http } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function PaymentsPage() {
  const { role } = useAuth();
  const [items, setItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const canManage = role === 'ADMIN' || role === 'TEACHER';
  const isAdmin = role === 'ADMIN';

  const [form, setForm] = useState({
    studentId: '',
    amount: '',
    paymentDate: '',
    status: 'PENDING',
  });

  const refresh = async () => {
    const url = role === 'PARENT' ? '/payments/my' : '/payments';
    const res = await http.get(url);
    setItems(res.data);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        await refresh();
        if (canManage) {
          const studentsRes = await http.get('/students');
          if (!alive) return;
          setStudents(studentsRes.data);
          if (!form.studentId && studentsRes.data?.[0]?.id) {
            setForm((f) => ({ ...f, studentId: String(studentsRes.data[0].id) }));
          }
        }
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

  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        studentId: Number(form.studentId),
        amount: Number(form.amount),
        paymentDate: form.paymentDate || undefined,
        ...(isAdmin ? { status: form.status } : {}),
      };
      if (editingId) {
        await http.patch(`/payments/${editingId}`, payload);
      } else {
        await http.post('/payments', payload);
      }
      setForm((f) => ({ ...f, amount: '', paymentDate: '', status: 'PENDING' }));
      setEditingId(null);
      await refresh();
    } catch (e2) {
      setError(e2?.response?.data?.message ?? e2?.message ?? 'Erreur');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await http.patch(`/payments/${id}/status`, { status });
      await refresh();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    }
  };

  const startEdit = (payment) => {
    setEditingId(payment.id);
    setForm({
      studentId: String(payment.studentId),
      amount: String(payment.amount),
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().slice(0, 16) : '',
      status: payment.status ?? 'PENDING',
    });
  };

  const removeItem = async (id) => {
    try {
      await http.delete(`/payments/${id}`);
      await refresh();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Payments</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Gestion des paiements, edition/suppression et statut reserve a l'admin
        </p>
      </div>

      {canManage && (
        <form
          onSubmit={submitCreate}
          className="rounded-2xl border border-slate-200 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/80"
        >
          <div className="text-sm font-medium mb-3">{editingId ? 'Update payment' : 'Add payment'}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block sm:col-span-2">
              <span className="text-sm text-slate-700 dark:text-slate-200">Student</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                value={form.studentId}
                onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
                required
              >
                <option value="" disabled>
                  Select student
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} (#{s.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Amount</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                type="number"
                step="0.01"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Payment date</span>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                value={form.paymentDate}
                onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))}
              />
            </label>
            {isAdmin && (
              <label className="block">
                <span className="text-sm text-slate-700 dark:text-slate-200">Status</span>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                </select>
              </label>
            )}
          </div>
          {error && <div className="text-red-600 text-sm mt-3">{error}</div>}
          <div className="mt-4 flex gap-2">
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium">
              {editingId ? 'Save changes' : 'Create payment'}
            </button>
            {editingId && (
              <button
                type="button"
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium dark:bg-slate-800"
                onClick={() => {
                  setEditingId(null);
                  setForm((f) => ({ ...f, amount: '', paymentDate: '', status: 'PENDING' }));
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {error && !canManage && <div className="text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white/85 dark:border-slate-800 dark:bg-slate-900/80 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Student</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment date</th>
                <th className="p-3">Status</th>
                {canManage && <th className="p-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-3 font-medium">{p.id}</td>
                  <td className="p-3">{p.studentId}</td>
                  <td className="p-3 font-semibold">{Number(p.amount).toFixed(2)}</td>
                  <td className="p-3">{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : '-'}</td>
                  <td className="p-3">
                    <span
                      className={
                        p.status === 'PAID'
                          ? 'inline-flex px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs'
                          : 'inline-flex px-2 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs'
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="p-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="px-3 py-1 rounded-md bg-indigo-600 text-white text-xs"
                          onClick={() => startEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded-md bg-rose-600 text-white text-xs"
                          onClick={() => removeItem(p.id)}
                        >
                          Delete
                        </button>
                        {isAdmin && p.status !== 'PAID' && (
                          <button
                            type="button"
                            className="px-3 py-1 rounded-md bg-emerald-600 text-white text-xs"
                            onClick={() => updateStatus(p.id, 'PAID')}
                          >
                            Mark paid
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="p-3 text-slate-600" colSpan={canManage ? 6 : 5}>
                    No payments yet.
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
