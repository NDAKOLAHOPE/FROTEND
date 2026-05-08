import { useEffect, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import Button from '../ui/Button.jsx';

export default function PageShell({ children }) {
  const { user, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'dark');
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen app-bg text-slate-900 dark:text-slate-100">
      <div className="flex">
        <aside className="hidden lg:flex lg:w-64 lg:sticky lg:top-0 lg:h-screen flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-r border-white/30 dark:border-slate-700/30">
          <div className="h-full p-6 flex flex-col">
            <div className="mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl shadow-lg shadow-primary-500/30">
                🎓
              </div>
              <div>
                <div className="text-base font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  School Pro
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{role}</div>
              </div>
            </div>
            <div className="flex-1">
              <Sidebar role={role} onNavigate={() => {}} />
            </div>
            <div className="mt-auto pt-4 border-t border-white/30 dark:border-slate-700/30">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                  {user?.email?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">{user?.email}</div>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:hidden">
          <div
            className={mobileOpen ? 'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm' : 'hidden'}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className={mobileOpen
              ? 'fixed left-0 top-0 z-50 h-full w-72 bg-white/90 dark:bg-slate-900/90 p-6 backdrop-blur-2xl border-r border-white/30 dark:border-slate-700/30 transition-transform duration-300 translate-x-0'
              : 'fixed left-0 top-0 z-50 h-full w-72 bg-white/90 dark:bg-slate-900/90 p-6 backdrop-blur-2xl border-r border-white/30 dark:border-slate-700/30 -translate-x-full transition-transform duration-300'
            }
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl">
                  🎓
                </div>
                <div className="text-sm font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  School Pro
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
            </div>
            <Sidebar role={role} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-white/30 dark:border-slate-700/30">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="soft"
                  className="lg:hidden px-3 py-2"
                  onClick={() => setMobileOpen(true)}
                >
                  ☰
                </Button>
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">School Management</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Professional Learning Dashboard</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="soft"
                  onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                  className="px-3 py-2 text-xs"
                >
                  {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                </Button>
                <Button onClick={logout} className="px-4 py-2 text-xs">Logout</Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-8 lg:px-8">
            <div className="mx-auto max-w-7xl w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}