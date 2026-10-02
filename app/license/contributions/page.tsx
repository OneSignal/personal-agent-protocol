import type { Metadata } from "next";
import { BASE_OPEN_GRAPH, BASE_TWITTER } from "../../../lib/site";

const title = "Personal Agent Protocol: Contributions";
const description = "How contributions and feedback to Personal Agent Protocol are licensed.";

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: "/license/contributions" },
    openGraph: { ...BASE_OPEN_GRAPH, title, description, url: "/license/contributions" },
    twitter: { ...BASE_TWITTER, title, description },
};

export default function Page() {
    return (
        <section className="block license-page">
            <div className="wrap">
                <div className="section-head">
                    <h1>Contributions</h1>
                    <p>
                        By submitting contributions for inclusion in this project, you agree to
                        license them under the Apache License, Version 2.0. If you voluntarily
                        provide suggestions or other feedback about this project, you grant all
                        other members and users of the protocol a perpetual, irrevocable,
                        nonexclusive, worldwide, royalty-free, sublicensable license to use, modify,
                        and commercialize that feedback for any purpose, without compensation or
                        other obligation to you. This feedback license does not replace the Apache
                        License terms applicable to contributed code, specification text, or
                        documentation.
                    </p>
                </div>
            </div>
        </section>
    );
}
