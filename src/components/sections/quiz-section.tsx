"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setSectionStatus } from "@/app/(app)/courses/actions";
import { cn } from "@/lib/utils";

export type QuizData = {
  question: string;
  options: string[];
  answerIndex: number;
};

type Props = {
  sectionId: string;
  quiz: QuizData;
  completed: boolean;
};

export function QuizSection({ sectionId, quiz, completed }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(
    completed ? "correct" : null
  );
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (selected === null) return;
    const isCorrect = selected === quiz.answerIndex;
    setResult(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      startTransition(async () => {
        await setSectionStatus(sectionId, true);
      });
    }
  }

  return (
    <div className="space-y-4">
      <p className="font-medium text-slate-900">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = result && i === quiz.answerIndex;
          const showWrong = result === "wrong" && isSelected;
          return (
            <button
              key={i}
              type="button"
              onClick={() => result !== "correct" && setSelected(i)}
              className={cn(
                "flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition-colors",
                isSelected
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:bg-slate-50",
                showCorrect && "border-green-500 bg-green-50",
                showWrong && "border-red-500 bg-red-50"
              )}
            >
              <span>{opt}</span>
              {showCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              {showWrong && <XCircle className="h-4 w-4 text-red-600" />}
            </button>
          );
        })}
      </div>

      {result === "correct" ? (
        <p className="text-sm font-medium text-green-600">
          {isPending ? "Saving…" : "Correct! Section completed."}
        </p>
      ) : (
        <div className="flex items-center gap-3">
          <Button onClick={submit} disabled={selected === null} size="sm">
            Submit answer
          </Button>
          {result === "wrong" && (
            <span className="text-sm text-red-600">Not quite — try again.</span>
          )}
        </div>
      )}
    </div>
  );
}
