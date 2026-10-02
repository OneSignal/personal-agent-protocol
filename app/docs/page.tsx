import { redirect } from "next/navigation";

// The docs start at the introduction. On Vercel, vercel.json redirects /docs before this page loads.
export default function Page() {
    redirect("/docs/introduction");
}
