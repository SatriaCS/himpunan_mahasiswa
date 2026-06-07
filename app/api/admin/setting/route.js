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
    let filePathLogo = null;
    let filePathThumbnail = null;
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
           UPDATE logo
        ====================== */
        const oldLogo =  hima.logo ?? "";
        let fileNameLogo = oldLogo;
        const oldThumbnail =  hima.thumbnail ?? "";
        let fileNameThumbnail = oldThumbnail;
        /* ===== folder ===== */
            const uploadDir = path.join(
                process.cwd(),
                "public/uploads/hima",
                user.username
            );

        /* ======================
           UPDATE logo
        ====================== */
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

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            

            /* ===== simpan file baru ===== */
            const bytes = await fileLogo.arrayBuffer();
            const buffer = Buffer.from(bytes);

            fileNameLogo = `${Date.now()}-${fileLogo.name}`;
            filePathLogo = path.join(uploadDir, fileNameLogo);
            fs.writeFileSync(filePathLogo, buffer);
        }

        /* ======================
           UPDATE thumbnail
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

            /* ===== folder ===== */
            const uploadDir = path.join(
                process.cwd(),
                "public/uploads/hima",
                user.username
            );

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            /* ===== simpan file baru ===== */
            const bytes = await fileThumbnail.arrayBuffer();
            const buffer = Buffer.from(bytes);

            fileNameThumbnail = `${Date.now()}-${fileThumbnail.name}`;
            filePathThumbnail = path.join(uploadDir, fileNameThumbnail);
            fs.writeFileSync(filePathThumbnail, buffer);
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
        /* ===== hapus file lama ===== */
        if (
                hima.logo &&
                fileLogo &&
                fileLogo.size > 0 &&
                oldLogo
            ) {
                const oldPath = path.join(uploadDir, oldLogo);
                        
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
        }
        if (
                hima.thumbnail &&
                fileThumbnail &&
                fileThumbnail.size > 0 &&
                oldThumbnail
            ) {
                const oldPath = path.join(uploadDir, oldThumbnail);
                        
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
        }
        return NextResponse.json({
            message: "Data berhasil diperbarui"
        });

    } catch (error) {       
        await conn.rollback();
        // 🔥 HAPUS FILE JIKA SUDAH TERSIMPAN
        if (filePathLogo && fs.existsSync(filePathLogo)) {
            fs.unlinkSync(filePathLogo);
        }
        if (filePathThumbnail && fs.existsSync(filePathThumbnail)) {
            fs.unlinkSync(filePathThumbnail);
        }
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.status || 500 }
        );
    } finally {
        conn.release();
    }
}