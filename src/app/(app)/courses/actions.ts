"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function setSectionStatus(
  sectionId: string,
  completed: boolean,
  savedCode?: string
) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: { chapter: { select: { courseId: true } } },
  });
  if (!section) throw new Error("Section not found");

  await prisma.progress.upsert({
    where: { userId_sectionId: { userId: session.userId, sectionId } },
    create: {
      userId: session.userId,
      sectionId,
      status: completed ? "COMPLETED" : "PENDING",
      savedCode,
    },
    update: {
      status: completed ? "COMPLETED" : "PENDING",
      ...(savedCode !== undefined ? { savedCode } : {}),
    },
  });

  revalidatePath(`/courses/${section.chapter.courseId}`);
}
