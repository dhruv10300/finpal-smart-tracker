import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import CategoryChart from '@/components/Dashboard/CategoryChart';
import RecentTransactions from '@/components/Dashboard/RecentTransactions';
import ExpensePrediction from '@/components/Dashboard/ExpensePrediction';
import ModelPerformance from '@/components/Dashboard/ModelPerformance';
import InvestmentRecommendations from '@/components/Dashboard/InvestmentRecommendations';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <AppLayout requireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-gray-600">
              Here's an overview of your financial activity
            </p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0" 
            onClick={() => navigate('/transactions/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>
        
        <div className="mb-8">
          <DashboardStats />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CategoryChart />
          <ExpensePrediction />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>
          <div>
            <ModelPerformance />
          </div>
        </div>
        
        <div className="mb-8">
          <InvestmentRecommendations />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
