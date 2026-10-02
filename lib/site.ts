export const SITE_URL = "https://personalagentprotocol.org";
export const SITE_NAME = "Personal Agent Protocol";
export const FEEDBACK_EMAIL = "feedback-personal-agent-protocol@sierra.ai";

// The link preview image for every page.
const PREVIEW_IMAGE = {
    url: "/og.png",
    width: 1200,
    height: 630,
    alt: "Personal Agent Protocol: an open protocol for every company and every personal agent",
};

// Next.js replaces rather than merges a page's openGraph and twitter, so pages spread these bases.
export const BASE_OPEN_GRAPH = {
    type: "website" as const,
    siteName: SITE_NAME,
    images: [PREVIEW_IMAGE],
};
export const BASE_TWITTER = { card: "summary_large_image" as const, images: [PREVIEW_IMAGE] };
