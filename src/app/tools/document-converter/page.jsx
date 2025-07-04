// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import JSZip from 'jszip';
// import { saveAs } from 'file-saver';
// import axios from 'axios'; // Import Axios



// export default function DocumentToolsPage() {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [extractedImages, setExtractedImages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [convertedPdfUrl, setConvertedPdfUrl] = useState(null);
//   const fileInputRef = useRef(null);

//   const MAX_FILE_SIZE_MB = 20; // Increased limit for documents
//   const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

//   const handleFileChange = (event) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       if (file.size > MAX_FILE_SIZE_BYTES) {
//         toast.error(
//           `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the ${MAX_FILE_SIZE_MB}MB limit.`
//         );
//         setSelectedFile(null);
//         if (fileInputRef.current) {
//           fileInputRef.current.value = ''; // Clear input
//         }
//       } else {
//         setSelectedFile(file);
//         setExtractedImages([]);
//         setConvertedPdfUrl(null);
//         setError(null);
//         toast.dismiss();
//       }
//     }
//   };

//   const handleExtractImages = async () => {
//     if (!selectedFile) {
//       toast.error('Please select a DOCX or PDF file to extract images from.');
//       return;
//     }

//     const fileType = selectedFile.type;
//     if (
//       ![
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         'application/pdf',
//       ].includes(fileType)
//     ) {
//       toast.error('Please select a valid DOCX or PDF file.');
//       return;
//     }

//     setLoading(true);
//     setExtractedImages([]);
//     setError(null);
//     toast.dismiss();

//     const formData = new FormData();
//     formData.append('document', selectedFile); // Key matches Next.js API route's expectation

//     try {
//       // Calling the local Next.js API route
//       const response = await axios.post('/api/convert/convert-doc/extract-images-from-docx', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         responseType: 'json', // Expect JSON response from Next.js API
//       });

//       const result = response.data; // Data is directly available from Axios response
//       if (result.images && result.images.length > 0) {
//         setExtractedImages(
//           result.images.map((img, index) => ({
//             id: `extracted-img-${index}-${Date.now()}`,
//             name: `extracted_image_${index + 1}`,
//             url: `data:${img.mimeType};base64,${img.data}`,
//             mimeType: img.mimeType,
//             originalFileName: selectedFile.name,
//           }))
//         );
//         toast.success(`Successfully extracted ${result.images.length} image(s)!`);
//       } else {
//         toast.info('No images found in the document.');
//       }
//     } catch (err) {
//       console.error('Image extraction error:', err);
//       let errorMessage = 'An unknown error occurred during image extraction.';
//       if (axios.isAxiosError(err) && err.response) {
//         // Next.js API route returns JSON errors
//         try {
//           errorMessage = err.response.data.error || `Server error: ${err.response.status}`;
//         } catch (jsonParseError) {
//           errorMessage = `Server error: ${err.response.status}. Details: ${err.response.data}`;
//         }
//         setError(`Failed to extract images: ${errorMessage}`);
//         toast.error(`Error extracting images: ${errorMessage}`);
//       } else if (err.request) {
//         errorMessage = 'No response from server for image extraction. Check network connection.';
//         setError(`Failed to extract images: ${errorMessage}`);
//         toast.error(`Error extracting images: ${errorMessage}`);
//       } else {
//         errorMessage = err.message;
//         setError(`Failed to extract images: ${errorMessage}`);
//         toast.error(`Error extracting images: ${errorMessage}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDocxToPdf = async () => {
//     if (!selectedFile) {
//       toast.error('Please select a DOCX file to convert to PDF.');
//       return;
//     }

//     if (
//       selectedFile.type !==
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//     ) {
//       toast.error('Please select a valid DOCX file for PDF conversion.');
//       return;
//     }

//     setLoading(true);
//     setConvertedPdfUrl(null);
//     setError(null);
//     toast.dismiss();

//     const formData = new FormData();
//     formData.append('file', selectedFile); // Key matches Next.js API route's expectation

//     try {
//       // Calling the local Next.js API route
//       const response = await axios.post('/api/convert/convert-doc/convert-docx-to-pdf', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         responseType: 'blob', // Expect binary response (PDF blob) from Next.js API
//       });

//       const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
//       const url = URL.createObjectURL(pdfBlob);
//       setConvertedPdfUrl(url);
//       toast.success('DOCX converted to PDF successfully!');

//     } catch (err) {
//       console.error('DOCX to PDF conversion error:', err);
//       let errorMessage = 'An unknown error occurred during conversion.';
//       if (axios.isAxiosError(err) && err.response) {
//         // Next.js API route returns JSON errors
//         try {
//           const reader = new FileReader();
//           reader.onload = () => {
//               try {
//                   const errorData = JSON.parse(reader.result);
//                   errorMessage = errorData.error || `Server error: ${err.response.status}`;
//               } catch (jsonParseError) {
//                   errorMessage = `Server error: ${err.response.status}. Details: ${reader.result}`;
//               }
//               setError(`Failed to convert to PDF: ${errorMessage}`);
//               toast.error(`Error converting to PDF: ${errorMessage}`);
//               setLoading(false);
//           };
//           if (err.response.data instanceof Blob) {
//               reader.readAsText(err.response.data);
//           } else {
//               errorMessage = `Server error: ${err.response.status}. Details: ${err.response.data}`;
//               setError(`Failed to convert to PDF: ${errorMessage}`);
//               toast.error(`Error converting to PDF: ${errorMessage}`);
//               setLoading(false);
//           }
//         } catch (outerErr) {
//             errorMessage = `Server error: ${err.response.status}. Details: ${outerErr.message}`;
//             setError(`Failed to convert to PDF: ${errorMessage}`);
//             toast.error(`Error converting to PDF: ${errorMessage}`);
//             setLoading(false);
//         }
//       } else if (err.request) {
//         errorMessage = 'No response from server. Check network connection.';
//         setError(`Failed to convert to PDF: ${errorMessage}`);
//         toast.error(`Error converting to PDF: ${errorMessage}`);
//       } else {
//         errorMessage = err.message;
//         setError(`Failed to convert to PDF: ${errorMessage}`);
//         toast.error(`Error converting to PDF: ${errorMessage}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownloadExtractedImage = (url, name, mimeType) => {
//     saveAs(url, `${name}.${mimeType.split('/')[1]}`);
//     toast.success(`Downloaded ${name}!`);
//   };

//   const handleDownloadAllExtractedImages = async () => {
//     if (extractedImages.length === 0) {
//       toast.error('No images to download.');
//       return;
//     }

//     const zip = new JSZip();
//     let successfulZipCount = 0;

//     const zipPromise = new Promise(async (resolve, reject) => {
//       for (const img of extractedImages) {
//         try {
//           const response = await fetch(img.url);
//           const blob = await response.blob();
//           zip.file(`${img.name}.${img.mimeType.split('/')[1]}`, blob);
//           successfulZipCount++;
//         } catch (fetchError) {
//           console.error(`Failed to add ${img.name} to zip:`, fetchError);
//         }
//       }

//       try {
//         const content = await zip.generateAsync({ type: 'blob' });
//         saveAs(
//           content,
//           `extracted_images_from_${
//             extractedImages[0].originalFileName.split('.')[0]
//           }.zip`
//         );
//         resolve();
//       } catch (zipError) {
//         console.error('Failed to generate zip file:', zipError);
//         reject(zipError);
//       }
//     });

//     toast.promise(zipPromise, {
//       pending: 'Preparing ZIP file...',
//       success: {
//         render: () => `Successfully zipped ${successfulZipCount} image(s)!`,
//       },
//       error: {
//         render: () => 'Failed to create ZIP file.',
//       },
//     });
//   };

//   // Cleanup object URLs when component unmounts or state changes
//   useEffect(() => {
//     return () => {
//       extractedImages.forEach((img) => URL.revokeObjectURL(img.url));
//       if (convertedPdfUrl) {
//         URL.revokeObjectURL(convertedPdfUrl);
//       }
//     };
//   }, [extractedImages, convertedPdfUrl]);

//   // AdSense push for dynamic loading
//   useEffect(() => {
//     try {
//       if (typeof window !== 'undefined' && window.adsbygoogle) {
//         (window.adsbygoogle = window.adsbygoogle || []).push({});
//       }
//     } catch (error) {
//       console.error('AdSense script not loaded or error encountered:', error);
//     }
//   }, [loading, extractedImages, convertedPdfUrl]);

//   return (
//     <div className="flex flex-col md:flex-row justify-center items-start w-full max-w-screen-xl gap-4 md:gap-8 p-4 flex-grow">
//       {/* Left Ad Section */}
//       <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
//         <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500">
//           <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//           <ins
//             className="adsbygoogle"
//             style={{ display: 'block', width: '100%', minHeight: '300px' }}
//             data-ad-client="ca-pub-7000000000000000"
//             data-ad-slot="1234567890"
//             data-ad-format="auto"
//             data-full-width-responsive="true"
//           ></ins>
//         </div>
//         <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4">
//           <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//           <ins
//             className="adsbygoogle"
//             style={{ display: 'block', width: '100%', minHeight: '250px' }}
//             data-ad-client="ca-pub-7000000000000000"
//             data-ad-slot="0987654321"
//             data-ad-format="auto"
//             data-full-width-responsive="true"
//           ></ins>
//         </div>
//       </div>

//       {/* Main Document Converter Content */}
//       <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full text-center flex-grow">
//         <h1 className="text-4xl font-bold mb-6 text-purple-400">
//           Document & Image Tools
//         </h1>

//         <div className="mb-6">
//           <input
//             type="file"
//             accept=".docx,.pdf" // Accept DOCX and PDF files
//             onChange={handleFileChange}
//             ref={fileInputRef}
//             className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 cursor-pointer"
//           />
//           {selectedFile && (
//             <p className="text-sm text-gray-400 mt-2">
//               Selected: {selectedFile.name} (
//               {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
//             </p>
//           )}
//         </div>

//         <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
//           <button
//             onClick={handleExtractImages}
//             disabled={
//               loading ||
//               !selectedFile ||
//               (!selectedFile.type.includes('wordprocessingml.document') &&
//                 !selectedFile.type.includes('application/pdf'))
//             }
//             className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//           >
//             {loading && selectedFile ? (
//               <svg
//                 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//             ) : (
//               'Extract Images'
//             )}
//           </button>

//           <button
//             onClick={handleDocxToPdf}
//             disabled={
//               loading ||
//               !selectedFile ||
//               selectedFile.type !==
//                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//             }
//             className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//           >
//             {loading &&
//             selectedFile &&
//             selectedFile.type ===
//               'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
//               <svg
//                 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//             ) : (
//               'Convert DOCX to PDF'
//             )}
//           </button>
//         </div>

//         {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

//         {convertedPdfUrl && (
//           <div className="mt-6 border border-gray-700 rounded-md p-4">
//             <h2 className="text-xl font-semibold mb-3">Converted PDF:</h2>
//             <a
//               href={convertedPdfUrl}
//               download={`${selectedFile?.name.split('.')[0]}.pdf`}
//               className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out inline-block"
//             >
//               Download Converted PDF
//             </a>
//           </div>
//         )}

//         {extractedImages.length > 0 && (
//           <div className="mt-6 border border-gray-700 rounded-md p-4">
//             <h2 className="text-xl font-semibold mb-3">Extracted Images:</h2>
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4 max-h-80 overflow-y-auto custom-scrollbar">
//               {extractedImages.map((img) => (
//                 <div
//                   key={img.id}
//                   className="bg-gray-700 p-2 rounded-md flex flex-col items-center justify-between h-48"
//                 >
//                   <div className="relative w-full h-32 border border-gray-600 rounded-md overflow-hidden bg-gray-800 flex items-center justify-center">
//                     <img
//                       src={img.url}
//                       alt={`Extracted ${img.name}`}
//                       className="absolute top-0 left-0 w-full h-full object-contain"
//                     />
//                   </div>
//                   <p className="text-sm text-gray-300 mt-2 truncate w-full">
//                     {img.name}.{img.mimeType.split('/')[1]}
//                   </p>
//                   <div className="flex flex-col gap-2 w-full mt-2">
//                     <button
//                       onClick={() =>
//                         handleDownloadExtractedImage(img.url, img.name, img.mimeType)
//                       }
//                       className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md transition duration-300 ease-in-out w-full"
//                     >
//                       Download
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <button
//               onClick={handleDownloadAllExtractedImages}
//               className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out"
//             >
//               Download All Extracted Images (ZIP)
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Right Ad Section */}
//       <div className="w-full md:w-1/5 lg:w-1/6 flex-shrink-0 mt-8 md:mt-24">
//         <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500">
//           <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//           <ins
//             className="adsbygoogle"
//             style={{ display: 'block', width: '100%', minHeight: '300px' }}
//             data-ad-client="ca-pub-7000000000000000"
//             data-ad-slot="2345678901"
//             data-ad-format="auto"
//             data-full-width-responsive="true"
//           ></ins>
//         </div>
//         <div className="p-2 bg-gray-700 rounded-lg text-center border border-dashed border-gray-500 mt-4">
//           <p className="text-gray-300 mb-2 text-sm">Advertisement</p>
//           <ins
//             className="adsbygoogle"
//             style={{ display: 'block', width: '100%', minHeight: '250px' }}
//             data-ad-client="ca-pub-7000000000000000"
//             data-ad-slot="3456789012"
//             data-ad-format="auto"
//             data-full-width-responsive="true"
//           ></ins>
//         </div>
//       </div>
//     </div>
//   );
// }




'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import axios from 'axios'; // Import Axios
import MainLayout from '@/components/MainLayout';



export default function DocumentToolsPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedImages, setExtractedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE_MB = 20; // Increased limit for documents
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(
          `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the ${MAX_FILE_SIZE_MB}MB limit.`
        );
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Clear input
        }
      } else {
        setSelectedFile(file);
        setExtractedImages([]);
        setConvertedPdfUrl(null);
        setError(null);
        toast.dismiss();
      }
    }
  };

  const handleExtractImages = async () => {
    if (!selectedFile) {
      toast.error('Please select a DOCX or PDF file to extract images from.');
      return;
    }

    const fileType = selectedFile.type;
    if (
      ![
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf',
      ].includes(fileType)
    ) {
      toast.error('Please select a valid DOCX or PDF file.');
      return;
    }

    setLoading(true);
    setExtractedImages([]);
    setError(null);
    toast.dismiss();

    const formData = new FormData();
    formData.append('document', selectedFile); // Key matches Next.js API route's expectation

    try {
      // Calling the local Next.js API route
      const response = await axios.post('/api/convert/convert-doc/extract-images-from-docx', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'json', // Expect JSON response from Next.js API
      });

      const result = response.data; // Data is directly available from Axios response
      if (result.images && result.images.length > 0) {
        setExtractedImages(
          result.images.map((img, index) => ({
            id: `extracted-img-${index}-${Date.now()}`,
            name: `extracted_image_${index + 1}`,
            url: `data:${img.mimeType};base64,${img.data}`,
            mimeType: img.mimeType,
            originalFileName: selectedFile.name,
          }))
        );
        toast.success(`Successfully extracted ${result.images.length} image(s)!`);
      } else {
        toast.info('No images found in the document.');
      }
    } catch (err) {
      console.error('Image extraction error:', err);
      let errorMessage = 'An unknown error occurred during image extraction.';
      if (axios.isAxiosError(err) && err.response) {
        // Next.js API route returns JSON errors
        try {
          errorMessage = err.response.data.error || `Server error: ${err.response.status}`;
        } catch (jsonParseError) {
          errorMessage = `Server error: ${err.response.status}. Details: ${err.response.data}`;
        }
        setError(`Failed to extract images: ${errorMessage}`);
        toast.error(`Error extracting images: ${errorMessage}`);
      } else if (err.request) {
        errorMessage = 'No response from server for image extraction. Check network connection.';
        setError(`Failed to extract images: ${errorMessage}`);
        toast.error(`Error extracting images: ${errorMessage}`);
      } else {
        errorMessage = err.message;
        setError(`Failed to extract images: ${errorMessage}`);
        toast.error(`Error extracting images: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDocxToPdf = async () => {
    if (!selectedFile) {
      toast.error('Please select a DOCX file to convert to PDF.');
      return;
    }

    if (
      selectedFile.type !==
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      toast.error('Please select a valid DOCX file for PDF conversion.');
      return;
    }

    setLoading(true);
    setConvertedPdfUrl(null);
    setError(null);
    toast.dismiss();

    const formData = new FormData();
    formData.append('file', selectedFile); // Key matches Next.js API route's expectation

    try {
      // Calling the local Next.js API route
      const response = await axios.post('/api/convert/convert-doc/convert-docx-to-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // Expect binary response (PDF blob) from Next.js API
      });

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      setConvertedPdfUrl(url);
      toast.success('DOCX converted to PDF successfully!');

    } catch (err) {
      console.error('DOCX to PDF conversion error:', err);
      let errorMessage = 'An unknown error occurred during conversion.';
      if (axios.isAxiosError(err) && err.response) {
        // Next.js API route returns JSON errors
        try {
          const reader = new FileReader();
          reader.onload = () => {
              try {
                  const errorData = JSON.parse(reader.result);
                  errorMessage = errorData.error || `Server error: ${err.response.status}`;
              } catch (jsonParseError) {
                  errorMessage = `Server error: ${err.response.status}. Details: ${reader.result}`;
              }
              setError(`Failed to convert to PDF: ${errorMessage}`);
              toast.error(`Error converting to PDF: ${errorMessage}`);
              setLoading(false);
          };
          if (err.response.data instanceof Blob) {
              reader.readAsText(err.response.data);
          } else {
              errorMessage = `Server error: ${err.response.status}. Details: ${err.response.data}`;
              setError(`Failed to convert to PDF: ${errorMessage}`);
              toast.error(`Error converting to PDF: ${errorMessage}`);
              setLoading(false);
          }
        } catch (outerErr) {
            errorMessage = `Server error: ${err.response.status}. Details: ${outerErr.message}`;
            setError(`Failed to convert to PDF: ${errorMessage}`);
            toast.error(`Error converting to PDF: ${errorMessage}`);
            setLoading(false);
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Check network connection.';
        setError(`Failed to convert to PDF: ${errorMessage}`);
        toast.error(`Error converting to PDF: ${errorMessage}`);
      } else {
        errorMessage = err.message;
        setError(`Failed to convert to PDF: ${errorMessage}`);
        toast.error(`Error converting to PDF: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExtractedImage = (url, name, mimeType) => {
    saveAs(url, `${name}.${mimeType.split('/')[1]}`);
    toast.success(`Downloaded ${name}!`);
  };

  const handleDownloadAllExtractedImages = async () => {
    if (extractedImages.length === 0) {
      toast.error('No images to download.');
      return;
    }

    const zip = new JSZip();
    let successfulZipCount = 0;

    const zipPromise = new Promise(async (resolve, reject) => {
      for (const img of extractedImages) {
        try {
          const response = await fetch(img.url);
          const blob = await response.blob();
          zip.file(`${img.name}.${img.mimeType.split('/')[1]}`, blob);
          successfulZipCount++;
        } catch (fetchError) {
          console.error(`Failed to add ${img.name} to zip:`, fetchError);
        }
      }

      try {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(
          content,
          `extracted_images_from_${
            extractedImages[0].originalFileName.split('.')[0]
          }.zip`
        );
        resolve();
      } catch (zipError) {
        console.error('Failed to generate zip file:', zipError);
        reject(zipError);
      }
    });

    toast.promise(zipPromise, {
      pending: 'Preparing ZIP file...',
      success: {
        render: () => `Successfully zipped ${successfulZipCount} image(s)!`,
      },
      error: {
        render: () => 'Failed to create ZIP file.',
      },
    });
  };

  // Cleanup object URLs when component unmounts or state changes
  useEffect(() => {
    return () => {
      extractedImages.forEach((img) => URL.revokeObjectURL(img.url));
      if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
      }
    };
  }, [extractedImages, convertedPdfUrl]);

  // AdSense push for dynamic loading
  // useEffect(() => {
  //   try {
  //     if (typeof window !== 'undefined' && window.adsbygoogle) {
  //       (window.adsbygoogle = window.adsbygoogle || []).push({});
  //     }
  //   } catch (error) {
  //     console.error('AdSense script not loaded or error encountered:', error);
  //   }
  // }, [loading, extractedImages, convertedPdfUrl]);

  return (
    <MainLayout title="Document & Image Tools">
    <div className="mb-6">
      <input
        type="file"
        accept=".docx,.pdf" // Accept DOCX and PDF files
        onChange={handleFileChange}
        ref={fileInputRef}
        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 cursor-pointer"
      />
      {selectedFile && (
        <p className="text-sm text-gray-400 mt-2">
          Selected: {selectedFile.name} (
          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
        </p>
      )}
    </div>

    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
      <button
        onClick={handleExtractImages}
        disabled={
          loading ||
          !selectedFile ||
          (!selectedFile.type.includes('wordprocessingml.document') &&
            !selectedFile.type.includes('application/pdf'))
        }
        className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading && selectedFile ? (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          'Extract Images'
        )}
      </button>

      <button
        onClick={handleDocxToPdf}
        disabled={
          loading ||
          !selectedFile ||
          selectedFile.type !==
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
        className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading &&
        selectedFile &&
        selectedFile.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          'Convert DOCX to PDF'
        )}
      </button>
    </div>

    {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

    {convertedPdfUrl && (
      <div className="mt-6 border border-gray-700 rounded-md p-4">
        <h2 className="text-xl font-semibold mb-3">Converted PDF:</h2>
        <a
          href={convertedPdfUrl}
          download={`${selectedFile?.name.split('.')[0]}.pdf`}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out inline-block"
        >
          Download Converted PDF
        </a>
      </div>
    )}

    {extractedImages.length > 0 && (
      <div className="mt-6 border border-gray-700 rounded-md p-4">
        <h2 className="text-xl font-semibold mb-3">Extracted Images:</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4 max-h-80 overflow-y-auto custom-scrollbar">
          {extractedImages.map((img) => (
            <div
              key={img.id}
              className="bg-gray-700 p-2 rounded-md flex flex-col items-center justify-between h-48"
            >
              <div className="relative w-full h-32 border border-gray-600 rounded-md overflow-hidden bg-gray-800 flex items-center justify-center">
                <img
                  src={img.url}
                  alt={`Extracted ${img.name}`}
                  className="absolute top-0 left-0 w-full h-full object-contain"
                />
              </div>
              <p className="text-sm text-gray-300 mt-2 truncate w-full">
                {img.name}.{img.mimeType.split('/')[1]}
              </p>
              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  onClick={() =>
                    handleDownloadExtractedImage(img.url, img.name, img.mimeType)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md transition duration-300 ease-in-out w-full"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleDownloadAllExtractedImages}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg text-lg transition duration-300 ease-in-out"
        >
          Download All Extracted Images (ZIP)
        </button>
      </div>
    )}
  </MainLayout>
  );
}