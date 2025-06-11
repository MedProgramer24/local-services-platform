import { createContext, useContext, useState, ReactNode } from 'react';

export type User = {
  id: string;
  email: string;
  name: string;
  type: 'customer' | 'provider';
  city?: string;
  phone: string;
  // Additional provider fields
  contactName?: string;
  cities?: string[];
  serviceCategories?: string[];
  description?: string;
  commercialRegistration?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, type: 'customer' | 'provider') => Promise<void>;
  register: (userData: Partial<User> & { password: string; type: 'customer' | 'provider' }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string, type: 'customer' | 'provider') => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Make API call to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, type }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle field-specific errors
        if (data.fields) {
          const fieldErrors = Object.entries(data.fields)
            .filter(([_, message]) => message)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          throw new Error(fieldErrors || data.message || 'فشل تسجيل الدخول');
        }
        throw new Error(data.message || 'فشل تسجيل الدخول');
      }

      // Store user data and token
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        type: data.user.type,
        phone: data.user.phone,
        city: data.user.city,
        // Additional provider fields
        ...(data.user.type === 'provider' && {
          contactName: data.user.contactName,
          cities: data.user.cities,
          serviceCategories: data.user.serviceCategories,
          description: data.user.description,
          commercialRegistration: data.user.commercialRegistration,
        }),
      };

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string; type: 'customer' | 'provider' }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Make API call to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle field-specific errors
        if (data.fields) {
          const fieldErrors = Object.entries(data.fields)
            .filter(([_, message]) => message)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          throw new Error(fieldErrors || data.message || 'فشل إنشاء الحساب');
        }
        throw new Error(data.message || 'فشل إنشاء الحساب');
      }

      // Store user data and token
      const newUser: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        type: data.user.type,
        phone: data.user.phone,
        city: data.user.city,
        // Additional provider fields
        ...(data.user.type === 'provider' && {
          contactName: data.user.contactName,
          cities: data.user.cities,
          serviceCategories: data.user.serviceCategories,
          description: data.user.description,
          commercialRegistration: data.user.commercialRegistration,
        }),
      };

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء الحساب';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear user data and token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 