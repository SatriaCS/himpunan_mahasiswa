import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import fs from "fs";
import path from "path";
import { verifyAdmin } from "@/lib/auth";
import { put, del } from "@vercel/blob";

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

export async function GET(req) {
    const auth = verifyAdmin(req);
            
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    try {

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

        /* ======================
           AMBIL DATA 
        ====================== */
        const [rows] = await db.query(`
            SELECT
                a.username,
                h.nama,
                h.singkatan,
                h.visi,
                h.misi,
                h.email,
                h.no_kontak,
                h.logo,
                h.thumbnail
            FROM akun a
            JOIN hima h ON a.id_akun = h.id_akun
            WHERE a.id_akun = ?
        `, [id_akun]);

        if (!rows) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json(rows);

    } catch (error) {    
        console.error("[ERROR] GET /api/admin/setting:", error);
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

export async function PUT(req) {
    const auth = verifyAdmin(req);
            
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();
    let uploadedBlobUrlLogo = null;
    let uploadedBlobUrlThumbnail = null;
    try {

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
        
        /* ======================
           AMBIL HIMA
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
        const [[hima]] = await conn.query(
            "SELECT id_hima, slug, logo, nama, thumbnail FROM hima WHERE id_akun=?",
            [id_akun]
        );

        if (!hima) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        /* ======================
           AMBIL FORM DATA
        ====================== */
        const formData = await req.formData();

        const id = hima.id_hima;
        const nama = formData.get("nama");
        const singkatan = formData.get("singkatan");
        const email = formData.get("email");
        const no_kontak = formData.get("no_kontak");
        const fileLogo = formData.get("logo");
        const fileThumbnail = formData.get("thumbnail");

        if (!nama) {
            return NextResponse.json(
                { message: "Nama Harus Diisi" },
                { status: 400 }
            );
        }

        /* ======================
           UPLOAD LOGO
        ====================== */
        const oldLogo = hima.logo ?? "";
        let fileNameLogo = oldLogo;
        const oldThumbnail = hima.thumbnail ?? "";
        let fileNameThumbnail = oldThumbnail;

        if (fileLogo instanceof File && fileLogo.size > 0) {

            const MAX_SIZE = 5 * 1024 * 1024;

            if (fileLogo.size > MAX_SIZE) {
                throw new Error("Logo maksimal 5MB");
            }

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/jpg"
            ];

            if (!allowedTypes.includes(fileLogo.type)) {
                throw new Error("Format Logo harus JPG, PNG, WEBP");
            }

            const blob = await put(
                `hima/${user.folder_name}/logo-${Date.now()}-${fileLogo.name}`,
                fileLogo,
                { access: "public" }
            );

            uploadedBlobUrlLogo = blob.url;
            fileNameLogo = blob.url;
        }

        /* ======================
           UPLOAD THUMBNAIL
        ====================== */
        if (fileThumbnail instanceof File && fileThumbnail.size > 0) {

            const MAX_SIZE = 5 * 1024 * 1024;

            if (fileThumbnail.size > MAX_SIZE) {
                throw new Error("Thumbnail maksimal 5MB");
            }

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/jpg"
            ];

            if (!allowedTypes.includes(fileThumbnail.type)) {
                throw new Error("Format Thumbnail harus JPG, PNG, WEBP");
            }

            const blob = await put(
                `hima/${user.folder_name}/thumbnail-${Date.now()}-${fileThumbnail.name}`,
                fileThumbnail,
                { access: "public" }
            );

            uploadedBlobUrlThumbnail = blob.url;
            fileNameThumbnail = blob.url;
        }
        
        /* ======================
            GENERATE SLUG BARU
        ====================== */
        let slug = hima.slug;
        if (nama !== hima.nama) {
            slug = await generateUniqueSlug(nama);
        }      
        
        await conn.beginTransaction();
        /* ======================
           UPDATE DATABASE
        ====================== */
        const [result] = await conn.query(
            `UPDATE hima SET
                nama=?,
                singkatan=?,
                email=?,
                no_kontak=?,
                logo=?,
                thumbnail=?,
                slug=?
            WHERE id_hima=?`,
            [
                nama,
                singkatan,
                email,
                no_kontak,
                fileNameLogo,
                fileNameThumbnail,
                slug,
                id
            ]
        );
        if (result.affectedRows === 0) {
            throw new Error();
        }
        await conn.commit();
        /* ===== hapus file lama logo ===== */
        if (
            fileLogo &&
            fileLogo.size > 0 &&
            oldLogo
        ) {
                try {
                    await del(oldLogo);
                } catch (deleteError) {
                    console.error("Gagal menghapus logo lama dari blob:", deleteError);
                }
        }
        /* ===== hapus file lama thumbnail ===== */
        if (
            fileThumbnail &&
            fileThumbnail.size > 0 &&
            oldThumbnail
        ) {
                try {
                    await del(oldThumbnail);
                } catch (deleteError) {
                    console.error("Gagal menghapus thumbnail lama dari blob:", deleteError);
                }
        }
        return NextResponse.json({
            message: "Data berhasil diperbarui"
        });

    } catch (error) {
        console.error("[ERROR] PUT /api/admin/setting:", error);
        await conn.rollback();
        // 🔥 HAPUS BLOB JIKA SUDAH TERSIMPAN
        if (uploadedBlobUrlLogo) {
            try {
                await del(uploadedBlobUrlLogo);
            } catch (deleteError) {
                console.error("Gagal menghapus logo baru dari blob:", deleteError);
            }
        }
        if (uploadedBlobUrlThumbnail) {
            try {
                await del(uploadedBlobUrlThumbnail);
            } catch (deleteError) {
                console.error("Gagal menghapus thumbnail baru dari blob:", deleteError);
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
                    message: "Gangguan koneksi Gagal Mengubah data. Silakan coba beberapa saat lagi.",
                },
                { status: 503 } // 503 Service Unavailable atau 504 Gateway Timeout lebih cocok
            );
        }
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.status || 500 }
        );
    } finally {
        conn.release();
    }
}