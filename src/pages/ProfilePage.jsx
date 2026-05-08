import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mon Profil</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Gérez vos informations personnelles</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md'
              : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/80'
          }`}
        >
          Profil
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md'
              : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/80'
          }`}
        >
          Paramètres
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.email}</h3>
              <span className="inline-flex px-3 py-1 rounded-full bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium mt-1">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Email" value={user?.email ?? ''} readOnly />
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Rôle
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
                {user?.role}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="ghost" onClick={logout}>
              Déconnexion
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Paramètres</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/20 dark:border-slate-700/20">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Notifications</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Recevoir les alertes par email</div>
              </div>
              <label className="relative inline-flex h-6 w-11 cursor-pointer">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <span className="peer-checked:bg-primary-500 block h-6 w-11 rounded-full bg-slate-300 dark:bg-slate-600 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5" />
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/20 dark:border-slate-700/20">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Mode sombre</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Thème sombre automatique</div>
              </div>
              <label className="relative inline-flex h-6 w-11 cursor-pointer">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <span className="peer-checked:bg-primary-500 block h-6 w-11 rounded-full bg-slate-300 dark:bg-slate-600 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-5" />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}