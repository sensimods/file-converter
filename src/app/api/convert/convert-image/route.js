import sharp from 'sharp';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb'; // Correct relative path
import getUserTokenModel from '@/models/UserToken';
import getConversionRequestModel from '@/models/ConversionRequest';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route'; // Correct relative path

export const runtime = 'nodejs';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

export async function POST(req) {
  await dbConnect();
  const UserToken = getUserTokenModel();
  const ConversionRequest = getConversionRequestModel();

  const startTime = Date.now();
  let requestRecord = null;
  let userToken = null;
  let identifierId = null; // Stores the actual ID used for lookup (userId, fingerprintId, or anonymousId)

  try {
    const session = await getServerSession(authOptions); // Pass authOptions to getServerSession

    // --- START: CRITICAL User Identification Logic ---
    if (session?.user?.id) {
      // PRIORITY 1: Authenticated user
      userToken = await UserToken.findOne({ userId: session.user.id });
      identifierId = session.user.id;
      console.log(`[Convert Image API] Authenticated user detected. Using userId: ${identifierId}`);
    } else {
      // PRIORITY 2: Anonymous user (only if not authenticated)
      const fingerprintId = req.headers.get('X-Fingerprint-ID');
      const anonymousId = req.headers.get('X-Anonymous-ID');

      if (fingerprintId) {
        userToken = await UserToken.findOne({ fingerprintId });
        identifierId = fingerprintId;
        console.log(`[Convert Image API] Anonymous user detected. Using fingerprintId: ${identifierId}`);
      } else if (anonymousId) { // Fallback to anonymousId if fingerprintId isn't present
        userToken = await UserToken.findOne({ anonymousId });
        identifierId = anonymousId;
        console.log(`[Convert Image API] Anonymous user detected. Using anonymousId: ${identifierId}`);
      } else {
        // If neither authenticated nor anonymous ID is found, return error
        console.error('[Convert Image API] No user identification found in session or headers.');
        return NextResponse.json({ error: 'User identification missing. Cannot proceed with conversion.' }, { status: 400 });
      }
    }
    // --- END: CRITICAL User Identification Logic ---

    // IMPORTANT: If userToken is still null here, it means no record exists in the DB
    // for either the authenticated userId, fingerprintId or anonymousId.
    // This API route should NOT create a new UserToken document.
    // It should rely on the /api/identify-user endpoint (called by MainLayout)
    // or the NextAuth.js `authorize` callback to have created/reconciled it.
    if (!userToken) {
        console.error(`[convert-image] No user token found for identifier: ${identifierId}. User token record must be established by /api/identify-user or NextAuth.`);
        return NextResponse.json({ error: 'User token data not found. Please refresh the page to establish your session, or try again.' }, { status: 403 });
    }

    // Ensure tokens are reset for the current UTC day if needed
    const now = new Date();
    const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
      userToken.tokensUsedToday = 0;
      userToken.lastResetDate = todayMidnightUtc;
      await userToken.save();
      console.log(`[Convert Image API] UserToken for ${identifierId} reset for new day.`);
    }

    // Check for unlimited access expiry
    if (userToken.unlimitedAccessUntil && new Date() > userToken.unlimitedAccessUntil) {
      userToken.unlimitedAccessUntil = null; // Clear expired unlimited access
      userToken.maxTokensPerDay = 20; // Revert to default free tier
      userToken.isSubscriber = false; // Ensure isSubscriber is false if one-time access expired
      await userToken.save();
      console.log(`[Convert Image API] Unlimited access for ${identifierId} expired. Reverted to free tier.`);
    }

    const formData = await req.formData();
    const files = formData.getAll('images');
    const outputFormat = formData.get('format');
    const maxFileSize = formData.get('maxFileSize');

    const tokensNeeded = files.length;

    // Determine if user has unlimited access (re-evaluate after potential expiry clear)
    const hasUnlimitedAccess = userToken.isSubscriber || (userToken.unlimitedAccessUntil && new Date() <= userToken.unlimitedAccessUntil);

    // --- Pre-flight Token Check ---
    if (!hasUnlimitedAccess && (userToken.tokensUsedToday + tokensNeeded) > userToken.maxTokensPerDay) {
      console.warn(`[Convert Image API] Token limit reached for user ID: ${identifierId}. Needed ${tokensNeeded}, have ${userToken.maxTokensPerDay - userToken.tokensUsedToday}.`);
      await ConversionRequest.create({
        type: 'image-conversion',
        userId: identifierId || 'unknown',
        fileDetails: {
          fileName: 'N/A',
          fileSizeKB: 0,
          fileMimeType: 'N/A'
        },
        requestDetails: {
          outputFormat: outputFormat || 'N/A',
          isBatch: true,
          numberOfFiles: files.length
        },
        status: 'failed',
        errorMessage: `Insufficient tokens for batch conversion. Needed ${tokensNeeded}, have ${userToken.maxTokensPerDay - userToken.tokensUsedToday}.`,
        durationMs: Date.now() - startTime
      });
      return NextResponse.json({ error: `Daily token limit exceeded for this batch. You need ${tokensNeeded} tokens but only have ${userToken.maxTokensPerDay - userToken.tokensUsedToday} remaining. Please try again tomorrow or subscribe for unlimited access.` }, { status: 429 });
    }
    // --- End Pre-flight Token Check ---

    let fileDetailsArray = [];

    if (!files || files.length === 0) {
      requestRecord = await ConversionRequest.create({
        type: 'image-conversion',
        userId: identifierId || 'unknown',
        fileDetails: {
          fileName: 'N/A',
          fileSizeKB: 0,
          fileMimeType: 'N/A'
        },
        requestDetails: {
          outputFormat: outputFormat || 'N/A',
          isBatch: true,
          numberOfFiles: 0
        },
        status: 'failed',
        errorMessage: 'No image files provided for conversion.',
        durationMs: Date.now() - startTime
      });
      return NextResponse.json({ error: 'No image files provided.' }, { status: 400 });
    }

    const maxFileSizeBytes = maxFileSize ? parseInt(maxFileSize, 10) * 1024 * 1024 : null;
    for (const file of files) {
      if (maxFileSizeBytes && file.size > maxFileSizeBytes) {
        requestRecord = await ConversionRequest.create({
          type: 'image-conversion',
          userId: identifierId || 'unknown',
          fileDetails: {
            fileName: file.name,
            fileSizeKB: file.size / 1024,
            fileMimeType: file.type
          },
          requestDetails: {
            outputFormat: outputFormat,
            isBatch: true,
            numberOfFiles: files.length
          },
          status: 'failed',
          errorMessage: `File "${file.name}" exceeds limit of ${maxFileSizeBytes / (1024 * 1024)}MB.`,
          durationMs: Date.now() - startTime
        });
        return NextResponse.json({ error: `One or more files exceeded the size limit.` }, { status: 413 });
      }
      fileDetailsArray.push({
        fileName: file.name,
        fileSizeKB: file.size / 1024,
        fileMimeType: file.type
      });
    }

    if (!outputFormat) {
      requestRecord = await ConversionRequest.create({
        type: 'image-conversion',
        userId: identifierId || 'unknown',
        fileDetails: {
          fileName: fileDetailsArray.map(f => f.fileName).join(', '),
          fileSizeKB: fileDetailsArray.reduce((sum, f) => sum + f.fileSizeKB, 0),
          fileMimeType: fileDetailsArray.length > 1 ? 'Multiple/Mixed' : fileDetailsArray[0].fileMimeType
        },
        requestDetails: {
          outputFormat: 'N/A',
          isBatch: true,
          numberOfFiles: files.length
        },
        status: 'failed',
        errorMessage: 'Output format not specified.',
        durationMs: Date.now() - startTime
      });
      return NextResponse.json({ error: 'Output format not specified.' }, { status: 400 });
    }

    requestRecord = await ConversionRequest.create({
      type: 'image-conversion',
      userId: identifierId || 'unknown',
      fileDetails: {
        fileName: fileDetailsArray.map(fd => fd.fileName).join(', '),
        fileSizeKB: fileDetailsArray.reduce((sum, fd) => sum + fd.fileSizeKB, 0),
        fileMimeType: fileDetailsArray.length > 1 ? 'Multiple/Mixed' : fileDetailsArray[0].fileMimeType
      },
      requestDetails: {
        outputFormat: outputFormat,
        isBatch: true,
        numberOfFiles: files.length
      },
      status: 'pending'
    });

    const convertedResults = [];
    const supportedFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'raw', 'gif'];

    if (!supportedFormats.includes(outputFormat)) {
      if (requestRecord) {
        requestRecord.status = 'failed';
        requestRecord.errorMessage = `Unsupported output format: ${outputFormat}`;
        requestRecord.durationMs = Date.now() - startTime;
        await requestRecord.save();
      }
      return NextResponse.json({ error: `Unsupported output format: ${outputFormat}` }, { status: 400 });
    }

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        let convertedBuffer;
        let contentType;

        let sharpInstance = sharp(imageBuffer);

        switch (outputFormat) {
          case 'jpeg':
          case 'jpg':
            convertedBuffer = await sharpInstance.jpeg({ quality: 80 }).toBuffer();
            contentType = 'image/jpeg';
            break;
          case 'png':
            convertedBuffer = await sharpInstance.png({ compressionLevel: 9 }).toBuffer();
            contentType = 'image/png';
            break;
          case 'webp':
            convertedBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer();
            contentType = 'image/webp';
            break;
          case 'avif':
            convertedBuffer = await sharpInstance.avif({ quality: 70 }).toBuffer();
            contentType = 'image/avif';
            break;
          case 'tiff':
            convertedBuffer = await sharpInstance.tiff().toBuffer();
            contentType = 'image/tiff';
            break;
          case 'gif':
            convertedBuffer = await sharpInstance.gif().toBuffer();
            contentType = 'image/gif';
            break;
          case 'raw':
            convertedBuffer = await sharpInstance.raw().toBuffer();
            contentType = 'application/octet-stream';
            break;
          default:
            throw new Error('Unsupported output format for conversion.');
        }

        convertedResults.push({
          fileName: file.name.split('.')[0],
          outputFormat: outputFormat,
          data: convertedBuffer.toString('base64'),
          mimeType: contentType,
          success: true
        });

      } catch (conversionError) {
        console.error(`Sharp conversion error for ${file.name}:`, conversionError);
        convertedResults.push({
          fileName: file.name.split('.')[0],
          outputFormat: outputFormat,
          data: null,
          mimeType: null,
          success: false,
          error: `Conversion failed: ${conversionError.message}`
        });
      }
    }

    const successfulConversionsCount = convertedResults.filter(res => res.success).length;
    const allSuccessful = successfulConversionsCount === files.length;

    if (requestRecord) {
      requestRecord.status = allSuccessful ? 'success' : 'failed';
      requestRecord.errorMessage = allSuccessful ? undefined : 'Some conversions failed.';
      requestRecord.durationMs = Date.now() - startTime;
      await requestRecord.save();
    }

    // --- Token Consumption Logic: Consume tokens based on the number of successfully converted images ---
    if (!hasUnlimitedAccess && successfulConversionsCount > 0) {
      userToken.tokensUsedToday += successfulConversionsCount;
      await userToken.save();
      console.log(`[Convert Image API] Tokens consumed for user ID: ${identifierId}. New tokensUsedToday: ${userToken.tokensUsedToday}`);
    } else if (hasUnlimitedAccess) {
      console.log(`[Convert Image API] User ID: ${identifierId} has unlimited access. Tokens not consumed.`);
    } else if (successfulConversionsCount === 0) {
      console.log(`[Convert Image API] No successful conversions for user ID: ${identifierId}. Tokens not consumed.`);
    }
    // --- End Token Consumption Logic ---

    return NextResponse.json({
      convertedImages: convertedResults,
      tokensUsed: userToken.tokensUsedToday,
      maxTokens: hasUnlimitedAccess ? Infinity : userToken.maxTokensPerDay,
      isSubscriber: userToken.isSubscriber,
      unlimitedAccessUntil: userToken.unlimitedAccessUntil,
    }, { status: 200 });

  } catch (error) {
    console.error('API route error in /api/convert/convert-image:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    let errorMessage = `Server error: ${error.message}`;

    const currentIdentifierId = identifierId;

    if (error.message.includes('Body exceeded 100mb limit') || error.message.includes('Body exceeded')) {
      errorMessage = `Request body exceeded maximum size limit. Please try a smaller file or fewer files.`;
    }

    if (requestRecord) {
      requestRecord.status = 'failed';
      requestRecord.errorMessage = errorMessage;
      requestRecord.durationMs = Date.now() - startTime;
      await requestRecord.save();
    } else {
      await ConversionRequest.create({
        type: 'image-conversion',
        userId: currentIdentifierId || 'unknown',
        fileDetails: {
          fileName: 'Unknown',
          fileSizeKB: 0,
          fileMimeType: 'N/A'
        },
        requestDetails: {
          outputFormat: 'Unknown',
          isBatch: true,
          numberOfFiles: 0
        },
        status: 'failed',
        errorMessage: `Internal server error (no record created): ${errorMessage}`,
        durationMs: Date.now() - startTime
      });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
