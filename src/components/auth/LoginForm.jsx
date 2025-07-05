// document-pro/src/components/auth/LoginForm.jsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss(); // Clear any existing toasts

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false, // Prevent redirect on sign-in attempt
        email,
        password,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Logged in successfully!');
        // Dispatch a custom event to trigger token update in other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tokensUpdated', {
            detail: {
              tokensUsed: null, // Trigger refetch
              maxTokens: null,
              isSubscriber: null,
            }
          }));
        }
        router.push('/'); // Redirect to homepage or dashboard
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
      <h2 className="text-3xl font-bold mb-6 text-purple-400">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Login'
          )}
        </button>
      </form>
      <p className="mt-6 text-gray-300">
        Don't have an account?{' '}
        <Link href="/register" className="text-purple-400 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
