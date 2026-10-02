"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { highlight } from "../lib/highlight";
import { Button } from "./button";

// label says what the example shows, such as which party sends a request.
export function CodeBlock({ text, label }: { text: string; label?: string }) {
    const [copyState, setCopyState] = useState<"ready" | "copied" | "failed">("ready");
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pre = useRef<HTMLPreElement>(null);
    // Code wider than the box gets a tab stop, so keyboard users can scroll it sideways.
    const [scrollable, setScrollable] = useState(false);

    useEffect(() => {
        const el = pre.current;
        if (!el) {
            return;
        }
        const observer = new ResizeObserver(() => setScrollable(el.scrollWidth > el.clientWidth));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(
        () => () => {
            if (timer.current !== null) {
                clearTimeout(timer.current);
            }
        },
        [],
    );

    async function copy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopyState("copied");
        } catch {
            setCopyState("failed");
        }
        if (timer.current !== null) {
            clearTimeout(timer.current);
        }
        timer.current = setTimeout(() => setCopyState("ready"), 1200);
    }

    const copyLabel =
        copyState === "copied"
            ? "Copied"
            : copyState === "failed"
              ? "Copy failed, try again"
              : "Copy code";
    return (
        <>
            {label && <div className="code-label">{label}</div>}
            {/* The button sits outside the pre so it stays put when the code scrolls sideways. */}
            <div className="code-block">
                <pre ref={pre} tabIndex={scrollable ? 0 : undefined}>
                    <code dangerouslySetInnerHTML={{ __html: highlight(text) }} />
                </pre>
                <Button
                    size="sm"
                    iconOnly
                    className="copy-btn"
                    onClick={copy}
                    aria-label={copyLabel}
                    title={copyLabel}
                >
                    {copyState === "copied" ? <Check size={14} /> : <Copy size={14} />}
                </Button>
                <span className="sr-only" role="status">
                    {copyState === "copied"
                        ? "Copied"
                        : copyState === "failed"
                          ? "Copy failed"
                          : ""}
                </span>
            </div>
        </>
    );
}
