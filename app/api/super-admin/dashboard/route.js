import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifySuperAdmin } from "@/lib/auth";

export async function GET(req) {
    try {

        const auth = verifySuperAdmin(req);

        // jika auth adalah response → langsung return
        if (auth instanceof Response) {
            return auth;
        }

        /* ======================
        QUERY DATA
        ====================== */
        const [rows] = await db.query(`
            SELECT COUNT(*) AS total_data
            FROM hima
            JOIN akun
            ON hima.id_akun = akun.id_akun
        `);

        return NextResponse.json(rows[0]);

    } catch (error) {
        
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}