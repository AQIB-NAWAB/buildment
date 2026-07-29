import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import WorkbenchClient from "@/components/workbench/workbench-client";

export default async function BuildWorkbenchPage({
  params,
}: {
  params: Promise<{ courseId: string; sectionId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { courseId, sectionId } = await params;

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { chapter: { select: { courseId: true, actionTitle: true } } },
  });

  if (!section || section.chapter.courseId !== courseId) notFound();

  const progress = await prisma.progress.findUnique({
    where: { userId_sectionId: { userId: user.id, sectionId } },
    select: { status: true, savedCode: true },
  });

  return (
    <div className="relative">
      <Link
        href={`/courses/${courseId}`}
        className="absolute left-4 top-2 z-10 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to course
      </Link>
      <WorkbenchClient
        sectionId={section.id}
        title={section.title}
        instructions={section.contentMd}
        initialCode={progress?.savedCode ?? null}
        alreadyCompleted={progress?.status === "COMPLETED"}
      />
    </div>
  );
}
