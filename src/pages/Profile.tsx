import React, { useState } from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { User, Settings, LogOut, Wallet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

const Profile = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [monthlySalary, setMonthlySalary] = useState(user?.monthlySalary || 0);
  const [ageGroup, setAgeGroup] = useState<'young' | 'adult' | 'senior'>(user?.ageGroup || 'adult');
  const [savingsGoal, setSavingsGoal] = useState(user?.financialGoals?.savings || 30);
  const [investmentGoal, setInvestmentGoal] = useState(user?.financialGoals?.investment || 20);
  const [emergencyGoal, setEmergencyGoal] = useState(user?.financialGoals?.emergency || 10);
  const [retirementGoal, setRetirementGoal] = useState(user?.financialGoals?.retirement || 10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app, this would call an API to update the profile
    setTimeout(() => {
      // Update user info in local storage with new fields
      if (user) {
        const updatedUser = {
          ...user,
          name,
          email,
          monthlySalary,
          ageGroup,
          financialGoals: {
            savings: savingsGoal,
            investment: investmentGoal,
            emergency: emergencyGoal,
            retirement: retirementGoal
          }
        };
        localStorage.setItem('finpal_user', JSON.stringify(updatedUser));
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });
      setIsSubmitting(false);
    }, 800);
  };
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };
  
  return (
    <AppLayout requireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">User Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        
        <Tabs defaultValue="profile" className="max-w-3xl mx-auto">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="financial">
              <Wallet className="mr-2 h-4 w-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </div>
                </form>
                
                <div className="border-t mt-8 pt-6">
                  <h3 className="font-medium mb-4">Account Actions</h3>
                  <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Monthly Salary (₹)</Label>
                    <Input
                      id="salary"
                      type="number"
                      placeholder="Enter your monthly salary"
                      value={monthlySalary}
                      onChange={(e) => setMonthlySalary(Number(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This helps us provide personalized financial insights
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ageGroup">Age Group</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <Button 
                        type="button"
                        variant={ageGroup === 'young' ? 'default' : 'outline'} 
                        className="w-full"
                        onClick={() => setAgeGroup('young')}
                      >
                        Young (18-30)
                      </Button>
                      <Button 
                        type="button"
                        variant={ageGroup === 'adult' ? 'default' : 'outline'} 
                        className="w-full"
                        onClick={() => setAgeGroup('adult')}
                      >
                        Adult (31-55)
                      </Button>
                      <Button 
                        type="button"
                        variant={ageGroup === 'senior' ? 'default' : 'outline'} 
                        className="w-full"
                        onClick={() => setAgeGroup('senior')}
                      >
                        Senior (55+)
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This helps tailor investment suggestions based on your age group
                    </p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-4">Financial Goals (% of Income)</h3>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="savings-goal">Savings Goal</Label>
                          <span className="text-sm font-medium">{savingsGoal}%</span>
                        </div>
                        <Slider 
                          id="savings-goal"
                          value={[savingsGoal]} 
                          min={0} 
                          max={100} 
                          step={5} 
                          onValueChange={(value) => setSavingsGoal(value[0])}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="investment-goal">Investment Goal</Label>
                          <span className="text-sm font-medium">{investmentGoal}%</span>
                        </div>
                        <Slider 
                          id="investment-goal"
                          value={[investmentGoal]} 
                          min={0} 
                          max={100} 
                          step={5} 
                          onValueChange={(value) => setInvestmentGoal(value[0])}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="emergency-goal">Emergency Fund Goal</Label>
                          <span className="text-sm font-medium">{emergencyGoal}%</span>
                        </div>
                        <Slider 
                          id="emergency-goal"
                          value={[emergencyGoal]} 
                          min={0} 
                          max={100} 
                          step={5} 
                          onValueChange={(value) => setEmergencyGoal(value[0])}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="retirement-goal">Retirement Goal</Label>
                          <span className="text-sm font-medium">{retirementGoal}%</span>
                        </div>
                        <Slider 
                          id="retirement-goal"
                          value={[retirementGoal]} 
                          min={0} 
                          max={100} 
                          step={5} 
                          onValueChange={(value) => setRetirementGoal(value[0])}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Save Financial Settings'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      defaultValue="INR"
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Currency options will be available in a future update
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Input
                      id="dateFormat"
                      defaultValue="MM/DD/YYYY"
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Date format options will be available in a future update
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;
