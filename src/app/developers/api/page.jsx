'use client'; // This is a Client Component

import { useState } from 'react';
import { toast } from 'react-toastify'; // Re-use toast from react-toastify
// import Navbar from '../../../components/Navbar'; // Adjust path based on your structure
import BuyMeACoffee from '../../../components/BuyMeACoffee'; // Adjust path based on your structure

// --- ApiDashboard Component ---
export default function ApiDashboardPage() {
  const [apiKey, setApiKey] = useState('');
  const [loadingKey, setLoadingKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Function to simulate API key generation
  const generateApiKey = () => {
    setLoadingKey(true);
    setCopied(false);
    // Simulate an API call
    setTimeout(() => {
      const newKey = `sk-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setApiKey(newKey);
      toast.success('New API Key generated!');
      setLoadingKey(false);
    }, 1000);
  };

  // Function to copy API key to clipboard
  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
        .then(() => {
          setCopied(true);
          toast.info('API Key copied to clipboard!');
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          toast.error('Failed to copy API Key. Please copy manually.');
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center">
        {/* <Navbar /> Navbar without currentPage state */}
        {/* AdSense scripts are in layout.js, ToastContainer in RootLayout */}

        <div className="flex flex-col md:flex-row justify-center items-start w-full max-w-screen-xl gap-4 md:gap-8 p-4 flex-grow">
             {/* Left Ad Section - (Optional, you might only want ads on main converter page) */}
            <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
                <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500">
                    <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
                    <ins className="adsbygoogle"
                        style={{ display: 'block', width: '100%', minHeight: '300px' }}
                        data-ad-client="ca-pub-7000000000000000"
                        data-ad-slot="1234567890"
                        data-ad-format="auto"
                        data-full-width-responsive="true"></ins>
                </div>
            </div>

            {/* API Dashboard Content */}
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full text-center flex-grow">
                <h1 className="text-4xl font-bold mb-6 text-green-400">Developer API Dashboard</h1>

                <div className="mb-8 p-6 bg-gray-700 rounded-lg border border-gray-600">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Your API Key</h2>
                    <p className="text-gray-300 mb-4">
                    Generate your free API key below. You'll get limited free usage to test out the image conversion API.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                    <input
                        type="text"
                        readOnly
                        value={apiKey || 'Click "Generate Key"'}
                        className="flex-grow p-3 rounded bg-gray-900 text-white border border-gray-600 focus:outline-none text-sm sm:text-base"
                        placeholder="Your API Key will appear here"
                    />
                    <button
                        onClick={generateApiKey}
                        disabled={loadingKey}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loadingKey ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ) : 'Generate Key'}
                    </button>
                    {apiKey && (
                        <button
                        onClick={copyToClipboard}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out"
                        >
                        {copied ? 'Copied!' : 'Copy Key'}
                        </button>
                    )}
                    </div>
                    <p className="text-sm text-gray-400">
                    * For now, this is a placeholder key. Real API key management will be integrated later.
                    </p>
                </div>

                <div className="mb-8 p-6 bg-gray-700 rounded-lg border border-gray-600">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Upgrade Your Plan</h2>
                    <p className="text-gray-300 mb-4">
                    Need more conversions? Upgrade to a paid plan for higher limits, faster processing, and dedicated support.
                    </p>
                    <button
                    onClick={() => toast.info('Upgrade functionality coming soon!')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out"
                    >
                    View Plans & Upgrade
                    </button>
                </div>

                <div className="p-6 bg-gray-700 rounded-lg border border-gray-600">
                    <h2 className="text-2xl font-semibold mb-4 text-white">API Documentation</h2>
                    <p className="text-gray-300 mb-4">
                    Learn how to integrate our powerful image conversion API into your applications.
                    </p>
                    <a
                    href="#" // Placeholder for actual docs link
                    onClick={(e) => { e.preventDefault(); toast.info('Documentation coming soon!'); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out inline-block"
                    >
                    Read Docs
                    </a>
                </div>
            </div>

            {/* Right Ad Section - (Optional, you might only want ads on main converter page) */}
            <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
                <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500">
                    <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
                    <ins className="adsbygoogle"
                        style={{ display: 'block', width: '100%', minHeight: '300px' }}
                        data-ad-client="ca-pub-7000000000000000"
                        data-ad-slot="2345678901"
                        data-ad-format="auto"
                        data-full-width-responsive="true"></ins>
                </div>
            </div>
        </div>
        <BuyMeACoffee /> {/* Buy Me a Coffee button */}
    </div>
  );
}