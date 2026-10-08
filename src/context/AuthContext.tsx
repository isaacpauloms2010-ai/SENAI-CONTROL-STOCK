import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, CompanyInfo } from '../types/index.js';
import { api, setActiveUserHeader } from '../services/api.js';

interface AuthContextType {
  currentUser: User | null;
  company: CompanyInfo | null;
  allUsers: User[];
  isLoading: boolean;
  login: (email?: string, userId?: string) => Promise<void>;
  switchUser: (user: User) => void;
  createNewUser: (data: Partial<User>) => Promise<User>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [authRes, usersRes] = await Promise.all([
        api.getCurrentUser(),
        api.getUsers()
      ]);
      setCurrentUser(authRes.user);
      setCompany(authRes.company);
      setAllUsers(usersRes);
      if (authRes.user) {
        setActiveUserHeader(authRes.user.id);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de autenticação:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const login = async (email?: string, userId?: string) => {
    const res = await api.loginUser({ email, userId });
    if (res.user) {
      setCurrentUser(res.user);
      setActiveUserHeader(res.user.id);
      await refreshUsers();
    }
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    setActiveUserHeader(user.id);
  };

  const createNewUser = async (data: Partial<User>) => {
    const created = await api.createUser(data);
    await refreshUsers();
    switchUser(created);
    return created;
  };

  const refreshUsers = async () => {
    const users = await api.getUsers();
    setAllUsers(users);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        company,
        allUsers,
        isLoading,
        login,
        switchUser,
        createNewUser,
        refreshUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
