
// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import JSZip from 'jszip';
// import { saveAs } from 'file-saver';
// import { toast } from 'react-toastify';
// import MainLayout from '@/components/MainLayout';
// import ActionButton from '@/components/ActionButton';
// import { useSession } from 'next-auth/react'; // Import useSession

// export default function ImageConverter() {
//   const { data: session, status, update } = useSession(); // Get session data and update function

//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [previewUrls, setPreviewUrls] = useState([]);
//   const [outputFormat, setOutputFormat] = useState('jpeg');
//   const [convertedImages, setConvertedImages] = useState([]);
//   const [loading, setLoading] = useState(false); // This loading state is for the conversion process
//   const [error, setError] = useState(null);
//   const [isZipping, setIsZipping] = useState(false);
//   const [isDownloadingAll, setIsDownloadingAll] = useState(false);
//   const fileInputRef = useRef(null);

//   const MAX_FILES = 100;
//   const MAX_FILE_SIZE_MB = 10;
//   const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

//   const formatOptions = [
//     { value: 'jpeg', label: 'JPEG' },
//     { value: 'png', label: 'PNG' },
//     { value: 'webp', label: 'WebP' },
//     { value: 'avif', label: 'AVIF' },
//     { value: 'tiff', label: 'TIFF' },
//     { value: 'raw', label: 'RAW (Uncompressed)' },
//     { value: 'gif', label: 'GIF' }, // Ensure GIF is here if your backend supports it
//   ];

//   // Token state derived directly from session
//   const tokensUsed = session?.user?.tokensUsed || 0;
//   const maxTokens = session?.user?.maxTokens || 20;
//   const isSubscriber = session?.user?.isSubscriber || false;
//   const isLoadingTokens = status === 'loading'; // Token loading status is now session loading status

//   const handleFileChange = (event) => {
//     const files = Array.from(event.target.files);
//     let validFiles = [];
//     let fileErrors = [];

//     if (files.length > MAX_FILES) {
//       toast.error(`Please select a maximum of ${MAX_FILES} files.`);
//       event.target.value = null;
//       return;
//     }

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

//     if (selectedFiles.length > MAX_FILES) {
//       toast.error(`You can only convert up to ${MAX_FILES} files at once.`);
//       setLoading(false);
//       return;
//     }

//     setLoading(true); // Start loading for the API request
//     setError(null);
//     setConvertedImages([]);
//     toast.dismiss();

//     const formData = new FormData();
//     selectedFiles.forEach(file => {
//       formData.append('images', file);
//     });
//     formData.append('format', outputFormat);
//     formData.append('maxFileSize', MAX_FILE_SIZE_MB.toString()); // Send MB, backend converts to bytes

//     try {
//       const response = await fetch('/api/convert/convert-image', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         let errorData = {};
//         try {
//           const responseText = await response.text();
//           errorData = responseText ? JSON.parse(responseText) : {};
//         } catch (jsonParseError) {
//           console.error('Failed to parse error response as JSON:', jsonParseError);
//           errorData.error = `Server returned a non-JSON error or empty response. Status: ${response.status}`;
//         }
//         throw new Error(errorData.error || `Failed to convert images. Server status: ${response.status}`);
//       }

//       const result = await response.json();
//       const newConvertedImages = result.convertedImages.map(img => ({
//         id: img.fileName + Date.now() + Math.random(),
//         name: img.fileName,
//         url: img.data ? `data:${img.mimeType};base64,${img.data}` : null,
//         outputFormat: img.outputFormat,
//         error: img.error || null,
//       }));

//       setConvertedImages(newConvertedImages);

//       const successfulConversions = newConvertedImages.filter((img) => img.url).length;
//       if (successfulConversions > 0) {
//         toast.success(`Successfully converted ${successfulConversions} image(s) to ${outputFormat.toUpperCase()}!`);
//       } else {
//         toast.error('No images could be converted. Please check file types and try again.');
//       }

//       // Dispatch custom event to update tokens in Navbar and ActionButton
//       // This is still useful for immediate UI feedback before session refresh
//       if (typeof window !== 'undefined') {
//         window.dispatchEvent(new CustomEvent('tokensUpdated', {
//           detail: {
//             tokensUsed: result.tokensUsed,
//             maxTokens: result.maxTokens,
//             isSubscriber: result.isSubscriber,
//           }
//         }));
//       }

//       // Force a session update after conversion to get the latest token data
//       // This is crucial for consistency across all components relying on useSession
//       update();

//     } catch (err) {
//       console.error('Conversion error:', err);
//       // let errorMessage = `An unexpected error occurred: ${err.message}`;
//       let errorMessage = err.message

//       if (err.message.includes('Body exceeded')) {
//         errorMessage = `Request body too large. Please try fewer or smaller files.`;
//       }
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false); // End loading
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
//           render: ({ data }) => {
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
//     <MainLayout title="Image Converter">
//       <div className="mb-6">
//         <input
//           type="file"
//           accept="image/*"
//           multiple
//           onChange={handleFileChange}
//           ref={fileInputRef}
//           className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 cursor-pointer"
//         />
//         {selectedFiles.length > 0 && (
//           <p className="text-sm text-gray-400 mt-2">
//             Selected {selectedFiles.length} file(s). (Max: {MAX_FILES} files, {MAX_FILE_SIZE_MB}MB each)
//           </p>
//         )}
//       </div>

//       {previewUrls.length > 0 && (
//         <div className="mb-6 border border-gray-700 rounded-md p-2">
//           <h2 className="text-xl font-semibold mb-3">{previewUrls.length === 1 ? 'Preview:' : 'Previews:'}</h2>
//           {selectedFiles.length === 1 ? (
//             <div className="flex justify-center items-center h-48 sm:h-64">
//               <img
//                 src={previewUrls[0]}
//                 alt={`Preview 1`}
//                 className="max-w-full max-h-full object-contain border border-gray-600 rounded-md"
//               />
//             </div>
//           ) : (
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
//               {previewUrls.map((url, index) => (
//                 <div
//                   key={index}
//                   className="relative w-full pb-[100%] border border-gray-600 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center"
//                 >
//                   <img
//                     src={url}
//                     alt={`Preview ${index + 1}`}
//                     className="absolute top-0 left-0 w-full h-full object-cover"
//                   />
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       <div className="mb-6 flex flex-col sm:flex-row justify-center items-center gap-4">
//         <label htmlFor="format-select" className="text-lg">Convert all to:</label>
//         <select
//           id="format-select"
//           value={outputFormat}
//           onChange={(e) => setOutputFormat(e.target.value)}
//           className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
//         >
//           {formatOptions.map((option) => (
//             <option key={option.value} value={option.value}>
//               {option.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Use the new ActionButton component here */}
//       <ActionButton
//         onClick={handleConvert}
//         loading={loading}
//         cost={selectedFiles.length} // Cost is the number of selected files
//         buttonText="Convert All Images"
//         disabled={selectedFiles.length === 0} // Disable if no files are selected
//         tokensUsed={tokensUsed} // Pass tokensUsed from session
//         maxTokens={maxTokens}   // Pass maxTokens from session
//         isSubscriber={isSubscriber} // Pass isSubscriber from session
//         isLoadingTokens={isLoadingTokens} // Pass session loading status
//       />

//       {error && (
//         <p className="text-red-500 mt-4 text-sm">{error}</p>
//       )}

//       {convertedImages.length > 0 && (
//         <div className="mt-6 border border-gray-700 rounded-md p-4">
//           <h2 className="text-xl font-semibold mb-3">{convertedImages.length > 1 && 'Converted Images:'}</h2>

//           {convertedImages.length === 1 && convertedImages[0].url ? (
//             <div className="flex flex-col items-center gap-4">
//               {convertedImages[0].url && (
//                 <div className="relative w-24 h-24 border border-gray-600 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
//                   {/* Conditional rendering for preview based on format */}
//                   {['jpeg', 'png', 'webp', 'gif'].includes(convertedImages[0].outputFormat) ? (
//                     <img
//                       src={convertedImages[0].url}
//                       alt={convertedImages[0].name}
//                       className="absolute top-0 left-0 w-full h-full object-cover"
//                     />
//                   ) : (
//                     <p className="text-sm text-gray-400 text-center p-2">No preview for {convertedImages[0].outputFormat.toUpperCase()}</p>
//                   )}
//                 </div>
//               )}
//               <p className="text-sm text-gray-300 mb-2">{convertedImages[0].name}.{convertedImages[0].outputFormat}</p>
//               <a
//                 href={convertedImages[0].url}
//                 download={`${convertedImages[0].name}.${convertedImages[0].outputFormat}`}
//                 className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Download Image
//               </a>
//             </div>
//           ) : (
//             <>
//               <div className="flex flex-col gap-2 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
//                 {convertedImages.map((img) => (
//                   <div key={img.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
//                     {img.url && (
//                       <div className="relative w-12 h-12 border border-gray-600 rounded-md overflow-hidden bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
//                         {/* Conditional rendering for preview based on format */}
//                         {['jpeg', 'png', 'webp', 'gif'].includes(img.outputFormat) ? (
//                           <img
//                             src={img.url}
//                             alt={`Converted ${img.name}`}
//                             className="absolute top-0 left-0 w-full h-full object-cover"
//                           />
//                         ) : (
//                           <p className="text-xs text-gray-400 text-center p-1">No preview</p>
//                         )}
//                       </div>
//                     )}
//                     <span className="text-left text-sm flex-grow">
//                       {img.name}.{img.outputFormat}
//                       {img.error && <span className="text-red-400 ml-2">(Error: {img.error})</span>}
//                     </span>
//                     {img.url && (
//                       <a
//                         href={img.url}
//                         download={`${img.name}.${img.outputFormat}`}
//                         className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md transition duration-300 ease-in-out flex-shrink-0"
//                       >
//                         Download
//                       </a>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               {convertedImages.filter(img => img.url).length > 0 && (
//                 <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
//                   {convertedImages.filter(img => img.url).length > 1 && (
//                     <button
//                       onClick={handleDownloadAllAsZip}
//                       disabled={isZipping || isDownloadingAll}
//                       className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//                     >
//                       {isZipping ? (
//                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                       ) : 'Download All as ZIP'}
//                     </button>
//                   )}

//                   <button
//                     onClick={handleDownloadAllIndividual}
//                     disabled={isDownloadingAll || isZipping}
//                     className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//                   >
//                     {isDownloadingAll ? (
//                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                     ) : 'Download All Individually'}
//                   </button>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       )}
//     </MainLayout>
//   );
// }


'use client';

import { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import ActionButton from '@/components/ActionButton';
import { useSession } from 'next-auth/react';

export default function ImageConverter() {
  const { data: session, status, update } = useSession();
  const tokensUsed = session?.user?.tokensUsed ?? 0;
  const maxTokens = session?.user?.maxTokens ?? 20;
  const unlimitedTokens = maxTokens === Infinity;
  const isLoadingTokens = status === 'loading';

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [outputFormat, setOutputFormat] = useState('jpeg');
  const [convertedImages, setConvertedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isZipping, setIsZipping] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILES = 100;
  const MAX_FILE_SIZE_MB = 10;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const formatOptions = [
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WebP' },
    { value: 'avif', label: 'AVIF' },
    { value: 'tiff', label: 'TIFF' },
    { value: 'raw', label: 'RAW (Uncompressed)' },
    { value: 'gif', label: 'GIF' }, 
  ];

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > MAX_FILES) {
      toast.error(`Please select a maximum of ${MAX_FILES} files.`);
      event.target.value = null;
      return;
    }
    const valid = files.filter((f) => f.size <= MAX_FILE_SIZE_BYTES);
    const tooBig = files.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (tooBig.length) {
      toast.error(
        tooBig
          .map((f) => `${f.name} (${(f.size / (1024 * 1024)).toFixed(2)} MB)`)
          .join(', ') + ` exceed ${MAX_FILE_SIZE_MB}MB limit.`
      );
    }
    setSelectedFiles(valid);
    setPreviewUrls(valid.map((file) => URL.createObjectURL(file)));
    setConvertedImages([]);
    setError(null);
    toast.dismiss();
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image file.');
      return;
    }
    setLoading(true);
    setError(null);
    setConvertedImages([]);
    toast.dismiss();

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('images', file));
    formData.append('format', outputFormat);
    formData.append('maxFileSize', MAX_FILE_SIZE_MB.toString());

    try {
      const response = await fetch('/api/convert/convert-image', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        const msg = data.error || 'Daily token limit reached.';
        setError(msg);
        toast.error(msg);
        await update();
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const msg = data.error || `Server status ${response.status}`;
        throw new Error(msg);
      }

      const result = await response.json();
      const newImgs = result.convertedImages.map((img) => ({
        id: img.fileName + Date.now(),
        name: img.fileName,
        url: img.data ? `data:${img.mimeType};base64,${img.data}` : null,
        outputFormat: img.outputFormat,
        error: img.error || null,
      }));
      setConvertedImages(newImgs);

      const successCount = newImgs.filter((i) => i.url).length;
      successCount
        ? toast.success(`Successfully converted ${successCount} image(s)!`)
        : toast.error('No images could be converted.');

      window.dispatchEvent(
        new CustomEvent('tokensUpdated', {
          detail: {
            tokensUsed: result.tokensUsed,
            maxTokens: result.maxTokens,
            unlimitedAccessUntil: result.unlimitedAccessUntil,
          },
        })
      );
      await update();
    } catch (err) {
      console.error(err);
      const msg = err.message.includes('Body exceeded')
        ? 'Please upload fewer or smaller files.'
        : err.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAllAsZip = async () => {
    if (convertedImages.length === 0) {
      toast.error('No images have been converted yet to download.');
      return;
    }
    setIsZipping(true);
    const zip = new JSZip();
    let successCount = 0;
    for (const img of convertedImages) {
      if (!img.url) continue;
      try {
        const resp = await fetch(img.url);
        const blob = await resp.blob();
        zip.file(`${img.name}.${img.outputFormat}`, blob);
        successCount++;
      } catch (err) {
        console.error(`Failed to add ${img.name} to zip`, err);
      }
    }
    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, 'converted_images.zip');
      toast.success(`Zipped ${successCount} image(s)!`);
    } catch (err) {
      toast.error('Failed to generate ZIP.');
    }
    setIsZipping(false);
  };

  const handleDownloadAllIndividual = () => {
    if (convertedImages.length === 0) {
      toast.error('No images have been converted yet to download.');
      return;
    }
    setIsDownloadingAll(true);
    let count = 0;
    for (const img of convertedImages) {
      if (!img.url) continue;
      const link = document.createElement('a');
      link.href = img.url;
      link.download = `${img.name}.${img.outputFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      count++;
    }
    toast.success(`Initiated ${count} download(s).`);
    setIsDownloadingAll(false);
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      convertedImages.forEach((img) => {
        if (img.url) URL.revokeObjectURL(img.url);
      });
    };
  }, [previewUrls, convertedImages]);

  return (
    <MainLayout title="Image Converter">
      <div className="mb-6">
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 cursor-pointer"
        />
        {selectedFiles.length > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            Selected {selectedFiles.length} file(s). (Max {MAX_FILES} files, {MAX_FILE_SIZE_MB}MB each)
          </p>
        )}
      </div>

      {previewUrls.length > 0 && (
        <div className="mb-6 border border-gray-700 rounded-md p-2">
          <h2 className="text-xl font-semibold mb-3">{previewUrls.length === 1 ? 'Preview:' : 'Previews:'}</h2>
          {selectedFiles.length === 1 ? (
            <div className="flex justify-center items-center h-48 sm:h-64">
              <img src={previewUrls[0]} alt="Preview" className="max-w-full max-h-full object-contain border border-gray-600 rounded-md" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
              {previewUrls.map((url, i) => (
                <div key={i} className="relative w-full pb-[100%] border border-gray-600 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
                  <img src={url} alt={`Preview ${i + 1}`} className="absolute top-0 left-0 w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row justify-center items-center gap-4">
        <label htmlFor="format-select" className="text-lg">Convert all to:</label>
        <select
          id="format-select"
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {formatOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <ActionButton
        onClick={handleConvert}
        loading={loading}
        cost={selectedFiles.length}
        buttonText="Convert All Images"
        disabled={selectedFiles.length === 0}
        tokensUsed={tokensUsed}
        maxTokens={maxTokens}
        isSubscriber={unlimitedTokens}
        isLoadingTokens={isLoadingTokens}
      />

      {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

      {convertedImages.length > 0 && (
        <div className="mt-6 border border-gray-700 rounded-md p-4">
          <h2 className="text-xl font-semibold mb-3">{convertedImages.length > 1 ? 'Converted Images:' : 'Converted Image:'}</h2>
          {convertedImages.length === 1 && convertedImages[0].url ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 border border-gray-600 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
                {['jpeg', 'png', 'webp', 'gif'].includes(convertedImages[0].outputFormat) ? (
                  <img
                    src={convertedImages[0].url}
                    alt={convertedImages[0].name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-sm text-gray-400 text-center p-2">
                    No preview for {convertedImages[0].outputFormat.toUpperCase()}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-300 mb-2">
                {convertedImages[0].name}.{convertedImages[0].outputFormat}
              </p>
              <a
                href={convertedImages[0].url}
                download={`${convertedImages[0].name}.${convertedImages[0].outputFormat}`}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg text-lg"
              >
                Download Image
              </a>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                {convertedImages.map((img) => (
                  <div key={img.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                    {img.url && (
                      <div className="relative w-12 h-12 border border-gray-600 rounded-md overflow-hidden bg-gray-800 mr-3">
                        {['jpeg', 'png', 'webp', 'gif'].includes(img.outputFormat) ? (
                          <img src={img.url} alt={`Converted ${img.name}`} className="absolute top-0 left-0 w-full h-full object-cover" />
                        ) : (
                          <p className="text-xs text-gray-400 text-center p-1">No preview</p>
                        )}
                      </div>
                    )}
                    <span className="text-left text-sm flex-grow">
                      {img.name}.{img.outputFormat}
                      {img.error && <span className="text-red-400 ml-2">(Error: {img.error})</span>}
                    </span>
                    {img.url && (
                      <a
                        href={img.url}
                        download={`${img.name}.${img.outputFormat}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md"
                      >
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
              {convertedImages.filter((i) => i.url).length > 0 && (
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                  {convertedImages.filter((i) => i.url).length > 1 && (
                    <button
                      onClick={handleDownloadAllAsZip}
                      disabled={isZipping || isDownloadingAll}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg"
                    >
                      {isZipping ? 'Zipping...' : 'Download All as ZIP'}
                    </button>
                  )}
                  <button
                    onClick={handleDownloadAllIndividual}
                    disabled={isDownloadingAll || isZipping}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg"
                  >
                    {isDownloadingAll ? 'Downloading...' : 'Download All Individually'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </MainLayout>
  );
}
