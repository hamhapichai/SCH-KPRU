import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import apiClient from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Validate token by fetching user profile
          console.log('🔍 AuthContext: Checking auth with token');
          const response = await apiClient.get('/auth/me');
          console.log('🔍 AuthContext: /auth/me response:', response.data);
          
          // Transform backend response to match User interface
          const userData: User = {
            userId: parseInt(response.data.userId) || 0,
            username: response.data.username || '',
            email: response.data.email || '',
            firstName: response.data.name || '',
            lastName: response.data.lastname || '',
            bio: '',
            roleId: 0,
            roleName: response.data.role || '',
            departmentId: response.data.departmentId && response.data.departmentId !== '' ? parseInt(response.data.departmentId) : undefined,
            departmentName: '',
            lastLoginAt: undefined,
            isActive: true,
            createdAt: new Date().toISOString()
          };
          
          console.log('🔍 AuthContext: Parsed userData:', userData);
          setUser(userData);
        }
      } catch (error) {
        console.error('❌ AuthContext: Auth check failed:', error);
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });

      const { token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      
      // Fetch complete user data using the token
      console.log('🔍 AuthContext: Fetching user data after login');
      const userResponse = await apiClient.get('/auth/me');
      console.log('🔍 AuthContext: Login /auth/me response:', userResponse.data);
      
      // Transform backend response to match User interface
      const userData: User = {
        userId: parseInt(userResponse.data.userId) || 0,
        username: userResponse.data.username || '',
        email: userResponse.data.email || '',
        firstName: userResponse.data.name || '',
        lastName: userResponse.data.lastname || '',
        bio: '',
        roleId: 0,
        roleName: userResponse.data.role || '',
        departmentId: userResponse.data.departmentId && userResponse.data.departmentId !== '' ? parseInt(userResponse.data.departmentId) : undefined,
        departmentName: '',
        lastLoginAt: undefined,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      console.log('🔍 AuthContext: Login parsed userData:', userData);
      
      // Set user data
      setUser(userData);
      
      // Return user data for conditional redirect
      return userData;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
        ? String(error.response.data.message)
        : 'เข้าสู่ระบบไม่สำเร็จ';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};