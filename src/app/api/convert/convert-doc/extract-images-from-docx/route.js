// document-pro/src/app/api/extract-images/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {

    const API_ENDPOINT = `${process.env.PYTHON_ANYWHERE_URL}/extract-images`; // Fallback URL if env variable is not set

    const formData = await request.formData(); // Get form data from Next.js request
    const documentFile = formData.get('document'); // Key matches frontend's formData.append('document', ...)

    if (!documentFile) {
      return NextResponse.json({ error: 'No document file provided' }, { status: 400 });
    }

    // Create new FormData to forward the file to your Flask server
    const flaskFormData = new FormData();
    flaskFormData.append('document', documentFile); // Key must match Flask's expectation

    // IMPORTANT: Your PythonAnywhere Flask server URL for image extraction
    const flaskResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: flaskFormData,
      // No need for 'Content-Type' header for FormData, fetch sets it automatically
    });

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      let errorMessage = `Flask server failed to extract images. Status: ${flaskResponse.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `${errorMessage}. Details: ${errorText}`;
      }
      return NextResponse.json({ error: errorMessage }, { status: flaskResponse.status });
    }

    // Flask server returns JSON with an 'images' array
    const result = await flaskResponse.json();
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Next.js API route /api/extract-images error:', error);
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
  }
}