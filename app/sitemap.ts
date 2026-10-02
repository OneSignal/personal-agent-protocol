import type { MetadataRoute } from "next";
import { DOCS_PAGES } from "../content/docs";
import { SITE_URL } from "../lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
    return ["/", ...DOCS_PAGES.map((page) => page.href), "/license", "/license/contributions"].map(
        (path) => ({
            url: `${SITE_URL}${path}`,
        }),
    );
}
