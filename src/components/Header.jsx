
// "use client";
// import { useEffect, useState } from "react";
// import { usePathname } from 'next/navigation';
// import { RiCoinLine } from "react-icons/ri";
// import Link from 'next/link';
// import { useSession, signOut } from 'next-auth/react';

// const Header = () => {
//   const pathname = usePathname();
//   const { data: session, status } = useSession(); // Get session data and status

//   // State to hold the token info, initialized from session or defaults
//   // This state will be updated by the 'tokensUpdated' event
//   const [displayTokens, setDisplayTokens] = useState({
//     used: 0,
//     max: 20,
//     isSubscriber: false,
//   });

//   // Effect to update displayTokens when session changes
//   // This is the primary source of truth for Header
//   useEffect(() => {
//     if (status === 'authenticated' && session?.user) {
//       setDisplayTokens({
//         used: session.user.tokensUsed || 0,
//         max: session.user.maxTokens || 20,
//         isSubscriber: session.user.isSubscriber || false,
//       });
//       console.log("[Header] Updated tokens from session:", session.user.tokensUsed, session.user.maxTokens, session.user.isSubscriber);
//     } else if (status === 'unauthenticated') {
//       // Reset to default for unauthenticated users
//       setDisplayTokens({ used: 0, max: 20, isSubscriber: false });
//       console.log("[Header] User unauthenticated, resetting tokens.");
//     }
//     // No need to fetch /api/user-tokens here directly, useSession handles it
//   }, [session, status]); // Depend on session and status

//   // Effect to listen for custom 'tokensUpdated' event (for immediate updates from other components)
//   useEffect(() => {
//     const handleTokensUpdated = (event) => {
//       // Update state directly from the event detail
//       setDisplayTokens({
//         used: event.detail.tokensUsed,
//         max: event.detail.maxTokens,
//         isSubscriber: event.detail.isSubscriber,
//       });
//       console.log("[Header] Updated tokens from custom event:", event.detail);
//     };

//     if (typeof window !== 'undefined') {
//       window.addEventListener('tokensUpdated', handleTokensUpdated);
//     }

//     return () => {
//       if (typeof window !== 'undefined') {
//         window.removeEventListener('tokensUpdated', handleTokensUpdated);
//       }
//     };
//   }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount


//   // Handle logout
//   const handleSignOut = async () => {
//     await signOut({ callbackUrl: '/' }); // Redirect to homepage after logout
//     // Dispatch event to reset tokens display immediately on logout
//     if (typeof window !== 'undefined') {
//       window.dispatchEvent(new CustomEvent('tokensUpdated', {
//         detail: {
//           tokensUsed: 0,
//           maxTokens: 20,
//           isSubscriber: false,
//         }
//       }));
//     }
//   };

//   // Determine token display text
//   let tokenDisplayText;
//   if (status === 'loading') { // Use NextAuth.js session loading status
//     tokenDisplayText = <span className="animate-pulse">Loading...</span>;
//   } else if (displayTokens.isSubscriber || (displayTokens.max === Infinity && displayTokens.used === 0)) {
//     tokenDisplayText = <span className="text-green-400">Unlimited Tokens</span>;
//   } else {
//     tokenDisplayText = (
//       <span className="text-yellow-300 flex items-center gap-x-2">
//         <RiCoinLine size={20} /> {displayTokens.max - displayTokens.used}
//       </span>
//     );
//   }

//   return (
//     <div className="bg-gray-900 w-full px-4 py-3 flex justify-between items-center">
//       {/* Logo/Home Link */}
//       <Link href="/" className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition duration-200">
//         Morpho
//       </Link>

//       <div className="flex items-center gap-4">
//         {/* Token Display */}
//         <div className="px-3 py-1 rounded-full bg-gray-700 text-sm font-medium flex items-center">
//           {tokenDisplayText}
//         </div>

//         {/* Auth Links */}
//         {status === 'loading' ? (
//           <div className="text-gray-400">Loading...</div>
//         ) : session ? (
//           <>
//             <span className="text-gray-300 hidden sm:inline">Hi, {session.user.email}</span>
//             <button
//               onClick={handleSignOut}
//               className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-300 ease-in-out"
//             >
//               Logout
//             </button>
//           </>
//         ) : (
//           <>
//             <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-300 ease-in-out">
//               Login
//             </Link>
//             <Link href="/register" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-300 ease-in-out">
//               Register
//             </Link>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Header;


// 'use client'

// import { useEffect, useState } from 'react'
// import { usePathname } from 'next/navigation'
// import Link from 'next/link'
// import { useSession, signOut } from 'next-auth/react'
// import { RiCoinLine } from 'react-icons/ri'

// const Header = () => {
//   const pathname = usePathname()
//   const { data: session, status } = useSession()

//   const [tokenInfo, setTokenInfo] = useState({
//     used: 0,
//     max: 20,
//     unlimitedUntil: null
//   })

//   // ───────────────────────────────────────── update from session
//   useEffect(() => {
//     if (status === 'authenticated' && session?.user) {
//       setTokenInfo({
//         used: session.user.tokensUsed ?? 0,
//         max: session.user.maxTokens ?? 20,
//         unlimitedUntil: session.user.unlimitedAccessUntil ?? null
//       })
//     } else if (status === 'unauthenticated') {
//       setTokenInfo({ used: 0, max: 20, unlimitedUntil: null })
//     }
//   }, [session, status])

//   // ───────────────────────────────────────── listen for live events
//   useEffect(() => {
//     const handler = e =>
//       setTokenInfo({
//         used: e.detail.tokensUsed,
//         max: e.detail.maxTokens,
//         unlimitedUntil: e.detail.unlimitedAccessUntil ?? null
//       })

//     window.addEventListener('tokensUpdated', handler)
//     return () => window.removeEventListener('tokensUpdated', handler)
//   }, [])

//   // ───────────────────────────────────────── logout helper
//   const handleLogout = async () => {
//     await signOut({ callbackUrl: '/' })
//     window.dispatchEvent(
//       new CustomEvent('tokensUpdated', {
//         detail: { tokensUsed: 0, maxTokens: 20, unlimitedAccessUntil: null }
//       })
//     )
//   }

//   // ───────────────────────────────────────── label builder
//   let tokenLabel = 'Loading...'
//   if (status !== 'loading') {
//     const unlimited =
//       tokenInfo.max === Infinity ||
//       (tokenInfo.unlimitedUntil &&
//         new Date(tokenInfo.unlimitedUntil) > new Date())
//     tokenLabel = unlimited
//       ? 'Unlimited tokens'
//       : `${tokenInfo.max - tokenInfo.used} tokens left`
//   }

//   return (
//     <header className='flex items-center justify-between px-4 py-3 bg-[#0B0B28] text-white'>
//       <Link href='/' className='text-xl font-bold'>
//         Morpho
//       </Link>

//       <div className='flex items-center gap-4'>
//         <div className='flex items-center gap-1 text-sm'>
//           <RiCoinLine className='text-yellow-400' />
//           {tokenLabel}
//         </div>

//         {status === 'loading'
//           ? null
//           : session
//           ? (
//             <>
//               <span className='hidden sm:inline text-xs'>
//                 Hi, {session.user.email}
//               </span>
//               <button onClick={handleLogout} className='underline text-xs'>
//                 Logout
//               </button>
//             </>
//           )
//           : (
//             <>
//               <Link href='/login' className='underline text-xs'>
//                 Login
//               </Link>
//               <Link href='/register' className='underline text-xs'>
//                 Register
//               </Link>
//             </>
//           )}
//       </div>
//     </header>
//   )
// }

// export default Header


'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { RiCoinLine } from 'react-icons/ri'

const Header = () => {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const [tokenInfo, setTokenInfo] = useState({
    used: 0,
    max: 20,
    unlimitedUntil: null
  })

  /* ───────────────────────────────── Sync from session */
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setTokenInfo({
        used: session.user.tokensUsed ?? 0,
        max: session.user.maxTokens ?? 20,
        unlimitedUntil: session.user.unlimitedAccessUntil ?? null
      })
    } else if (status === 'unauthenticated') {
      setTokenInfo({ used: 0, max: 20, unlimitedUntil: null })
    }
  }, [status, session])

  /* ───────────────────────────────── Live updates */
  useEffect(() => {
    const handler = e => setTokenInfo({
      used: e.detail.tokensUsed,
      max: e.detail.maxTokens,
      unlimitedUntil: e.detail.unlimitedAccessUntil ?? null
    })
    window.addEventListener('tokensUpdated', handler)
    return () => window.removeEventListener('tokensUpdated', handler)
  }, [])

  /* ───────────────────────────────── Label */
  let tokenLabel = 'Loading…'
  if (status !== 'loading') {
    const unlimited =
      tokenInfo.max === Infinity ||
      (tokenInfo.unlimitedUntil && new Date(tokenInfo.unlimitedUntil) > new Date())

    const left = tokenInfo.max - tokenInfo.used
    tokenLabel = unlimited
      ? 'Unlimited tokens'
      : `${Math.max(left, 0)} tokens left`   // ← clamp at 0
  }

  /* ───────────────────────────────── UI */
  return (
    <header className='flex items-center justify-between px-4 py-3 bg-[#0B0B28] text-white'>
      <Link href='/' className='text-xl font-bold'>
        Morpho
      </Link>

      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-1 text-sm'>
          <RiCoinLine className='text-yellow-400' />
          {tokenLabel}
        </div>

        {status === 'loading' ? null : session ? (
          <>
            <span className='hidden sm:inline text-xs'>
              Hi, {session.user.email}
            </span>
            <button onClick={() => signOut({ callbackUrl: '/' })} className='underline text-xs'>
              Logout
            </button>
          </>
        ) : (
          <>
            {pathname !== '/login' && (
              <Link href='/login' className='underline text-xs'>
                Login
              </Link>
            )}
            {pathname !== '/register' && (
              <Link href='/register' className='underline text-xs'>
                Register
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  )
}

export default Header
