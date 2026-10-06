import { describe, expect, it } from "vitest";
import { canAccessRole, homeRouteForRole, isMentorOfCourse } from "./access-rules";

describe("canAccessRole", () => {
  it("allows a role that's in the allowed list", () => {
    expect(canAccessRole("MENTOR", ["MENTOR", "PLATFORM_ADMIN"])).toBe(true);
  });

  it("rejects a role that's not in the allowed list", () => {
    expect(canAccessRole("MENTEE", ["MENTOR", "PLATFORM_ADMIN"])).toBe(false);
  });
});

describe("isMentorOfCourse", () => {
  it("allows the course's own mentor", () => {
    expect(isMentorOfCourse("user_1", "MENTOR", { mentorId: "user_1" })).toBe(true);
  });

  it("rejects a different mentor", () => {
    expect(isMentorOfCourse("user_2", "MENTOR", { mentorId: "user_1" })).toBe(false);
  });

  it("always allows a platform admin, regardless of ownership", () => {
    expect(isMentorOfCourse("user_2", "PLATFORM_ADMIN", { mentorId: "user_1" })).toBe(true);
  });
});

describe("homeRouteForRole", () => {
  it("routes mentees to the dashboard", () => {
    expect(homeRouteForRole("MENTEE")).toBe("/dashboard");
  });

  it("routes mentors to their course list", () => {
    expect(homeRouteForRole("MENTOR")).toBe("/workspace");
  });

  it("routes platform admins to the admin home", () => {
    expect(homeRouteForRole("PLATFORM_ADMIN")).toBe("/admin");
  });

  it("routes org admins to their organization home", () => {
    expect(homeRouteForRole("ORG_ADMIN", "dev-weekend")).toBe("/org/dev-weekend");
    expect(homeRouteForRole("ORG_ADMIN")).toBe("/org");
  });
});
