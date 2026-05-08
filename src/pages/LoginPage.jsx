import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-100/50 via-white to-primary-50/30 dark:from-primary-900/20 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl" />
          <div className="absolute top-40 right-32 w-32 h-32 bg-primary-400/30 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-primary-500/30">
              🎓
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">Gestion Scolaire</span>
          </div>

          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Bienvenue de retour !
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-12 max-w-md">
            Accédez à votre espace de gestion pédagogique et suivez l'ensemble des données de votre établissement.
          </p>

          <div className="relative">
            <div className="w-full max-w-md mx-auto">
              <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/40 dark:border-slate-700/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-xs text-slate-500">Dashboard</div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-primary-300 to-accent-300 rounded-full w-3/4" />
                  <div className="h-4 bg-slate-300/50 rounded-full w-1/2" />
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="h-16 bg-primary-100/50 dark:bg-primary-900/30 rounded-xl" />
                    <div className="h-16 bg-accent-100/50 dark:bg-accent-900/30 rounded-xl" />
                    <div className="h-16 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 w-20 h-20 opacity-30">
                <svg viewBox="0 0 100 100" className="w-full h-full text-primary-500">
                  <path d="M20,50 L30,30 L40,50 L50,20 L60,50 L70,30 L80,50" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 opacity-40">
                <svg viewBox="0 0 100 100" className="w-full h-full text-accent-500">
                  <circle cx="30" cy="30" r="8" fill="currentColor" />
                  <circle cx="70" cy="40" r="6" fill="currentColor" />
                  <circle cx="50" cy="70" r="10" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-lg shadow-primary-500/30">
              🎓
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white">Gestion Scolaire</span>
          </div>

          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Connexion</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Entrez vos identifiants pour accéder à votre espace
            </p>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    placeholder="votre@email.com"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">📧</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 px-4 py-3 pr-12 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300">Se souvenir de moi</span>
                </label>
                <a href="#" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                  Mot de passe oublié ?
                </a>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50/80 dark:bg-rose-900/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/30">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600" />
              <span className="text-sm text-slate-500 dark:text-slate-400">ou</span>
              <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600" />
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all duration-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.93.46 3.74 1.24 5.33l3.62-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.86c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Connexion avec Google
            </button>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
              Vous n'avez pas de compte ?{' '}
              <span className="text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer">
                Contactez l'administrateur
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}