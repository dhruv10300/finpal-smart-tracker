import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpense } from '@/context/ExpenseContext';
import AppLayout from '@/components/Layout/AppLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, getCategoryById, deleteTransaction } = useExpense();
  
  const transaction = transactions.find(t => t.id === id);
  const category = transaction ? getCategoryById(transaction.categoryId) : null;
  
  const handleDelete = () => {
    if (id) {
      deleteTransaction(id);
      navigate('/transactions');
    }
  };
  
  if (!transaction) {
    return (
      <AppLayout requireAuth>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center py-8">Transaction not found</p>
              <div className="flex justify-center">
                <Button onClick={() => navigate('/transactions')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Transactions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout requireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/transactions')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Transaction Details</h1>
          <p className="text-gray-600">View and manage your expense record</p>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{transaction.description}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                <p className="text-xl font-semibold">₹{transaction.amount.toFixed(2)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p>{format(new Date(transaction.date), 'MMMM d, yyyy')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <div className="flex items-center mt-1">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: category?.color || '#cccccc' }}
                  ></span>
                  <span>{category?.name || 'Unknown'}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
                <p className="text-sm font-mono">{transaction.id}</p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this
                    transaction from your records.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TransactionDetail;
