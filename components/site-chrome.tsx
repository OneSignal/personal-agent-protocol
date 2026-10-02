"use client";

import { usePathname } from "next/navigation";
import { DOCS_TABS, tabFor } from "../content/docs";
import { ButtonLink } from "./button";
import { DocStatus } from "./doc-status";

type Tab = { title: string; href: string };

const LICENSE_TABS: Tab[] = [
    { title: "License", href: "/license" },
    { title: "Contributions", href: "/license/contributions" },
];

// The tab row for the current page, if it has one: the docs tabs on docs pages and the license
// tabs on license pages.
function tabsFor(pathname: string): { label: string; tabs: Tab[]; current: Tab } | undefined {
    const docsTab = tabFor(pathname);
    if (docsTab) {
        return { label: "Documentation", tabs: DOCS_TABS, current: docsTab };
    }
    const path = pathname.replace(/\/$/, "") || "/";
    const licenseTab = LICENSE_TABS.find((tab) => tab.href === path);
    if (licenseTab) {
        return { label: "License", tabs: LICENSE_TABS, current: licenseTab };
    }
    return undefined;
}

// Pages with tabs show them under the header instead of the home page's section links. Docs pages
// also show the draft status.
export function SiteHeader() {
    const pathname = usePathname() ?? "/";
    const currentTab = tabFor(pathname);
    const tabRow = tabsFor(pathname);
    // The section links only make sense on the home page, so other pages without tabs, such as the
    // 404 page, show just the site name.
    const home = pathname.replace(/\/$/, "") === "";
    return (
        <header className="site-header">
            {/* On docs pages, skip the section outline too. */}
            <a className="skip-link" href={currentTab ? "#article" : "#main"}>
                Skip to content
            </a>
            <div className="wrap">
                <div className="brand">
                    <a className="brand-name brand-logo" href="/">
                        <img src="/logo.png" alt="" width={40} height={40} />
                        Personal Agent Protocol
                    </a>
                </div>
                {tabRow ? (
                    currentTab ? (
                        <div className="header-end">
                            <DocStatus />
                        </div>
                    ) : null
                ) : home ? (
                    <>
                        <nav className="nav" aria-label="Main navigation">
                            <a href="/#why">Why it exists</a>
                            <a href="/#parties">Who it's for</a>
                            <a href="/#features">Features</a>
                            <a href="/#examples">Examples</a>
                        </nav>
                        <ButtonLink
                            variant="primary"
                            size="sm"
                            href="/docs/introduction"
                            data-cta="docs"
                        >
                            Read the docs
                        </ButtonLink>
                    </>
                ) : null}
            </div>
            {tabRow ? (
                <nav className="docs-tabs" aria-label={tabRow.label}>
                    <div className="wrap">
                        {tabRow.tabs.map((tab) => (
                            <a
                                key={tab.href}
                                href={tab.href}
                                className={tab === tabRow.current ? "active" : undefined}
                                aria-current={tab === tabRow.current ? "page" : undefined}
                            >
                                {tab.title}
                            </a>
                        ))}
                    </div>
                </nav>
            ) : null}
        </header>
    );
}

export function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="wrap">
                <span>
                    Licensed under the <a href="/license">Apache License 2.0</a>.
                </span>
                <span>Companies in the examples are fictional.</span>
            </div>
        </footer>
    );
}
