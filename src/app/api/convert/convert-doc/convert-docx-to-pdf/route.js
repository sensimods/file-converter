

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