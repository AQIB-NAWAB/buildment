"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { setSectionStatus } from "@/app/(app)/courses/actions";

type Props = {
  sectionId: string;
  items: string[];
  completed: boolean;
};

export function ChecklistSection({ sectionId, items, completed }: Props) {
  const [checked, setChecked] = useState<boolean[]>(
    items.map(() => completed)
  );
  const [isPending, startTransition] = useTransition();

  const allChecked = checked.every(Boolean);

  function toggle(index: number, value: boolean) {
    const next = [...checked];
    next[index] = value;
    setChecked(next);

    const done = next.every(Boolean);
    startTransition(async () => {
      await setSectionStatus(sectionId, done);
    });
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <label
          key={i}
          className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white p-3 hover:bg-slate-50"
        >
          <Checkbox
            checked={checked[i]}
            onCheckedChange={(v) => toggle(i, Boolean(v))}
          />
          <span className="text-sm text-slate-700">{item}</span>
        </label>
      ))}
      {allChecked && (
        <p className="text-sm font-medium text-green-600">
          {isPending ? "Saving…" : "Checklist complete — next chapter unlocked."}
        </p>
      )}
    </div>
  );
}
