import NextAuthOptions from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: 'repo user' } },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      try {
        if (account?.provider === 'github') {
          await connectToDatabase()
          await User.findOneAndUpdate(
            { githubId: account.providerAccountId },
            {
              name: user.name,
              email: user.email,
              image: user.image,
              githubId: account.providerAccountId,
              githubAccessToken: account.access_token,
            },
            { upsert: true, new: true }
          )
        }
        return true
      } catch (error) {
        return true
      }
    },
    async session({ session, token }: any) {
      try {
        await connectToDatabase()
        const user = await User.findOne({ githubId: token.sub })
        session.user.id = user?._id.toString()
      } catch (error) {}
      return session
    },
    async jwt({ token, account }: any) {
      if (account) token.sub = account.providerAccountId
      return token
    },
  },
  session: { strategy: 'jwt' as const },
  secret: process.env.NEXTAUTH_SECRET,
}