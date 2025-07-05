import dbConnect from '@/lib/mongodb'
import getUserTokenModel from '@/models/UserToken'

/**
 * ensureAndUpdateTokens(opts) ▸ returns { tokensUsed, maxTokens, unlimited }
 *
 * @param {object} opts
 *   – userId | fingerprintId | anonymousId  (at least one)
 *   – cost  (integer ≥ 0)  how many tokens this action costs
 *
 * Handles:
 *   • creating the UserToken doc if it doesn’t exist
 *   • daily UTC reset of tokensUsedToday
 *   • expiring one-time unlimited passes
 *   • throwing ‘Insufficient tokens’ if over quota
 *   • incrementing tokensUsedToday when applicable
 */
export async function ensureAndUpdateTokens ({
  userId = null,
  fingerprintId = null,
  anonymousId = null,
  cost = 1
}) {
  if (!userId && !fingerprintId && !anonymousId)
    throw new Error('No identity provided to ensureAndUpdateTokens')

  await dbConnect()
  const UserToken = getUserTokenModel()
  const query = userId
    ? { userId }
    : fingerprintId
      ? { fingerprintId }
      : { anonymousId }

  // create if missing
  let ut = await UserToken.findOne(query)
  if (!ut) {
    ut = await UserToken.create({
      ...query,
      lastResetDate: todayUTC(),
      tokensUsedToday: 0,
      maxTokensPerDay: 20,
      isSubscriber: false
    })
  }

  // daily reset
  if (ut.lastResetDate.getTime() !== todayUTC().getTime()) {
    ut.tokensUsedToday = 0
    ut.lastResetDate = todayUTC()
  }

  // expire one-time pass
  const now = new Date()
  if (ut.unlimitedAccessUntil && now > ut.unlimitedAccessUntil) {
    ut.unlimitedAccessUntil = null
  }

  const unlimited =
    ut.maxTokensPerDay === Infinity ||
    (ut.unlimitedAccessUntil && now <= ut.unlimitedAccessUntil)

  if (!unlimited) {
    if (ut.tokensUsedToday + cost > ut.maxTokensPerDay)
      throw new Error('Insufficient tokens')
    ut.tokensUsedToday += cost
  }

  await ut.save()

  return {
    tokensUsed: ut.tokensUsedToday,
    maxTokens: unlimited ? Infinity : ut.maxTokensPerDay,
    unlimitedAccessUntil: ut.unlimitedAccessUntil
  }
}

function todayUTC () {
  const n = new Date()
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()))
}
