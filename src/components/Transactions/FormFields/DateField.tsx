
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const DateField: React.FC<DateFieldProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="date">Date</Label>
      <div className="relative">
        <Input
          id="date"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
          required
        />
        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
};
