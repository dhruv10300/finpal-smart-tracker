import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface InvestmentAllocationTableProps {
  allocation: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyAmount: number;
}

const InvestmentAllocationTable: React.FC<InvestmentAllocationTableProps> = ({
  allocation,
  monthlyAmount
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Distribution</CardTitle>
        <CardDescription>
          Monthly and yearly allocation breakdown based on your investment plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Investment Type</TableHead>
              <TableHead className="text-right">Allocation</TableHead>
              <TableHead className="text-right">Monthly</TableHead>
              <TableHead className="text-right">Yearly</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocation.map((item) => {
              const monthlyAllocation = (monthlyAmount * item.value) / 100;
              const yearlyAllocation = monthlyAllocation * 12;
              
              return (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.value}%</TableCell>
                  <TableCell className="text-right">₹{Math.round(monthlyAllocation).toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{Math.round(yearlyAllocation).toLocaleString()}</TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-gray-50 font-medium">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">100%</TableCell>
              <TableCell className="text-right">₹{Math.round(monthlyAmount).toLocaleString()}</TableCell>
              <TableCell className="text-right">₹{Math.round(monthlyAmount * 12).toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>* Investment amounts are calculated based on your selected monthly contribution.</p>
          <p>* Actual returns may vary based on market conditions and specific investment choices.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentAllocationTable; 