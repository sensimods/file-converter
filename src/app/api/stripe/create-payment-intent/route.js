import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import getUserTokenModel from '@/models/UserToken';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export const runtime = 'nodejs';

export async function POST(req) {
  await dbConnect();
  const UserToken = getUserTokenModel();

  // --- CRITICAL CHANGE HERE ---
  const session = await getServerSession(authOptions); // Pass authOptions
  // --- END CRITICAL CHANGE ---

  if (!session?.user?.id) {
    console.warn('[create-payment-intent API] Authentication failed: No session or user ID found.');
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required.' }, { status: 400 });
    }

    const price = await stripe.prices.retrieve(priceId);

    if (!price || price.type !== 'one_time') {
      return NextResponse.json({ error: 'Invalid or non-one-time Price ID provided.' }, { status: 400 });
    }

    const amount = price.unit_amount;
    const currency = price.currency;
    const planType = price.metadata?.planType || 'one-time-purchase';

    let userToken = await UserToken.findOne({ userId: session.user.id });
    let stripeCustomerId;

    if (userToken && userToken.stripeCustomerId) {
      stripeCustomerId = userToken.stripeCustomerId;
      console.log(`[create-payment-intent API] Found existing Stripe Customer ID: ${stripeCustomerId} for userId: ${session.user.id}`);
    } else {
      console.log(`[create-payment-intent API] Creating new Stripe Customer for userId: ${session.user.id}, email: ${session.user.email}`);
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: session.user.id,
        },
      });
      stripeCustomerId = customer.id;
      console.log(`[create-payment-intent API] New Stripe Customer created: ${stripeCustomerId}`);

      if (userToken) {
        userToken.stripeCustomerId = stripeCustomerId;
        await userToken.save();
        console.log(`[create-payment-intent API] UserToken updated with new Stripe Customer ID.`);
      } else {
        await UserToken.create({
          userId: session.user.id,
          stripeCustomerId: stripeCustomerId,
          lastResetDate: new Date(),
          tokensUsedToday: 0,
          maxTokensPerDay: 20,
          isSubscriber: false,
        });
        console.log(`[create-payment-intent API] New UserToken created with Stripe Customer ID as fallback.`);
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      metadata: {
        userId: session.user.id,
        priceId: priceId,
        planType: planType,
      },
    });
    console.log(`[create-payment-intent API] PaymentIntent created: ${paymentIntent.id}`);

    return NextResponse.json({ clientSecret: paymentIntent.client_secret }, { status: 200 });

  } catch (error) {
    console.error('Error creating Payment Intent:', error);
    return NextResponse.json({ error: error.message || 'Failed to create Payment Intent.' }, { status: 500 });
  }
}