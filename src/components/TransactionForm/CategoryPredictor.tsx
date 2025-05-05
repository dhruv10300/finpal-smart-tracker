import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useExpense } from '@/context/ExpenseContext';
import { getCategorizer } from '@/lib/ml-categorization';
import { Category } from '@/types/expense';
import { CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

interface CategoryPredictorProps {
  description: string;
  date: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryPredictor: React.FC<CategoryPredictorProps> = ({
  description,
  date,
  onSelectCategory
}) => {
  const { categories, transactions } = useExpense();
  const [predictions, setPredictions] = useState<{
    categoryId: string;
    confidence: number;
    category?: Category;
  }[]>([]);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    if (!description || description.length < 3) {
      setPredictions([]);
      return;
    }

    try {
      // Train the model if needed (first time)
      const categorizer = getCategorizer();
      if (transactions.length > 0) {
        setIsTraining(true);
        
        // Using setTimeout to avoid blocking the UI during training
        setTimeout(() => {
          categorizer.train(transactions, categories);
          
          // Get prediction
          const mainPrediction = categorizer.predict(description, date);
          
          // Get alternative predictions by simulating the model without the main prediction
          const alternativePredictions: typeof predictions = []; 
          
          // Find predicted category
          const predictedCategory = categories.find(c => c.id === mainPrediction.categoryId);
          
          // Format predictions with category information
          const formattedPredictions = [
            {
              categoryId: mainPrediction.categoryId,
              confidence: mainPrediction.confidence,
              category: predictedCategory
            }
          ];
          
          // Add alternative predictions (for future enhancement)
          
          setPredictions(formattedPredictions);
          setIsTraining(false);
        }, 0);
      }
    } catch (error) {
      console.error("Error predicting category:", error);
      setPredictions([]);
      setIsTraining(false);
    }
  }, [description, date, transactions, categories]);

  if (predictions.length === 0) {
    return null;
  }

  const prediction = predictions[0];
  const confidenceLevel = 
    prediction.confidence > 0.8 ? 'high' :
    prediction.confidence > 0.5 ? 'medium' : 'low';

  return (
    <Alert className={
      confidenceLevel === 'high' ? 'bg-green-50 border-green-200' :
      confidenceLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' :
      'bg-gray-50 border-gray-200'
    }>
      <div className="flex items-start">
        {confidenceLevel === 'high' ? (
          <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
        ) : (
          <AlertCircleIcon className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
        )}
        
        <div className="flex-1">
          <AlertDescription className="text-sm">
            {isTraining ? (
              "Analyzing transaction..."
            ) : (
              <>
                <span className="font-medium">
                  {confidenceLevel === 'high' 
                    ? 'Suggested category: ' 
                    : confidenceLevel === 'medium'
                    ? 'Possible category: '
                    : 'Category suggestion: '
                  }
                </span>
                <span className="text-sm"
                  style={{ color: prediction.category?.color }}
                >
                  {prediction.category?.name || 'Unknown'}
                </span>
                <div className="mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => onSelectCategory(prediction.categoryId)}
                  >
                    Use this category
                  </Button>
                </div>
              </>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default CategoryPredictor; 