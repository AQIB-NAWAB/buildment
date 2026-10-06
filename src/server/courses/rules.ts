import type {
  Role,
  OrganizationRole,
  ListingStatus,
  Visibility,
  CourseStatus,
} from "@/generated/prisma/client";

export type PlatformRole = Role;
export type OrgRole = OrganizationRole;
export type CourseListingStatus = ListingStatus;
export type CourseVisibility = Visibility;
export type CourseContentStatus = CourseStatus;

export type { Role, OrganizationRole, ListingStatus, Visibility, CourseStatus };

export interface CourseOwnershipContext {
  id?: string;
  mentorId: string;
  createdById: string;
  organizationId: string | null;
  status: CourseContentStatus;
  listingStatus: CourseListingStatus;
  visibility: CourseVisibility;
}

export interface UserContext {
  id: string;
  role: PlatformRole;
  organizationMemberships?: {
    organizationId: string;
    role: OrgRole;
  }[];
}

/**
 * Check if user is a platform admin.
 */
export function isPlatformAdmin(role: PlatformRole): boolean {
  return role === "PLATFORM_ADMIN";
}

/**
 * Check if user is an Org Admin for a specific organization.
 */
export function isOrgAdminOf(user: UserContext, organizationId: string): boolean {
  if (!user.organizationMemberships) return false;
  return user.organizationMemberships.some(
    (m) => m.organizationId === organizationId && m.role === "ORG_ADMIN"
  );
}

/**
 * Check if user is an Org Member (any role: ORG_ADMIN, MENTOR, MENTEE) of an organization.
 */
export function isOrgMemberOf(user: UserContext, organizationId: string): boolean {
  if (!user.organizationMemberships) return false;
  return user.organizationMemberships.some((m) => m.organizationId === organizationId);
}

/**
 * Determine the reviewer role based on course lane:
 * if organizationId == null -> reviewer = PLATFORM_ADMIN
 * else -> reviewer = ORG_ADMIN for that organization
 */
export function getCourseReviewerRole(course: {
  organizationId: string | null;
}): "PLATFORM_ADMIN" | "ORG_ADMIN" {
  return course.organizationId === null ? "PLATFORM_ADMIN" : "ORG_ADMIN";
}

/**
 * Determines whether a user has authority to review/moderate a course submission:
 * - Solo/platform courses (organizationId == null) are reviewed by Platform Admin.
 * - Organization courses (organizationId != null) are reviewed by the Organization Admin
 *   of that specific organization, or platform-wide Platform Admin.
 * - Org Admins cannot review courses of other organizations or solo mentor courses.
 */
export function canReviewCourse(
  user: UserContext,
  course: { organizationId: string | null }
): boolean {
  if (isPlatformAdmin(user.role)) {
    return true;
  }
  if (course.organizationId !== null) {
    return isOrgAdminOf(user, course.organizationId);
  }
  return false;
}

/**
 * Public catalog discovery condition:
 * A course appears in the public directory ONLY when:
 * listingStatus = APPROVED AND visibility = PUBLIC_DIRECTORY AND status = PUBLISHED.
 */
export function isCourseInPublicCatalog(course: {
  status: CourseContentStatus;
  listingStatus: CourseListingStatus;
  visibility: CourseVisibility;
}): boolean {
  return (
    course.listingStatus === "APPROVED" &&
    course.visibility === "PUBLIC_DIRECTORY" &&
    course.status === "PUBLISHED"
  );
}

/**
 * Prisma WHERE condition ensuring public catalog moderation, discovery, and release constraints.
 */
export const PUBLIC_CATALOG_WHERE = {
  status: "PUBLISHED" as const,
  listingStatus: "APPROVED" as const,
  visibility: "PUBLIC_DIRECTORY" as const,
};

/**
 * Default visibility for organization courses is PRIVATE (or UNLISTED).
 * They never automatically enter the public catalog.
 */
export const DEFAULT_ORG_COURSE_VISIBILITY: CourseVisibility = "PRIVATE";

/**
 * Default listing status for newly created courses.
 */
export const DEFAULT_COURSE_LISTING_STATUS: CourseListingStatus = "DRAFT";
