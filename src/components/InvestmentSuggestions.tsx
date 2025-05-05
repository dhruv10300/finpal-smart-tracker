'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExpenses } from '@/context/ExpenseContext';
import { getFinancialModel, InvestmentSuggestion } from '@/lib/advanced-ml-model';

const InvestmentCard = ({ suggestion }: { suggestion: InvestmentSuggestion }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };
  
  const getTimeHorizonLabel = (horizon: string) => {
    switch (horizon) {
      case 'short': return '< 1 year';
      case 'medium': return '1-5 years';
      case 'long': return '> 5 years';
      default: return 'Varies';
    }
  };
  
  const getInvestmentTypeIcon = (type: string) => {
    switch (type) {
      case 'stocks': return '📈';
      case 'mutualFunds': return '📊';
      case 'fixedDeposit': return '🏦';
      case 'gold': return '🪙';
      case 'ppf': return '🔒';
      case 'realEstate': return '🏢';
      case 'emergency': return '🚨';
      case 'crypto': return '₿';
      default: return '💰';
    }
  };
  
  const getInvestmentTypeName = (type: string) => {
    switch (type) {
      case 'stocks': return 'Stocks';
      case 'mutualFunds': return 'Mutual Funds';
      case 'fixedDeposit': return 'Fixed Deposits';
      case 'gold': return 'Gold';
      case 'ppf': return 'PPF';
      case 'realEstate': return 'Real Estate';
      case 'emergency': return 'Emergency Fund';
      case 'crypto': return 'Cryptocurrency';
      default: return type;
    }
  };

  return (
    <Card className="mb-4 overflow-hidden border-l-4" style={{ borderLeftColor: suggestion.riskLevel === 'low' ? '#22c55e' : suggestion.riskLevel === 'medium' ? '#eab308' : '#ef4444' }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{getInvestmentTypeIcon(suggestion.type)}</div>
            <CardTitle className="text-lg">{getInvestmentTypeName(suggestion.type)}</CardTitle>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(suggestion.riskLevel)}`}>
            {suggestion.riskLevel.charAt(0).toUpperCase() + suggestion.riskLevel.slice(1)} Risk
          </div>
        </div>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Time Horizon: {getTimeHorizonLabel(suggestion.timeHorizon)} • Expected Return: {suggestion.expectedReturn}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span>Allocation</span>
            <span className="font-medium">{suggestion.allocationPercentage}%</span>
          </div>
          <Progress value={suggestion.allocationPercentage} className="h-2" />
        </div>
        <p className="text-sm mt-3">{suggestion.recommendation}</p>
      </CardContent>
    </Card>
  );
};

const InvestmentSuggestions = () => {
  const { expenses } = useExpenses();
  const { toast } = useToast();
  const [investmentSuggestions, setInvestmentSuggestions] = useState<InvestmentSuggestion[]>([]);
  const [monthlySalary, setMonthlySalary] = useState<number>(50000);
  const [ageGroup, setAgeGroup] = useState<'young' | 'adult' | 'senior'>('adult');
  const [goals, setGoals] = useState({
    savings: 30,
    investment: 20,
    emergency: 10,
    retirement: 10,
  });
  const [showProfileConfig, setShowProfileConfig] = useState(true);

  useEffect(() => {
    if (!showProfileConfig && expenses.length > 0) {
      try {
        const model = getFinancialModel();
        const profile = {
          monthlySalary,
          financialGoals: goals,
          ageGroup,
        };
        
        const suggestions = model.generateInvestmentSuggestions(expenses, profile);
        setInvestmentSuggestions(suggestions);
      } catch (error) {
        console.error("Error generating investment suggestions:", error);
        toast({
          title: "Error",
          description: "Failed to generate investment suggestions. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [expenses, showProfileConfig, monthlySalary, goals, ageGroup, toast]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setShowProfileConfig(false);
    toast({
      title: "Profile Updated",
      description: "Your financial profile has been updated with new data.",
    });
  };

  const handleSliderChange = (value: number[], type: keyof typeof goals) => {
    setGoals(prev => ({
      ...prev,
      [type]: value[0]
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Investment Suggestions</CardTitle>
        <CardDescription>
          Personalized investment recommendations based on your spending patterns and financial goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={showProfileConfig ? "profile" : "suggestions"} value={showProfileConfig ? "profile" : "suggestions"}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="profile" onClick={() => setShowProfileConfig(true)}>Financial Profile</TabsTrigger>
            <TabsTrigger value="suggestions" onClick={() => setShowProfileConfig(false)} disabled={showProfileConfig}>Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlySalary">Monthly Income (₹)</Label>
                  <Input 
                    id="monthlySalary" 
                    type="number" 
                    value={monthlySalary} 
                    onChange={(e) => setMonthlySalary(Number(e.target.value))}
                    min={1000}
                    required
                  />
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="ageGroup">Age Group</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <Button 
                      type="button"
                      variant={ageGroup === 'young' ? 'default' : 'outline'} 
                      className="w-full"
                      onClick={() => setAgeGroup('young')}
                    >
                      Young (18-30)
                    </Button>
                    <Button 
                      type="button"
                      variant={ageGroup === 'adult' ? 'default' : 'outline'} 
                      className="w-full"
                      onClick={() => setAgeGroup('adult')}
                    >
                      Adult (31-55)
                    </Button>
                    <Button 
                      type="button"
                      variant={ageGroup === 'senior' ? 'default' : 'outline'} 
                      className="w-full"
                      onClick={() => setAgeGroup('senior')}
                    >
                      Senior (55+)
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  <h3 className="text-md font-medium">Financial Goals</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="savings">Savings</Label>
                        <span className="text-sm text-muted-foreground">{goals.savings}%</span>
                      </div>
                      <Slider 
                        id="savings"
                        min={0} 
                        max={50} 
                        step={1}
                        value={[goals.savings]}
                        onValueChange={(value) => handleSliderChange(value, 'savings')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="investment">Investment</Label>
                        <span className="text-sm text-muted-foreground">{goals.investment}%</span>
                      </div>
                      <Slider 
                        id="investment"
                        min={0} 
                        max={50} 
                        step={1}
                        value={[goals.investment]}
                        onValueChange={(value) => handleSliderChange(value, 'investment')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="emergency">Emergency Fund</Label>
                        <span className="text-sm text-muted-foreground">{goals.emergency}%</span>
                      </div>
                      <Slider 
                        id="emergency"
                        min={0} 
                        max={30} 
                        step={1}
                        value={[goals.emergency]}
                        onValueChange={(value) => handleSliderChange(value, 'emergency')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="retirement">Retirement</Label>
                        <span className="text-sm text-muted-foreground">{goals.retirement}%</span>
                      </div>
                      <Slider 
                        id="retirement"
                        min={0} 
                        max={30} 
                        step={1}
                        value={[goals.retirement]}
                        onValueChange={(value) => handleSliderChange(value, 'retirement')}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="bg-muted p-3 rounded mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Total Allocation</span>
                    <span className={`text-sm font-medium ${
                      goals.savings + goals.investment + goals.emergency + goals.retirement > 70 
                        ? 'text-red-500' 
                        : goals.savings + goals.investment + goals.emergency + goals.retirement < 30
                        ? 'text-amber-500'
                        : 'text-green-500'
                    }`}>
                      {goals.savings + goals.investment + goals.emergency + goals.retirement}%
                    </span>
                  </div>
                  <Progress 
                    value={goals.savings + goals.investment + goals.emergency + goals.retirement} 
                    className="h-2"
                    {...(goals.savings + goals.investment + goals.emergency + goals.retirement > 70 && {
                      className: 'h-2 bg-red-200'
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {goals.savings + goals.investment + goals.emergency + goals.retirement > 70
                      ? 'High allocation might be difficult to maintain. Consider reducing some percentages.'
                      : goals.savings + goals.investment + goals.emergency + goals.retirement < 30
                      ? 'Low allocation toward financial goals. Consider increasing if possible.'
                      : 'Balanced allocation for your financial well-being.'}
                  </p>
                </div>
                
                <Button type="submit" className="w-full">Generate Suggestions</Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="suggestions">
            {investmentSuggestions.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-4">
                  {investmentSuggestions.map((suggestion, index) => (
                    <InvestmentCard key={index} suggestion={suggestion} />
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => setShowProfileConfig(true)}>
                  Update Financial Profile
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-lg font-medium mb-2">No suggestions yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Update your financial profile to get personalized investment recommendations
                </p>
                <Button onClick={() => setShowProfileConfig(true)}>Set Up Financial Profile</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InvestmentSuggestions; 