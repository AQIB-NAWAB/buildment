"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  Save,
  TerminalSquare,
  Database,
  Loader2,
  CheckCircle2,
  Monitor,
} from "lucide-react";
import type { WebContainer } from "@webcontainer/api";
import type { Terminal } from "@xterm/xterm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setSectionStatus } from "@/app/(app)/courses/actions";
import { buildFileTree, DEFAULT_SERVER_CODE } from "@/lib/sandbox-files";
import { PGlitePanel } from "@/components/workbench/pglite-panel";

type Props = {
  sectionId: string;
  title: string;
  instructions: string;
  initialCode?: string | null;
  alreadyCompleted?: boolean;
};

type Status = "booting" | "starting" | "ready" | "error";
type BottomTab = "terminal" | "database";

export function Workbench({
  sectionId,
  title,
  instructions,
  initialCode,
  alreadyCompleted = false,
}: Props) {
  const [code, setCode] = useState(initialCode?.trim() || DEFAULT_SERVER_CODE);
  const [status, setStatus] = useState<Status>("booting");
  const [statusText, setStatusText] = useState("Booting WebContainer…");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const [bottomTab, setBottomTab] = useState<BottomTab>("terminal");
  const [saved, setSaved] = useState(alreadyCompleted);
  const [isSaving, startSaving] = useTransition();

  const termElRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const wcRef = useRef<WebContainer | null>(null);
  const procRef = useRef<Awaited<ReturnType<WebContainer["spawn"]>> | null>(null);
  const codeRef = useRef(code);
  const bootedRef = useRef(false);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  async function startServer() {
    const wc = wcRef.current;
    const term = termRef.current;
    if (!wc || !term) return;

    setStatus("starting");
    setStatusText("Starting server…");

    if (procRef.current) {
      try {
        procRef.current.kill();
      } catch {
        // ignore
      }
    }

    term.write("\r\n\x1b[36m$ node server.js\x1b[0m\r\n");
    const proc = await wc.spawn("node", ["server.js"]);
    procRef.current = proc;
    proc.output.pipeTo(
      new WritableStream({
        write(data) {
          term.write(data);
        },
      })
    );
  }

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    let disposed = false;

    (async () => {
      try {
        const [{ getWebContainer }, xtermMod, fitMod] = await Promise.all([
          import("@/lib/webcontainer"),
          import("@xterm/xterm"),
          import("@xterm/addon-fit"),
        ]);

        if (typeof window !== "undefined" && !window.crossOriginIsolated) {
          throw new Error(
            "This page is not cross-origin isolated, so SharedArrayBuffer is unavailable. Check the COOP/COEP headers."
          );
        }

        const term = new xtermMod.Terminal({
          convertEol: true,
          fontSize: 12,
          cursorBlink: false,
          theme: { background: "#0b1020", foreground: "#e2e8f0" },
        });
        const fit = new fitMod.FitAddon();
        term.loadAddon(fit);
        if (termElRef.current) {
          term.open(termElRef.current);
          fit.fit();
        }
        termRef.current = term;
        window.addEventListener("resize", () => fit.fit());

        term.write(
          "\x1b[90mBooting WebContainer runtime (hosted by StackBlitz)…\x1b[0m\r\n"
        );
        const wc = await withTimeout(
          getWebContainer(),
          45000,
          "WebContainer runtime did not initialize within 45s. This usually means the StackBlitz-hosted runtime could not be reached from this browser/network."
        );
        if (disposed) return;
        wcRef.current = wc;

        wc.on("server-ready", (_port, url) => {
          if (disposed) return;
          setPreviewUrl(url);
          setStatus("ready");
          setStatusText("Server ready");
        });
        wc.on("error", (err) => {
          term.write(`\r\n\x1b[31m${err.message}\x1b[0m\r\n`);
        });

        await wc.mount(buildFileTree(codeRef.current));
        if (disposed) return;

        await startServer();
      } catch (e) {
        if (disposed) return;
        const message =
          e instanceof Error ? e.message : "Failed to boot sandbox";
        setStatus("error");
        setStatusText("Sandbox unavailable");
        setBootError(message);
        termRef.current?.write(`\r\n\x1b[31m${message}\x1b[0m\r\n`);
      }
    })();

    return () => {
      disposed = true;
    };
  }, []);

  async function handleRun() {
    const wc = wcRef.current;
    if (!wc) return;
    await wc.fs.writeFile("server.js", codeRef.current);
    setPreviewUrl(null);
    await startServer();
  }

  function handleSave() {
    startSaving(async () => {
      await setSectionStatus(sectionId, true, codeRef.current);
      setSaved(true);
    });
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-slate-900">{title}</h1>
          <p className="truncate text-xs text-slate-500">{instructions}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={status} text={statusText} />
          <Button size="sm" variant="outline" onClick={handleRun} disabled={status === "booting"}>
            <Play className="h-4 w-4" /> Run
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> {isSaving ? "Saving…" : "Save & Verify"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="grid min-h-0 flex-1 grid-cols-2">
        <div className="min-h-0 border-r border-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
            server.js
          </div>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        <div className="flex min-h-0 flex-col bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
            <Monitor className="h-3.5 w-3.5" /> Preview
          </div>
          <div className="min-h-0 flex-1 bg-slate-100">
            {previewUrl ? (
              <iframe
                title="preview"
                src={previewUrl}
                className="h-full w-full border-0 bg-white"
              />
            ) : status === "error" ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                <p className="text-sm font-medium text-red-600">
                  Live runtime unavailable
                </p>
                <p className="max-w-sm text-xs text-slate-500">{bootError}</p>
                <p className="max-w-sm text-xs text-slate-400">
                  The editor and the in-browser Postgres (Database tab) still
                  work — the Node runtime/preview needs the StackBlitz-hosted
                  WebContainer service, which this environment can&apos;t reach.
                </p>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Waiting for server…
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom panel: terminal / database */}
      <div className="flex h-72 flex-col border-t border-slate-200">
        <div className="flex h-10 shrink-0 items-center gap-1 border-b border-slate-200 bg-slate-100 px-2">
          <TabButton
            active={bottomTab === "terminal"}
            onClick={() => setBottomTab("terminal")}
            icon={<TerminalSquare className="h-4 w-4" />}
            label="Terminal"
          />
          <TabButton
            active={bottomTab === "database"}
            onClick={() => setBottomTab("database")}
            icon={<Database className="h-4 w-4" />}
            label="Database"
          />
        </div>
        <div className="min-h-0 flex-1">
          <div className={cn("h-full", bottomTab === "terminal" ? "block" : "hidden")}>
            <div ref={termElRef} className="h-full w-full bg-[#0b1020] p-2" />
          </div>
          <div className={cn("h-full", bottomTab === "database" ? "block" : "hidden")}>
            <PGlitePanel />
          </div>
        </div>
      </div>
    </div>
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

function StatusPill({ status, text }: { status: Status; text: string }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        status === "ready" && "bg-green-50 text-green-700",
        status === "error" && "bg-red-50 text-red-700",
        (status === "booting" || status === "starting") && "bg-slate-100 text-slate-600"
      )}
    >
      {status === "ready" ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : status === "error" ? null : (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      )}
      {text}
    </span>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-full items-center gap-1.5 border-b-2 px-4 text-sm font-medium",
        active
          ? "border-indigo-600 bg-white text-indigo-700"
          : "border-transparent text-slate-600 hover:bg-slate-200/60 hover:text-slate-800"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
