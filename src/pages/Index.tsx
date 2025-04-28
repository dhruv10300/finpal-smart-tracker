
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/Layout/AppLayout';
import { ArrowRight, BarChart4, CreditCard, LineChart, PiggyBank, Shield } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <AppLayout>
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Take Control of Your Financial Future
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              FinPal helps you track expenses, analyze spending patterns, and build better financial habits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button size="lg" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/register')}>
                    Get Started for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                    Login to Your Account
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose FinPal</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-primary-100 p-3 rounded-full mb-4">
                <BarChart4 className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expense Tracking</h3>
              <p className="text-gray-600">
                Easily record and categorize your daily expenses to understand where your money goes
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-primary-100 p-3 rounded-full mb-4">
                <LineChart className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-600">
                Visualize your spending patterns with beautiful charts and gain financial insights
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-primary-100 p-3 rounded-full mb-4">
                <PiggyBank className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Budget Planning</h3>
              <p className="text-gray-600">
                Set budgeting goals and track your progress to build stronger financial habits
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Managing Your Finances?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of users who have taken control of their financial future with FinPal
            </p>
            <Button size="lg" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Today'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Built for Security and Peace of Mind</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="bg-primary-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-primary-700" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                <p className="text-gray-600">
                  Your financial data is always private and secure. We never share your personal information.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="bg-primary-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-primary-700" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Bank-Level Security</h3>
                <p className="text-gray-600">
                  We use industry-standard encryption to ensure your financial data remains safe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default Index;
