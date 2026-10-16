import { markdownResponse } from "../../../../lib/docs-content";

export const dynamic = "force-static";

export function GET() {
    return markdownResponse("/docs/extensions/notifications");
}
