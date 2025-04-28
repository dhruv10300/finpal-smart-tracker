
import React, { useState, useMemo } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { FilterBar } from './FilterBar';
import { TransactionItem } from './TransactionItem';
import { TransactionPagination } from './TransactionPagination';

const TransactionList: React.FC = () => {
  const { transactions, categories, getCategoryById, deleteTransaction } = useExpense();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter(transaction => {
        const matchesSearch = transaction.description
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || transaction.categoryId === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return sortDirection === 'asc'
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
          return sortDirection === 'asc'
            ? a.amount - b.amount
            : b.amount - a.amount;
        }
      });
  }, [transactions, search, categoryFilter, sortBy, sortDirection]);
  
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage, itemsPerPage]);
  
  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transactions</CardTitle>
        <Button onClick={() => navigate('/transactions/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </CardHeader>
      <CardContent>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categories={categories}
        />
        
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 py-3 px-4 font-medium text-sm text-gray-500 bg-gray-50 rounded-t-lg">
          <div className="col-span-5">Description</div>
          <div className="col-span-2">Category</div>
          <div 
            className="col-span-2 flex items-center cursor-pointer"
            onClick={() => toggleSort('date')}
          >
            Date
          </div>
          <div 
            className="col-span-2 flex items-center cursor-pointer"
            onClick={() => toggleSort('amount')}
          >
            Amount
          </div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        
        {/* Transaction list */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2">
            {paginatedTransactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                category={getCategoryById(transaction.categoryId)}
                onView={(id) => navigate(`/transactions/${id}`)}
                onEdit={(id) => navigate(`/transactions/edit/${id}`)}
                onDelete={deleteTransaction}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No transactions found</p>
            <Button onClick={() => navigate('/transactions/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Transaction
            </Button>
          </div>
        )}
        
        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6 flex justify-center">
            <TransactionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
