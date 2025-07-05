import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from '@/lib/mongodb'
import getUserModel from '@/models/User'
import getUserTokenModel from '@/models/UserToken'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize (credentials) {
        await dbConnect()
        const User = getUserModel()

        // include password explicitly
        const user = await User.findOne({ email: credentials.email }).select(
          '+password'
        )

        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return { id: user._id.toString(), email: user.email }
      }
    })
  ],

  callbacks: {
    async jwt ({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      if (account?.provider === 'google') token.provider = 'google'
      return token
    },

    async session ({ session, token }) {
      await dbConnect()
      const UserToken = getUserTokenModel()

      session.user.id = token.id

      // ─ Create / fetch matching UserToken doc ─
      let userToken = await UserToken.findOne({ userId: session.user.id })
      if (!userToken) {
        userToken = await UserToken.create({
          userId: session.user.id,
          lastResetDate: new Date(),
          tokensUsedToday: 0,
          maxTokensPerDay: 20,
          isSubscriber: false
        })
      }

      // ─ Midnight-UTC reset ─
      const now = new Date()
      const todayUTC = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      )
      if (userToken.lastResetDate < todayUTC) {
        userToken.tokensUsedToday = 0
        userToken.lastResetDate = todayUTC
        await userToken.save()
      }

      // ─ Handle subscriber / 24-hr pass ─
      if (
        userToken.isSubscriber ||
        (userToken.unlimitedAccessUntil &&
          new Date() <= userToken.unlimitedAccessUntil)
      ) {
        session.user.maxTokens = Infinity
        session.user.isSubscriber = true
      } else {
        session.user.maxTokens = userToken.maxTokensPerDay
        session.user.isSubscriber = false
      }

      session.user.tokensUsed = userToken.tokensUsedToday
      session.user.unlimitedAccessUntil = userToken.unlimitedAccessUntil

      return session
    }
  },

  pages: { signIn: '/login' },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
