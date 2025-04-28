
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const DescriptionField: React.FC<DescriptionFieldProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Input
        id="description"
        placeholder="e.g., Grocery shopping, Uber ride"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};
