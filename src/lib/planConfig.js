export const PLAN_CONFIG = {
  [process.env.NEXT_PUBLIC_STRIPE_MONTHLY_BASIC_PRICE_ID]: {
    type: 'subscription',
    maxTokensPerDay: 200
  },
  [process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PREMIUM_PRICE_ID]: {
    type: 'subscription',
    maxTokensPerDay: 1000
  },
  [process.env.NEXT_PUBLIC_STRIPE_ONETIME_24HR_PRICE_ID]: {
    type: 'onetime',
    durationHours: 24
  },
  [process.env.NEXT_PUBLIC_STRIPE_ONETIME_WEEKLY_PRICE_ID]: {
    type: 'onetime',
    durationHours: 24 * 7
  }
}
