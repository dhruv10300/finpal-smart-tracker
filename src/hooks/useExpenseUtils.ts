
import { Transaction } from '@/types/expense';

export const useExpenseUtils = () => {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const getTransactionsByCategory = (transactions: Transaction[], categoryId: string) => {
    return transactions.filter(transaction => transaction.categoryId === categoryId);
  };

  const getTotalExpense = (transactions: Transaction[]) => {
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const getMonthlyTotal = (transactions: Transaction[], month: number, year: number) => {
    return transactions
      .filter(transaction => {
        const date = new Date(transaction.date);
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  return {
    formatCurrency,
    getTransactionsByCategory,
    getTotalExpense,
    getMonthlyTotal,
  };
};
