
import React, { useState, useMemo } from 'react';
import { useExpense } from '@/context/ExpenseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Search, 
  Plus, 
  ArrowUpDown,
  Trash2,
  Edit
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TransactionList: React.FC = () => {
  const { transactions, categories, getCategoryById, deleteTransaction } = useExpense();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter(transaction => {
        // Search filter
        const matchesSearch = transaction.description
          .toLowerCase()
          .includes(search.toLowerCase());
          
        // Category filter
        const matchesCategory = !categoryFilter || transaction.categoryId === categoryFilter;
        
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        // Sort by selected field
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
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-[180px]">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center">
                      <span
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      ></span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 py-3 px-4 font-medium text-sm text-gray-500 bg-gray-50 rounded-t-lg">
          <div className="col-span-5">Description</div>
          <div className="col-span-2">Category</div>
          <div 
            className="col-span-2 flex items-center cursor-pointer"
            onClick={() => toggleSort('date')}
          >
            Date
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </div>
          <div 
            className="col-span-2 flex items-center cursor-pointer"
            onClick={() => toggleSort('amount')}
          >
            Amount
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        
        {/* Transaction list */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-2">
            {filteredTransactions.map(transaction => {
              const category = getCategoryById(transaction.categoryId);
              return (
                <div 
                  key={transaction.id} 
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Mobile view */}
                  <div className="md:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{transaction.description}</span>
                      <span className="font-semibold">${transaction.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <span
                          className="w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: category?.color || '#cccccc' }}
                        ></span>
                        {category?.name}
                      </div>
                      <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deleteTransaction(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Desktop view */}
                  <div className="hidden md:block col-span-5 font-medium">
                    {transaction.description}
                  </div>
                  <div className="hidden md:flex col-span-2 items-center">
                    <span
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: category?.color || '#cccccc' }}
                    ></span>
                    <span className="text-sm">{category?.name}</span>
                  </div>
                  <div className="hidden md:block col-span-2 text-gray-600">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </div>
                  <div className="hidden md:block col-span-2 font-semibold">
                    ${transaction.amount.toFixed(2)}
                  </div>
                  <div className="hidden md:flex col-span-1 justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          •••
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/transactions/edit/${transaction.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteTransaction(transaction.id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
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
      </CardContent>
    </Card>
  );
};

export default TransactionList;
