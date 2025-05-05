import { Transaction } from '@/types/expense';

interface FinancialProfile {
  monthlySalary?: number;
  financialGoals?: {
    savings?: number;
    investment?: number;
    emergency?: number;
    retirement?: number;
  };
  ageGroup?: 'young' | 'adult' | 'senior';
}

export interface ExpenseForecast {
  month: string;
  predictedAmount: number;
  percentChange: number;
  confidence: number;
}

export interface CategoryForecast {
  category: string;
  monthlyPercentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
}

export interface InvestmentSuggestion {
  type: string;
  allocationPercentage: number;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: string;
  timeHorizon: 'short' | 'medium' | 'long';
  recommendation: string;
}

export interface SavingsBreakdown {
  expenses: number;
  savings: number;
  investment: number;
  emergency: number;
  retirement: number;
}

export interface FinancialInsights {
  expenseForecast: ExpenseForecast[];
  categoryAnalysis: CategoryForecast[];
  investmentSuggestions: InvestmentSuggestion[];
  savingsBreakdown: SavingsBreakdown;
  savingsOpportunities: string[];
  summary: string;
}

// Advanced ML Model
export class AdvancedFinancialModel {
  /**
   * Predict future expenses based on historical transaction data
   */
  predictExpenses(transactions: Transaction[]): ExpenseForecast[] {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Group transactions by month
    const monthlyExpenses: Record<string, number> = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyExpenses[monthKey]) {
        monthlyExpenses[monthKey] = 0;
      }
      
      // Only count expenses (negative amounts)
      if (transaction.amount < 0) {
        monthlyExpenses[monthKey] += Math.abs(transaction.amount);
      }
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyExpenses).sort();
    const historicalAmounts = sortedMonths.map(month => monthlyExpenses[month]);
    
    // Generate future predictions for the next 3 months
    const forecasts: ExpenseForecast[] = [];
    const lastThreeMonths = sortedMonths.slice(-3);
    const lastThreeAmounts = lastThreeMonths.map(month => monthlyExpenses[month]);
    
    if (lastThreeMonths.length > 0) {
      // Simple trend calculation
      const avgAmount = lastThreeAmounts.reduce((sum, amount) => sum + amount, 0) / lastThreeAmounts.length;
      const lastMonth = new Date(lastThreeMonths[lastThreeMonths.length - 1]);
      
      // Generate 3 month forecast
      for (let i = 1; i <= 3; i++) {
        const forecastDate = new Date(lastMonth);
        forecastDate.setMonth(lastMonth.getMonth() + i);
        
        // Add seasonal adjustments - spend more in festive months (October-December)
        const monthIndex = forecastDate.getMonth();
        let seasonalFactor = 1.0;
        if (monthIndex >= 9 && monthIndex <= 11) { // October to December
          seasonalFactor = 1.15; // 15% increase for festive season
        } else if (monthIndex >= 0 && monthIndex <= 2) { // January to March
          seasonalFactor = 0.9; // 10% decrease post festive season
        }
        
        // Calculate trend based on recent history
        let trendFactor = 1.0;
        if (lastThreeAmounts.length >= 2) {
          const recentTrend = (lastThreeAmounts[lastThreeAmounts.length - 1] / lastThreeAmounts[0]) - 1;
          trendFactor = 1 + (recentTrend * 0.5); // Dampen the trend effect
        }
        
        const predictedAmount = avgAmount * seasonalFactor * trendFactor;
        const percentChange = ((predictedAmount / lastThreeAmounts[lastThreeAmounts.length - 1]) - 1) * 100;
        
        // Calculate confidence based on data consistency
        const stdDev = this.calculateStandardDeviation(lastThreeAmounts);
        const varianceRatio = stdDev / avgAmount;
        const confidence = Math.max(50, Math.min(95, 90 - (varianceRatio * 100)));
        
        forecasts.push({
          month: `${forecastDate.getFullYear()}-${forecastDate.getMonth() + 1}`,
          predictedAmount: Math.round(predictedAmount * 100) / 100,
          percentChange: Math.round(percentChange * 10) / 10,
          confidence: Math.round(confidence)
        });
      }
    }
    
    return forecasts;
  }

  /**
   * Calculate standard deviation helper
   */
  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(value => {
      const diff = value - mean;
      return diff * diff;
    });
    const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Analyze spending categories and provide recommendations
   */
  analyzeCategories(transactions: Transaction[]): CategoryForecast[] {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Group transactions by category and month
    const categoryMonthlyData: Record<string, Record<string, number>> = {};
    const totalMonthlyExpenses: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      // Skip income transactions
      if (transaction.amount >= 0) return;
      
      const amount = Math.abs(transaction.amount);
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const category = transaction.category || 'Uncategorized';
      
      // Initialize category data if needed
      if (!categoryMonthlyData[category]) {
        categoryMonthlyData[category] = {};
      }
      
      // Initialize month data if needed
      if (!categoryMonthlyData[category][monthKey]) {
        categoryMonthlyData[category][monthKey] = 0;
      }
      
      // Add amount to category and month
      categoryMonthlyData[category][monthKey] += amount;
      
      // Track total monthly expenses for percentage calculation
      if (!totalMonthlyExpenses[monthKey]) {
        totalMonthlyExpenses[monthKey] = 0;
      }
      totalMonthlyExpenses[monthKey] += amount;
    });
    
    // Process categories to determine trends and percentages
    const categoryForecasts: CategoryForecast[] = [];
    
    for (const category in categoryMonthlyData) {
      const monthlyData = categoryMonthlyData[category];
      const months = Object.keys(monthlyData).sort();
      
      // Need at least 2 months of data to determine a trend
      if (months.length < 2) continue;
      
      // Get last 3 months or all available if less than 3
      const recentMonths = months.slice(-3);
      const monthlyPercentages = recentMonths.map(month => {
        return (monthlyData[month] / totalMonthlyExpenses[month]) * 100;
      });
      
      // Calculate average monthly percentage
      const avgPercentage = monthlyPercentages.reduce((sum, p) => sum + p, 0) / monthlyPercentages.length;
      
      // Determine trend
      const firstPercentage = monthlyPercentages[0];
      const lastPercentage = monthlyPercentages[monthlyPercentages.length - 1];
      const percentageChange = lastPercentage - firstPercentage;
      
      let trend: 'increasing' | 'decreasing' | 'stable';
      if (percentageChange > 1.5) {
        trend = 'increasing';
      } else if (percentageChange < -1.5) {
        trend = 'decreasing';
      } else {
        trend = 'stable';
      }
      
      // Generate recommendations based on category and trend
      let recommendation = '';
      
      switch (category.toLowerCase()) {
        case 'food':
        case 'dining':
        case 'restaurants':
          if (trend === 'increasing' && avgPercentage > 15) {
            recommendation = 'Consider cooking more meals at home to reduce food expenses.';
          } else if (trend === 'stable' && avgPercentage > 20) {
            recommendation = 'Your food expenses are stable but high. Look for meal prep options to save money.';
          }
          break;
          
        case 'entertainment':
        case 'shopping':
          if (trend === 'increasing') {
            recommendation = 'Your spending in this category is increasing. Consider setting a monthly budget.';
          } else if (avgPercentage > 15) {
            recommendation = 'This category takes up a significant portion of your expenses. Look for free alternatives.';
          }
          break;
          
        case 'transportation':
        case 'travel':
          if (trend === 'increasing' && avgPercentage > 10) {
            recommendation = 'Consider carpooling or public transportation to reduce costs.';
          }
          break;
          
        case 'utilities':
          if (trend === 'increasing') {
            recommendation = 'Check for energy-saving opportunities to reduce utility bills.';
          }
          break;
          
        default:
          if (trend === 'increasing' && avgPercentage > 10) {
            recommendation = `Your spending on ${category} is trending upward. Consider ways to reduce these expenses.`;
          } else if (avgPercentage > 25) {
            recommendation = `${category} makes up a large portion of your expenses. Look for opportunities to save.`;
          }
      }
      
      if (!recommendation) {
        if (trend === 'decreasing') {
          recommendation = `Great job reducing ${category} expenses. Keep it up!`;
        } else {
          recommendation = `Your spending on ${category} is under control.`;
        }
      }
      
      categoryForecasts.push({
        category,
        monthlyPercentage: Math.round(avgPercentage * 10) / 10,
        trend,
        recommendation
      });
    }
    
    // Sort by monthly percentage (highest first)
    return categoryForecasts.sort((a, b) => b.monthlyPercentage - a.monthlyPercentage);
  }

  /**
   * Generate investment suggestions based on financial profile and spending history
   */
  generateInvestmentSuggestions(transactions: Transaction[], profile?: FinancialProfile): InvestmentSuggestion[] {
    // Default values if no profile is provided
    const monthlySalary = profile?.monthlySalary || 50000; // Default 50K
    const financialGoals = profile?.financialGoals || {
      savings: 20,
      investment: 15,
      emergency: 10,
      retirement: 10
    };

    // Calculate disposable income after expenses
    const monthlyExpenses = this.calculateAverageMonthlyExpenses(transactions);
    const disposableIncome = Math.max(0, monthlySalary - monthlyExpenses);
    
    // Calculate investment allocation (% of disposable income)
    const investmentAllocation = disposableIncome * (financialGoals.investment || 15) / 100;
    
    // If there's very little to invest, focus on emergency funds and savings
    if (investmentAllocation < 2000) {
      return [
        {
          type: 'emergency',
          allocationPercentage: 100,
          riskLevel: 'low',
          expectedReturn: '4-6%',
          timeHorizon: 'short',
          recommendation: 'Build an emergency fund before focusing on investments. Aim for 3-6 months of expenses.'
        }
      ];
    }
    
    // Determine risk tolerance based on spending volatility, financial goals, and income stability
    const volatility = this.calculateSpendingVolatility(transactions);
    const incomeStability = this.calculateIncomeStability(transactions);
    const ageGroup = profile?.ageGroup || 'adult'; // Default to adult if not specified
    const riskTolerance = this.determineRiskTolerance(volatility, financialGoals, incomeStability, ageGroup);
    
    // Generate suggestions based on risk tolerance
    const suggestions: InvestmentSuggestion[] = [];
    
    switch (riskTolerance) {
      case 'conservative':
        suggestions.push(
          {
            type: 'fixedDeposit',
            allocationPercentage: 35,
            riskLevel: 'low',
            expectedReturn: '5-6%',
            timeHorizon: 'short',
            recommendation: 'Fixed deposits offer stable returns with minimal risk. Good for short-term goals.'
          },
          {
            type: 'ppf',
            allocationPercentage: 30,
            riskLevel: 'low',
            expectedReturn: '7-8%',
            timeHorizon: 'long',
            recommendation: 'Public Provident Fund provides tax benefits and consistent returns over long term.'
          },
          {
            type: 'gold',
            allocationPercentage: 15,
            riskLevel: 'medium',
            expectedReturn: '8-10%',
            timeHorizon: 'medium',
            recommendation: 'Gold serves as a hedge against inflation and provides portfolio diversification.'
          },
          {
            type: 'mutualFunds',
            allocationPercentage: 15,
            riskLevel: 'medium',
            expectedReturn: '10-12%',
            timeHorizon: 'medium',
            recommendation: 'Consider debt mutual funds for slightly higher returns with moderate risk.'
          },
          {
            type: 'crypto',
            allocationPercentage: 5,
            riskLevel: 'high',
            expectedReturn: '10-25%',
            timeHorizon: 'long',
            recommendation: 'A small allocation to established cryptocurrencies like Bitcoin or Ethereum can provide diversification, but keep it limited due to high volatility.'
          }
        );
        break;
        
      case 'moderate':
        suggestions.push(
          {
            type: 'mutualFunds',
            allocationPercentage: 35,
            riskLevel: 'medium',
            expectedReturn: '10-14%',
            timeHorizon: 'medium',
            recommendation: 'Balanced mutual funds offer a mix of equity and debt for moderate growth.'
          },
          {
            type: 'fixedDeposit',
            allocationPercentage: 20,
            riskLevel: 'low',
            expectedReturn: '5-6%',
            timeHorizon: 'short',
            recommendation: 'Maintain some fixed deposits for liquidity and stability in your portfolio.'
          },
          {
            type: 'gold',
            allocationPercentage: 15,
            riskLevel: 'medium',
            expectedReturn: '8-10%',
            timeHorizon: 'medium',
            recommendation: 'Gold ETFs provide exposure to gold with better liquidity than physical gold.'
          },
          {
            type: 'stocks',
            allocationPercentage: 20,
            riskLevel: 'high',
            expectedReturn: '12-18%',
            timeHorizon: 'long',
            recommendation: 'Consider blue-chip stocks for long-term wealth creation with manageable risk.'
          },
          {
            type: 'crypto',
            allocationPercentage: 10,
            riskLevel: 'high',
            expectedReturn: '15-30%',
            timeHorizon: 'long',
            recommendation: 'Diversify with a moderate allocation to established cryptocurrencies and blockchain projects.'
          }
        );
        break;
        
      case 'aggressive':
        suggestions.push(
          {
            type: 'stocks',
            allocationPercentage: 40,
            riskLevel: 'high',
            expectedReturn: '15-20%',
            timeHorizon: 'long',
            recommendation: 'Invest in growth stocks for potentially higher returns over the long term.'
          },
          {
            type: 'mutualFunds',
            allocationPercentage: 25,
            riskLevel: 'medium',
            expectedReturn: '12-16%',
            timeHorizon: 'medium',
            recommendation: 'Equity mutual funds can provide good returns with professional management.'
          },
          {
            type: 'crypto',
            allocationPercentage: 15,
            riskLevel: 'high',
            expectedReturn: '20-40%',
            timeHorizon: 'long',
            recommendation: 'Higher allocation to cryptocurrencies including Bitcoin, Ethereum, and selected altcoins with strong use cases and adoption.'
          },
          {
            type: 'realEstate',
            allocationPercentage: 10,
            riskLevel: 'high',
            expectedReturn: '10-15%',
            timeHorizon: 'long',
            recommendation: 'Consider REITs for real estate exposure without direct property investment.'
          },
          {
            type: 'fixedDeposit',
            allocationPercentage: 10,
            riskLevel: 'low',
            expectedReturn: '5-6%',
            timeHorizon: 'short',
            recommendation: 'Keep some funds in fixed deposits for emergencies and liquidity.'
          }
        );
        break;
    }
    
    return suggestions;
  }

  /**
   * Calculate average monthly expenses
   */
  private calculateAverageMonthlyExpenses(transactions: Transaction[]): number {
    if (!transactions || transactions.length === 0) {
      return 0;
    }
    
    // Group expenses by month
    const monthlyExpenses: Record<string, number> = {};
    transactions.forEach(transaction => {
      // Only consider expenses (negative amounts)
      if (transaction.amount >= 0) return;
      
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyExpenses[monthKey]) {
        monthlyExpenses[monthKey] = 0;
      }
      
      monthlyExpenses[monthKey] += Math.abs(transaction.amount);
    });
    
    // Calculate average of last 3 months or all available months
    const months = Object.keys(monthlyExpenses).sort();
    const recentMonths = months.slice(-3);
    
    if (recentMonths.length === 0) {
      return 0;
    }
    
    const totalExpenses = recentMonths.reduce((sum, month) => sum + monthlyExpenses[month], 0);
    return totalExpenses / recentMonths.length;
  }

  /**
   * Calculate spending volatility
   */
  private calculateSpendingVolatility(transactions: Transaction[]): number {
    if (!transactions || transactions.length === 0) {
      return 0;
    }
    
    // Group expenses by month
    const monthlyExpenses: Record<string, number> = {};
    transactions.forEach(transaction => {
      // Only consider expenses (negative amounts)
      if (transaction.amount >= 0) return;
      
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyExpenses[monthKey]) {
        monthlyExpenses[monthKey] = 0;
      }
      
      monthlyExpenses[monthKey] += Math.abs(transaction.amount);
    });
    
    // Calculate standard deviation of monthly expenses
    const months = Object.keys(monthlyExpenses).sort();
    if (months.length < 2) {
      return 0;
    }
    
    const values = months.map(month => monthlyExpenses[month]);
    return this.calculateStandardDeviation(values) / (values.reduce((sum, val) => sum + val, 0) / values.length);
  }

  /**
   * Calculate income stability based on regular income transactions
   */
  private calculateIncomeStability(transactions: Transaction[]): number {
    if (!transactions || transactions.length === 0) {
      return 0.5; // Default medium stability if no data
    }
    
    // Find transactions that are likely salary/income (positive amounts)
    const incomeTransactions = transactions.filter(t => t.amount > 0);
    
    if (incomeTransactions.length < 2) {
      return 0.5; // Not enough data to determine stability
    }
    
    // Group income by month
    const monthlyIncome: Record<string, number> = {};
    incomeTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyIncome[monthKey]) {
        monthlyIncome[monthKey] = 0;
      }
      
      monthlyIncome[monthKey] += transaction.amount;
    });
    
    // Calculate variance in monthly income
    const monthlyValues = Object.values(monthlyIncome);
    if (monthlyValues.length < 2) {
      return 0.5;
    }
    
    // Calculate average and variance
    const avgIncome = monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length;
    const variance = monthlyValues.reduce((sum, val) => sum + Math.pow(val - avgIncome, 2), 0) / monthlyValues.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate coefficient of variation (standardized measure of dispersion)
    const cv = stdDev / avgIncome;
    
    // Map coefficient of variation to stability score (0-1 scale, where 1 is very stable)
    // Lower CV means more stable income
    // Typical values: CV < 0.1 is very stable, CV > 0.3 is unstable
    return Math.max(0, Math.min(1, 1 - (cv * 2)));
  }

  private determineRiskTolerance(
    volatility: number, 
    financialGoals?: FinancialProfile['financialGoals'],
    incomeStability?: number,
    ageGroup?: 'young' | 'adult' | 'senior'
  ): 'conservative' | 'moderate' | 'aggressive' {
    // Default values if not provided
    const stability = incomeStability !== undefined ? incomeStability : 0.5;
    const age = ageGroup || 'adult';
    
    // Calculate a risk score based on multiple factors
    
    // 1. Spending volatility factor (higher volatility suggests lower risk tolerance)
    const volatilityFactor = 0.3 * (1 - Math.min(volatility / 0.5, 1));
    
    // 2. Income stability factor (more stable income allows for more risk)
    const stabilityFactor = 0.3 * stability;
    
    // 3. Age factor (younger can take more risk)
    let ageFactor = 0.2;
    if (age === 'young') ageFactor = 0.3;
    if (age === 'senior') ageFactor = 0.1;
    
    // 4. Financial goals factor
    let goalsFactor = 0.2;
    if (financialGoals) {
      const investmentPercentage = financialGoals.investment || 15;
      // Higher investment percentage might indicate higher risk tolerance
      goalsFactor = 0.2 * Math.min(investmentPercentage / 20, 1.5);
    }
    
    // Calculate overall risk score (0-1 scale)
    const riskScore = volatilityFactor + stabilityFactor + ageFactor + goalsFactor;
    
    // Map to risk tolerance categories
    if (riskScore < 0.4) return 'conservative';
    if (riskScore < 0.7) return 'moderate';
    return 'aggressive';
  }

  /**
   * Calculate savings breakdown based on monthly salary and expenses
   */
  calculateSavingsBreakdown(transactions: Transaction[], profile?: FinancialProfile): SavingsBreakdown {
    const monthlySalary = profile?.monthlySalary || 50000; // Default 50K
    const financialGoals = profile?.financialGoals || {
      savings: 20,
      investment: 15,
      emergency: 10,
      retirement: 10
    };
    
    const monthlyExpenses = this.calculateAverageMonthlyExpenses(transactions);
    const expensePercentage = Math.min(100, Math.round((monthlyExpenses / monthlySalary) * 100));
    
    // Calculate percentages for each category based on goals
    const remainingPercentage = 100 - expensePercentage;
    
    // If expenses exceed income, everything goes to expenses
    if (remainingPercentage <= 0) {
      return {
        expenses: 100,
        savings: 0,
        investment: 0,
        emergency: 0,
        retirement: 0
      };
    }
    
    // Calculate proportional allocation of remaining percentage
    const totalGoalPercentage = (financialGoals.savings || 0) + 
                               (financialGoals.investment || 0) + 
                               (financialGoals.emergency || 0) + 
                               (financialGoals.retirement || 0);
    
    const savingsPercentage = totalGoalPercentage > 0 
      ? Math.round((financialGoals.savings || 0) / totalGoalPercentage * remainingPercentage) 
      : 0;
      
    const investmentPercentage = totalGoalPercentage > 0 
      ? Math.round((financialGoals.investment || 0) / totalGoalPercentage * remainingPercentage) 
      : 0;
      
    const emergencyPercentage = totalGoalPercentage > 0 
      ? Math.round((financialGoals.emergency || 0) / totalGoalPercentage * remainingPercentage) 
      : 0;
      
    const retirementPercentage = totalGoalPercentage > 0 
      ? Math.round((financialGoals.retirement || 0) / totalGoalPercentage * remainingPercentage) 
      : 0;
    
    // Ensure all percentages add up to 100%
    const adjustedTotal = expensePercentage + savingsPercentage + investmentPercentage + emergencyPercentage + retirementPercentage;
    let retirementAdjusted = retirementPercentage;
    
    if (adjustedTotal < 100) {
      retirementAdjusted += (100 - adjustedTotal);
    } else if (adjustedTotal > 100) {
      retirementAdjusted -= (adjustedTotal - 100);
    }
    
    return {
      expenses: expensePercentage,
      savings: savingsPercentage,
      investment: investmentPercentage,
      emergency: emergencyPercentage,
      retirement: retirementAdjusted
    };
  }

  /**
   * Find savings opportunities based on transaction patterns
   */
  findSavingsOpportunities(transactions: Transaction[]): string[] {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    const opportunities: string[] = [];
    
    // Group expenses by category and merchant
    const categoryData: Record<string, number> = {};
    const merchantData: Record<string, { frequency: number, amount: number }> = {};
    
    // Track subscription-like payments
    const potentialSubscriptions: Record<string, number[]> = {};
    
    transactions.forEach(transaction => {
      // Only consider expenses (negative amounts)
      if (transaction.amount >= 0) return;
      
      const amount = Math.abs(transaction.amount);
      const category = transaction.category || 'Uncategorized';
      const merchant = transaction.title || 'Unknown';
      
      // Accumulate category expenses
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += amount;
      
      // Track merchant frequency and total amount
      if (!merchantData[merchant]) {
        merchantData[merchant] = { frequency: 0, amount: 0 };
      }
      merchantData[merchant].frequency += 1;
      merchantData[merchant].amount += amount;
      
      // Check for potential subscription (similar amounts for same merchant)
      if (!potentialSubscriptions[merchant]) {
        potentialSubscriptions[merchant] = [];
      }
      potentialSubscriptions[merchant].push(amount);
    });
    
    // Check for high-frequency merchants (potential subscriptions)
    for (const merchant in merchantData) {
      const data = merchantData[merchant];
      
      // Look for frequent transactions from the same merchant
      if (data.frequency >= 3) {
        // Check if amounts are similar (potential subscription)
        const amounts = potentialSubscriptions[merchant];
        const avgAmount = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
        
        // Check if amounts are consistent (within 5% of average)
        const consistentAmounts = amounts.filter(amount => 
          Math.abs(amount - avgAmount) / avgAmount < 0.05
        );
        
        if (consistentAmounts.length >= 2) {
          opportunities.push(`Consider reviewing your ${merchant} subscription (₹${Math.round(avgAmount)} per payment).`);
        } else if (data.amount > 5000) {
          opportunities.push(`You've spent ₹${Math.round(data.amount)} at ${merchant} over multiple transactions. Check if you can reduce this expense.`);
        }
      }
    }
    
    // Check for high-spend categories
    const totalExpenses = Object.values(categoryData).reduce((sum, val) => sum + val, 0);
    for (const category in categoryData) {
      const amount = categoryData[category];
      const percentage = (amount / totalExpenses) * 100;
      
      // Suggest savings for categories that take up large percentages
      if (percentage > 25 && amount > 10000) {
        opportunities.push(`Your ${category} expenses account for ${Math.round(percentage)}% of your total spending. Consider setting a budget for this category.`);
      }
      
      // Category-specific suggestions
      switch (category.toLowerCase()) {
        case 'food':
        case 'dining':
        case 'restaurants':
          if (percentage > 15) {
            opportunities.push(`Reducing dining out by preparing more meals at home could save you approximately ₹${Math.round(amount * 0.3)} per month.`);
          }
          break;
          
        case 'entertainment':
        case 'shopping':
          if (amount > 5000) {
            opportunities.push(`Consider setting a monthly budget for ${category} to reduce impulse purchases.`);
          }
          break;
          
        case 'utilities':
          if (percentage > 10) {
            opportunities.push(`Your utility bills seem high. Check for energy-saving opportunities.`);
          }
          break;
          
        case 'transportation':
          if (amount > 3000) {
            opportunities.push(`Consider carpooling or public transport to reduce your transportation expenses.`);
          }
          break;
      }
    }
    
    // If few opportunities found, add generic ones
    if (opportunities.length < 2) {
      opportunities.push(`Track your daily expenses to identify areas where you can cut back.`);
      opportunities.push(`Set up automatic transfers to your savings account on payday to build savings consistently.`);
    }
    
    return opportunities;
  }

  /**
   * Generate comprehensive financial insights
   */
  generateFinancialInsights(transactions: Transaction[], profile?: FinancialProfile): FinancialInsights {
    // Generate all components of financial insights
    const expenseForecast = this.predictExpenses(transactions);
    const categoryAnalysis = this.analyzeCategories(transactions);
    const investmentSuggestions = this.generateInvestmentSuggestions(transactions, profile);
    const savingsBreakdown = this.calculateSavingsBreakdown(transactions, profile);
    const savingsOpportunities = this.findSavingsOpportunities(transactions);
    
    // Generate a summary based on the analysis
    let summary = "";
    
    // Add expense forecast summary
    if (expenseForecast.length > 0) {
      const nextMonth = expenseForecast[0];
      summary += `Your expected expenses for next month are ₹${nextMonth.predictedAmount.toLocaleString('en-IN')}, `;
      
      if (nextMonth.percentChange > 0) {
        summary += `an increase of ${nextMonth.percentChange}% from current month. `;
      } else if (nextMonth.percentChange < 0) {
        summary += `a decrease of ${Math.abs(nextMonth.percentChange)}% from current month. `;
      } else {
        summary += `which is consistent with your current spending. `;
      }
    }
    
    // Add category analysis summary
    if (categoryAnalysis.length > 0) {
      const topCategory = categoryAnalysis[0];
      summary += `Your highest spending category is ${topCategory.category} at ${topCategory.monthlyPercentage}% of your monthly expenses. `;
      
      if (topCategory.trend === 'increasing') {
        summary += `This category has been trending upward. `;
      } else if (topCategory.trend === 'decreasing') {
        summary += `This category has been trending downward, which is good. `;
      }
    }
    
    // Add investment suggestion summary
    if (investmentSuggestions.length > 0) {
      summary += `Based on your profile, we recommend a ${investmentSuggestions[0].riskLevel} risk investment approach. `;
    }
    
    // Add savings breakdown summary
    if (savingsBreakdown.expenses > 80) {
      summary += `Your expenses currently consume ${savingsBreakdown.expenses}% of your income, which is high. `;
      summary += `Try to reduce expenses to increase your savings rate. `;
    } else if (savingsBreakdown.expenses < 60) {
      summary += `You're doing well with expenses at ${savingsBreakdown.expenses}% of income, leaving room for saving and investing. `;
    } else {
      summary += `Your expense-to-income ratio is ${savingsBreakdown.expenses}%, which is reasonable but could be improved. `;
    }
    
    // Add savings opportunities summary
    if (savingsOpportunities.length > 0) {
      summary += `We've identified ${savingsOpportunities.length} opportunities to optimize your finances further.`;
    }
    
    return {
      expenseForecast,
      categoryAnalysis,
      investmentSuggestions,
      savingsBreakdown,
      savingsOpportunities,
      summary
    };
  }
}

// Singleton for reuse
let modelInstance: AdvancedFinancialModel | null = null;

export const getFinancialModel = (): AdvancedFinancialModel => {
  if (!modelInstance) {
    modelInstance = new AdvancedFinancialModel();
  }
  return modelInstance;
}; 