
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import getUserTokenModel from '@/models/UserToken';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[NextAuth Authorize] Attempting to authorize user.');
        try {
          await dbConnect();
          console.log('[NextAuth Authorize] Database connected.');

          // --- CRITICAL FIX: Explicitly select the password field ---
          const user = await User.findOne({ email: credentials.email }).select('+password');
          // --- END CRITICAL FIX ---

          console.log(`[NextAuth Authorize] User lookup for email "${credentials.email}":`, user ? 'Found' : 'Not found');

          if (!user) {
            console.log('[NextAuth Authorize] User not found.');
            return null; // User not found
          }

          // Compare provided password with hashed password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log(`[NextAuth Authorize] Password comparison result for "${credentials.email}":`, isPasswordValid);

          if (isPasswordValid) {
            console.log(`[NextAuth Authorize] User "${credentials.email}" authorized successfully.`);
            return { id: user._id.toString(), email: user.email };
          } else {
            console.log('[NextAuth Authorize] Invalid password.');
            return null; // Invalid password
          }
        } catch (error) {
          console.error('[NextAuth Authorize] Error during authorization:', error);
          return null; // Indicate authentication failure
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      if (account?.provider === 'google') {
        token.provider = 'google';
      }
      return token;
    },
    async session({ session, token }) {
      await dbConnect();
      const UserToken = getUserTokenModel();

      session.user.id = token.id;

      let userToken = await UserToken.findOne({ userId: session.user.id });

      if (!userToken) {
        userToken = await UserToken.create({
          userId: session.user.id,
          lastResetDate: new Date(),
          tokensUsedToday: 0,
          maxTokensPerDay: 20,
          isSubscriber: false,
        });
        console.log(`[NextAuth Session Callback] Created new UserToken for authenticated user: ${session.user.id}`);
      }

      const now = new Date();
      const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

      if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
        userToken.tokensUsedToday = 0;
        userToken.lastResetDate = todayMidnightUtc;
        await userToken.save();
        console.log(`[NextAuth Session Callback] UserToken for ${session.user.id} reset for new day.`);
      }

      if (userToken.unlimitedAccessUntil && new Date() > userToken.unlimitedAccessUntil) {
        userToken.unlimitedAccessUntil = null;
        userToken.maxTokensPerDay = 20;
        userToken.isSubscriber = false;
        await userToken.save();
        console.log(`[NextAuth Session Callback] Unlimited access for ${session.user.id} expired. Reverted to free tier.`);
      }

      session.user.tokensUsed = userToken.tokensUsedToday;
      session.user.maxTokens = userToken.maxTokensPerDay;
      session.user.isSubscriber = userToken.isSubscriber;
      session.user.unlimitedAccessUntil = userToken.unlimitedAccessUntil;

      if (session.user.isSubscriber || (session.user.unlimitedAccessUntil && new Date() <= session.user.unlimitedAccessUntil)) {
        session.user.maxTokens = Infinity;
        session.user.isSubscriber = session.user.isSubscriber || true;
      }

      console.log(`[NextAuth Session Callback] Session populated for ${session.user.email} with tokens: ${session.user.maxTokens - session.user.tokensUsed} / ${session.user.maxTokens}, isSubscriber: ${session.user.isSubscriber}`);

      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
