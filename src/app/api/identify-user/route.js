// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import getUserTokenModel from '@/models/UserToken';

// export const runtime = 'nodejs'; // Must run in Node.js runtime for Mongoose

// export async function POST(request) {
//   await dbConnect();
//   const UserToken = getUserTokenModel();

//   try {
//     const { fingerprintId, anonymousId } = await request.json();

//     if (!fingerprintId && !anonymousId) {
//       return NextResponse.json({ error: 'No identification data provided.' }, { status: 400 });
//     }

//     let userToken;

//     // 1. Try to find by fingerprintId (most persistent)
//     if (fingerprintId) {
//       userToken = await UserToken.findOne({ fingerprintId });
//     }

//     // 2. If not found by fingerprint, try by anonymousId
//     if (!userToken && anonymousId) {
//       userToken = await UserToken.findOne({ anonymousId });
//     }

//     // 3. If still no record, create a new one
//     if (!userToken) {
//       userToken = await UserToken.create({
//         fingerprintId: fingerprintId || null, // Store fingerprint if available
//         anonymousId: anonymousId || null,     // Store anonymous ID if available
//         lastResetDate: new Date(),
//         tokensUsedToday: 0,
//         maxTokensPerDay: 20,
//         isSubscriber: false,
//       });
//     } else {
//       // 4. If record found, update/reconcile IDs
//       let updated = false;
//       if (fingerprintId && userToken.fingerprintId !== fingerprintId) {
//         userToken.fingerprintId = fingerprintId;
//         updated = true;
//       }
//       if (anonymousId && userToken.anonymousId !== anonymousId) {
//         userToken.anonymousId = anonymousId;
//         updated = true;
//       }
//       if (updated) {
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
//       message: 'User identified and token data reconciled.',
//       tokensUsed: userToken.tokensUsedToday,
//       maxTokens: userToken.maxTokensPerDay,
//       isSubscriber: userToken.isSubscriber,
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Error in /api/identify-user:', error);
//     return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
//   }
// }


// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import getUserTokenModel from '@/models/UserToken';

// export const runtime = 'nodejs';

// export async function POST(request) {
//   await dbConnect();
//   const UserToken = getUserTokenModel();

//   try {
//     const { fingerprintId, anonymousId } = await request.json();

//     if (!fingerprintId && !anonymousId) {
//       return NextResponse.json({ error: 'No identification data provided.' }, { status: 400 });
//     }

//     let userToken = null;
//     let fpDoc = null;
//     let anonDoc = null;

//     // 1. Find by fingerprintId (if provided)
//     if (fingerprintId) {
//       fpDoc = await UserToken.findOne({ fingerprintId });
//     }

//     // 2. Find by anonymousId (if provided)
//     if (anonymousId) {
//       anonDoc = await UserToken.findOne({ anonymousId });
//     }

//     // --- Reconciliation Logic ---

//     if (fpDoc) {
//       // Case A: A document exists for this fingerprintId. This is the primary source of truth.
//       userToken = fpDoc;

//       // If an anonymous document also exists AND it's a *different* document,
//       // it means this anonymous session has now been linked to an existing fingerprint.
//       // We should merge or discard the anonymous record.
//       if (anonDoc && anonDoc._id.toString() !== fpDoc._id.toString()) {
//         console.log(`[identify-user] Merging: Deleting old anonymous token ${anonDoc._id} as fingerprint token ${fpDoc._id} exists.`);
//         // Optionally, transfer tokensUsedToday from anonDoc to fpDoc before deleting
//         if (anonDoc.tokensUsedToday > userToken.tokensUsedToday) {
//             userToken.tokensUsedToday = anonDoc.tokensUsedToday;
//             await userToken.save(); // Save the updated fpDoc
//         }
//         await UserToken.deleteOne({ _id: anonDoc._id });
//       }

//       // Ensure the anonymousId on the primary record is up-to-date
//       if (anonymousId && userToken.anonymousId !== anonymousId) {
//         userToken.anonymousId = anonymousId;
//         await userToken.save();
//       }

//     } else if (anonDoc) {
//       // Case B: No document for fingerprintId, but a document exists for anonymousId.
//       userToken = anonDoc;

//       // If fingerprintId is now available, update this anonymous record to include it.
//       // This is safe because we already confirmed no fpDoc exists for this fingerprintId.
//       if (fingerprintId && !userToken.fingerprintId) {
//         userToken.fingerprintId = fingerprintId;
//         await userToken.save();
//       }

//     } else {
//       // Case C: No document found by either ID. Create a new one.
//       userToken = await UserToken.create({
//         fingerprintId: fingerprintId || null,
//         anonymousId: anonymousId || null,
//         lastResetDate: new Date(),
//         tokensUsedToday: 0,
//         maxTokensPerDay: 20,
//         isSubscriber: false,
//       });
//       console.log('[identify-user] Created new user token record.');
//     }

//     // Ensure tokens are reset for the current UTC day if needed (applies to the final userToken)
//     const now = new Date();
//     const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

//     if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
//       userToken.tokensUsedToday = 0;
//       userToken.lastResetDate = todayMidnightUtc;
//       await userToken.save();
//     }

//     return NextResponse.json({
//       message: 'User identified and token data reconciled.',
//       tokensUsed: userToken.tokensUsedToday,
//       maxTokens: userToken.maxTokensPerDay,
//       isSubscriber: userToken.isSubscriber,
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Error in /api/identify-user:', error);
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     if (error.code === 11000) {
//       console.error('MongoDB Duplicate Key Error (E11000) in /api/identify-user:', error.keyValue);
//     }
//     return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
//   }
// }

// document-pro/src/app/api/identify-user/route.js
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/[...nextauth]/route'; // Import authOptions
// import dbConnect from '@/lib/mongodb';
// import getUserTokenModel from '@/models/UserToken';

// export const runtime = 'nodejs';

// export async function POST(req) {
//   await dbConnect();
//   const UserToken = getUserTokenModel();

//   const session = await getServerSession(authOptions); // Get the server-side session

//   let userIdToUse = null;
//   let isAnonymous = true;
//   let fingerprintIdFromRequest = null;

//   // Prioritize authenticated user ID from session
//   if (session?.user?.id) {
//     userIdToUse = session.user.id;
//     isAnonymous = false;
//     console.log(`[Identify User API] Authenticated user detected. Using userId: ${userIdToUse}`);
//   } else {
//     // If not authenticated, try to get fingerprintId from request body
//     try {
//       const body = await req.json();
//       fingerprintIdFromRequest = body.fingerprintId;
//       if (fingerprintIdFromRequest) {
//         userIdToUse = fingerprintIdFromRequest;
//         isAnonymous = true;
//         console.log(`[Identify User API] Anonymous user detected. Using fingerprintId: ${userIdToUse}`);
//       } else {
//         // If no authenticated user and no fingerprintId, this is an error
//         console.error('[Identify User API] No user identifier (authenticated or anonymous) provided.');
//         return NextResponse.json({ error: 'User identifier missing.' }, { status: 400 });
//       }
//     } catch (error) {
//       console.error('[Identify User API] Error parsing request body for fingerprintId:', error);
//       return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
//     }
//   }

//   try {
//     let userToken;

//     if (isAnonymous) {
//       // For anonymous users, find/create by fingerprintId
//       userToken = await UserToken.findOne({ fingerprintId: userIdToUse });
//       if (!userToken) {
//         userToken = await UserToken.create({
//           fingerprintId: userIdToUse,
//           lastResetDate: new Date(),
//           tokensUsedToday: 0,
//           maxTokensPerDay: 20, // Default for anonymous
//           isSubscriber: false,
//         });
//         console.log(`[Identify User API] Created new anonymous UserToken for fingerprintId: ${userIdToUse}`);
//       } else {
//         console.log(`[Identify User API] Found existing anonymous UserToken for fingerprintId: ${userIdToUse}`);
//       }
//     } else {
//       // For authenticated users, find/create by userId
//       userToken = await UserToken.findOne({ userId: userIdToUse });
//       if (!userToken) {
//         // If an authenticated user doesn't have a token, create one.
//         // We might also consider migrating data from an anonymous token here if it exists,
//         // but for now, we'll create a fresh one or use existing.
//         userToken = await UserToken.create({
//           userId: userIdToUse,
//           lastResetDate: new Date(),
//           tokensUsedToday: 0,
//           maxTokensPerDay: 20, // Default for new registered users
//           isSubscriber: false,
//         });
//         console.log(`[Identify User API] Created new authenticated UserToken for userId: ${userIdToUse}`);
//       } else {
//         console.log(`[Identify User API] Found existing authenticated UserToken for userId: ${userIdToUse}`);
//       }

//       // --- Important: If an authenticated user has an associated anonymousId, clear it ---
//       // This prevents the system from accidentally using the old anonymous token.
//       // This assumes you might have a field like 'anonymousId' on the UserToken for registered users
//       // to link back to their previous anonymous usage. If not, this can be skipped.
//       // For now, let's ensure the anonymous token is not used for authenticated users.
//       // If the user was previously anonymous and now logged in, we ensure the correct token is used.
//       // The `fingerprintId` field on the UserToken model should ideally only be present for anonymous users.
//       // For authenticated users, the `userId` field is the primary identifier.
//       // We don't need to explicitly "migrate" anonymous tokens for now, as the logic will simply
//       // use the authenticated token going forward.
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

//     console.log(`[Identify User API] Responding with: userId: ${userIdToUse}, tokensUsed: ${currentTokensUsed}, maxTokens: ${currentMaxTokens}, isSubscriber: ${currentIsSubscriber}, unlimitedAccessUntil: ${currentUnlimitedAccessUntil}`);

//     return NextResponse.json({
//       userId: userIdToUse, // Return the ID that was actually used
//       tokensUsed: currentTokensUsed,
//       maxTokens: currentMaxTokens,
//       isSubscriber: currentIsSubscriber,
//       unlimitedAccessUntil: currentUnlimitedAccessUntil,
//     }, { status: 200 });

//   } catch (error) {
//     console.error('[Identify User API] Error processing user identification:', error);
//     return NextResponse.json({ error: 'Failed to identify user.' }, { status: 500 });
//   }
// }


// document-pro/src/app/api/identify-user/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // Import authOptions
import dbConnect from '@/lib/mongodb';
import getUserTokenModel from '@/models/UserToken';

export const runtime = 'nodejs';

export async function POST(req) {
  console.log('[Identify User API] Request received.');
  try {
    await dbConnect();
    console.log('[Identify User API] Database connected.');
    const UserToken = getUserTokenModel();
    console.log('[Identify User API] UserToken model retrieved.');

    const session = await getServerSession(authOptions);
    console.log('[Identify User API] Session retrieved:', session ? 'Authenticated' : 'Unauthenticated');

    let userIdToUse = null;
    let isAnonymous = true;

    if (session?.user?.id) {
      userIdToUse = session.user.id;
      isAnonymous = false;
      console.log(`[Identify User API] Authenticated user detected. Using userId: ${userIdToUse}`);
    } else {
      console.log('[Identify User API] Attempting to identify anonymous user from request body.');
      try {
        const body = await req.json(); // This is where MainLayout sends fingerprintId
        const fingerprintIdFromRequest = body.fingerprintId;
        if (fingerprintIdFromRequest) {
          userIdToUse = fingerprintIdFromRequest;
          isAnonymous = true;
          console.log(`[Identify User API] Anonymous user detected. Using fingerprintId from body: ${userIdToUse}`);
        } else {
          console.error('[Identify User API] No fingerprintId found in request body for anonymous identification.');
          return NextResponse.json({ error: 'User identifier missing in request body.' }, { status: 400 });
        }
      } catch (error) {
        console.error('[Identify User API] Error parsing request body for fingerprintId:', error);
        return NextResponse.json({ error: 'Invalid request body or missing fingerprintId.' }, { status: 400 });
      }
    }

    // Ensure userIdToUse is set before proceeding
    if (!userIdToUse) {
      console.error('[Identify User API] Critical error: userIdToUse is null after identification logic.');
      return NextResponse.json({ error: 'Internal server error: User identifier not established.' }, { status: 500 });
    }

    let userToken;
    console.log(`[Identify User API] Looking for UserToken for ID: ${userIdToUse} (Anonymous: ${isAnonymous})`);

    if (isAnonymous) {
      userToken = await UserToken.findOne({ fingerprintId: userIdToUse });
      if (!userToken) {
        console.log(`[Identify User API] No anonymous UserToken found. Creating new for fingerprintId: ${userIdToUse}`);
        userToken = await UserToken.create({
          fingerprintId: userIdToUse,
          lastResetDate: new Date(),
          tokensUsedToday: 0,
          maxTokensPerDay: 20,
          isSubscriber: false,
        });
      } else {
        console.log(`[Identify User API] Found existing anonymous UserToken for fingerprintId: ${userIdToUse}`);
      }
    } else {
      userToken = await UserToken.findOne({ userId: userIdToUse });
      if (!userToken) {
        console.log(`[Identify User API] No authenticated UserToken found. Creating new for userId: ${userIdToUse}`);
        userToken = await UserToken.create({
          userId: userIdToUse,
          lastResetDate: new Date(),
          tokensUsedToday: 0,
          maxTokensPerDay: 20,
          isSubscriber: false,
        });
      } else {
        console.log(`[Identify User API] Found existing authenticated UserToken for userId: ${userIdToUse}`);
      }
    }

    if (!userToken) {
        console.error(`[Identify User API] Failed to retrieve or create UserToken for ID: ${userIdToUse}.`);
        return NextResponse.json({ error: 'Failed to establish user token record.' }, { status: 500 });
    }
    console.log('[Identify User API] UserToken object successfully retrieved/created.');

    // Ensure tokens are reset for the current UTC day if needed
    const now = new Date();
    const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
      console.log(`[Identify User API] Resetting tokens for ${userIdToUse}.`);
      userToken.tokensUsedToday = 0;
      userToken.lastResetDate = todayMidnightUtc;
      await userToken.save();
    }

    // Check for unlimited access expiry
    if (userToken.unlimitedAccessUntil && new Date() > userToken.unlimitedAccessUntil) {
      console.log(`[Identify User API] Unlimited access expired for ${userIdToUse}. Resetting.`);
      userToken.unlimitedAccessUntil = null;
      userToken.maxTokensPerDay = 20; // Revert to default free tier
      userToken.isSubscriber = false; // Ensure isSubscriber is false if one-time access expired
      await userToken.save();
    }

    const currentTokensUsed = userToken.tokensUsedToday;
    let currentMaxTokens = userToken.maxTokensPerDay;
    let currentIsSubscriber = userToken.isSubscriber;
    let currentUnlimitedAccessUntil = userToken.unlimitedAccessUntil;

    if (userToken.isSubscriber || (userToken.unlimitedAccessUntil && new Date() <= userToken.unlimitedAccessUntil)) {
      currentMaxTokens = Infinity;
      currentIsSubscriber = userToken.isSubscriber || true;
    }

    console.log(`[Identify User API] Responding with: userId: ${userIdToUse}, tokensUsed: ${currentTokensUsed}, maxTokens: ${currentMaxTokens}, isSubscriber: ${currentIsSubscriber}, unlimitedAccessUntil: ${currentUnlimitedAccessUntil}`);

    return NextResponse.json({
      userId: userIdToUse,
      tokensUsed: currentTokensUsed,
      maxTokens: currentMaxTokens,
      isSubscriber: currentIsSubscriber,
      unlimitedAccessUntil: currentUnlimitedAccessUntil,
    }, { status: 200 });

  } catch (error) {
    console.error('[Identify User API] Uncaught error in POST handler:', error);
    console.error('[Identify User API] Error name:', error.name);
    console.error('[Identify User API] Error message:', error.message);
    console.error('[Identify User API] Error stack:', error.stack);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); // Return generic 500 for client
  }
}
