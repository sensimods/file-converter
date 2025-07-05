'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
)
const appearance = { theme: 'stripe' }

/**
 * Top-level wrapper that:
 *   1. Creates a Setup Intent via /api/stripe/create-setup-intent
 *   2. Injects the clientSecret into <Elements>
 */
export default function SubscriptionPaymentForm ({ priceId }) {
  const { data: session, status } = useSession()

  const [clientSecret, setClientSecret] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    const init = async () => {
      if (status === 'loading') return

      if (status === 'unauthenticated') {
        setMsg('Please log in to subscribe.')
        return
      }

      if (!priceId) {
        setMsg('Select a plan first.')
        return
      }

      setLoading(true)
      try {
        const res = await fetch('/api/stripe/create-setup-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id, priceId })
        })
        const data = await res.json()
        if (!res.ok) {
          setMsg(data.error || 'Unable to start payment flow')
        } else {
          setClientSecret(data.clientSecret)
        }
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [status, priceId, session])

  if (!clientSecret)
    return msg ? <p className='text-sm text-red-400'>{msg}</p> : null

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <InnerForm clientSecret={clientSecret} />
    </Elements>
  )
}

/**
 * The actual payment form rendered inside <Elements>
 */
function InnerForm ({ clientSecret }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)

    /* 1️⃣ First collect & validate the PaymentElement fields */
    const { error: submitError } = await elements.submit()
    if (submitError) {
      toast.error(submitError.message)
      setLoading(false)
      return
    }

    /* 2️⃣ Then confirm the Setup Intent */
    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`
      }
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    /* 3️⃣ If Stripe didn’t redirect (no 3-DS required), route manually */
    if (setupIntent?.status === 'succeeded') {
      router.push(
        `/payment-success?setup_intent_client_secret=${setupIntent.client_secret}`
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <PaymentElement />

      <button
        type='submit'
        disabled={!stripe || loading}
        className='w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold disabled:opacity-50'
      >
        {loading ? 'Processing…' : 'Subscribe'}
      </button>
    </form>
  )
}
