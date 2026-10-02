"use client";

import { useEffect } from "react";

const LEGACY_PAGES: Record<string, string> = {
    spec: "/docs/spec",
};

// Sends old `/?page=...` links to their page on hosts without the vercel.json redirects.
export function LegacyPageRedirect() {
    useEffect(() => {
        const path = LEGACY_PAGES[new URLSearchParams(window.location.search).get("page") ?? ""];
        if (path) {
            window.location.replace(path + window.location.hash);
        }
    }, []);
    return null;
}
