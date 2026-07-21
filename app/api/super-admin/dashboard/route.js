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
        console.error("[ERROR] GET /api/super-admin/dashboard:", error);
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
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}