
import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import TransactionForm from '@/components/Transactions/TransactionForm';
import { useNavigate } from 'react-router-dom';

const NewTransaction = () => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    navigate('/transactions');
  };
  
  return (
    <AppLayout requireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">New Transaction</h1>
          <p className="text-gray-600">Add a new expense record to your account</p>
        </div>
        
        <TransactionForm onSuccess={handleSuccess} />
      </div>
    </AppLayout>
  );
};

export default NewTransaction;
