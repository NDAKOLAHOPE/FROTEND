import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: '📊',
      title: 'Dashboard Analytics',
      description: 'Real-time insights and statistics for informed decisions',
    },
    {
      icon: '👥',
      title: 'Student Management',
      description: 'Complete student profiles with progression tracking',
    },
    {
      icon: '📈',
      title: 'Grade Analytics',
      description: 'Comprehensive grading system with term analytics',
    },
    {
      icon: '💳',
      title: 'Payment Tracking',
      description: 'Streamlined payment management with status tracking',
    },
    {
      icon: '💬',
      title: 'Communication',
      description: 'Seamless parent-teacher messaging platform',
    },
    {
      icon: '🔔',
      title: 'Notifications',
      description: 'Automated alerts for important events',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-primary-50/30 dark:from-slate-950 dark:to-primary-950/20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        </div>

        <header className="relative z-10 px-6 py-8 lg:px-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-primary-500/30">
                🎓
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                School Pro
              </span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/login')}>
                Get Started
              </Button>
            </div>
          </nav>
        </header>

        <main className="relative z-10 px-6 lg:px-8 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                Modern School Management
                <span className="block bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                  Redefined
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
                Streamline your educational institution with our comprehensive platform. 
                Manage students, track grades, handle payments, and communicate seamlessly.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/login')}>
                  Start Free Trial
                </Button>
                <Button variant="soft" size="lg">
                  Watch Demo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{f.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-20 rounded-2xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 dark:from-primary-500/20 dark:to-accent-500/20 p-12 text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Ready to transform your school management?
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Join thousands of educators already using School Pro
              </p>
              <Button size="lg" onClick={() => navigate('/login')}>
                Get Started Now
              </Button>
            </div>
          </div>
        </main>

        <footer className="relative z-10 px-6 lg:px-8 py-8 border-t border-white/30 dark:border-slate-700/30">
          <div className="mx-auto max-w-7xl text-center text-sm text-slate-600 dark:text-slate-400">
            © 2026 School Pro. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}