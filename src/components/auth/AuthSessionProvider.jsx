// ============================================================================
// FILE: src/components/auth/AuthSessionProvider.jsx
// ACTION: NEW FILE - Create this file.
// NOTE: This is a client component that wraps NextAuth's SessionProvider.
// ============================================================================
'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * AuthSessionProvider Component
 *
 * This is a client-side wrapper component for NextAuth's SessionProvider.
 * It allows the SessionProvider to be used within a Server Component layout
 * by being marked as a client component itself.
 *
 * Props:
 * - children: React nodes to be rendered within the session context.
 */
export default function AuthSessionProvider({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}