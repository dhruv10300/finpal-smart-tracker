
import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import RegisterForm from '@/components/Auth/RegisterForm';

const Register = () => {
  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4">
        <RegisterForm />
      </div>
    </AppLayout>
  );
};

export default Register;
