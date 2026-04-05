import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: 'repo user' } },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'github' && account.access_token) {
        await connectToDatabase();
        await User.findOneAndUpdate(
          { githubId: parseInt(account.providerAccountId) },
          {
            name: user.name,
            email: user.email,
            image: user.image,
            githubId: account.providerAccountId,
            githubAccessToken: account.access_token,
          },
          { upsert: true, new: true }
        );
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        const user = await User.findOne({ githubId: token.sub });
        session.user.id = user?._id.toString();
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.sub = account.providerAccountId;
      }
      return token;
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
});