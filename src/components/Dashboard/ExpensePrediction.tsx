
import React, { useState, useEffect } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, addMonths, startOfMonth } from 'date-fns';

// For our dummy ML model
const ML_MODEL = {
  // Simulated prediction function using a simple linear regression on recent data
  predict: (historicalData: number[], months: number = 3): number[] => {
    // If no data or just one point, predict flat line based on that value
    if (!historicalData.length) return Array(months).fill(0);
    if (historicalData.length === 1) return Array(months).fill(historicalData[0]);
    
    // Simple trend calculation (average monthly change)
    const changes = [];
    for (let i = 1; i < historicalData.length; i++) {
      changes.push(historicalData[i] - historicalData[i-1]);
    }
    const avgChange = changes.reduce((sum, val) => sum + val, 0) / changes.length;
    
    // Generate predictions with some random variation
    const lastValue = historicalData[historicalData.length - 1];
    return Array(months).fill(0).map((_, i) => {
      const trend = lastValue + avgChange * (i + 1);
      // Add some randomness (±10%)
      const randomFactor = 0.9 + Math.random() * 0.2;
      return Math.max(0, trend * randomFactor);
    });
  }
};

const ExpensePrediction: React.FC = () => {
  const { transactions } = useExpense();
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // Group and sum transactions by month
    const monthlyTotals = new Map<string, number>();
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = format(date, 'yyyy-MM');
      
      const currentTotal = monthlyTotals.get(monthKey) || 0;
      monthlyTotals.set(monthKey, currentTotal + transaction.amount);
    });
    
    // Convert to array and sort by date
    const sortedMonthlyData = Array.from(monthlyTotals.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6); // Last 6 months
    
    // Extract just the amounts for prediction
    const historicalAmounts = sortedMonthlyData.map(([_, amount]) => amount);
    
    // Get predictions for the next 3 months
    const predictedAmounts = ML_MODEL.predict(historicalAmounts, 3);
    
    // Create chart data combining historical and predicted
    const chartData = [
      // Historical data
      ...sortedMonthlyData.map(([monthKey, amount]) => ({
        month: format(new Date(monthKey + "-01"), 'MMM yyyy'),
        amount: amount,
        type: 'Historical'
      })),
      
      // Predicted data for next 3 months
      ...predictedAmounts.map((amount, i) => {
        const lastDate = sortedMonthlyData.length 
          ? new Date(sortedMonthlyData[sortedMonthlyData.length - 1][0] + "-01") 
          : new Date();
        const futureDate = addMonths(startOfMonth(lastDate), i + 1);
        return {
          month: format(futureDate, 'MMM yyyy'),
          amount: amount,
          type: 'Predicted'
        };
      })
    ];
    
    setChartData(chartData);
  }, [transactions]);
  
  // Format currency as INR
  const formatINR = (value: number) => {
    return `₹${value.toFixed(2)}`;
  };
  
  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Expense Prediction (AI-Powered)</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value) => formatINR(Number(value))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                name="Historical"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="amount"
                name="Predicted"
                stroke="#82ca9d"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Not enough data for predictions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensePrediction;
