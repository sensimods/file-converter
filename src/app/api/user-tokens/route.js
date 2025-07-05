//WAS WORKING FINE 04-07-25
// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import getUserTokenModel from '@/models/UserToken';

// // This API route MUST run in the Node.js runtime for Mongoose compatibility
// export const runtime = 'nodejs';

// export async function GET(request) {
//   await dbConnect();
//   const UserToken = getUserTokenModel();

//   try {
//     const userId = request.headers.get('X-User-ID');

//     if (!userId) {
//       return NextResponse.json({ error: 'User ID not found.' }, { status: 400 });
//     }

//     let userToken = await UserToken.findOne({ userId });

//     if (!userToken) {
//       // If no token record, create a default one (freemium)
//       userToken = await UserToken.create({
//         userId: userId,
//         lastResetDate: new Date(),
//         tokensUsedToday: 0,
//         maxTokensPerDay: 20,
//         isSubscriber: false,
//       });
//     }

//     // Ensure tokens are reset for the current UTC day if needed
//     const now = new Date();
//     const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

//     if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
//       userToken.tokensUsedToday = 0;
//       userToken.lastResetDate = todayMidnightUtc;
//       await userToken.save();
//     }

//     return NextResponse.json({
//       tokensUsed: userToken.tokensUsedToday,
//       maxTokens: userToken.maxTokensPerDay,
//       isSubscriber: userToken.isSubscriber,
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Error fetching user tokens:', error);
//     return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
//   }
// }


// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import getUserTokenModel from '@/models/UserToken';

// export const runtime = 'nodejs';

// export async function GET(request) {
//   await dbConnect();
//   const UserToken = getUserTokenModel();

//   try {
//     const fingerprintId = request.headers.get('X-Fingerprint-ID');
//     const anonymousId = request.headers.get('X-Anonymous-ID');

//     if (!fingerprintId && !anonymousId) {
//       return NextResponse.json({ error: 'No identification headers found.' }, { status: 400 });
//     }

//     let userToken;

//     // Prioritize lookup by fingerprintId
//     if (fingerprintId) {
//       userToken = await UserToken.findOne({ fingerprintId });
//     }

//     // If not found by fingerprint, try by anonymousId
//     if (!userToken && anonymousId) {
//       userToken = await UserToken.findOne({ anonymousId });
//       // If found by anonymousId but fingerprint is now available, update the record
//       if (userToken && fingerprintId && !userToken.fingerprintId) {
//         userToken.fingerprintId = fingerprintId;
//         await userToken.save();
//       }
//     }

//     // If still no record, create a new one (should ideally be handled by /api/identify-user POST,
//     // but this provides a fallback for direct GET requests or edge cases)
//     if (!userToken) {
//       userToken = await UserToken.create({
//         fingerprintId: fingerprintId || null,
//         anonymousId: anonymousId || null,
//         lastResetDate: new Date(),
//         tokensUsedToday: 0,
//         maxTokensPerDay: 20,
//         isSubscriber: false,
//       });
//     } else {
//       // Reconcile anonymousId if it changed (e.g., after cookie deletion)
//       if (anonymousId && userToken.anonymousId !== anonymousId) {
//         userToken.anonymousId = anonymousId;
//         await userToken.save();
//       }
//     }

//     // Ensure tokens are reset for the current UTC day if needed
//     const now = new Date();
//     const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

//     if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
//       userToken.tokensUsedToday = 0;
//       userToken.lastResetDate = todayMidnightUtc;
//       await userToken.save();
//     }

//     return NextResponse.json({
//       tokensUsed: userToken.tokensUsedToday,
//       maxTokens: userToken.maxTokensPerDay,
//       isSubscriber: userToken.isSubscriber,
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Error fetching user tokens:', error);
//     return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
//   }
// }

// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import getUserTokenModel from '@/models/UserToken';
// import { getServerSession } from 'next-auth'; // Import getServerSession

// export const runtime = 'nodejs';

// export async function GET(request) {
//   await dbConnect();
//   const UserToken = getUserTokenModel();

//   try {
//     const session = await getServerSession(); // Get the server-side session

//     let userToken = null;
//     let identifier = null; // To log which ID was used

//     if (session?.user?.id) {
//       // If authenticated, prioritize lookup by userId
//       userToken = await UserToken.findOne({ userId: session.user.id });
//       identifier = `Auth User: ${session.user.id}`;
//     } else {
//       // For unauthenticated users, use fingerprintId and anonymousId from headers
//       const fingerprintId = request.headers.get('X-Fingerprint-ID');
//       const anonymousId = request.headers.get('X-Anonymous-ID');

//       if (!fingerprintId && !anonymousId) {
//         console.warn('GET /api/user-tokens: No identification headers or session found. Returning default values.');
//         return NextResponse.json({
//             tokensUsed: 0,
//             maxTokens: 20,
//             isSubscriber: false,
//         }, { status: 200 });
//       }

//       // Prioritize lookup by fingerprintId for anonymous users
//       if (fingerprintId) {
//         userToken = await UserToken.findOne({ fingerprintId });
//         identifier = `FP: ${fingerprintId}`;
//       }

//       // If not found by fingerprint, try by anonymousId
//       // IMPORTANT: This GET route should *not* attempt to set fingerprintId on an anon record.
//       // That reconciliation is the responsibility of the POST /api/identify-user route.
//       if (!userToken && anonymousId) {
//         userToken = await UserToken.findOne({ anonymousId });
//         identifier = `Anon: ${anonymousId}`;
//       }
//     }

//     // If still no record, it means identify-user hasn't created it yet, or there's an issue.
//     // We should NOT create a new record here in the GET endpoint.
//     // Instead, return default/zero tokens, and the client-side identifyUser (MainLayout)
//     // will ensure a record is created/reconciled.
//     if (!userToken) {
//         console.warn(`GET /api/user-tokens: No user token found for ${identifier}. Returning default values.`);
//         return NextResponse.json({
//             tokensUsed: 0,
//             maxTokens: 20,
//             isSubscriber: false,
//         }, { status: 200 });
//     }

//     // Ensure tokens are reset for the current UTC day if needed
//     const now = new Date();
//     const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

//     if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
//       userToken.tokensUsedToday = 0;
//       userToken.lastResetDate = todayMidnightUtc;
//       await userToken.save(); // This save is fine, as it's an update on an existing document, not creating a new unique key
//     }

//     // Check for unlimited access expiry
//     if (userToken.unlimitedAccessUntil && new Date() > userToken.unlimitedAccessUntil) {
//       userToken.unlimitedAccessUntil = null; // Clear expired unlimited access
//       await userToken.save();
//     }

//     return NextResponse.json({
//       tokensUsed: userToken.tokensUsedToday,
//       maxTokens: userToken.isSubscriber || (userToken.unlimitedAccessUntil && new Date() <= userToken.unlimitedAccessUntil) ? Infinity : userToken.maxTokensPerDay,
//       isSubscriber: userToken.isSubscriber,
//       unlimitedAccessUntil: userToken.unlimitedAccessUntil,
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Error fetching user tokens in /api/user-tokens:', error);
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
//   }
// }

// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import getUserTokenModel from '@/models/UserToken';
// import { getServerSession } from 'next-auth'; // Import getServerSession

// export const runtime = 'nodejs';

// export async function GET(request) {
//   await dbConnect();
//   const UserToken = getUserTokenModel();

//   try {
//     const session = await getServerSession(); // Get the server-side session

//     let userToken = null;
//     let identifier = null; // To log which ID was used

//     if (session?.user?.id) {
//       // If authenticated, prioritize lookup by userId
//       userToken = await UserToken.findOne({ userId: session.user.id });
//       identifier = `Auth User: ${session.user.id}`;
//     } else {
//       // For unauthenticated users, use fingerprintId and anonymousId from headers
//       const fingerprintId = request.headers.get('X-Fingerprint-ID');
//       const anonymousId = request.headers.get('X-Anonymous-ID');

//       if (!fingerprintId && !anonymousId) {
//         console.warn('GET /api/user-tokens: No identification headers or session found. Returning default values.');
//         return NextResponse.json({
//             tokensUsed: 0,
//             maxTokens: 20,
//             isSubscriber: false,
//         }, { status: 200 });
//       }

//       // Prioritize lookup by fingerprintId for anonymous users
//       if (fingerprintId) {
//         userToken = await UserToken.findOne({ fingerprintId });
//         identifier = `FP: ${fingerprintId}`;
//       }

//       // If not found by fingerprint, try by anonymousId
//       // IMPORTANT: This GET route should *not* attempt to set fingerprintId on an anon record.
//       // That reconciliation is the responsibility of the POST /api/identify-user route.
//       if (!userToken && anonymousId) {
//         userToken = await UserToken.findOne({ anonymousId });
//         identifier = `Anon: ${anonymousId}`;
//       }
//     }

//     // If still no record, it means identify-user hasn't created it yet, or there's an issue.
//     // We should NOT create a new record here in the GET endpoint.
//     // Instead, return default/zero tokens, and the client-side identifyUser (MainLayout)
//     // will ensure a record is created/reconciled.
//     if (!userToken) {
//         console.warn(`GET /api/user-tokens: No user token found for ${identifier}. Returning default values.`);
//         return NextResponse.json({
//             tokensUsed: 0,
//             maxTokens: 20,
//             isSubscriber: false,
//         }, { status: 200 });
//     }

//     // Ensure tokens are reset for the current UTC day if needed
//     const now = new Date();
//     const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

//     if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
//       userToken.tokensUsedToday = 0;
//       userToken.lastResetDate = todayMidnightUtc;
//       await userToken.save(); // This save is fine, as it's an update on an existing document, not creating a new unique key
//     }

//     // Check for unlimited access expiry
//     if (userToken.unlimitedAccessUntil && new Date() > userToken.unlimitedAccessUntil) {
//       userToken.unlimitedAccessUntil = null; // Clear expired unlimited access
//       await userToken.save();
//     }

//     return NextResponse.json({
//       tokensUsed: userToken.tokensUsedToday,
//       maxTokens: userToken.isSubscriber || (userToken.unlimitedAccessUntil && new Date() <= userToken.unlimitedAccessUntil) ? Infinity : userToken.maxTokensPerDay,
//       isSubscriber: userToken.isSubscriber,
//       unlimitedAccessUntil: userToken.unlimitedAccessUntil,
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Error fetching user tokens in /api/user-tokens:', error);
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
//   }
// }


// document-pro/src/app/api/user-tokens/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import getUserTokenModel from '@/models/UserToken';

export const runtime = 'nodejs';

export async function GET(req) {
  await dbConnect();
  const UserToken = getUserTokenModel();

  const session = await getServerSession(authOptions);
  let userIdToUse = null;
  let isAnonymous = true;

  if (session?.user?.id) {
    userIdToUse = session.user.id;
    isAnonymous = false;
    console.log(`[User Tokens API] Authenticated user detected. Using userId: ${userIdToUse}`);
  } else {
    // For unauthenticated users, use fingerprintId or anonymousId from headers
    const fingerprintId = req.headers.get('X-Fingerprint-ID');
    const anonymousId = req.headers.get('X-Anonymous-ID');

    if (fingerprintId) {
      userIdToUse = fingerprintId;
      isAnonymous = true;
      console.log(`[User Tokens API] Anonymous user detected. Using fingerprintId: ${userIdToUse}`);
    } else if (anonymousId) {
      userIdToUse = anonymousId;
      isAnonymous = true;
      console.log(`[User Tokens API] Anonymous user detected. Using anonymousId: ${userIdToUse}`);
    } else {
      console.error('[User Tokens API] No user identification found in session or headers.');
      // If no identifier, return default free tier tokens
      return NextResponse.json({
        tokensUsed: 0,
        maxTokens: 20,
        isSubscriber: false,
        unlimitedAccessUntil: null,
      }, { status: 200 });
    }
  }

  try {
    let userToken;
    if (isAnonymous) {
      userToken = await UserToken.findOne({ fingerprintId: userIdToUse });
    } else {
      userToken = await UserToken.findOne({ userId: userIdToUse });
    }

    if (!userToken) {
      // If no token found, create a new one with default free tier
      if (isAnonymous) {
        userToken = await UserToken.create({
          fingerprintId: userIdToUse,
          lastResetDate: new Date(),
          tokensUsedToday: 0,
          maxTokensPerDay: 20,
          isSubscriber: false,
        });
        console.log(`[User Tokens API] Created new anonymous UserToken for fingerprintId: ${userIdToUse}`);
      } else {
        userToken = await UserToken.create({
          userId: userIdToUse,
          lastResetDate: new Date(),
          tokensUsedToday: 0,
          maxTokensPerDay: 20,
          isSubscriber: false,
        });
        console.log(`[User Tokens API] Created new authenticated UserToken for userId: ${userIdToUse}`);
      }
    }

    // Ensure tokens are reset for the current UTC day if needed
    const now = new Date();
    const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
      userToken.tokensUsedToday = 0;
      userToken.lastResetDate = todayMidnightUtc;
      await userToken.save();
      console.log(`[User Tokens API] UserToken for ${userIdToUse} reset for new day.`);
    }

    // Check for unlimited access expiry
    if (userToken.unlimitedAccessUntil && new Date() > userToken.unlimitedAccessUntil) {
      userToken.unlimitedAccessUntil = null; // Clear expired unlimited access
      userToken.maxTokensPerDay = 20; // Revert to default free tier
      userToken.isSubscriber = false; // Ensure isSubscriber is false if one-time access expired
      await userToken.save();
      console.log(`[User Tokens API] Unlimited access for ${userIdToUse} expired. Reverted to free tier.`);
    }

    // Determine current tokens and max tokens based on the identified user's status
    const currentTokensUsed = userToken.tokensUsedToday;
    let currentMaxTokens = userToken.maxTokensPerDay;
    let currentIsSubscriber = userToken.isSubscriber;
    let currentUnlimitedAccessUntil = userToken.unlimitedAccessUntil;

    // Override maxTokens for active subscriptions or one-time passes
    if (userToken.isSubscriber || (userToken.unlimitedAccessUntil && new Date() <= userToken.unlimitedAccessUntil)) {
      currentMaxTokens = Infinity;
      currentIsSubscriber = userToken.isSubscriber || true; // Ensure true if unlimited access
    }

    console.log(`[User Tokens API] Responding with: userId: ${userIdToUse}, tokensUsed: ${currentTokensUsed}, maxTokens: ${currentMaxTokens}, isSubscriber: ${currentIsSubscriber}, unlimitedAccessUntil: ${currentUnlimitedAccessUntil}`);

    return NextResponse.json({
      tokensUsed: currentTokensUsed,
      maxTokens: currentMaxTokens,
      isSubscriber: currentIsSubscriber,
      unlimitedAccessUntil: currentUnlimitedAccessUntil,
    }, { status: 200 });

  } catch (error) {
    console.error('[User Tokens API] Error fetching user token data:', error);
    return NextResponse.json({ error: 'Failed to fetch user token data.' }, { status: 500 });
  }
}
