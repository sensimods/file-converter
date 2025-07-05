'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
// Removed axios import as fetch is used for Next.js API routes

import MainLayout from '@/components/MainLayout'; // Assuming MainLayout is in components
import ActionButton from '@/components/ActionButton'; // Import the new ActionButton

export default function DocumentConverterPage() { // Renamed to reflect its purpose
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedImages, setExtractedImages] = useState([]);
  const [loadingExtract, setLoadingExtract] = useState(false); // Specific loading for extraction
  const [loadingConvert, setLoadingConvert] = useState(false); // Specific loading for conversion
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

    setLoadingExtract(true); // Start loading for extraction
    setExtractedImages([]);
    setError(null);
    toast.dismiss();

    const formData = new FormData();
    formData.append('document', selectedFile); // Key matches Next.js API route's expectation

    try {
      // Calling the local Next.js API route
      const response = await fetch('/api/convert/convert-doc/extract-images-from-docx', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorData = {};
        try {
          const responseText = await response.text();
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (jsonParseError) {
          console.error('Failed to parse error response as JSON:', jsonParseError);
          errorData.error = `Server returned a non-JSON error or empty response. Status: ${response.status}`;
        }
        throw new Error(errorData.error || `Failed to extract images. Server status: ${response.status}`);
      }

      const result = await response.json(); // Next.js API route returns JSON
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

      // Dispatch custom event to update tokens
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tokensUpdated', {
          detail: {
            tokensUsed: result.tokensUsed,
            maxTokens: result.maxTokens,
            isSubscriber: result.isSubscriber,
          }
        }));
      }

    } catch (err) {
      console.error('Image extraction error:', err);
      let errorMessage = 'An unknown error occurred during image extraction.';
      if (err.message.includes('Failed to extract images: Server error')) {
        errorMessage = err.message; // Use error message from API route
      } else if (err.message.includes('No response from server')) {
        errorMessage = 'Network error: No response from server for image extraction.';
      } else {
        errorMessage = `An unexpected error occurred: ${err.message}`;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingExtract(false); // End loading for extraction
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

    setLoadingConvert(true); // Start loading for conversion
    setConvertedPdfUrl(null);
    setError(null);
    toast.dismiss();

    const formData = new FormData();
    formData.append('file', selectedFile); // Key matches Next.js API route's expectation

    try {
      // Calling the local Next.js API route
      const response = await fetch('/api/convert/convert-doc/convert-docx-to-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData = {};
        try {
          errorData = errorText ? JSON.parse(errorText) : {};
        } catch (jsonParseError) {
          console.error('Failed to parse error response as JSON:', jsonParseError);
          errorData.error = `Server returned a non-JSON error or empty response. Status: ${response.status}`;
        }
        throw new Error(errorData.error || `Failed to convert to PDF. Server status: ${response.status}`);
      }

      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);
      setConvertedPdfUrl(url);
      toast.success('DOCX converted to PDF successfully!');

      // --- NEW: Fetch updated token data after successful conversion ---
      if (typeof window !== 'undefined') {
        try {
          const tokenResponse = await fetch('/api/user-tokens');
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            window.dispatchEvent(new CustomEvent('tokensUpdated', {
              detail: {
                tokensUsed: tokenData.tokensUsed,
                maxTokens: tokenData.maxTokens,
                isSubscriber: tokenData.isSubscriber,
              }
            }));
            console.log('Tokens updated after DOCX to PDF conversion:', tokenData);
          } else {
            console.error('Failed to fetch updated token data after DOCX to PDF conversion:', tokenResponse.statusText);
          }
        } catch (tokenFetchError) {
          console.error('Error fetching tokens after DOCX to PDF conversion:', tokenFetchError);
        }
      }
      // --- END NEW ---

    } catch (err) {
      console.error('DOCX to PDF conversion error:', err);
      let errorMessage = 'An unknown error occurred during conversion.';
      if (err.message.includes('Failed to convert to PDF: Server error')) {
        errorMessage = err.message; // Use error message from API route
      } else if (err.message.includes('No response from server')) {
        errorMessage = 'Network error: No response from server.';
      } else {
        errorMessage = `An unexpected error occurred: ${err.message}`;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingConvert(false); // End loading for conversion
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
        <ActionButton
          onClick={handleExtractImages}
          loading={loadingExtract}
          cost={1} // Cost for image extraction is 1 token per document
          buttonText="Extract Images"
          disabled={!selectedFile || (!selectedFile.type.includes('wordprocessingml.document') && !selectedFile.type.includes('application/pdf'))}
        />

        <ActionButton
          onClick={handleDocxToPdf}
          loading={loadingConvert}
          cost={1} // Cost for DOCX to PDF conversion is 1 token
          buttonText="Convert DOCX to PDF"
          disabled={!selectedFile || selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
        />
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
