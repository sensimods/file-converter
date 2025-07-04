// import mongoose from 'mongoose';
// //6TdMWwGGiMaQcrE2
// const ConversionRequestSchema = new mongoose.Schema({
//   type: {
//     type: String,
//     required: true,
//     enum: ['docx-to-pdf', 'image-extraction', 'image-conversion'] // Add other tool types as needed
//   },
//   timestamp: {
//     type: Date,
//     default: Date.now
//   },
//   userId: { // Optional, for future user login integration
//     type: String,
//     required: false
//   },
//   fileDetails: {
//     fileName: { type: String, required: true },
//     fileSizeKB: { type: Number, required: true },
//     fileMimeType: { type: String, required: true }
//   },
//   requestDetails: { // Details specific to the type of request
//     // For image-conversion (future): { outputFormat: String, batchSize: Number }
//     // For docx-to-pdf: {} (or specific options if added later)
//     // For image-extraction: {} (or specific options if added later)
//   },
//   status: {
//     type: String,
//     required: true,
//     enum: ['success', 'failed']
//   },
//   errorMessage: {
//     type: String,
//     required: false
//     // Store the full error message for debugging
//   },
//   durationMs: { // Time taken for the request to complete
//     type: Number,
//     required: false
//   },
//   // You could also add 'ipAddress' here if you want to capture it,
//   // but be mindful of privacy regulations (e.g., GDPR).
//   // ipAddress: { type: String, required: false }
// }, { timestamps: true }); // `timestamps: true` adds `createdAt` and `updatedAt` fields automatically

// // Check if the model already exists to prevent recompilation issues in development
// export default mongoose.models.ConversionRequest || mongoose.model('ConversionRequest', ConversionRequestSchema);


//WAS WORKING FINE 04-07-24
// import mongoose from 'mongoose';

// const ConversionRequestSchema = new mongoose.Schema({
//   type: {
//     type: String,
//     required: true,
//     enum: ['docx-to-pdf', 'image-extraction', 'image-conversion'] // Add other tool types as needed
//   },
//   timestamp: {
//     type: Date,
//     default: Date.now
//   },
//   userId: { // Optional, for future user login integration
//     type: String,
//     required: false
//   },
//   fileDetails: {
//     fileName: { type: String, required: true },
//     fileSizeKB: { type: Number, required: true },
//     fileMimeType: { type: String, required: true }
//   },
//   requestDetails: { // Details specific to the type of request
//     // For image-conversion: { outputFormat: String, isBatch: Boolean, numberOfFiles: Number }
//     // For docx-to-pdf: {} (or specific options if added later)
//     // For image-extraction: {} (or specific options if added later)
//   },
//   status: {
//     type: String,
//     required: true,
//     enum: ['pending', 'success', 'failed'] // <-- ADDED 'pending' here
//   },
//   errorMessage: {
//     type: String,
//     required: false
//     // Store the full error message for debugging
//   },
//   durationMs: { // Time taken for the request to complete
//     type: Number,
//     required: false
//   },
//   // You could also add 'ipAddress' here if you want to capture it,
//   // but be mindful of privacy regulations (e.g., GDPR).
//   // ipAddress: { type: String, required: false }
// }, { timestamps: true }); // `timestamps: true` adds `createdAt` and `updatedAt` fields automatically

// // Check if the model already exists to prevent recompilation issues in development
// export default mongoose.models.ConversionRequest || mongoose.model('ConversionRequest', ConversionRequestSchema);

import mongoose from 'mongoose';

const ConversionRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'image-conversion',
      'docx-to-pdf-conversion', // Added
      'image-extraction',       // Added
      // Add other conversion types here as you implement them
    ],
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  fileDetails: {
    fileName: String,
    fileSizeKB: Number,
    fileMimeType: String,
  },
  requestDetails: {
    outputFormat: String,
    isBatch: Boolean,
    numberOfFiles: Number,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  errorMessage: {
    type: String,
    required: false,
  },
  durationMs: {
    type: Number,
    required: false, // Time taken for the request
  },
}, { timestamps: true });

export default function getConversionRequestModel() {
  if (mongoose.connection.models.ConversionRequest) {
    return mongoose.connection.models.ConversionRequest;
  }
  return mongoose.model('ConversionRequest', ConversionRequestSchema);
}