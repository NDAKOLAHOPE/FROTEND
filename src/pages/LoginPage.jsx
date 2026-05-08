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

  const [mode, setMode] = useState('login');
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
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-primary-50/30 dark:from-slate-950 dark:to-primary-950/20">
      <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
        <Card className="p-8 transition-all duration-300 hover:shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl mb-4 shadow-lg shadow-primary-500/30">
              🎓
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              School Management System
            </p>
          </div>

          <div className="flex gap-2 mb-6">
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

          <form onSubmit={submit} className="space-y-4">
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
              <div className="rounded-xl bg-rose-50/80 dark:bg-rose-900/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/30">
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
  );
}