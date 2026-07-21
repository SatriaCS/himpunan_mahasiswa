import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { verifySuperAdmin } from "@/lib/auth";
import crypto from "crypto";
import { list, del } from "@vercel/blob";

async function generateUniqueSlug(judul) {

    // slug dasar
    let baseSlug = judul
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    let slug = baseSlug;
    let counter = 1;

    while (true) {

        const [[existing]] = await db.query(
            "SELECT id_hima FROM hima WHERE slug = ?",
            [slug]
        );

        if (!existing) break;

        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

async function generateFolderName(conn) {
    let folderName;
    let exists = true;

    while (exists) {
        folderName = crypto
            .randomBytes(4)
            .toString("base64")
            .replace(/[^a-zA-Z0-9]/g, "")
            .substring(0, 5);

        const [[result]] = await conn.query(
            "SELECT COUNT(*) AS total FROM hima WHERE folder_name = ?",
            [folderName]
        );

        exists = result.total > 0;
    }

    return folderName;
}

export async function POST(req) {
    const auth = verifySuperAdmin(req);

    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();

    try {

        const body = await req.json();

        const { username, password, nama } = body;
        if (!username || !password || !nama) {
            return NextResponse.json(
                { message: "username, password dan nama wajib diisi" },
                { status: 400 }
            );
        }

        // cek duplicate username
        const [cek] = await conn.query(
            "SELECT id_akun FROM akun WHERE username = ?",
            [username]
        );

        if (cek.length > 0) {
            return NextResponse.json({
                message: "Username sudah digunakan, gunakan username lain"
            }, { status: 400 });
        }

        /* ======================
           GENERATE SLUG
        ====================== */
        const slug = await generateUniqueSlug(nama);

        /* ======================
           HASH PASSWORD
        ====================== */
        const hashPassword = await bcrypt.hash(password, 10);

        /* ======================
           START TRANSACTION
        ====================== */
        await conn.beginTransaction();

        // generate folder_name
        const folderName = await generateFolderName(conn);

        /* ======================
           INSERT AKUN
        ====================== */
        const [akunResult] = await conn.query(
            `INSERT INTO akun (username,password)
             VALUES (?,?)`,
            [username, hashPassword]
        );

        if (akunResult.affectedRows === 0 ) {
                throw new Error();
        }

        // ambil id akun baru
        const idAkun = akunResult.insertId;

        /* ======================
           INSERT HIMA
        ====================== */
        const [result] =  await conn.query(
            `INSERT INTO hima (nama,slug,id_akun,folder_name)
             VALUES (?,?,?,?)`,
            [nama, slug, idAkun, folderName]
        );

        if (result.affectedRows === 0 ) {
                throw new Error();
        }

        /* ======================
           COMMIT
        ====================== */
        await conn.commit();

        return NextResponse.json({
            message: "Akun HIMA berhasil dibuat"
        });

    } catch (error) {
        
        await conn.rollback();
        console.error("[ERROR] POST /api/super-admin/akun-admin:", error);
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
                    message: "Gangguan koneksi Gagal menambah data akun. Silakan coba beberapa saat lagi.",
                },
                { status: 503 } // 503 Service Unavailable atau 504 Gateway Timeout lebih cocok
            );
        }
        return NextResponse.json({
            message: "internal server error",
        }, { status: 500 });

    } finally {
        conn.release();
    }
}

export async function GET(req) {
    const auth = verifySuperAdmin(req);

    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    try {
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 5;

        const offset = (page - 1) * limit;

        const [rows] = await db.query(`
            SELECT 
                hima.nama,
                akun.username,
                akun.id_akun
            FROM hima
            JOIN akun
            ON hima.id_akun = akun.id_akun
            ORDER BY akun.id_akun DESC
            LIMIT ? OFFSET ?
        `,[limit, offset]);
        
        /* ======================
           TOTAL DATA
        ====================== */
        const [[total]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM hima
        `);

        return NextResponse.json({
            data: rows,
            total: total.total,
            page,
            limit,
            totalPages: Math.ceil(total.total / limit)
        });

    } catch (error) {        
        await conn.rollback();
        console.error("[ERROR] GET /api/super-admin/akun-admin:", error);
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
                    message: "Gangguan koneksi Gagal memuat data akun. Silakan coba beberapa saat lagi.",
                },
                { status: 503 } // 503 Service Unavailable atau 504 Gateway Timeout lebih cocok
            );
        }s
        return NextResponse.json({
            message: "Internal Server Error"
        }, { status: 500 });
    }
}

export async function DELETE(req) {
    const auth = verifySuperAdmin(req);

    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();

    try {
        const { id_akun } = await req.json(); 
        
        if (!id_akun) {
            return NextResponse.json(
                { message: "data tidak ditemukan" },
                { status: 404 }
            );
        }

        /* ======================
        AMBIL USER
        ====================== */
        const [[user]] = await db.query(
            "SELECT folder_name FROM hima WHERE id_akun=?",
            [id_akun]
        );

        if (!user) {
            return NextResponse.json({
                message: "data tidak ditemukan"
            }, { status: 404 });
        }

        const folder_name = user.folder_name;

        await conn.beginTransaction();

        /* ======================
           DELETE AKUN
        ====================== */
        const [result] = await conn.query(
            "DELETE FROM akun WHERE id_akun = ?",
            [id_akun]
        );
        if (result.affectedRows === 0 ) {
                throw new Error("Gagal menghapus dari database");
        }

        await conn.commit();

        /* ======================
        FUNCTION DELETE FOLDER VERCEL BLOB
        ====================== */
        const deleteBlobFolder = async (prefix) => {
            try {
                // Cari semua file yang memiliki awalan path (prefix) ini
                const { blobs } = await list({ prefix: prefix });
                
                // Ekstrak URL-nya saja
                const urlsToDelete = blobs.map((blob) => blob.url);

                // Hapus secara massal jika ada isinya
                if (urlsToDelete.length > 0) {
                    await del(urlsToDelete);
                }
            } catch (error) {
                // Log error saja, jangan throw agar tidak membatalkan proses lain
                console.error(`🔥 [ERROR] DELETE /api/super-admin/akun-admin:Gagal menghapus blob prefix ${prefix}:`, error);
            }
        };

        /* ======================
        DELETE SEMUA FOLDER (Berjalan paralel agar lebih cepat)
        ====================== */
        await Promise.all([
            deleteBlobFolder(`hima/${folder_name}/`),
            deleteBlobFolder(`dokumentasi/${folder_name}/`),
            deleteBlobFolder(`member/${folder_name}/`),
            deleteBlobFolder(`news/${folder_name}/`),
            deleteBlobFolder(`event/${folder_name}/`)
        ]);

        return NextResponse.json({
            message: "Akun HIMA berhasil dihapus"
        });

    } catch (error) {
        await conn.rollback();
        console.error("🔥 [ERROR] DELETE /api/super-admin/akun-admin:", error);
        
        const isConnectionError = 
            error.code === 'ETIMEDOUT' || 
            error.code === 'PROTOCOL_SEQUENCE_TIMEOUT' ||
            error.code === 'ECONNRESET' ||  
            error.code === 'ECONNREFUSED' || 
            error.name === 'TimeoutError';

        if (isConnectionError) {
            return NextResponse.json(
                { 
                    message: "Gangguan koneksi Gagal menghapus data akun. Silakan coba beberapa saat lagi.",
                },
                { status: 503 } 
            );
        }
        return NextResponse.json({
            message: "Internal Server Error"
        }, { status: 500 });

    } finally {
        conn.release();
    }
}

export async function PUT(req){
    const auth = verifySuperAdmin(req);

    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();

    try{

        const body = await req.json();
        const { id_akun, username, nama } = body;
        if (!id_akun) {
            return NextResponse.json(
                { message: "data tidak ditemukan" },
                { status: 404 }
            );
        }
        if (!username || !nama) {
            return NextResponse.json(
                { message: "username dan nama wajib diisi" },
                { status: 400 }
            );
        }
        /* ======================
           CEK USERNAME DUPLIKAT
        ====================== */
        const [cek] = await conn.query(
            "SELECT id_akun FROM akun WHERE username = ? AND id_akun != ?",
            [username, id_akun]
        );

        if(cek.length > 0){
            return NextResponse.json({
                message:"Username sudah digunakan, gunakan username lain"
            },{status:400});
        }
        /* ======================
           CEK DATA LAMA
        ====================== */
        const [[user]] = await conn.query(
            "SELECT username FROM akun WHERE id_akun=?",
            [id_akun]
        );

        if (!user) {
            return NextResponse.json({
                message: "data tidak ditemukan"
            }, { status: 404 });
        }

        const [[oldHima]] = await conn.query(
            "SELECT * FROM hima WHERE id_akun=? ",
            [id_akun]
        );

        if (!oldHima) {
            return NextResponse.json({
                message: "data tidak ditemukan"
            }, { status: 404 });
        }

        /* ======================
           GENERATE SLUG BARU
        ====================== */
        let slug = oldHima.slug;

        if (nama !== oldHima.nama) {
            slug = await generateUniqueSlug(nama);
        }  

        await conn.beginTransaction();

        /* ======================
           UPDATE AKUN
        ====================== */
        const [resultAkun] = await conn.query(
            "UPDATE akun SET username = ? WHERE id_akun = ?",
            [username, id_akun]
        );
        if (resultAkun.affectedRows === 0 ) {
                throw new Error();
        }      

        /* ======================
           UPDATE HIMA
        ====================== */
        const [resultHima] = await conn.query(
            "UPDATE hima SET nama = ?, slug = ? WHERE id_akun = ?",
            [nama, slug, id_akun]
        );
        if (resultHima.affectedRows === 0 ) {
                throw new Error();
        }

        await conn.commit();

        return NextResponse.json({
            message:"Data berhasil diperbarui"
        });

    }catch(error){

        await conn.rollback();
        console.error("[ERROR] PUT /api/super-admin/akun-admin:", error);
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
                    message: "Gangguan koneksi Gagal mengedit data akun. Silakan coba beberapa saat lagi.",
                },
                { status: 503 } // 503 Service Unavailable atau 504 Gateway Timeout lebih cocok
            );
        }
        return NextResponse.json({
            message:"Internal Server Error"
        },{status:500});

    }finally{
        conn.release();
    }
}