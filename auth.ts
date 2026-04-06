export const runtime = 'nodejs'

import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/User'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  cookies: {
    sessionToken: {
      name: `__Secure-authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: 'repo user' } },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'github' && account.access_token) {
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
    async jwt({ token, account }) {
      if (account) {
        token.githubId = account.providerAccountId
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.githubId as string
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
})