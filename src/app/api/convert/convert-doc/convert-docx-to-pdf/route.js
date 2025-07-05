// WAS WORKING FINE 04-07-25
// import { NextResponse } from 'next/server';

// export async function POST(request) {
//   try {

//     const API_ENDPOINT = `${process.env.PYTHON_ANYWHERE_URL}/convert-docx-to-pdf` // Fallback URL if env variable is not set

//     const formData = await request.formData(); // Get form data from Next.js request
//     const file = formData.get('file'); // Get the file from the formData

//     if (!file) {
//       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
//     }

//     // Create new FormData to forward the file to your Flask server
//     const flaskFormData = new FormData();
//     flaskFormData.append('file', file); // 'file' key must match Flask's expectation

//     // IMPORTANT: Your PythonAnywhere Flask server URL for DOCX to PDF
//     const flaskResponse = await fetch(API_ENDPOINT, {
//       method: 'POST',
//       body: flaskFormData,
//       // No need for 'Content-Type' header for FormData, fetch sets it automatically
//     });

//     if (!flaskResponse.ok) {
//       const errorText = await flaskResponse.text(); // Get raw text from Flask error response
//       let errorMessage = `Flask server failed to convert DOCX to PDF. Status: ${flaskResponse.status}`;
//       try {
//         const errorData = JSON.parse(errorText); // Try parsing as JSON
//         errorMessage = errorData.error || errorMessage;
//       } catch (e) {
//         // If not JSON, use raw text
//         errorMessage = `${errorMessage}. Details: ${errorText}`;
//       }
//       return NextResponse.json({ error: errorMessage }, { status: flaskResponse.status });
//     }

//     // Flask server sends back a PDF blob directly. Forward it.
//     const pdfBlob = await flaskResponse.blob();
    
//     // Get content disposition header if available, otherwise set a default
//     const contentDisposition = flaskResponse.headers.get('Content-Disposition') || `attachment; filename="converted.pdf"`;

//     const headers = new Headers();
//     headers.set('Content-Type', 'application/pdf');
//     headers.set('Content-Disposition', contentDisposition);

//     return new NextResponse(pdfBlob, {
//       status: 200,
//       headers: headers,
//     });

//   } catch (error) {
//     console.error('Next.js API route /api/convert-docx-to-pdf error:', error);
//     return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
//   }
// }


// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import getUserTokenModel from '@/models/UserToken';
// import getConversionRequestModel from '@/models/ConversionRequest'; // Use get function

// export const runtime = 'nodejs'; // Must run in Node.js runtime for Mongoose

// export async function POST(request) {
//   await dbConnect();
//   const UserToken = getUserTokenModel();
//   const ConversionRequest = getConversionRequestModel(); // Get the model instance

//   const startTime = Date.now();
//   let requestRecord = null; // Declared outside try block
//   let userToken = null;     // Declared outside try block
//   let fingerprintId = null; // Declared outside try block
//   let anonymousId = null;   // Declared outside try block

//   try {
//     fingerprintId = request.headers.get('X-Fingerprint-ID'); // Assigned here
//     anonymousId = request.headers.get('X-Anonymous-ID');     // Assigned here

//     if (!fingerprintId && !anonymousId) {
//       return NextResponse.json({ error: 'No identification headers found. Token check cannot proceed.' }, { status: 500 });
//     }

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
//       userToken = fpDoc;
//       if (anonDoc && anonDoc._id.toString() !== fpDoc._id.toString()) {
//         console.log(`[convert-docx-to-pdf] Merging: Deleting old anonymous token ${anonDoc._id} as fingerprint token ${fpDoc._id} exists.`);
//         if (anonDoc.tokensUsedToday > userToken.tokensUsedToday) {
//             userToken.tokensUsedToday = anonDoc.tokensUsedToday;
//             await userToken.save();
//         }
//         await UserToken.deleteOne({ _id: anonDoc._id });
//       }
//       if (anonymousId && userToken.anonymousId !== anonymousId) {
//         userToken.anonymousId = anonymousId;
//         await userToken.save();
//       }
//     } else if (anonDoc) {
//       userToken = anonDoc;
//       if (fingerprintId && !userToken.fingerprintId) {
//         userToken.fingerprintId = fingerprintId;
//         await userToken.save();
//       }
//     } else {
//         // If no userToken is found by either ID, it means the identify-user endpoint
//         // hasn't run or failed. This route should not create a new one.
//         console.error(`[convert-docx-to-pdf] No user token found for FP:${fingerprintId}, Anon:${anonymousId}. User token record must be established by /api/identify-user first.`);
//         return NextResponse.json({ error: 'User token data not found. Please refresh the page to establish your session, or try again.' }, { status: 403 });
//     }

//     // Ensure tokens are reset for the current UTC day if needed
//     const now = new Date();
//     const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

//     if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
//       userToken.tokensUsedToday = 0;
//       userToken.lastResetDate = todayMidnightUtc;
//       await userToken.save();
//     }

//     const tokensNeeded = 1; // DOCX to PDF conversion costs 1 token

//     // --- Pre-flight Token Check ---
//     if (!userToken.isSubscriber && (userToken.tokensUsedToday + tokensNeeded) > userToken.maxTokensPerDay) {
//       // Create ConversionRequest record for failed attempt due to tokens
//       await ConversionRequest.create({
//         type: 'docx-to-pdf-conversion',
//         userId: fingerprintId || anonymousId || 'unknown',
//         fileDetails: {
//           fileName: 'N/A',
//           fileSizeKB: 0,
//           fileMimeType: 'N/A'
//         },
//         requestDetails: {
//           outputFormat: 'pdf',
//           isBatch: false,
//           numberOfFiles: 1
//         },
//         status: 'failed',
//         errorMessage: `Insufficient tokens. Needed ${tokensNeeded}, have ${userToken.maxTokensPerDay - userToken.tokensUsedToday}.`,
//         durationMs: Date.now() - startTime
//       });
//       return NextResponse.json({ error: `Daily token limit exceeded. You need ${tokensNeeded} token but only have ${userToken.maxTokensPerDay - userToken.tokensUsedToday} remaining. Please try again tomorrow or subscribe for unlimited access.` }, { status: 429 });
//     }
//     // --- End Pre-flight Token Check ---

//     const formData = await request.formData();
//     const file = formData.get('file');

//     if (!file) {
//       requestRecord = await ConversionRequest.create({
//         type: 'docx-to-pdf-conversion',
//         userId: fingerprintId || anonymousId || 'unknown',
//         fileDetails: { fileName: 'N/A', fileSizeKB: 0, fileMimeType: 'N/A' },
//         requestDetails: { outputFormat: 'pdf', isBatch: false, numberOfFiles: 1 },
//         status: 'failed',
//         errorMessage: 'No file provided for DOCX to PDF conversion.',
//         durationMs: Date.now() - startTime
//       });
//       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
//     }

//     // Create ConversionRequest record for pending attempt
//     requestRecord = await ConversionRequest.create({
//       type: 'docx-to-pdf-conversion',
//       userId: fingerprintId || anonymousId || 'unknown',
//       fileDetails: {
//         fileName: file.name,
//         fileSizeKB: file.size / 1024,
//         fileMimeType: file.type
//       },
//       requestDetails: { outputFormat: 'pdf', isBatch: false, numberOfFiles: 1 },
//       status: 'pending'
//     });

//     const flaskFormData = new FormData();
//     flaskFormData.append('file', file);

//     const flaskResponse = await fetch('https://sensimods.pythonanywhere.com/convert-docx-to-pdf', {
//       method: 'POST',
//       body: flaskFormData,
//     });

//     if (!flaskResponse.ok) {
//       const errorText = await flaskResponse.text();
//       let errorMessage = `Flask server failed to convert DOCX to PDF. Status: ${flaskResponse.status}`;
//       try {
//         const errorData = JSON.parse(errorText);
//         errorMessage = errorData.error || errorMessage;
//       } catch (e) {
//         errorMessage = `${errorMessage}. Details: ${errorText}`;
//       }

//       if (requestRecord) {
//         requestRecord.status = 'failed';
//         requestRecord.errorMessage = errorMessage;
//         requestRecord.durationMs = Date.now() - startTime;
//         await requestRecord.save();
//       }
//       return NextResponse.json({ error: errorMessage }, { status: flaskResponse.status });
//     }

//     const pdfBlob = await flaskResponse.blob();
//     const contentDisposition = flaskResponse.headers.get('Content-Disposition') || `attachment; filename="converted.pdf"`;

//     const headers = new Headers();
//     headers.set('Content-Type', 'application/pdf');
//     headers.set('Content-Disposition', contentDisposition);

//     // --- Token Consumption Logic: Consume 1 token for successful conversion ---
//     if (!userToken.isSubscriber) {
//       userToken.tokensUsedToday += tokensNeeded; // Consume 1 token
//       await userToken.save();
//     }
//     // --- End Token Consumption Logic ---

//     if (requestRecord) {
//       requestRecord.status = 'success';
//       requestRecord.durationMs = Date.now() - startTime;
//       await requestRecord.save();
//     }

//     return new NextResponse(pdfBlob, {
//       status: 200,
//       headers: headers,
//     });

//   } catch (error) {
//     console.error('Next.js API route /api/convert-docx-to-pdf error:', error);
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     let errorMessage = `Internal server error: ${error.message}`;

//     // Ensure fingerprintId/anonymousId are available for logging in catch block
//     const currentFingerprintId = fingerprintId;
//     const currentAnonymousId = anonymousId;

//     if (requestRecord) {
//       requestRecord.status = 'failed';
//       requestRecord.errorMessage = errorMessage;
//       requestRecord.durationMs = Date.now() - startTime;
//       await requestRecord.save();
//     } else {
//       // Only create a new record if requestRecord was never successfully assigned
//       await ConversionRequest.create({
//         type: 'docx-to-pdf-conversion',
//         userId: currentFingerprintId || currentAnonymousId || 'unknown', // Use the defined variables
//         fileDetails: { fileName: 'Unknown', fileSizeKB: 0, fileMimeType: 'N/A' },
//         requestDetails: { outputFormat: 'pdf', isBatch: false, numberOfFiles: 0 },
//         status: 'failed',
//         errorMessage: `Internal server error (no record created): ${errorMessage}`,
//         durationMs: Date.now() - startTime
//       });
//     }
//     return NextResponse.json({ error: errorMessage }, { status: 500 });
//   }
// }

// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import getUserTokenModel from '@/models/UserToken';
// import getConversionRequestModel from '@/models/ConversionRequest';
// import { getServerSession }  from 'next-auth'; // Import getServerSession

// export const runtime = 'nodejs'; // Must run in Node.js runtime for Mongoose

// export async function POST(request) {
//   await dbConnect();
//   const UserToken = getUserTokenModel();
//   const ConversionRequest = getConversionRequestModel();

//   const startTime = Date.now();
//   let requestRecord = null;
//   let userToken = null;
//   let identifierId = null; // Stores the actual ID used for lookup (userId, fingerprintId, or anonymousId)

//   try {
//     const session = await getServerSession(); // Get the server-side session

//     if (session?.user?.id) {
//       // If authenticated, prioritize lookup by userId
//       userToken = await UserToken.findOne({ userId: session.user.id });
//       identifierId = session.user.id;
//     } else {
//       // For unauthenticated users, use fingerprintId and anonymousId from headers
//       const fingerprintId = request.headers.get('X-Fingerprint-ID');
//       const anonymousId = request.headers.get('X-Anonymous-ID');

//       if (!fingerprintId && !anonymousId) {
//         return NextResponse.json({ error: 'No identification headers or session found. Token check cannot proceed.' }, { status: 500 });
//       }

//       // Prioritize lookup by fingerprintId for anonymous users
//       if (fingerprintId) {
//         userToken = await UserToken.findOne({ fingerprintId });
//         identifierId = fingerprintId;
//       }

//       // If not found by fingerprint, try by anonymousId
//       if (!userToken && anonymousId) {
//         userToken = await UserToken.findOne({ anonymousId });
//         identifierId = anonymousId;
//       }
//     }

//     // IMPORTANT: If userToken is still null here, it means no record exists in the DB
//     // for either the authenticated userId, fingerprintId or anonymousId.
//     // This API route should NOT create a new UserToken document.
//     // It should rely on the /api/identify-user endpoint (called by MainLayout)
//     // or the NextAuth.js `authorize` callback to have created/reconciled it.
//     if (!userToken) {
//         console.error(`[convert-docx-to-pdf] No user token found for identifier: ${identifierId}. User token record must be established by /api/identify-user or NextAuth.`);
//         return NextResponse.json({ error: 'User token data not found. Please refresh the page to establish your session, or try again.' }, { status: 403 });
//     }

//     // Ensure tokens are reset for the current UTC day if needed
//     const now = new Date();
//     const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

//     if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
//       userToken.tokensUsedToday = 0;
//       userToken.lastResetDate = todayMidnightUtc;
//       await userToken.save();
//     }

//     // Check for unlimited access expiry
//     if (userToken.unlimitedAccessUntil && new Date() > userToken.unlimitedAccessUntil) {
//       userToken.unlimitedAccessUntil = null; // Clear expired unlimited access
//       await userToken.save();
//     }

//     const tokensNeeded = 1; // DOCX to PDF conversion costs 1 token

//     // Determine if user has unlimited access
//     const hasUnlimitedAccess = userToken.isSubscriber || (userToken.unlimitedAccessUntil && new Date() <= userToken.unlimitedAccessUntil);

//     // --- Pre-flight Token Check ---
//     if (!hasUnlimitedAccess && (userToken.tokensUsedToday + tokensNeeded) > userToken.maxTokensPerDay) {
//       await ConversionRequest.create({
//         type: 'docx-to-pdf-conversion',
//         userId: identifierId || 'unknown',
//         fileDetails: {
//           fileName: 'N/A',
//           fileSizeKB: 0,
//           fileMimeType: 'N/A'
//         },
//         requestDetails: {
//           outputFormat: 'pdf',
//           isBatch: false,
//           numberOfFiles: 1
//         },
//         status: 'failed',
//         errorMessage: `Insufficient tokens. Needed ${tokensNeeded}, have ${userToken.maxTokensPerDay - userToken.tokensUsedToday}.`,
//         durationMs: Date.now() - startTime
//       });
//       return NextResponse.json({ error: `Daily token limit exceeded. You need ${tokensNeeded} token but only have ${userToken.maxTokensPerDay - userToken.tokensUsedToday} remaining. Please try again tomorrow or subscribe for unlimited access.` }, { status: 429 });
//     }
//     // --- End Pre-flight Token Check ---

//     const formData = await request.formData();
//     const file = formData.get('file');

//     if (!file) {
//       requestRecord = await ConversionRequest.create({
//         type: 'docx-to-pdf-conversion',
//         userId: identifierId || 'unknown',
//         fileDetails: { fileName: 'N/A', fileSizeKB: 0, fileMimeType: 'N/A' },
//         requestDetails: { outputFormat: 'pdf', isBatch: false, numberOfFiles: 1 },
//         status: 'failed',
//         errorMessage: 'No file provided for DOCX to PDF conversion.',
//         durationMs: Date.now() - startTime
//       });
//       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
//     }

//     requestRecord = await ConversionRequest.create({
//       type: 'docx-to-pdf-conversion',
//       userId: identifierId || 'unknown',
//       fileDetails: {
//         fileName: file.name,
//         fileSizeKB: file.size / 1024,
//         fileMimeType: file.type
//       },
//       requestDetails: { outputFormat: 'pdf', isBatch: false, numberOfFiles: 1 },
//       status: 'pending'
//     });

//     const flaskFormData = new FormData();
//     flaskFormData.append('file', file);

//     const flaskResponse = await fetch('https://sensimods.pythonanywhere.com/convert-docx-to-pdf', {
//       method: 'POST',
//       body: flaskFormData,
//     });

//     if (!flaskResponse.ok) {
//       const errorText = await flaskResponse.text();
//       let errorMessage = `Flask server failed to convert DOCX to PDF. Status: ${flaskResponse.status}`;
//       try {
//         const errorData = JSON.parse(errorText);
//         errorMessage = errorData.error || errorMessage;
//       } catch (e) {
//         errorMessage = `${errorMessage}. Details: ${errorText}`;
//       }

//       if (requestRecord) {
//         requestRecord.status = 'failed';
//         requestRecord.errorMessage = errorMessage;
//         requestRecord.durationMs = Date.now() - startTime;
//         await requestRecord.save();
//       }
//       return NextResponse.json({ error: errorMessage }, { status: flaskResponse.status });
//     }

//     const pdfBlob = await flaskResponse.blob();
//     const contentDisposition = flaskResponse.headers.get('Content-Disposition') || `attachment; filename="converted.pdf"`;

//     const headers = new Headers();
//     headers.set('Content-Type', 'application/pdf');
//     headers.set('Content-Disposition', contentDisposition);

//     // --- Token Consumption Logic: Consume 1 token for successful conversion ---
//     if (!hasUnlimitedAccess) { // Only consume if not unlimited access
//       userToken.tokensUsedToday += tokensNeeded; // Consume 1 token
//       await userToken.save();
//     }
//     // --- End Token Consumption Logic ---

//     if (requestRecord) {
//       requestRecord.status = 'success';
//       requestRecord.durationMs = Date.now() - startTime;
//       await requestRecord.save();
//     }

//     return new NextResponse(pdfBlob, {
//       status: 200,
//       headers: headers,
//     });

//   } catch (error) {
//     console.error('Next.js API route /api/convert-docx-to-pdf error:', error);
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);
//     let errorMessage = `Internal server error: ${error.message}`;

//     const currentIdentifierId = identifierId; // Use the defined variable

//     if (requestRecord) {
//       requestRecord.status = 'failed';
//       requestRecord.errorMessage = errorMessage;
//       requestRecord.durationMs = Date.now() - startTime;
//       await requestRecord.save();
//     } else {
//       await ConversionRequest.create({
//         type: 'docx-to-pdf-conversion',
//         userId: currentIdentifierId || 'unknown',
//         fileDetails: { fileName: 'Unknown', fileSizeKB: 0, fileMimeType: 'N/A' },
//         requestDetails: { outputFormat: 'pdf', isBatch: false, numberOfFiles: 0 },
//         status: 'failed',
//         errorMessage: `Internal server error (no record created): ${errorMessage}`,
//         durationMs: Date.now() - startTime
//       });
//     }
//     return NextResponse.json({ error: errorMessage }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import getUserTokenModel from '@/models/UserToken';
import getConversionRequestModel from '@/models/ConversionRequest';
import { getServerSession } from 'next-auth'; // Import getServerSession

export const runtime = 'nodejs'; // Must run in Node.js runtime for Mongoose

export async function POST(request) {
  await dbConnect();
  const UserToken = getUserTokenModel();
  const ConversionRequest = getConversionRequestModel();

  const startTime = Date.now();
  let requestRecord = null;
  let userToken = null;
  let identifierId = null; // Stores the actual ID used for lookup (userId, fingerprintId, or anonymousId)

  try {
    const session = await getServerSession(); // Get the server-side session

    if (session?.user?.id) {
      // If authenticated, prioritize lookup by userId
      userToken = await UserToken.findOne({ userId: session.user.id });
      identifierId = session.user.id;
    } else {
      // For unauthenticated users, use fingerprintId and anonymousId from headers
      const fingerprintId = request.headers.get('X-Fingerprint-ID');
      const anonymousId = request.headers.get('X-Anonymous-ID');

      if (!fingerprintId && !anonymousId) {
        return NextResponse.json({ error: 'No identification headers or session found. Token check cannot proceed.' }, { status: 500 });
      }

      // Prioritize lookup by fingerprintId for anonymous users
      if (fingerprintId) {
        userToken = await UserToken.findOne({ fingerprintId });
        identifierId = fingerprintId;
      }

      // If not found by fingerprint, try by anonymousId
      if (!userToken && anonymousId) {
        userToken = await UserToken.findOne({ anonymousId });
        identifierId = anonymousId;
      }
    }

    // IMPORTANT: If userToken is still null here, it means no record exists in the DB
    // for either the authenticated userId, fingerprintId or anonymousId.
    // This API route should NOT create a new UserToken document.
    // It should rely on the /api/identify-user endpoint (called by MainLayout)
    // or the NextAuth.js `authorize` callback to have created/reconciled it.
    if (!userToken) {
        console.error(`[convert-docx-to-pdf] No user token found for identifier: ${identifierId}. User token record must be established by /api/identify-user or NextAuth.`);
        return NextResponse.json({ error: 'User token data not found. Please refresh the page to establish your session, or try again.' }, { status: 403 });
    }

    // Ensure tokens are reset for the current UTC day if needed
    const now = new Date();
    const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
      userToken.tokensUsedToday = 0;
      userToken.lastResetDate = todayMidnightUtc;
      await userToken.save();
    }

    // Check for unlimited access expiry
    if (userToken.unlimitedAccessUntil && new Date() > userToken.unlimitedAccessUntil) {
      userToken.unlimitedAccessUntil = null; // Clear expired unlimited access
      await userToken.save();
    }

    const tokensNeeded = 1; // DOCX to PDF conversion costs 1 token

    // Determine if user has unlimited access
    const hasUnlimitedAccess = userToken.isSubscriber || (userToken.unlimitedAccessUntil && new Date() <= userToken.unlimitedAccessUntil);

    // --- Pre-flight Token Check ---
    if (!hasUnlimitedAccess && (userToken.tokensUsedToday + tokensNeeded) > userToken.maxTokensPerDay) {
      await ConversionRequest.create({
        type: 'docx-to-pdf-conversion',
        userId: identifierId || 'unknown',
        fileDetails: {
          fileName: 'N/A',
          fileSizeKB: 0,
          fileMimeType: 'N/A'
        },
        requestDetails: {
          outputFormat: 'pdf',
          isBatch: false,
          numberOfFiles: 1
        },
        status: 'failed',
        errorMessage: `Insufficient tokens. Needed ${tokensNeeded}, have ${userToken.maxTokensPerDay - userToken.tokensUsedToday}.`,
        durationMs: Date.now() - startTime
      });
      return NextResponse.json({ error: `Daily token limit exceeded. You need ${tokensNeeded} token but only have ${userToken.maxTokensPerDay - userToken.tokensUsedToday} remaining. Please try again tomorrow or subscribe for unlimited access.` }, { status: 429 });
    }
    // --- End Pre-flight Token Check ---

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      requestRecord = await ConversionRequest.create({
        type: 'docx-to-pdf-conversion',
        userId: identifierId || 'unknown',
        fileDetails: { fileName: 'N/A', fileSizeKB: 0, fileMimeType: 'N/A' },
        requestDetails: { outputFormat: 'pdf', isBatch: false, numberOfFiles: 1 },
        status: 'failed',
        errorMessage: 'No file provided for DOCX to PDF conversion.',
        durationMs: Date.now() - startTime
      });
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    requestRecord = await ConversionRequest.create({
      type: 'docx-to-pdf-conversion',
      userId: identifierId || 'unknown',
      fileDetails: {
        fileName: file.name,
        fileSizeKB: file.size / 1024,
        fileMimeType: file.type
      },
      requestDetails: { outputFormat: 'pdf', isBatch: false, numberOfFiles: 1 },
      status: 'pending'
    });

    const flaskFormData = new FormData();
    flaskFormData.append('file', file);

    const flaskResponse = await fetch('https://sensimods.pythonanywhere.com/convert-docx-to-pdf', {
      method: 'POST',
      body: flaskFormData,
    });

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      let errorMessage = `Flask server failed to convert DOCX to PDF. Status: ${flaskResponse.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `${errorMessage}. Details: ${errorText}`;
      }

      if (requestRecord) {
        requestRecord.status = 'failed';
        requestRecord.errorMessage = errorMessage;
        requestRecord.durationMs = Date.now() - startTime;
        await requestRecord.save();
      }
      return NextResponse.json({ error: errorMessage }, { status: flaskResponse.status });
    }

    const pdfBlob = await flaskResponse.blob();
    const contentDisposition = flaskResponse.headers.get('Content-Disposition') || `attachment; filename="converted.pdf"`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', contentDisposition);

    // --- Token Consumption Logic: Consume 1 token for successful conversion ---
    if (!hasUnlimitedAccess) { // Only consume if not unlimited access
      userToken.tokensUsedToday += tokensNeeded; // Consume 1 token
      await userToken.save();
    }
    // --- End Token Consumption Logic ---

    if (requestRecord) {
      requestRecord.status = 'success';
      requestRecord.durationMs = Date.now() - startTime;
      await requestRecord.save();
    }

    return new NextResponse(pdfBlob, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error('Next.js API route /api/convert-docx-to-pdf error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    let errorMessage = `Internal server error: ${error.message}`;

    const currentIdentifierId = identifierId; // Use the defined variable

    if (requestRecord) {
      requestRecord.status = 'failed';
      requestRecord.errorMessage = errorMessage;
      requestRecord.durationMs = Date.now() - startTime;
      await requestRecord.save();
    } else {
      await ConversionRequest.create({
        type: 'docx-to-pdf-conversion',
        userId: currentIdentifierId || 'unknown',
        fileDetails: { fileName: 'Unknown', fileSizeKB: 0, fileMimeType: 'N/A' },
        requestDetails: { outputFormat: 'pdf', isBatch: false, numberOfFiles: 0 },
        status: 'failed',
        errorMessage: `Internal server error (no record created): ${errorMessage}`,
        durationMs: Date.now() - startTime
      });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}