
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const uri = process.env.MONGODB_URI

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        try {
          const client = new MongoClient(uri)
          await client.connect()
          const db = client.db()

          // Check if user exists
          let user = await db.collection('users').findOne({ email: credentials.email })

          // Create default users if they don't exist
          if (!user) {
            const defaultUsers = [
              { email: 'ceo@company.com', password: await bcrypt.hash('password', 12), role: 'ceo', name: 'CEO' },
              { email: 'user@company.com', password: await bcrypt.hash('password', 12), role: 'user', name: 'User' }
            ]

            // Create zone managers
            for (let i = 1; i <= 13; i++) {
              defaultUsers.push({
                email: `manager${i}@company.com`,
                password: await bcrypt.hash('password', 12),
                role: 'zone_manager',
                name: `Zone Manager ${i}`,
                assignedZone: i
              })
            }

            await db.collection('users').insertMany(defaultUsers)
            user = await db.collection('users').findOne({ email: credentials.email })
          }

          await client.close()

          if (user && await bcrypt.compare(credentials.password, user.password)) {
            return {
              id: user._id,
              email: user.email,
              name: user.name,
              role: user.role,
              assignedZone: user.assignedZone
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.assignedZone = user.assignedZone
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      session.user.assignedZone = token.assignedZone
      return session
    }
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
