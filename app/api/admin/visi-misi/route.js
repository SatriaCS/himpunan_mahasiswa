import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

export async function GET(req) {
    const auth = verifyAdmin(req);
            
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    try {

        /* ambil token dari cookie */
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        /* verify token */
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const id_akun = decoded.id; 

        /* query berdasarkan id akun */
        const [rows] = await db.query(`
            SELECT id_hima, nama, visi, misi
            FROM hima
            WHERE id_akun = ?
            LIMIT 1
        `,[id_akun]);

        if(rows.length === 0){
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error("[ERROR] GET /api/admin/visi-misi:", error);
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
                    message: "Gangguan koneksi Gagal Memuat data visi misi. Silakan coba beberapa saat lagi.",
                },
                { status: 503 } // 503 Service Unavailable atau 504 Gateway Timeout lebih cocok
            );
        }
        return NextResponse.json(
            { message: "Terjadi kesalahan server" },
            { status: 401 }
        );
    }
}

export async function PUT(req) {
    const auth = verifyAdmin(req);
            
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();
    try {

        const token = req.cookies.get("token")?.value;

        if (!token)
            return NextResponse.json({ message:"Unauthorized" },{status:401});

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id_akun = decoded.id;
        
        const { visi, misi } = await req.json();
        
        await conn.beginTransaction();
        const [result] = await conn.query(`
            UPDATE hima
            SET visi = ?, misi = ?
            WHERE id_akun = ?
        `,[visi, misi, id_akun]);
        
        if (result.affectedRows === 0) {
                throw new Error();
        }
        await conn.commit();
        return NextResponse.json({
            message: "Visi dan Misi berhasil diperbarui"
        });

    } catch (error) {
        await conn.rollback();
        console.error("[ERROR] PUT /api/admin/visi-misi:", error);
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
                    message: "Gangguan koneksi Gagal Mengubah data visi misi. Silakan coba beberapa saat lagi.",
                },
                { status: 503 } // 503 Service Unavailable atau 504 Gateway Timeout lebih cocok
            );
        }
        return NextResponse.json(
            { message:"Internal Server Error" },
            { status:500 }
        );
    } finally {
        conn.release();
    }
}