import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabaseAuth } from '../../../lib/supabase';

console.log("[NextAuth] Initializing with Supabase Auth...");
console.log("[NextAuth] NEXTAUTH_SECRET Loaded:", !!process.env.NEXTAUTH_SECRET);

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log("[NextAuth][authorize] Attempting to authorize...");

        if (!credentials?.email || !credentials?.password) {
          console.log("[NextAuth][authorize] Missing credentials.");
          return null;
        }

        try {
          // Check for demo credentials first
          const demoEmail = process.env.DEMO_ADMIN_EMAIL;
          const demoPassword = process.env.DEMO_ADMIN_PASSWORD;

          if (credentials.email === demoEmail && credentials.password === demoPassword) {
            console.log("[NextAuth][authorize] Demo admin login successful");
            return {
              id: 'demo-admin',
              name: 'Demo Admin',
              email: credentials.email,
              role: 'admin',
            };
          }

          // Try Supabase authentication
          console.log(`[NextAuth][authorize] Attempting Supabase sign-in for ${credentials.email}`);
          const { data, error } = await supabaseAuth.signIn(credentials.email, credentials.password);

          if (error) {
            console.error("[NextAuth][authorize] Supabase auth error:", error.message);
            return null;
          }

          if (data.user) {
            console.log("[NextAuth][authorize] Supabase sign-in successful for:", data.user.email);

            // For now, grant admin role to all authenticated users
            // In production, you would check user roles from your database
            return {
              id: data.user.id,
              name: data.user.user_metadata?.full_name || data.user.email,
              email: data.user.email,
              role: 'admin', // TODO: Implement proper role checking
            };
          }

          console.log("[NextAuth][authorize] User object not found after sign-in attempt.");
          return null;
        } catch (error: any) {
          console.error("[NextAuth][authorize] Error during authentication:", error.message);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user?.role) token.role = user.role;
      if (user?.id) token.uid = user.id;
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (session.user && token?.role) session.user.role = token.role;
      if (session.user && token?.uid) session.user.id = token.uid;
      return session;
    },
  },
  pages: {
    signIn: '/admin',
    error: '/admin?error=auth',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("[NextAuth] WARNING: NEXTAUTH_SECRET is not set. This will cause errors in production and is highly insecure.");
}

export default NextAuth(authOptions);
