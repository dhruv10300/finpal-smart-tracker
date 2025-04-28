
import React, { useState, useEffect } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DescriptionField } from './FormFields/DescriptionField';
import { AmountField } from './FormFields/AmountField';
import { CategoryField } from './FormFields/CategoryField';
import { DateField } from './FormFields/DateField';

interface TransactionEditFormProps {
  id: string;
  onSuccess?: () => void;
}

const TransactionEditForm: React.FC<TransactionEditFormProps> = ({ id, onSuccess }) => {
  const { transactions, categories, updateTransaction } = useExpense();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  
  useEffect(() => {
    const foundTransaction = transactions.find(t => t.id === id);
    if (foundTransaction) {
      setTransaction(foundTransaction);
      setDescription(foundTransaction.description);
      setAmount(foundTransaction.amount.toString());
      setCategoryId(foundTransaction.categoryId);
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
        <form onSubmit={handleSubmit} className="space-y-4" id="transaction-form">
          <DescriptionField value={description} onChange={setDescription} />
          <AmountField value={amount} onChange={setAmount} />
          <CategoryField 
            value={categoryId} 
            onChange={setCategoryId}
            categories={categories}
          />
          <DateField value={date} onChange={setDate} />
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/transactions')}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="transaction-form"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Transaction'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TransactionEditForm;
