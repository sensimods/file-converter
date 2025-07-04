// // src/app/api/convert/route.js
// import sharp from 'sharp';
// import { NextResponse } from 'next/server';

// // Set a higher body parser limit for file uploads if needed
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '10mb', // Adjust as needed for larger files
//     },
//   },
// };

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get('image'); // 'image' is the name of the input field
//     const outputFormat = formData.get('format'); // 'format' is the name of the format dropdown

//     if (!file) {
//       return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
//     }
//     if (!outputFormat || !['jpeg', 'png', 'webp'].includes(outputFormat)) {
//       return NextResponse.json({ error: 'Invalid or missing output format. Supported: jpeg, png, webp.' }, { status: 400 });
//     }

//     // Convert Blob to Buffer
//     const arrayBuffer = await file.arrayBuffer();
//     const imageBuffer = Buffer.from(arrayBuffer);

//     let convertedBuffer;
//     let contentType;

//     try {
//       const image = sharp(imageBuffer);
//       const metadata = await image.metadata();

//       // Basic validation for image type (optional, sharp handles many)
//       if (!metadata.format) {
//         return NextResponse.json({ error: 'Could not determine image format.' }, { status: 400 });
//       }

//       switch (outputFormat) {
//         case 'jpeg':
//           convertedBuffer = await image.jpeg({ quality: 80 }).toBuffer();
//           contentType = 'image/jpeg';
//           break;
//         case 'png':
//           convertedBuffer = await image.png().toBuffer();
//           contentType = 'image/png';
//           break;
//         case 'webp':
//           convertedBuffer = await image.webp({ quality: 80 }).toBuffer();
//           contentType = 'image/webp';
//           break;
//         // Add more cases for other formats if sharp supports them
//         // For HEIC, you would typically convert to PNG/JPEG/WebP:
//         // case 'heic-to-jpeg':
//         //   convertedBuffer = await image.jpeg({ quality: 80 }).toBuffer();
//         //   contentType = 'image/jpeg';
//         //   break;
//         default:
//           return NextResponse.json({ error: 'Unsupported output format.' }, { status: 400 });
//       }
//     } catch (conversionError) {
//       console.error('Sharp conversion error:', conversionError);
//       return NextResponse.json({ error: `Image conversion failed: ${conversionError.message}` }, { status: 500 });
//     }

//     // Send the converted image back as a Blob
//     return new NextResponse(convertedBuffer, {
//       status: 200,
//       headers: {
//         'Content-Type': contentType,
//         'Content-Disposition': `attachment; filename="converted-image.${outputFormat}"`,
//       },
//     });

//   } catch (error) {
//     console.error('API route error:', error);
//     return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
//   }
// }


// src/app/api/convert/route.js
// import sharp from 'sharp';
// import { NextResponse } from 'next/server'; // Import NextResponse from next/server

// // No need for formidable, fs, or path imports for App Router file uploads.
// // No need for `export const config = { api: { bodyParser: false } };` in App Router.
// // The default body parser handles formData correctly.

// export async function POST(req) {
//   try {
//     // App Router handles multipart/form-data directly with req.formData()
//     const formData = await req.formData();
//     const file = formData.get('image'); // 'image' is the name of the input field
//     const outputFormat = formData.get('format'); // 'format' is the name of the format dropdown

//     if (!file) {
//       return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
//     }
//     if (!outputFormat) {
//       return NextResponse.json({ error: 'Output format not specified.' }, { status: 400 });
//     }

//     // Convert Blob (from file) to ArrayBuffer, then to Node.js Buffer for sharp
//     const arrayBuffer = await file.arrayBuffer();
//     const imageBuffer = Buffer.from(arrayBuffer);

//     let convertedBuffer;
//     let contentType;

//     // Define supported output formats from sharp
//     // const supportedFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif', 'heif', 'jp2', 'raw', 'bmp', 'ico'];

//     const supportedFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'raw'];

//     if (!supportedFormats.includes(outputFormat)) {
//       return NextResponse.json({ error: `Unsupported output format: ${outputFormat}` }, { status: 400 });
//     }

//     try {
//       let sharpInstance = sharp(imageBuffer); // sharp can directly take a Buffer

//       // Apply the conversion based on outputFormat
//       switch (outputFormat) {
//         case 'jpeg':
//           convertedBuffer = await sharpInstance.jpeg({ quality: 80 }).toBuffer();
//           contentType = 'image/jpeg';
//           break;
//         case 'png':
//           convertedBuffer = await sharpInstance.png({ compressionLevel: 9 }).toBuffer();
//           contentType = 'image/png';
//           break;
//         case 'webp':
//           convertedBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer();
//           contentType = 'image/webp';
//           break;
//         case 'avif':
//           convertedBuffer = await sharpInstance.avif({ quality: 70 }).toBuffer(); // AVIF might be slower and require libheif
//           contentType = 'image/avif';
//           break;
//         case 'tiff':
//           convertedBuffer = await sharpInstance.tiff().toBuffer();
//           contentType = 'image/tiff';
//           break;
//         // case 'gif': // FIX: Added missing GIF case
//         //   convertedBuffer = await sharpInstance.gif().toBuffer(); // Converts to GIF, might only take first frame for animated GIFs
//         //   contentType = 'image/gif';
//         //   break;
//         // case 'heif':
//         //   convertedBuffer = await sharpInstance.heif().toBuffer(); // Requires libheif
//         //   contentType = 'image/heif';
//         //   break;
//         // case 'jp2':
//         //   convertedBuffer = await sharpInstance.jp2().toBuffer();
//         //   contentType = 'image/jp2';
//         //   break;
//         case 'raw':
//           convertedBuffer = await sharpInstance.raw().toBuffer();
//           contentType = 'application/octet-stream'; // Or a more specific raw image MIME type if known
//           break;
//         // case 'bmp':
//         //   convertedBuffer = await sharpInstance.bmp().toBuffer();
//         //   contentType = 'image/bmp';
//         //   break;
//         // case 'ico':
//         //   convertedBuffer = await sharpInstance.ico().toBuffer(); // Often used for favicons, might have size constraints
//         //   contentType = 'image/x-icon'; // Standard MIME type for .ico
//         //   break;
//         default:
//           // This should ideally be caught by the `!supportedFormats.includes` check above
//           return NextResponse.json({ error: 'Unsupported output format for conversion.' }, { status: 400 });
//       }
//     } catch (conversionError) {
//       console.error('Sharp conversion error:', conversionError);
//       return NextResponse.json({ error: `Image conversion failed: ${conversionError.message}` }, { status: 500 });
//     }

//     // Send the converted image back as a Blob using NextResponse
//     return new NextResponse(convertedBuffer, {
//       status: 200,
//       headers: {
//         'Content-Type': contentType,
//         'Content-Disposition': `attachment; filename="converted-image.${outputFormat}"`,
//       },
//     });

//   } catch (error) {
//     console.error('API route error:', error);
//     return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
//   }
// }






//WORKING WITH DATABASE
// import sharp from 'sharp';
// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/mongodb';
// import ConversionRequest from '@/models/ConversionRequest';

// // Set the body size limit for this API route
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '100mb', // Adjust this limit as needed, e.g., '50mb', '100mb'
//     },
//   },
// };

// export async function POST(req) {
//   await dbConnect();

//   const startTime = Date.now();
//   let requestRecord = null;
//   let fileDetailsArray = []; // To store details of all files in the batch

//   try {
//     const formData = await req.formData();
//     // Use getAll('images') to retrieve all files sent under the 'images' key
//     const files = formData.getAll('images');
//     const outputFormat = formData.get('format');
//     const maxFileSize = formData.get('maxFileSize');

//     // --- Server-side validation ---
//     if (!files || files.length === 0) {
//       requestRecord = await ConversionRequest.create({
//         type: 'image-conversion',
//         fileDetails: {
//           fileName: 'N/A',
//           fileSizeKB: 0,
//           fileMimeType: 'N/A'
//         },
//         requestDetails: {
//           outputFormat: outputFormat || 'N/A',
//           isBatch: true, // This is a batch request
//           numberOfFiles: 0
//         },
//         status: 'failed',
//         errorMessage: 'No image files provided for conversion.',
//         durationMs: Date.now() - startTime
//       });
//       return NextResponse.json({ error: 'No image files provided.' }, { status: 400 });
//     }

//     // Populate fileDetailsArray and perform individual file size validation
//     const maxFileSizeBytes = maxFileSize ? parseInt(maxFileSize, 10) : null;
//     for (const file of files) {
//       if (maxFileSizeBytes && file.size > maxFileSizeBytes) {
//         // If any single file exceeds the limit, fail the entire batch and log it
//         requestRecord = await ConversionRequest.create({
//           type: 'image-conversion',
//           fileDetails: {
//             fileName: file.name,
//             fileSizeKB: file.size / 1024,
//             fileMimeType: file.type
//           },
//           requestDetails: {
//             outputFormat: outputFormat,
//             isBatch: true,
//             numberOfFiles: files.length
//           },
//           status: 'failed',
//           errorMessage: `File "${file.name}" exceeds limit of ${maxFileSizeBytes / (1024 * 1024)}MB.`,
//           durationMs: Date.now() - startTime
//         });
//         return NextResponse.json({ error: `One or more files exceeded the size limit.` }, { status: 413 });
//       }
//       fileDetailsArray.push({
//         fileName: file.name,
//         fileSizeKB: file.size / 1024,
//         fileMimeType: file.type
//       });
//     }

//     if (!outputFormat) {
//       requestRecord = await ConversionRequest.create({
//         type: 'image-conversion',
//         fileDetails: {
//           fileName: fileDetailsArray.map(f => f.fileName).join(', '),
//           fileSizeKB: fileDetailsArray.reduce((sum, f) => sum + f.fileSizeKB, 0),
//           fileMimeType: fileDetailsArray.length > 1 ? 'Multiple/Mixed' : fileDetailsArray[0].fileMimeType
//         },
//         requestDetails: {
//           outputFormat: 'N/A',
//           isBatch: true,
//           numberOfFiles: files.length
//         },
//         status: 'failed',
//         errorMessage: 'Output format not specified.',
//         durationMs: Date.now() - startTime
//       });
//       return NextResponse.json({ error: 'Output format not specified.' }, { status: 400 });
//     }

//     // Create a single pending record for the batch
//     requestRecord = await ConversionRequest.create({
//       type: 'image-conversion',
//       fileDetails: {
//         fileName: fileDetailsArray.map(fd => fd.fileName).join(', '), // Concatenate names for overview
//         fileSizeKB: fileDetailsArray.reduce((sum, fd) => sum + fd.fileSizeKB, 0),
//         fileMimeType: fileDetailsArray.length > 1 ? 'Multiple/Mixed' : fileDetailsArray[0].fileMimeType
//       },
//       requestDetails: {
//         outputFormat: outputFormat,
//         isBatch: true,
//         numberOfFiles: files.length
//       },
//       status: 'pending'
//     });

//     const convertedResults = [];
//     const supportedFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'raw'];

//     if (!supportedFormats.includes(outputFormat)) {
//       if (requestRecord) {
//         requestRecord.status = 'failed';
//         requestRecord.errorMessage = `Unsupported output format: ${outputFormat}`;
//         requestRecord.durationMs = Date.now() - startTime;
//         await requestRecord.save();
//       }
//       return NextResponse.json({ error: `Unsupported output format: ${outputFormat}` }, { status: 400 });
//     }

//     for (const file of files) {
//       try {
//         const arrayBuffer = await file.arrayBuffer();
//         const imageBuffer = Buffer.from(arrayBuffer);

//         let convertedBuffer;
//         let contentType;

//         let sharpInstance = sharp(imageBuffer);

//         switch (outputFormat) {
//           case 'jpeg':
//             convertedBuffer = await sharpInstance.jpeg({ quality: 80 }).toBuffer();
//             contentType = 'image/jpeg';
//             break;
//           case 'png':
//             convertedBuffer = await sharpInstance.png({ compressionLevel: 9 }).toBuffer();
//             contentType = 'image/png';
//             break;
//           case 'webp':
//             convertedBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer();
//             contentType = 'image/webp';
//             break;
//           case 'avif':
//             convertedBuffer = await sharpInstance.avif({ quality: 70 }).toBuffer();
//             contentType = 'image/avif';
//             break;
//           case 'tiff':
//             convertedBuffer = await sharpInstance.tiff().toBuffer();
//             contentType = 'image/tiff';
//             break;
//           case 'raw':
//             convertedBuffer = await sharpInstance.raw().toBuffer();
//             contentType = 'application/octet-stream';
//             break;
//           default:
//             throw new Error('Unsupported output format for conversion.');
//         }

//         convertedResults.push({
//           fileName: file.name.split('.')[0], // Original file name without extension
//           outputFormat: outputFormat,
//           data: convertedBuffer.toString('base64'), // Send as base64 string
//           mimeType: contentType,
//           success: true
//         });

//       } catch (conversionError) {
//         console.error(`Sharp conversion error for ${file.name}:`, conversionError);
//         convertedResults.push({
//           fileName: file.name.split('.')[0],
//           outputFormat: outputFormat,
//           data: null,
//           mimeType: null,
//           success: false,
//           error: `Conversion failed: ${conversionError.message}`
//         });
//       }
//     }

//     // Determine overall batch status
//     const allSuccessful = convertedResults.every(res => res.success);
//     if (requestRecord) {
//       requestRecord.status = allSuccessful ? 'success' : 'failed';
//       requestRecord.errorMessage = allSuccessful ? undefined : 'Some conversions failed.';
//       requestRecord.durationMs = Date.now() - startTime;
//       await requestRecord.save();
//     }

//     return NextResponse.json({ convertedImages: convertedResults }, { status: 200 });

//   } catch (error) {
//     console.error('API route error:', error);
//     let errorMessage = `Server error: ${error.message}`;

//     if (error.message.includes('Body exceeded 1mb limit') || error.message.includes('Body exceeded')) {
//       errorMessage = `Request body exceeded maximum size limit. Please try a smaller file or fewer files.`;
//     }

//     // If an unexpected error occurs before a record is created or saved
//     if (requestRecord) {
//       requestRecord.status = 'failed';
//       requestRecord.errorMessage = errorMessage;
//       requestRecord.durationMs = Date.now() - startTime;
//       await requestRecord.save();
//     } else {
//       // If record couldn't even be created, create a new one for the failure
//       await ConversionRequest.create({
//         type: 'image-conversion',
//         fileDetails: {
//           fileName: 'Unknown',
//           fileSizeKB: 0,
//           fileMimeType: 'Unknown'
//         },
//         requestDetails: {
//           outputFormat: 'Unknown',
//           isBatch: true, // This is a batch request
//           numberOfFiles: 0 // No file processed if error before file details are known
//         },
//         status: 'failed',
//         errorMessage: `Internal server error (no record created): ${errorMessage}`,
//         durationMs: Date.now() - startTime
//       });
//     }
//     return NextResponse.json({ error: errorMessage }, { status: 500 });
//   }
// }


// document-pro/src/app/api/convert/convert-image/route.js
// import sharp from 'sharp';
// import { NextResponse } from 'next/server';
// import dbConnect from '../../../../lib/mongodb'; // Corrected path to lib/mongodb
// import getUserTokenModel from '../../../../models/UserToken'; // Import the function
// import ConversionRequest from '../../../../models/ConversionRequest'; // Corrected path to models/ConversionRequest

// // IMPORTANT: This API route MUST run in the Node.js runtime for Mongoose compatibility
// export const runtime = 'nodejs';

// // Set the body size limit for this API route
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '100mb', // Adjust this limit as needed, e.g., '50mb', '100mb'
//     },
//   },
// };

// export async function POST(req) {
//   await dbConnect();
//   // Get the UserToken model AFTER the connection is established
//   const UserToken = getUserTokenModel();

//   const startTime = Date.now();
//   let requestRecord = null;
//   let userToken = null; // To store the user's token document

//   try {
//     // Get userId from the header set by the middleware
//     const userId = req.headers.get('X-User-ID');

//     if (!userId) {
//       // This should ideally not happen if middleware is correctly configured,
//       // but good for robustness.
//       return NextResponse.json({ error: 'User ID not found. Token check cannot proceed.' }, { status: 500 });
//     }

//     // Fetch the user's token document
//     userToken = await UserToken.findOne({ userId });

//     if (!userToken) {
//       // If user doesn't exist (e.g., new anonymous user), create a new entry
//       userToken = await UserToken.create({
//         userId: userId,
//         lastResetDate: new Date(), // Set to now, which will be midnight UTC
//         tokensUsedToday: 0,
//         maxTokensPerDay: 20, // Freemium limit
//         isSubscriber: false,
//       });
//     }

//     // Handle Daily Token Reset (redundant with middleware, but good for robustness if middleware fails)
//     const now = new Date();
//     const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

//     if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
//       userToken.tokensUsedToday = 0;
//       userToken.lastResetDate = todayMidnightUtc;
//       await userToken.save();
//     }

//     // --- Token Consumption Logic ---
//     if (!userToken.isSubscriber && userToken.tokensUsedToday >= userToken.maxTokensPerDay) {
//       await ConversionRequest.create({
//         type: 'image-conversion',
//         userId: userId,
//         fileDetails: {
//           fileName: 'N/A', // File details not available if blocked before parsing
//           fileSizeKB: 0,
//           fileMimeType: 'N/A'
//         },
//         requestDetails: {
//           outputFormat: 'N/A',
//           isBatch: true,
//           numberOfFiles: 0
//         },
//         status: 'failed',
//         errorMessage: 'Token limit exceeded for today.',
//         durationMs: Date.now() - startTime
//       });
//       return NextResponse.json({ error: 'Daily token limit exceeded. Please try again tomorrow or subscribe for unlimited access.' }, { status: 429 });
//     }
//     // --- End Token Consumption Logic ---

//     const formData = await req.formData();
//     const files = formData.getAll('images');
//     const outputFormat = formData.get('format');
//     const maxFileSize = formData.get('maxFileSize');

//     let fileDetailsArray = [];

//     // --- Server-side validation ---
//     if (!files || files.length === 0) {
//       requestRecord = await ConversionRequest.create({
//         type: 'image-conversion',
//         userId: userId,
//         fileDetails: {
//           fileName: 'N/A',
//           fileSizeKB: 0,
//           fileMimeType: 'N/A'
//         },
//         requestDetails: {
//           outputFormat: outputFormat || 'N/A',
//           isBatch: true,
//           numberOfFiles: 0
//         },
//         status: 'failed',
//         errorMessage: 'No image files provided for conversion.',
//         durationMs: Date.now() - startTime
//       });
//       return NextResponse.json({ error: 'No image files provided.' }, { status: 400 });
//     }

//     const maxFileSizeBytes = maxFileSize ? parseInt(maxFileSize, 10) : null;
//     for (const file of files) {
//       if (maxFileSizeBytes && file.size > maxFileSizeBytes) {
//         requestRecord = await ConversionRequest.create({
//           type: 'image-conversion',
//           userId: userId,
//           fileDetails: {
//             fileName: file.name,
//             fileSizeKB: file.size / 1024,
//             fileMimeType: file.type
//           },
//           requestDetails: {
//             outputFormat: outputFormat,
//             isBatch: true,
//             numberOfFiles: files.length
//           },
//           status: 'failed',
//           errorMessage: `File "${file.name}" exceeds limit of ${maxFileSizeBytes / (1024 * 1024)}MB.`,
//           durationMs: Date.now() - startTime
//         });
//         return NextResponse.json({ error: `One or more files exceeded the size limit.` }, { status: 413 });
//       }
//       fileDetailsArray.push({
//         fileName: file.name,
//         fileSizeKB: file.size / 1024,
//         fileMimeType: file.type
//       });
//     }

//     if (!outputFormat) {
//       requestRecord = await ConversionRequest.create({
//         type: 'image-conversion',
//         userId: userId,
//         fileDetails: {
//           fileName: fileDetailsArray.map(f => f.fileName).join(', '),
//           fileSizeKB: fileDetailsArray.reduce((sum, f) => sum + f.fileSizeKB, 0),
//           fileMimeType: fileDetailsArray.length > 1 ? 'Multiple/Mixed' : fileDetailsArray[0].fileMimeType
//         },
//         requestDetails: {
//           outputFormat: 'N/A',
//           isBatch: true,
//           numberOfFiles: files.length
//         },
//         status: 'failed',
//         errorMessage: 'Output format not specified.',
//         durationMs: Date.now() - startTime
//       });
//       return NextResponse.json({ error: 'Output format not specified.' }, { status: 400 });
//     }

//     requestRecord = await ConversionRequest.create({
//       type: 'image-conversion',
//       userId: userId,
//       fileDetails: {
//         fileName: fileDetailsArray.map(fd => fd.fileName).join(', '),
//         fileSizeKB: fileDetailsArray.reduce((sum, fd) => sum + fd.fileSizeKB, 0),
//         fileMimeType: fileDetailsArray.length > 1 ? 'Multiple/Mixed' : fileDetailsArray[0].fileMimeType
//       },
//       requestDetails: {
//         outputFormat: outputFormat,
//         isBatch: true,
//         numberOfFiles: files.length
//       },
//       status: 'pending'
//     });

//     const convertedResults = [];
//     const supportedFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'raw'];

//     if (!supportedFormats.includes(outputFormat)) {
//       if (requestRecord) {
//         requestRecord.status = 'failed';
//         requestRecord.errorMessage = `Unsupported output format: ${outputFormat}`;
//         requestRecord.durationMs = Date.now() - startTime;
//         await requestRecord.save();
//       }
//       return NextResponse.json({ error: `Unsupported output format: ${outputFormat}` }, { status: 400 });
//     }

//     for (const file of files) {
//       try {
//         const arrayBuffer = await file.arrayBuffer();
//         const imageBuffer = Buffer.from(arrayBuffer);

//         let convertedBuffer;
//         let contentType;

//         let sharpInstance = sharp(imageBuffer);

//         switch (outputFormat) {
//           case 'jpeg':
//             convertedBuffer = await sharpInstance.jpeg({ quality: 80 }).toBuffer();
//             contentType = 'image/jpeg';
//             break;
//           case 'png':
//             convertedBuffer = await sharpInstance.png({ compressionLevel: 9 }).toBuffer();
//             contentType = 'image/png';
//             break;
//           case 'webp':
//             convertedBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer();
//             contentType = 'image/webp';
//             break;
//           case 'avif':
//             convertedBuffer = await sharpInstance.avif({ quality: 70 }).toBuffer();
//             contentType = 'image/avif';
//             break;
//           case 'tiff':
//             convertedBuffer = await sharpInstance.tiff().toBuffer();
//             contentType = 'image/tiff';
//             break;
//           case 'raw':
//             convertedBuffer = await sharpInstance.raw().toBuffer();
//             contentType = 'application/octet-stream';
//             break;
//           default:
//             throw new Error('Unsupported output format for conversion.');
//         }

//         convertedResults.push({
//           fileName: file.name.split('.')[0],
//           outputFormat: outputFormat,
//           data: convertedBuffer.toString('base64'),
//           mimeType: contentType,
//           success: true
//         });

//       } catch (conversionError) {
//         console.error(`Sharp conversion error for ${file.name}:`, conversionError);
//         convertedResults.push({
//           fileName: file.name.split('.')[0],
//           outputFormat: outputFormat,
//           data: null,
//           mimeType: null,
//           success: false,
//           error: `Conversion failed: ${conversionError.message}`
//         });
//       }
//     }

//     const allSuccessful = convertedResults.every(res => res.success);
//     if (requestRecord) {
//       requestRecord.status = allSuccessful ? 'success' : 'failed';
//       requestRecord.errorMessage = allSuccessful ? undefined : 'Some conversions failed.';
//       requestRecord.durationMs = Date.now() - startTime;
//       await requestRecord.save();
//     }

//     if (allSuccessful && !userToken.isSubscriber) {
//       userToken.tokensUsedToday += 1;
//       await userToken.save();
//     }

//     return NextResponse.json({ convertedImages: convertedResults }, { status: 200 });

//   } catch (error) {
//     console.error('API route error:', error);
//     let errorMessage = `Server error: ${error.message}`;

//     if (error.message.includes('Body exceeded 1mb limit') || error.message.includes('Body exceeded')) {
//       errorMessage = `Request body exceeded maximum size limit. Please try a smaller file or fewer files.`;
//     }

//     if (requestRecord) {
//       requestRecord.status = 'failed';
//       requestRecord.errorMessage = errorMessage;
//       requestRecord.durationMs = Date.now() - startTime;
//       await requestRecord.save();
//     } else {
//       await ConversionRequest.create({
//         type: 'image-conversion',
//         userId: req.headers.get('X-User-ID') || 'Unknown',
//         fileDetails: {
//           fileName: 'Unknown',
//           fileSizeKB: 0,
//           fileMimeType: 'Unknown'
//         },
//         requestDetails: {
//           outputFormat: 'Unknown',
//           isBatch: true,
//           numberOfFiles: 0
//         },
//         status: 'failed',
//         errorMessage: `Internal server error (no record created): ${errorMessage}`,
//         durationMs: Date.now() - startTime
//       });
//     }
//     return NextResponse.json({ error: errorMessage }, { status: 500 });
//   }
// }





// document-pro/src/app/api/convert/convert-image/route.js
import sharp from 'sharp';
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import getUserTokenModel from '../../../../models/UserToken';
import ConversionRequest from '../../../../models/ConversionRequest';

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

  const startTime = Date.now();
  let requestRecord = null;
  let userToken = null;

  try {
    const userId = req.headers.get('X-User-ID');

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found. Token check cannot proceed.' }, { status: 500 });
    }

    userToken = await UserToken.findOne({ userId });

    if (!userToken) {
      userToken = await UserToken.create({
        userId: userId,
        lastResetDate: new Date(),
        tokensUsedToday: 0,
        maxTokensPerDay: 20,
        isSubscriber: false,
      });
    }

    const now = new Date();
    const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
      userToken.tokensUsedToday = 0;
      userToken.lastResetDate = todayMidnightUtc;
      await userToken.save();
    }

    const formData = await req.formData();
    const files = formData.getAll('images');
    const outputFormat = formData.get('format');
    const maxFileSize = formData.get('maxFileSize');

    // Calculate tokens needed BEFORE processing to check against limit
    const tokensNeeded = files.length; // Each image costs one token

    // --- Pre-flight Token Check ---
    if (!userToken.isSubscriber && (userToken.tokensUsedToday + tokensNeeded) > userToken.maxTokensPerDay) {
      await ConversionRequest.create({
        type: 'image-conversion',
        userId: userId,
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
        userId: userId,
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

    const maxFileSizeBytes = maxFileSize ? parseInt(maxFileSize, 10) : null;
    for (const file of files) {
      if (maxFileSizeBytes && file.size > maxFileSizeBytes) {
        requestRecord = await ConversionRequest.create({
          type: 'image-conversion',
          userId: userId,
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
        userId: userId,
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
      userId: userId,
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
    const supportedFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'raw'];

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
    const allSuccessful = successfulConversionsCount === files.length; // Check if all files in the batch were successful

    if (requestRecord) {
      requestRecord.status = allSuccessful ? 'success' : 'failed';
      requestRecord.errorMessage = allSuccessful ? undefined : 'Some conversions failed.';
      requestRecord.durationMs = Date.now() - startTime;
      await requestRecord.save();
    }

    // --- Token Consumption Logic: Consume tokens based on the number of successfully converted images ---
    if (!userToken.isSubscriber) {
      userToken.tokensUsedToday += successfulConversionsCount; // Consume tokens for each successful conversion
      await userToken.save();
    }
    // --- End Token Consumption Logic ---

    // Return the updated token count in the response
    return NextResponse.json({
      convertedImages: convertedResults,
      tokensUsed: userToken.tokensUsedToday,
      maxTokens: userToken.maxTokensPerDay,
      isSubscriber: userToken.isSubscriber,
    }, { status: 200 });

  } catch (error) {
    console.error('API route error:', error);
    let errorMessage = `Server error: ${error.message}`;

    if (error.message.includes('Body exceeded 1mb limit') || error.message.includes('Body exceeded')) {
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
        userId: req.headers.get('X-User-ID') || 'Unknown',
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
