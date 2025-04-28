
import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import TransactionList from '@/components/Transactions/TransactionList';

const Transactions = () => {
  return (
    <AppLayout requireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-gray-600">View and manage all your expense records</p>
        </div>
        
        <TransactionList />
      </div>
    </AppLayout>
  );
};

export default Transactions;
