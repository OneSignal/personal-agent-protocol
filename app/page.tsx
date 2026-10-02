import type { Metadata } from "next";
import { LegacyPageRedirect } from "../components/legacy-page-redirect";
import { HomeContent } from "../content/home";
import { BASE_OPEN_GRAPH, SITE_NAME } from "../lib/site";

export const metadata: Metadata = {
    alternates: { canonical: "/" },
    openGraph: { ...BASE_OPEN_GRAPH, title: SITE_NAME, url: "/" },
};

export default function Page() {
    return (
        <>
            <LegacyPageRedirect />
            <HomeContent />
        </>
    );
}
