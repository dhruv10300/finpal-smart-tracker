import { useState, useEffect } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { getCategorizer, TransactionCategorizer } from '@/lib/ml-categorization';

interface CategorizationResult {
  categoryId: string;
  confidence: number;
}

export const useTransactionCategorizer = () => {
  const { transactions, categories } = useExpense();
  const [categorizer, setCategorizer] = useState<TransactionCategorizer | null>(null);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [modelMetrics, setModelMetrics] = useState<{ 
    accuracy: number;
    categoryAccuracy: Map<string, { correct: number, total: number, accuracy: number }>;
  } | null>(null);

  // Initialize and train the model on first load
  useEffect(() => {
    if (transactions.length > 0 && categories.length > 0) {
      try {
        const categorizerInstance = getCategorizer();
        
        // Train the model with 80% of transactions
        const trainTestSplit = 0.8;
        const splitIndex = Math.floor(transactions.length * trainTestSplit);
        
        // Shuffle transactions for better training
        const shuffledTransactions = [...transactions].sort(() => Math.random() - 0.5);
        
        const trainingData = shuffledTransactions.slice(0, splitIndex);
        const testData = shuffledTransactions.slice(splitIndex);
        
        // Train the model
        categorizerInstance.train(trainingData, categories);
        
        // Evaluate the model
        if (testData.length > 0) {
          const metrics = categorizerInstance.evaluateModel(testData);
          setModelMetrics(metrics);
        }
        
        setCategorizer(categorizerInstance);
        setIsModelTrained(true);
      } catch (error) {
        console.error('Error training categorization model:', error);
      }
    }
  }, [transactions, categories]);

  // Predict category for a new transaction description
  const predictCategory = (description: string): CategorizationResult | null => {
    if (!categorizer || !isModelTrained) {
      return null;
    }
    
    try {
      return categorizer.predict(description);
    } catch (error) {
      console.error('Error predicting category:', error);
      return null;
    }
  };

  // Add feedback when user corrects a category
  const addFeedback = (description: string, actualCategoryId: string): void => {
    if (!categorizer) return;
    
    categorizer.addFeedback(description, actualCategoryId);
  };

  // Retrain the model with feedback
  const retrainModel = (): void => {
    if (!categorizer || transactions.length === 0 || categories.length === 0) return;
    
    try {
      categorizer.retrainWithFeedback(transactions, categories);
      
      // Re-evaluate the model
      const metrics = categorizer.evaluateModel(transactions);
      setModelMetrics(metrics);
    } catch (error) {
      console.error('Error retraining categorization model:', error);
    }
  };

  return {
    predictCategory,
    addFeedback,
    retrainModel,
    isModelTrained,
    modelMetrics
  };
}; 