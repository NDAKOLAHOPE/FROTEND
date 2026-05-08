import { useEffect, useState } from 'react';
import { http } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Select from '../components/ui/Select.jsx';

export default function UsersPage() {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
    roleUser: 'TEACHER',
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await http.get('/users');
      setUsers(res.data);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'ADMIN') loadUsers();
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await http.post('/users', {
        email: form.email,
        password: form.password,
        role: form.roleUser,
      });
      setForm({ email: '', password: '', roleUser: 'TEACHER' });
      await loadUsers();
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error');
    }
  };

  if (role !== 'ADMIN') return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Create and manage user accounts</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-5 transition-all duration-300 hover:shadow-xl"
      >
        <div className="text-sm font-semibold mb-4 text-slate-900 dark:text-white">Create new user</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-200">Email</span>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-200">Password</span>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 transition-all duration-300 focus:border-primary-500"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-200">Role</span>
<select
               value={form.roleUser}
               onChange={(e) => setForm((f) => ({ ...f, roleUser: e.target.value }))}
             >
               <option value="TEACHER">Teacher</option>
               <option value="PARENT">Parent</option>
               <option value="MERE">Mère</option>
               <option value="STUDENT">Student</option>
             </select>
          </label>
        </div>
        <div className="mt-5">
          <Button type="submit">Create user</Button>
        </div>
      </form>

      {error && <div className="text-rose-600 text-sm">{error}</div>}

      <div>
        <div className="text-lg font-semibold text-slate-900 dark:text-white mb-3">All users</div>
        {loading ? (
          <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>
        ) : (
          <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 overflow-hidden transition-all duration-300 hover:shadow-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-slate-800/50 dark:to-slate-700/50 border-b border-white/30 dark:border-slate-700/30">
                <tr>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">ID</th>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Email</th>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-200">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="transition-all duration-300 hover:bg-primary-50/50 dark:hover:bg-slate-800/50 border-b border-white/20 dark:border-slate-700/20 last:border-0">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{u.id}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-200">{u.email}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{u.role}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td className="p-4 text-slate-600 dark:text-slate-400 text-center" colSpan={3}>
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}