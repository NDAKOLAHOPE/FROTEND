import { useEffect, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

export default function PageShell({ children }) {
  const { user, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'light');
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="lg:flex">
        <aside className="hidden lg:block lg:w-72 lg:border-r lg:border-slate-200/70 lg:bg-white/70 lg:backdrop-blur dark:lg:border-slate-800/70 dark:lg:bg-slate-900/40">
          <div className="h-full p-4">
            <div className="mb-4">
              <div className="text-sm font-semibold">School Management</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{role}</div>
            </div>
            <Sidebar role={role} onNavigate={() => {}} />
          </div>
        </aside>

        {/* Mobile sidebar */}
        <div className="lg:hidden">
          <div
            className={mobileOpen ? 'fixed inset-0 z-40 bg-black/40' : 'hidden'}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={
              mobileOpen
                ? 'fixed left-0 top-0 z-50 h-full w-80 bg-white/95 dark:bg-slate-900/95 p-4 border-r border-slate-200/70 dark:border-slate-800/70 backdrop-blur'
                : 'fixed left-0 top-0 z-50 h-full w-80 bg-white/95 dark:bg-slate-900/95 p-4 border-r border-slate-200/70 dark:border-slate-800/70 -translate-x-full transition-transform backdrop-blur'
            }
          >
            <div className="mb-4">
              <div className="text-sm font-semibold">Menu</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email ?? '—'}</div>
            </div>
            <Sidebar role={role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>

        <div className="flex-1">
          <header className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-slate-200/70 dark:bg-slate-950/40 dark:border-slate-800/70">
            <div className="flex items-center justify-between px-4 py-3 lg:px-8">
              <div className="flex items-center gap-3">
                <Button variant="soft" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                  Menu
                </Button>
                <div>
                  <div className="text-sm font-semibold">Dashboard</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email ?? '—'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="soft" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </Button>
                <Button onClick={logout}>Logout</Button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 lg:px-8">
            <div className="mx-0 w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

