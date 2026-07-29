import Link from "next/link";
import { Terminal, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  courseId: string;
  sectionId: string;
  instructions: string;
  completed: boolean;
};

/**
 * Launches the Phase 3 in-browser Workbench (WebContainer + Monaco + Xterm +
 * PGlite). The "Save & Verify" action that persists a code snapshot to
 * Progress lives inside the Workbench itself.
 */
export function BuildSection({
  courseId,
  sectionId,
  instructions,
  completed,
}: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">{instructions}</p>
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white">
          <Terminal className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-900">In-browser Workbench</p>
          <p className="text-xs text-slate-500">
            Edit code, run a Node server, and query Postgres — all in your browser.
          </p>
        </div>
        {completed && (
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3 w-3" /> Verified
          </span>
        )}
        <Button asChild size="sm">
          <Link href={`/courses/${courseId}/build/${sectionId}`}>
            Open Workbench <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
