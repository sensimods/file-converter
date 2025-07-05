// src/app/api/debug-session/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // Import getServerSession
import { authOptions } from '../auth/[...nextauth]/route'; // Import authOptions from your NextAuth config

export const runtime = 'nodejs';

export async function GET(request) {
  console.log('--- DEBUG SESSION API HIT ---');
  console.log('Incoming Request URL:', request.url);
  console.log('Incoming Request Headers:');
  request.headers.forEach((value, key) => {
    console.log(`  ${key}: ${value}`);
  });

  try {
    // Pass authOptions explicitly to getServerSession
    // This is sometimes necessary in certain Next.js setups or for clarity
    const session = await getServerSession(authOptions);
    console.log('[DEBUG SESSION API] getServerSession result:', session);

    if (session?.user?.id) {
      console.log('[DEBUG SESSION API] User ID found in session:', session.user.id);
      return NextResponse.json({
        message: 'Session found and user ID is present.',
        userId: session.user.id,
        session: session,
      }, { status: 200 });
    } else {
      console.warn('[DEBUG SESSION API] Session found, but user ID is missing or session is null.');
      return NextResponse.json({
        message: 'Session found, but user ID is missing or session is null.',
        session: session,
      }, { status: 401 });
    }
  } catch (error) {
    console.error('[DEBUG SESSION API] Error fetching session:', error);
    return NextResponse.json({ error: 'Internal server error during session debug.' }, { status: 500 });
  } finally {
    console.log('--- DEBUG SESSION API END ---');
  }
}
