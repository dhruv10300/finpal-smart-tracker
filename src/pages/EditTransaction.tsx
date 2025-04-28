
import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import TransactionEditForm from '@/components/Transactions/TransactionEditForm';
import { useNavigate, useParams } from 'react-router-dom';

const EditTransaction = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const handleSuccess = () => {
    navigate('/transactions');
  };
  
  return (
    <AppLayout requireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Transaction</h1>
          <p className="text-gray-600">Update your expense record</p>
        </div>
        
        {id && <TransactionEditForm id={id} onSuccess={handleSuccess} />}
      </div>
    </AppLayout>
  );
};

export default EditTransaction;
