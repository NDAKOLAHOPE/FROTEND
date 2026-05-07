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
      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-64 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-brand-200/40 lg:bg-gradient-to-b lg:from-brand-50/80 lg:to-white/60 lg:backdrop-blur dark:lg:border-brand-900/30 dark:lg:from-slate-900/60 dark:lg:to-slate-950/40">
          <div className="h-full p-6 flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🎓</span>
                <div>
                  <div className="text-base font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">School Pro</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{role}</div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <Sidebar role={role} onNavigate={() => {}} />
            </div>
            <div className="pt-4 border-t border-brand-200/30 dark:border-brand-900/20">
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar */}
        <div className="lg:hidden">
          <div
            className={mobileOpen ? 'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm' : 'hidden'}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={mobileOpen
              ? 'fixed left-0 top-0 z-50 h-full w-72 bg-gradient-to-b from-brand-50/95 to-white/95 dark:from-slate-900/95 dark:to-slate-950/95 p-6 border-r border-brand-200/40 dark:border-brand-900/30 backdrop-blur-xl transition-transform duration-300'
              : 'fixed left-0 top-0 z-50 h-full w-72 bg-gradient-to-b from-brand-50/95 to-white/95 dark:from-slate-900/95 dark:to-slate-950/95 p-6 border-r border-brand-200/40 dark:border-brand-900/30 -translate-x-full transition-transform backdrop-blur-xl'
            }
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎓</span>
                <div>
                  <div className="text-sm font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">School Pro</div>
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
            </div>
            <Sidebar role={role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-gradient-to-r from-white/60 to-brand-50/40 dark:from-slate-950/40 dark:to-slate-900/30 backdrop-blur-xl border-b border-brand-200/30 dark:border-brand-900/30">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <Button 
                  variant="soft" 
                  className="lg:hidden px-3 py-2" 
                  onClick={() => setMobileOpen(true)}
                >
                  ☰ Menu
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

          {/* Main Content */}
          <main className="flex-1 px-4 py-8 lg:px-8 overflow-auto">
            <div className="mx-auto max-w-7xl w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

