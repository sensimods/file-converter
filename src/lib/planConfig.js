// Central place to map Stripe price IDs ➜ access rules
export const PLAN_CONFIG = {
  [process.env.NEXT_PUBLIC_STRIPE_MONTHLY_BASIC_PRICE_ID]: {
    type: 'subscription',
    maxTokensPerDay: 200
  },
  [process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PREMIUM_PRICE_ID]: {
    type: 'subscription',
    maxTokensPerDay: Infinity
  },
  [process.env.NEXT_PUBLIC_STRIPE_ONETIME_24HR_PRICE_ID]: {
    type: 'onetime',
    durationHours: 24        // unlimited for 24 h
  },
  [process.env.NEXT_PUBLIC_STRIPE_ONETIME_WEEKLY_PRICE_ID]: {
    type: 'onetime',
    durationHours: 24 * 7    // unlimited for 7 d
  }
}
