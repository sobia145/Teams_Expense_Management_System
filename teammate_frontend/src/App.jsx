import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import AnalyticsPage from './pages/AnalyticsPage';
import BudgetPage from './pages/BudgetPage';
import Dashboard from './pages/Dashboard';
import ExpensePage from './pages/ExpensePage';
import GroupPage from './pages/GroupPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignupPage';
import NotFound from './pages/NotFound';
import SettlementPage from './pages/SettlementPage';

// Admin Global Views
import AdminUsersPage from './pages/AdminUsersPage';
import AdminGroupsPage from './pages/AdminGroupsPage';
import AdminExpensesPage from './pages/AdminExpensesPage';

const App = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups" element={<GroupPage />} />
            <Route path="/expenses" element={<ExpensePage />} />
            <Route path="/budgets" element={<BudgetPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settlement" element={<SettlementPage />} />
            
            {/* Admin Exclusive Ecosystem Routes */}
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/groups" element={<AdminGroupsPage />} />
            <Route path="/admin/expenses" element={<AdminExpensesPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
