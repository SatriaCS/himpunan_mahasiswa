import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifySuperAdmin } from "@/lib/auth";

export async function PUT(req) {
    const auth = verifySuperAdmin(req);
        
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();

    try {

        await conn.beginTransaction();

        /* ======================
           AMBIL DATA REQUEST
        ====================== */
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { message: "data tidak ditemukan" },
                { status: 400 }
            );
        }

        /* ======================
           UPDATE DATABASE
        ====================== */
        const [result] = await conn.query(
            `UPDATE berita SET
                headline = NOT headline
            WHERE id_berita=?`,
            [
                id
            ]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }
        await conn.commit();
        return NextResponse.json({
            message: "healine berhasil diperbarui"
        });

    } catch (error) {
        await conn.rollback();
        console.error("[ERROR] PUT /api/super-admin/news/update-headline:", error);
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
                    message: "Gangguan koneksi Gagal Meengubah headline berita. Silakan coba beberapa saat lagi.",
                },
                { status: 503 } // 503 Service Unavailable atau 504 Gateway Timeout lebih cocok
            );
        }
        return NextResponse.json(
            { message: "Terjadi kesalahan server" },
            { status: 500 }
        );
    } finally {
        conn.release();
    }
}