import { useState, useEffect } from 'react';
import { LoginResponse } from '../types/models';
import { ApiService } from '../lib/api/apiService';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<LoginResponse['user'] | null>(null);
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await ApiService.login(email, password);
      if (data && data.success) {
        setLoginStatus('Login successful');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        return true;
      } else {
        setLoginStatus('Login failed');
        return false;
      }
    } catch (error) {
      setLoginStatus('Error occurred during login');
      console.error('Error occurred during login:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginStatus('Logged out successfully');
  };

  return { isLoggedIn, currentUser, loginStatus, login, logout };
};