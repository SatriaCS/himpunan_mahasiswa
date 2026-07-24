import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 5;

        const offset = (page - 1) * limit;

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
                k.link_pendaftaran as link
            FROM kegiatan k
            LEFT JOIN hima h ON k.id_hima = h.id_hima
            ORDER BY
            CASE
                WHEN DATE(k.tanggal) >= CURDATE() THEN 0
                ELSE 1
            END,
            CASE
                WHEN DATE(k.tanggal) >= CURDATE()
                THEN DATEDIFF(DATE(k.tanggal), CURDATE())
            END ASC,
            CASE
                WHEN DATE(k.tanggal) < CURDATE()
                THEN DATEDIFF(CURDATE(), DATE(k.tanggal))
            END ASC
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        /* ======================
            TOTAL DATA
        ====================== */
        const [[total]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM kegiatan k
            LEFT JOIN hima h ON k.id_hima = h.id_hima
            ORDER BY
            CASE
                WHEN DATE(k.tanggal) >= CURDATE() THEN 0
                ELSE 1
            END,
            CASE
                WHEN DATE(k.tanggal) >= CURDATE()
                THEN DATEDIFF(DATE(k.tanggal), CURDATE())
            END ASC,
            CASE
                WHEN DATE(k.tanggal) < CURDATE()
                THEN DATEDIFF(CURDATE(), DATE(k.tanggal))
            END ASC
        `);

        return NextResponse.json({
            data: event,
            total: total.total,
            page,
            limit,
            totalPages: Math.ceil(total.total / limit)
        });

    } catch (error) {
        console.error("[ERROR] GET /api/kegiatan:", error);
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
                    message: "Gangguan koneksi Gagal Memuat data kegiatan. Silakan coba beberapa saat lagi.",
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