import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} courses={courses} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
