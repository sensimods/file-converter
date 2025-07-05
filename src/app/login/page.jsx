// document-pro/src/app/login/page.jsx
import MainLayout from '@/components/MainLayout';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login - Morpho Tools',
  description: 'Login to your Morpho account to access premium features and manage your tokens.',
};

export default function LoginPage() {
  return (
    <MainLayout title="Login to Your Account">
      <div className="flex justify-center items-center py-10">
        <LoginForm />
      </div>
    </MainLayout>
  );
}
