'use client';

import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const appearanceOptions = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#8B5CF6',
    colorBackground: '#1F2937',
    colorText: '#E5E7EB',
    colorDanger: '#EF4444',
    fontFamily: 'Inter, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    '.Input': {
      backgroundColor: '#374151',
      color: '#E5E7EB',
      padding: '12px',
      borderRadius: '6px',
      border: '1px solid #4B5563',
    },
    '.Input--invalid': {
      borderColor: '#EF4444',
    },
    '.Label': {
      color: '#D1D5DB',
      marginBottom: '8px',
    },
    '.Error': {
      color: '#EF4444',
    },
  },
};


export default function OneTimePaymentForm({ priceId }) {
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  // Fetch client secret for PaymentIntent on component mount or priceId change
  useEffect(() => {
    const fetchClientSecret = async () => {
      if (!priceId) {
        setMessage('No plan selected.');
        setClientSecret(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setMessage('Loading payment form...');
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: priceId,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create Payment Intent.');
        }
        setClientSecret(data.clientSecret);
        setMessage(null);
      } catch (error) {
        console.error('Error fetching client secret:', error);
        setMessage(`Error: ${error.message}`);
        toast.error(`Error initiating payment: ${error.message}`);
        setClientSecret(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientSecret();
  }, [priceId]);

  // Render the Elements provider only when clientSecret is available
  if (!clientSecret) {
    return (
      <div className="text-gray-400 text-center py-4">
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-gray-400 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          message || 'Select a plan to proceed.'
        )}
      </div>
    );
  }

  // Now, the main component directly uses useStripe and useElements
  // because it's wrapped by <Elements> when clientSecret is available.
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: appearanceOptions }}>
      <PaymentFormInner
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        message={message}
        setMessage={setMessage}
        clientSecret={clientSecret} // Pass clientSecret down to the inner form
      />
    </Elements>
  );
}

// Separate inner component to use hooks conditionally
function PaymentFormInner({ isLoading, setIsLoading, message, setMessage, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    toast.dismiss();

    if (!stripe || !elements) {
      setMessage('Stripe.js has not yet loaded.');
      setIsLoading(false);
      return;
    }

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setMessage(submitError.message);
      toast.error(submitError.message);
      setIsLoading(false);
      return;
    }

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (stripeError) {
      if (stripeError.type === 'card_error' || stripeError.type === 'validation_error') {
        setMessage(stripeError.message);
        toast.error(stripeError.message);
      } else {
        setMessage('An unexpected error occurred.');
        toast.error('An unexpected error occurred.');
      }
      setIsLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          `Pay`
        )}
      </button>
      {message && <div id="payment-message" className="text-red-500 text-sm mt-3">{message}</div>}
    </form>
  );
}
