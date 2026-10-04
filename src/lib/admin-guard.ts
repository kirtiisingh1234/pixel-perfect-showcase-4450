import { redirect } from "@tanstack/react-router";

/** Route guard: only admins may view admin pages; students are sent to their dashboard. */
export function requireAdmin({ context }: { context: { isAdmin: boolean } }) {
  if (!context.isAdmin) throw redirect({ to: "/dashboard" });
}
