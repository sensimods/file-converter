"use client";
import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';
import { RiCoinLine } from "react-icons/ri";


const Header = () => {

  const pathname = usePathname();
   // State for tokens
   const [tokens, setTokens] = useState({ used: 0, max: 20, isSubscriber: false });
   const [loadingTokens, setLoadingTokens] = useState(true);
 
   // Function to fetch tokens
   const fetchTokens = async () => {
     try {
       setLoadingTokens(true);
       // The middleware will add X-User-ID header to this request automatically
       const response = await fetch('/api/user-tokens');
       if (response.ok) {
         const data = await response.json();
         setTokens({
           used: data.tokensUsed,
           max: data.maxTokens,
           isSubscriber: data.isSubscriber,
         });
       } else {
         console.error('Failed to fetch token data:', response.statusText);
         setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback
       }
     } catch (error) {
       console.error('Error fetching token data:', error);
       setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback
     } finally {
       setLoadingTokens(false);
     }
   };
 
   // Effect to fetch tokens on initial load and pathname changes
  //  useEffect(() => {
  //    fetchTokens();
  //  }, [pathname]);
  useEffect(() => {
    fetchTokens();
  }, []);
 
   // Effect to listen for custom 'tokensUpdated' event
   useEffect(() => {
     const handleTokensUpdated = (event) => {
       // Update state directly from the event detail
       setTokens({
         used: event.detail.tokensUsed,
         max: event.detail.maxTokens,
         isSubscriber: event.detail.isSubscriber,
       });
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

  return (
    <div className="bg-gray-900 w-full px-4 flex justify-end">
      {/* Token Display for Desktop */}
      <div className="ml-4 px-3 py-1 rounded-full bg-gray-700 text-sm font-medium flex items-center">
            {loadingTokens ? (
              <span className="animate-pulse">Loading Tokens...</span>
            ) : tokens.isSubscriber ? (
              <span className="text-green-400">Unlimited Tokens</span>
            ) : (
              <span className="text-yellow-300 flex items-center gap-x-2"><RiCoinLine size={20} /> {tokens.max - tokens.used}</span>
            )}
          </div>
    </div>
  )
}
export default Header