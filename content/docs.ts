// The docs: the tabs below the site header, and the pages in each tab, in site order. Each page's
// content is a Markdown file in this folder. The page, its metadata, the sitemap, the header tabs,
// the outline in the left navigation, and the page's .md version all come from this list.

export type DocsPage = {
    // The page's URL. Its Markdown version is served at the same URL plus .md.
    href: string;
    // The content file, in this folder.
    file: string;
    // The page's name in the outline, when its tab has several pages, and in comments.
    navTitle: string;
    // The <title> and link preview title.
    title: string;
    description: string;
    // The deepest heading level in the outline: 2 lists ## headings, 3 adds ### headings. Only
    // headings with an id, such as `## Principles {#principles}`, are listed.
    outlineDepth: 2 | 3;
    // Outline labels that differ from their heading's text, by heading id.
    outlineLabels?: Record<string, string>;
};

export type DocsTab = { title: string; href: string; pages: DocsPage[] };

export const DOCS_TABS: DocsTab[] = [
    {
        title: "Introduction",
        href: "/docs/introduction",
        pages: [
            {
                href: "/docs/introduction",
                file: "introduction.mdx",
                navTitle: "Introduction",
                title: "Personal Agent Protocol: Introduction",
                description:
                    "What Personal Agent Protocol is, why it exists, who it is for, and what it covers.",
                outlineDepth: 2,
                outlineLabels: { what: "What is it?" },
            },
        ],
    },
    {
        title: "Specification",
        href: "/docs/spec",
        pages: [
            {
                href: "/docs/spec",
                file: "spec.mdx",
                navTitle: "Specification",
                title: "Personal Agent Protocol specification (draft)",
                description:
                    "How personal agents discover companies, start sessions, sign users in, and work through APIs, web pages, and conversations with company agents.",
                outlineDepth: 3,
            },
        ],
    },
    {
        title: "Extensions",
        href: "/docs/extensions",
        pages: [
            {
                href: "/docs/extensions",
                file: "extensions.mdx",
                navTitle: "About extensions",
                title: "Personal Agent Protocol: Extensions",
                description:
                    "Optional features that build on Personal Agent Protocol, how companies and personal agents advertise them, and the extensions available today.",
                outlineDepth: 2,
            },
            {
                href: "/docs/extensions/operations",
                file: "operations.mdx",
                navTitle: "Operations",
                title: "Personal Agent Protocol: Operations extension",
                description:
                    "How a company asks a personal agent to confirm an action before performing it, with approval tied to exact terms, one record across channels, and no duplicate execution.",
                outlineDepth: 3,
            },
        ],
    },
    {
        title: "Guides",
        href: "/docs/guides",
        pages: [
            {
                href: "/docs/guides",
                file: "guides.mdx",
                navTitle: "Guides",
                title: "Personal Agent Protocol: Guides",
                description:
                    "Recommended practices for companies and personal agents implementing Personal Agent Protocol.",
                outlineDepth: 2,
            },
        ],
    },
    {
        title: "Path to 1.0",
        href: "/docs/path-to-1",
        pages: [
            {
                href: "/docs/path-to-1",
                file: "path-to-1.mdx",
                navTitle: "Path to 1.0",
                title: "Personal Agent Protocol: Path to 1.0",
                description:
                    "How Personal Agent Protocol gets to 1.0, the feedback we want, areas the draft doesn't cover yet, and the design partners implementing it.",
                outlineDepth: 2,
            },
        ],
    },
];

// The docs pages in site order.
export const DOCS_PAGES = DOCS_TABS.flatMap((tab) => tab.pages);

// The tab a docs page belongs to, if any.
export function tabFor(href: string): DocsTab | undefined {
    const path = href.replace(/\/$/, "") || "/";
    return DOCS_TABS.find((tab) => tab.pages.some((p) => p.href === path));
}
