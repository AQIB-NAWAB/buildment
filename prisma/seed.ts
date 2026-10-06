import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SEED_COURSE, SEED_ORGANIZATION, SEED_USERS } from "../src/lib/seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Upsert all seed users
  const users = await Promise.all(
    SEED_USERS.map((seed) =>
      prisma.user.upsert({
        where: { email: seed.email },
        update: { name: seed.name, role: seed.role },
        create: { email: seed.email, name: seed.name, role: seed.role },
      })
    )
  );

  const userByEmail = new Map(users.map((u) => [u.email, u]));

  const mentor = userByEmail.get("mentor@buildment.dev");
  if (!mentor) throw new Error("Morgan Mentor not found in seed users");

  // Seed Public/Platform Solo Mentor Course
  const course = await prisma.course.upsert({
    where: { slug: SEED_COURSE.slug },
    update: {
      sequential: true,
      status: "PUBLISHED",
      listingStatus: "APPROVED",
      visibility: "PUBLIC_DIRECTORY",
      publishedAt: new Date(),
    },
    create: {
      slug: SEED_COURSE.slug,
      title: SEED_COURSE.title,
      description: SEED_COURSE.description,
      projectGoal: SEED_COURSE.projectGoal,
      difficulty: SEED_COURSE.difficulty,
      estimatedHours: SEED_COURSE.estimatedHours,
      status: "PUBLISHED",
      sequential: true,
      mentorId: mentor.id,
      createdById: mentor.id,
      organizationId: null,
      listingStatus: "APPROVED",
      visibility: "PUBLIC_DIRECTORY",
      publishedAt: new Date(),
    },
  });

  // Enroll platform mentees in solo course
  const platformMentees = [
    userByEmail.get("mentee1@buildment.dev")!,
    userByEmail.get("mentee2@buildment.dev")!,
    userByEmail.get("mentee3@buildment.dev")!,
  ];
  const soloCourseEnrollments = [mentor, ...platformMentees];
  await Promise.all(
    soloCourseEnrollments.map((u) =>
      prisma.enrollment.upsert({
        where: { courseId_userId: { courseId: course.id, userId: u.id } },
        update: {},
        create: { courseId: course.id, userId: u.id, status: "ASSIGNED" },
      })
    )
  );

  // --- Seed Organization: Dev Weekend ---
  const devWeekend = await prisma.organization.upsert({
    where: { slug: SEED_ORGANIZATION.slug },
    update: { name: SEED_ORGANIZATION.name },
    create: {
      name: SEED_ORGANIZATION.name,
      slug: SEED_ORGANIZATION.slug,
    },
  });

  // Seed Organization Members: Org Admin, Org Mentor, Org Mentee
  for (const memberSeed of SEED_ORGANIZATION.members) {
    const user = userByEmail.get(memberSeed.email);
    if (!user) continue;

    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: devWeekend.id,
          userId: user.id,
        },
      },
      update: { role: memberSeed.role },
      create: {
        organizationId: devWeekend.id,
        userId: user.id,
        role: memberSeed.role,
      },
    });
  }

  // Seed Dev Weekend Organization Course
  const dwMentor = userByEmail.get("dw-mentor@buildment.dev")!;
  const dwMentee = userByEmail.get("dw-mentee@buildment.dev")!;

  const orgCourse = await prisma.course.upsert({
    where: { slug: "dev-weekend-fullstack-sprint" },
    update: {
      sequential: true,
      status: "PUBLISHED",
      listingStatus: "APPROVED",
      visibility: "PRIVATE",
      publishedAt: new Date(),
    },
    create: {
      slug: "dev-weekend-fullstack-sprint",
      title: "Dev Weekend: Fullstack MVP Sprint",
      description: "Fast-paced cohort sprint building fullstack production applications over a weekend.",
      projectGoal: "Ship a fullstack web product with auth, database, and live deployment in 48 hours.",
      difficulty: "Intermediate",
      estimatedHours: 48,
      status: "PUBLISHED",
      sequential: true,
      mentorId: dwMentor.id,
      createdById: dwMentor.id,
      organizationId: devWeekend.id,
      listingStatus: "APPROVED",
      visibility: "PRIVATE",
      publishedAt: new Date(),
    },
  });

  // Enroll Dev Weekend mentee in the organization course
  await prisma.enrollment.upsert({
    where: { courseId_userId: { courseId: orgCourse.id, userId: dwMentee.id } },
    update: {},
    create: { courseId: orgCourse.id, userId: dwMentee.id, status: "ASSIGNED" },
  });

  console.log("Seeded successfully:");
  console.log(`  Organization: ${devWeekend.name} (${devWeekend.slug})`);
  console.log(`    - Org Admin:  dw-admin@buildment.dev`);
  console.log(`    - Org Mentor: dw-mentor@buildment.dev`);
  console.log(`    - Org Mentee: dw-mentee@buildment.dev`);
  console.log(`    - Org Course: ${orgCourse.title} (visibility: PRIVATE, listingStatus: APPROVED)`);
  console.log(`  Public Solo Course: ${course.title} (visibility: PUBLIC_DIRECTORY)`);
  console.log(`  Platform Admin: platform-admin@buildment.dev`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
