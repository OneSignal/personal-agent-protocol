import type { Kit } from "../lib/review-kit";
import { zip } from "../lib/zip";

// Downloads from the comments menu: comment files, and the docs for an AI agent to review.

const DOCS_ZIP = "personal-agent-protocol-docs.zip";

export function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Downloads the docs zip. With comments, the zip is built in the browser from the same files as
// the zip the site serves, with the comments added as comments.md.
export async function downloadDocs(comments?: string) {
    if (!comments) {
        const link = document.createElement("a");
        link.href = `/docs/${DOCS_ZIP}`;
        link.download = DOCS_ZIP;
        link.click();
        return;
    }
    const response = await fetch("/docs/review-kit.json");
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const kit: Kit = await response.json();
    const files = [...kit.files, { path: kit.commentsPath, content: comments }];
    downloadBlob(
        new Blob([zip(files, new Date(kit.docsUpdated))], { type: "application/zip" }),
        DOCS_ZIP,
    );
}
