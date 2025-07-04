'use client';
import { SiBuymeacoffee } from "react-icons/si";

export default function BuyMeACoffee() {
  return (
    <div className="mt-8 p-4 bg-gray-700 rounded-lg text-center w-full max-w-xs mx-auto mb-4"> {/* Added mb-4 for spacing */}
      <p className="text-gray-300 mb-2">Support My Work!</p>
      <a
        href="https://www.buymeacoffee.com/sensimods" // Replace with your actual Buy Me a Coffee link
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out shadow-md"
      >
        <SiBuymeacoffee className="mr-2" size={24} />
        Buy Me a Coffee
      </a>
    </div>
  );
}