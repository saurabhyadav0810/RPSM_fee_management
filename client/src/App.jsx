import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Student pages
import StudentsListPage from '@/pages/students/StudentsListPage';
import StudentFormPage from '@/pages/students/StudentFormPage';
import StudentProfilePage from '@/pages/students/StudentProfilePage';
import EditStudentPage from '@/pages/students/EditStudentPage';

// Payment pages
import PayFeePage from '@/pages/payments/PayFeePage';

// Fee collection
import FeeCollectionPage from '@/pages/fees/FeeCollectionPage';

const App = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#333', color: '#fff', borderRadius: '0.5rem', fontSize: '0.875rem' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/students" element={<StudentsListPage />} />
          <Route path="/students/new" element={<StudentFormPage />} />
          <Route path="/students/:id" element={<StudentProfilePage />} />
          <Route path="/students/:id/edit" element={<EditStudentPage />} />
          <Route path="/pay-fee" element={<PayFeePage />} />
          <Route path="/fee-collection" element={<FeeCollectionPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
