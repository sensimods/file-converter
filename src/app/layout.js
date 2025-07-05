
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastContainer } from 'react-toastify'; // Import ToastContainer here
import 'react-toastify/dist/ReactToastify.css'; // And its CSS
import Navbar from '@/components/Navbar';
import Header from '@/components/Header';
import AuthSessionProvider from '@/components/auth/AuthSessionProvider';

const inter = Inter({ subsets: ['latin'] })


export const metadata = {
  title: 'Image Converter',
  description: 'Convert images between various formats (JPEG, PNG, WebP, AVIF, TIFF, RAW (Uncompressed)) easily.',
  // Add robots meta tag here
  robots: {
    index: false, // Prevents indexing
    follow: true, // Allows following links on the page (optional, but generally good for internal linking)
    nocache: true, // Optional: tells crawlers not to cache the page
  },
  // You can also add it via a direct meta tag if you prefer this syntax
  // metadata: {
  //   'google-site-verification': 'your-verification-code',
  //   other meta tags...
  // },
  // And then use the `alternates` key for canonical tags when you're ready
  // alternates: {
  //   canonical: 'https://www.yourmaindomain.com', // Uncomment and update when ready
  // },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/*
          IMPORTANT: For production, when you want indexing and your real domain,
          you would remove the `robots` property from `metadata` above,
          and ensure your `data-ad-client` below is your real AdSense ID.
        */}

        {/* Google AdSense Script for Testing - IMPORTANT: Replace with YOUR REAL ID for production */}
        {/* <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7000000000000000" // THIS IS A TEST PUBLISHER ID
          crossOrigin="anonymous"
          strategy="lazyOnload"
        /> */}
        {/* The adSense-init script to push empty objects is no longer needed in the head with this setup,
            as it's handled in the ImageConverter component's useEffect.
            If you remove ImageConverter from the page, and still want ads, you'd need it.
        */}
      </head>
      <body className={inter.className}>
        <AuthSessionProvider>
        <Navbar />
        <Header />
        {children}
        <SpeedInsights />

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        </AuthSessionProvider>
      </body>
    </html>
  );
}