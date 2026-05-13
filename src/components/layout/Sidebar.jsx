import { NavLink } from 'react-router-dom';

const linkBase = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/students', label: 'Students', icon: '👥', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/enrollments', label: 'Enrollments', icon: '📝', roles: ['ADMIN', 'TEACHER'] },
  { to: '/attendance', label: 'Attendance', icon: '✅', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/exams', label: 'Exams', icon: '📝', roles: ['ADMIN', 'TEACHER'] },
  { to: '/grades', label: 'Grades', icon: '📈', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/report-cards', label: 'Report Cards', icon: '🎓', roles: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT'] },
  { to: '/payments', label: 'Payments', icon: '💳', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/messages', label: 'Messages', icon: '💬', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/notifications', label: 'Notifications', icon: '🔔', roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { to: '/users', label: 'Users', icon: '👤', roles: ['ADMIN'] },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar({ role, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1.5">
      {linkBase
        .filter((l) => !l.roles || l.roles.includes(role))
        .map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium',
                'transition-all duration-300 ease-out',
                'hover:bg-white/60 dark:hover:bg-slate-800/60',
                isActive
                  ? 'text-white bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg shadow-primary-500/30 sidebar-active-glow'
                  : 'text-slate-700 hover:text-primary-700 dark:text-slate-300 dark:hover:text-primary-300',
              ].join(' ')
            }
          >
            <span className="text-lg">{l.icon}</span>
            <span>{l.label}</span>
            <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary-400 to-accent-400 rounded-r-full scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300" />
          </NavLink>
        ))}
    </nav>
  );
}