import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import RequireAuth from './components/auth/RequireAuth.jsx';
import PageShell from './components/layout/PageShell.jsx';

import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import GradesPage from './pages/GradesPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <PageShell>
              <DashboardPage />
            </PageShell>
          </RequireAuth>
        }
      />
      <Route
        path="/students"
        element={
          <RequireAuth>
            <PageShell>
              <StudentsPage />
            </PageShell>
          </RequireAuth>
        }
      />
      <Route
        path="/grades"
        element={
          <RequireAuth>
            <PageShell>
              <GradesPage />
            </PageShell>
          </RequireAuth>
        }
      />
      <Route
        path="/payments"
        element={
          <RequireAuth>
            <PageShell>
              <PaymentsPage />
            </PageShell>
          </RequireAuth>
        }
      />
      <Route
        path="/messages"
        element={
          <RequireAuth>
            <PageShell>
              <MessagesPage />
            </PageShell>
          </RequireAuth>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <PageShell>
              <NotificationsPage />
            </PageShell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}