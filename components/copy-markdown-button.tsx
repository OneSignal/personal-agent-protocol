"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "./button";

// Copies the Markdown version of a page, such as /docs/spec.md, to the clipboard.
export function CopyMarkdownButton({ href }: { href: string }) {
    const [state, setState] = useState<"ready" | "copied" | "failed">("ready");

    async function copy() {
        try {
            const response = await fetch(href);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            await navigator.clipboard.writeText(await response.text());
            setState("copied");
        } catch {
            setState("failed");
        }
        setTimeout(() => setState("ready"), 1500);
    }

    return (
        <>
            <Button size="sm" className="md-copy" onClick={copy} title="Copy this page as Markdown">
                {state === "copied" ? <Check size={14} /> : <Copy size={14} />}
                {state === "copied"
                    ? "Copied"
                    : state === "failed"
                      ? "Copy failed, try again"
                      : "Copy page"}
            </Button>
            <span className="sr-only" role="status">
                {state === "copied" ? "Page copied" : state === "failed" ? "Copy failed" : ""}
            </span>
        </>
    );
}
