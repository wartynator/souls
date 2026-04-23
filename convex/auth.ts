import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

/**
 * Convex Auth configuration.
 *
 * We use the Password provider — email + password sign up / sign in.
 * No email verification for v1 (keeps setup simple; can add later).
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});
