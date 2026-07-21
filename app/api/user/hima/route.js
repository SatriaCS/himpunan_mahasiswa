import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 5;

        const offset = (page - 1) * limit;

        const [hima] = await db.query(`
            SELECT 
                h.slug,
                h.nama,
                h.singkatan,
                h.visi,
                h.misi,
                h.logo,
                a.username
            FROM hima h
            JOIN akun a ON h.id_akun = a.id_akun
            LIMIT ? OFFSET ?
        `,[limit, offset]);
        /* ======================
            TOTAL DATA
        ====================== */
        const [[total]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM hima h
            JOIN akun a ON h.id_akun = a.id_akun
        `);        

        return NextResponse.json({
            data: hima,
            total: total.total,
            page,
            limit,
            totalPages: Math.ceil(total.total / limit)
        });

    } catch (error) {
        console.error("[ERROR] GET /api/hima:", error);
        //  Cek apakah error terkait jaringan/koneksi database
        const isConnectionError = 
            error.code === 'ETIMEDOUT' || 
            error.code === 'PROTOCOL_SEQUENCE_TIMEOUT' ||
            error.code === 'ECONNRESET' ||  
            error.code === 'ECONNREFUSED' || 
            error.name === 'TimeoutError';

        if (isConnectionError) {
            return NextResponse.json(
                { 
                    message: "Gangguan koneksi Gagal Memuat data. Silakan coba beberapa saat lagi.",
                },
                { status: 503 } // 503 Service Unavailable atau 504 Gateway Timeout lebih cocok
            );
        }
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}