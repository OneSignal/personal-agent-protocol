import { CONTEXT_CHARS, MAX_QUOTE_CHARS, type Anchor } from "./comment-anchors";
import { allSections, PAGE_HREFS, type OutlinePage } from "./docs-outline";

// The comment file: review comments exported from the site, so they can be shared and imported
// into someone else's browser. Format "pap-comments", version 1. A newer version is refused
// rather than half-read, and unknown fields are ignored.
//
// Files come from other people, so parsing checks every field and builds each comment from the
// checked values only.

const FORMAT = "pap-comments";
const VERSION = 1;

export const MAX_FILE_BYTES = 1_000_000;
const MAX_COMMENTS = 1000;
const MAX_BODY = 10_000;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
// Ids the comments use for the comment being written and the button to start one.
const RESERVED_IDS = ["draft", "pending"];

// One comment as it appears in a file.
type FileComment = {
    id: string;
    page: string;
    section?: string;
    quote: { exact: string; prefix?: string; suffix?: string };
    body: string;
    createdAt: string;
    editedAt?: string;
    resolved?: boolean;
    resolvedAt?: string;
};

// A comment as the site keeps it.
export type Thread = {
    id: string;
    page: string;
    anchor: Anchor;
    body: string;
    createdAt: string;
    editedAt?: string;
    resolvedAt?: string;
};

export class FeedbackError extends Error {}

function text(value: unknown, max: number): string | undefined {
    return typeof value === "string" && value.length <= max ? value : undefined;
}

function time(value: unknown): string | undefined {
    return typeof value === "string" && value.length <= 40 && !Number.isNaN(Date.parse(value))
        ? value
        : undefined;
}

function toThread(entry: unknown, now: string, outline: OutlinePage[]): Thread | null {
    if (!entry || typeof entry !== "object") {
        return null;
    }
    const e = entry as Record<string, unknown>;
    const quote = (e.quote && typeof e.quote === "object" ? e.quote : {}) as Record<
        string,
        unknown
    >;
    const page = typeof e.page === "string" && PAGE_HREFS.includes(e.page) ? e.page : null;
    const exact = text(quote.exact, MAX_QUOTE_CHARS)?.trim();
    const body = text(e.body, MAX_BODY)?.trim();
    if (!page || !exact || !body) {
        return null;
    }
    const section = allSections(outline, page).find((s) => s.id === e.section);
    return {
        id:
            typeof e.id === "string" && ID_PATTERN.test(e.id) && !RESERVED_IDS.includes(e.id)
                ? e.id
                : crypto.randomUUID(),
        page,
        anchor: {
            quote: exact,
            prefix: text(quote.prefix, MAX_QUOTE_CHARS)?.slice(-CONTEXT_CHARS) ?? "",
            suffix: text(quote.suffix, MAX_QUOTE_CHARS)?.slice(0, CONTEXT_CHARS) ?? "",
            sectionId: section?.id ?? "",
            sectionLabel: section?.label ?? "",
        },
        body,
        createdAt: time(e.createdAt) ?? now,
        editedAt: time(e.editedAt),
        resolvedAt: e.resolved === true ? (time(e.resolvedAt) ?? now) : undefined,
    };
}

// Reads a comment file. Throws a FeedbackError when the file as a whole is unusable; otherwise
// leaves out only the entries that are, and counts them. `outline` is the outline of every docs page.
export function parseFeedback(
    source: string,
    outline: OutlinePage[],
): { threads: Thread[]; skipped: number } {
    // The length check first, since a string is never more characters than bytes.
    if (source.length > MAX_FILE_BYTES || new Blob([source]).size > MAX_FILE_BYTES) {
        throw new FeedbackError("This file is larger than 1 MB.");
    }
    let data: unknown;
    try {
        data = JSON.parse(source);
    } catch {
        throw new FeedbackError("This isn't a comment file: it isn't valid JSON.");
    }
    const file = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
    if (file.format !== FORMAT || typeof file.version !== "number") {
        throw new FeedbackError("This isn't a comment file exported from this site.");
    }
    if (file.version > VERSION) {
        throw new FeedbackError(
            "This file is from a newer version of the site. Reload and try again.",
        );
    }
    if (!Array.isArray(file.comments) || file.comments.length > MAX_COMMENTS) {
        throw new FeedbackError(`A comment file holds a list of up to ${MAX_COMMENTS} comments.`);
    }
    const now = new Date().toISOString();
    const threads = file.comments
        .map((entry) => toThread(entry, now, outline))
        .filter((t): t is Thread => !!t);
    return { threads, skipped: file.comments.length - threads.length };
}

// The comment file for these comments.
export function serializeFeedback(threads: Thread[]): string {
    const comments: FileComment[] = threads.map((t) => ({
        id: t.id,
        page: t.page,
        section: t.anchor.sectionId || undefined,
        quote: {
            exact: t.anchor.quote,
            prefix: t.anchor.prefix || undefined,
            suffix: t.anchor.suffix || undefined,
        },
        body: t.body,
        createdAt: t.createdAt,
        editedAt: t.editedAt,
        resolved: t.resolvedAt ? true : undefined,
        resolvedAt: t.resolvedAt,
    }));
    const file = {
        format: FORMAT,
        version: VERSION,
        exportedAt: new Date().toISOString(),
        comments,
    };
    return JSON.stringify(file, null, 2) + "\n";
}
