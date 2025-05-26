import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials?.email || '',
            credentials?.password || ''
          );
          const user = userCredential.user;

          // Get the user's ID token
          const idToken = await user.getIdToken();

          // TODO: Verify the ID token using the Firebase Admin SDK
          // import { adminAuth } from '../../../lib/firebaseAdmin'; // Example import
          // const decodedToken = await adminAuth.verifyIdToken(idToken);

          // TODO: Check for a custom claim like 'admin: true'
          // if (decodedToken.admin === true) {
            // If the user has the admin claim, return a user object with the admin role
            return { id: user.uid, name: user.displayName, email: user.email, role: 'admin' };
          // }
          // If the user does not have the admin claim, return null
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (user && 'role' in user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (token as any).role = (user as any).role;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (session.user && token?.role) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

// Reminder: Set NEXTAUTH_SECRET, ADMIN_EMAIL, and ADMIN_PASSWORD in your .env.local file. 