import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { LandingPageContent } from "@/components/landing-page-content";

export default async function LandingPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect("/home");
    }

    return <LandingPageContent />;
}