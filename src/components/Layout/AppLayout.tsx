
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  requireAuth = false 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-8 mx-auto bg-primary-500 rounded-full mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} FinPal - Personal Expense Tracker
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
