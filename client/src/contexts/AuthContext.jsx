import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/api/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getMe();
        if (response.data?.success) {
          setUser(response.data.data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (username, password) => {
      try {
        const response = await authService.login({ username, password });

        if (response.data?.success) {
          setUser(response.data.data.user);
          toast.success('Login successful!');
          navigate('/');
          return { success: true };
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Login failed. Please try again.';
        toast.error(message);
        return { success: false, message };
      }
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if logout API fails, clear local state
    }
    setUser(null);
    toast.success('Logged out successfully.');
    navigate('/login');
  }, [navigate]);

  const isAdmin = user?.role === 'admin';
  const isMainAdmin = user?.role === 'main_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        isMainAdmin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
