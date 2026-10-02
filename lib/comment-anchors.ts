// Finds the text a comment was left on, even after the page changes. A comment stores the quoted
// text, a little of the text around it, and the section it was in. To place it again, we look for
// the quote (preferring its old section and surroundings). If the quote itself was edited, we look
// for the old surrounding text and take what's between it.

export type Anchor = {
    quote: string;
    prefix: string;
    suffix: string;
    sectionId: string;
    sectionLabel: string;
};

export type Located =
    | { kind: "exact" | "changed"; range: Range }
    | { kind: "outdated"; heading: Element | null };

type TextIndex = { text: string; nodes: { node: Text; start: number }[] };

export const CONTEXT_CHARS = 32;
export const MAX_QUOTE_CHARS = 2000;

// Text the reader doesn't see as part of the document: buttons, and the column labels that spec
// tables repeat in each cell for the stacked phone layout.
const SKIP = "button, script, style, svg, .cell-label";

function buildIndex(root: Element): TextIndex {
    const nodes: TextIndex["nodes"] = [];
    let text = "";
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            return node.parentElement?.closest(SKIP)
                ? NodeFilter.FILTER_REJECT
                : NodeFilter.FILTER_ACCEPT;
        },
    });
    while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        nodes.push({ node, start: text.length });
        text += node.data;
    }
    return { text, nodes };
}

function offsetOf(index: TextIndex, container: Node, offset: number): number {
    const hit = index.nodes.find((n) => n.node === container);
    if (hit) {
        return hit.start + offset;
    }
    const point = document.createRange();
    point.setStart(container, offset);
    for (const { node, start } of index.nodes) {
        if (point.comparePoint(node, 0) >= 0) {
            return start;
        }
    }
    return index.text.length;
}

function rangeAt(index: TextIndex, start: number, end: number): Range | null {
    const range = document.createRange();
    let started = false;
    for (const { node, start: nodeStart } of index.nodes) {
        const nodeEnd = nodeStart + node.data.length;
        if (!started && start < nodeEnd) {
            range.setStart(node, start - nodeStart);
            started = true;
        }
        if (started && end <= nodeEnd) {
            range.setEnd(node, end - nodeStart);
            return range;
        }
    }
    return null;
}

function headings(root: Element): HTMLElement[] {
    return [...root.querySelectorAll<HTMLElement>("h2[id], h3[id], h4[id]")];
}

function headingLabel(heading: HTMLElement): string {
    const num = heading.querySelector(".secnum")?.textContent ?? "";
    const rest = [...heading.childNodes]
        .filter((node) => !(node instanceof Element && node.classList.contains("secnum")))
        .map((node) => node.textContent)
        .join("")
        .trim();
    // Match the outline: "1. Introduction" but "3.1 Fields".
    if (!num) {
        return rest;
    }
    return num.includes(".") ? `${num} ${rest}` : `${num}. ${rest}`;
}

function sectionAround(root: Element, node: Node): HTMLElement | null {
    let found: HTMLElement | null = null;
    for (const heading of headings(root)) {
        if (
            heading.contains(node) ||
            heading.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING
        ) {
            found = heading;
        }
    }
    return found;
}

// The start and end offsets of a section: from its heading to the next heading at any level.
function sectionBounds(
    root: Element,
    index: TextIndex,
    sectionId: string,
): [number, number] | null {
    const all = headings(root);
    const at = all.findIndex((h) => h.id === sectionId);
    if (at < 0) {
        return null;
    }
    const start = offsetOf(index, all[at], 0);
    const next = all[at + 1];
    return [start, next ? offsetOf(index, next, 0) : index.text.length];
}

// Turns a selection inside root into an anchor and the range it covers, with surrounding
// whitespace trimmed. Returns null when the selection is empty or too long.
export function captureAnchor(
    root: Element,
    selected: Range,
): { anchor: Anchor; range: Range } | null {
    const index = buildIndex(root);
    let start = offsetOf(index, selected.startContainer, selected.startOffset);
    let end = offsetOf(index, selected.endContainer, selected.endOffset);
    while (start < end && /\s/.test(index.text[start])) {
        start++;
    }
    while (end > start && /\s/.test(index.text[end - 1])) {
        end--;
    }
    if (end - start < 1 || end - start > MAX_QUOTE_CHARS) {
        return null;
    }
    const range = rangeAt(index, start, end);
    if (!range) {
        return null;
    }
    const section = sectionAround(root, range.startContainer);
    return {
        anchor: {
            quote: index.text.slice(start, end),
            prefix: index.text.slice(Math.max(0, start - CONTEXT_CHARS), start),
            suffix: index.text.slice(end, end + CONTEXT_CHARS),
            sectionId: section?.id ?? "",
            sectionLabel: section ? headingLabel(section) : "",
        },
        range,
    };
}

// How many characters of the text just before and just after position match the anchor's prefix
// and suffix.
function contextScore(text: string, start: number, end: number, anchor: Anchor): number {
    let score = 0;
    while (
        score < anchor.prefix.length &&
        text[start - 1 - score] === anchor.prefix[anchor.prefix.length - 1 - score]
    ) {
        score++;
    }
    let tail = 0;
    while (tail < anchor.suffix.length && text[end + tail] === anchor.suffix[tail]) {
        tail++;
    }
    return score + tail;
}

// Places each anchor in root, building the text index once for all of them.
export function locateAnchors(root: Element, anchors: Anchor[]): Located[] {
    const index = buildIndex(root);
    return anchors.map((anchor) => locate(root, index, anchor));
}

function locate(root: Element, index: TextIndex, anchor: Anchor): Located {
    const { text } = index;
    const section = sectionBounds(root, index, anchor.sectionId);
    const inSection = (at: number) => !!section && at >= section[0] && at < section[1];

    let best = -1;
    let bestScore = -1;
    for (let at = text.indexOf(anchor.quote); at !== -1; at = text.indexOf(anchor.quote, at + 1)) {
        const score =
            contextScore(text, at, at + anchor.quote.length, anchor) + (inSection(at) ? 1000 : 0);
        if (score > bestScore) {
            best = at;
            bestScore = score;
        }
    }
    if (best >= 0) {
        const range = rangeAt(index, best, best + anchor.quote.length);
        if (range) {
            return { kind: "exact", range };
        }
    }

    // The quote was edited: find the old text around it, close together, and take what's between.
    const minContext = 12;
    if (anchor.prefix.length >= minContext && anchor.suffix.length >= minContext) {
        const limit = Math.max(anchor.quote.length * 2, anchor.quote.length + 200);
        for (
            let at = text.indexOf(anchor.prefix);
            at !== -1;
            at = text.indexOf(anchor.prefix, at + 1)
        ) {
            const start = at + anchor.prefix.length;
            const end = text.indexOf(anchor.suffix, start);
            if (end > start && end - start <= limit) {
                const range = rangeAt(index, start, end);
                if (range) {
                    return { kind: "changed", range };
                }
            }
        }
    }

    return {
        kind: "outdated",
        heading: anchor.sectionId ? root.querySelector(`#${CSS.escape(anchor.sectionId)}`) : null,
    };
}
