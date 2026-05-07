import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PARENT');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState(null);

  const title = useMemo(() => (mode === 'login' ? 'Connexion' : 'Créer un compte'), [mode]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        await login({ email, password });
        navigate('/dashboard');
      } else {
        await register({ email, password, role, adminKey: adminKey || undefined });
        setMode('login');
      }
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Erreur');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-0 w-full px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-md mx-auto">
          <Card className="p-6 sm:p-7 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  School Management System
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                variant={mode === 'login' ? 'primary' : 'soft'}
                className="flex-1"
                onClick={() => setMode('login')}
              >
                Login
              </Button>
              <Button
                variant={mode === 'register' ? 'primary' : 'soft'}
                className="flex-1"
                onClick={() => setMode('register')}
              >
                Register
              </Button>
            </div>

            {/* IMPORTANT: no left/right margins on forms */}
            <form onSubmit={submit} className="mt-5 mx-0 w-full space-y-3">
              <Input
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
              />

              <Input
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={8}
              />

              {mode === 'register' && (
                <>
                  <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="ADMIN">ADMIN</option>
                    <option value="TEACHER">TEACHER</option>
                    <option value="PARENT">PARENT</option>
                    <option value="STUDENT">STUDENT</option>
                  </Select>

                  <Input
                    label="Admin key (optional)"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    type="password"
                    placeholder="Only for ADMIN"
                  />
                </>
              )}

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-200">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full">
                {mode === 'login' ? 'Login' : 'Create account'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

