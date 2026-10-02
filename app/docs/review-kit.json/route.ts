import { reviewKit } from "../../../lib/review-kit";

export const dynamic = "force-static";

// The review kit's files, for the comments menu to zip with the reader's comments.
export function GET() {
    return Response.json(reviewKit());
}
