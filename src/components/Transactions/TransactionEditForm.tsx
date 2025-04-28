import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { useTransactionCategorizer } from '@/hooks/useTransactionCategorizer';
import { toast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface TransactionEditFormProps {
  id: string;
  onSuccess?: () => void;
}

const TransactionEditForm: React.FC<TransactionEditFormProps> = ({ id, onSuccess }) => {
  const { transactions, categories, updateTransaction, getCategoryById } = useExpense();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { predictCategory, addFeedback, isModelTrained } = useTransactionCategorizer();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const [originalCategoryId, setOriginalCategoryId] = useState('');
  const [suggestion, setSuggestion] = useState<{ categoryId: string; confidence: number } | null>(null);
  const [usedSuggestion, setUsedSuggestion] = useState(false);
  
  useEffect(() => {
    const foundTransaction = transactions.find(t => t.id === id);
    if (foundTransaction) {
      setTransaction(foundTransaction);
      setDescription(foundTransaction.description);
      setAmount(foundTransaction.amount.toString());
      setCategoryId(foundTransaction.categoryId);
      setOriginalCategoryId(foundTransaction.categoryId);
      setDate(foundTransaction.date);
    } else {
      toast({
        title: "Error",
        description: "Transaction not found",
        variant: "destructive"
      });
      navigate('/transactions');
    }
  }, [id, transactions, navigate]);
  
  // Get suggestion when description changes
  useEffect(() => {
    if (description.trim().length > 3 && isModelTrained && transaction) {
      const prediction = predictCategory(description);
      if (prediction && prediction.categoryId !== originalCategoryId) {
        setSuggestion(prediction);
      } else {
        setSuggestion(null);
      }
    } else {
      setSuggestion(null);
    }
  }, [description, predictCategory, isModelTrained, transaction, originalCategoryId]);
  
  const handleSuggestionClick = () => {
    if (suggestion) {
      setCategoryId(suggestion.categoryId);
      setUsedSuggestion(true);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId || !user) {
      toast({
        title: 'Error',
        description: !categoryId ? 'Please select a category' : 'You must be logged in',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      updateTransaction(id, {
        date,
        description,
        amount: parseFloat(amount),
        categoryId,
      });
      
      // If the category was changed, add feedback for the ML model
      if (categoryId !== originalCategoryId) {
        addFeedback(description, categoryId);
      }
      
      toast({
        title: 'Success',
        description: 'Transaction updated successfully',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update transaction. Please try again.',
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
  
  if (!transaction) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardContent className="pt-6">
          <p className="text-center">Loading transaction...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" id="transaction-edit-form">
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
        <Button type="submit" form="transaction-edit-form" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Transaction'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TransactionEditForm;
