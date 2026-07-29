"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Workbench = dynamic(
  () => import("@/components/workbench/workbench").then((m) => m.Workbench),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading workbench…
      </div>
    ),
  }
);

type Props = {
  sectionId: string;
  title: string;
  instructions: string;
  initialCode?: string | null;
  alreadyCompleted?: boolean;
};

export default function WorkbenchClient(props: Props) {
  return <Workbench {...props} />;
}
