// // src/app/layout.js
// import { Inter } from 'next/font/google'
// import './globals.css'
// import Script from 'next/script' // Import Script from next/script
// import { SpeedInsights } from "@vercel/speed-insights/next"; // Keep existing imports

// const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'Image Converter',
//   description: 'Convert images between various formats (JPEG, PNG, WebP) easily.',
// }

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <head>
//         {/* Google AdSense Script - Replace YOUR_ADSENSE_PUBLISHER_ID */}
//         <Script
//           async
//           src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_PUBLISHER_ID"
//           crossOrigin="anonymous"
//           strategy="lazyOnload" // Loads after hydrating, good for performance
//         />
//         {/* If you need to push ad data immediately, use `beforeInteractive` or `afterInteractive` */}
//         {/* <Script
//           id="adsense-init"
//           dangerouslySetInnerHTML={{
//             __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
//           }}
//           strategy="afterInteractive" // Runs after HTML is interactive
//         /> */}
//         {/* Google AdSense Script - IMPORTANT: Use your REAL data-ad-client for production */}
//         {/* For local testing, ensure it's conditional or use a test publisher ID if available,
//             though direct placement here with a real ID is for when you go live.
//             For development, we'll just put the test publisher ID here for now. */}
//         <script
//           async
//           src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7000000000000000" // THIS IS A TEST PUBLISHER ID
//           crossOrigin="anonymous"
//         ></script>

//       </head>
//       <body className={inter.className}>
//         {children}
//         <SpeedInsights />

//       </body>
//     </html>
//   )
// }


// src/app/layout.js
// import { Inter } from 'next/font/google';
// import './globals.css';
// import Script from 'next/script'; // Import Script from next/script
// import { SpeedInsights } from "@vercel/speed-insights/next"; // Keep existing imports

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Image Converter',
//   description: 'Convert images between various formats (JPEG, PNG, WebP) easily.',
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <head>
//         {/* Google AdSense Script for Testing - IMPORTANT: Replace with YOUR REAL ID for production */}
//         <Script
//           async
//           src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7000000000000000" // THIS IS A TEST PUBLISHER ID
//           crossOrigin="anonymous"
//           strategy="lazyOnload" // Loads after hydrating, good for performance
//         />
//         {/* If you need to push ad data immediately after the AdSense script is loaded for new units or reactive rendering, use afterInteractive strategy */}
//         {/*
//         <Script
//           id="adsense-init"
//           dangerouslySetInnerHTML={{
//             __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
//           }}
//           strategy="afterInteractive" // Runs after HTML is interactive
//         />
//         */}
//       </head>
//       <body className={inter.className}>
//         {children}
//         {/* Speed Insights from Vercel */}
//         <SpeedInsights />
//       </body>
//     </html>
//   );
// }


// app/layout.js
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