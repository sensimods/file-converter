// // document-pro/src/components/MainLayout.jsx
// 'use client'; // This component will contain client-side interactivity like AdSense

// import { useEffect } from 'react';
// import BuyMeACoffee from './BuyMeACoffee'; // Assuming BuyMeACoffee is in the same components folder

// /**
//  * MainLayout Component
//  *
//  * This component provides a consistent layout for all tool pages,
//  * including left and right advertisement sections and a central content area.
//  * It also handles the dynamic loading of AdSense units.
//  *
//  * Props:
//  * - children: React nodes to be rendered in the central content area.
//  * - title: The title for the central content section.
//  * - showBuyMeACoffee: Boolean to control visibility of BuyMeACoffee button (optional, default true).
//  */
// export default function MainLayout({ children, title, showBuyMeACoffee = true }) {
//   // AdSense push for dynamic loading
//   useEffect(() => {
//     try {
//       if (typeof window !== 'undefined' && window.adsbygoogle) {
//         // Push ad units after component mounts
//         (window.adsbygoogle = window.adsbygoogle || []).push({});
//         (window.adsbygoogle = window.adsbygoogle || []).push({}); // For the second ad unit
//         (window.adsbygoogle = window.adsbygoogle || []).push({}); // For the third ad unit
//         (window.adsbygoogle = window.adsbygoogle || []).push({}); // For the fourth ad unit
//       }
//     } catch (error) {
//       console.error('AdSense script not loaded or error encountered:', error);
//     }
//   }, []); // Empty dependency array means this runs once on mount

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
//       {/* Main container for ads and content */}
//       <div className="flex flex-col md:flex-row justify-center items-start w-full max-w-screen-xl gap-4 md:gap-8 flex-grow">

//         {/* Left Ad Section */}
//         <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500">
//             <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//             {/* AdSense Unit 1: Left Skyscraper/Vertical Ad */}
//             <ins className="adsbygoogle"
//               style={{ display: 'block', width: '100%', minHeight: '300px' }}
//               data-ad-client="ca-pub-7000000000000000" // TEST PUBLISHER ID
//               data-ad-slot="1234567890" // TEST SLOT ID for a responsive ad
//               data-ad-format="auto"
//               data-full-width-responsive="true"></ins>
//           </div>
//           {/* Optional: Add another ad unit below the first one if desired */}
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4">
//             <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//             {/* AdSense Unit 2: Left Medium Rectangle */}
//             <ins className="adsbygoogle"
//               style={{ display: 'block', width: '100%', minHeight: '250px' }}
//               data-ad-client="ca-pub-7000000000000000" // TEST PUBLISHER ID
//               data-ad-slot="0987654321" // TEST SLOT ID for a responsive ad
//               data-ad-format="auto"
//               data-full-width-responsive="true"></ins>
//           </div>
//         </div>

//         {/* Main Content Section - This is where the tool-specific content will be rendered */}
//         {/* Adjusted width to match the Image Converter's desired central content width */}
//         <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full md:w-3/5 lg:w-2/3 text-center flex-grow">
//           {title && (
//             <h1 className="text-4xl font-bold mb-6 text-purple-400">
//               {title}
//             </h1>
//           )}
//           {children} {/* This is where the specific page content goes */}
//         </div>

//         {/* Right Ad Section */}
//         <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500">
//             <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//             {/* AdSense Unit 3: Right Skyscraper/Vertical Ad */}
//             <ins className="adsbygoogle"
//               style={{ display: 'block', width: '100%', minHeight: '300px' }}
//               data-ad-client="ca-pub-7000000000000000" // TEST PUBLISHER ID
//               data-ad-slot="2345678901" // TEST SLOT ID for a responsive ad
//               data-ad-format="auto"
//               data-full-width-responsive="true"></ins>
//           </div>
//           {/* Optional: Add another ad unit below the first one if desired */}
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4">
//             <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//             {/* AdSense Unit 4: Right Medium Rectangle */}
//             <ins className="adsbygoogle"
//               style={{ display: 'block', width: '100%', minHeight: '250px' }}
//               data-ad-client="ca-pub-7000000000000000" // TEST PUBLISHER ID
//               data-ad-slot="3456789012" // TEST SLOT ID for a responsive ad
//               data-ad-format="auto"
//               data-full-width-responsive="true"></ins>
//           </div>
//         </div>
//       </div>

//       {showBuyMeACoffee && (
//         <div className="mt-8">
//           <BuyMeACoffee />
//         </div>
//       )}

//       {/* Global custom scrollbar style */}
//       <style jsx>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 8px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: #333;
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #888;
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #555;
//         }
//       `}</style>
//     </div>
//   );
// }



// document-pro/src/components/MainLayout.jsx
// 'use client'; // This component will contain client-side interactivity

// import { useEffect, useRef } from 'react'; // useRef is no longer strictly needed for ads, but kept if other uses arise
// import BuyMeACoffee from './BuyMeACoffee'; // Assuming BuyMeACoffee is in the same components folder

// /**
//  * MainLayout Component
//  *
//  * This component provides a consistent layout for all tool pages,
//  * including left and right sections and a central content area.
//  *
//  * Props:
//  * - children: React nodes to be rendered in the central content area.
//  * - title: The title for the central content section.
//  * - showBuyMeACoffee: Boolean to control visibility of BuyMeACoffee button (optional, default true).
//  */
// export default function MainLayout({ children, title, showBuyMeACoffee = true }) {
//   // Removed refs for AdSense ins tags as ads are being removed.
//   // const adRef1 = useRef(null);
//   // const adRef2 = useRef(null);
//   // const adRef3 = useRef(null);
//   // const adRef4 = useRef(null);

//   // Removed useEffect for AdSense push as ads are being removed.
//   // useEffect(() => {
//   //   try {
//   //     if (typeof window !== 'undefined' && window.adsbygoogle) {
//   //       const pushAd = (ref) => {
//   //         if (ref.current) {
//   //           (window.adsbygoogle = window.adsbygoogle || []).push({});
//   //         }
//   //       };
//   //       const timer = setTimeout(() => {
//   //         pushAd(adRef1);
//   //         pushAd(adRef2);
//   //         pushAd(adRef3);
//   //         pushAd(adRef4);
//   //       }, 100);
//   //       return () => clearTimeout(timer);
//   //     }
//   //   } catch (error) {
//   //     console.error('AdSense script push error:', error);
//   //   }
//   // }, []);

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
//       {/* Main container for content */}
//       <div className="flex flex-col md:flex-row justify-center items-start w-full max-w-screen-xl gap-4 md:gap-8 flex-grow">

//         {/* Left Placeholder Section (previously for ads) */}
//         <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 min-h-[300px] flex items-center justify-center">
//             <p className="text-gray-300 text-sm">Content Placeholder</p>
//           </div>
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4 min-h-[250px] flex items-center justify-center">
//             <p className="text-gray-300 text-sm">Content Placeholder</p>
//           </div>
//         </div>

//         {/* Main Content Section - This is where the tool-specific content will be rendered */}
//         <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full md:w-3/5 lg:w-2/3 text-center flex-grow">
//           {title && (
//             <h1 className="text-4xl font-bold mb-6 text-purple-400">
//               {title}
//             </h1>
//           )}
//           {children} {/* This is where the specific page content goes */}
//         </div>

//         {/* Right Placeholder Section (previously for ads) */}
//         <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 min-h-[300px] flex items-center justify-center">
//             <p className="text-gray-300 text-sm">Content Placeholder</p>
//           </div>
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4 min-h-[250px] flex items-center justify-center">
//             <p className="text-gray-300 text-sm">Content Placeholder</p>
//           </div>
//         </div>
//       </div>

//       {showBuyMeACoffee && (
//         <div className="mt-8">
//           <BuyMeACoffee />
//         </div>
//       )}

      
//     </div>
//   );
// }


//WAS WORKING FINE 04-07-25
// 'use client'; // This component will contain client-side interactivity

// import { useEffect, useRef } from 'react';
// import BuyMeACoffee from './BuyMeACoffee';


// /**
//  * MainLayout Component
//  *
//  * This component provides a consistent layout for all tool pages,
//  * including left and right sections and a central content area,
//  * and a shared footer.
//  *
//  * Props:
//  * - children: React nodes to be rendered in the central content area.
//  * - title: The title for the central content section.
//  * - showBuyMeACoffee: Boolean to control visibility of BuyMeACoffee button (optional, default true).
//  */
// export default function MainLayout({ children, title }) {
//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
//       {/* Main container for content */}
//       <div className="flex flex-col md:flex-row justify-center items-start w-full max-w-screen-xl gap-4 md:gap-8 flex-grow">

//         {/* Left Placeholder Section */}
//         <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 min-h-[300px] flex items-center justify-center">
//             <p className="text-gray-300 text-sm">Content Placeholder</p>
//           </div>
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4 min-h-[250px] flex items-center justify-center">
//             <p className="text-gray-300 text-sm">Content Placeholder</p>
//           </div>
//         </div>

//         {/* Main Content Section - This is where the tool-specific content will be rendered */}
//         <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full md:w-3/5 lg:w-2/3 text-center flex-grow">
//           {title && (
//             <h1 className="text-4xl font-bold mb-6 text-purple-400">
//               {title}
//             </h1>
//           )}
//           {children} {/* This is where the specific page content goes */}
//         </div>

//         {/* Right Placeholder Section */}
//         <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 min-h-[300px] flex items-center justify-center">
//             <p className="text-gray-300 text-sm">Content Placeholder</p>
//           </div>
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4 min-h-[250px] flex items-center justify-center">
//             <p className="text-gray-300 text-sm">Content Placeholder</p>
//           </div>
//         </div>
//       </div>

//       {/* {showBuyMeACoffee && (
//         <div className="mt-8">
//           <BuyMeACoffee />
//         </div>
//       )} */}

//       {/* Footer Section */}
//       <footer className="bg-gray-800 shadow-inner py-4 px-6 text-center text-gray-400 text-sm w-full max-w-screen-xl mt-8 rounded-lg">
//         <BuyMeACoffee />
//         <p>&copy; {new Date().getFullYear()} Morpho. All rights reserved.</p>

//       </footer>

      
//     </div>
//   );
// }


// 'use client'; // This component will contain client-side interactivity

// import { useEffect, useRef } from 'react';
// import BuyMeACoffee from './BuyMeACoffee';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import FingerprintJS from '@fingerprintjs/fingerprintjs'; // Import FingerprintJS

/**
 * MainLayout Component
 *
 * This component provides a consistent layout for all tool pages,
 * including left and right sections and a central content area,
 * and a shared footer.
 *
 * Props:
 * - children: React nodes to be rendered in the central content area.
 * - title: The title for the central content section.
 */
'use client'; // This component will contain client-side interactivity

import { useEffect, useRef } from 'react';
import BuyMeACoffee from './BuyMeACoffee';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FingerprintJS from '@fingerprintjs/fingerprintjs'; // Import FingerprintJS

/**
 * MainLayout Component
 *
 * This component provides a consistent layout for all tool pages,
 * including left and right sections and a central content area,
 * and a shared footer.
 *
 * Props:
 * - children: React nodes to be rendered in the central content area.
 * - title: The title for the central content section.
 */
export default function MainLayout({ children, title }) {
  // Effect to generate and set browser fingerprint and send to backend
  useEffect(() => {
    const identifyUser = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const fingerprintId = result.visitorId;

        // Get existing anonymous ID from cookie if it exists (from middleware)
        const anonymousIdCookie = document.cookie.split('; ').find(row => row.startsWith('_anon_id='));
        const anonymousId = anonymousIdCookie ? anonymousIdCookie.split('=')[1] : null;

        // Set the fingerprint as a cookie.
        document.cookie = `_fp_id=${fingerprintId}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax; ${process.env.NODE_ENV === 'production' ? 'secure' : ''}`;
        console.log('Browser fingerprint set:', fingerprintId);

        // Send fingerprint and anonymous ID to backend for reconciliation
        const response = await fetch('/api/identify-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fingerprintId, anonymousId }),
        });

        if (!response.ok) {
          console.error('Failed to identify user on backend:', response.statusText);
        } else {
          const data = await response.json();
          console.log('User identification successful:', data);
          // Dispatch event to update tokens in Navbar/Header immediately after identification
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tokensUpdated', {
              detail: {
                tokensUsed: data.tokensUsed,
                maxTokens: data.maxTokens,
                isSubscriber: data.isSubscriber,
              }
            }));
          }
        }
      } catch (error) {
        console.error('Error during user identification process:', error);
      }
    };

    if (typeof window !== 'undefined') {
      identifyUser();
    }
  }, []); // Run once on mount

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      {/* Main container for content */}
      <div className="flex flex-col md:flex-row justify-center items-start w-full max-w-screen-xl gap-4 md:gap-8 flex-grow">

        {/* Left Placeholder Section */}
        <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
          <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 min-h-[300px] flex items-center justify-center">
            <p className="text-gray-300 text-sm">Content Placeholder</p>
          </div>
          <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4 min-h-[250px] flex items-center justify-center">
            <p className="text-gray-300 text-sm">Content Placeholder</p>
          </div>
        </div>

        {/* Main Content Section - This is where the tool-specific content will be rendered */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full md:w-3/5 lg:w-2/3 text-center flex-grow">
          {title && (
            <h1 className="text-4xl font-bold mb-6 text-purple-400">
              {title}
            </h1>
          )}
          {children} {/* This is where the specific page content goes */}
        </div>

        {/* Right Placeholder Section */}
        <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
          <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 min-h-[300px] flex items-center justify-center">
            <p className="text-gray-300 text-sm">Content Placeholder</p>
          </div>
          <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4 min-h-[250px] flex items-center justify-center">
            <p className="text-gray-300 text-sm">Content Placeholder</p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-800 shadow-inner py-4 px-6 text-center text-gray-400 text-sm w-full max-w-screen-xl mt-8 rounded-lg flex flex-col sm:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} Morpho. All rights reserved.</p>
        <BuyMeACoffee />
      </footer>

      
    </div>
  );
}
