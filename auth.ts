import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: 'Ov23liaokpoMJZZGG7Fi',
      clientSecret: '4709e41b1ebcb10869d3db4ea1b07ec41afa0744',
    }),
  ],
  secret: 'github-issue-tracker-secret-123456',
})