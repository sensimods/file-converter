import mongoose from 'mongoose';

const UserTokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  lastResetDate: {
    type: Date,
    required: true,
    default: () => {
      const now = new Date();
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }
  },
  tokensUsedToday: {
    type: Number,
    required: true,
    default: 0
  },
  maxTokensPerDay: {
    type: Number,
    required: true,
    default: 20
  },
  isSubscriber: {
    type: Boolean,
    required: true,
    default: false
  }
}, { timestamps: true });

// Export a function that returns the model.
// This ensures the model is only accessed/created after Mongoose is connected.
export default function getUserTokenModel() {
  // Check if the model already exists on the current mongoose connection
  // This is the most reliable way to prevent OverwriteModelError in Next.js
  if (mongoose.connection.models.UserToken) {
    return mongoose.connection.models.UserToken;
  }
  // If not, define and return the model
  return mongoose.model('UserToken', UserTokenSchema);
}
