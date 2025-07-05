
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