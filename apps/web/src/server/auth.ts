import { type GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions, type DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { env } from "~/env.mjs";
import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }
  
  interface User {
    role: "USER" | "ADMIN";
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, token }) => {
      if (token.sub) {
        // Fetch user role from database
        const user = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub,
            role: user?.role ?? "USER",
          },
        };
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] Authorize called with email:", credentials?.email);
        
        const parsed = credentialsSchema.safeParse(credentials);
        
        if (!parsed.success) {
          console.error("[AUTH] Credentials validation failed:", parsed.error);
          return null;
        }

        const { email, password } = parsed.data;
        console.log("[AUTH] Looking up user:", email);

        // Find user by email
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user) {
          console.log("[AUTH] User not found:", email);
          return null;
        }
        
        if (!user.password) {
          console.log("[AUTH] User has no password (OAuth only?):", email);
          return null;
        }

        console.log("[AUTH] User found, verifying password for:", email);
        
        // Verify password
        const passwordValid = await bcrypt.compare(password, user.password);
        
        if (!passwordValid) {
          console.log("[AUTH] Invalid password for user:", email);
          return null;
        }

        console.log("[AUTH] Authentication successful for:", email, "Role:", user.role);
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role as "USER" | "ADMIN",
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};