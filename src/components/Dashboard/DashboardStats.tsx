import React, { useMemo } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, PieChart, Calendar } from 'lucide-react';

const DashboardStats: React.FC = () => {
  const { transactions, getTotalExpense, categories, getTransactionsByCategory } = useExpense();
  
  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Total expenses this month
  const monthlyExpenses = useMemo(() => {
    return transactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonth, currentYear]);
  
  // Most expensive category
  const topCategory = useMemo(() => {
    const categoryTotals = categories.map(category => {
      const categoryTransactions = getTransactionsByCategory(category.id);
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      return { category, total };
    });
    
    return categoryTotals.sort((a, b) => b.total - a.total)[0];
  }, [categories, getTransactionsByCategory]);
  
  // Average transaction amount
  const averageAmount = useMemo(() => {
    if (transactions.length === 0) return 0;
    return getTotalExpense() / transactions.length;
  }, [transactions, getTotalExpense]);
  
  // Recent activity count (last 7 days)
  const recentActivityCount = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return transactions.filter(t => new Date(t.date) >= sevenDaysAgo).length;
  }, [transactions]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="stats-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Spent (This Month)
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{monthlyExpenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            For {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
          </p>
        </CardContent>
      </Card>
      
      <Card className="stats-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Highest Category
          </CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topCategory?.category.name || 'None'}</div>
          <p className="text-xs text-muted-foreground">
            ₹{topCategory?.total.toFixed(2) || '0.00'} total spent
          </p>
        </CardContent>
      </Card>
      
      <Card className="stats-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Transaction
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{averageAmount.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Across {transactions.length} transactions
          </p>
        </CardContent>
      </Card>
      
      <Card className="stats-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Recent Activity
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentActivityCount}</div>
          <p className="text-xs text-muted-foreground">
            Transactions in the last 7 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
