// WAS WORKING FINE 04-07-25
// "use client";
// import { useEffect, useState } from "react";
// import { usePathname } from 'next/navigation';
// import { RiCoinLine } from "react-icons/ri";


// const Header = () => {

//   const pathname = usePathname();
//    // State for tokens
//    const [tokens, setTokens] = useState({ used: 0, max: 20, isSubscriber: false });
//    const [loadingTokens, setLoadingTokens] = useState(true);
 
//    // Function to fetch tokens
//    const fetchTokens = async () => {
//      try {
//        setLoadingTokens(true);
//        // The middleware will add X-User-ID header to this request automatically
//        const response = await fetch('/api/user-tokens');
//        if (response.ok) {
//          const data = await response.json();
//          setTokens({
//            used: data.tokensUsed,
//            max: data.maxTokens,
//            isSubscriber: data.isSubscriber,
//          });
//        } else {
//          console.error('Failed to fetch token data:', response.statusText);
//          setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback
//        }
//      } catch (error) {
//        console.error('Error fetching token data:', error);
//        setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback
//      } finally {
//        setLoadingTokens(false);
//      }
//    };
 
//    // Effect to fetch tokens on initial load and pathname changes
//   //  useEffect(() => {
//   //    fetchTokens();
//   //  }, [pathname]);
//   useEffect(() => {
//     fetchTokens();
//   }, []);
 
//    // Effect to listen for custom 'tokensUpdated' event
//    useEffect(() => {
//      const handleTokensUpdated = (event) => {
//        // Update state directly from the event detail
//        setTokens({
//          used: event.detail.tokensUsed,
//          max: event.detail.maxTokens,
//          isSubscriber: event.detail.isSubscriber,
//        });
//      };
 
//      if (typeof window !== 'undefined') {
//        window.addEventListener('tokensUpdated', handleTokensUpdated);
//      }
 
//      return () => {
//        if (typeof window !== 'undefined') {
//          window.removeEventListener('tokensUpdated', handleTokensUpdated);
//        }
//      };
//    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

//   return (
//     <div className="bg-gray-900 w-full px-4 flex justify-end">
//       {/* Token Display for Desktop */}
//       <div className="ml-4 px-3 py-1 rounded-full bg-gray-700 text-sm font-medium flex items-center">
//             {loadingTokens ? (
//               <span className="animate-pulse">Loading Tokens...</span>
//             ) : tokens.isSubscriber ? (
//               <span className="text-green-400">Unlimited Tokens</span>
//             ) : (
//               <span className="text-yellow-300 flex items-center gap-x-2"><RiCoinLine size={20} /> {tokens.max - tokens.used}</span>
//             )}
//           </div>
//     </div>
//   )
// }
// export default Header


// "use client";
// import { useEffect, useState } from "react";
// import { usePathname } from 'next/navigation';
// import { RiCoinLine } from "react-icons/ri";


// const Header = () => {

//   const pathname = usePathname();
//   // State for tokens
//   const [tokens, setTokens] = useState({ used: 0, max: 20, isSubscriber: false });
//   const [loadingTokens, setLoadingTokens] = useState(true);

//   // Function to fetch tokens
//   const fetchTokens = async () => {
//     try {
//       setLoadingTokens(true);
//       // The middleware will add X-Fingerprint-ID and X-Anonymous-ID headers to this request automatically
//       const response = await fetch('/api/user-tokens');
//       if (response.ok) {
//         const data = await response.json();
//         setTokens({
//           used: data.tokensUsed,
//           max: data.maxTokens,
//           isSubscriber: data.isSubscriber,
//         });
//       } else {
//         console.error('Failed to fetch token data:', response.statusText);
//         setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback
//       }
//     } catch (error) {
//       console.error('Error fetching token data:', error);
//       setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback
//     } finally {
//       setLoadingTokens(false);
//     }
//   };

//   // Effect to fetch tokens on initial load and pathname changes
//   // We keep this to ensure the token count is updated if the user navigates
//   // between pages without a full browser refresh.
//   useEffect(() => {
//     fetchTokens();
//   }, [pathname]);

//   // Effect to listen for custom 'tokensUpdated' event
//   useEffect(() => {
//     const handleTokensUpdated = (event) => {
//       // Update state directly from the event detail
//       setTokens({
//         used: event.detail.tokensUsed,
//         max: event.detail.maxTokens,
//         isSubscriber: event.detail.isSubscriber,
//       });
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

//   return (
//     <div className="bg-gray-900 w-full px-4 flex justify-end">
//       {/* Token Display for Desktop */}
//       <div className="ml-4 px-3 py-1 rounded-full bg-gray-700 text-sm font-medium flex items-center">
//         {loadingTokens ? (
//           <span className="animate-pulse">Loading Tokens...</span>
//         ) : tokens.isSubscriber ? (
//           <span className="text-green-400">Unlimited Tokens</span>
//         ) : (
//           <span className="text-yellow-300 flex items-center gap-x-2"><RiCoinLine size={20} /> {tokens.max - tokens.used}</span>
//         )}
//       </div>
//     </div>
//   )
// }
// export default Header;


// document-pro/src/components/Header.jsx
// "use client";
// import { useEffect, useState } from "react";
// import { usePathname } from 'next/navigation';
// import { RiCoinLine } from "react-icons/ri";
// import Link from 'next/link';
// import { useSession, signOut } from 'next-auth/react'; // Import useSession and signOut

// const Header = () => {
//   const pathname = usePathname();
//   const { data: session, status } = useSession(); // Get session data
//   const [tokens, setTokens] = useState({ used: 0, max: 20, isSubscriber: false });
//   const [loadingTokens, setLoadingTokens] = useState(true);

//   // Function to fetch tokens
//   const fetchTokens = async () => {
//     try {
//       setLoadingTokens(true);
//       // The middleware will add X-Fingerprint-ID and X-Anonymous-ID headers to this request automatically
//       const response = await fetch('/api/user-tokens');
//       if (response.ok) {
//         const data = await response.json();
//         setTokens({
//           used: data.tokensUsed,
//           max: data.maxTokens,
//           isSubscriber: data.isSubscriber,
//         });
//       } else {
//         console.error('Failed to fetch token data:', response.statusText);
//         setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback
//       }
//     } catch (error) {
//       console.error('Error fetching token data:', error);
//       setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback
//     } finally {
//       setLoadingTokens(false);
//     }
//   };

//   // Effect to fetch tokens on initial load and pathname changes
//   // We keep this to ensure the token count is updated if the user navigates
//   // between pages without a full browser refresh.
//   useEffect(() => {
//     fetchTokens();
//   }, [pathname, session]); // Re-fetch tokens if session changes (login/logout)

//   // Effect to listen for custom 'tokensUpdated' event
//   useEffect(() => {
//     const handleTokensUpdated = (event) => {
//       // Update state directly from the event detail
//       setTokens({
//         used: event.detail.tokensUsed,
//         max: event.detail.maxTokens,
//         isSubscriber: event.detail.isSubscriber,
//       });
//       setLoadingTokens(false); // Ensure loading state is false after update
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

//   return (
//     <div className="bg-gray-900 w-full px-4 py-3 flex justify-between items-center">
//       {/* Logo/Home Link */}
//       <Link href="/" className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition duration-200">
//         Morpho
//       </Link>

//       <div className="flex items-center gap-4">
//         {/* Token Display */}
//         <div className="px-3 py-1 rounded-full bg-gray-700 text-sm font-medium flex items-center">
//           {loadingTokens ? (
//             <span className="animate-pulse">Loading Tokens...</span>
//           ) : tokens.isSubscriber ? (
//             <span className="text-green-400">Unlimited Tokens</span>
//           ) : (
//             <span className="text-yellow-300 flex items-center gap-x-2"><RiCoinLine size={20} /> {tokens.max - tokens.used}</span>
//           )}
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
// }
// export default Header;


// document-pro/src/components/Header.jsx
"use client";
import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';
import { RiCoinLine } from "react-icons/ri";
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession(); // Get session data and status

  // State to hold the token info, initialized from session or defaults
  // This state will be updated by the 'tokensUpdated' event
  const [displayTokens, setDisplayTokens] = useState({
    used: 0,
    max: 20,
    isSubscriber: false,
  });

  // Effect to update displayTokens when session changes
  // This is the primary source of truth for Header
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setDisplayTokens({
        used: session.user.tokensUsed || 0,
        max: session.user.maxTokens || 20,
        isSubscriber: session.user.isSubscriber || false,
      });
      console.log("[Header] Updated tokens from session:", session.user.tokensUsed, session.user.maxTokens, session.user.isSubscriber);
    } else if (status === 'unauthenticated') {
      // Reset to default for unauthenticated users
      setDisplayTokens({ used: 0, max: 20, isSubscriber: false });
      console.log("[Header] User unauthenticated, resetting tokens.");
    }
    // No need to fetch /api/user-tokens here directly, useSession handles it
  }, [session, status]); // Depend on session and status

  // Effect to listen for custom 'tokensUpdated' event (for immediate updates from other components)
  useEffect(() => {
    const handleTokensUpdated = (event) => {
      // Update state directly from the event detail
      setDisplayTokens({
        used: event.detail.tokensUsed,
        max: event.detail.maxTokens,
        isSubscriber: event.detail.isSubscriber,
      });
      console.log("[Header] Updated tokens from custom event:", event.detail);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tokensUpdated', handleTokensUpdated);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tokensUpdated', handleTokensUpdated);
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount


  // Handle logout
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' }); // Redirect to homepage after logout
    // Dispatch event to reset tokens display immediately on logout
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tokensUpdated', {
        detail: {
          tokensUsed: 0,
          maxTokens: 20,
          isSubscriber: false,
        }
      }));
    }
  };

  // Determine token display text
  let tokenDisplayText;
  if (status === 'loading') { // Use NextAuth.js session loading status
    tokenDisplayText = <span className="animate-pulse">Loading...</span>;
  } else if (displayTokens.isSubscriber || (displayTokens.max === Infinity && displayTokens.used === 0)) {
    tokenDisplayText = <span className="text-green-400">Unlimited Tokens</span>;
  } else {
    tokenDisplayText = (
      <span className="text-yellow-300 flex items-center gap-x-2">
        <RiCoinLine size={20} /> {displayTokens.max - displayTokens.used}
      </span>
    );
  }

  return (
    <div className="bg-gray-900 w-full px-4 py-3 flex justify-between items-center">
      {/* Logo/Home Link */}
      <Link href="/" className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition duration-200">
        Morpho
      </Link>

      <div className="flex items-center gap-4">
        {/* Token Display */}
        <div className="px-3 py-1 rounded-full bg-gray-700 text-sm font-medium flex items-center">
          {tokenDisplayText}
        </div>

        {/* Auth Links */}
        {status === 'loading' ? (
          <div className="text-gray-400">Loading...</div>
        ) : session ? (
          <>
            <span className="text-gray-300 hidden sm:inline">Hi, {session.user.email}</span>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-300 ease-in-out"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-300 ease-in-out">
              Login
            </Link>
            <Link href="/register" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-300 ease-in-out">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
