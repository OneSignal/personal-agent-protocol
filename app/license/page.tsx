import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { BASE_OPEN_GRAPH, BASE_TWITTER } from "../../lib/site";

const title = "Personal Agent Protocol: License";
const description =
    "Personal Agent Protocol's specification and documentation are licensed under the Apache License 2.0.";

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: "/license" },
    openGraph: { ...BASE_OPEN_GRAPH, title, description, url: "/license" },
    twitter: { ...BASE_TWITTER, title, description },
};

// The license terms from apache.org's text, also served in full as /LICENSE.txt. The page stops at
// the end of the terms and leaves out the appendix, which tells licensors how to apply the license.
const END_OF_TERMS = "END OF TERMS AND CONDITIONS";
const fullText = readFileSync(join(process.cwd(), "public", "LICENSE.txt"), "utf8");
const licenseText = fullText.slice(0, fullText.indexOf(END_OF_TERMS) + END_OF_TERMS.length).trim();

export default function Page() {
    return (
        <section className="block license-page">
            <div className="wrap">
                <div className="section-head">
                    <h1>License</h1>
                    <p>
                        The Personal Agent Protocol specification and documentation, including their
                        examples, are licensed under the Apache License 2.0. You can use, copy,
                        modify, and share them, including in commercial products, under the terms
                        below, which include a patent license from contributors.
                    </p>
                    <p>
                        The license doesn't cover the names Personal Agent Protocol and Poppy, the
                        logo, or the design of this site.
                    </p>
                </div>
                <pre className="license-text">{licenseText}</pre>
            </div>
        </section>
    );
}
