import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  monthlySalary?: number;
  financialGoals?: {
    savings?: number;
    investment?: number;
    emergency?: number;
    retirement?: number;
  };
  ageGroup?: 'young' | 'adult' | 'senior';
}

// Define the auth context shape
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial dummy users for demo purposes
const DUMMY_USERS: User[] = [
  { id: '1', name: 'Demo User', email: 'demo@example.com' },
];

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session on component mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('finpal_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API request
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      // For demo purposes, check against our dummy users
      const foundUser = DUMMY_USERS.find(u => u.email === email);
      
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('finpal_user', JSON.stringify(foundUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API request
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      // Create a new user (in a real app this would be done by the server)
      const newUser: User = {
        id: `${Date.now()}`, // Generate random ID
        name,
        email,
      };
      
      setUser(newUser);
      localStorage.setItem('finpal_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('finpal_user');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading,
        login,
        register,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
