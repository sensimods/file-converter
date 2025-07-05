// // document-pro/src/app/api/stripe/webhook/route.js
// import { NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import dbConnect from '@/lib/mongodb';
// import getUserTokenModel from '@/models/UserToken';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: '2024-06-20',
// });

// // IMPORTANT: Disable Next.js's default body parsing for this route
// // This is necessary to access the raw body for Stripe signature verification.
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// // Helper function to read the raw body from the request
// async function getRawBody(req) {
//   const chunks = [];
//   for await (const chunk of req.body) {
//     chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
//   }
//   return Buffer.concat(chunks);
// }

// export async function POST(req) {
//   await dbConnect();
//   const UserToken = getUserTokenModel();

//   const rawBody = await getRawBody(req);
//   const signature = req.headers.get('stripe-signature');
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//   let event;

//   try {
//     // Verify the webhook signature
//     event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
//     console.log(`[Stripe Webhook] Received event type: ${event.type}`);
//   } catch (err) {
//     console.error(`[Stripe Webhook] ⚠️ Webhook signature verification failed.`, err.message);
//     return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
//   }

//   // Handle the event
//   try {
//     switch (event.type) {
//       case 'payment_intent.succeeded':
//         const paymentIntent = event.data.object;
//         console.log(`[Stripe Webhook] PaymentIntent Succeeded: ${paymentIntent.id}`);

//         // Extract userId and priceId from metadata
//         const userIdOneTime = paymentIntent.metadata?.userId;
//         const priceIdOneTime = paymentIntent.metadata?.priceId;

//         if (userIdOneTime && priceIdOneTime) {
//           let userToken = await UserToken.findOne({ userId: userIdOneTime });
//           if (userToken) {
//             const price = await stripe.prices.retrieve(priceIdOneTime);
//             if (price) {
//               let unlimitedAccessDurationHours = 0;
//               // Determine duration based on price ID
//               if (priceIdOneTime === process.env.NEXT_PUBLIC_STRIPE_ONETIME_24HR_PRICE_ID) {
//                 unlimitedAccessDurationHours = 24;
//                 userToken.maxTokensPerDay = Infinity; // Set to Infinity for unlimited access
//               } else if (priceIdOneTime === process.env.NEXT_PUBLIC_STRIPE_ONETIME_WEEKLY_PRICE_ID) {
//                 unlimitedAccessDurationHours = 24 * 7; // 7 days
//                 userToken.maxTokensPerDay = Infinity; // Set to Infinity for unlimited access
//               }

//               if (unlimitedAccessDurationHours > 0) {
//                 const now = new Date();
//                 const expiryDate = new Date(now.getTime() + unlimitedAccessDurationHours * 60 * 60 * 1000);

//                 // If user already has unlimited access, extend it
//                 if (userToken.unlimitedAccessUntil && userToken.unlimitedAccessUntil > now) {
//                   userToken.unlimitedAccessUntil = new Date(userToken.unlimitedAccessUntil.getTime() + unlimitedAccessDurationHours * 60 * 60 * 1000);
//                 } else {
//                   userToken.unlimitedAccessUntil = expiryDate;
//                 }
//                 userToken.isSubscriber = false; // Ensure isSubscriber is false for one-time passes
//                 userToken.subscriptionStatus = null; // Clear subscription status
//                 userToken.tokensUsedToday = 0; // Reset tokens used for this period

//                 await userToken.save();
//                 console.log(`[Stripe Webhook] UserToken updated for one-time pass: ${userIdOneTime}. Unlimited access until: ${userToken.unlimitedAccessUntil}`);
//               } else {
//                 console.warn(`[Stripe Webhook] Unknown one-time priceId: ${priceIdOneTime}. UserToken not updated for unlimited access.`);
//               }
//             } else {
//               console.warn(`[Stripe Webhook] Price object not found for priceId: ${priceIdOneTime}`);
//             }
//           } else {
//             console.warn(`[Stripe Webhook] UserToken not found for userId: ${userIdOneTime}. Cannot update one-time access.`);
//           }
//         } else {
//           console.warn(`[Stripe Webhook] Missing userId or priceId in payment_intent.succeeded metadata.`);
//         }
//         break;

//       case 'setup_intent.succeeded':
//         const setupIntent = event.data.object;
//         console.log(`[Stripe Webhook] SetupIntent Succeeded: ${setupIntent.id}`);

//         const userIdSetup = setupIntent.metadata?.userId;
//         const priceIdSetup = setupIntent.metadata?.priceId; // The price ID from the frontend for context

//         if (userIdSetup && setupIntent.customer && setupIntent.payment_method && priceIdSetup) {
//           let userToken = await UserToken.findOne({ userId: userIdSetup });

//           if (userToken) {
//             // Ensure stripeCustomerId is updated if it's new or missing
//             if (!userToken.stripeCustomerId || userToken.stripeCustomerId !== setupIntent.customer) {
//               userToken.stripeCustomerId = setupIntent.customer;
//               await userToken.save();
//               console.log(`[Stripe Webhook] UserToken updated with Stripe Customer ID: ${setupIntent.customer}`);
//             }

//             // Now, create the subscription using the saved payment method
//             // We need the actual price ID for the subscription
//             const price = await stripe.prices.retrieve(priceIdSetup);
//             if (!price || price.type !== 'recurring') {
//                 console.error(`[Stripe Webhook] Invalid or non-recurring priceId from metadata for subscription creation: ${priceIdSetup}`);
//                 break; // Exit if price is not valid for recurring
//             }

//             // Check if a subscription already exists for this customer/price
//             const existingSubscriptions = await stripe.subscriptions.list({
//               customer: setupIntent.customer,
//               price: priceIdSetup,
//               status: 'active',
//               limit: 1,
//             });

//             if (existingSubscriptions.data.length > 0) {
//               console.log(`[Stripe Webhook] Customer ${setupIntent.customer} already has an active subscription for price ${priceIdSetup}. Skipping new subscription creation.`);
//               // Update UserToken to reflect existing subscription if not already
//               userToken.isSubscriber = true;
//               userToken.subscriptionStatus = 'active';
//               userToken.maxTokensPerDay = Infinity;
//               userToken.unlimitedAccessUntil = null; // Clear one-time access if subscribing
//               await userToken.save();
//               break;
//             }

//             const subscription = await stripe.subscriptions.create({
//               customer: setupIntent.customer,
//               items: [{ price: priceIdSetup }],
//               default_payment_method: setupIntent.payment_method,
//               expand: ['latest_invoice.payment_intent'], // To get payment intent status immediately
//               metadata: {
//                 userId: userIdSetup,
//                 priceId: priceIdSetup,
//               },
//             });

//             console.log(`[Stripe Webhook] Subscription created: ${subscription.id} for userId: ${userIdSetup}`);

//             // Update UserToken with subscription details
//             userToken.isSubscriber = true;
//             userToken.subscriptionStatus = subscription.status; // e.g., 'active', 'trialing'
//             userToken.stripeSubscriptionId = subscription.id;
//             userToken.maxTokensPerDay = Infinity; // Set to Infinity for subscribers
//             userToken.unlimitedAccessUntil = null; // Clear any one-time access if subscribing

//             await userToken.save();
//             console.log(`[Stripe Webhook] UserToken updated for subscription: ${userIdSetup}. Status: ${subscription.status}`);

//           } else {
//             console.warn(`[Stripe Webhook] UserToken not found for userId: ${userIdSetup}. Cannot create subscription.`);
//           }
//         } else {
//           console.warn(`[Stripe Webhook] Missing userId, customer, payment_method, or priceId in setup_intent.succeeded metadata/object.`);
//         }
//         break;

//       case 'invoice.payment_succeeded':
//         const invoice = event.data.object;
//         console.log(`[Stripe Webhook] Invoice Payment Succeeded: ${invoice.id}`);
//         // This event confirms a payment for an invoice (including subscription renewals)
//         // You can use this to confirm subscription status or grant access.
//         // For simple cases, `customer.subscription.created` and `customer.subscription.updated` might be enough.
//         // We'll primarily rely on `customer.subscription.updated` for status changes.

//         // If this is for a subscription, update the user's subscription status
//         if (invoice.subscription) {
//             const subscriptionId = invoice.subscription;
//             const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
//             const userIdFromSubscription = stripeSubscription.metadata?.userId || stripeSubscription.customer; // Fallback to customer ID

//             if (userIdFromSubscription) {
//                 let userToken = await UserToken.findOne({ userId: userIdFromSubscription });
//                 if (userToken) {
//                     userToken.isSubscriber = true;
//                     userToken.subscriptionStatus = stripeSubscription.status; // Should be 'active'
//                     userToken.maxTokensPerDay = Infinity;
//                     userToken.unlimitedAccessUntil = null;
//                     await userToken.save();
//                     console.log(`[Stripe Webhook] UserToken updated via invoice.payment_succeeded for userId: ${userIdFromSubscription}. Status: ${stripeSubscription.status}`);
//                 }
//             }
//         }
//         break;

//       case 'customer.subscription.created':
//       case 'customer.subscription.updated':
//         const subscription = event.data.object;
//         console.log(`[Stripe Webhook] Subscription Event (${event.type}): ${subscription.id}, Status: ${subscription.status}`);

//         const userIdSub = subscription.metadata?.userId || subscription.customer; // Use metadata or customer ID
//         if (userIdSub) {
//           let userToken = await UserToken.findOne({ userId: userIdSub });
//           if (userToken) {
//             userToken.isSubscriber = (subscription.status === 'active' || subscription.status === 'trialing');
//             userToken.subscriptionStatus = subscription.status;
//             userToken.stripeSubscriptionId = subscription.id;
//             userToken.maxTokensPerDay = userToken.isSubscriber ? Infinity : 20; // Revert to default if not subscriber
//             userToken.unlimitedAccessUntil = null; // Clear one-time access if subscription is active/updated

//             await userToken.save();
//             console.log(`[Stripe Webhook] UserToken updated for subscription event: ${userIdSub}. isSubscriber: ${userToken.isSubscriber}, Status: ${userToken.subscriptionStatus}`);
//           } else {
//             console.warn(`[Stripe Webhook] UserToken not found for userId: ${userIdSub} during subscription event. Cannot update.`);
//           }
//         }
//         break;

//       case 'customer.subscription.deleted':
//         const deletedSubscription = event.data.object;
//         console.log(`[Stripe Webhook] Subscription Deleted: ${deletedSubscription.id}`);

//         const userIdDeletedSub = deletedSubscription.metadata?.userId || deletedSubscription.customer;
//         if (userIdDeletedSub) {
//           let userToken = await UserToken.findOne({ userId: userIdDeletedSub });
//           if (userToken) {
//             userToken.isSubscriber = false;
//             userToken.subscriptionStatus = 'canceled';
//             userToken.maxTokensPerDay = 20; // Revert to default free tier limit
//             userToken.stripeSubscriptionId = null; // Clear subscription ID
//             // Do NOT clear unlimitedAccessUntil if it's a separate one-time pass
//             await userToken.save();
//             console.log(`[Stripe Webhook] UserToken updated for deleted subscription: ${userIdDeletedSub}. Reverted to free tier.`);
//           }
//         }
//         break;

//       default:
//         // console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
//     }
//   } catch (error) {
//     console.error(`[Stripe Webhook] Error processing event ${event.type}:`, error);
//     return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
//   }

//   // Return a 200 response to acknowledge receipt of the event
//   return NextResponse.json({ received: true }, { status: 200 });
// }



// import { NextResponse } from 'next/server'
// import Stripe from 'stripe'
// import dbConnect from '@/lib/mongodb'
// import getUserTokenModel from '@/models/UserToken'
// import { PLAN_CONFIG } from '@/lib/planConfig'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: '2024-06-20'
// })

// // ——— Next.js needs raw body for signature verification ———
// export const config = { api: { bodyParser: false } }
// async function getRawBody (req) {
//   const chunks = []
//   for await (const chunk of req.body)
//     chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
//   return Buffer.concat(chunks)
// }

// // ————————————————————————————————————————————————
// export async function POST (req) {
//   await dbConnect()
//   const UserToken = getUserTokenModel()

//   const rawBody   = await getRawBody(req)
//   const signature = req.headers.get('stripe-signature')
//   const secret    = process.env.STRIPE_WEBHOOK_SECRET

//   let event
//   try {
//     event = stripe.webhooks.constructEvent(rawBody, signature, secret)
//   } catch (err) {
//     console.error('[Stripe Webhook] Signature check failed:', err.message)
//     return NextResponse.json({ error: 'Bad signature' }, { status: 400 })
//   }

//   try {
//     switch (event.type) {
//       // ───────────────────────── One-time purchases ─────────────────────────
//       case 'payment_intent.succeeded': {
//         const pi      = event.data.object
//         const userId  = pi.metadata?.userId
//         const priceId = pi.metadata?.priceId
//         const plan    = PLAN_CONFIG[priceId]

//         if (!userId || !plan) break
//         if (plan.type !== 'onetime') break   // ignore subs here

//         const ut = await UserToken.findOne({ userId })
//         if (!ut) break

//         // calculate / extend unlimited window
//         const now        = new Date()
//         const expires    = new Date(now.getTime() + plan.durationHours * 3_600_000)
//         ut.unlimitedAccessUntil =
//           ut.unlimitedAccessUntil && ut.unlimitedAccessUntil > now
//             ? new Date(ut.unlimitedAccessUntil.getTime() +
//                        plan.durationHours * 3_600_000)
//             : expires

//         ut.maxTokensPerDay   = Infinity
//         ut.isSubscriber      = false
//         ut.subscriptionStatus = null
//         ut.tokensUsedToday   = 0
//         await ut.save()
//         break
//       }

//       // ───────────────────────── Subscriptions (first setup) ─────────────────
//       case 'setup_intent.succeeded': {
//         const si       = event.data.object
//         const userId   = si.metadata?.userId
//         const priceId  = si.metadata?.priceId
//         const plan     = PLAN_CONFIG[priceId]
//         if (!userId || !plan || plan.type !== 'subscription') break

//         // Create the subscription immediately so we have priceId on hand
//         const subscription = await stripe.subscriptions.create({
//           customer:            si.customer,
//           items:               [{ price: priceId }],
//           default_payment_method: si.payment_method,
//           metadata:            { userId }
//         })

//         await applySubscriptionToUser(userId, subscription)
//         break
//       }

//       // ───────────────────────── Renewals / status changes ──────────────────
//       case 'customer.subscription.updated':
//       case 'customer.subscription.created': {
//         await applySubscriptionToUser(
//           event.data.object.metadata?.userId || event.data.object.customer,
//           event.data.object
//         )
//         break
//       }

//       case 'customer.subscription.deleted': {
//         const userId = event.data.object.metadata?.userId || event.data.object.customer
//         const ut = await UserToken.findOne({ userId })
//         if (ut) {
//           ut.isSubscriber       = false
//           ut.subscriptionStatus = 'canceled'
//           ut.maxTokensPerDay    = 20        // fallback to free tier
//           await ut.save()
//         }
//         break
//       }
//     }
//   } catch (e) {
//     console.error('[Stripe Webhook] Handler error:', e)
//     return NextResponse.json({ error: 'Handler error' }, { status: 500 })
//   }

//   return NextResponse.json({ received: true }, { status: 200 })
// }

// // Helper to map Stripe subscription ➜ user quota
// async function applySubscriptionToUser (userId, subscription) {
//   const UserToken = getUserTokenModel()
//   const ut = await UserToken.findOne({ userId })
//   if (!ut) return

//   const priceId = subscription.items.data[0].price.id
//   const plan    = PLAN_CONFIG[priceId]

//   ut.isSubscriber        = subscription.status === 'active'
//   ut.subscriptionStatus  = subscription.status
//   ut.stripeSubscriptionId = subscription.id
//   ut.maxTokensPerDay     = plan?.maxTokensPerDay ?? 20
//   ut.unlimitedAccessUntil = null            // clear any one-time pass
//   await ut.save()
// }


import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import dbConnect from '@/lib/mongodb'
import getUserTokenModel from '@/models/UserToken'
import { PLAN_CONFIG } from '@/lib/planConfig'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
})

// Next.js needs the raw body for Stripe signature verification
export const config = { api: { bodyParser: false } }
async function getRawBody (req) {
  const chunks = []
  for await (const chunk of req.body)
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

export const runtime = 'nodejs'

/* -------------------------------------------------------------------- */
export async function POST (req) {
  await dbConnect()
  const UserToken = getUserTokenModel()

  const rawBody   = await getRawBody(req)
  const signature = req.headers.get('stripe-signature')
  const secret    = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret)
  } catch (err) {
    console.error('[Stripe Webhook] Bad signature:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      /* ───────────── One-time purchases ───────────── */
      case 'payment_intent.succeeded': {
        const pi       = event.data.object
        const userId   = pi.metadata?.userId
        const priceId  = pi.metadata?.priceId
        const plan     = PLAN_CONFIG[priceId]
        if (!userId || !plan || plan.type !== 'onetime') break

        const ut = await UserToken.findOne({ userId })
        if (!ut) break

        const now      = new Date()
        const expires  = new Date(now.getTime() + plan.durationHours * 3_600_000)
        ut.unlimitedAccessUntil =
          ut.unlimitedAccessUntil && ut.unlimitedAccessUntil > now
            ? new Date(ut.unlimitedAccessUntil.getTime() +
                       plan.durationHours * 3_600_000)
            : expires

        ut.maxTokensPerDay    = Infinity
        ut.tokensUsedToday    = 0
        ut.isSubscriber       = false
        ut.subscriptionStatus = null
        await ut.save()
        break
      }

      /* ───────────── First subscription checkout ───────────── */
      case 'setup_intent.succeeded': {
        const si      = event.data.object
        const userId  = si.metadata?.userId
        const priceId = si.metadata?.priceId
        const plan    = PLAN_CONFIG[priceId]
        if (!userId || !plan || plan.type !== 'subscription') break

        const subscription = await stripe.subscriptions.create({
          customer:              si.customer,
          items:                 [{ price: priceId }],
          default_payment_method: si.payment_method,
          metadata:              { userId }
        })

        await applySubscriptionToUser(userId, subscription)
        break
      }

      /* ───────────── Renewals / status changes ───────────── */
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await applySubscriptionToUser(
          event.data.object.metadata?.userId || event.data.object.customer,
          event.data.object
        )
        break
      }

      case 'customer.subscription.deleted': {
        const userId = event.data.object.metadata?.userId || event.data.object.customer
        const ut = await UserToken.findOne({ userId })
        if (ut) {
          ut.isSubscriber       = false
          ut.subscriptionStatus = 'canceled'
          ut.maxTokensPerDay    = 20
          await ut.save()
        }
        break
      }
    }
  } catch (err) {
    console.error('[Stripe Webhook] Handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

/* --------------------------------------------------------------------
   Helper: map a Stripe subscription object → UserToken document
--------------------------------------------------------------------- */
async function applySubscriptionToUser (userIdOrCustomerId, subscription) {
  const UserToken = getUserTokenModel()
  const ut =
    await UserToken.findOne({ userId: userIdOrCustomerId }) ||
    await UserToken.findOne({ stripeCustomerId: userIdOrCustomerId })
  if (!ut) return

  const priceId = subscription.items.data[0].price.id
  const plan    = PLAN_CONFIG[priceId]

  ut.maxTokensPerDay     = plan?.maxTokensPerDay ?? 20
  ut.isSubscriber        = subscription.status === 'active'
  ut.subscriptionStatus  = subscription.status
  ut.stripeSubscriptionId = subscription.id
  ut.unlimitedAccessUntil = null

  /* ⭐ NEW: reset the daily counter when subscription turns active ⭐ */
  if (subscription.status === 'active') {
    ut.tokensUsedToday = 0
  }

  await ut.save()
}
