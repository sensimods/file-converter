



// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import JSZip from 'jszip';
// import { saveAs } from 'file-saver';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// export default function ImageConverter() {
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [previewUrls, setPreviewUrls] = useState([]);
//   const [outputFormat, setOutputFormat] = useState('jpeg');
//   const [convertedImages, setConvertedImages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isZipping, setIsZipping] = useState(false);
//   const [isDownloadingAll, setIsDownloadingAll] = useState(false);
//   const fileInputRef = useRef(null);

//   // --- New configurable limits ---
//   const MAX_FILES = 100; // Example: Limit to 10 files
//   const MAX_FILE_SIZE_MB = 10; // Example: Limit to 5MB per file
//   const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
//   // --- End configurable limits ---

//   const formatOptions = [
//     { value: 'jpeg', label: 'JPEG' },
//     { value: 'png', label: 'PNG' },
//     { value: 'webp', label: 'WebP' },
//     { value: 'avif', label: 'AVIF' },
//     { value: 'tiff', label: 'TIFF' },
//     { value: 'raw', label: 'RAW (Uncompressed)' },
//   ];

//   const handleFileChange = (event) => {
//     const files = Array.from(event.target.files);
//     let validFiles = [];
//     let fileErrors = [];

//     // Check file count limit
//     if (files.length > MAX_FILES) {
//       toast.error(`Please select a maximum of ${MAX_FILES} files.`);
//       event.target.value = null; // Clear input
//       return;
//     }

//     // Check individual file sizes
//     for (const file of files) {
//       if (file.size > MAX_FILE_SIZE_BYTES) {
//         fileErrors.push(`${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
//       } else {
//         validFiles.push(file);
//       }
//     }

//     if (fileErrors.length > 0) {
//       toast.error(`Some files were too large: ${fileErrors.join(', ')}`);
//     }

//     setSelectedFiles(validFiles);
//     setPreviewUrls(validFiles.map(file => URL.createObjectURL(file)));

//     setConvertedImages([]);
//     setError(null);
//     toast.dismiss();
//   };

//   const handleConvert = async () => {
//     if (selectedFiles.length === 0) {
//       toast.error('Please select at least one image file.');
//       return;
//     }

//     // Double-check file count limit before sending to API (redundant but safe)
//     if (selectedFiles.length > MAX_FILES) {
//       toast.error(`You can only convert up to ${MAX_FILES} files at once.`);
//       setLoading(false); // Ensure loading is off
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setConvertedImages([]);
//     toast.dismiss();

//     const newConvertedImages = [];
//     let conversionErrors = [];

//     for (const file of selectedFiles) {
//       // Frontend file size validation (can also be done here if not in handleFileChange)
//       if (file.size > MAX_FILE_SIZE_BYTES) {
//         conversionErrors.push(`Failed to convert "${file.name}": File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
//         newConvertedImages.push({
//           id: file.name + Date.now(),
//           name: file.name.split('.').slice(0, -1).join('.'),
//           url: null,
//           outputFormat: outputFormat,
//           error: `File too large (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
//         });
//         continue; // Skip this file and go to the next
//       }

//       const formData = new FormData();
//       formData.append('image', file);
//       formData.append('format', outputFormat);
//       // Pass max file size to backend for explicit server-side validation
//       formData.append('maxFileSize', MAX_FILE_SIZE_BYTES);

//       try {
//         const response = await fetch('/api/convert', {
//           method: 'POST',
//           body: formData,
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.error || `Failed to convert ${file.name}.`);
//         }

//         const imageBlob = await response.blob();
//         const url = URL.createObjectURL(imageBlob);
//         newConvertedImages.push({
//           id: file.name + Date.now(),
//           name: file.name.split('.').slice(0, -1).join('.'),
//           url: url,
//           outputFormat: outputFormat,
//           error: null,
//         });

//       } catch (err) {
//         console.error(`Conversion error for ${file.name}:`, err);
//         conversionErrors.push(`Failed to convert "${file.name}": ${err.message}`);
//         newConvertedImages.push({
//           id: file.name + Date.now(),
//           name: file.name.split('.').slice(0, -1).join('.'),
//           url: null,
//           outputFormat: outputFormat,
//           error: err.message,
//         });
//       }
//     }

//     setConvertedImages(newConvertedImages);
//     setLoading(false);

//     if (conversionErrors.length > 0) {
//       const errorMessage = `Some conversions failed: ${conversionErrors.join('; ')}`;
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } else {
//       toast.success(`Successfully converted ${selectedFiles.length} image(s)!`);
//     }
//   };

//   const handleDownloadAllAsZip = async () => {
//     if (convertedImages.length === 0) {
//       toast.error('No images have been converted yet to download.');
//       return;
//     }

//     setIsZipping(true);
//     setError(null);
//     toast.dismiss();
//     const zip = new JSZip();
//     let zipErrors = [];
//     let successfulZipCount = 0;

//     const zipPromise = new Promise(async (resolve, reject) => {
//       for (const img of convertedImages) {
//         if (img.url) {
//           try {
//             const response = await fetch(img.url);
//             const blob = await response.blob();
//             zip.file(`${img.name}.${img.outputFormat}`, blob);
//             successfulZipCount++;
//           } catch (fetchError) {
//             console.error(`Failed to fetch ${img.name} for zipping:`, fetchError);
//             zipErrors.push(`Failed to add "${img.name}" to zip.`);
//           }
//         }
//       }

//       try {
//         const content = await zip.generateAsync({ type: "blob" });
//         saveAs(content, "converted_images.zip");
//         resolve();
//       } catch (zipError) {
//         console.error('Failed to generate zip file:', zipError);
//         zipErrors.push(`Failed to generate the zip file: ${zipError.message}`);
//         reject(zipError);
//       }
//     });

//     toast.promise(
//       zipPromise,
//       {
//         pending: 'Preparing ZIP file...',
//         success: {
//           render: () => {
//             return `Successfully zipped ${successfulZipCount} image(s)!`;
//           },
//         },
//         error: {
//           render: () => {
//             const msg = zipErrors.length > 0
//               ? `Failed to create ZIP: ${zipErrors.join('; ')}`
//               : 'Failed to create ZIP file.';
//             setError(msg);
//             return msg;
//           },
//         }
//       }
//     ).finally(() => {
//       setIsZipping(false);
//     });
//   };

//   const handleDownloadAllIndividual = async () => {
//     if (convertedImages.length === 0) {
//       toast.error('No images have been converted yet to download.');
//       return;
//     }

//     setIsDownloadingAll(true);
//     setError(null);
//     toast.dismiss();

//     let downloadInitiatedCount = 0;
//     let downloadErrors = [];

//     const imagesToDownload = convertedImages.filter(img => img.url);

//     const downloadPromise = new Promise(async (resolve, reject) => {
//       for (const img of imagesToDownload) {
//         try {
//           const link = document.createElement('a');
//           link.href = img.url;
//           link.download = `${img.name}.${img.outputFormat}`;
//           document.body.appendChild(link);
//           link.click();
//           document.body.removeChild(link);
//           downloadInitiatedCount++;

//           await new Promise(res => setTimeout(res, 300));
//         } catch (err) {
//           console.error(`Failed to initiate download for ${img.name} individually:`, err);
//           downloadErrors.push(`Failed to initiate download for "${img.name}".`);
//         }
//       }

//       if (imagesToDownload.length > 0 && downloadInitiatedCount === imagesToDownload.length) {
//         resolve();
//       } else if (downloadErrors.length > 0) {
//         reject(new Error(`Some downloads could not be initiated: ${downloadErrors.join('; ')}`));
//       } else {
//         reject(new Error('No images were available to download, or an unexpected error occurred.'));
//       }
//     });

//     toast.promise(
//       downloadPromise,
//       {
//         pending: 'Initiating individual downloads...',
//         success: {
//           render: () => {
//             return `All ${downloadInitiatedCount} images initiated for download successfully!`;
//           },
//         },
//         error: {
//           render: ({ data }) => {
//             setError(data.message);
//             return `Download issues: ${data.message}. Please check for browser pop-up blockers or network issues.`;
//           },
//         }
//       }
//     ).finally(() => {
//       setIsDownloadingAll(false);
//     });
//   };

//   useEffect(() => {
//     return () => {
//       previewUrls.forEach(url => URL.revokeObjectURL(url));
//       convertedImages.forEach(img => {
//         if (img.url) URL.revokeObjectURL(img.url);
//       });
//     };
//   }, [previewUrls, convertedImages]);

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
//       <ToastContainer
//         position="bottom-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="dark"
//       />

//       {/* Main container for ads and content */}
//       <div className="flex flex-col md:flex-row justify-center items-start w-full max-w-screen-xl gap-4 md:gap-8">

//         {/* Left Ad Section */}
//         <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
//           <div className="p-4 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500">
//             <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//             {/* Standard 160x600 Skyscraper or 300x600 if space allows, responsive */}
//             <div className="bg-gray-600 w-full h-[300px] sm:h-[400px] md:h-[600px] flex items-center justify-center rounded">
//               <p className="text-gray-400 text-xs sm:text-sm">AdSense: Skyscraper (e.g., 160x600)</p>
//             </div>
//             <p className="text-gray-400 text-xs mt-2">Placeholder for Left Ad</p>
//           </div>
//           {/* Optional: Add another ad unit below the first one if desired */}
//           <div className="p-4 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4">
//             <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//             <div className="bg-gray-600 w-full h-[250px] flex items-center justify-center rounded">
//               <p className="text-gray-400 text-xs sm:text-sm">AdSense: Medium Rectangle (300x250)</p>
//             </div>
//             <p className="text-gray-400 text-xs mt-2">Placeholder for Left Ad 2</p>
//           </div>
//         </div>

//         {/* Main Content Section */}
//         <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full md:w-3/5 lg:w-2/3 text-center flex-grow">
//           <h1 className="text-4xl font-bold mb-6 text-purple-400">Image Converter</h1>

//           <div className="mb-6">
//             <input
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={handleFileChange}
//               ref={fileInputRef}
//               className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 cursor-pointer"
//             />
//             {selectedFiles.length > 0 && (
//               <p className="text-sm text-gray-400 mt-2">
//                 Selected {selectedFiles.length} file(s). (Max: {MAX_FILES} files, {MAX_FILE_SIZE_MB}MB each)
//               </p>
//             )}
//           </div>

//           {previewUrls.length > 0 && (
//             <div className="mb-6 border border-gray-700 rounded-md p-2">
//               <h2 className="text-xl font-semibold mb-3">{previewUrls.length === 1 ? 'Preview:' : 'Previews:'}</h2>
//               {selectedFiles.length === 1 ? (
//                 <div className="flex justify-center items-center h-48 sm:h-64">
//                   <img
//                     src={previewUrls[0]}
//                     alt={`Preview 1`}
//                     className="max-w-full max-h-full object-contain border border-gray-600 rounded-md"
//                   />
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
//                   {previewUrls.map((url, index) => (
//                     <div
//                       key={index}
//                       className="relative w-full pb-[100%] border border-gray-600 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center"
//                     >
//                       <img
//                         src={url}
//                         alt={`Preview ${index + 1}`}
//                         className="absolute top-0 left-0 w-full h-full object-cover"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           <div className="mb-6 flex flex-col sm:flex-row justify-center items-center gap-4">
//             <label htmlFor="format-select" className="text-lg">Convert all to:</label>
//             <select
//               id="format-select"
//               value={outputFormat}
//               onChange={(e) => setOutputFormat(e.target.value)}
//               className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               {formatOptions.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <button
//             onClick={handleConvert}
//             disabled={loading || selectedFiles.length === 0}
//             className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto cursor-pointer"
//           >
//             {loading ? (
//               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//             ) : 'Convert All Images'}
//           </button>

//           {error && (
//             <p className="text-red-500 mt-4 text-sm">{error}</p>
//           )}

//           {convertedImages.length > 0 && (
//             <div className="mt-6 border border-gray-700 rounded-md p-4">
//               <h2 className="text-xl font-semibold mb-3">{convertedImages.length > 1 && 'Converted Images:'}</h2>

//               {convertedImages.length === 1 && convertedImages[0].url ? (
//                 <div className="flex flex-col items-center gap-4">
//                   {convertedImages[0].url && (
//                     <div className="relative w-24 h-24 border border-gray-600 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
//                       {/* Conditional rendering for preview based on format */}
//                       {['jpeg', 'png', 'webp', 'gif'].includes(convertedImages[0].outputFormat) ? (
//                         <img
//                           src={convertedImages[0].url}
//                           alt={convertedImages[0].name}
//                           className="absolute top-0 left-0 w-full h-full object-cover"
//                         />
//                       ) : (
//                         <p className="text-sm text-gray-400 text-center p-2">No preview for {convertedImages[0].outputFormat.toUpperCase()}</p>
//                       )}
//                     </div>
//                   )}
//                   <p className="text-sm text-gray-300 mb-2">{convertedImages[0].name}.{convertedImages[0].outputFormat}</p>
//                   <a
//                     href={convertedImages[0].url}
//                     download={`${convertedImages[0].name}.${convertedImages[0].outputFormat}`}
//                     className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Download Image
//                   </a>
//                 </div>
//               ) : (
//                 <>
//                   <div className="flex flex-col gap-2 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
//                     {convertedImages.map((img) => (
//                       <div key={img.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
//                         {img.url && (
//                           <div className="relative w-12 h-12 border border-gray-600 rounded-md overflow-hidden bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
//                             {/* Conditional rendering for preview based on format */}
//                             {['jpeg', 'png', 'webp', 'gif'].includes(img.outputFormat) ? (
//                               <img
//                                 src={img.url}
//                                 alt={`Converted ${img.name}`}
//                                 className="absolute top-0 left-0 w-full h-full object-cover"
//                               />
//                             ) : (
//                               <p className="text-xs text-gray-400 text-center p-1">No preview</p>
//                             )}
//                           </div>
//                         )}
//                         <span className="text-left text-sm flex-grow">
//                           {img.name}.{img.outputFormat}
//                           {img.error && <span className="text-red-400 ml-2">(Error: {img.error})</span>}
//                         </span>
//                         {img.url && (
//                           <a
//                             href={img.url}
//                             download={`${img.name}.${img.outputFormat}`}
//                             className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md transition duration-300 ease-in-out flex-shrink-0"
//                           >
//                             Download
//                           </a>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   {convertedImages.filter(img => img.url).length > 0 && (
//                     <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
//                       {convertedImages.filter(img => img.url).length > 1 && (
//                         <button
//                           onClick={handleDownloadAllAsZip}
//                           disabled={isZipping || isDownloadingAll}
//                           className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//                         >
//                           {isZipping ? (
//                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                             </svg>
//                           ) : 'Download All as ZIP'}
//                         </button>
//                       )}

//                       <button
//                         onClick={handleDownloadAllIndividual}
//                         disabled={isDownloadingAll || isZipping}
//                         className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//                       >
//                         {isDownloadingAll ? (
//                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                           </svg>
//                         ) : 'Download All Individually'}
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Right Ad Section */}
//         <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
//           <div className="p-4 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500">
//             <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//             {/* Standard 160x600 Skyscraper or 300x600 if space allows, responsive */}
//             <div className="bg-gray-600 w-full h-[300px] sm:h-[400px] md:h-[600px] flex items-center justify-center rounded">
//               <p className="text-gray-400 text-xs sm:text-sm">AdSense: Skyscraper (e.g., 160x600)</p>
//             </div>
//             <p className="text-gray-400 text-xs mt-2">Placeholder for Right Ad</p>
//           </div>
//            {/* Optional: Add another ad unit below the first one if desired */}
//            <div className="p-4 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4">
//             <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//             <div className="bg-gray-600 w-full h-[250px] flex items-center justify-center rounded">
//               <p className="text-gray-400 text-xs sm:text-sm">AdSense: Medium Rectangle (300x250)</p>
//             </div>
//             <p className="text-gray-400 text-xs mt-2">Placeholder for Right Ad 2</p>
//           </div>
//         </div>
//       </div>

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


// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import JSZip from 'jszip';
// import { saveAs } from 'file-saver';
// import { toast } from 'react-toastify';
// // import 'react-toastify/dist/ReactToastify.css';

// export default function ImageConverter() {
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [previewUrls, setPreviewUrls] = useState([]);
//   const [outputFormat, setOutputFormat] = useState('jpeg');
//   const [convertedImages, setConvertedImages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isZipping, setIsZipping] = useState(false);
//   const [isDownloadingAll, setIsDownloadingAll] = useState(false);
//   const fileInputRef = useRef(null);

//   // --- New configurable limits ---
//   const MAX_FILES = 100; // Example: Limit to 10 files
//   const MAX_FILE_SIZE_MB = 10; // Example: Limit to 5MB per file
//   const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
//   // --- End configurable limits ---

//   const formatOptions = [
//     { value: 'jpeg', label: 'JPEG' },
//     { value: 'png', label: 'PNG' },
//     { value: 'webp', label: 'WebP' },
//     { value: 'avif', label: 'AVIF' },
//     { value: 'tiff', label: 'TIFF' },
//     { value: 'raw', label: 'RAW (Uncompressed)' },
//   ];

//   const handleFileChange = (event) => {
//     const files = Array.from(event.target.files);
//     let validFiles = [];
//     let fileErrors = [];

//     // Check file count limit
//     if (files.length > MAX_FILES) {
//       toast.error(`Please select a maximum of ${MAX_FILES} files.`);
//       event.target.value = null; // Clear input
//       return;
//     }

//     // Check individual file sizes
//     for (const file of files) {
//       if (file.size > MAX_FILE_SIZE_BYTES) {
//         fileErrors.push(`${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
//       } else {
//         validFiles.push(file);
//       }
//     }

//     if (fileErrors.length > 0) {
//       toast.error(`Some files were too large: ${fileErrors.join(', ')}`);
//     }

//     setSelectedFiles(validFiles);
//     setPreviewUrls(validFiles.map(file => URL.createObjectURL(file)));

//     setConvertedImages([]);
//     setError(null);
//     toast.dismiss();
//   };

//   const handleConvert = async () => {
//     if (selectedFiles.length === 0) {
//       toast.error('Please select at least one image file.');
//       return;
//     }

//     // Double-check file count limit before sending to API (redundant but safe)
//     if (selectedFiles.length > MAX_FILES) {
//       toast.error(`You can only convert up to ${MAX_FILES} files at once.`);
//       setLoading(false); // Ensure loading is off
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setConvertedImages([]);
//     toast.dismiss();

//     const newConvertedImages = [];
//     let conversionErrors = [];

//     for (const file of selectedFiles) {
//       // Frontend file size validation (can also be done here if not in handleFileChange)
//       if (file.size > MAX_FILE_SIZE_BYTES) {
//         conversionErrors.push(`Failed to convert "${file.name}": File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
//         newConvertedImages.push({
//           id: file.name + Date.now(),
//           name: file.name.split('.').slice(0, -1).join('.'),
//           url: null,
//           outputFormat: outputFormat,
//           error: `File too large (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
//         });
//         continue; // Skip this file and go to the next
//       }

//       const formData = new FormData();
//       formData.append('image', file);
//       formData.append('format', outputFormat);
//       // Pass max file size to backend for explicit server-side validation
//       formData.append('maxFileSize', MAX_FILE_SIZE_BYTES);

//       try {
//         const response = await fetch('/api/convert/convert-image', {
//           method: 'POST',
//           body: formData,
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.error || `Failed to convert ${file.name}.`);
//         }

//         const imageBlob = await response.blob();
//         const url = URL.createObjectURL(imageBlob);
//         newConvertedImages.push({
//           id: file.name + Date.now(),
//           name: file.name.split('.').slice(0, -1).join('.'),
//           url: url,
//           outputFormat: outputFormat,
//           error: null,
//         });

//       } catch (err) {
//         console.error(`Conversion error for ${file.name}:`, err);
//         conversionErrors.push(`Failed to convert "${file.name}": ${err.message}`);
//         newConvertedImages.push({
//           id: file.name + Date.now(),
//           name: file.name.split('.').slice(0, -1).join('.'),
//           url: null,
//           outputFormat: outputFormat,
//           error: err.message,
//         });
//       }
//     }

//     setConvertedImages(newConvertedImages);
//     setLoading(false);

//     if (conversionErrors.length > 0) {
//       const errorMessage = `Some conversions failed: ${conversionErrors.join('; ')}`;
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } else {
//       toast.success(`Successfully converted ${selectedFiles.length} image(s)!`);
//     }
//   };

//   const handleDownloadAllAsZip = async () => {
//     if (convertedImages.length === 0) {
//       toast.error('No images have been converted yet to download.');
//       return;
//     }

//     setIsZipping(true);
//     setError(null);
//     toast.dismiss();
//     const zip = new JSZip();
//     let zipErrors = [];
//     let successfulZipCount = 0;

//     const zipPromise = new Promise(async (resolve, reject) => {
//       for (const img of convertedImages) {
//         if (img.url) {
//           try {
//             const response = await fetch(img.url);
//             const blob = await response.blob();
//             zip.file(`${img.name}.${img.outputFormat}`, blob);
//             successfulZipCount++;
//           } catch (fetchError) {
//             console.error(`Failed to fetch ${img.name} for zipping:`, fetchError);
//             zipErrors.push(`Failed to add "${img.name}" to zip.`);
//           }
//         }
//       }

//       try {
//         const content = await zip.generateAsync({ type: "blob" });
//         saveAs(content, "converted_images.zip");
//         resolve();
//       } catch (zipError) {
//         console.error('Failed to generate zip file:', zipError);
//         zipErrors.push(`Failed to generate the zip file: ${zipError.message}`);
//         reject(zipError);
//       }
//     });

//     toast.promise(
//       zipPromise,
//       {
//         pending: 'Preparing ZIP file...',
//         success: {
//           render: () => {
//             return `Successfully zipped ${successfulZipCount} image(s)!`;
//           },
//         },
//         error: {
//           render: () => {
//             const msg = zipErrors.length > 0
//               ? `Failed to create ZIP: ${zipErrors.join('; ')}`
//               : 'Failed to create ZIP file.';
//             setError(msg);
//             return msg;
//           },
//         }
//       }
//     ).finally(() => {
//       setIsZipping(false);
//     });
//   };

//   const handleDownloadAllIndividual = async () => {
//     if (convertedImages.length === 0) {
//       toast.error('No images have been converted yet to download.');
//       return;
//     }

//     setIsDownloadingAll(true);
//     setError(null);
//     toast.dismiss();

//     let downloadInitiatedCount = 0;
//     let downloadErrors = [];

//     const imagesToDownload = convertedImages.filter(img => img.url);

//     const downloadPromise = new Promise(async (resolve, reject) => {
//       for (const img of imagesToDownload) {
//         try {
//           const link = document.createElement('a');
//           link.href = img.url;
//           link.download = `${img.name}.${img.outputFormat}`;
//           document.body.appendChild(link);
//           link.click();
//           document.body.removeChild(link);
//           downloadInitiatedCount++;

//           await new Promise(res => setTimeout(res, 300));
//         } catch (err) {
//           console.error(`Failed to initiate download for ${img.name} individually:`, err);
//           downloadErrors.push(`Failed to initiate download for "${img.name}".`);
//         }
//       }

//       if (imagesToDownload.length > 0 && downloadInitiatedCount === imagesToDownload.length) {
//         resolve();
//       } else if (downloadErrors.length > 0) {
//         reject(new Error(`Some downloads could not be initiated: ${downloadErrors.join('; ')}`));
//       } else {
//         reject(new Error('No images were available to download, or an unexpected error occurred.'));
//       }
//     });

//     toast.promise(
//       downloadPromise,
//       {
//         pending: 'Initiating individual downloads...',
//         success: {
//           render: () => {
//             return `All ${downloadInitiatedCount} images initiated for download successfully!`;
//           },
//         },
//         error: {
//           render: ({ data }) => {
//             setError(data.message);
//             return `Download issues: ${data.message}. Please check for browser pop-up blockers or network issues.`;
//           },
//         }
//       }
//     ).finally(() => {
//       setIsDownloadingAll(false);
//     });
//   };

//   useEffect(() => {
//     return () => {
//       previewUrls.forEach(url => URL.revokeObjectURL(url));
//       convertedImages.forEach(img => {
//         if (img.url) URL.revokeObjectURL(img.url);
//       });
//     };
//   }, [previewUrls, convertedImages]);

//   // Function to push the adsbygoogle array and trigger ad loading
//   useEffect(() => {
//     try {
//       if (typeof window !== 'undefined' && window.adsbygoogle) {
//         // Push an empty array to trigger new ad unit rendering
//         (window.adsbygoogle = window.adsbygoogle || []).push({});
//       }
//     } catch (error) {
//       console.error("AdSense script not loaded or error encountered:", error);
//     }
//   }, [loading, convertedImages]); // Trigger when main content changes

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
//       {/* <ToastContainer
//         position="bottom-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="dark"
//       /> */}

//       {/* Main container for ads and content */}
//       <div className="flex flex-col md:flex-row justify-center items-start w-full max-w-screen-xl gap-4 md:gap-8">

//         {/* Left Ad Section */}
//         <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500">
//             <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//             {/* AdSense Unit 1: Left Skyscraper/Vertical Ad */}
//             <ins className="adsbygoogle"
//                 style={{ display: 'block', width: '100%', minHeight: '300px' }} // Tailwind will handle exact width, min-height for visibility
//                 data-ad-client="ca-pub-7000000000000000" // TEST PUBLISHER ID
//                 data-ad-slot="1234567890" // TEST SLOT ID for a responsive ad
//                 data-ad-format="auto"
//                 data-full-width-responsive="true"></ins>
//           </div>
//           {/* Optional: Add another ad unit below the first one if desired */}
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4">
//             <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//             {/* AdSense Unit 2: Left Medium Rectangle */}
//             <ins className="adsbygoogle"
//                 style={{ display: 'block', width: '100%', minHeight: '250px' }} // Tailwind will handle exact width, min-height for visibility
//                 data-ad-client="ca-pub-7000000000000000" // TEST PUBLISHER ID
//                 data-ad-slot="0987654321" // TEST SLOT ID for a responsive ad
//                 data-ad-format="auto"
//                 data-full-width-responsive="true"></ins>
//           </div>
//         </div>

//         {/* Main Content Section */}
//         <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full md:w-3/5 lg:w-2/3 text-center flex-grow">
//           <h1 className="text-4xl font-bold mb-6 text-purple-400">Image Converter</h1>

//           <div className="mb-6">
//             <input
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={handleFileChange}
//               ref={fileInputRef}
//               className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 cursor-pointer"
//             />
//             {selectedFiles.length > 0 && (
//               <p className="text-sm text-gray-400 mt-2">
//                 Selected {selectedFiles.length} file(s). (Max: {MAX_FILES} files, {MAX_FILE_SIZE_MB}MB each)
//               </p>
//             )}
//           </div>

//           {previewUrls.length > 0 && (
//             <div className="mb-6 border border-gray-700 rounded-md p-2">
//               <h2 className="text-xl font-semibold mb-3">{previewUrls.length === 1 ? 'Preview:' : 'Previews:'}</h2>
//               {selectedFiles.length === 1 ? (
//                 <div className="flex justify-center items-center h-48 sm:h-64">
//                   <img
//                     src={previewUrls[0]}
//                     alt={`Preview 1`}
//                     className="max-w-full max-h-full object-contain border border-gray-600 rounded-md"
//                   />
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
//                   {previewUrls.map((url, index) => (
//                     <div
//                       key={index}
//                       className="relative w-full pb-[100%] border border-gray-600 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center"
//                     >
//                       <img
//                         src={url}
//                         alt={`Preview ${index + 1}`}
//                         className="absolute top-0 left-0 w-full h-full object-cover"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           <div className="mb-6 flex flex-col sm:flex-row justify-center items-center gap-4">
//             <label htmlFor="format-select" className="text-lg">Convert all to:</label>
//             <select
//               id="format-select"
//               value={outputFormat}
//               onChange={(e) => setOutputFormat(e.target.value)}
//               className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
//             >
//               {formatOptions.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <button
//             onClick={handleConvert}
//             disabled={loading || selectedFiles.length === 0}
//             className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto cursor-pointer"
//           >
//             {loading ? (
//               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//             ) : 'Convert All Images'}
//           </button>

//           {error && (
//             <p className="text-red-500 mt-4 text-sm">{error}</p>
//           )}

//           {convertedImages.length > 0 && (
//             <div className="mt-6 border border-gray-700 rounded-md p-4">
//               <h2 className="text-xl font-semibold mb-3">{convertedImages.length > 1 && 'Converted Images:'}</h2>

//               {convertedImages.length === 1 && convertedImages[0].url ? (
//                 <div className="flex flex-col items-center gap-4">
//                   {convertedImages[0].url && (
//                     <div className="relative w-24 h-24 border border-gray-600 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
//                       {/* Conditional rendering for preview based on format */}
//                       {['jpeg', 'png', 'webp', 'gif'].includes(convertedImages[0].outputFormat) ? (
//                         <img
//                           src={convertedImages[0].url}
//                           alt={convertedImages[0].name}
//                           className="absolute top-0 left-0 w-full h-full object-cover"
//                         />
//                       ) : (
//                         <p className="text-sm text-gray-400 text-center p-2">No preview for {convertedImages[0].outputFormat.toUpperCase()}</p>
//                       )}
//                     </div>
//                   )}
//                   <p className="text-sm text-gray-300 mb-2">{convertedImages[0].name}.{convertedImages[0].outputFormat}</p>
//                   <a
//                     href={convertedImages[0].url}
//                     download={`${convertedImages[0].name}.${convertedImages[0].outputFormat}`}
//                     className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Download Image
//                   </a>
//                 </div>
//               ) : (
//                 <>
//                   <div className="flex flex-col gap-2 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
//                     {convertedImages.map((img) => (
//                       <div key={img.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
//                         {img.url && (
//                           <div className="relative w-12 h-12 border border-gray-600 rounded-md overflow-hidden bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
//                             {/* Conditional rendering for preview based on format */}
//                             {['jpeg', 'png', 'webp', 'gif'].includes(img.outputFormat) ? (
//                               <img
//                                 src={img.url}
//                                 alt={`Converted ${img.name}`}
//                                 className="absolute top-0 left-0 w-full h-full object-cover"
//                               />
//                             ) : (
//                               <p className="text-xs text-gray-400 text-center p-1">No preview</p>
//                             )}
//                           </div>
//                         )}
//                         <span className="text-left text-sm flex-grow">
//                           {img.name}.{img.outputFormat}
//                           {img.error && <span className="text-red-400 ml-2">(Error: {img.error})</span>}
//                         </span>
//                         {img.url && (
//                           <a
//                             href={img.url}
//                             download={`${img.name}.${img.outputFormat}`}
//                             className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md transition duration-300 ease-in-out flex-shrink-0"
//                           >
//                             Download
//                           </a>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   {convertedImages.filter(img => img.url).length > 0 && (
//                     <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
//                       {convertedImages.filter(img => img.url).length > 1 && (
//                         <button
//                           onClick={handleDownloadAllAsZip}
//                           disabled={isZipping || isDownloadingAll}
//                           className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//                         >
//                           {isZipping ? (
//                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                             </svg>
//                           ) : 'Download All as ZIP'}
//                         </button>
//                       )}

//                       <button
//                         onClick={handleDownloadAllIndividual}
//                         disabled={isDownloadingAll || isZipping}
//                         className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//                       >
//                         {isDownloadingAll ? (
//                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                           </svg>
//                         ) : 'Download All Individually'}
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Right Ad Section */}
//         <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
//           <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500">
//             <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//             {/* AdSense Unit 3: Right Skyscraper/Vertical Ad */}
//             <ins className="adsbygoogle"
//                 style={{ display: 'block', width: '100%', minHeight: '300px' }}
//                 data-ad-client="ca-pub-7000000000000000" // TEST PUBLISHER ID
//                 data-ad-slot="2345678901" // TEST SLOT ID for a responsive ad
//                 data-ad-format="auto"
//                 data-full-width-responsive="true"></ins>
//           </div>
//            {/* Optional: Add another ad unit below the first one if desired */}
//            <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4">
//             <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//             {/* AdSense Unit 4: Right Medium Rectangle */}
//             <ins className="adsbygoogle"
//                 style={{ display: 'block', width: '100%', minHeight: '250px' }}
//                 data-ad-client="ca-pub-7000000000000000" // TEST PUBLISHER ID
//                 data-ad-slot="3456789012" // TEST SLOT ID for a responsive ad
//                 data-ad-format="auto"
//                 data-full-width-responsive="true"></ins>
//           </div>
//         </div>
//       </div>

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


// document-pro/src/app/page.jsx
// 'use client';

// import Link from 'next/link';
// import { useEffect } from 'react';

// export default function HomePage() {
//   // AdSense push for dynamic loading (for the root page if it has ads)
//   // Or remove this useEffect if the root page won't have ads, and MainLayout handles it.
//   // For a simple navigation page, ads might not be necessary.
//   useEffect(() => {
//     try {
//       if (typeof window !== 'undefined' && window.adsbygoogle) {
//         (window.adsbygoogle = window.adsbygoogle || []).push({});
//       }
//     } catch (error) {
//       console.error('AdSense script not loaded or error encountered:', error);
//     }
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
//       <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-2xl w-full">
//         <h1 className="text-5xl font-bold mb-8 text-purple-400">
//           Welcome to Tool Hub!
//         </h1>
//         <p className="text-lg text-gray-300 mb-10">
//           Your one-stop shop for various document and image manipulation tools.
//         </p>

//         <div className="flex flex-col gap-6">
//           <Link href="/tools/document-converter" passHref>
//             <button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-6 rounded-lg text-xl transition duration-300 ease-in-out shadow-md cursor-pointer">
//               Document & Image Tools
//             </button>
//           </Link>
//           <Link href="/tools/image-converter" passHref>
//             <button className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-6 rounded-lg text-xl transition duration-300 ease-in-out shadow-md cursor-pointer">
//               Image Converter
//             </button>
//           </Link>
//           {/* Add more tool links here as you create new pages */}
//           {/*
//           <Link href="/another-tool" passHref>
//             <button className="w-full bg-yellow-700 hover:bg-yellow-800 text-white font-bold py-4 px-6 rounded-lg text-xl transition duration-300 ease-in-out shadow-md">
//               Another Awesome Tool
//             </button>
//           </Link>
//           */}
//         </div>

//         {/* Optional AdSense unit for the home page */}
//         <div className="mt-10 p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500">
//           <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//           <ins className="adsbygoogle"
//             style={{ display: 'block', width: '100%', minHeight: '200px' }}
//             data-ad-client="ca-pub-7000000000000000" // TEST PUBLISHER ID
//             data-ad-slot="4567890123" // TEST SLOT ID for a responsive ad
//             data-ad-format="auto"
//             data-full-width-responsive="true"></ins>
//         </div>
//       </div>
//     </div>
//   );
// }


'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import toolsData from '../data/tools.json'; // Import your tools data

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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-4xl w-full"> {/* Increased max-w for cards */}
        <h1 className="text-5xl font-bold mb-8 text-purple-400">
          Welcome to Tool Hub!
        </h1>
        <p className="text-lg text-gray-300 mb-10">
          Your one-stop shop for various document and image manipulation tools.
        </p>

        {/* Dynamic Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {toolsData.map((tool) => (
            <Link key={tool.path} href={tool.path} passHref>
              <div className="flex items-center bg-gray-700 p-6 rounded-lg shadow-md hover:bg-gray-600 transition duration-300 ease-in-out cursor-pointer h-full">
                <div className="text-5xl mr-4 flex-shrink-0">
                  {tool.icon} {/* Tool Icon */}
                </div>
                <div className="text-left flex-grow">
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
    </div>
  );
}
