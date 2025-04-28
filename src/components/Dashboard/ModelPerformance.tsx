import React from 'react';
import { useTransactionCategorizer } from '@/hooks/useTransactionCategorizer';
import { useExpense } from '@/context/ExpenseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Brain } from 'lucide-react';

const ModelPerformance: React.FC = () => {
  const { isModelTrained, modelMetrics, retrainModel } = useTransactionCategorizer();
  const { categories } = useExpense();
  
  if (!isModelTrained || !modelMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Categorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-500">
              AI model is being trained with your transaction data...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Format accuracy percentage
  const formatAccuracy = (accuracy: number) => {
    return `${Math.round(accuracy * 100)}%`;
  };
  
  // Get top performing and worst performing categories
  const categoryPerformance: {
    id: string;
    name: string;
    accuracy: number;
    correct: number;
    total: number;
  }[] = [];
  
  modelMetrics.categoryAccuracy.forEach((stats, categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && stats.total > 0) {
      categoryPerformance.push({
        id: categoryId,
        name: category.name,
        accuracy: stats.accuracy,
        correct: stats.correct,
        total: stats.total
      });
    }
  });
  
  // Sort by accuracy (descending)
  categoryPerformance.sort((a, b) => b.accuracy - a.accuracy);
  
  // Only show categories with at least 2 samples
  const filteredPerformance = categoryPerformance.filter(c => c.total >= 2);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Smart Categorization (AI)
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={retrainModel}
          className="h-8 gap-1"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retrain
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Overall Accuracy</span>
              <span className="text-sm font-medium">{formatAccuracy(modelMetrics.accuracy)}</span>
            </div>
            <Progress value={modelMetrics.accuracy * 100} className="h-2" />
          </div>
          
          {filteredPerformance.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Category Performance</h4>
              {filteredPerformance.slice(0, 5).map(category => (
                <div key={category.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{category.name}</span>
                    <span>
                      {formatAccuracy(category.accuracy)} ({category.correct}/{category.total})
                    </span>
                  </div>
                  <Progress value={category.accuracy * 100} className="h-1.5" />
                </div>
              ))}
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-2">
            <p>The AI model learns from your transactions and improves over time.</p>
            <p className="mt-1">When you correct suggested categories, the model gets smarter.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelPerformance; 