import { createContext, useContext, useState, useCallback } from 'react';
import Button from './Button.jsx';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        ...options,
        onConfirm: () => {
          setConfirmState(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(null);
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog state={confirmState} />
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({ state }) {
  if (!state) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-white/30 dark:border-slate-700/30">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{state.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{state.message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={state.onCancel}>
            {state.cancelText || 'Annuler'}
          </Button>
          <Button variant="danger" onClick={state.onConfirm}>
            {state.confirmText || 'Confirmer'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}