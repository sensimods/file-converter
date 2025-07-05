// 'use client';

// import MainLayout from '@/components/MainLayout';
// // import StripeElementsWrapper from '@/components/stripe/StripeElementsWrapper'; // REMOVE THIS IMPORT
// import OneTimePaymentForm from '@/components/stripe/OneTimePaymentForm';
// import SubscriptionPaymentForm from '@/components/stripe/SubscriptionPaymentForm';
// import { useState } from 'react';

// // Define your plan details with their corresponding Price IDs from .env.local
// const plans = [
//   {
//     id: 'monthly-basic',
//     type: 'monthly',
//     name: 'Basic Monthly',
//     price: '$4.99',
//     interval: '/month',
//     description: 'Access to all tools, 200 tokens/day.',
//     features: ['200 Tokens per day', 'Access to all premium features', 'Cancel anytime'],
//     priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_BASIC_PRICE_ID,
//     buttonText: 'Subscribe Basic',
//     borderColor: 'border-purple-600',
//     titleColor: 'text-purple-300',
//     buttonColor: 'bg-purple-600 hover:bg-purple-700',
//   },
//   {
//     id: 'monthly-premium',
//     type: 'monthly',
//     name: 'Premium Monthly',
//     price: '$9.99',
//     interval: '/month',
//     description: '1000 daily tokens for heavy users.',
//     features: ['1000 Tokens per day', 'Priority support', 'Exclusive features'],
//     priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PREMIUM_PRICE_ID,
//     buttonText: 'Subscribe Premium',
//     borderColor: 'border-pink-600',
//     titleColor: 'text-pink-300',
//     buttonColor: 'bg-pink-600 hover:bg-pink-700',
//   },
//   {
//     id: 'onetime-24hr',
//     type: 'onetime',
//     name: '24-Hour Pass',
//     price: '$1.99',
//     interval: '/24 hours',
//     description: 'Unlimited token usage for 24 hours from purchase.',
//     features: ['Unlimited Tokens for 24 hours', 'Perfect for one-off heavy usage', 'No recurring charges'],
//     priceId: process.env.NEXT_PUBLIC_STRIPE_ONETIME_24HR_PRICE_ID,
//     buttonText: 'Get 24-Hour Pass',
//     borderColor: 'border-blue-600',
//     titleColor: 'text-blue-300',
//     buttonColor: 'bg-blue-600 hover:bg-blue-700',
//   },
//   {
//     id: 'onetime-weekly',
//     type: 'onetime',
//     name: 'Weekly Pass',
//     price: '$5.99',
//     interval: '/week',
//     description: 'Unlimited token usage for 7 days from purchase.',
//     features: ['Unlimited Tokens for 7 days', 'Great for short-term projects', 'No recurring charges'],
//     priceId: process.env.NEXT_PUBLIC_STRIPE_ONETIME_WEEKLY_PRICE_ID,
//     buttonText: 'Get Weekly Pass',
//     borderColor: 'border-green-600',
//     titleColor: 'text-green-300',
//     buttonColor: 'bg-green-600 hover:bg-green-700',
//   },
// ];


// export default function PricingPage() {
//   const [selectedPlan, setSelectedPlan] = useState(null); // Stores the selected plan object

//   return (
//     <MainLayout title="Choose Your Plan">
//       <div className="flex flex-col items-center justify-center gap-8 py-8">
//         <p className="text-lg text-gray-300 max-w-2xl text-center">
//           Unlock the full potential of Morpho with our flexible pricing plans. Get more tokens, unlimited access, and enhanced features!
//         </p>

//         {/* Pricing Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
//           {plans.map((plan) => (
//             <div
//               key={plan.id}
//               className={`bg-gray-700 p-8 rounded-lg shadow-xl border ${plan.borderColor} flex flex-col items-center`}
//             >
//               <h2 className={`text-3xl font-bold ${plan.titleColor} mb-4`}>{plan.name}</h2>
//               <p className="text-4xl font-extrabold text-white mb-4">{plan.price}<span className="text-lg font-normal text-gray-400">{plan.interval}</span></p>
//               <ul className="text-gray-200 text-left w-full space-y-2 mb-6">
//                 {plan.features.map((feature, index) => (
//                   <li key={index} className="flex items-center"><span className="text-green-400 mr-2">✔</span> {feature}</li>
//                 ))}
//               </ul>
//               <button
//                 onClick={() => setSelectedPlan(plan)} // Set the entire plan object
//                 className={`mt-auto ${plan.buttonColor} text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300 ease-in-out w-full`}
//               >
//                 {plan.buttonText}
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* Payment Forms Section */}
//         {selectedPlan && (
//           <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md mt-8">
//             <h3 className="text-2xl font-bold mb-6 text-center text-purple-400">
//               {selectedPlan.name}
//             </h3>
//             {/* NO StripeElementsWrapper HERE */}
//             {selectedPlan.type === 'monthly' ? (
//               <SubscriptionPaymentForm priceId={selectedPlan.priceId} />
//             ) : (
//               <OneTimePaymentForm priceId={selectedPlan.priceId} />
//             )}
//             <button
//               onClick={() => setSelectedPlan(null)}
//               className="mt-6 text-gray-400 hover:text-gray-300 text-sm"
//             >
//               &larr; Back to plans
//             </button>
//           </div>
//         )}
//       </div>
//     </MainLayout>
//   );
// }


// 'use client'

// import MainLayout from '@/components/MainLayout'
// import OneTimePaymentForm from '@/components/stripe/OneTimePaymentForm'
// import SubscriptionPaymentForm from '@/components/stripe/SubscriptionPaymentForm'
// import { useState } from 'react'

// const plans = [
//   {
//     id: 'monthly-basic',
//     type: 'monthly',
//     name: 'Basic Monthly',
//     price: '$4.99',
//     interval: '/month',
//     description: 'Access to all tools, 200 tokens/day.',
//     features: ['200 Tokens per day', 'Access to all premium features', 'Cancel anytime'],
//     priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_BASIC_PRICE_ID,
//     buttonText: 'Subscribe Basic',
//     borderColor: 'border-purple-600',
//     titleColor: 'text-purple-300',
//     buttonColor: 'bg-purple-600 hover:bg-purple-700',
//   },
//   {
//     id: 'monthly-premium',
//     type: 'monthly',
//     name: 'Premium Monthly',
//     price: '$9.99',
//     interval: '/month',
//     description: '1000 daily tokens for heavy users.',
//     features: ['1000 Tokens per day', 'Priority support', 'Exclusive features'],
//     priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PREMIUM_PRICE_ID,
//     buttonText: 'Subscribe Premium',
//     borderColor: 'border-pink-600',
//     titleColor: 'text-pink-300',
//     buttonColor: 'bg-pink-600 hover:bg-pink-700',
//   },
//   {
//     id: 'onetime-24hr',
//     type: 'onetime',
//     name: '24-Hour Pass',
//     price: '$1.99',
//     interval: '/24 hours',
//     description: 'Unlimited token usage for 24 hours from purchase.',
//     features: ['Unlimited Tokens for 24 hours', 'Perfect for one-off heavy usage', 'No recurring charges'],
//     priceId: process.env.NEXT_PUBLIC_STRIPE_ONETIME_24HR_PRICE_ID,
//     buttonText: 'Get 24-Hour Pass',
//     borderColor: 'border-blue-600',
//     titleColor: 'text-blue-300',
//     buttonColor: 'bg-blue-600 hover:bg-blue-700',
//   },
//   {
//     id: 'onetime-weekly',
//     type: 'onetime',
//     name: 'Weekly Pass',
//     price: '$5.99',
//     interval: '/week',
//     description: 'Unlimited token usage for 7 days from purchase.',
//     features: ['Unlimited Tokens for 7 days', 'Great for short-term projects', 'No recurring charges'],
//     priceId: process.env.NEXT_PUBLIC_STRIPE_ONETIME_WEEKLY_PRICE_ID,
//     buttonText: 'Get Weekly Pass',
//     borderColor: 'border-green-600',
//     titleColor: 'text-green-300',
//     buttonColor: 'bg-green-600 hover:bg-green-700',
//   },
// ]

// export default function PricingPage () {
//   const [selectedPlan, setSelectedPlan] = useState(null)

//   const oneTimePlans = plans.filter(plan => plan.type === 'onetime')
//   const monthlyPlans = plans.filter(plan => plan.type === 'monthly')

//   return (
//     <MainLayout title="Choose Your Plan">
//       <div className="flex flex-col items-center justify-center gap-12 py-12 px-4">
//         <p className="text-lg text-gray-300 max-w-3xl text-center">
//           Unlock the full potential of Morpho with our flexible pricing plans.
//           Get more tokens, unlimited access, and enhanced features!
//         </p>

//         {/* ————— One-Time Plans ————— */}
//         <section className="w-full max-w-6xl">
//           <h2 className="text-2xl font-bold text-blue-300 mb-6 text-center">One-Time Access</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
//             {oneTimePlans.map(plan => (
//               <div
//                 key={plan.id}
//                 className={`bg-gray-700 p-6 rounded-xl shadow-xl border ${plan.borderColor} flex flex-col`}
//               >
//                 <h3 className={`text-2xl font-bold ${plan.titleColor} mb-2`}>{plan.name}</h3>
//                 <p className="text-3xl font-extrabold text-white mb-4">
//                   {plan.price}
//                   <span className="text-lg font-normal text-gray-400"> {plan.interval}</span>
//                 </p>
//                 <ul className="text-gray-200 space-y-2 mb-6">
//                   {plan.features.map((feature, idx) => (
//                     <li key={idx} className="flex items-start">
//                       <span className="text-green-400 mr-2 mt-1">✔</span> {feature}
//                     </li>
//                   ))}
//                 </ul>
//                 <button
//                   onClick={() => setSelectedPlan(plan)}
//                   className={`${plan.buttonColor} text-white font-bold py-2 px-6 rounded-lg text-lg mt-auto`}
//                 >
//                   {plan.buttonText}
//                 </button>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* ————— Subscription Plans ————— */}
//         <section className="w-full max-w-6xl">
//           <h2 className="text-2xl font-bold text-purple-300 mb-6 text-center">Monthly Subscriptions</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
//             {monthlyPlans.map(plan => (
//               <div
//                 key={plan.id}
//                 className={`bg-gray-700 p-6 rounded-xl shadow-xl border ${plan.borderColor} flex flex-col`}
//               >
//                 <h3 className={`text-2xl font-bold ${plan.titleColor} mb-2`}>{plan.name}</h3>
//                 <p className="text-3xl font-extrabold text-white mb-4">
//                   {plan.price}
//                   <span className="text-lg font-normal text-gray-400"> {plan.interval}</span>
//                 </p>
//                 <ul className="text-gray-200 space-y-2 mb-6">
//                   {plan.features.map((feature, idx) => (
//                     <li key={idx} className="flex items-start">
//                       <span className="text-green-400 mr-2 mt-1">✔</span> {feature}
//                     </li>
//                   ))}
//                 </ul>
//                 <button
//                   onClick={() => setSelectedPlan(plan)}
//                   className={`${plan.buttonColor} text-white font-bold py-2 px-6 rounded-lg text-lg mt-auto`}
//                 >
//                   {plan.buttonText}
//                 </button>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* ————— Payment Modal ————— */}
//         {selectedPlan && (
//           <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md mt-12">
//             <h3 className="text-2xl font-bold mb-6 text-center text-purple-400">
//               {selectedPlan.name}
//             </h3>
//             {selectedPlan.type === 'monthly' ? (
//               <SubscriptionPaymentForm priceId={selectedPlan.priceId} />
//             ) : (
//               <OneTimePaymentForm priceId={selectedPlan.priceId} />
//             )}
//             <button
//               onClick={() => setSelectedPlan(null)}
//               className="mt-6 text-gray-400 hover:text-gray-300 text-sm text-center w-full"
//             >
//               &larr; Back to plans
//             </button>
//           </div>
//         )}
//       </div>
//     </MainLayout>
//   )
// }


'use client'

import { useState } from 'react'
import MainLayout from '@/components/MainLayout'
import OneTimePaymentForm from '@/components/stripe/OneTimePaymentForm'
import SubscriptionPaymentForm from '@/components/stripe/SubscriptionPaymentForm'

// Plan definitions
const plans = [
  {
    id: 'monthly-basic',
    type: 'monthly',
    name: 'Basic Monthly',
    price: '$4.99',
    interval: '/month',
    description: 'Access to all tools, 200 tokens/day.',
    features: ['200 Tokens per day', 'Access to all premium features', 'Cancel anytime'],
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_BASIC_PRICE_ID,
    buttonText: 'Subscribe Basic',
    borderColor: 'border-purple-600',
    titleColor: 'text-purple-300',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    id: 'monthly-premium',
    type: 'monthly',
    name: 'Premium Monthly',
    price: '$9.99',
    interval: '/month',
    description: '1000 daily tokens for heavy users.',
    features: ['1000 Tokens per day', 'Priority support', 'Exclusive features'],
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PREMIUM_PRICE_ID,
    buttonText: 'Subscribe Premium',
    borderColor: 'border-pink-600',
    titleColor: 'text-pink-300',
    buttonColor: 'bg-pink-600 hover:bg-pink-700',
    badge: 'Most Popular',
  },
  {
    id: 'onetime-24hr',
    type: 'onetime',
    name: '24-Hour Pass',
    price: '$1.99',
    interval: '/24 hours',
    description: 'Unlimited token usage for 24 hours.',
    features: ['Unlimited Tokens for 24 hours', 'Perfect for one-off heavy usage', 'No recurring charges'],
    priceId: process.env.NEXT_PUBLIC_STRIPE_ONETIME_24HR_PRICE_ID,
    buttonText: 'Get 24-Hour Pass',
    borderColor: 'border-blue-600',
    titleColor: 'text-blue-300',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    id: 'onetime-weekly',
    type: 'onetime',
    name: 'Weekly Pass',
    price: '$5.99',
    interval: '/week',
    description: 'Unlimited token usage for 7 days.',
    features: ['Unlimited Tokens for 7 days', 'Great for short-term projects', 'No recurring charges'],
    priceId: process.env.NEXT_PUBLIC_STRIPE_ONETIME_WEEKLY_PRICE_ID,
    buttonText: 'Get Weekly Pass',
    borderColor: 'border-green-600',
    titleColor: 'text-green-300',
    buttonColor: 'bg-green-600 hover:bg-green-700',
  },
]

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState(null)

  const renderPlans = (type, title) => {
    const filtered = plans.filter(plan => plan.type === type)
    if (filtered.length === 0) return null
  
    const sectionColor = filtered[0].titleColor // e.g., text-blue-300 or text-purple-300
  
    return (
      <div className='w-full max-w-6xl'>
        <h2 className={`text-2xl font-bold mb-4 text-center ${sectionColor}`}>{title}</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8'>
          {filtered.map(plan => (
            <div
              key={plan.id}
              className={`relative bg-gray-700 p-8 rounded-2xl shadow-xl border ${plan.borderColor} flex flex-col transition-transform duration-300 transform hover:-translate-y-1`}
            >
              {plan.badge && (
                <span className='absolute top-2 right-2 bg-pink-600 text-white text-xs font-semibold px-2 py-1 rounded-full'>
                  {plan.badge}
                </span>
              )}
              <h3 className={`text-3xl font-bold ${plan.titleColor} mb-4`}>{plan.name}</h3>
              <p className='text-4xl font-extrabold text-white mb-4'>
                {plan.price}
                <span className='text-lg font-normal text-gray-400'>{plan.interval}</span>
              </p>
              <ul className='text-gray-200 text-left space-y-2 mb-6'>
                {plan.features.map((feature, index) => (
                  <li key={index} className='flex items-center'>
                    <span className='text-green-400 mr-2'>✔</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSelectedPlan(plan)}
                className={`${plan.buttonColor} text-white font-bold py-3 px-6 rounded-lg text-lg w-full transition-all`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }
  

  return (
    <MainLayout title='Choose Your Plan'>
      <div className='flex flex-col items-center justify-center gap-8 py-10'>
        <p className='text-lg text-gray-300 max-w-2xl text-center'>
          Unlock the full potential of Morpho with our flexible pricing plans. Get more tokens, unlimited access, and enhanced features!
        </p>

        {/* Pricing Sections */}
        {renderPlans('onetime', 'One-Time Passes')}
        {renderPlans('monthly', 'Subscriptions')}

        {/* Payment Form */}
        {selectedPlan && (
          <div className='bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md mt-10 fade-in-up'>

            <h3 className='text-2xl font-bold mb-6 text-center text-purple-400'>
              {selectedPlan.name}
            </h3>
            {selectedPlan.type === 'monthly' ? (
              <SubscriptionPaymentForm priceId={selectedPlan.priceId} />
            ) : (
              <OneTimePaymentForm priceId={selectedPlan.priceId} />
            )}
            <button
              onClick={() => setSelectedPlan(null)}
              className='mt-6 text-gray-400 hover:text-gray-300 text-sm text-center block w-full'
            >
              &larr; Back to plans
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
