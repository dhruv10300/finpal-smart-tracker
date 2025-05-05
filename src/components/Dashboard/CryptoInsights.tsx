import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CryptoInfo {
  name: string;
  symbol: string;
  risk: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
}

const cryptoData: CryptoInfo[] = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    risk: 'medium',
    description: 'The original cryptocurrency, often considered digital gold and a store of value.',
    recommendation: 'Suitable for long-term holdings. Consider allocating 5-10% of your high-risk investment funds.'
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    risk: 'medium',
    description: 'A blockchain platform for decentralized applications and smart contracts.',
    recommendation: 'Good for diversification alongside Bitcoin. Consider equal or slightly lower allocation than BTC.'
  },
  {
    name: 'Stablecoins',
    symbol: 'USDT/USDC',
    risk: 'low',
    description: 'Cryptocurrencies designed to maintain a stable value, usually pegged to fiat currencies like USD.',
    recommendation: 'Useful for emergency funds within crypto or as temporary holdings during market volatility.'
  },
  {
    name: 'Altcoins',
    symbol: 'Various',
    risk: 'high',
    description: 'Alternative cryptocurrencies beyond Bitcoin and Ethereum, often with specific use cases.',
    recommendation: 'Only invest small amounts you can afford to lose. Research thoroughly before investing.'
  }
];

const educationContent = [
  {
    title: 'What is Cryptocurrency?',
    content: 'Cryptocurrency is a digital or virtual currency that uses cryptography for security and operates on decentralized networks based on blockchain technology.'
  },
  {
    title: 'Understanding Blockchain',
    content: 'Blockchain is a distributed ledger technology that records all transactions across many computers so that records cannot be altered retroactively.'
  },
  {
    title: 'Investment Basics',
    content: 'Cryptocurrencies are highly volatile and speculative investments. Always do your research (DYOR), never invest more than you can afford to lose, and consider dollar-cost averaging instead of lump-sum investments.'
  }
];

const risksContent = [
  {
    title: 'Volatility Risk',
    content: 'Crypto prices can fluctuate dramatically in short periods, sometimes losing significant value.'
  },
  {
    title: 'Regulatory Risk',
    content: 'Government regulations can impact cryptocurrency values and legality in different jurisdictions.'
  },
  {
    title: 'Technical Risk',
    content: 'Security breaches, scams, and loss of private keys can result in permanent loss of assets.'
  }
];

const CryptoInsights: React.FC = () => {
  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">₿</span> Cryptocurrency Insights
        </CardTitle>
        <CardDescription>
          Educational insights and investment considerations for crypto assets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Investment Insight</AlertTitle>
              <AlertDescription className="text-blue-700">
                Crypto assets can be part of a diversified portfolio but should generally be limited to 5-15% of your total investments based on your risk tolerance.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              {cryptoData.map((crypto, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{crypto.name} ({crypto.symbol})</div>
                    <Badge className={getRiskBadgeColor(crypto.risk)}>
                      {crypto.risk.charAt(0).toUpperCase() + crypto.risk.slice(1)} Risk
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{crypto.description}</p>
                  <div className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 text-blue-600" />
                    <span>Recommendation:</span>
                  </div>
                  <p className="text-sm">{crypto.recommendation}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="education" className="space-y-4">
            {educationContent.map((item, index) => (
              <div key={index} className="border rounded-lg p-3">
                <h3 className="font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.content}</p>
              </div>
            ))}
            
            <Alert className="bg-blue-50 border-blue-200">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Pro Tip</AlertTitle>
              <AlertDescription className="text-blue-700">
                Consider starting with small amounts and learning about the technology and market dynamics before increasing your exposure.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="risks" className="space-y-4">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Important</AlertTitle>
              <AlertDescription className="text-amber-700">
                Cryptocurrency investments carry significant risks and may not be suitable for all investors. Always conduct thorough research before investing.
              </AlertDescription>
            </Alert>
            
            {risksContent.map((item, index) => (
              <div key={index} className="border rounded-lg p-3">
                <h3 className="font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.content}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CryptoInsights; 