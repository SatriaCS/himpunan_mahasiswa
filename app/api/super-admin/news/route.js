import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import fs from "fs";
import path from "path";
import { verifySuperAdmin } from "@/lib/auth";
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
            "SELECT id_berita FROM berita WHERE slug = ?",
            [slug]
        );

        if (!existing) break;

        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

export async function GET(req) {
    const auth = verifySuperAdmin(req);
            
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

        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 5;
        const sort = searchParams.get("sort") || "latest";

        const offset = (page - 1) * limit;
        
        /* ======================
            USER
        ====================== */
        const [[user]] = await db.query(
            "SELECT username FROM super_admin WHERE id_akun=?",
            [id_akun]
        );
        
        if (!user) {
            return NextResponse.json(
                { message: "Gagal mengambil Data" },
                { status: 404 }
            );
        }

        /* ======================
           AMBIL DATA BERITA
        ====================== */

        let orderBy = "b.created_at DESC";

        if (sort === "views") {
            orderBy = "b.views DESC";
        }

        const [rows] = await db.query(`
            SELECT
                b.id_berita AS id,
                b.slug,
                b.judul,
                b.thumbnail,
                b.deskripsi,
                b.headline,
                b.created_at,
                b.updated_at,
                b.views,
                a.username
            FROM berita b
            LEFT JOIN hima h ON b.id_hima = h.id_hima
            LEFT JOIN akun a ON h.id_akun = a.id_akun
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        /* ======================
            TOTAL DATA
        ====================== */
        const [[total]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM berita 
        `);  

        return NextResponse.json({
            username: user.username,
            data: rows,
            total: total.total,
            page,
            limit,
            totalPages: Math.ceil(total.total / limit)
        });

    } catch (error) {
        console.error("[ERROR] GET /api/super-admin/news:", error);
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
                    message: "Gangguan koneksi Gagal Memuat data berita. Silakan coba beberapa saat lagi.",
                },
                { status: 503 } // 503 Service Unavailable atau 504 Gateway Timeout lebih cocok
            );
        } 
        return NextResponse.json(
            { message: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    const auth = verifySuperAdmin(req);
            
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();
    let uploadedBlobUrl = null;
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
            USER
        ====================== */
        const [[user]] = await db.query(
            "SELECT username FROM super_admin WHERE id_akun=?",
            [id_akun]
        );
        
        if (!user) {
            return NextResponse.json(
                { message: "Gagal menambahkan Data" },
                { status: 404 }
            );
        }

        /* ======================
           AMBIL FORM DATA
        ====================== */
        const formData = await req.formData();

        const judul = formData.get("judul");
        const deskripsi = formData.get("deskripsi");
        const file = formData.get("thumbnail");

        if (!judul || !deskripsi || !(file instanceof File) || file.size === 0) {
            return NextResponse.json(
                { message: "judul, deskripsi dan thumbnail harus diisi" },
                { status: 400 }
            );
        }

        /* ======================
           GENERATE SLUG
        ====================== */
        const slug = await generateUniqueSlug(judul);

        /* ======================
           VALIDASI FILE
        ====================== */
        const MAX_SIZE = 5 * 1024 * 1024;

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { message: "Thumbnail maksimal 5MB" },
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
                { message: "Format harus JPG, PNG, WEBP" },
                { status: 400 }
            );
        }

        /* ======================
           UPLOAD THUMBNAIL
        ====================== */
        let fileName = null;

        if (file && file.size > 0) {
            const blob = await put(
                `news/${user.username}/${Date.now()}-${file.name}`,
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
            `INSERT INTO berita
            (slug, judul, thumbnail, deskripsi)
            VALUES ( ?, ?, ?, ?)`,
            [
                slug,
                judul,
                fileName,
                deskripsi
            ]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }
        await conn.commit();
        return NextResponse.json({
            message: "Berita berhasil ditambahkan",
        });

    } catch (error) {
        console.error("[ERROR] POST /api/super-admin/news:", error);
        await conn.rollback();
        
        // 🔥 HAPUS BLOB JIKA SUDAH TERSIMPAN
        if (uploadedBlobUrl) {
            try {
                await del(uploadedBlobUrl);
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
                    message: "Gangguan koneksi Gagal Menambah data berita. Silakan coba beberapa saat lagi.",
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
    const auth = verifySuperAdmin(req);
            
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();
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
           AMBIL PARAM ID
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
            cek data
        ====================== */
        const [[user]] = await db.query(
            "SELECT username FROM super_admin WHERE id_akun=?",
            [id_akun]
        );
        
        if (!user) {
            return NextResponse.json(
                { message: "Gagal menghapus Data" },
                { status: 404 }
            );
        }

        /* ======================
           CEK DATA BERITA
        ====================== */
        const [[news]] = await conn.query(
            `SELECT thumbnail , id_hima
             FROM berita 
             WHERE id_berita=?`,
            [id]
        );

        if (!news) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }
        let akun = null;
        
        if (news.id_hima) {
            const [[hima]] = await conn.query(
                "SELECT id_hima, id_akun FROM hima WHERE id_hima=?",
                [news.id_hima]
            );

            if (!hima) {
                return NextResponse.json(
                    { message: "Data tidak ditemukan" },
                    { status: 404 }
                );
            }
            const [[akunData]] = await conn.query(
                "SELECT username FROM akun WHERE id_akun=?",
                [hima.id_akun]
            );

            if (!akunData) {
                return NextResponse.json(
                    { message: "Data tidak ditemukan" },
                    { status: 404 }
                );
            }

            akun = akunData;
        }
        

        await conn.beginTransaction();

        /* ======================
           DELETE DATABASE
        ====================== */
        const [result] = await conn.query(
            "DELETE FROM berita WHERE id_berita=?",
            [id]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }
        await conn.commit();
        
        /* ======================
           HAPUS FILE THUMBNAIL
        ====================== */
        if (news.thumbnail) {
                try {
                    await del(news.thumbnail);
                } catch (deleteError) {
                    console.error("Gagal menghapus thumbnail dari blob:", deleteError);
                }
        }

        return NextResponse.json({
            message: "Berita berhasil dihapus"
        });

    } catch (error) {
        await conn.rollback(); 
        console.error("[ERROR] DELETE /api/super-admin/news:", error);
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
                    message: "Gangguan koneksi Gagal Menghapus data berita. Silakan coba beberapa saat lagi.",
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
    const auth = verifySuperAdmin(req);
            
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();
    let uploadedBlobUrl = null;
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
            USER
        ====================== */
        const [[user]] = await db.query(
            "SELECT username FROM super_admin WHERE id_akun=?",
            [id_akun]
        );
        
        if (!user) {
            return NextResponse.json(
                { message: "Gagal mengubah Data" },
                { status: 404 }
            );
        }

        /* ======================
           AMBIL FORM DATA
        ====================== */
        const formData = await req.formData();

        const id = formData.get("id");
        const judul = formData.get("judul");
        const deskripsi = formData.get("deskripsi");
        const file = formData.get("thumbnail");
        
        if (!id) {
            return NextResponse.json(
                { message: "Gagal mengedit data" },
                { status: 404 }
            );
        }

        if (!judul || !deskripsi) {
            return NextResponse.json(
                { message: "judul dan deskripsi wajib diisi" },
                { status: 400 }
            );
        }

        /* ======================
           CEK DATA LAMA
        ====================== */
        const [[oldNews]] = await conn.query(
            "SELECT * FROM berita WHERE id_berita=?",
            [id]
        );

        if (!oldNews) {
            return NextResponse.json(
                { message: "Gagal mengedit data" },
                { status: 404 }
            );
        }

        let akun = null;
        
        if (oldNews.id_hima) {
            const [[hima]] = await conn.query(
                "SELECT id_hima, id_akun FROM hima WHERE id_hima=?",
                [oldNews.id_hima]
            );

            if (!hima) {
                return NextResponse.json(
                    { message: "Data tidak ditemukan" },
                    { status: 404 }
                );
            }
            const [[akunData]] = await conn.query(
                "SELECT folder_name FROM hima WHERE id_akun=?",
                [hima.id_akun]
            );

            if (!akunData) {
                return NextResponse.json(
                    { message: "Data tidak ditemukan" },
                    { status: 404 }
                );
            }

            akun = akunData;
        }

        /* ======================
           GENERATE SLUG BARU
        ====================== */
        let slug = oldNews.slug;

        if (judul !== oldNews.judul) {
            slug = await generateUniqueSlug(judul);
        }
        
        /* ======================
           UPDATE THUMBNAIL (OPTIONAL)
        ====================== */
        const oldThumbnail = oldNews.thumbnail;
        let fileName = oldThumbnail;
        
        if (file && file.size > 0) {

            const MAX_SIZE = 5 * 1024 * 1024;

            if (file.size > MAX_SIZE) {
                return NextResponse.json(
                    { message: "Thumbnail maksimal 5MB" },
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
                    { message: "Format harus JPG, PNG, WEBP" },
                    { status: 400 }
                );
            }

            const uploadUsername = oldNews.id_hima ? akun.folder_name : user.username;

            const blob = await put(
                `news/${uploadUsername}/${Date.now()}-${file.name}`,
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
        const [result] = await conn.query(
            `UPDATE berita SET
                slug=?,
                judul=?,
                deskripsi=?,
                thumbnail=?,
                updated_at=NOW()
            WHERE id_berita=?`,
            [
                slug,
                judul,
                deskripsi,
                fileName,
                id
            ]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }
        await conn.commit();
        /* ===== hapus file lama ===== */
        if (
            file &&
            file.size > 0 &&
            oldThumbnail
        ) {
                try {
                    await del(oldThumbnail);
                } catch (deleteError) {
                    console.error("Gagal menghapus thumbnail lama dari blob:", deleteError);
                }
        }

        return NextResponse.json({
            message: "Berita berhasil diperbarui"
        });

    } catch (error) {
        console.error("[ERROR] PUT /api/super-admin/news:", error);
        await conn.rollback();
        // 🔥 HAPUS BLOB JIKA SUDAH TERSIMPAN
        if (uploadedBlobUrl) {
            try {
                await del(uploadedBlobUrl);
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
                    message: "Gangguan koneksi Gagal Mengubah data berita. Silakan coba beberapa saat lagi.",
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