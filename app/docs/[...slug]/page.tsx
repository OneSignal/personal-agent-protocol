import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { DOCS_PAGES } from "../../../content/docs";
import { DocPage } from "../../../components/doc-page";
import { docsPage } from "../../../lib/docs-content";
import { BASE_OPEN_GRAPH, BASE_TWITTER } from "../../../lib/site";

// Every docs page listed in content/docs.ts.

type Props = { params: Promise<{ slug: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
    // Next can't serve a dynamic route ending in .md, so each page has its own .md route file.
    for (const { href } of DOCS_PAGES) {
        if (!existsSync(join(process.cwd(), "app", `${href}.md`, "route.ts"))) {
            throw new Error(`${href} has no .md route: add app${href}.md/route.ts`);
        }
    }
    return DOCS_PAGES.map((page) => ({
        slug: page.href.replace(/^\/docs\//, "").split("/"),
    }));
}

async function hrefOf({ params }: Props): Promise<string> {
    return `/docs/${(await params).slug.join("/")}`;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const href = await hrefOf(props);
    const { title, description } = docsPage(href);
    return {
        title,
        description,
        alternates: { canonical: href, types: { "text/markdown": `${href}.md` } },
        openGraph: { ...BASE_OPEN_GRAPH, title, description, url: href },
        twitter: { ...BASE_TWITTER, title, description },
    };
}

export default async function Page(props: Props) {
    return <DocPage href={await hrefOf(props)} />;
}
