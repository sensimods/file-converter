import MainLayout from '@/components/MainLayout';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Register - Morpho Tools',
  description: 'Create a new Morpho account to get started with our document and image tools.',
};

export default function RegisterPage() {
  return (
    <MainLayout title="Create Your Account">
      <div className="flex justify-center items-center py-10">
        <RegisterForm />
      </div>
    </MainLayout>
  );
}
