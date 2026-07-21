import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyAdmin } from "@/lib/auth";

export async function PUT(req){
    const auth = verifyAdmin(req);
            
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();
    try {
            
            const body = await req.json();
            const { password } = body;
            if (!password) {
                return NextResponse.json(
                    { message: "Password Harus Diisi" },
                    { status: 400 }
                );
            }
            const hashPassword = await bcrypt.hash(password, 10);
            /* ======================
            CEK TOKEN LOGIN
            ====================== */
            const token = req.cookies.get("token")?.value;

            if (!token) {
                return NextResponse.json(
                    { message: "Unauthorized" },
                    { status: 401 }
                );
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            const id_akun = decoded.id;  
            await conn.beginTransaction();
            /* ======================
                EDIT PASSWORD
            ====================== */
            const [result] = await conn.query(
                "UPDATE akun SET password = ? WHERE id_akun = ?",
                [hashPassword, id_akun]
            );
            if (result.affectedRows === 0) {
                throw new Error();
            }
            await conn.commit();
            return NextResponse.json({
                message: "Data berhasil diperbarui"
            });      
    } catch (error) {
        await conn.rollback();
        console.error("[ERROR] PUT /api/admin/setting/update-password:", error);
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
                    message: "Gangguan koneksi Gagal Mengubah password. Silakan coba beberapa saat lagi.",
                },
                { status: 503 } // 503 Service Unavailable atau 504 Gateway Timeout lebih cocok
            );
        }   
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    } finally {
        conn.release();
    }
}