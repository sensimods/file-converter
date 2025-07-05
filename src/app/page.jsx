'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import toolsData from '../data/tools.json'; // Import your tools data
import MainLayout from '@/components/MainLayout'; // Import MainLayout for consistent structure

export default function HomePage() {
  // AdSense push for dynamic loading (removed if MainLayout handles all ads)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense script not loaded or error encountered:', error);
    }
  }, []);

  return (
    // Wrap the content in MainLayout for consistent styling and token handling
    <MainLayout title="Welcome to Tool Hub!">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-4xl w-full mx-auto"> {/* Increased max-w for cards */}
        <h1 className="text-5xl font-bold mb-8 text-purple-400">
          Your One-Stop Tool Hub!
        </h1>
        <p className="text-lg text-gray-300 mb-10">
          Explore our collection of powerful document and image manipulation tools.
        </p>

        {/* Dynamic Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {toolsData.map((tool) => (
            <Link key={tool.path} href={tool.path} passHref>
              <div className="flex flex-col items-center justify-center bg-gray-700 p-6 rounded-lg shadow-md hover:bg-gray-600 transition duration-300 ease-in-out cursor-pointer h-full text-center">
                <div className="text-5xl mb-4 flex-shrink-0">
                  {tool.icon} {/* Tool Icon */}
                </div>
                <div className="text-center flex-grow">
                  <h2 className="text-2xl font-semibold text-purple-300 mb-2">
                    {tool.name} {/* Tool Title */}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {tool.description} {/* Tool Description */}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Optional AdSense unit for the home page */}
        <div className="mt-10 p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500">
          <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
          <ins className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: '200px' }}
            data-ad-client="ca-pub-7000000000000000" // TEST PUBLISHER ID
            data-ad-slot="4567890123" // TEST SLOT ID for a responsive ad
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
        </div>
      </div>
    </MainLayout>
  );
}
