// 'use client';

// import MainLayout from '@/components/MainLayout';
// import { useEffect, useState, useRef } from 'react'; // Import useRef
// import { useRouter, useSearchParams } from 'next/navigation';
// import { toast } from 'react-toastify';
// import { useSession } from 'next-auth/react';

// export default function PaymentSuccessPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { update } = useSession(); // Get the update function

//   const [message, setMessage] = useState('Processing your payment...');
//   const [isSuccess, setIsSuccess] = useState(false);

//   // Use a ref to track if the redirect processing has already occurred
//   const hasProcessedRedirect = useRef(false);

//   useEffect(() => {
//     // Only run this logic once per page load
//     if (hasProcessedRedirect.current) {
//       return;
//     }

//     const redirectStatus = searchParams.get('redirect_status');
//     const setupIntentClientSecret = searchParams.get('setup_intent_client_secret');
//     const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret'); // For one-time payments

//     // Only proceed if a relevant Stripe redirect parameter is present
//     if (!redirectStatus && !setupIntentClientSecret && !paymentIntentClientSecret) {
//       setMessage('No payment status found. Redirecting to home...');
//       const timer = setTimeout(() => {
//         router.push('/');
//       }, 3000);
//       return () => clearTimeout(timer);
//     }

//     // Mark as processed to prevent re-running
//     hasProcessedRedirect.current = true;

//     // Handle successful payment intent redirect
//     if (redirectStatus === 'succeeded') {
//       setMessage('Payment successful! Your access will be updated shortly.');
//       setIsSuccess(true);
//       toast.success('Payment successful! Your access will be updated shortly.');
//       update(); // Force session update

//       const timer = setTimeout(() => {
//         router.push('/');
//       }, 3000); // Redirect after 3 seconds
//       return () => clearTimeout(timer);
//     }
//     // Handle failed payment intent redirect
//     else if (redirectStatus === 'failed') {
//       setMessage('Payment failed. Please try again or contact support.');
//       setIsSuccess(false);
//       toast.error('Payment failed. Please try again.');
//       // No session update needed for failure, but still redirect
//       const timer = setTimeout(() => {
//         router.push('/pricing'); // Redirect back to pricing to try again
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//     // Handle processing payment intent redirect
//     else if (redirectStatus === 'processing') {
//       setMessage('Your payment is processing. We will notify you when it completes.');
//       setIsSuccess(false);
//       toast.info('Your payment is processing. We will notify you when it completes.');
//       // No session update needed immediately, as webhook will handle success/failure
//       const timer = setTimeout(() => {
//         router.push('/'); // Redirect to home
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//     // Handle successful setup intent redirect (for subscriptions)
//     else if (setupIntentClientSecret) {
//       setMessage('Payment method setup successfully! Your subscription will be activated shortly.');
//       setIsSuccess(true);
//       toast.success('Payment method setup successful! Your subscription will be activated shortly.');
//       update(); // Force session update

//       const timer = setTimeout(() => {
//         router.push('/');
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//     // Fallback for unexpected states
//     else {
//       setMessage('An unknown payment status occurred. Redirecting to home...');
//       setIsSuccess(false);
//       toast.warn('An unknown payment status occurred.');
//       const timer = setTimeout(() => {
//         router.push('/');
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [searchParams, router, update]); // Dependencies: searchParams, router, update

//   return (
//     <MainLayout title="Payment Status">
//       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
//         {isSuccess ? (
//           <svg className="w-24 h-24 text-green-500 mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//           </svg>
//         ) : (
//           <svg className="w-24 h-24 text-red-500 mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//           </svg>
//         )}
//         <h1 className={`text-4xl font-bold ${isSuccess ? 'text-green-400' : 'text-red-400'} mb-4`}>
//           {isSuccess ? 'Payment Successful!' : 'Payment Failed / Processing'}
//         </h1>
//         <p className="text-lg text-gray-300 max-w-md">{message}</p>
//         <p className="text-sm text-gray-400 mt-2">
//           You will be redirected shortly.
//         </p>
//         <button
//           onClick={() => router.push('/')}
//           className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out"
//         >
//           Go to Home
//         </button>
//       </div>
//     </MainLayout>
//   );
// }


// 'use client'

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useSession } from 'next-auth/react'

// export default function PaymentSuccessPage () {
//   const router = useRouter()
//   const { update } = useSession()

//   useEffect(() => {
//     // Refresh session so Header gets fresh quota immediately
//     update().finally(() => {
//       router.replace('/') // go home once tokens updated
//     })
//   }, [router, update])

//   return (
//     <div className='h-screen flex flex-col items-center justify-center gap-4'>
//       <h1 className='text-xl font-bold'>Payment successful!</h1>
//       <p>Updating your quota…</p>
//     </div>
//   )
// }


// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { useSession } from 'next-auth/react'

// export default function PaymentSuccess () {
//   const router = useRouter()
//   const { update } = useSession()
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const syncQuota = async () => {
//       // 1. Refresh NextAuth session (JWT → DB)
//       await update()

//       // 2. Poll /api/user-tokens until Stripe webhook has updated DB
//       for (let i = 0; i < 10; i++) {
//         const r = await fetch('/api/user-tokens')
//         if (r.ok) {
//           const d = await r.json()
//           if (d.maxTokens > 20) {
//             // Found the updated quota, broadcast & break
//             window.dispatchEvent(
//               new CustomEvent('tokensUpdated', {
//                 detail: {
//                   tokensUsed: d.tokensUsed,
//                   maxTokens: d.maxTokens,
//                   unlimitedAccessUntil: d.unlimitedAccessUntil
//                 }
//               })
//             )
//             break
//           }
//         }
//         await new Promise(res => setTimeout(res, 1500)) // wait 1.5 s
//       }

//       setLoading(false)
//       router.replace('/') // go home
//     }

//     syncQuota()
//   }, [router, update])

//   return (
//     <div className='h-screen flex flex-col items-center justify-center gap-4'>
//       <h1 className='text-2xl font-bold text-green-400'>
//         Payment Successful!
//       </h1>
//       <p className='text-gray-400'>
//         {loading
//           ? 'Updating your token balance…'
//           : 'Redirecting you home…'}
//       </p>
//     </div>
//   )
// }


// 'use client'

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useSession } from 'next-auth/react'

// export default function PaymentSuccess () {
//   const { update } = useSession()
//   const router     = useRouter()

//   useEffect(() => {
//     const fireHeaderUpdate = () => {
//       window.dispatchEvent(
//         new CustomEvent('tokensUpdated', {
//           detail: {
//             tokensUsed: 0,
//             maxTokens:  200,
//             unlimitedAccessUntil: null
//           }
//         })
//       )
//     }

//     const sync = async () => {
//       fireHeaderUpdate()          // instant header change (no flicker)
//       await update()              // refresh NextAuth session
//       router.replace('/')         // back to home
//     }
//     sync()
//   }, [update, router])

//   return (
//     <div className='h-screen flex flex-col items-center justify-center gap-4'>
//       <h1 className='text-2xl font-bold text-green-400'>Payment Successful!</h1>
//       <p className='text-gray-400'>Updating your quota…</p>
//     </div>
//   )
// }


'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function PaymentSuccess () {
  const router           = useRouter()
  const { update }       = useSession()
  const redirectTimerRef = useRef(null)

  useEffect(() => {
    /* 1️⃣  Update header instantly */
    window.dispatchEvent(new CustomEvent('tokensUpdated', {
      detail: { tokensUsed: 0, maxTokens: 200, unlimitedAccessUntil: null }
    }))

    /* 2️⃣  Kick off session refresh */
    const doUpdate = async () => {
      try { await update() } catch { /* ignore */ }
      safeRedirect()
    }
    doUpdate()

    /* 3️⃣  Fallback: redirect after 3 s no matter what */
    redirectTimerRef.current = setTimeout(safeRedirect, 3000)

    /* cleanup: prevent redirect after nav away */
    return () => clearTimeout(redirectTimerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once

  /* redirect helper that runs only once */
  const redirectedRef = useRef(false)
  const safeRedirect = () => {
    if (redirectedRef.current) return
    redirectedRef.current = true
    router.replace('/')
  }

  return (
    <div className='h-screen flex flex-col items-center justify-center gap-4'>
      <h1 className='text-2xl font-bold text-green-400'>Payment Successful!</h1>
      <p className='text-gray-400'>Updating your quota…</p>
      <Link
        href='/'
        className='mt-4 underline text-sm text-purple-400 hover:text-purple-300'
      >
        Go to dashboard now
      </Link>
    </div>
  )
}





