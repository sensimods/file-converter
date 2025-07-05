
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
