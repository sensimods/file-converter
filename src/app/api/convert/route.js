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

// src/app/api/convert/route.js
import sharp from 'sharp';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');
    const outputFormat = formData.get('format');
    // Get max file size from frontend (for server-side validation)
    const maxFileSize = formData.get('maxFileSize');

    // --- Server-side validation ---
    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    if (!outputFormat) {
      return NextResponse.json({ error: 'Output format not specified.' }, { status: 400 });
    }

    // Convert maxFileSize to number
    const maxFileSizeBytes = maxFileSize ? parseInt(maxFileSize, 10) : null;

    // Validate file size on the server
    if (maxFileSizeBytes && file.size > maxFileSizeBytes) {
      return NextResponse.json({ error: `File size exceeds limit of ${maxFileSizeBytes / (1024 * 1024)}MB.` }, { status: 413 }); // 413 Payload Too Large
    }
    // --- End server-side validation ---

    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    let convertedBuffer;
    let contentType;

    const supportedFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'raw'];

    if (!supportedFormats.includes(outputFormat)) {
      return NextResponse.json({ error: `Unsupported output format: ${outputFormat}` }, { status: 400 });
    }

    try {
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
          return NextResponse.json({ error: 'Unsupported output format for conversion.' }, { status: 400 });
      }
    } catch (conversionError) {
      console.error('Sharp conversion error:', conversionError);
      return NextResponse.json({ error: `Image conversion failed: ${conversionError.message}` }, { status: 500 });
    }

    return new NextResponse(convertedBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="converted-image.${outputFormat}"`,
      },
    });

  } catch (error) {
    console.error('API route error:', error);
    // Handle potential body parser errors (e.g., if total request size is too large)
    if (error.message.includes('Body exceeded 10mb limit')) { // This specific error message might vary based on Next.js version/env
        return NextResponse.json({ error: `Request body exceeded maximum size limit.` }, { status: 413 });
    }
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}