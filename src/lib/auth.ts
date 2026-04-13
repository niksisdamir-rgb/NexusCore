import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import * as bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Elkonmix Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@elkonmix.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const operator = await prisma.operator.findUnique({
          where: { email: credentials.email },
        });

        if (!operator || !operator.password) {
          throw new Error("Operator not found");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          operator.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: operator.id.toString(),
          email: operator.email,
          name: operator.name,
          role: operator.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
