import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import fs from "fs";
import path from "path";
import { verifyAdmin } from "@/lib/auth";

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

export async function POST(req) {
    const auth = verifyAdmin(req);
            
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();
    let filePath = null;
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
           AMBIL USER + HIMA
        ====================== */
        const [[user]] = await conn.query(
            "SELECT username FROM akun WHERE id_akun=?",
            [id_akun]
        );

        if (!user)
            return NextResponse.json(
                { message: "Gagal menambahkan data" },
                { status: 404 }
            );

        const [[hima]] = await conn.query(
            "SELECT id_hima FROM hima WHERE id_akun=?",
            [id_akun]
        );

        if (!hima)
            return NextResponse.json(
                { message: "Gagal menambahkan data" },
                { status: 404 }
            );

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
           BUAT FOLDER UPLOAD
        ====================== */
        const uploadDir = path.join(
            process.cwd(),
            "public/uploads/news",
            user.username
        );

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        /* ======================
           SIMPAN FILE
        ====================== */
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `${Date.now()}-${file.name}`;
        filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);

        await conn.beginTransaction();
        
        /* ======================
           INSERT DATABASE
        ====================== */
        const [result] = await conn.query(
            `INSERT INTO berita
            (id_hima, slug, judul, thumbnail, deskripsi)
            VALUES (?, ?, ?, ?, ?)`,
            [
                hima.id_hima,
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
        await conn.rollback();
        // 🔥 HAPUS FILE JIKA SUDAH TERSIMPAN
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    } finally {
        conn.release();
    }
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

        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 5;

        const offset = (page - 1) * limit;

        /* ======================
           AMBIL USER + HIMA
        ====================== */
        const [[user]] = await db.query(
            "SELECT username FROM akun WHERE id_akun=?",
            [id_akun]
        );

        if (!user) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        const [[hima]] = await db.query(
            "SELECT id_hima FROM hima WHERE id_akun=?",
            [id_akun]
        );

        if (!hima) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        /* ======================
           AMBIL DATA BERITA
        ====================== */
        const [rows] = await db.query(`
            SELECT
                b.id_berita AS id,
                b.slug,
                b.judul,
                b.thumbnail,
                b.deskripsi,
                b.created_at,
                b.updated_at,
                a.username
            FROM berita b
            JOIN hima h ON b.id_hima = h.id_hima
            JOIN akun a ON h.id_akun = a.id_akun
            WHERE b.id_hima = ?
            ORDER BY b.id_berita DESC
            LIMIT ? OFFSET ?
        `, [hima.id_hima, limit, offset]);
        /* ======================
            TOTAL DATA
        ====================== */
        const [[total]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM berita b
            JOIN hima h ON b.id_hima = h.id_hima
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
        
        return NextResponse.json(
            { message: "Terjadi kesalahan server" },
            { status: 500 }
        );
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
           AMBIL USER + HIMA
        ====================== */
        const [[user]] = await conn.query(
            "SELECT username FROM akun WHERE id_akun=?",
            [id_akun]
        );

        if (!user) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        const [[hima]] = await conn.query(
            "SELECT id_hima FROM hima WHERE id_akun=?",
            [id_akun]
        );

        if (!hima) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        /* ======================
           CEK DATA BERITA
        ====================== */
        const [[news]] = await conn.query(
            `SELECT thumbnail 
             FROM berita 
             WHERE id_berita=? AND id_hima=?`,
            [id, hima.id_hima]
        );

        if (!news) {
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
        const filePath = path.join(
            process.cwd(),
            "public/uploads/news",
            user.username,
            news.thumbnail
        );

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return NextResponse.json({
            message: "Berita berhasil dihapus"
        });

    } catch (error) {
        await conn.rollback(); 
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
    let filePath = null;
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
           AMBIL USER + HIMA
        ====================== */
        const [[user]] = await conn.query(
            "SELECT username FROM akun WHERE id_akun=?",
            [id_akun]
        );

        if (!user) {
            return NextResponse.json(
                { message: "Gagal mengedit data" },
                { status: 404 }
            );
        }

        const [[hima]] = await conn.query(
            "SELECT id_hima FROM hima WHERE id_akun=?",
            [id_akun]
        );
        
        if (!hima) {
            return NextResponse.json(
                { message: "Gagal mengedit data" },
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
            "SELECT * FROM berita WHERE id_berita=? AND id_hima=?",
            [id, hima.id_hima]
        );

        if (!oldNews) {
            return NextResponse.json(
                { message: "Gagal mengedit data" },
                { status: 404 }
            );
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
        
        /* ===== folder ===== */
        const uploadDir = path.join(
            process.cwd(),
            "public/uploads/news",
            user.username
        );

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

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            /* ===== simpan file baru ===== */
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            fileName = `${Date.now()}-${file.name}`;
            filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);
            
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
                const oldPath = path.join(uploadDir, oldThumbnail);
                
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        return NextResponse.json({
            message: "Berita berhasil diperbarui"
        });

    } catch (error) {
        await conn.rollback();
        // 🔥 HAPUS FILE JIKA SUDAH TERSIMPAN
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    } finally {
        conn.release();
    }
}