import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface InvestmentGrowthProjectionProps {
  monthlyInvestment: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

const returns = {
  conservative: 0.08, // 8% annual return
  moderate: 0.12,     // 12% annual return
  aggressive: 0.15    // 15% annual return
};

const InvestmentGrowthProjection: React.FC<InvestmentGrowthProjectionProps> = ({
  monthlyInvestment,
  riskProfile
}) => {
  const [timeframe, setTimeframe] = useState<'5' | '10' | '20' | '30'>('10');
  
  // Calculate growth projections
  const calculateGrowth = () => {
    const years = parseInt(timeframe);
    const annualReturn = returns[riskProfile];
    const yearlyInvestment = monthlyInvestment * 12;
    
    const data = [];
    let totalInvestment = 0;
    let totalValue = 0;
    
    for (let year = 0; year <= years; year++) {
      if (year === 0) {
        data.push({
          year,
          investment: 0,
          growth: 0,
          totalValue: 0
        });
        continue;
      }
      
      totalInvestment += yearlyInvestment;
      
      // Calculate returns using compound interest formula
      // For each new yearly investment, calculate partial year compound interest
      const previousYearTotal = totalValue;
      totalValue = previousYearTotal * (1 + annualReturn) + yearlyInvestment;
      
      const growthAmount = totalValue - totalInvestment;
      
      data.push({
        year,
        investment: Math.round(totalInvestment),
        growth: Math.round(growthAmount),
        totalValue: Math.round(totalValue)
      });
    }
    
    return data;
  };
  
  const growthData = calculateGrowth();
  const finalValue = growthData[growthData.length - 1]?.totalValue || 0;
  const totalInvestment = growthData[growthData.length - 1]?.investment || 0;
  const totalGrowth = growthData[growthData.length - 1]?.growth || 0;
  
  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 10000000) { // 1 crore or more
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) { // 1 lakh or more
      return `₹${(value / 100000).toFixed(2)} L`;
    } else {
      return `₹${value.toLocaleString()}`;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Investment Growth Projection</CardTitle>
            <CardDescription>
              Estimated growth of your investments over time
            </CardDescription>
          </div>
          <div className="w-[120px]">
            <Label htmlFor="timeframe" className="text-sm mb-1 block">Timeframe</Label>
            <Select 
              value={timeframe} 
              onValueChange={(value: '5' | '10' | '20' | '30') => setTimeframe(value)}
            >
              <SelectTrigger id="timeframe">
                <SelectValue placeholder="Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Years</SelectItem>
                <SelectItem value="10">10 Years</SelectItem>
                <SelectItem value="20">20 Years</SelectItem>
                <SelectItem value="30">30 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Total Investment</div>
            <div className="text-lg font-medium">{formatCurrency(totalInvestment)}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600">Growth</div>
            <div className="text-lg font-medium text-blue-700">{formatCurrency(totalGrowth)}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600">Final Value</div>
            <div className="text-lg font-medium text-green-700">{formatCurrency(finalValue)}</div>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={growthData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Years', position: 'insideBottomRight', offset: -10 }} 
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)} 
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Amount']} 
                labelFormatter={(label) => `Year ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="investment" 
                name="Total Invested" 
                stroke="#6b7280" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="totalValue" 
                name="Total Value" 
                stroke="#10b981" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>* Projections assume a consistent {returns[riskProfile] * 100}% annual return for the {riskProfile} risk profile.</p>
          <p>* Actual returns may vary based on market conditions and specific investment choices.</p>
          <p>* These projections are for illustration purposes and should not be considered investment advice.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentGrowthProjection; 