import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
export function verifySuperAdmin(req) {

    const token = req.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
        );
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return NextResponse.json(
                { message: "Invalid Token" },
                { status: 401 }
        );
    }

    if (decoded.role !== "super_admin") {
        return NextResponse.json(
                { message: "FORBIDDEN" },
                { status: 403 }
        );
    }

    return decoded;
}

export function verifyAdmin(req) {

    const token = req.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
        );
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return NextResponse.json(
                { message: "Invalid Token" },
                { status: 401 }
        );
    }

    if (decoded.role !== "admin") {
        return NextResponse.json(
                { message: "FORBIDDEN" },
                { status: 403 }
        );
    }

    return decoded;
}