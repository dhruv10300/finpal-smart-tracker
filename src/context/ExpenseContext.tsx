
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Transaction, Category } from '@/types/expense';
import { INITIAL_CATEGORIES } from '@/data/categories';
import { SAMPLE_TRANSACTIONS } from '@/data/transactions';
import { useExpenseUtils } from '@/hooks/useExpenseUtils';

interface ExpenseContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  getTotalExpense: () => number;
  getMonthlyTotal: (month: number, year: number) => number;
  getCategoryById: (id: string) => Category | undefined;
  formatCurrency: (amount: number) => string;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const { user } = useAuth();
  const { formatCurrency, getTransactionsByCategory, getTotalExpense, getMonthlyTotal } = useExpenseUtils();

  useEffect(() => {
    if (user) {
      const userTransactions = SAMPLE_TRANSACTIONS.filter(t => t.userId === user.id);
      setTransactions(userTransactions);
    } else {
      setTransactions([]);
    }
  }, [user]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tr-${Date.now()}`,
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...data } : transaction
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        categories,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionsByCategory: (categoryId) => getTransactionsByCategory(transactions, categoryId),
        getTotalExpense: () => getTotalExpense(transactions),
        getMonthlyTotal: (month, year) => getMonthlyTotal(transactions, month, year),
        getCategoryById,
        formatCurrency,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
