import { NavLink } from 'react-router-dom';

const linkBase = [
  { to: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'] },
  { to: '/students', label: 'Students', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/grades', label: 'Grades', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/payments', label: 'Payments', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/messages', label: 'Messages', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/notifications', label: 'Notifications', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
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
                'px-3 py-2 rounded-md text-sm font-medium transition',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
              ].join(' ')
            }
          >
            {l.label}
          </NavLink>
        ))}
    </nav>
  );
}

