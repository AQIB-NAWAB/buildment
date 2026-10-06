import type { Role } from "@/generated/prisma/client";

// Pure authorization decisions, deliberately free of any Next.js/Auth.js/Prisma
// runtime imports so they're trivial to unit test — see guards.test.ts and
// guards.test.ts. `guards.ts` wraps these with the actual
// auth()/redirect()/database calls.

export function isPlatformAdmin(role: Role): boolean {
  return role === "PLATFORM_ADMIN";
}

export function canAccessRole(userRole: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(userRole);
}

export function isMentorOfCourse(
  userId: string,
  userRole: Role,
  course: { mentorId: string }
): boolean {
  return isPlatformAdmin(userRole) || course.mentorId === userId;
}

export function homeRouteForRole(
  role: Role | "ORG_ADMIN",
  orgSlug?: string
): string {
  switch (role) {
    case "PLATFORM_ADMIN":
      return "/admin";
    case "ORG_ADMIN":
      return orgSlug ? `/org/${orgSlug}` : "/org";
    case "MENTOR":
      return "/workspace";
    case "MENTEE":
      return "/dashboard";
    default:
      return "/";
  }
}
