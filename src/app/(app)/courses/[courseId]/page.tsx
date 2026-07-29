import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ListChecks,
  HelpCircle,
  Hammer,
  Lock,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LearnSection } from "@/components/sections/learn-section";
import { QuizSection, type QuizData } from "@/components/sections/quiz-section";
import { ChecklistSection } from "@/components/sections/checklist-section";
import { BuildSection } from "@/components/sections/build-section";

const typeMeta: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  LEARN: { label: "Learn", icon: BookOpen },
  QUIZ: { label: "Quiz", icon: HelpCircle },
  BUILD: { label: "Build", icon: Hammer },
  CHECKLIST: { label: "Checklist", icon: ListChecks },
};

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ chapter?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { courseId } = await params;
  const { chapter: chapterParam } = await searchParams;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { orderIndex: "asc" },
        include: {
          sections: { orderBy: { orderIndex: "asc" } },
        },
      },
    },
  });

  if (!course) notFound();

  const activeChapter =
    course.chapters.find((c) => c.id === chapterParam) ?? course.chapters[0];

  const progress = await prisma.progress.findMany({
    where: {
      userId: user.id,
      section: { chapter: { courseId } },
    },
    select: { sectionId: true, status: true },
  });
  const completedIds = new Set(
    progress.filter((p) => p.status === "COMPLETED").map((p) => p.sectionId)
  );

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-8 py-10">
      {/* Chapter rail */}
      <div className="w-64 shrink-0">
        <h2 className="mb-1 text-lg font-bold text-slate-900">{course.title}</h2>
        <p className="mb-4 text-sm text-slate-500">{course.description}</p>
        <ol className="space-y-1">
          {course.chapters.map((ch, idx) => {
            const total = ch.sections.length;
            const done = ch.sections.filter((s) =>
              completedIds.has(s.id)
            ).length;
            const chapterDone = total > 0 && done === total;
            const isActive = ch.id === activeChapter?.id;
            return (
              <li key={ch.id}>
                <Link
                  href={`/courses/${courseId}?chapter=${ch.id}`}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                    isActive
                      ? "bg-indigo-50 font-medium text-indigo-700"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {chapterDone ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                  )}
                  <span className="truncate">
                    {idx + 1}. {ch.actionTitle}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Active chapter sections */}
      <div className="min-w-0 flex-1 space-y-6">
        {!activeChapter ? (
          <p className="text-slate-500">This course has no chapters yet.</p>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
                Chapter
              </p>
              <h1 className="text-2xl font-bold text-slate-900">
                {activeChapter.actionTitle}
              </h1>
            </div>

            {activeChapter.sections.map((section) => {
              const meta = typeMeta[section.type];
              const Icon = meta?.icon ?? BookOpen;
              const isDone = completedIds.has(section.id);
              return (
                <Card key={section.id}>
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className="h-4 w-4 text-indigo-600" />
                      {section.title}
                    </CardTitle>
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                        isDone
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" /> Pending
                        </>
                      )}
                    </span>
                  </CardHeader>
                  <CardContent>
                    {renderSection(section, isDone, courseId)}
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

type SectionRow = {
  id: string;
  type: string;
  title: string;
  contentMd: string;
};

function renderSection(section: SectionRow, isDone: boolean, courseId: string) {
  switch (section.type) {
    case "LEARN":
      return <LearnSection content={section.contentMd} />;
    case "QUIZ": {
      const quiz = safeParse<QuizData>(section.contentMd);
      if (!quiz) return <LearnSection content={section.contentMd} />;
      return (
        <QuizSection sectionId={section.id} quiz={quiz} completed={isDone} />
      );
    }
    case "CHECKLIST": {
      const items = safeParse<string[]>(section.contentMd) ?? [];
      return (
        <ChecklistSection
          sectionId={section.id}
          items={items}
          completed={isDone}
        />
      );
    }
    case "BUILD":
      return (
        <BuildSection
          courseId={courseId}
          sectionId={section.id}
          instructions={section.contentMd}
          completed={isDone}
        />
      );
    default:
      return <LearnSection content={section.contentMd} />;
  }
}

function safeParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
