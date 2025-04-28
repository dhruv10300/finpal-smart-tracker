
import React, { useMemo } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { 
  ChartContainer, 
  ChartTooltipContent 
} from '@/components/ui/chart';

const COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F94144'
];

const RADIAN = Math.PI / 180;

// Custom label for pie chart slices
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  // Only show labels for segments that are at least 5% of the total
  if (percent < 0.05) return null;
  
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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
  
  // Format currency as INR
  const formatINR = (value: number) => {
    return `₹${value.toFixed(2)}`;
  };
  
  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {categoryData.length > 0 ? (
          <ChartContainer config={{}} className="h-[300px]">
            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={60}
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={renderCustomizedLabel}
                paddingAngle={2}
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]} 
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }}></div>
                          <span className="font-medium">{data.name}</span>
                        </div>
                        <p className="text-sm font-semibold">{formatINR(data.value)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: 20 }}
              />
            </PieChart>
          </ChartContainer>
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
