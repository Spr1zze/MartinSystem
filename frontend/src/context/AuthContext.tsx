import React, { createContext, useState, useCallback } from 'react';
import type { User, AuthContextType } from '../types';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProviderComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (studentId: string, password: string) => {
    // Mock authentication
    if (studentId && password) {
      const mockUser: User = {
        id: '1',
        name: 'John Student',
        studentId,
        group: 'Group A',
        isAdmin: false,
      };
      setUser(mockUser);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const loginAsAdmin = useCallback(async (password: string) => {
    // Mock admin authentication
    if (password === 'admin123') {
      if (user) {
        setUser({ ...user, isAdmin: true });
      } else {
        const adminUser: User = {
          id: 'admin',
          name: 'Admin User',
          studentId: 'ADMIN',
          isAdmin: true,
        };
        setUser(adminUser);
      }
    } else {
      throw new Error('Invalid admin password');
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    login,
    logout,
    loginAsAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider = AuthProviderComponent;
