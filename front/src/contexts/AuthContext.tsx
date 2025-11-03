import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, LoginResponse, TwoFactorResponse } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  twoFactorEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<LoginResponse>;
  verify2FA: (userId: number, token: string) => Promise<TwoFactorResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
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
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
      console.log('AuthContext: Calling authAPI.login...');
      const response = await authAPI.login({ username, password });
      console.log('AuthContext: Login response received:', response);
      
      // Only set user/token if login is completely successful (no 2FA required)
      if (response.token && response.user && !response.requiresTwoFactor) {
        console.log('AuthContext: Setting user/token for successful login');
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        console.log('AuthContext: Not setting user/token - requires 2FA or incomplete response');
      }
      
      return response;
    } catch (error: any) {
      console.log('AuthContext: Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const verify2FA = async (userId: number, token: string): Promise<TwoFactorResponse> => {
    try {
      const response = await authAPI.verify2FA({ userId, token });
      
      // Only set user/token if 2FA verification is successful
      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '2FA verification failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    login,
    verify2FA,
    logout,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
