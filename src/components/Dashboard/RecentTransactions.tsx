import React from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const RecentTransactions: React.FC = () => {
  const { transactions, getCategoryById } = useExpense();
  const navigate = useNavigate();
  
  // Sort transactions by date (newest first) and take the 5 most recent
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/transactions')}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => {
              const category = getCategoryById(transaction.categoryId);
              const transactionDate = new Date(transaction.date);
              const relativeDate = formatDistanceToNow(transactionDate, { addSuffix: true });
              
              return (
                <div key={transaction.id} className="flex items-center justify-between expense-card p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-2 h-10 rounded-full" 
                      style={{ backgroundColor: category?.color || '#cccccc' }}
                    ></div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {category?.name} • {relativeDate}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">
                    -₹{transaction.amount.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No recent transactions</p>
            <Button 
              variant="link" 
              onClick={() => navigate('/transactions/new')}
              className="mt-2"
            >
              Add your first transaction
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
