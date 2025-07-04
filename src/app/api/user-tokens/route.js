import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import getUserTokenModel from '@/models/UserToken';

// This API route MUST run in the Node.js runtime for Mongoose compatibility
export const runtime = 'nodejs';

export async function GET(request) {
  await dbConnect();
  const UserToken = getUserTokenModel();

  try {
    const userId = request.headers.get('X-User-ID');

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found.' }, { status: 400 });
    }

    let userToken = await UserToken.findOne({ userId });

    if (!userToken) {
      // If no token record, create a default one (freemium)
      userToken = await UserToken.create({
        userId: userId,
        lastResetDate: new Date(),
        tokensUsedToday: 0,
        maxTokensPerDay: 20,
        isSubscriber: false,
      });
    }

    // Ensure tokens are reset for the current UTC day if needed
    const now = new Date();
    const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
      userToken.tokensUsedToday = 0;
      userToken.lastResetDate = todayMidnightUtc;
      await userToken.save();
    }

    return NextResponse.json({
      tokensUsed: userToken.tokensUsedToday,
      maxTokens: userToken.maxTokensPerDay,
      isSubscriber: userToken.isSubscriber,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
