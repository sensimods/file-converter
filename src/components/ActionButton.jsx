// // document-pro/src/components/ActionButton.jsx
// 'use client';

// import { useState, useEffect } from 'react';

// /**
//  * ActionButton Component
//  * A reusable button component that displays token cost and checks user's token balance.
//  *
//  * Props:
//  * - onClick: Function to be called when the button is clicked.
//  * - loading: Boolean indicating if an asynchronous operation is in progress.
//  * - cost: The number of tokens this action will consume.
//  * - buttonText: The default text to display on the button.
//  * - disabled: Additional boolean condition to disable the button (e.g., no files selected).
//  * - className: Optional Tailwind CSS classes to apply to the button.
//  */
// export default function ActionButton({ onClick, loading, cost = 0, buttonText, disabled = false, className = "" }) {
//   const [tokens, setTokens] = useState({ used: 0, max: 20, isSubscriber: false });
//   const [loadingTokens, setLoadingTokens] = useState(true);

//   // Function to fetch tokens from the API
//   const fetchTokens = async () => {
//     try {
//       setLoadingTokens(true);
//       const response = await fetch('/api/user-tokens');
//       if (response.ok) {
//         const data = await response.json();
//         setTokens({
//           used: data.tokensUsed,
//           max: data.maxTokens,
//           isSubscriber: data.isSubscriber,
//         });
//       } else {
//         console.error('Failed to fetch token data for ActionButton:', response.statusText);
//         setTokens({ used: 0, max: 20, isSubscriber: false });
//       }
//     } catch (error) {
//       console.error('Error fetching token data for ActionButton:', error);
//       setTokens({ used: 0, max: 20, isSubscriber: false });
//     } finally {
//       setLoadingTokens(false);
//     }
//   };

//   // Fetch tokens on component mount
//   useEffect(() => {
//     fetchTokens();

//     // Listen for custom 'tokensUpdated' event from other parts of the app
//     const handleTokensUpdated = (event) => {
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

//   const availableTokens = tokens.max - tokens.used;
//   const hasEnoughTokens = tokens.isSubscriber || (availableTokens >= cost);
//   const isDisabled = loading || disabled || !hasEnoughTokens || loadingTokens;

//   // Determine button text based on state
//   let currentButtonText = buttonText;
//   if (loading) {
//     currentButtonText = (
//       <>
//         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//         </svg>
//         Processing...
//       </>
//     );
//   } else if (loadingTokens) {
//     currentButtonText = "Loading Tokens...";
//   } else if (!hasEnoughTokens) {
//     currentButtonText = (
//       <span className="text-red-300">
//         Insufficient Tokens ({cost} needed)
//       </span>
//     );
//   } else if (cost > 0) {
//     currentButtonText = `${buttonText} (Cost: ${cost} Tokens)`;
//   }

//   // Determine button styles
//   const baseStyles = "font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out flex items-center justify-center mx-auto cursor-pointer";
//   const enabledStyles = "bg-purple-700 hover:bg-purple-800 text-white";
//   const disabledStyles = "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50";

//   return (
//     <button
//       onClick={onClick}
//       disabled={isDisabled}
//       className={`${baseStyles} ${isDisabled ? disabledStyles : enabledStyles} ${className}`}
//     >
//       {currentButtonText}
//     </button>
//   );
// }


// document-pro/src/components/ActionButton.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { RiCoinLine } from "react-icons/ri";


// /**
//  * ActionButton Component
//  * A reusable button component that displays token cost and checks user's token balance.
//  *
//  * Props:
//  * - onClick: Function to be called when the button is clicked.
//  * - loading: Boolean indicating if an asynchronous operation is in progress.
//  * - cost: The number of tokens this action will consume.
//  * - buttonText: The default text to display on the button.
//  * - disabled: Additional boolean condition to disable the button (e.g., no files selected).
//  * - className: Optional Tailwind CSS classes to apply to the button.
//  */
// export default function ActionButton({ onClick, loading, cost = 0, buttonText, disabled = false, className = "" }) {
//   const [tokens, setTokens] = useState({ used: 0, max: 20, isSubscriber: false });
//   const [loadingTokens, setLoadingTokens] = useState(true); // Keep track of token loading state

//   // Function to fetch tokens from the API
//   const fetchTokens = async () => {
//     try {
//       setLoadingTokens(true); // Indicate that token fetching is in progress
//       const response = await fetch('/api/user-tokens');
//       if (response.ok) {
//         const data = await response.json();
//         setTokens({
//           used: data.tokensUsed,
//           max: data.maxTokens,
//           isSubscriber: data.isSubscriber,
//         });
//       } else {
//         console.error('Failed to fetch token data for ActionButton:', response.statusText);
//         setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback to default
//       }
//     } catch (error) {
//       console.error('Error fetching token data for ActionButton:', error);
//       setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback to default
//     } finally {
//       setLoadingTokens(false); // Token fetching is complete
//     }
//   };

//   // Fetch tokens on component mount
//   useEffect(() => {
//     fetchTokens();

//     // Listen for custom 'tokensUpdated' event from other parts of the app
//     const handleTokensUpdated = (event) => {
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
//   }, []);

//   const availableTokens = tokens.max - tokens.used;
//   const hasEnoughTokens = tokens.isSubscriber || (availableTokens >= cost);

//   // The button is disabled if:
//   // 1. An action is currently loading (e.g., conversion in progress)
//   // 2. The `disabled` prop is explicitly true (e.g., no files selected)
//   // 3. Tokens are still being loaded (to prevent interaction before knowing balance)
//   // 4. The user does not have enough tokens for the action (after tokens are loaded)
//   const isDisabled = loading || disabled || loadingTokens || !hasEnoughTokens;

//   // Determine button text based on state, prioritizing action status over token loading text
//   let currentButtonText;
//   if (loading) {
//     currentButtonText = (
//       <>
//         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//         </svg>
//         Processing...
//       </>
//     );
//   } else if (!hasEnoughTokens && !loadingTokens) { // Only show insufficient if tokens are loaded and not enough
//     currentButtonText = (
//       <span className="text-red-300">
//         Insufficient Tokens ({cost} needed)
//       </span>
//     );
//   } else if (cost > 0) {
//     currentButtonText = `${buttonText}`<RiCoinLine className="inline-block" size={20} /> ${cost} Tokens;
//   } else {
//     currentButtonText = buttonText; // Default text when not loading, enough tokens, or no cost
//   }

//   // Determine button styles
//   const baseStyles = "font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out flex items-center justify-center mx-auto cursor-pointer";
//   const enabledStyles = "bg-purple-700 hover:bg-purple-800 text-white";
//   const disabledStyles = "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50";

//   return (
//     <button
//       onClick={onClick}
//       disabled={isDisabled}
//       className={`${baseStyles} ${isDisabled ? disabledStyles : enabledStyles} ${className}`}
//     >
//       {currentButtonText}
//     </button>
//   );
// }

// WAS WORKING FINE 04-07-25
// document-pro/src/components/ActionButton.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { RiCoinLine } from "react-icons/ri"; // Import the coin icon

// /**
//  * ActionButton Component
//  * A reusable button component that displays token cost and checks user's token balance.
//  *
//  * Props:
//  * - onClick: Function to be called when the button is clicked.
//  * - loading: Boolean indicating if an asynchronous operation is in progress.
//  * - cost: The number of tokens this action will consume.
//  * - buttonText: The default text to display on the button.
//  * - disabled: Additional boolean condition to disable the button (e.g., no files selected).
//  * - className: Optional Tailwind CSS classes to apply to the button.
//  */
// export default function ActionButton({ onClick, loading, cost = 0, buttonText, disabled = false, className = "" }) {
//   const [tokens, setTokens] = useState({ used: 0, max: 20, isSubscriber: false });
//   const [loadingTokens, setLoadingTokens] = useState(true); // Keep track of token loading state

//   // Function to fetch tokens from the API
//   const fetchTokens = async () => {
//     try {
//       setLoadingTokens(true); // Indicate that token fetching is in progress
//       const response = await fetch('/api/user-tokens');
//       if (response.ok) {
//         const data = await response.json();
//         setTokens({
//           used: data.tokensUsed,
//           max: data.maxTokens,
//           isSubscriber: data.isSubscriber,
//         });
//       } else {
//         console.error('Failed to fetch token data for ActionButton:', response.statusText);
//         setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback to default
//       }
//     } catch (error) {
//       console.error('Error fetching token data for ActionButton:', error);
//       setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback to default
//     } finally {
//       setLoadingTokens(false); // Token fetching is complete
//     }
//   };

//   // Fetch tokens on component mount
//   useEffect(() => {
//     fetchTokens();

//     // Listen for custom 'tokensUpdated' event from other parts of the app
//     const handleTokensUpdated = (event) => {
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
//   }, []);

//   const availableTokens = tokens.max - tokens.used;
//   const hasEnoughTokens = tokens.isSubscriber || (availableTokens >= cost);

//   // The button is disabled if:
//   // 1. An action is currently loading (e.g., conversion in progress)
//   // 2. The `disabled` prop is explicitly true (e.g., no files selected)
//   // 3. Tokens are still being loaded (to prevent interaction before knowing balance)
//   // 4. The user does not have enough tokens for the action (after tokens are loaded)
//   const isDisabled = loading || disabled || loadingTokens || !hasEnoughTokens;

//   // Determine button text based on state, prioritizing action status over token loading text
//   let currentButtonText;
//   if (loading) {
//     currentButtonText = (
//       <>
//         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//         </svg>
//         Processing...
//       </>
//     );
//   } else if (!hasEnoughTokens && !loadingTokens) { // Only show insufficient if tokens are loaded and not enough
//     currentButtonText = (
//       <span className="text-red-300">
//         Insufficient Tokens ({cost} needed)
//       </span>
//     );
//   } else if (cost > 0) {
//     // Corrected JSX syntax for embedding the icon
//     currentButtonText = (
//       <span className="flex items-center justify-center gap-x-2">
//         {buttonText} <RiCoinLine size={20} /> {cost}
//       </span>
//     );
//   } else {
//     currentButtonText = buttonText; // Default text when not loading, enough tokens, or no cost
//   }

//   // Determine button styles
//   const baseStyles = "font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out flex items-center justify-center mx-auto cursor-pointer";
//   const enabledStyles = "bg-purple-700 hover:bg-purple-800 text-white";
//   const disabledStyles = "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50";

//   return (
//     <button
//       onClick={onClick}
//       disabled={isDisabled}
//       className={`${baseStyles} ${isDisabled ? disabledStyles : enabledStyles} ${className}`}
//     >
//       {currentButtonText}
//     </button>
//   );
// }


'use client';

import { useState, useEffect } from 'react';
import { RiCoinLine } from "react-icons/ri"; // Import the coin icon

/**
 * ActionButton Component
 * A reusable button component that displays token cost and checks user's token balance.
 *
 * Props:
 * - onClick: Function to be called when the button is clicked.
 * - loading: Boolean indicating if an asynchronous operation is in progress.
 * - cost: The number of tokens this action will consume.
 * - buttonText: The default text to display on the button.
 * - disabled: Additional boolean condition to disable the button (e.g., no files selected).
 * - className: Optional Tailwind CSS classes to apply to the button.
 */
export default function ActionButton({ onClick, loading, cost = 0, buttonText, disabled = false, className = "" }) {
  const [tokens, setTokens] = useState({ used: 0, max: 20, isSubscriber: false });
  const [loadingTokens, setLoadingTokens] = useState(true); // Keep track of token loading state

  // Function to fetch tokens from the API
  const fetchTokens = async () => {
    try {
      setLoadingTokens(true); // Indicate that token fetching is in progress
      const response = await fetch('/api/user-tokens');
      if (response.ok) {
        const data = await response.json();
        setTokens({
          used: data.tokensUsed,
          max: data.maxTokens,
          isSubscriber: data.isSubscriber,
        });
      } else {
        console.error('Failed to fetch token data for ActionButton:', response.statusText);
        setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback to default
      }
    } catch (error) {
      console.error('Error fetching token data for ActionButton:', error);
      setTokens({ used: 0, max: 20, isSubscriber: false }); // Fallback to default
    } finally {
      setLoadingTokens(false); // Token fetching is complete
    }
  };

  // Fetch tokens on component mount
  useEffect(() => {
    fetchTokens();

    // Listen for custom 'tokensUpdated' event from other parts of the app
    const handleTokensUpdated = (event) => {
      setTokens({
        used: event.detail.tokensUsed,
        max: event.detail.maxTokens,
        isSubscriber: event.detail.isSubscriber,
      });
      setLoadingTokens(false); // Ensure loading state is false after update
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tokensUpdated', handleTokensUpdated);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tokensUpdated', handleTokensUpdated);
      }
    };
  }, []);

  const availableTokens = tokens.max - tokens.used;
  const hasEnoughTokens = tokens.isSubscriber || (availableTokens >= cost);

  // The button is disabled if:
  // 1. An action is currently loading (e.g., conversion in progress)
  // 2. The `disabled` prop is explicitly true (e.g., no files selected)
  // 3. Tokens are still being loaded (to prevent interaction before knowing balance)
  // 4. The user does not have enough tokens for the action (after tokens are loaded)
  const isDisabled = loading || disabled || loadingTokens || !hasEnoughTokens;

  // Determine button text based on state, prioritizing action status over token loading text
  let currentButtonText;
  if (loading) {
    currentButtonText = (
      <>
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
      </>
    );
  } else if (!hasEnoughTokens && !loadingTokens) { // Only show insufficient if tokens are loaded and not enough
    currentButtonText = (
      <span className="text-red-300">
        Insufficient Tokens ({cost} needed)
      </span>
    );
  } else if (cost > 0) {
    // Corrected JSX syntax for embedding the icon
    currentButtonText = (
      <span className="flex items-center justify-center gap-1">
        {buttonText} <RiCoinLine className="inline-block" size={20} /> {cost} Tokens
      </span>
    );
  } else {
    currentButtonText = buttonText; // Default text when not loading, enough tokens, or no cost
  }

  // Determine button styles
  const baseStyles = "font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out flex items-center justify-center mx-auto cursor-pointer";
  const enabledStyles = "bg-purple-700 hover:bg-purple-800 text-white";
  const disabledStyles = "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50";

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseStyles} ${isDisabled ? disabledStyles : enabledStyles} ${className}`}
    >
      {currentButtonText}
    </button>
  );
}