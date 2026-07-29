import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { name: true, email: true } },
      _count: { select: { chapters: true } },
    },
  });

  const completedCount = await prisma.progress.count({
    where: { userId: user.id, status: "COMPLETED" },
  });

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user.name ?? "builder"}
          </h1>
          <p className="mt-1 text-slate-500">
            Pick a track and keep building real systems.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-orange-600">
          <Flame className="h-5 w-5" />
          <span className="font-semibold">{user.streakCount}</span>
          <span className="text-sm">day streak</span>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sections completed</CardDescription>
            <CardTitle className="text-3xl">{completedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available courses</CardDescription>
            <CardTitle className="text-3xl">{courses.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your role</CardDescription>
            <CardTitle className="text-3xl">{user.role}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <h2 className="mb-4 text-xl font-semibold text-slate-900">Courses</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {course._count.chapters} chapters · by{" "}
                {course.author.name ?? course.author.email}
              </span>
              <Button asChild size="sm">
                <Link href={`/courses/${course.id}`}>
                  Start <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
