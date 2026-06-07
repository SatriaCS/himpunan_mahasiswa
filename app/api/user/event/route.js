import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 5;

        const offset = (page - 1) * limit;

        const [[user]] = await db.query(
            "SELECT username FROM super_admin WHERE id_akun=1"
        );

        const [event] = await db.query(`
            SELECT 
                k.slug,
                k.judul,
                k.kategori,
                k.flayer,
                k.deskripsi,
                k.tanggal,
                k.tempat,
                k.waktu,
                k.kouta,
                a.username,
                k.link_pendaftaran as link
            FROM kegiatan k
            LEFT JOIN hima h ON k.id_hima = h.id_hima
            LEFT JOIN akun a ON h.id_akun = a.id_akun
            WHERE k.tanggal >= CURDATE()
            ORDER BY k.tanggal ASC
            LIMIT ? OFFSET ?
        `,[limit, offset]);
        /* ======================
            TOTAL DATA
        ====================== */
        const [[total]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM kegiatan k
            LEFT JOIN hima h ON k.id_hima = h.id_hima
            LEFT JOIN akun a ON h.id_akun = a.id_akun
            WHERE k.tanggal >= CURDATE()
            ORDER BY k.tanggal ASC
        `);

        return NextResponse.json({
            data: event,
            total: total.total,
            username: user.username,
            page,
            limit,
            totalPages: Math.ceil(total.total / limit)
        });

    } catch (error) {
        
        return NextResponse.json(
            { message: "Internal server  error" },
            { status: 500 }
        );
    }
}