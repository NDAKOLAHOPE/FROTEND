import { NavLink } from 'react-router-dom';

const linkBase = [
  { to: '/dashboard', label: '📊 Dashboard', roles: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'] },
  { to: '/students', label: '👥 Students', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/grades', label: '📈 Grades', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/payments', label: '💳 Payments', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/messages', label: '💬 Messages', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/notifications', label: '🔔 Notifications', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
];

export default function Sidebar({ role, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {linkBase
        .filter((l) => l.roles.includes(role))
        .map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out',
                'hover:translate-x-1 hover:shadow-md',
                isActive
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                  : 'text-slate-700 hover:bg-brand-50/80 hover:text-brand-900 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-slate-100',
              ].join(' ')
            }
          >
            {l.label}
          </NavLink>
        ))}
    </nav>
  );
}

