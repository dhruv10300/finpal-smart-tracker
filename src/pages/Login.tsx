
import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import LoginForm from '@/components/Auth/LoginForm';

const Login = () => {
  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4">
        <LoginForm />
      </div>
    </AppLayout>
  );
};

export default Login;
