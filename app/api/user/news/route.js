import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 5;
        const search = searchParams.get("search") || "";

        const offset = (page - 1) * limit;

        const [[user]] = await db.query(
            "SELECT username FROM super_admin WHERE id_akun=1"
        );

        /* ======================
           WHERE DINAMIS
        ====================== */
        let where = "";
        let params = [];

        if (search) {
            where = "WHERE b.judul LIKE ?";
            params.push(`%${search}%`);
        }

        /* ======================
           DATA BERITA
        ====================== */
        const [berita] = await db.query(
            `
            SELECT 
                b.slug,
                b.judul,
                b.thumbnail,
                b.deskripsi,
                b.created_at,
                b.updated_at,
                h.nama,
                a.username
            FROM berita b
            LEFT JOIN hima h ON b.id_hima = h.id_hima
            LEFT JOIN akun a ON h.id_akun = a.id_akun
            ${where}
            ORDER BY b.created_at DESC
            LIMIT ? OFFSET ?
            `,
            [...params, limit, offset]
        );

        /* ======================
           TOTAL DATA
        ====================== */
        const [[total]] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM berita b
            LEFT JOIN hima h ON b.id_hima = h.id_hima
            LEFT JOIN akun a ON h.id_akun = a.id_akun
            ${where}
            `,
            params
        );

        return NextResponse.json({
            data: berita,
            total: total.total,
            username: user.username,
            page,
            limit,
            totalPages: Math.ceil(total.total / limit)
        });

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}