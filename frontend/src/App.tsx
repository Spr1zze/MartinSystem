
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './hooks';
import {
  Sidebar,
  NotificationContainer,
} from './components';
import {
  LoginPage,
  DashboardPage,
  InventoryPage,
  ScannerPage,
  WorkLoggingPage,
  AdminPanel,
} from './pages';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-bg-neutral flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 p-4 md:p-8">
        <div className="bg-primary-light rounded-lg p-6 md:p-8">
          <Outlet />
        </div>
      </div>

      <NotificationContainer />
    </div>
  );
};

const AdminRoute = () => {
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return <AdminPanel />;
};

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/logging" element={<WorkLoggingPage />} />
            <Route path="/admin-login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminRoute />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
