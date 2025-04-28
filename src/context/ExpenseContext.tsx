
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Define types
export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  categoryId: string;
  userId: string;
}

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

// Create the context
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Sample categories
const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Food & Dining', color: '#FF6384' },
  { id: 'cat-2', name: 'Transportation', color: '#36A2EB' },
  { id: 'cat-3', name: 'Entertainment', color: '#FFCE56' },
  { id: 'cat-4', name: 'Housing', color: '#4BC0C0' },
  { id: 'cat-5', name: 'Utilities', color: '#9966FF' },
  { id: 'cat-6', name: 'Shopping', color: '#FF9F40' },
  { id: 'cat-7', name: 'Healthcare', color: '#8AC926' },
  { id: 'cat-8', name: 'Other', color: '#1982C4' },
];

// Sample transactions
const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tr-1',
    date: '2025-04-25',
    description: 'Grocery shopping at Whole Foods',
    amount: 7500.32,
    categoryId: 'cat-1',
    userId: '1',
  },
  {
    id: 'tr-2',
    date: '2025-04-24',
    description: 'Uber ride to airport',
    amount: 3500.50,
    categoryId: 'cat-2',
    userId: '1',
  },
  {
    id: 'tr-3',
    date: '2025-04-23',
    description: 'Movie tickets',
    amount: 2200.00,
    categoryId: 'cat-3',
    userId: '1',
  },
  {
    id: 'tr-4',
    date: '2025-04-22',
    description: 'Monthly rent payment',
    amount: 25000.00,
    categoryId: 'cat-4',
    userId: '1',
  },
  {
    id: 'tr-5',
    date: '2025-04-21',
    description: 'Electricity bill',
    amount: 3500.43,
    categoryId: 'cat-5',
    userId: '1',
  },
  {
    id: 'tr-6',
    date: '2025-04-20',
    description: 'New shoes from Nike',
    amount: 6999.99,
    categoryId: 'cat-6',
    userId: '1',
  },
  {
    id: 'tr-7',
    date: '2025-04-19',
    description: 'Doctor visit copay',
    amount: 1200.00,
    categoryId: 'cat-7',
    userId: '1',
  },
  {
    id: 'tr-8',
    date: '2025-04-18',
    description: 'Coffee shop',
    amount: 350.75,
    categoryId: 'cat-1',
    userId: '1',
  },
  // Adding more historical data for the ML model to use
  {
    id: 'tr-9',
    date: '2025-03-15',
    description: 'Grocery shopping',
    amount: 6800.50,
    categoryId: 'cat-1',
    userId: '1',
  },
  {
    id: 'tr-10',
    date: '2025-03-10',
    description: 'Gas bill',
    amount: 2500.00,
    categoryId: 'cat-5',
    userId: '1',
  },
  {
    id: 'tr-11',
    date: '2025-02-28',
    description: 'Monthly rent payment',
    amount: 25000.00,
    categoryId: 'cat-4',
    userId: '1',
  },
  {
    id: 'tr-12',
    date: '2025-02-15',
    description: 'Restaurant dinner',
    amount: 4200.00,
    categoryId: 'cat-1',
    userId: '1',
  },
];

// Provider component
export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const { user } = useAuth();

  // Load transactions on mount or when user changes
  useEffect(() => {
    if (user) {
      // In a real app, we would fetch from an API
      // For now, filter the sample data for the current user
      const userTransactions = SAMPLE_TRANSACTIONS.filter(t => t.userId === user.id);
      setTransactions(userTransactions);
    } else {
      setTransactions([]);
    }
  }, [user]);

  // Format currency as INR
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Add a new transaction
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tr-${Date.now()}`,
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
  };

  // Update an existing transaction
  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...data } : transaction
      )
    );
  };

  // Delete a transaction
  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  // Get transactions by category
  const getTransactionsByCategory = (categoryId: string) => {
    return transactions.filter(transaction => transaction.categoryId === categoryId);
  };

  // Get total expenses
  const getTotalExpense = () => {
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  // Get monthly total
  const getMonthlyTotal = (month: number, year: number) => {
    return transactions
      .filter(transaction => {
        const date = new Date(transaction.date);
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  // Get category by ID
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
        getTransactionsByCategory,
        getTotalExpense,
        getMonthlyTotal,
        getCategoryById,
        formatCurrency,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

// Custom hook to use the expense context
export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
