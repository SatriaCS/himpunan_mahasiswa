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
            WHERE k.tanggal 
            AND k.headline = 1
            ORDER BY k.tanggal DESC
            LIMIT ? OFFSET ?
        `,[limit, offset]);

        const [news] = await db.query(`
            SELECT 
                b.slug,
                b.judul,
                b.thumbnail,
                b.deskripsi,
                b.created_at,
                b.updated_at,
                a.username
            FROM berita b
            LEFT JOIN hima h ON b.id_hima = h.id_hima
            LEFT JOIN akun a ON h.id_akun = a.id_akun
            WHERE b.headline = 1
            ORDER BY b.created_at DESC
            LIMIT ? OFFSET ?
        `,[limit, offset]);

        const eventData = event.map(item => ({
           ...item,
            type: "event"
        }));

        const newsData = news.map(item => ({
           ...item,
           type: "news"
        }));

        const combined = [...eventData, ...newsData]
            .sort((a, b) => {
            const dateA = new Date(a.tanggal || a.created_at);
            const dateB = new Date(b.tanggal || b.created_at);
            return dateB - dateA;
        });

        return NextResponse.json({
            data: combined,
            total: combined.length,
            username: user.username,
            page,
            limit,
            totalPages: Math.ceil(combined.length / limit)
        });

    } catch (error) {
        console.error("[ERROR] GET /api/headline:", error);
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
                    message: "Gangguan koneksi Gagal Memuat data headline. Silakan coba beberapa saat lagi.",
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