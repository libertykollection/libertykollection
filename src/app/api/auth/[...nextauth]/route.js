import prisma from '../../../util/prisma'; // Adjusting path to prisma
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (user && user.password === credentials.password) {
          return user;
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/signin'
  },
  callbacks: {
    async session({ session, user }) {
      session.user = user;
      return session;
    }
  }
});

// Instead of exporting default, use the appropriate methods for API routes
export { handler as GET, handler as POST };
