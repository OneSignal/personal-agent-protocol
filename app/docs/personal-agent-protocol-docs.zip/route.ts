import { deflateRawSync } from "node:zlib";
import { reviewKit } from "../../../lib/review-kit";
import { zip } from "../../../lib/zip";

export const dynamic = "force-static";

// The docs as Markdown, with instructions for an AI agent to review them.
export function GET() {
    const kit = reviewKit();
    return new Response(zip(kit.files, new Date(kit.docsUpdated), deflateRawSync), {
        headers: { "Content-Type": "application/zip" },
    });
}
