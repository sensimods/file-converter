
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/[...nextauth]/route'; // Import authOptions
// import dbConnect from '@/lib/mongodb';
// import getUserTokenModel from '@/models/UserToken';

// export const runtime = 'nodejs';

// export async function POST(req) {
//   console.log('[Identify User API] Request received.');
//   try {
//     await dbConnect();
//     console.log('[Identify User API] Database connected.');
//     const UserToken = getUserTokenModel();
//     console.log('[Identify User API] UserToken model retrieved.');

//     const session = await getServerSession(authOptions);
//     console.log('[Identify User API] Session retrieved:', session ? 'Authenticated' : 'Unauthenticated');

//     let userIdToUse = null;
//     let isAnonymous = true;

//     if (session?.user?.id) {
//       userIdToUse = session.user.id;
//       isAnonymous = false;
//       console.log(`[Identify User API] Authenticated user detected. Using userId: ${userIdToUse}`);
//     } else {
//       console.log('[Identify User API] Attempting to identify anonymous user from request body.');
//       try {
//         const body = await req.json(); // This is where MainLayout sends fingerprintId
//         const fingerprintIdFromRequest = body.fingerprintId;
//         if (fingerprintIdFromRequest) {
//           userIdToUse = fingerprintIdFromRequest;
//           isAnonymous = true;
//           console.log(`[Identify User API] Anonymous user detected. Using fingerprintId from body: ${userIdToUse}`);
//         } else {
//           console.error('[Identify User API] No fingerprintId found in request body for anonymous identification.');
//           return NextResponse.json({ error: 'User identifier missing in request body.' }, { status: 400 });
//         }
//       } catch (error) {
//         console.error('[Identify User API] Error parsing request body for fingerprintId:', error);
//         return NextResponse.json({ error: 'Invalid request body or missing fingerprintId.' }, { status: 400 });
//       }
//     }

//     // Ensure userIdToUse is set before proceeding
//     if (!userIdToUse) {
//       console.error('[Identify User API] Critical error: userIdToUse is null after identification logic.');
//       return NextResponse.json({ error: 'Internal server error: User identifier not established.' }, { status: 500 });
//     }

//     let userToken;
//     console.log(`[Identify User API] Looking for UserToken for ID: ${userIdToUse} (Anonymous: ${isAnonymous})`);

//     if (isAnonymous) {
//       userToken = await UserToken.findOne({ fingerprintId: userIdToUse });
//       if (!userToken) {
//         console.log(`[Identify User API] No anonymous UserToken found. Creating new for fingerprintId: ${userIdToUse}`);
//         userToken = await UserToken.create({
//           fingerprintId: userIdToUse,
//           lastResetDate: new Date(),
//           tokensUsedToday: 0,
//           maxTokensPerDay: 20,
//           isSubscriber: false,
//         });
//       } else {
//         console.log(`[Identify User API] Found existing anonymous UserToken for fingerprintId: ${userIdToUse}`);
//       }
//     } else {
//       userToken = await UserToken.findOne({ userId: userIdToUse });
//       if (!userToken) {
//         console.log(`[Identify User API] No authenticated UserToken found. Creating new for userId: ${userIdToUse}`);
//         userToken = await UserToken.create({
//           userId: userIdToUse,
//           lastResetDate: new Date(),
//           tokensUsedToday: 0,
//           maxTokensPerDay: 20,
//           isSubscriber: false,
//         });
//       } else {
//         console.log(`[Identify User API] Found existing authenticated UserToken for userId: ${userIdToUse}`);
//       }
//     }

//     if (!userToken) {
//         console.error(`[Identify User API] Failed to retrieve or create UserToken for ID: ${userIdToUse}.`);
//         return NextResponse.json({ error: 'Failed to establish user token record.' }, { status: 500 });
//     }
//     console.log('[Identify User API] UserToken object successfully retrieved/created.');

//     // Ensure tokens are reset for the current UTC day if needed
//     const now = new Date();
//     const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

//     if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
//       console.log(`[Identify User API] Resetting tokens for ${userIdToUse}.`);
//       userToken.tokensUsedToday = 0;
//       userToken.lastResetDate = todayMidnightUtc;
//       await userToken.save();
//     }

//     // Check for unlimited access expiry
//     if (userToken.unlimitedAccessUntil && new Date() > userToken.unlimitedAccessUntil) {
//       console.log(`[Identify User API] Unlimited access expired for ${userIdToUse}. Resetting.`);
//       userToken.unlimitedAccessUntil = null;
//       userToken.maxTokensPerDay = 20; // Revert to default free tier
//       userToken.isSubscriber = false; // Ensure isSubscriber is false if one-time access expired
//       await userToken.save();
//     }

//     const currentTokensUsed = userToken.tokensUsedToday;
//     let currentMaxTokens = userToken.maxTokensPerDay;
//     let currentIsSubscriber = userToken.isSubscriber;
//     let currentUnlimitedAccessUntil = userToken.unlimitedAccessUntil;

//     if (userToken.isSubscriber || (userToken.unlimitedAccessUntil && new Date() <= userToken.unlimitedAccessUntil)) {
//       currentMaxTokens = Infinity;
//       currentIsSubscriber = userToken.isSubscriber || true;
//     }

//     console.log(`[Identify User API] Responding with: userId: ${userIdToUse}, tokensUsed: ${currentTokensUsed}, maxTokens: ${currentMaxTokens}, isSubscriber: ${currentIsSubscriber}, unlimitedAccessUntil: ${currentUnlimitedAccessUntil}`);

//     return NextResponse.json({
//       userId: userIdToUse,
//       tokensUsed: currentTokensUsed,
//       maxTokens: currentMaxTokens,
//       isSubscriber: currentIsSubscriber,
//       unlimitedAccessUntil: currentUnlimitedAccessUntil,
//     }, { status: 200 });

//   } catch (error) {
//     console.error('[Identify User API] Uncaught error in POST handler:', error);
//     console.error('[Identify User API] Error name:', error.name);
//     console.error('[Identify User API] Error message:', error.message);
//     console.error('[Identify User API] Error stack:', error.stack);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); // Return generic 500 for client
//   }
// }
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import getUserTokenModel from '@/models/UserToken'

export const runtime = 'nodejs'

export async function POST (req) {
  await dbConnect()
  const UserToken = getUserTokenModel()

  const body = await req.json()
  const fpId = body.fingerprintId || null
  const anonId = body.anonymousId || null

  const session = await getServerSession(authOptions)
  const userId  = session?.user?.id || null

  // Pick the strongest identifier we have
  const query =
    userId ? { userId } :
    fpId   ? { fingerprintId: fpId } :
             { anonymousId: anonId }

  let ut = await UserToken.findOne(query)

  // If no record exists yet, create one now
  if (!ut) {
    ut = await UserToken.create({
      ...query,
      lastResetDate: todayUTC(),
      tokensUsedToday: 0,
      maxTokensPerDay: 20,
      isSubscriber: false
    })
  }

  // Daily reset
  if (ut.lastResetDate.getTime() !== todayUTC().getTime()) {
    ut.tokensUsedToday = 0
    ut.lastResetDate   = todayUTC()
    await ut.save()
  }

  // Expire one-time pass if needed
  const now = new Date()
  if (ut.unlimitedAccessUntil && now > ut.unlimitedAccessUntil) {
    ut.unlimitedAccessUntil = null
    await ut.save()
  }

  const unlimited =
    ut.maxTokensPerDay === Infinity ||
    (ut.unlimitedAccessUntil && now <= ut.unlimitedAccessUntil)

  return NextResponse.json(
    {
      tokensUsed: ut.tokensUsedToday,
      maxTokens:  unlimited ? Infinity : ut.maxTokensPerDay,
      unlimitedAccessUntil: ut.unlimitedAccessUntil ?? null
    },
    { status: 200 }
  )
}

function todayUTC () {
  const n = new Date()
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()))
}
