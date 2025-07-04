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


// WORKING FINE 04-07-25
// document-pro/src/middleware.js
// import { NextResponse } from 'next/server';
// import { v4 as uuidv4 } from 'uuid';

// // Middleware will run for these paths
// export const config = {
//   matcher: [
//     '/api/convert/convert-image',
//     '/api/convert/convert-doc/convert-docx-to-pdf',
//     '/api/convert/convert-doc/extract-images-from-docx',
//     '/api/user-tokens',
//     // Add other API routes that consume tokens here
//   ],
// };

// export async function middleware(request) {
//   let response = NextResponse.next();
//   let userId;

//   // 1. Try to get Fingerprint ID from cookie (set by client-side JS)
//   let fingerprintId = request.cookies.get('_fp_id')?.value;

//   // 2. Try to get Anonymous ID from cookie (our existing fallback)
//   let anonymousId = request.cookies.get('_anon_id')?.value;

//   if (fingerprintId) {
//     // If fingerprint exists, use it as the primary userId
//     userId = fingerprintId;
//   } else if (anonymousId) {
//     // If no fingerprint but anonymous ID exists, use it
//     userId = anonymousId;
//   } else {
//     // If neither exists, generate a new anonymous ID and set it
//     // This serves as a temporary fallback until the fingerprint is generated and set.
//     anonymousId = uuidv4();
//     response.cookies.set('_anon_id', anonymousId, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 60 * 60 * 24 * 365,
//       path: '/',
//     });
//     userId = anonymousId;
//   }

//   // Pass the determined userId (fingerprint or anonymous) to the API route via a custom header
//   response.headers.set('X-User-ID', userId);

//   return response;
// }

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Middleware will run for these paths
export const config = {
  matcher: [
    '/api/:path*', // Match all API routes that need user identification
  ],
};

export async function middleware(request) {
  let response = NextResponse.next();

  // Get Fingerprint ID from cookie (set by client-side JS in MainLayout)
  const fingerprintId = request.cookies.get('_fp_id')?.value;

  // Get Anonymous ID from cookie
  let anonymousId = request.cookies.get('_anon_id')?.value;

  // If no anonymous ID is found, generate one and set it.
  // This ensures there's always a session ID, even before fingerprint is generated.
  if (!anonymousId) {
    anonymousId = uuidv4();
    response.cookies.set('_anon_id', anonymousId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year expiration
      path: '/',
    });
  }

  // Pass both IDs as distinct headers to the API routes
  if (fingerprintId) {
    response.headers.set('X-Fingerprint-ID', fingerprintId);
  }
  response.headers.set('X-Anonymous-ID', anonymousId); // Always pass anonymous ID

  return response;
}