import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Root } from "mdast";
import { DOCS_PAGES, tabFor, type DocsPage } from "../content/docs";
import type { OutlinePage } from "./docs-outline";
import { outlineOf, parseMdx } from "./mdx";
import { mdxToMarkdown } from "./mdx-markdown";

// Reads the docs content at build time: each page's MDX, its outline, and its Markdown version.
// Server only, since it reads files.

const CONTENT_DIR = join(process.cwd(), "content");

export function docsPage(href: string): DocsPage {
    const page = DOCS_PAGES.find((p) => p.href === href);
    if (!page) {
        throw new Error(`No docs page ${href}`);
    }
    return page;
}

const parsed = new Map<string, { source: string; tree: Root }>();

// A page's MDX source and syntax tree. Parsed again only when the file changes.
export function pageSource(page: DocsPage): { source: string; tree: Root } {
    const source = readFileSync(join(CONTENT_DIR, page.file), "utf8");
    const cached = parsed.get(page.file);
    if (cached?.source === source) {
        return cached;
    }
    const entry = { source, tree: parseMdx(source) };
    parsed.set(page.file, entry);
    return entry;
}

function pageOutline(page: DocsPage): OutlinePage {
    const sections = outlineOf(
        pageSource(page).tree,
        page.outlineDepth,
        page.outlineLabels,
        page.file,
    );
    return { title: page.navTitle, href: page.href, sections };
}

// The outline of every docs page, in site order.
export function docsOutline(): OutlinePage[] {
    return DOCS_PAGES.map(pageOutline);
}

// The outline of the pages in a page's tab, for the left navigation.
export function tabOutline(href: string): OutlinePage[] {
    return (tabFor(href)?.pages ?? []).map(pageOutline);
}

// A page's Markdown version.
export function pageMarkdown(href: string): string {
    return mdxToMarkdown(pageSource(docsPage(href)).tree);
}

// The response for a page's .md route.
export function markdownResponse(href: string): Response {
    return new Response(pageMarkdown(href), {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
}
