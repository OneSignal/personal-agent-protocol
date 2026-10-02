import { DOCS_PAGES } from "../content/docs";
import { docsOutline, pageMarkdown } from "./docs-content";
import { allSections, markdownFileName } from "./docs-outline";
import { FEEDBACK_EMAIL, SITE_NAME, SITE_URL } from "./site";

// The review kit: the docs as Markdown, with an AGENTS.md that asks an AI agent for a review
// organized by section. Built at build time from the same content as the pages. The docs zip holds
// it, and the comments menu adds the reader's comments to it.

// The kit's files, all in one folder so they unzip together, and where the reader's comments go.
export type Kit = {
    docsUpdated: string;
    files: { path: string; content: string }[];
    commentsPath: string;
};

const FOLDER = "personal-agent-protocol-docs/";
const COMMENTS_FILE = "comments.md";

function docsUpdated(): string {
    return process.env.NEXT_PUBLIC_DOCS_UPDATED ?? new Date().toISOString();
}

function pageList(): string {
    const outline = docsOutline();
    return outline
        .map((page) =>
            [
                `- \`docs/${markdownFileName(page.href)}\`: ${page.title}`,
                ...allSections(outline, page.href).map((s) => `  - ${s.label} (\`${s.id}\`)`),
            ].join("\n"),
        )
        .join("\n");
}

function agentsMarkdown(updated: string): string {
    const date = updated.slice(0, 10);
    return `# Reviewing the ${SITE_NAME} docs

This folder holds the draft ${SITE_NAME} docs as Markdown, as of ${date}. They're published at
${SITE_URL}. You've been asked to review them. The people working on the draft will read your
review, so write it for them.

## What to do

1. Read the docs in \`docs/\`, or the ones you were asked to focus on.
2. If there's a \`${COMMENTS_FILE}\`, read it. It has comments people already left on the docs.
   Respond to them where you have something to add, and don't repeat them.
3. Write your review as one Markdown file, in the format below. Save it as \`review.md\` in this
   folder, or reply with it if you can't save files.
4. Tell the person you're working with to send the review to ${FEEDBACK_EMAIL}, either
   by attaching \`review.md\` or by pasting it into the email.

Don't edit the docs. Comment on them.

## What the authors most want feedback on

- Privacy and security.
- Gaps in the spec: something an implementation needs that the draft doesn't cover, or something
  that doesn't work as written.
- Simplification: parts that could be simpler without losing what they make possible.
- Broadly useful extensions: things many implementations need, such as payments, that could be
  built as extensions.

For each point, say what's wrong and why it matters, and suggest a fix when you have one. Put the
most important points first within each section. Skip praise and nitpicks unless asked.

## Review format

Group your points by the section they're about, using the section names and ids from the list
below. Points that span several sections go under "General". Quote the docs only when it makes a
point clearer, and keep quotes short.

\`\`\`markdown
# Review of the ${SITE_NAME} docs (${date})

## Summary

Two or three sentences on the most important issues.

## General

- **Gap:** ...

## Specification › 3.1 Fields (\`spec#fields\`)

- **Ambiguous:** "A newer minor version doesn't break older Personal Agents" doesn't say what an
  agent does with a field it doesn't recognize. Suggest pointing to the rule in 3.3.
- **Question:** Is \`protocol_version\` required on every response, or only in discovery?
\`\`\`

Label each point **Gap**, **Ambiguous**, **Contradiction**, **Risk**, **Wording**, or
**Question**. In headings, name the page and section, then the page file name without \`.md\` and
the section id, as in \`spec#fields\`.

## The pages and their sections

${pageList()}
`;
}

export function reviewKit(): Kit {
    const updated = docsUpdated();
    const files = [
        { path: "AGENTS.md", content: agentsMarkdown(updated) },
        ...DOCS_PAGES.map((page) => ({
            path: `docs/${markdownFileName(page.href)}`,
            content: pageMarkdown(page.href),
        })),
    ];
    return {
        docsUpdated: updated,
        files: [
            { path: FOLDER, content: "" },
            ...files.map((file) => ({ path: FOLDER + file.path, content: file.content })),
        ],
        commentsPath: FOLDER + COMMENTS_FILE,
    };
}
