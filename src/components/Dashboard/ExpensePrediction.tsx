import React, { useState, useEffect } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { format, addMonths, startOfMonth, subMonths, isAfter, subYears } from 'date-fns';
import { CalculatorIcon, TrendingUpIcon, Info } from 'lucide-react';

// Function to check if date is within last year
const isWithinLastYear = (date: Date): boolean => {
  const oneYearAgo = subYears(new Date(), 1);
  return isAfter(date, oneYearAgo);
};

// Enhanced ML model with category prediction
const ML_MODEL = {
  // Predict total expenses for future months
  predictTotal: (historicalData: number[], months: number = 3): number[] => {
    // Create default predictions if no data available
    if (!historicalData.length) {
      return Array(months).fill(5000); // Default prediction amount
    }
    
    if (historicalData.length === 1) {
      // If only one month of data, use that with small variations
      return Array(months).fill(0).map((_, i) => 
        historicalData[0] * (0.95 + (Math.random() * 0.2))
      );
    }
    
    // Use weighted average for recent months (more weight to recent months)
    const weights = [0.5, 0.3, 0.2]; // Most recent month gets higher weight
    const availableMonths = Math.min(historicalData.length, weights.length);
    const recentData = historicalData.slice(-availableMonths);
    
    let weightedSum = 0;
    let weightSum = 0;
    
    for (let i = 0; i < recentData.length; i++) {
      weightedSum += recentData[recentData.length - 1 - i] * weights[i];
      weightSum += weights[i];
    }
    
    const weightedAvg = weightedSum / weightSum;
    
    // Calculate trend using linear regression
    const trend = calculateTrend(historicalData);
    
    // Generate predictions with seasonal adjustments
    return Array(months).fill(0).map((_, i) => {
      // Base prediction using weighted average and trend
      let prediction = weightedAvg + (trend * (i + 1));
      
      // Apply seasonal adjustment (higher in festive months)
      const currentDate = new Date();
      const futureMonth = (currentDate.getMonth() + i + 1) % 12;
      
      // Festive season adjustment - higher in Oct-Dec (months 9-11)
      if (futureMonth >= 9 && futureMonth <= 11) {
        prediction *= 1.15; // 15% increase for festive season
      } else if (futureMonth >= 0 && futureMonth <= 2) {
        prediction *= 0.9; // 10% decrease post festive season
      }
      
      // Apply some controlled randomness
      const randomFactor = 0.97 + (Math.random() * 0.06); // ±3% variation
      
      return Math.max(100, prediction * randomFactor); // Ensure minimum value
    });
  },
  
  // Predict expenses by category for future months
  predictByCategory: (categoricalData: Record<string, number[]>, months: number = 3): Record<string, number[]> => {
    const predictions: Record<string, number[]> = {};
    
    // For each category, generate predictions
    Object.entries(categoricalData).forEach(([category, data]) => {
      // Predict even for categories with no data (with minimum values)
      if (data.length === 0) {
        predictions[category] = Array(months).fill(100); // Minimum prediction
      } else {
        predictions[category] = ML_MODEL.predictTotal(data, months);
      }
    });
    
    return predictions;
  }
};

// Calculate trend using simple linear regression
const calculateTrend = (data: number[]): number => {
  if (data.length < 2) return 0;
  
  const n = data.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  
  // Calculate means
  const meanX = indices.reduce((sum, val) => sum + val, 0) / n;
  const meanY = data.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate slope using least squares method
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (indices[i] - meanX) * (data[i] - meanY);
    denominator += Math.pow(indices[i] - meanX, 2);
  }
  
  return denominator !== 0 ? numerator / denominator : 0;
};

const ExpensePrediction: React.FC = () => {
  const { transactions, categories, getCategoryById } = useExpense();
  const [totalPredictionData, setTotalPredictionData] = useState<any[]>([]);
  const [categoryPredictionData, setCategoryPredictionData] = useState<any[]>([]);
  const [topCategoriesPrediction, setTopCategoriesPrediction] = useState<any[]>([]);
  const [hasEnoughData, setHasEnoughData] = useState(false);
  
  useEffect(() => {
    // Filter transactions to only include expenses from the last year
    const relevantTransactions = transactions.filter(t => 
      t.amount < 0 && // Only expenses
      t.date && // Must have a date
      isWithinLastYear(new Date(t.date)) // Only from the last year
    );
    
    // Check if we have any transactions
    setHasEnoughData(relevantTransactions.length > 0);
    
    // Proceed even with limited data (will use defaults for prediction)
    // 1. Group transactions by month for overall prediction
    const monthlyTotals = new Map<string, number>();
    const categoryMonthlyTotals = new Map<string, Map<string, number>>();
    
    // Initialize structure for all categories
    categories.forEach(category => {
      categoryMonthlyTotals.set(category.id, new Map<string, number>());
    });
    
    // Process transactions to gather historical data
    relevantTransactions.forEach(transaction => {
      // Skip positive transactions (income)
      if (transaction.amount >= 0) return;
      
      const date = new Date(transaction.date);
      const monthKey = format(date, 'yyyy-MM');
      const amount = Math.abs(transaction.amount);
      
      // Update total expenses for the month
      const currentTotal = monthlyTotals.get(monthKey) || 0;
      monthlyTotals.set(monthKey, currentTotal + amount);
      
      // Update category expenses for the month
      if (transaction.categoryId) {
        const categoryMonths = categoryMonthlyTotals.get(transaction.categoryId);
        if (categoryMonths) {
          const currentCategoryTotal = categoryMonths.get(monthKey) || 0;
          categoryMonths.set(monthKey, currentCategoryTotal + amount);
        }
      }
    });
    
    // Convert to sorted arrays for prediction
    let sortedMonthlyData = Array.from(monthlyTotals.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));
    
    // If no data is available, create dummy data for visualization
    if (sortedMonthlyData.length === 0) {
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(today, i);
        const monthKey = format(date, 'yyyy-MM');
        // Create some random historical data between 3000-7000
        const randomAmount = 3000 + Math.random() * 4000;
        sortedMonthlyData.push([monthKey, randomAmount]);
      }
    } else if (sortedMonthlyData.length < 6) {
      // Ensure we have at least 6 months of data by filling in missing months
      const allMonths = getAllMonths(6);
      const existingMonths = new Set(sortedMonthlyData.map(([month]) => month));
      
      // Find average for existing months
      const avgAmount = sortedMonthlyData.reduce((sum, [_, amount]) => sum + amount, 0) / 
                      sortedMonthlyData.length;
      
      // Fill missing months with average values and slight random variation
      for (const month of allMonths) {
        if (!existingMonths.has(month)) {
          // Random variation ±20% of average
          const randomizedAvg = avgAmount * (0.8 + Math.random() * 0.4);
          sortedMonthlyData.push([month, randomizedAvg]);
        }
      }
      
      // Re-sort after adding missing months
      sortedMonthlyData = sortedMonthlyData.sort((a, b) => a[0].localeCompare(b[0]));
    }
    
    // Use last 6 months only
    sortedMonthlyData = sortedMonthlyData.slice(-6);
    
    // Extract just the amounts for total prediction
    const historicalAmounts = sortedMonthlyData.map(([_, amount]) => amount);
    
    // Get predictions for the next 3 months
    const predictedTotalAmounts = ML_MODEL.predictTotal(historicalAmounts, 3);
    
    // Create chart data for total predictions
    const totalChartData = [
      // Historical data
      ...sortedMonthlyData.map(([monthKey, amount]) => ({
        month: format(new Date(monthKey + "-01"), 'MMM yyyy'),
        amount: amount,
        type: 'Historical'
      })),
      
      // Predicted data for next 3 months
      ...predictedTotalAmounts.map((amount, i) => {
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
    
    // Process category-based predictions
    const categoricalHistoricalData: Record<string, number[]> = {};
    const allMonths = getAllMonths(6); // Get last 6 months
    
    // Initialize data structures for categorical prediction
    categories.forEach(category => {
      const categoryMonths = categoryMonthlyTotals.get(category.id) || new Map();
      const categoryAmounts: number[] = [];
      
      // Ensure we have data for each month (fill with 0 if no data)
      allMonths.forEach(monthKey => {
        categoryAmounts.push(categoryMonths.get(monthKey) || 0);
      });
      
      categoricalHistoricalData[category.id] = categoryAmounts;
    });
    
    // Generate category predictions
    const categoryPredictions = ML_MODEL.predictByCategory(categoricalHistoricalData, 3);
    
    // Prepare next month's predicted data for categories
    const nextMonthDate = addMonths(new Date(), 1);
    const nextMonthKey = format(nextMonthDate, 'MMM yyyy');
    
    // Create bar chart data for top categories in the next month
    const topCategoriesPrediction = Object.entries(categoryPredictions)
      .map(([categoryId, predictions]) => ({
        category: getCategoryById(categoryId)?.name || 'Uncategorized',
        categoryId,
        amount: predictions[0], // First month prediction
        color: getCategoryById(categoryId)?.color || '#ccc'
      }))
      .filter(item => item.amount > 50) // Filter out very small predictions
      .sort((a, b) => b.amount - a.amount) // Sort by amount descending
      .slice(0, 5); // Top 5 categories
    
    // Prepare data for categorical line chart
    const nextThreeMonths = Array.from({length: 3}, (_, i) => {
      const date = addMonths(new Date(), i + 1);
      return format(date, 'MMM yyyy');
    });
    
    const categoricalChartData = nextThreeMonths.map((month, monthIndex) => {
      const monthData: any = { month };
      
      // Add predicted amount for each category
      Object.entries(categoryPredictions).forEach(([categoryId, predictions]) => {
        const categoryName = getCategoryById(categoryId)?.name || 'Uncategorized';
        // Only include if has meaningful prediction
        if (predictions[monthIndex] > 50) {
          monthData[categoryName] = predictions[monthIndex];
        }
      });
      
      return monthData;
    });
    
    // Update state with all prediction data
    setTotalPredictionData(totalChartData);
    setCategoryPredictionData(categoricalChartData);
    setTopCategoriesPrediction(topCategoriesPrediction);
    
  }, [transactions, categories, getCategoryById]);
  
  // Get array of month keys for the last n months
  const getAllMonths = (n: number): string[] => {
    const months: string[] = [];
    const today = new Date();
    
    for (let i = n - 1; i >= 0; i--) {
      const date = subMonths(today, i);
      months.push(format(date, 'yyyy-MM'));
    }
    
    return months;
  };
  
  // Format currency as INR
  const formatINR = (value: number) => {
    return `₹${value.toFixed(2)}`;
  };
  
  return (
    <Card className="h-[400px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Expense Prediction (AI-Powered)</CardTitle>
            <CardDescription>
              Smart forecasting of your future expenses
              {!hasEnoughData && " (using simulation data)"}
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            <TrendingUpIcon className="h-4 w-4 text-blue-500" />
            <CalculatorIcon className="h-4 w-4 text-blue-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {totalPredictionData.length > 0 ? (
          <Tabs defaultValue="total">
            <TabsList className="mb-4">
              <TabsTrigger value="total">Total Prediction</TabsTrigger>
              <TabsTrigger value="categories">By Category</TabsTrigger>
              <TabsTrigger value="topCategories">Top Categories</TabsTrigger>
            </TabsList>
            
            <TabsContent value="total">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={totalPredictionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${Math.round(value)}`} />
                  <Tooltip formatter={(value) => formatINR(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    name="Historical"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                    connectNulls
                    dataKey={(entry) => entry.type === 'Historical' ? entry.amount : null}
                  />
                  <Line
                    type="monotone"
                    name="Predicted"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                    connectNulls
                    dataKey={(entry) => entry.type === 'Predicted' ? entry.amount : null}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="categories">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={categoryPredictionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${Math.round(value)}`} />
                  <Tooltip formatter={(value) => formatINR(Number(value))} />
                  <Legend />
                  {categories.slice(0, 5).map((category, index) => (
                    <Line
                      key={category.id}
                      type="monotone"
                      dataKey={category.name}
                      stroke={category.color || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                      strokeWidth={2}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="topCategories">
              <div className="text-sm font-medium mb-2">Predicted Top Expense Categories Next Month</div>
              <ResponsiveContainer width="100%" height={270}>
                <BarChart
                  data={topCategoriesPrediction}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => `₹${Math.round(value)}`} />
                  <Tooltip formatter={(value) => formatINR(Number(value))} />
                  <Bar dataKey="amount" name="Amount">
                    {topCategoriesPrediction.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Loading predictions...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensePrediction;
