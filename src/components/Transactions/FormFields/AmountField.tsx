import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AmountFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const AmountField: React.FC<AmountFieldProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="amount">Amount (₹)</Label>
      <Input
        id="amount"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};
