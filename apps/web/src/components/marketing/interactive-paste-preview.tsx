"use client";

import { useState } from "react";
import { ClipboardPaste } from "lucide-react";
import { parseBulkPaste } from "@postwave/shared";

export function InteractivePastePreview() {
  const [input, setInput] = useState(
    `2026-06-10 09:00 | Morning hook\n2026-06-10 14:00 | Product update\nDraft line without time`
  );

  const preview = input.trim() ? parseBulkPaste(input, "UTC") : [];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl lg:col-span-2">
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <ClipboardPaste className="h-3.5 w-3.5 text-sky-400" />
        <span className="font-mono text-xs text-zinc-500">bulk-paste · live preview</span>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="min-h-[120px] flex-1 resize-none bg-transparent p-5 font-mono text-xs leading-relaxed text-zinc-300 focus:outline-none"
        spellCheck={false}
      />
      {preview.length > 0 && (
        <div className="border-t border-zinc-800 p-3 text-xs">
          {preview.map((line) => (
            <div
              key={line.lineNumber}
              className={`py-1 ${line.error ? "text-red-400" : "text-zinc-500"}`}
            >
              #{line.lineNumber}:{" "}
              {line.error ?? (line.isDraft ? "Draft" : "Ready")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
