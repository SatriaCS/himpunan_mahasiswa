import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {

    const token = req.cookies.get("token")?.value;

    /* ======================
    BELUM LOGIN
    ====================== */
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {

        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET
        );

        const { payload } = await jwtVerify(token, secret);

        const path = req.nextUrl.pathname;

        /* ======================
        SUPER ADMIN AREA
        ====================== */
        if (
            path.startsWith("/superadmin") &&
            payload.role !== "super_admin"
        ) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        /* ======================
        ADMIN AREA
        ====================== */
        if (
            path.startsWith("/admin") &&
            payload.role !== "admin"
        ) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        return NextResponse.next();

    } catch (err) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: ["/admin/:path*", "/superadmin/:path*"]
};