/**
 * @vercel-platform auth — AUTH_SECRET, NEXTAUTH_URL, AUTH_URL, NEXT_PUBLIC_APP_URL, Google OAuth URIs
 * @see docs/vercel-platform-touchpoints.md
 */
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { verifyArtisanWithGovernment } from "@/lib/government";
import { prisma } from "@/lib/prisma";

const googleConfigured =
  Boolean(process.env.AUTH_GOOGLE_ID) && Boolean(process.env.AUTH_GOOGLE_SECRET);

/**
 * Auth.js requires a non-empty secret. Production must set AUTH_SECRET (or NEXTAUTH_SECRET).
 * In development only, a fallback avoids MissingSecret when .env is misnamed or empty.
 */
const authSecret =
  process.env.AUTH_SECRET?.trim() ||
  process.env.NEXTAUTH_SECRET?.trim() ||
  (process.env.NODE_ENV === "development" ? "dev-only-auth-secret-not-for-production" : undefined);

function googleProvider() {
  return Google({
    clientId: process.env.AUTH_GOOGLE_ID as string,
    clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    issuer: "https://accounts.google.com",
    /**
     * Use string URLs (not `new URL(...)`) so Turbopack/SSR does not break `URL` identity
     * (avoids "Receiver must be an instance of class URL" when `auth()` runs in the layout).
     */
    authorization: {
      url: "https://accounts.google.com/o/oauth2/v2/auth",
    },
    token: {
      url: "https://oauth2.googleapis.com/token",
    },
    userinfo: {
      url: "https://openidconnect.googleapis.com/v1/userinfo",
    },
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  secret: authSecret,
  debug: process.env.AUTH_DEBUG === "true",
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers: [
    ...(googleConfigured ? [googleProvider()] : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  events: {
    /**
     * Ensures ArtisanProfile exists and runs the government verification stub
     * (same integration surface as registration). Keeps OAuth + credentials aligned.
     * Must not throw — failures would break OAuth after a successful Google callback.
     */
    async signIn({ user }) {
      if (!user?.id) return;

      try {
        await prisma.artisanProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            displayName: user.name ?? null,
            verificationStatus: "PENDING",
          },
          update: {},
        });

        const gov = await verifyArtisanWithGovernment({
          email: user.email,
          displayName: user.name ?? null,
          externalPortalId: null,
        });

        await prisma.artisanProfile.update({
          where: { userId: user.id },
          data: {
            verificationStatus: gov.status,
            externalPortalId: gov.externalPortalId ?? undefined,
          },
        });
      } catch (err) {
        console.error("[auth] signIn event (profile / government stub) failed:", err);
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
