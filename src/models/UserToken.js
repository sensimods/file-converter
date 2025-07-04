// WAS WORKING FINE 04-07-25
// import mongoose from 'mongoose';

// const UserTokenSchema = new mongoose.Schema({
//   userId: {
//     type: String,
//     required: true,
//     unique: true,
//     index: true
//   },
//   lastResetDate: {
//     type: Date,
//     required: true,
//     default: () => {
//       const now = new Date();
//       return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
//     }
//   },
//   tokensUsedToday: {
//     type: Number,
//     required: true,
//     default: 0
//   },
//   maxTokensPerDay: {
//     type: Number,
//     required: true,
//     default: 20
//   },
//   isSubscriber: {
//     type: Boolean,
//     required: true,
//     default: false
//   }
// }, { timestamps: true });

// // Export a function that returns the model.
// // This ensures the model is only accessed/created after Mongoose is connected.
// export default function getUserTokenModel() {
//   // Check if the model already exists on the current mongoose connection
//   // This is the most reliable way to prevent OverwriteModelError in Next.js
//   if (mongoose.connection.models.UserToken) {
//     return mongoose.connection.models.UserToken;
//   }
//   // If not, define and return the model
//   return mongoose.model('UserToken', UserTokenSchema);
// }


import mongoose from 'mongoose';

const UserTokenSchema = new mongoose.Schema({
  // fingerprintId will be the primary identifier for token tracking
  fingerprintId: {
    type: String,
    required: false, // Not required if user is authenticated, but required for anonymous tracking
    unique: true,
    sparse: true, // Allow multiple nulls if not always present
    index: true
  },
  // anonymousId is a fallback/session ID, linked to fingerprintId
  anonymousId: {
    type: String,
    required: false, // Not strictly required if fingerprintId is always present
    unique: true,
    sparse: true, // Allow multiple nulls
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

export default function getUserTokenModel() {
  if (mongoose.connection.models.UserToken) {
    return mongoose.connection.models.UserToken;
  }
  return mongoose.model('UserToken', UserTokenSchema);
}