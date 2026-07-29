import Link from "next/link";
import { BookOpen, LayoutDashboard, LogOut, GraduationCap } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

type Course = {
  id: string;
  title: string;
};

type Props = {
  user: { name: string | null; email: string; role: string; streakCount: number };
  courses: Course[];
};

export function Sidebar({ user, courses }: Props) {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-slate-900">
          Build<span className="text-indigo-600">Mint</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Courses
        </p>
        <div className="mt-2 space-y-1">
          {courses.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-400">No courses yet</p>
          )}
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="truncate">{course.title}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <GraduationCap className="h-4 w-4 text-indigo-600" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">
              {user.name ?? user.email}
            </p>
            <p className="text-xs text-slate-500">
              {user.role} · {user.streakCount} day streak
            </p>
          </div>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm" className="w-full">
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </form>
      </div>
    </aside>
  );
}
