import React, { useState, useEffect } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTransactionCategorizer } from '@/hooks/useTransactionCategorizer';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface TransactionFormProps {
  onSuccess?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess }) => {
  const { addTransaction, categories, getCategoryById } = useExpense();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { predictCategory, addFeedback, isModelTrained } = useTransactionCategorizer();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestion, setSuggestion] = useState<{ categoryId: string; confidence: number } | null>(null);
  const [usedSuggestion, setUsedSuggestion] = useState(false);
  
  // Get suggestion when description changes
  useEffect(() => {
    if (description.trim().length > 3 && isModelTrained) {
      const prediction = predictCategory(description);
      if (prediction) {
        setSuggestion(prediction);
      }
    } else {
      setSuggestion(null);
    }
  }, [description, predictCategory, isModelTrained]);
  
  const handleSuggestionClick = () => {
    if (suggestion) {
      setCategoryId(suggestion.categoryId);
      setUsedSuggestion(true);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId) {
      toast({
        title: 'Error',
        description: 'Please select a category',
        variant: 'destructive',
      });
      return;
    }
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add a transaction',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add the new transaction
      addTransaction({
        date,
        description,
        amount: parseFloat(amount),
        categoryId,
        userId: user.id,
      });
      
      // If the user changed the suggested category, add feedback for the ML model
      if (suggestion && categoryId !== suggestion.categoryId) {
        addFeedback(description, categoryId);
      }
      
      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });
      
      // Reset the form
      setDescription('');
      setAmount('');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setSuggestion(null);
      setUsedSuggestion(false);
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add transaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format confidence as percentage
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" id="transaction-form">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Grocery shopping, Uber ride"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="category">Category</Label>
              {suggestion && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Suggested: 
                  </span>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary-100"
                    onClick={handleSuggestionClick}
                  >
                    {getCategoryById(suggestion.categoryId)?.name || 'Unknown'} ({formatConfidence(suggestion.confidence)})
                  </Badge>
                  {usedSuggestion && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </div>
              )}
            </div>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center">
                      <span
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      ></span>
                      {category.name}
                      {suggestion && suggestion.categoryId === category.id && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Suggested: {formatConfidence(suggestion.confidence)})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isModelTrained && description.length > 0 && description.length <= 3 && (
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Type at least 4 characters for AI category suggestions
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => navigate('/transactions')}>
          Cancel
        </Button>
        <Button type="submit" form="transaction-form" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Transaction'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TransactionForm;
