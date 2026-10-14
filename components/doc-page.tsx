import { evaluate } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { docsPage, pageSource, tabOutline } from "../lib/docs-content";
import { escapeHeadingIds, rehypeDocs, remarkHeadingIds } from "../lib/mdx";
import { NEW_ISSUE_URL } from "../lib/site";
import { CodeBlock } from "./code-block";
import { CopyMarkdownButton } from "./copy-markdown-button";
import { DocsNav } from "./docs-nav";
import { CommentingButton, DownloadKitButton } from "./feedback-actions";
import { PronounceButton } from "./pronounce-button";
import { SpecTable } from "./spec-table";

// A list of partner names, shown in columns.
function PartnerList({ children }: { children?: ReactNode }) {
    return Children.map(children, (child) =>
        isValidElement(child)
            ? cloneElement(child as ReactElement<{ className?: string }>, {
                  className: "partner-list",
              })
            : child,
    );
}

// A link to open a GitHub issue on the protocol's repository. `cta` names the link in analytics.
function IssueLink({ cta, children }: { cta: string; children?: ReactNode }) {
    return (
        <a href={NEW_ISSUE_URL} target="_blank" rel="noopener noreferrer" data-cta={cta}>
            {children}
        </a>
    );
}

// The components content files can use, and the ones Markdown maps to.
const COMPONENTS: MDXComponents = {
    table: SpecTable,
    CodeBlock,
    CommentingButton,
    DownloadKitButton,
    IssueLink,
    PartnerList,
    PronounceButton,
};

// A docs page: the outline of its tab, and its content, compiled from MDX at build time.
export async function DocPage({ href }: { href: string }) {
    const page = docsPage(href);
    const { default: Content } = await evaluate(escapeHeadingIds(pageSource(page).source), {
        ...runtime,
        remarkPlugins: [remarkGfm, remarkHeadingIds],
        rehypePlugins: [rehypeDocs],
    });
    const components: MDXComponents = {
        ...COMPONENTS,
        h1: ({ children }: { children?: ReactNode }) => (
            <div className="doc-head">
                <h1>{children}</h1>
                <CopyMarkdownButton href={`${href}.md`} />
            </div>
        ),
    };
    return (
        <div className="docs-layout">
            <DocsNav current={href} pages={tabOutline(href)} />
            <article className="doc" id="article">
                <Content components={components} />
            </article>
        </div>
    );
}
