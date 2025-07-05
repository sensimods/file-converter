
import mongoose from 'mongoose';

const ConversionRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'image-conversion',
      'docx-to-pdf-conversion',
      'image-extraction',
      // Add other conversion types here as you implement them
    ],
  },
  userId: { // This userId can be the Mongoose ObjectId for authenticated users, or fingerprintId/anonymousId string for unauthenticated
    type: String, // Changed to String to accommodate both ObjectId and string IDs
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
