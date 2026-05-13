import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import { ConfirmProvider } from './components/ui/ConfirmDialog.jsx';
import RequireAuth from './components/auth/RequireAuth.jsx';
import PageShell from './components/layout/PageShell.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import EnrollmentsPage from './pages/EnrollmentsPage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import ExamsPage from './pages/ExamsPage.jsx';
import ReportCardsPage from './pages/ReportCardsPage.jsx';
import GradesPage from './pages/GradesPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
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
        path="/enrollments"
        element={
          <RequireAuth>
            <PageShell>
              <EnrollmentsPage />
            </PageShell>
          </RequireAuth>
        }
      />
      <Route
        path="/attendance"
        element={
          <RequireAuth>
            <PageShell>
              <AttendancePage />
            </PageShell>
          </RequireAuth>
        }
      />
      <Route
        path="/exams"
        element={
          <RequireAuth>
            <PageShell>
              <ExamsPage />
            </PageShell>
          </RequireAuth>
        }
      />
      <Route
        path="/report-cards"
        element={
          <RequireAuth>
            <PageShell>
              <ReportCardsPage />
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
      <Route
        path="/users"
        element={
          <RequireAuth>
            <PageShell>
              <UsersPage />
            </PageShell>
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <PageShell>
              <ProfilePage />
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
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}