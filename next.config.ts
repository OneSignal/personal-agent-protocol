import { execSync } from "node:child_process";
import type { NextConfig } from "next";

// The last time the docs content changed, for the header's "Updated" date. Falls back to the latest
// commit when the clone is too shallow to see the content's history, and to the build time when
// git isn't available.
function docsUpdated(): Date {
    for (const args of ["-- content", ""]) {
        try {
            const out = execSync(`git log -1 --format=%cI ${args}`, { encoding: "utf8" }).trim();
            if (out) {
                return new Date(out);
            }
        } catch {
            // Try the next source.
        }
    }
    return new Date();
}

const updated = docsUpdated();

const config: NextConfig = {
    output: "export",
    devIndicators: false,
    allowedDevOrigins: ["*.pinecone.cloud", "localhost", "127.0.0.1"],
    env: {
        NEXT_PUBLIC_DOCS_UPDATED: updated.toISOString(),
        NEXT_PUBLIC_DOCS_UPDATED_LABEL: updated.toLocaleDateString("en-US", {
            timeZone: "America/Los_Angeles",
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
    },
};

export default config;
