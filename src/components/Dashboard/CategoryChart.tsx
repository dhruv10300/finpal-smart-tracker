
import React, { useMemo } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CategoryChart: React.FC = () => {
  const { transactions, categories } = useExpense();
  
  const categoryData = useMemo(() => {
    const categoryAmounts = new Map<string, number>();
    
    // Initialize all categories with 0
    categories.forEach(category => {
      categoryAmounts.set(category.id, 0);
    });
    
    // Sum up all transactions by category
    transactions.forEach(transaction => {
      const currentAmount = categoryAmounts.get(transaction.categoryId) || 0;
      categoryAmounts.set(transaction.categoryId, currentAmount + transaction.amount);
    });
    
    // Convert to array for the chart
    return Array.from(categoryAmounts.entries())
      .map(([id, value]) => {
        const category = categories.find(c => c.id === id);
        return {
          name: category?.name || 'Unknown',
          value,
          color: category?.color || '#cccccc'
        };
      })
      .filter(item => item.value > 0) // Only include categories with spending
      .sort((a, b) => b.value - a.value); // Sort by highest amount
  }, [transactions, categories]);
  
  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No spending data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
