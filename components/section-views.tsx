"use client";

import { useEffect } from "react";
import { trackEvent } from "../lib/analytics";

// Sends one `home_section_view` the first time each section's top reaches the upper three quarters
// of the viewport during a page view.
export function SectionViews({ sections }: { sections: readonly string[] }) {
    useEffect(() => {
        if (typeof IntersectionObserver === "undefined") {
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        observer.unobserve(entry.target);
                        trackEvent("home_section_view", { section: entry.target.id });
                    }
                }
            },
            { rootMargin: "0px 0px -25% 0px" },
        );
        for (const id of sections) {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        }
        return () => observer.disconnect();
    }, [sections]);

    return null;
}
