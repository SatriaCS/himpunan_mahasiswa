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

        /* ======================
           CEK TOKEN
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
        
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 5;

        const offset = (page - 1) * limit;

        /* ======================
           AMBIL DATA ANGGOTA + USERNAME
        ====================== */
        const [rows] = await db.query(`
            SELECT 
                a.id_anggota AS id,
                a.nama,
                a.jabatan,
                a.foto,
                ak.username
            FROM anggota a
            JOIN hima h ON a.id_hima = h.id_hima
            JOIN akun ak ON h.id_akun = ak.id_akun
            WHERE h.id_akun = ?
            ORDER BY a.id_anggota DESC
            LIMIT ? OFFSET ?
        `, [id_akun,limit, offset]);
           
        /* ======================
                TOTAL DATA
            ====================== */
            const [[total]] = await db.query(`
                SELECT COUNT(*) AS total
                FROM anggota d
                JOIN hima h ON d.id_hima = h.id_hima
                WHERE h.id_akun = ?
            `,[id_akun]);  

        return NextResponse.json({
            data: rows,
            total: total.total,
            page,
            limit,
            totalPages: Math.ceil(total.total / limit)
        });

    } catch (error) {
        console.error("[ERROR] GET /api/admin/member:", error);
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
                    message: "Gangguan koneksi Gagal Memuat data anggota. Silakan coba beberapa saat lagi.",
                },
                { status: 503 } // 503 Service Unavailable atau 504 Gateway Timeout lebih cocok
            );
        }
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 401 }
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
    let fileName = null;
    try {

        /* ======================
           CEK TOKEN LOGIN
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
           AMBIL HIMA
        ====================== */
        const [[user]] = await conn.query(
            "SELECT folder_name FROM hima WHERE id_akun=?",
            [id_akun]
        );

        if (!user)
            return NextResponse.json(
                { message: "Gagal Menambahkan Data" },
                { status: 404 }
            );

        const [[hima]] = await conn.query(
            "SELECT id_hima FROM hima WHERE id_akun=?",
            [id_akun]
        );

        if (!hima)
            return NextResponse.json(
                { message: "Gagal Menambahkan Data" },
                { status: 404 }
            );

        /* ======================
           AMBIL FORM DATA
        ====================== */
        const formData = await req.formData();

        const nama = formData.get("nama");
        let jabatan = formData.get("jabatan");
        if (!jabatan || jabatan.trim() === "" || jabatan === "null") {
            jabatan = null;
        }
        const file = formData.get("foto");

        if (!nama) {
            return NextResponse.json(
                { message: "nama harus diisi" },
                { status: 400 }
            );
        }

        if (file && file.size > 0) {
            /* ======================
            VALIDASI UKURAN FILE
            ====================== */
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB

            if (file.size > MAX_SIZE) {
                return NextResponse.json(
                    { message: "Ukuran foto maksimal 5MB" },
                    { status: 400 }
                );
            }

            /* ======================
            VALIDASI IMAGE
            ====================== */
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/jpg"
            ];

            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { message: "Format foto harus JPG, PNG, atau WEBP" },
                    { status: 400 }
                );
            }

            /* ======================
            UPLOAD TO VERCEL BLOB
            ====================== */
            const blob = await put(
                `member/${user.folder_name}/${Date.now()}-${file.name}`,
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
           INSERT DATABASE
        ====================== */
        const [result] = await conn.query(
            `INSERT INTO anggota 
            (id_hima, nama, jabatan, foto)
            VALUES (?, ?, ?, ?)`,
            [hima.id_hima, nama, jabatan, fileName]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }
        await conn.commit();
        return NextResponse.json({
            message: "Anggota berhasil ditambahkan"
        });

    } catch (error) {
        console.error("[ERROR] POST /api/admin/member:", error);
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
                    message: "Gangguan koneksi Gagal Menambah data anggota. Silakan coba beberapa saat lagi.",
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
           AMBIL ID MEMBER
        ====================== */
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 400 }
            );
        }
    
        /* ======================
           CEK MEMBER + USERNAME
        ====================== */
        const [[member]] = await conn.query(`
            SELECT 
                a.foto,
                ak.username
            FROM anggota a
            JOIN hima h ON a.id_hima = h.id_hima
            JOIN akun ak ON h.id_akun = ak.id_akun
            WHERE a.id_anggota = ?
            AND h.id_akun = ?
        `, [id, id_akun]);

        if (!member) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        await conn.beginTransaction();
        /* ======================
           DELETE DATABASE
        ====================== */
        const [result] = await conn.query(
            "DELETE FROM anggota WHERE id_anggota=?",
            [id]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }
        await conn.commit();

        if (member.foto) {
            /* ======================
            HAPUS FILE FOTO / BLOB
            ====================== */
                try {
                    await del(member.foto);
                } catch (deleteError) {
                    console.error("Gagal menghapus foto anggota dari blob:", deleteError);
                }
        }
        
        return NextResponse.json({
            message: "Anggota berhasil dihapus"
        });

    } catch (error) {
        console.error("[ERROR] DELETE /api/admin/member:", error);
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
                    message: "Gangguan koneksi Gagal Menghapus data anggota. Silakan coba beberapa saat lagi.",
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

export async function PUT(req) {
    const auth = verifyAdmin(req);
        
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();
    let uploadedBlobUrl = null;
    let fileName = null;
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
           AMBIL DATA USER
        ====================== */
        const [[user]] = await conn.query(
            "SELECT folder_name FROM hima WHERE id_akun=?",
            [id_akun]
        );

        if (!user) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        /* ======================
           AMBIL FORM DATA
        ====================== */
        const formData = await req.formData();

        const id = formData.get("id");
        const nama = formData.get("nama");
        let jabatan = formData.get("jabatan");
        if (!jabatan || jabatan.trim() === "" || jabatan === "null") {
            jabatan = null;
        }
        const file = formData.get("foto");
        if (!id) {
            return NextResponse.json(
                { message: "gagal mengedit data" },
                { status: 400 }
            );
        }
        if (!nama) {
            return NextResponse.json(
                { message: "nama harus diisi" },
                { status: 400 }
            );
        }

        /* ======================
           CEK MEMBER
        ====================== */
        const [[member]] = await conn.query(`
            SELECT 
                a.foto,
                ak.username
            FROM anggota a
            JOIN hima h ON a.id_hima = h.id_hima
            JOIN akun ak ON h.id_akun = ak.id_akun
            WHERE a.id_anggota=? AND h.id_akun=?
        `,[id, id_akun]);

        if (!member)
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        const oldFoto = member.foto;
        fileName = oldFoto;

        if (file && file.size > 0) {            
            
            /* ======================
            JIKA FOTO DIUPDATE
            ====================== */
            const MAX_SIZE = 5 * 1024 * 1024;

            if (file.size > MAX_SIZE)
                return NextResponse.json(
                    { message: "Ukuran maksimal 5MB" },
                    { status: 400 }
                );

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/jpg"
            ];

            if (!allowedTypes.includes(file.type))
                return NextResponse.json(
                    { message: "Format file harus JPG, PNG, atau WEBP" },
                    { status: 400 }
                );

            /* upload foto baru ke Vercel Blob */
            const blob = await put(
                `member/${user.folder_name}/${Date.now()}-${file.name}`,
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
           UPDATE DATABASE
        ====================== */
        await conn.query(`
            UPDATE anggota
            SET nama=?, jabatan=?, foto=?
            WHERE id_anggota=?
        `,[nama, jabatan, fileName, id]);
        await conn.commit();
        /* hapus file lama jika upload baru */
        if (
            file &&
            file.size > 0 &&
            oldFoto
        ) {
                try {
                    await del(oldFoto);
                } catch (deleteError) {
                    console.error("Gagal menghapus foto lama dari blob:", deleteError);
                }
        }

        return NextResponse.json({
            message: "Data Anggota berhasil diupdate"
        });

    } catch (error) {
        console.error("[ERROR] PUT /api/admin/member:", error);
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
                    message: "Gangguan koneksi Gagal Mengubah data anggota. Silakan coba beberapa saat lagi.",
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