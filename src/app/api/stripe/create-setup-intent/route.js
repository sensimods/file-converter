import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route'; // Import authOptions
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
    console.warn('[create-setup-intent API] Authentication failed: No session or user ID found.');
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { userId, priceId } = await req.json();

    if (userId !== session.user.id) {
      console.warn(`[create-setup-intent API] Unauthorized user ID mismatch. Request userId: ${userId}, Session userId: ${session.user.id}`);
      return NextResponse.json({ error: 'Unauthorized user ID.' }, { status: 403 });
    }
    if (!priceId) {
        console.warn('[create-setup-intent API] Price ID is missing.');
        return NextResponse.json({ error: 'Price ID is required.' }, { status: 400 });
    }

    const price = await stripe.prices.retrieve(priceId);
    if (!price || price.type !== 'recurring') {
        console.warn(`[create-setup-intent API] Invalid or non-recurring Price ID provided: ${priceId}`);
        return NextResponse.json({ error: 'Invalid or non-recurring Price ID provided.' }, { status: 400 });
    }

    let userToken = await UserToken.findOne({ userId: session.user.id });
    let stripeCustomerId;

    if (userToken && userToken.stripeCustomerId) {
      stripeCustomerId = userToken.stripeCustomerId;
      console.log(`[create-setup-intent API] Found existing Stripe Customer ID: ${stripeCustomerId} for userId: ${session.user.id}`);
    } else {
      console.log(`[create-setup-intent API] Creating new Stripe Customer for userId: ${session.user.id}, email: ${session.user.email}`);
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: session.user.id,
        },
      });
      stripeCustomerId = customer.id;
      console.log(`[create-setup-intent API] New Stripe Customer created: ${stripeCustomerId}`);

      if (userToken) {
        userToken.stripeCustomerId = stripeCustomerId;
        await userToken.save();
        console.log(`[create-setup-intent API] UserToken updated with new Stripe Customer ID.`);
      } else {
        await UserToken.create({
          userId: session.user.id,
          stripeCustomerId: stripeCustomerId,
          lastResetDate: new Date(),
          tokensUsedToday: 0,
          maxTokensPerDay: 20,
          isSubscriber: false,
        });
        console.log(`[create-setup-intent API] New UserToken created with Stripe Customer ID as fallback.`);
      }
    }

    // const setupIntent = await stripe.setupIntents.create({
    //   customer: stripeCustomerId,
    //   payment_method_types: ['card'],
    //   usage: 'off_session',
    //   metadata: {
    //     userId: session.user.id,
    //     priceId: priceId,
    //     planType: 'monthly-subscription-setup',
    //   },
    // });

      const setupIntent = await stripe.setupIntents.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            usage: 'off_session',
            metadata: { userId: session.user.id, priceId },   // 👈
           })

    console.log(`[create-setup-intent API] SetupIntent created: ${setupIntent.id}`);

    return NextResponse.json({ clientSecret: setupIntent.client_secret }, { status: 200 });

  } catch (error) {
    console.error('Error creating Setup Intent:', error);
    return NextResponse.json({ error: error.message || 'Failed to create Setup Intent.' }, { status: 500 });
  }
}