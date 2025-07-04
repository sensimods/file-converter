import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import getUserTokenModel from '@/models/UserToken';

export const runtime = 'nodejs'; // Must run in Node.js runtime for Mongoose

export async function POST(request) {
  await dbConnect();
  const UserToken = getUserTokenModel();

  try {
    const { fingerprintId, anonymousId } = await request.json();

    if (!fingerprintId && !anonymousId) {
      return NextResponse.json({ error: 'No identification data provided.' }, { status: 400 });
    }

    let userToken;

    // 1. Try to find by fingerprintId (most persistent)
    if (fingerprintId) {
      userToken = await UserToken.findOne({ fingerprintId });
    }

    // 2. If not found by fingerprint, try by anonymousId
    if (!userToken && anonymousId) {
      userToken = await UserToken.findOne({ anonymousId });
    }

    // 3. If still no record, create a new one
    if (!userToken) {
      userToken = await UserToken.create({
        fingerprintId: fingerprintId || null, // Store fingerprint if available
        anonymousId: anonymousId || null,     // Store anonymous ID if available
        lastResetDate: new Date(),
        tokensUsedToday: 0,
        maxTokensPerDay: 20,
        isSubscriber: false,
      });
    } else {
      // 4. If record found, update/reconcile IDs
      let updated = false;
      if (fingerprintId && userToken.fingerprintId !== fingerprintId) {
        userToken.fingerprintId = fingerprintId;
        updated = true;
      }
      if (anonymousId && userToken.anonymousId !== anonymousId) {
        userToken.anonymousId = anonymousId;
        updated = true;
      }
      if (updated) {
        await userToken.save();
      }
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
      message: 'User identified and token data reconciled.',
      tokensUsed: userToken.tokensUsedToday,
      maxTokens: userToken.maxTokensPerDay,
      isSubscriber: userToken.isSubscriber,
    }, { status: 200 });

  } catch (error) {
    console.error('Error in /api/identify-user:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}