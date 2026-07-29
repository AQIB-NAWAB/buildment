import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const teacherPassword = await bcrypt.hash("password123", 10);

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@buildmint.dev" },
    update: {},
    create: {
      email: "teacher@buildmint.dev",
      name: "Grace Hopper",
      passwordHash: teacherPassword,
      role: "TEACHER",
    },
  });

  // Reset demo course so seed is idempotent.
  await prisma.course.deleteMany({
    where: { title: "Build a URL Shortener" },
  });

  const course = await prisma.course.create({
    data: {
      title: "Build a URL Shortener",
      description:
        "Ship a production-style link shortener while learning core backend system design.",
      authorId: teacher.id,
      isPublished: true,
      repoUrl: "https://github.com/buildmint/url-shortener-track",
      chapters: {
        create: [
          {
            actionTitle: "Design the data model",
            orderIndex: 0,
            systemPrompt:
              "Ensure the student uses a hash/base62 encoding, not an auto-increment leak, and indexes the slug column.",
            sections: {
              create: [
                {
                  type: "LEARN",
                  title: "Why URL shorteners are a systems problem",
                  orderIndex: 0,
                  contentMd: [
                    "## The core idea",
                    "",
                    "A URL shortener maps a **short slug** to a **long URL**. Sounds trivial, but at scale it forces you to reason about:",
                    "",
                    "- **Key generation** — random vs. sequential (and why sequential leaks traffic).",
                    "- **Read/write ratio** — reads dominate massively, so caching matters.",
                    "- **Storage** — you need a fast lookup on the `slug` column.",
                    "",
                    "```ts",
                    "type Link = { slug: string; url: string; clicks: number };",
                    "```",
                    "",
                    "> We'll build this incrementally, verifying each step in your browser sandbox.",
                  ].join("\n"),
                },
                {
                  type: "QUIZ",
                  title: "Pick the safe key strategy",
                  orderIndex: 1,
                  contentMd: JSON.stringify({
                    question:
                      "Which slug-generation strategy avoids leaking how many links exist?",
                    options: [
                      "Auto-incrementing integer IDs",
                      "Random base62 tokens",
                      "Sequential timestamps",
                      "The user's email address",
                    ],
                    answerIndex: 1,
                  }),
                },
              ],
            },
          },
          {
            actionTitle: "Implement the redirect endpoint",
            orderIndex: 1,
            systemPrompt:
              "Flag O(n) scans of the links table; the lookup must use an indexed slug query.",
            sections: {
              create: [
                {
                  type: "BUILD",
                  title: "Wire up GET /:slug",
                  orderIndex: 0,
                  contentMd:
                    "Create an Express route that looks up the slug and 302-redirects to the stored URL. Use the in-browser Postgres (PGlite) for storage. Click Save & Verify when your server responds.",
                },
                {
                  type: "CHECKLIST",
                  title: "Ship checklist",
                  orderIndex: 1,
                  contentMd: JSON.stringify([
                    "Redirect returns HTTP 302 with the Location header",
                    "Unknown slug returns HTTP 404",
                    "Slug lookup uses an index (no full-table scan)",
                  ]),
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`Seeded course "${course.title}" by ${teacher.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
