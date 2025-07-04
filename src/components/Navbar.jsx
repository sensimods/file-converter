// 'use client';

// import Link from 'next/link'; // Import Link for client-side navigation

// export default function Navbar() {
//   // Use usePathname to highlight the active link if needed
//   // const pathname = usePathname();

//   return (
//     <nav className="bg-gray-900 p-4 shadow-lg w-full">
//       <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
//         <div className="text-white text-2xl font-bold mb-4 sm:mb-0">
//           <Link href="/" className="text-purple-400 hover:text-purple-300 transition duration-200">
//             ImagePro
//           </Link>
//         </div>
//         <div className="flex flex-col sm:flex-row gap-4">
//           <Link href="/" className="text-lg font-semibold px-4 py-2 rounded-md transition duration-200 text-gray-300 hover:bg-gray-700 hover:text-white">
//             Image Converter
//           </Link>
//           <Link href="/developers/api" className="text-lg font-semibold px-4 py-2 rounded-md transition duration-200 text-gray-300 hover:bg-gray-700 hover:text-white">
//             Developers / API
//           </Link>
//           {/* Add more navbar items here as needed, e.g., "Blog", "About Us" */}
//         </div>
//       </div>
//     </nav>
//   );
// }


// 'use client';

// import Link from 'next/link';
// import { useState, useRef, useEffect } from 'react'; // Import useState, useRef, useEffect
// import { usePathname } from 'next/navigation'; // Import usePathname

// import toolsData from '../data/tools.json'; // Import your tools data

// export default function Navbar() {
//   const pathname = usePathname(); // Get current path for active link highlighting
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility
//   const dropdownRef = useRef(null); // Ref to detect clicks outside the dropdown

//   // Effect to close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const toggleDropdown = () => {
//     setIsDropdownOpen(prev => !prev);
//   };

//   return (
//     <nav className="bg-gray-900 p-4 shadow-lg w-full">
//       <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
//         <div className="text-white text-2xl font-bold mb-4 sm:mb-0">
//           <Link href="/" className="text-purple-400 hover:text-purple-300 transition duration-200">
//             ImagePro
//           </Link>
//         </div>
//         <div className="flex flex-col sm:flex-row gap-4 relative"> {/* Added relative for dropdown positioning */}
//           {/* Tools Dropdown */}
//           <div className="relative" ref={dropdownRef}>
//             <button
//               onClick={toggleDropdown}
//               className="text-lg font-semibold px-4 py-2 rounded-md transition duration-200 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 cursor-pointer"
//               aria-haspopup="true"
//               aria-expanded={isDropdownOpen ? "true" : "false"}
//             >
//               Tools
//               <svg
//                 className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
//               </svg>
//             </button>
//             {isDropdownOpen && (
//               <div className="absolute left-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10">
//                 {toolsData.map((tool) => (
//                   <Link
//                     key={tool.path}
//                     href={tool.path}
//                     className={`block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 ${
//                       pathname === tool.path ? 'bg-gray-600 text-white' : ''
//                     }`}
//                     onClick={() => setIsDropdownOpen(false)} // Close dropdown on link click
//                   >
//                     {tool.name}
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>

//           <Link href="/developers/api" className="text-lg font-semibold px-4 py-2 rounded-md transition duration-200 text-gray-300 hover:bg-gray-700 hover:text-white">
//             Developers / API
//           </Link>
//           {/* Add more navbar items here as needed, e.g., "Blog", "About Us" */}
//         </div>
//       </div>
//     </nav>
//   );
// }



// 'use client';

// import Link from 'next/link';
// import { useState, useRef, useEffect } from 'react';
// import { usePathname } from 'next/navigation';

// import toolsData from '../data/tools.json'; // Import your tools data

// export default function Navbar() {
//   const pathname = usePathname();
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile menu
//   const dropdownRef = useRef(null);
//   const mobileMenuRef = useRef(null); // Ref for the mobile menu container

//   // Effect to close dropdown/mobile menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       // Close tools dropdown
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//       // Close mobile menu
//       if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
//         setIsMobileMenuOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const toggleDropdown = () => {
//     setIsDropdownOpen(prev => !prev);
//   };

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(prev => !prev);
//     setIsDropdownOpen(false); // Close dropdown if opening/closing mobile menu
//   };

//   const closeMobileMenuAndDropdown = () => {
//     setIsMobileMenuOpen(false);
//     setIsDropdownOpen(false);
//   };

//   return (
//     <nav className="bg-gray-900 p-4 shadow-lg w-full">
//       <div className="container mx-auto flex justify-between items-center">
//         {/* Logo/Site Title */}
//         <div className="text-white text-2xl font-bold">
//           <Link href="/" className="text-purple-400 hover:text-purple-300 transition duration-200">
//             ImagePro
//           </Link>
//         </div>

//         {/* Hamburger Menu Button (Mobile Only) */}
//         <div className="sm:hidden">
//           <button
//             onClick={toggleMobileMenu}
//             className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
//             aria-label="Toggle navigation"
//             aria-expanded={isMobileMenuOpen ? "true" : "false"}
//           >
//             <svg
//               className="h-6 w-6 fill-current"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               {isMobileMenuOpen ? (
//                 <path
//                   fillRule="evenodd"
//                   clipRule="evenodd"
//                   d="M18.278 16.864a1 1 0 01-1.414 1.414L12 13.414l-4.864 4.864a1 1 0 01-1.414-1.414L10.586 12 5.722 7.136a1 1 0 011.414-1.414L12 10.586l4.864-4.864a1 1 0 011.414 1.414L13.414 12l4.864 4.864z"
//                 />
//               ) : (
//                 <path
//                   fillRule="evenodd"
//                   clipRule="evenodd"
//                   d="M4 5h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z"
//                 />
//               )}
//             </svg>
//           </button>
//         </div>

//         {/* Desktop Navigation Links */}
//         <div className="hidden sm:flex sm:flex-row sm:gap-4 items-center">
//           {/* Tools Dropdown (Desktop) */}
//           <div className="relative" ref={dropdownRef}>
//             <button
//               onClick={toggleDropdown}
//               className="text-lg font-semibold px-4 py-2 rounded-md transition duration-200 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 cursor-pointer"
//               aria-haspopup="true"
//               aria-expanded={isDropdownOpen ? "true" : "false"}
//             >
//               Tools
//               <svg
//                 className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
//               </svg>
//             </button>
//             {isDropdownOpen && (
//               <div className="absolute left-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10">
//                 {toolsData.map((tool) => (
//                   <Link
//                     key={tool.path}
//                     href={tool.path}
//                     className={`block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 ${
//                       pathname === tool.path ? 'bg-gray-600 text-white' : ''
//                     }`}
//                     onClick={closeMobileMenuAndDropdown} // Close all on link click
//                   >
//                     {tool.name}
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>

//           <Link href="/developers/api" className="text-lg font-semibold px-4 py-2 rounded-md transition duration-200 text-gray-300 hover:bg-gray-700 hover:text-white">
//             Developers / API
//           </Link>
//         </div>
//       </div>

//       {/* Mobile Menu (conditionally rendered) */}
//       {isMobileMenuOpen && (
//         <div className="sm:hidden mt-4 bg-gray-800 rounded-md shadow-lg w-full" ref={mobileMenuRef}>
//           <div className="flex flex-col py-2">
//             {/* Tools Dropdown (Mobile) - integrated directly into mobile menu */}
//             <div className="relative w-full">
//               <button
//                 onClick={toggleDropdown}
//                 className="w-full text-left text-lg font-semibold px-4 py-2 rounded-md transition duration-200 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-between cursor-pointer"
//                 aria-haspopup="true"
//                 aria-expanded={isDropdownOpen ? "true" : "false"}
//               >
//                 Tools
//                 <svg
//                   className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
//                 </svg>
//               </button>
//               {isDropdownOpen && (
//                 <div className="mt-1 bg-gray-700 rounded-md shadow-inner py-1 ml-4"> {/* Indented for sub-menu */}
//                   {toolsData.map((tool) => (
//                     <Link
//                       key={tool.path}
//                       href={tool.path}
//                       className={`block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 ${
//                         pathname === tool.path ? 'bg-gray-600 text-white' : ''
//                       }`}
//                       onClick={closeMobileMenuAndDropdown} // Close all on link click
//                     >
//                       {tool.name}
//                     </Link>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <Link href="/developers/api" className="text-lg font-semibold px-4 py-2 rounded-md transition duration-200 text-gray-300 hover:bg-gray-700 hover:text-white" onClick={closeMobileMenuAndDropdown}>
//               Developers / API
//             </Link>
//             {/* Add more mobile navbar items here */}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }


// document-pro/src/components/Navbar.jsx
'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import toolsData from '../data/tools.json'; // Import your tools data

export default function Navbar() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

 


  // Effect to close dropdown/mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
    setIsDropdownOpen(false); // Close dropdown if opening/closing mobile menu
  };

  const closeMobileMenuAndDropdown = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-gray-900 p-4 shadow-lg w-full">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Site Title */}
        <div className="text-white text-2xl font-bold">
          <Link href="/" className="text-purple-400 hover:text-purple-300 transition duration-200">
            Morpho
          </Link>
        </div>

        {/* Hamburger Menu Button (Mobile Only) */}
        <div className="sm:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
            aria-label="Toggle navigation"
            aria-expanded={isMobileMenuOpen ? "true" : "false"}
          >
            <svg
              className="h-6 w-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.278 16.864a1 1 0 01-1.414 1.414L12 13.414l-4.864 4.864a1 1 0 01-1.414-1.414L10.586 12 5.722 7.136a1 1 0 011.414-1.414L12 10.586l4.864-4.864a1 1 0 011.414 1.414L13.414 12l4.864 4.864z"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4 5h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden sm:flex sm:flex-row sm:gap-4 items-center">
          {/* Tools Dropdown (Desktop) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="text-lg font-semibold px-4 py-2 rounded-md transition duration-200 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2 cursor-pointer"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen ? "true" : "false"}
            >
              Tools
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10">
                {toolsData.map((tool) => (
                  <Link
                    key={tool.path}
                    href={tool.path}
                    className={`block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 ${
                      pathname === tool.path ? 'bg-gray-600 text-white' : ''
                    }`}
                    onClick={closeMobileMenuAndDropdown}
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/developers/api" className="text-lg font-semibold px-4 py-2 rounded-md transition duration-200 text-gray-300 hover:bg-gray-700 hover:text-white">
            Developers / API
          </Link>

          
        </div>
      </div>

      {/* Mobile Menu (conditionally rendered) */}
      {isMobileMenuOpen && (
        <div className="sm:hidden mt-4 bg-gray-800 rounded-md shadow-lg w-full" ref={mobileMenuRef}>
          <div className="flex flex-col py-2">
            {/* Tools Dropdown (Mobile) - integrated directly into mobile menu */}
            <div className="relative w-full">
              <button
                onClick={toggleDropdown}
                className="w-full text-left text-lg font-semibold px-4 py-2 rounded-md transition duration-200 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center justify-between cursor-pointer"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen ? "true" : "false"}
              >
                Tools
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="mt-1 bg-gray-700 rounded-md shadow-inner py-1 ml-4">
                  {toolsData.map((tool) => (
                    <Link
                      key={tool.path}
                      href={tool.path}
                      className={`block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 ${
                        pathname === tool.path ? 'bg-gray-600 text-white' : ''
                      }`}
                      onClick={closeMobileMenuAndDropdown}
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/developers/api" className="text-lg font-semibold px-4 py-2 rounded-md transition duration-200 text-gray-300 hover:bg-gray-700 hover:text-white" onClick={closeMobileMenuAndDropdown}>
              Developers / API
            </Link>
            {/* Token Display for Mobile */}
            <div className="px-4 py-2 mt-2 rounded-md bg-gray-700 text-sm font-medium flex items-center justify-center">
              {loadingTokens ? (
                <span className="animate-pulse">Loading Tokens...</span>
              ) : tokens.isSubscriber ? (
                <span className="text-green-400">Unlimited Tokens</span>
              ) : (
                <span className="text-yellow-300">Tokens: {tokens.max - tokens.used} / {tokens.max}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

