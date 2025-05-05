import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/context/AuthContext';
import InvestmentAllocationTable from './InvestmentAllocationTable';
import InvestmentGrowthProjection from './InvestmentGrowthProjection';

interface AllocationData {
  name: string;
  value: number;
  color: string;
}

// Predefined allocation based on risk profile and salary tier
const getAllocationBasedOnProfile = (
  riskProfile: 'conservative' | 'moderate' | 'aggressive',
  salaryTier: 'low' | 'medium' | 'high'
): AllocationData[] => {
  const baseAllocations: Record<string, Record<string, AllocationData[]>> = {
    conservative: {
      low: [
        { name: 'Fixed Deposits', value: 45, color: '#4ade80' },
        { name: 'Government Bonds', value: 25, color: '#2dd4bf' },
        { name: 'Gold', value: 15, color: '#facc15' },
        { name: 'Mutual Funds', value: 10, color: '#fb923c' },
        { name: 'Stocks', value: 5, color: '#f87171' }
      ],
      medium: [
        { name: 'Fixed Deposits', value: 40, color: '#4ade80' },
        { name: 'Government Bonds', value: 20, color: '#2dd4bf' },
        { name: 'Gold', value: 15, color: '#facc15' },
        { name: 'Mutual Funds', value: 15, color: '#fb923c' },
        { name: 'Stocks', value: 10, color: '#f87171' }
      ],
      high: [
        { name: 'Fixed Deposits', value: 35, color: '#4ade80' },
        { name: 'Government Bonds', value: 15, color: '#2dd4bf' },
        { name: 'Gold', value: 15, color: '#facc15' },
        { name: 'Mutual Funds', value: 20, color: '#fb923c' },
        { name: 'Stocks', value: 10, color: '#f87171' },
        { name: 'Real Estate', value: 5, color: '#a78bfa' }
      ]
    },
    moderate: {
      low: [
        { name: 'Fixed Deposits', value: 30, color: '#4ade80' },
        { name: 'Government Bonds', value: 15, color: '#2dd4bf' },
        { name: 'Gold', value: 15, color: '#facc15' },
        { name: 'Mutual Funds', value: 25, color: '#fb923c' },
        { name: 'Stocks', value: 15, color: '#f87171' }
      ],
      medium: [
        { name: 'Fixed Deposits', value: 25, color: '#4ade80' },
        { name: 'Government Bonds', value: 10, color: '#2dd4bf' },
        { name: 'Gold', value: 15, color: '#facc15' },
        { name: 'Mutual Funds', value: 30, color: '#fb923c' },
        { name: 'Stocks', value: 15, color: '#f87171' },
        { name: 'Real Estate', value: 5, color: '#a78bfa' }
      ],
      high: [
        { name: 'Fixed Deposits', value: 20, color: '#4ade80' },
        { name: 'Government Bonds', value: 10, color: '#2dd4bf' },
        { name: 'Gold', value: 10, color: '#facc15' },
        { name: 'Mutual Funds', value: 30, color: '#fb923c' },
        { name: 'Stocks', value: 20, color: '#f87171' },
        { name: 'Real Estate', value: 10, color: '#a78bfa' }
      ]
    },
    aggressive: {
      low: [
        { name: 'Fixed Deposits', value: 20, color: '#4ade80' },
        { name: 'Government Bonds', value: 10, color: '#2dd4bf' },
        { name: 'Gold', value: 10, color: '#facc15' },
        { name: 'Mutual Funds', value: 35, color: '#fb923c' },
        { name: 'Stocks', value: 25, color: '#f87171' }
      ],
      medium: [
        { name: 'Fixed Deposits', value: 15, color: '#4ade80' },
        { name: 'Government Bonds', value: 5, color: '#2dd4bf' },
        { name: 'Gold', value: 10, color: '#facc15' },
        { name: 'Mutual Funds', value: 35, color: '#fb923c' },
        { name: 'Stocks', value: 25, color: '#f87171' },
        { name: 'Real Estate', value: 10, color: '#a78bfa' }
      ],
      high: [
        { name: 'Fixed Deposits', value: 10, color: '#4ade80' },
        { name: 'Government Bonds', value: 5, color: '#2dd4bf' },
        { name: 'Gold', value: 5, color: '#facc15' },
        { name: 'Mutual Funds', value: 30, color: '#fb923c' },
        { name: 'Stocks', value: 35, color: '#f87171' },
        { name: 'Real Estate', value: 15, color: '#a78bfa' }
      ]
    }
  };

  return baseAllocations[riskProfile][salaryTier];
};

const getSalaryTier = (salary: number): 'low' | 'medium' | 'high' => {
  if (salary < 30000) return 'low';
  if (salary < 80000) return 'medium';
  return 'high';
};

const investmentDescriptions: Record<string, string> = {
  'Fixed Deposits': 'Safe investments with predictable returns (5-6%). Ideal for short to medium-term goals.',
  'Government Bonds': 'Low-risk investments backed by the government (6-7%). Good for stable, long-term returns.',
  'Gold': 'Traditional store of value that provides a hedge against inflation (8-10% long-term).',
  'Mutual Funds': 'Professionally managed diversified investments (10-14% for balanced funds). Good for medium to long-term goals.',
  'Stocks': 'Direct company ownership with higher growth potential (12-18%) but also higher risk. Best for long-term horizons.',
  'Real Estate': 'Physical property or REITs offering appreciation and potential rental income (10-15% long-term).'
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-md shadow-sm">
        <p className="font-medium">{`${payload[0].name}: ${payload[0].value}%`}</p>
        <p className="text-sm text-gray-600 mt-1">{investmentDescriptions[payload[0].name]}</p>
      </div>
    );
  }
  return null;
};

const InvestmentRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [salary, setSalary] = useState<number>(user?.monthlySalary || 50000);
  const [investmentPercentage, setInvestmentPercentage] = useState<number>(20);
  const [allocation, setAllocation] = useState<AllocationData[]>([]);
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(0);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("visualization");

  useEffect(() => {
    const salaryTier = getSalaryTier(salary);
    const newAllocation = getAllocationBasedOnProfile(riskProfile, salaryTier);
    setAllocation(newAllocation);
    setMonthlyInvestment((salary * investmentPercentage) / 100);
  }, [riskProfile, salary, investmentPercentage]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">💼</span> Investment Recommendations
        </CardTitle>
        <CardDescription>
          Personalized investment allocation based on your salary and risk tolerance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visualization" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="visualization">
              Allocation Chart
            </TabsTrigger>
            <TabsTrigger value="table">
              Allocation Table
            </TabsTrigger>
            <TabsTrigger value="projection">
              Growth Projection
            </TabsTrigger>
            <TabsTrigger value="config">
              Configure
            </TabsTrigger>
            <TabsTrigger value="details">
              Investment Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-medium">Monthly Investment: ₹{monthlyInvestment.toLocaleString()}</h3>
                <p className="text-sm text-gray-500">Based on {investmentPercentage}% of your ₹{salary.toLocaleString()} salary</p>
              </div>
              <Badge variant="outline" className="ml-2">
                {riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)} Risk
              </Badge>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="table">
            <InvestmentAllocationTable 
              allocation={allocation} 
              monthlyAmount={monthlyInvestment} 
            />
          </TabsContent>
          
          <TabsContent value="projection">
            <InvestmentGrowthProjection
              monthlyInvestment={monthlyInvestment}
              riskProfile={riskProfile}
            />
          </TabsContent>

          <TabsContent value="config">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="salary">Monthly Salary (₹)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  min={10000}
                  step={5000}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="investment-percentage">Investment Percentage</Label>
                  <span className="text-sm text-muted-foreground">{investmentPercentage}%</span>
                </div>
                <Slider
                  id="investment-percentage"
                  min={5}
                  max={50}
                  step={1}
                  value={[investmentPercentage]}
                  onValueChange={(value) => setInvestmentPercentage(value[0])}
                />
                <p className="text-xs text-gray-500">
                  Recommended: 15-25% of monthly income for investments
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk-profile">Risk Profile</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <Button
                    type="button"
                    variant={riskProfile === 'conservative' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setRiskProfile('conservative')}
                  >
                    Conservative
                  </Button>
                  <Button
                    type="button"
                    variant={riskProfile === 'moderate' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setRiskProfile('moderate')}
                  >
                    Moderate
                  </Button>
                  <Button
                    type="button"
                    variant={riskProfile === 'aggressive' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setRiskProfile('aggressive')}
                  >
                    Aggressive
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button onClick={() => setActiveTab("visualization")}>
                  View Allocation Chart
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <div className="space-y-4">
              {allocation.map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{item.value}%</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ₹{Math.round((monthlyInvestment * item.value) / 100).toLocaleString()}/month
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{investmentDescriptions[item.name]}</p>
                </div>
              ))}

              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h3 className="font-medium mb-2">Additional Considerations</h3>
                <ul className="text-sm space-y-2">
                  <li>• Start with simpler instruments like Fixed Deposits and Mutual Funds if you're new to investing</li>
                  <li>• Consider consulting a financial advisor for personalized guidance</li>
                  <li>• Regularly review and rebalance your portfolio as your financial situation changes</li>
                  <li>• Ensure you have adequate emergency funds before investing in higher-risk options</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InvestmentRecommendations; 