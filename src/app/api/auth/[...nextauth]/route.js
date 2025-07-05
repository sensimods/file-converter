// // document-pro/src/app/api/auth/[...nextauth]/route.js
// import NextAuth from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import dbConnect from '@/lib/mongodb';
// import getUserModel from '@/models/User';
// import getUserTokenModel from '@/models/UserToken'; // Import UserToken model

// const handler = NextAuth({
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'text' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials, req) {
//         await dbConnect();
//         const User = getUserModel();
//         const UserToken = getUserTokenModel();

//         const { email, password } = credentials;

//         // 1. Find user by email
//         const user = await User.findOne({ email }).select('+password'); // Select password explicitly

//         if (!user) {
//           throw new Error('No user found with this email.');
//         }

//         // 2. Check password
//         const isMatch = await user.matchPassword(password);

//         if (!isMatch) {
//           throw new Error('Invalid credentials.');
//         }

//         // 3. If user is found and password matches, return user object
//         // The user object returned here will be available in the session.
//         // We'll also try to fetch/create their UserToken document here.
//         let userToken = await UserToken.findOne({ userId: user._id });

//         if (!userToken) {
//           // If no UserToken exists for this authenticated user, create one.
//           // This ensures every authenticated user has a token record.
//           userToken = await UserToken.create({
//             userId: user._id,
//             lastResetDate: new Date(),
//             tokensUsedToday: 0,
//             maxTokensPerDay: 20, // Default for new users
//             isSubscriber: false,
//           });
//           console.log(`[NextAuth] Created new UserToken for authenticated user ${user._id}`);
//         }

//         // IMPORTANT: We return a minimal user object.
//         // The full token details will be added to the session in the 'jwt' callback.
//         return {
//           id: user._id.toString(), // Convert ObjectId to string
//           email: user.email,
//           // Do NOT return sensitive info like password here
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user, account }) {
//       // 'user' is available on first sign-in (from authorize)
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;

//         // Fetch UserToken data and add to JWT token
//         await dbConnect();
//         const UserToken = getUserTokenModel();
//         const userTokenDoc = await UserToken.findOne({ userId: user.id });

//         if (userTokenDoc) {
//           token.tokensUsedToday = userTokenDoc.tokensUsedToday;
//           token.maxTokensPerDay = userTokenDoc.maxTokensPerDay;
//           token.isSubscriber = userTokenDoc.isSubscriber;
//           token.unlimitedAccessUntil = userTokenDoc.unlimitedAccessUntil;
//           token.subscriptionStatus = userTokenDoc.subscriptionStatus;
//         } else {
//           // Fallback if userTokenDoc somehow not found (should be created in authorize)
//           token.tokensUsedToday = 0;
//           token.maxTokensPerDay = 20;
//           token.isSubscriber = false;
//           token.unlimitedAccessUntil = null;
//           token.subscriptionStatus = null;
//         }
//       }

//       return token;
//     },
//     async session({ session, token }) {
//       // 'token' is the JWT token from the jwt callback
//       if (token) {
//         session.user.id = token.id;
//         session.user.email = token.email;
//         session.user.tokensUsedToday = token.tokensUsedToday;
//         session.user.maxTokensPerDay = token.maxTokensPerDay;
//         session.user.isSubscriber = token.isSubscriber;
//         session.user.unlimitedAccessUntil = token.unlimitedAccessUntil;
//         session.user.subscriptionStatus = token.subscriptionStatus;
//       }
//       return session;
//     },
//   },
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   jwt: {
//     secret: process.env.NEXTAUTH_SECRET,
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: '/login', // Custom login page
//     // signOut: '/auth/signout', // Optional custom sign out page
//     // error: '/auth/error', // Error code passed in query string as ?error=
//     // verifyRequest: '/auth/verify-request', // Used for check email page
//     // newUser: '/auth/new-user' // If set, new users will be directed here on first sign in
//   },
// });

// export { handler as GET, handler as POST };


// import NextAuth from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import dbConnect from '@/lib/mongodb';
// import getUserModel from '@/models/User';
// import getUserTokenModel from '@/models/UserToken'; // Import UserToken model

// const handler = NextAuth({
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'text' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials, req) {
//         await dbConnect();
//         const User = getUserModel();
//         const UserToken = getUserTokenModel();

//         const { email, password } = credentials;

//         // 1. Find user by email
//         const user = await User.findOne({ email }).select('+password'); // Select password explicitly

//         if (!user) {
//           throw new Error('No user found with this email.');
//         }

//         // 2. Check password
//         const isMatch = await user.matchPassword(password);

//         if (!isMatch) {
//           throw new Error('Invalid credentials.');
//         }

//         // 3. If user is found and password matches, return user object
//         // The user object returned here will be available in the session.
//         // We'll also try to fetch/create their UserToken document here.
//         let userToken = await UserToken.findOne({ userId: user._id });

//         if (!userToken) {
//           // If no UserToken exists for this authenticated user, create one.
//           // This ensures every authenticated user has a token record.
//           userToken = await UserToken.create({
//             userId: user._id,
//             lastResetDate: new Date(),
//             tokensUsedToday: 0,
//             maxTokensPerDay: 20, // Default for new users
//             isSubscriber: false,
//           });
//           console.log(`[NextAuth] Created new UserToken for authenticated user ${user._id}`);
//         }

//         // IMPORTANT: We return a minimal user object.
//         // The full token details will be added to the session in the 'jwt' callback.
//         return {
//           id: user._id.toString(), // Convert ObjectId to string
//           email: user.email,
//           // Do NOT return sensitive info like password here
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user, account }) {
//       // 'user' is available on first sign-in (from authorize)
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;

//         // Fetch UserToken data and add to JWT token
//         await dbConnect();
//         const UserToken = getUserTokenModel();
//         const userTokenDoc = await UserToken.findOne({ userId: user.id });

//         if (userTokenDoc) {
//           token.tokensUsedToday = userTokenDoc.tokensUsedToday;
//           token.maxTokensPerDay = userTokenDoc.maxTokensPerDay;
//           token.isSubscriber = userTokenDoc.isSubscriber;
//           token.unlimitedAccessUntil = userTokenDoc.unlimitedAccessUntil;
//           token.subscriptionStatus = userTokenDoc.subscriptionStatus;
//         } else {
//           // Fallback if userTokenDoc somehow not found (should be created in authorize)
//           token.tokensUsedToday = 0;
//           token.maxTokensPerDay = 20;
//           token.isSubscriber = false;
//           token.unlimitedAccessUntil = null;
//           token.subscriptionStatus = null;
//         }
//       }

//       return token;
//     },
//     async session({ session, token }) {
//       // 'token' is the JWT token from the jwt callback
//       if (token) {
//         session.user.id = token.id;
//         session.user.email = token.email;
//         session.user.tokensUsedToday = token.tokensUsedToday;
//         session.user.maxTokensPerDay = token.maxTokensPerDay;
//         session.user.isSubscriber = token.isSubscriber;
//         session.user.unlimitedAccessUntil = token.unlimitedAccessUntil;
//         session.user.subscriptionStatus = token.subscriptionStatus;
//       }
//       return session;
//     },
//   },
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   jwt: {
//     secret: process.env.NEXTAUTH_SECRET,
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: '/login', // Custom login page
//     // signOut: '/auth/signout', // Optional custom sign out page
//     // error: '/auth/error', // Error code passed in query string as ?error=
//     // verifyRequest: '/auth/verify-request', // Used for check email page
//     // newUser: '/auth/new-user' // If set, new users will be directed here on first sign in
//   },
// });

// export { handler as GET, handler as POST };


// document-pro/src/app/api/auth/[...nextauth]/route.js
// document-pro/src/app/api/auth/[...nextauth]/route.js
// document-pro/src/app/api/auth/[...nextauth]/route.js
// document-pro/src/app/api/auth/[...nextauth]/route.js
// import NextAuth from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import dbConnect from '@/lib/mongodb';
// import getUserModel from '@/models/User';
// import getUserTokenModel from '@/models/UserToken';

// // Define authOptions separately so it can be exported
// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'text' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials, req) {
//         await dbConnect();
//         const User = getUserModel();
//         const UserToken = getUserTokenModel();

//         const { email, password } = credentials;

//         const user = await User.findOne({ email }).select('+password');

//         if (!user) {
//           console.log('[NextAuth - Authorize] No user found with this email:', email);
//           throw new Error('No user found with this email.');
//         }

//         const isMatch = await user.matchPassword(password);

//         if (!isMatch) {
//           console.log('[NextAuth - Authorize] Invalid password for user:', email);
//           throw new Error('Invalid credentials.');
//         }

//         let userToken = await UserToken.findOne({ userId: user._id });
//         if (!userToken) {
//           userToken = await UserToken.create({
//             userId: user._id,
//             lastResetDate: new Date(),
//             tokensUsedToday: 0,
//             maxTokensPerDay: 20,
//             isSubscriber: false,
//           });
//           console.log(`[NextAuth - Authorize] Created new UserToken for authenticated user: ${user._id}`);
//         } else {
//           console.log(`[NextAuth - Authorize] Found existing UserToken for authenticated user: ${user._id}`);
//         }

//         const userIdString = user._id.toString();
//         console.log(`[NextAuth - Authorize] User authenticated. Email: ${user.email}, Mongoose ID: ${user._id}, String ID: ${userIdString}`);
        
//         return {
//           id: userIdString,
//           email: user.email,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user, account }) {
//       console.log('[NextAuth - JWT Callback] --- START ---');
//       console.log('[NextAuth - JWT Callback] Incoming token (before user merge):', token);
//       console.log('[NextAuth - JWT Callback] User (from authorize):', user);
//       console.log('[NextAuth - JWT Callback] Account:', account);

//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         console.log(`[NextAuth - JWT Callback] Assigned token.id from user: ${token.id}`);

//         await dbConnect();
//         const UserToken = getUserTokenModel();
//         const userTokenDoc = await UserToken.findOne({ userId: user.id });

//         if (userTokenDoc) {
//           token.tokensUsedToday = userTokenDoc.tokensUsedToday;
//           token.maxTokensPerDay = userTokenDoc.maxTokensPerDay;
//           token.isSubscriber = userTokenDoc.isSubscriber;
//           token.unlimitedAccessUntil = userTokenDoc.unlimitedAccessUntil;
//           token.subscriptionStatus = userTokenDoc.subscriptionStatus;
//           console.log('[NextAuth - JWT Callback] UserToken data added to token:', {
//             tokensUsedToday: token.tokensUsedToday,
//             maxTokensPerDay: token.maxTokensPerDay,
//             isSubscriber: token.isSubscriber,
//             unlimitedAccessUntil: token.unlimitedAccessUntil,
//             subscriptionStatus: token.subscriptionStatus,
//           });
//         } else {
//           console.warn(`[NextAuth - JWT Callback] UserToken not found for user ID in token: ${user.id}. Falling back to default token values.`);
//           token.tokensUsedToday = 0;
//           token.maxTokensPerDay = 20;
//           token.isSubscriber = false;
//           token.unlimitedAccessUntil = null;
//           token.subscriptionStatus = null;
//         }
//       } else {
//         console.log('[NextAuth - JWT Callback] User is undefined, re-fetching UserToken data for existing token.id:', token.id);
//         if (token.id) {
//           await dbConnect();
//           const UserToken = getUserTokenModel();
//           const userTokenDoc = await UserToken.findOne({ userId: token.id });

//           if (userTokenDoc) {
//             token.tokensUsedToday = userTokenDoc.tokensUsedToday;
//             token.maxTokensPerDay = userTokenDoc.maxTokensPerDay;
//             token.isSubscriber = userTokenDoc.isSubscriber;
//             token.unlimitedAccessUntil = userTokenDoc.unlimitedAccessUntil;
//             token.subscriptionStatus = userTokenDoc.subscriptionStatus;
//             console.log('[NextAuth - JWT Callback] Refreshed UserToken data for token:', {
//               tokensUsedToday: token.tokensUsedToday,
//               maxTokensPerDay: token.maxTokensPerDay,
//               isSubscriber: token.isSubscriber,
//               unlimitedAccessUntil: token.unlimitedAccessUntil,
//               subscriptionStatus: token.subscriptionStatus,
//             });
//           } else {
//             console.warn(`[NextAuth - JWT Callback] UserToken not found for existing token ID: ${token.id}. This is unexpected.`);
//             token.tokensUsedToday = 0;
//             token.maxTokensPerDay = 20;
//             token.isSubscriber = false; // Corrected typo here
//             token.unlimitedAccessUntil = null;
//             token.subscriptionStatus = null;
//           }
//         } else {
//           console.warn('[NextAuth - JWT Callback] Token.id is missing when user is undefined. Session might be corrupted or initial setup failed.');
//           token.tokensUsedToday = 0;
//           token.maxTokensPerDay = 20;
//           token.isSubscriber = false;
//           token.unlimitedAccessUntil = null;
//           token.subscriptionStatus = null;
//         }
//       }

//       console.log('[NextAuth - JWT Callback] Final token before return:', token);
//       console.log('[NextAuth - JWT Callback] --- END ---');
//       return token;
//     },
//     async session({ session, token }) {
//       console.log('[NextAuth - Session Callback] --- START ---');
//       console.log('[NextAuth - Session Callback] Incoming session:', session);
//       console.log('[NextAuth - Session Callback] Token (from JWT callback):', token);

//       if (token) {
//         session.user.id = token.id;
//         session.user.email = token.email;
//         session.user.tokensUsedToday = token.tokensUsedToday;
//         session.user.maxTokensPerDay = token.maxTokensPerDay;
//         session.user.isSubscriber = token.isSubscriber;
//         session.user.unlimitedAccessUntil = token.unlimitedAccessUntil;
//         session.user.subscriptionStatus = token.subscriptionStatus;
//         console.log(`[NextAuth - Session Callback] Assigned session.user.id: ${session.user.id}`);
//       }
//       console.log('[NextAuth - Session Callback] Final session before return:', session);
//       console.log('[NextAuth - Session Callback] --- END ---');
//       return session;
//     },
//   },
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   jwt: {
//     secret: process.env.NEXTAUTH_SECRET,
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: '/login',
//   },
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };



// document-pro/src/app/auth/[...nextauth]/route.js
// import NextAuth from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import dbConnect from '@/lib/mongodb';
// import User from '@/models/User';
// import getUserTokenModel from '@/models/UserToken';
// import bcrypt from 'bcryptjs';

// export const authOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'text' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         await dbConnect();
//         const user = await User.findOne({ email: credentials.email });

//         if (user && (await bcrypt.compare(credentials.password, user.password))) {
//           return { id: user._id.toString(), email: user.email };
//         } else {
//           return null;
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user, account }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//       }
//       // If a Google account, store provider info
//       if (account?.provider === 'google') {
//         token.provider = 'google';
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       await dbConnect();
//       const UserToken = getUserTokenModel();

//       session.user.id = token.id; // Ensure user ID is available in session

//       // Fetch or create UserToken data for the authenticated user
//       let userToken = await UserToken.findOne({ userId: session.user.id });

//       if (!userToken) {
//         // If no UserToken exists for this authenticated user, create one.
//         // This handles cases where a user registers/logs in for the first time
//         // after anonymous usage, or if their anonymous token was never reconciled.
//         userToken = await UserToken.create({
//           userId: session.user.id,
//           lastResetDate: new Date(),
//           tokensUsedToday: 0,
//           maxTokensPerDay: 20, // Default for new registered users
//           isSubscriber: false,
//         });
//         console.log(`[NextAuth Session Callback] Created new UserToken for authenticated user: ${session.user.id}`);
//       }

//       // Ensure tokens are reset for the current UTC day if needed
//       const now = new Date();
//       const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

//       if (userToken.lastResetDate.getTime() < todayMidnightUtc.getTime()) {
//         userToken.tokensUsedToday = 0;
//         userToken.lastResetDate = todayMidnightUtc;
//         await userToken.save();
//         console.log(`[NextAuth Session Callback] UserToken for ${session.user.id} reset for new day.`);
//       }

//       // Check for unlimited access expiry
//       if (userToken.unlimitedAccessUntil && new Date() > userToken.unlimitedAccessUntil) {
//         userToken.unlimitedAccessUntil = null; // Clear expired unlimited access
//         userToken.maxTokensPerDay = 20; // Revert to default free tier
//         userToken.isSubscriber = false; // Ensure isSubscriber is false if one-time access expired
//         await userToken.save();
//         console.log(`[NextAuth Session Callback] Unlimited access for ${session.user.id} expired. Reverted to free tier.`);
//       }

//       // Populate session.user with token data
//       session.user.tokensUsed = userToken.tokensUsedToday;
//       session.user.maxTokens = userToken.maxTokensPerDay;
//       session.user.isSubscriber = userToken.isSubscriber;
//       session.user.unlimitedAccessUntil = userToken.unlimitedAccessUntil;

//       // Override maxTokens for active subscriptions or one-time passes
//       if (session.user.isSubscriber || (session.user.unlimitedAccessUntil && new Date() <= session.user.unlimitedAccessUntil)) {
//         session.user.maxTokens = Infinity;
//         session.user.isSubscriber = session.user.isSubscriber || true; // Ensure true if unlimited access
//       }

//       console.log(`[NextAuth Session Callback] Session populated for ${session.user.email} with tokens: ${session.user.maxTokens - session.user.tokensUsed} / ${session.user.maxTokens}, isSubscriber: ${session.user.isSubscriber}`);

//       return session;
//     },
//   },
//   pages: {
//     signIn: '/login',
//   },
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };


// document-pro/src/app/auth/[...nextauth]/route.js
// document-pro/src/app/auth/[...nextauth]/route.js
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
