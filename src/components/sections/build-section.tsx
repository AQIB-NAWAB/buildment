"use client";

import { useTransition } from "react";
import { Terminal, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setSectionStatus } from "@/app/(app)/courses/actions";

type Props = {
  sectionId: string;
  instructions: string;
  completed: boolean;
};

/**
 * Phase 3 (WebContainers + Monaco + Xterm + PGlite) mounts here.
 * This is a functional placeholder that persists a code snapshot to Progress
 * via the same "Save & Verify" action the full Workbench will use.
 */
export function BuildSection({ sectionId, instructions, completed }: Props) {
  const [isPending, startTransition] = useTransition();

  function saveAndVerify() {
    startTransition(async () => {
      await setSectionStatus(
        sectionId,
        true,
        "// snapshot placeholder — WebContainer workbench arrives in Phase 3"
      );
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">{instructions}</p>
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-2 text-xs text-slate-400">
          <Terminal className="h-3.5 w-3.5" />
          workbench (WebContainer) — coming in Phase 3
        </div>
        <pre className="overflow-x-auto p-4 text-sm text-slate-300">
          <code>{`$ npm run dev
> vite

  VITE ready in 312 ms
  ➜  Local:   http://localhost:5173/`}</code>
        </pre>
      </div>
      <Button onClick={saveAndVerify} disabled={completed || isPending} size="sm">
        <Save className="h-4 w-4" />
        {completed
          ? "Saved & verified"
          : isPending
            ? "Saving…"
            : "Save & Verify"}
      </Button>
    </div>
  );
}
