// // document-pro/src/middleware.js
// import { NextResponse } from 'next/server';
// import { v4 as uuidv4 } from 'uuid';

// // Middleware will run for these paths
// export const config = {
//   matcher: [
//     '/api/convert/convert-image',
//     '/api/convert/convert-doc/convert-docx-to-pdf',
//     '/api/convert/convert-doc/extract-images-from-docx',
//     '/api/user-tokens', // Ensure this matches your user token API route
//     // Add other API routes that consume tokens here
//   ],
// };

// export async function middleware(request) {
//   let response = NextResponse.next();
//   let anonymousId = request.cookies.get('_anon_id')?.value;

//   if (!anonymousId) {
//     // If no anonymous ID, generate a new one and set it as a cookie
//     anonymousId = uuidv4();
//     response.cookies.set('_anon_id', anonymousId, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production', // Use secure in production
//       sameSite: 'lax',
//       maxAge: 60 * 60 * 24 * 365, // 1 year expiration
//       path: '/',
//     });
//   }

//   // Pass user ID to the API route via a custom header
//   response.headers.set('X-User-ID', anonymousId);

//   return response;
// }


// document-pro/src/middleware.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Middleware will run for these paths
export const config = {
  matcher: [
    '/api/convert/convert-image',
    '/api/convert/convert-doc/convert-docx-to-pdf',
    '/api/convert/convert-doc/extract-images-from-docx',
    '/api/user-tokens',
    // Add other API routes that consume tokens here
  ],
};

export async function middleware(request) {
  let response = NextResponse.next();
  let userId;

  // 1. Try to get Fingerprint ID from cookie (set by client-side JS)
  let fingerprintId = request.cookies.get('_fp_id')?.value;

  // 2. Try to get Anonymous ID from cookie (our existing fallback)
  let anonymousId = request.cookies.get('_anon_id')?.value;

  if (fingerprintId) {
    // If fingerprint exists, use it as the primary userId
    userId = fingerprintId;
  } else if (anonymousId) {
    // If no fingerprint but anonymous ID exists, use it
    userId = anonymousId;
  } else {
    // If neither exists, generate a new anonymous ID and set it
    // This serves as a temporary fallback until the fingerprint is generated and set.
    anonymousId = uuidv4();
    response.cookies.set('_anon_id', anonymousId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
    userId = anonymousId;
  }

  // Pass the determined userId (fingerprint or anonymous) to the API route via a custom header
  response.headers.set('X-User-ID', userId);

  return response;
}
