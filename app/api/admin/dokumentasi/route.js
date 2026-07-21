import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import fs from "fs";
import path from "path";
import { verifyAdmin } from "@/lib/auth";
import { put, del } from "@vercel/blob";

export async function GET(req) {
    const auth = verifyAdmin(req);
    
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }

    try {

        const token = req.cookies.get("token")?.value;

        if (!token)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 5;

        const offset = (page - 1) * limit;

        const [rows] = await db.query(`
            SELECT 
                d.id_dokumentasi AS id,
                d.judul,
                d.foto,
                a.username
            FROM dokumentasi d
            JOIN hima h ON d.id_hima = h.id_hima
            JOIN akun a ON h.id_akun = a.id_akun
            WHERE h.id_akun = ?
            ORDER BY d.id_dokumentasi DESC
            LIMIT ? OFFSET ?
        `,[decoded.id,limit, offset]);

        /* ======================
            TOTAL DATA
        ====================== */
        const [[total]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM dokumentasi d
            JOIN hima h ON d.id_hima = h.id_hima
            WHERE h.id_akun = ?
        `,[decoded.id]);    

        return NextResponse.json({
            data: rows,
            total: total.total,
            page,
            limit,
            totalPages: Math.ceil(total.total / limit)
        });

    } catch (error) {
        console.error("[ERROR] GET /api/admin/dokumentasi:", error);
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
                    message: "Gangguan koneksi Gagal Memuat data dokumentasi. Silakan coba beberapa saat lagi.",
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

export async function POST(req) {
    const auth = verifyAdmin(req);
    
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }

    const conn = await db.getConnection();
    let uploadedBlobUrl = null;
    try {

        const token = req.cookies.get("token")?.value;

        if (!token)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const id_akun = decoded.id;

        /* ======================
           AMBIL HIMA
        ====================== */
        const [[user]] = await conn.query(
            "SELECT folder_name FROM hima WHERE id_akun=?",
            [id_akun]
        );
        if (!user)
            return NextResponse.json(
                { message: "Gagal menambahkan Data" },
                { status: 404 }
            );

        const [[hima]] = await conn.query(
            "SELECT id_hima FROM hima WHERE id_akun=?",
            [id_akun]
        );

        if (!hima)
            return NextResponse.json(
                { message: "Gagal menambahkan Data" },
                { status: 404 }
            );

        /* ======================
           FORM DATA
        ====================== */
        const formData = await req.formData();

        const judul = formData.get("judul");
        const file = formData.get("foto");

        if (!judul || !file) {
            return NextResponse.json(
                { message: "Judul dan foto wajib diisi" },
                { status: 400 }
            );
        }

        /* ======================
           VALIDASI FILE
        ====================== */

        const MAX_SIZE = 5 * 1024 * 1024; // 5MB

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { message: "Ukuran file maksimal 5MB" },
                { status: 400 }
            );
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg"
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { message: "Format file harus JPG, PNG, atau WEBP" },
                { status: 400 }
            );
        }

        /* ======================
           UPLOAD FOTO TO BLOB
        ====================== */
        let fileName = null;

        if (file && file.size > 0) {
            const blob = await put(
                `dokumentasi/${user.folder_name}/${Date.now()}-${file.name}`,
                file,
                {
                    access: "public",
                }
            );

            uploadedBlobUrl = blob.url;
            fileName = blob.url;
        }

        await conn.beginTransaction();
        /* ======================
           INSERT DB
        ====================== */
        const [result] = await conn.query(
            `INSERT INTO dokumentasi (id_hima, judul, foto)
             VALUES (?, ?, ?)`,
             [hima.id_hima, judul, fileName]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }
        await conn.commit();
        return NextResponse.json({
            message: "Dokumentasi berhasil ditambahkan"
        });

    } catch (error) {
        console.error("[ERROR] POST /api/admin/dokumentasi:", error);
        await conn.rollback();
        // 🔥 HAPUS BLOB JIKA SUDAH TERSIMPAN
        if (uploadedBlobUrl) {
            try {
                await del(uploadedBlobUrl);
            } catch (deleteError) {
                console.error("Gagal menghapus foto baru dari blob:", deleteError);
            }
        }
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
                    message: "Gangguan koneksi Gagal Menambah data dokumentasi. Silakan coba beberapa saat lagi.",
                },
                { status: 503 } // 503 Service Unavailable atau 504 Gateway Timeout lebih cocok
            );
        }
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    } finally {
        conn.release();
    }
}

export async function DELETE(req) {
    const auth = verifyAdmin(req);
    
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }

    const conn = await db.getConnection();

    try {

        /* ======================
           CEK TOKEN
        ====================== */
        const token = req.cookies.get("token")?.value;

        if (!token)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const id_akun = decoded.id;

        /* ======================
           AMBIL ID DOKUMENTASI
        ====================== */
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id)
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 400 }
            );

        /* ======================
           AMBIL USERNAME
        ====================== */
        const [[user]] = await conn.query(
            "SELECT folder_name FROM hima WHERE id_akun=?",
            [id_akun]
        );
        
        if (!user)
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );

        /* ======================
           AMBIL DATA FILE
        ====================== */
        const [[doc]] = await conn.query(`
            SELECT d.foto
            FROM dokumentasi d
            JOIN hima h ON d.id_hima = h.id_hima
            WHERE d.id_dokumentasi = ?
            AND h.id_akun = ?
        `,[id, id_akun]);

        if (!doc)
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );

        await conn.beginTransaction();
        /* ======================
           HAPUS DATABASE
        ====================== */
        const [result] = await conn.query(
            "DELETE FROM dokumentasi WHERE id_dokumentasi=?",
            [id]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }
        await conn.commit();
        
        /* ======================
           HAPUS FILE FISIK / BLOB
        ====================== */
        if (doc.foto) {
                try {
                    await del(doc.foto);
                } catch (deleteError) {
                    console.error("Gagal menghapus foto dokumentasi dari blob:", deleteError);
                }
        }
        return NextResponse.json({
            message: "Dokumentasi berhasil dihapus"
        });

    } catch (error) {
        console.error("[ERROR] DELETE /api/admin/dokumentasi:", error);
        await conn.rollback();
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
                    message: "Gangguan koneksi Gagal Menghapus data dokumentasi. Silakan coba beberapa saat lagi.",
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