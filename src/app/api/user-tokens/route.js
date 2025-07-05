
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/[...nextauth]/route';
// import dbConnect from '@/lib/mongodb';
// import getUserTokenModel from '@/models/UserToken';

// export const runtime = 'nodejs';

// export async function GET(req) {
//   await dbConnect();
//   const UserToken = getUserTokenModel();

//   const session = await getServerSession(authOptions);
//   let userIdToUse = null;
//   let isAnonymous = true;

//   if (session?.user?.id) {
//     userIdToUse = session.user.id;
//     isAnonymous = false;
//     console.log(`[User Tokens API] Authenticated user detected. Using userId: ${userIdToUse}`);
//   } else {
//     // For unauthenticated users, use fingerprintId or anonymousId from headers
//     const fingerprintId = req.headers.get('X-Fingerprint-ID');
//     const anonymousId = req.headers.get('X-Anonymous-ID');

//     if (fingerprintId) {
//       userIdToUse = fingerprintId;
//       isAnonymous = true;
//       console.log(`[User Tokens API] Anonymous user detected. Using fingerprintId: ${userIdToUse}`);
//     } else if (anonymousId) {
//       userIdToUse = anonymousId;
//       isAnonymous = true;
//       console.log(`[User Tokens API] Anonymous user detected. Using anonymousId: ${userIdToUse}`);
//     } else {
//       console.error('[User Tokens API] No user identification found in session or headers.');
//       // If no identifier, return default free tier tokens
//       return NextResponse.json({
//         tokensUsed: 0,
//         maxTokens: 20,
//         isSubscriber: false,
//         unlimitedAccessUntil: null,
//       }, { status: 200 });
//     }
//   }

//   try {
//     let userToken;
//     if (isAnonymous) {
//       userToken = await UserToken.findOne({ fingerprintId: userIdToUse });
//     } else {
//       userToken = await UserToken.findOne({ userId: userIdToUse });
//     }

//     if (!userToken) {
//       // If no token found, create a new one with default free tier
//       if (isAnonymous) {
//         userToken = await UserToken.create({
//           fingerprintId: userIdToUse,
//           lastResetDate: new Date(),
//           tokensUsedToday: 0,
//           maxTokensPerDay: 20,
//           isSubscriber: false,
//         });
//         console.log(`[User Tokens API] Created new anonymous UserToken for fingerprintId: ${userIdToUse}`);
//       } else {
//         userToken = await UserToken.create({
//           userId: userIdToUse,
//           lastResetDate: new Date(),
//           tokensUsedToday: 0,
//           maxTokensPerDay: 20,
//           isSubscriber: false,
//         });
//         console.log(`[User Tokens API] Created new authenticated UserToken for userId: ${userIdToUse}`);
//       }
//     }

//     // Ensure tokens are reset for the current UTC day if needed
//     const now = new Date();
//     const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

//     if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
//       userToken.tokensUsedToday = 0;
//       userToken.lastResetDate = todayMidnightUtc;
//       await userToken.save();
//       console.log(`[User Tokens API] UserToken for ${userIdToUse} reset for new day.`);
//     }

//     // Check for unlimited access expiry
//     if (userToken.unlimitedAccessUntil && new Date() > userToken.unlimitedAccessUntil) {
//       userToken.unlimitedAccessUntil = null; // Clear expired unlimited access
//       userToken.maxTokensPerDay = 20; // Revert to default free tier
//       userToken.isSubscriber = false; // Ensure isSubscriber is false if one-time access expired
//       await userToken.save();
//       console.log(`[User Tokens API] Unlimited access for ${userIdToUse} expired. Reverted to free tier.`);
//     }

//     // Determine current tokens and max tokens based on the identified user's status
//     const currentTokensUsed = userToken.tokensUsedToday;
//     let currentMaxTokens = userToken.maxTokensPerDay;
//     let currentIsSubscriber = userToken.isSubscriber;
//     let currentUnlimitedAccessUntil = userToken.unlimitedAccessUntil;

//     // Override maxTokens for active subscriptions or one-time passes
//     if (userToken.isSubscriber || (userToken.unlimitedAccessUntil && new Date() <= userToken.unlimitedAccessUntil)) {
//       currentMaxTokens = Infinity;
//       currentIsSubscriber = userToken.isSubscriber || true; // Ensure true if unlimited access
//     }

//     console.log(`[User Tokens API] Responding with: userId: ${userIdToUse}, tokensUsed: ${currentTokensUsed}, maxTokens: ${currentMaxTokens}, isSubscriber: ${currentIsSubscriber}, unlimitedAccessUntil: ${currentUnlimitedAccessUntil}`);

//     return NextResponse.json({
//       tokensUsed: currentTokensUsed,
//       maxTokens: currentMaxTokens,
//       isSubscriber: currentIsSubscriber,
//       unlimitedAccessUntil: currentUnlimitedAccessUntil,
//     }, { status: 200 });

//   } catch (error) {
//     console.error('[User Tokens API] Error fetching user token data:', error);
//     return NextResponse.json({ error: 'Failed to fetch user token data.' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import getUserTokenModel from '@/models/UserToken'

export const runtime = 'nodejs'

export async function GET (req) {
  await dbConnect()
  const UserToken = getUserTokenModel()
  const session   = await getServerSession(authOptions)

  // ───────────────────────────────────── determine identity
  let query = null
  if (session?.user?.id) query = { userId: session.user.id }
  else {
    const fingerprintId = req.headers.get('X-Fingerprint-ID')
    const anonymousId   = req.headers.get('X-Anonymous-ID')
    if (fingerprintId) query = { fingerprintId }
    else if (anonymousId) query = { anonymousId }
  }

  if (!query)
    return NextResponse.json(
      { tokensUsed: 0, maxTokens: 20, unlimitedAccessUntil: null, isSubscriber: false },
      { status: 200 }
    )

  // ───────────────────────────────────── ensure token doc exists
  let ut = await UserToken.findOne(query)
  if (!ut) {
    ut = await UserToken.create({
      ...query,
      lastResetDate: new Date(),
      tokensUsedToday: 0,
      maxTokensPerDay: 20,
      isSubscriber: false
    })
  }

  // ───────────────────────────────────── daily reset (UTC)
  const now       = new Date()
  const todayUtc  = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (ut.lastResetDate < todayUtc) {
    ut.tokensUsedToday = 0
    ut.lastResetDate   = todayUtc
    await ut.save()
  }

  // ───────────────────────────────────── expire one-time pass
  if (ut.unlimitedAccessUntil && now > ut.unlimitedAccessUntil) {
    ut.unlimitedAccessUntil = null
    await ut.save()
  }

  // ───────────────────────────────────── build response
  const unlimited =
    ut.maxTokensPerDay === Infinity ||
    (ut.unlimitedAccessUntil && now <= ut.unlimitedAccessUntil)

  return NextResponse.json(
    {
      tokensUsed: ut.tokensUsedToday,
      maxTokens: unlimited ? Infinity : ut.maxTokensPerDay,
      unlimitedAccessUntil: ut.unlimitedAccessUntil,
      isSubscriber: ut.isSubscriber
    },
    { status: 200 }
  )
}
