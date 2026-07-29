"use client";

import { useRef, useState } from "react";
import { Database, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_SQL = `CREATE TABLE IF NOT EXISTS links (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  url text NOT NULL
);
INSERT INTO links (slug, url) VALUES ('bm', 'https://buildmint.dev')
  ON CONFLICT (slug) DO NOTHING;
SELECT * FROM links;`;

type Row = Record<string, unknown>;

export function PGlitePanel() {
  const [sql, setSql] = useState(DEFAULT_SQL);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Keep one in-browser Postgres (PGlite/WASM) instance for the session.
  const dbRef = useRef<import("@electric-sql/pglite").PGlite | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      if (!dbRef.current) {
        const { PGlite } = await import("@electric-sql/pglite");
        dbRef.current = new PGlite();
      }
      const db = dbRef.current;
      // Run every statement; keep the result of the last SELECT.
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
      let lastRows: Row[] = [];
      for (const stmt of statements) {
        const res = await db.query(stmt);
        if (res.rows) lastRows = res.rows as Row[];
      }
      setRows(lastRows);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setRows(null);
    } finally {
      setBusy(false);
    }
  }

  const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="flex h-full flex-col bg-slate-950 p-3 text-slate-200">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Database className="h-3.5 w-3.5" /> In-browser PostgreSQL (PGlite / WASM)
        </span>
        <Button size="sm" onClick={run} disabled={busy}>
          <Play className="h-3.5 w-3.5" /> {busy ? "Running…" : "Run query"}
        </Button>
      </div>
      <textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        spellCheck={false}
        className="h-28 w-full resize-none rounded border border-slate-800 bg-slate-900 p-2 font-mono text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <div className="mt-2 min-h-0 flex-1 overflow-auto rounded border border-slate-800 bg-slate-900 p-2 text-xs">
        {error && <p className="font-mono text-red-400">{error}</p>}
        {!error && rows && rows.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th
                    key={c}
                    className="border-b border-slate-700 px-2 py-1 text-left font-semibold text-slate-300"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c} className="border-b border-slate-800 px-2 py-1 font-mono text-slate-300">
                      {String(r[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!error && rows && rows.length === 0 && (
          <p className="text-slate-500">Statement executed. No rows returned.</p>
        )}
        {!error && !rows && (
          <p className="text-slate-500">Run the query to see results from your in-browser database.</p>
        )}
      </div>
    </div>
  );
}
