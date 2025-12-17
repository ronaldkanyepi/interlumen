import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;


    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    const isAuthRoute = pathname.startsWith("/auth");
    const isHomePage = pathname === "/";
    const isPublicAsset = pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.match(/\.(ico|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/);

    if (isPublicAsset) {
        return NextResponse.next();
    }


    if (isHomePage || isAuthRoute) {
        return NextResponse.next();
    }



    // Check for both secure and non-secure cookie names
    // On HTTPS (like Render), browsers add __Secure- prefix automatically
    const sessionCookie = request.cookies.get("__Secure-better-auth.session_token") ||
        request.cookies.get("better-auth.session_token");
    const requiresAuth = pathname.startsWith("/home") ||
        pathname.startsWith("/interview") ||
        pathname.startsWith("/settings");

    if (!sessionCookie && requiresAuth) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
