
import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import TransactionList from '@/components/Transactions/TransactionList';
import { useExpense } from '@/context/ExpenseContext';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

const Transactions = () => {
  const { transactions, getTotalExpense, formatCurrency } = useExpense();
  
  // Get current month's transactions
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });
  
  const totalExpense = getTotalExpense();
  const monthlyTotal = currentMonthTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );
  
  return (
    <AppLayout requireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-gray-600">View and manage all your expense records</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">
                  Total Expenses
                </p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(totalExpense)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">
                  {format(currentDate, 'MMMM yyyy')} Expenses
                </p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(monthlyTotal)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">
                  Total Transactions
                </p>
                <p className="text-3xl font-bold mt-1">
                  {transactions.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <TransactionList />
      </div>
    </AppLayout>
  );
};

export default Transactions;
