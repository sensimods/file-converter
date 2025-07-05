
import mongoose from 'mongoose';

const UserTokenSchema = new mongoose.Schema({
  // New: Link to authenticated user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to the User model
    required: false, // Not required for anonymous users
    unique: true,
    sparse: true, // Allows multiple null values for anonymous users
    index: true,
  },
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
  },
  // New fields for subscription/one-time unlimited access
  unlimitedAccessUntil: {
    type: Date,
    required: false, // Only set for one-time unlimited plans
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'canceled', 'trialing'], // Example statuses
    required: false,
  },
  stripeCustomerId: {
    type: String,
    required: false, // Stripe customer ID for subscriptions
    unique: true,
    sparse: true,
  },
  stripeSubscriptionId: {
    type: String,
    required: false, // Stripe subscription ID
    unique: true,
    sparse: true,
  },
}, { timestamps: true });

export default function getUserTokenModel() {
  if (mongoose.connection.models.UserToken) {
    return mongoose.connection.models.UserToken;
  }
  return mongoose.model('UserToken', UserTokenSchema);
}
