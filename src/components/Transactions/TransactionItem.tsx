
import React from 'react';
import { format } from 'date-fns';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TransactionItemProps {
  transaction: {
    id: string;
    description: string;
    amount: number;
    date: string;
    categoryId: string;
  };
  category?: {
    name: string;
    color: string;
  };
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  category,
  onView,
  onEdit,
  onDelete,
}) => {
  // Format amount as INR
  const formatINR = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      {/* Mobile view */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">{transaction.description}</span>
          <span className="font-semibold">{formatINR(transaction.amount)}</span>
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
            onClick={() => onView(transaction.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(transaction.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700"
            onClick={() => onDelete(transaction.id)}
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
        {formatINR(transaction.amount)}
      </div>
      <div className="hidden md:flex col-span-1 justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              •••
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(transaction.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(transaction.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(transaction.id)}
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
};
