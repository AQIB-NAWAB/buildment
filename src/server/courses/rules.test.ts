import { describe, expect, it } from "vitest";
import {
  canReviewCourse,
  getCourseReviewerRole,
  isCourseInPublicCatalog,
  isOrgAdminOf,
  isPlatformAdmin,
  DEFAULT_ORG_COURSE_VISIBILITY,
  DEFAULT_COURSE_LISTING_STATUS,
  type UserContext,
} from "./rules";

describe("Course Domain Rules", () => {
  describe("Review Lane Determination", () => {
    it("routes solo/platform courses (organizationId = null) to PLATFORM_ADMIN", () => {
      expect(getCourseReviewerRole({ organizationId: null })).toBe("PLATFORM_ADMIN");
    });

    it("routes organization courses (organizationId = 'dev-weekend') to ORG_ADMIN", () => {
      expect(getCourseReviewerRole({ organizationId: "dev-weekend" })).toBe("ORG_ADMIN");
    });
  });

  describe("Review Authority Permissions", () => {
    const platformAdmin: UserContext = {
      id: "admin_1",
      role: "PLATFORM_ADMIN",
    };

    const soloMentor: UserContext = {
      id: "mentor_1",
      role: "MENTOR",
    };

    const devWeekendOrgAdmin: UserContext = {
      id: "org_admin_1",
      role: "MENTOR",
      organizationMemberships: [
        { organizationId: "dev-weekend", role: "ORG_ADMIN" },
      ],
    };

    const otherOrgAdmin: UserContext = {
      id: "org_admin_2",
      role: "MENTOR",
      organizationMemberships: [
        { organizationId: "other-org", role: "ORG_ADMIN" },
      ],
    };

    const devWeekendMentee: UserContext = {
      id: "mentee_1",
      role: "MENTEE",
      organizationMemberships: [
        { organizationId: "dev-weekend", role: "MENTEE" },
      ],
    };

    it("allows Platform Admin to review solo courses", () => {
      expect(canReviewCourse(platformAdmin, { organizationId: null })).toBe(true);
    });

    it("allows Platform Admin to review organization courses", () => {
      expect(canReviewCourse(platformAdmin, { organizationId: "dev-weekend" })).toBe(true);
    });

    it("denies solo mentors from reviewing solo courses", () => {
      expect(canReviewCourse(soloMentor, { organizationId: null })).toBe(false);
    });

    it("allows Org Admin to review courses belonging to their organization", () => {
      expect(canReviewCourse(devWeekendOrgAdmin, { organizationId: "dev-weekend" })).toBe(true);
    });

    it("denies Org Admin from reviewing solo courses", () => {
      expect(canReviewCourse(devWeekendOrgAdmin, { organizationId: null })).toBe(false);
    });

    it("denies Org Admin from reviewing courses belonging to another organization", () => {
      expect(canReviewCourse(devWeekendOrgAdmin, { organizationId: "other-org" })).toBe(false);
      expect(canReviewCourse(otherOrgAdmin, { organizationId: "dev-weekend" })).toBe(false);
    });

    it("denies regular organization members (mentees/mentors without ORG_ADMIN) from reviewing", () => {
      expect(canReviewCourse(devWeekendMentee, { organizationId: "dev-weekend" })).toBe(false);
    });
  });

  describe("Public Directory Requirements", () => {
    it("appears in public catalog only when APPROVED, PUBLIC_DIRECTORY, and PUBLISHED", () => {
      expect(
        isCourseInPublicCatalog({
          status: "PUBLISHED",
          listingStatus: "APPROVED",
          visibility: "PUBLIC_DIRECTORY",
        })
      ).toBe(true);
    });

    it("does NOT appear if status is DRAFT (not yet published)", () => {
      expect(
        isCourseInPublicCatalog({
          status: "DRAFT",
          listingStatus: "APPROVED",
          visibility: "PUBLIC_DIRECTORY",
        })
      ).toBe(false);
    });

    it("does NOT appear if listingStatus is SUBMITTED or DRAFT or REJECTED", () => {
      expect(
        isCourseInPublicCatalog({
          status: "PUBLISHED",
          listingStatus: "SUBMITTED",
          visibility: "PUBLIC_DIRECTORY",
        })
      ).toBe(false);

      expect(
        isCourseInPublicCatalog({
          status: "PUBLISHED",
          listingStatus: "DRAFT",
          visibility: "PUBLIC_DIRECTORY",
        })
      ).toBe(false);

      expect(
        isCourseInPublicCatalog({
          status: "PUBLISHED",
          listingStatus: "REJECTED",
          visibility: "PUBLIC_DIRECTORY",
        })
      ).toBe(false);
    });

    it("does NOT appear if visibility is PRIVATE or UNLISTED even if APPROVED and PUBLISHED", () => {
      expect(
        isCourseInPublicCatalog({
          status: "PUBLISHED",
          listingStatus: "APPROVED",
          visibility: "PRIVATE",
        })
      ).toBe(false);

      expect(
        isCourseInPublicCatalog({
          status: "PUBLISHED",
          listingStatus: "APPROVED",
          visibility: "UNLISTED",
        })
      ).toBe(false);
    });
  });

  describe("Defaults", () => {
    it("defaults organization courses to PRIVATE", () => {
      expect(DEFAULT_ORG_COURSE_VISIBILITY).toBe("PRIVATE");
    });

    it("defaults listing status to DRAFT", () => {
      expect(DEFAULT_COURSE_LISTING_STATUS).toBe("DRAFT");
    });
  });
});
