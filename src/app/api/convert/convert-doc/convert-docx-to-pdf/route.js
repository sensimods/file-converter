import { NextResponse } from 'next/server';

export async function POST(request) {
  try {

    const API_ENDPOINT = `${process.env.PYTHON_ANYWHERE_URL}/convert-docx-to-pdf` // Fallback URL if env variable is not set

    const formData = await request.formData(); // Get form data from Next.js request
    const file = formData.get('file'); // Get the file from the formData

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Create new FormData to forward the file to your Flask server
    const flaskFormData = new FormData();
    flaskFormData.append('file', file); // 'file' key must match Flask's expectation

    // IMPORTANT: Your PythonAnywhere Flask server URL for DOCX to PDF
    const flaskResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: flaskFormData,
      // No need for 'Content-Type' header for FormData, fetch sets it automatically
    });

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text(); // Get raw text from Flask error response
      let errorMessage = `Flask server failed to convert DOCX to PDF. Status: ${flaskResponse.status}`;
      try {
        const errorData = JSON.parse(errorText); // Try parsing as JSON
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If not JSON, use raw text
        errorMessage = `${errorMessage}. Details: ${errorText}`;
      }
      return NextResponse.json({ error: errorMessage }, { status: flaskResponse.status });
    }

    // Flask server sends back a PDF blob directly. Forward it.
    const pdfBlob = await flaskResponse.blob();
    
    // Get content disposition header if available, otherwise set a default
    const contentDisposition = flaskResponse.headers.get('Content-Disposition') || `attachment; filename="converted.pdf"`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', contentDisposition);

    return new NextResponse(pdfBlob, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error('Next.js API route /api/convert-docx-to-pdf error:', error);
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
  }
}
