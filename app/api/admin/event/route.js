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
           AMBIL DATA KEGIATAN
        ====================== */
        const [rows] = await db.query(`
            SELECT
                id_kegiatan AS id,
                judul,
                deskripsi,
                kategori,
                tanggal,
                waktu,
                tempat,
                kouta,
                flayer,
                slug,
                link_pendaftaran as link
            FROM kegiatan
            WHERE id_hima = ?
            ORDER BY id_kegiatan DESC
            LIMIT ? OFFSET ?
        `, [hima.id_hima,limit, offset]);
        /* ======================
            TOTAL DATA
        ====================== */
        const [[total]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM kegiatan k
            JOIN hima h ON k.id_hima = h.id_hima
            WHERE h.id_akun = ?
        `,[id_akun]);         

        /* ======================
           TAMBAHKAN USERNAME
        ====================== */
        const result = rows.map(item => ({
            ...item,
            username: user.username
        }));

        return NextResponse.json({
            data: result,
            total: total.total,
            page,
            limit,
            totalPages: Math.ceil(total.total / limit)
        });

    } catch (error) {
        
        return NextResponse.json(
            { message: "Internal server error" },
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

        /* ======================
           USER + HIMA
        ====================== */
        const [[user]] = await conn.query(
            "SELECT username FROM akun WHERE id_akun=?",
            [id_akun]
        );

        if (!user) {
            return NextResponse.json(
                { message: "Gagal menambahkan Data" },
                { status: 404 }
            );
        }

        const [[hima]] = await conn.query(
            "SELECT id_hima FROM hima WHERE id_akun=?",
            [id_akun]
        );

        if (!hima) {
            return NextResponse.json(
                { message: "Gagal menambahkan Data" },
                { status: 404 }
            );
        }

        /* ======================
           FORM DATA
        ====================== */
        const cekNull = (value) => {
            if (!value || value.trim() === "" || value === "null") {
                return null;
            }
            return value;
        }

        const formData = await req.formData();

        const judul = formData.get("judul");
        const deskripsi = formData.get("deskripsi");
        const tanggal = formData.get("tanggal");
        const waktu = formData.get("waktu");
        const kategori = cekNull(formData.get("kategori"));
        const tempat = cekNull(formData.get("tempat"));
        const kouta = cekNull(formData.get("kouta"));
        const link = cekNull(formData.get("link"));
        const fileFlayer = formData.get("flayer");

        if (!judul || !deskripsi || !tanggal || !waktu) {
            return NextResponse.json(
                { message: "judul, deskripsi, tanggal, waktu  harus diisi" },
                { status: 400 }
            );
        }
        /* ======================
           SLUG UNIK
        ====================== */
        const slug = await generateUniqueSlug(conn, judul);

        /* ======================
           UPLOAD FLAYER
        ====================== */
        let fileName = null;

        if (fileFlayer && fileFlayer.size > 0) {
            /* ======================
            VALIDASI UKURAN FILE
            ====================== */
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB

            if (fileFlayer.size > MAX_SIZE) {
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

            if (!allowedTypes.includes(fileFlayer.type)) {
                return NextResponse.json(
                    { message: "Format foto harus JPG, PNG, atau WEBP" },
                    { status: 400 }
                );
            }

            const blob = await put(
                `event/${user.username}/${Date.now()}-${fileFlayer.name}`,
                fileFlayer,
                {
                    access: "public",
                }
            );
            uploadedBlobUrl = blob.url;
            fileName = blob.url;

        }
        await conn.beginTransaction();
        /* ======================
           INSERT KEGIATAN
        ====================== */
        const [result] = await conn.query(
            `INSERT INTO kegiatan
            (id_hima, judul, deskripsi, kategori, tanggal,
             waktu, tempat, kouta, flayer, slug,
             link_pendaftaran)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [
                hima.id_hima,
                judul,
                deskripsi,
                kategori,
                tanggal,
                waktu,
                tempat,
                kouta,
                fileName,
                slug,
                link,
            ]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }

        await conn.commit();

        return NextResponse.json({
            message: "Kegiatan berhasil dibuat"
        });

    } catch (error) {

        await conn.rollback();
        if (uploadedBlobUrl) {
            await del(uploadedBlobUrl);
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
    
        /* ======================
           USER + HIMA
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
           FORM DATA
        ====================== */
        const cekNull = (value) => {
            if (!value || value.trim() === "" || value === "null") {
                return null;
            }
            return value;
        }
        const formData = await req.formData();

        const id = formData.get("id");
        const judul = formData.get("judul");
        const deskripsi = formData.get("deskripsi");
        const tanggal = formData.get("tanggal");
        const waktu = formData.get("waktu");
        const kategori = cekNull(formData.get("kategori"));        
        const tempat = cekNull(formData.get("tempat"));
        const kouta = cekNull(formData.get("kouta"));
        const link = cekNull(formData.get("link"));
        const fileFlayer = formData.get("flayer");        
        
        if (!id) {
            return NextResponse.json(
                { message: "gagal mengedit data" },
                { status: 400 }
            );
        }

        if (!judul || !deskripsi || !tanggal || !waktu) {
            return NextResponse.json(
                { message: "judul, deskripsi, tanggal, waktu  harus diisi" },
                { status: 400 }
            );
        }

        /* ======================
           CEK KEGIATAN
        ====================== */
        const [[kegiatan]] = await conn.query(
            "SELECT flayer FROM kegiatan WHERE id_kegiatan=? AND id_hima=?",
            [id, hima.id_hima]
        );

        if (!kegiatan) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        const oldFlayer = kegiatan.flayer;
        let fileName = oldFlayer;

        /* ======================
           UPDATE FLAYER OPTIONAL
        ====================== */
        if (fileFlayer && fileFlayer.size > 0) {
            /* ======================
            VALIDASI UKURAN FILE
            ====================== */
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB

            if (fileFlayer.size > MAX_SIZE) {
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

            if (!allowedTypes.includes(fileFlayer.type)) {
                return NextResponse.json(
                    { message: "Format foto harus JPG, PNG, atau WEBP" },
                    { status: 400 }
                );
            }

            const blob = await put(
                `event/${user.username}/${Date.now()}-${fileFlayer.name}`,
                fileFlayer,
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
            `UPDATE kegiatan SET
                judul=?,
                deskripsi=?,
                kategori=?,
                tanggal=?,
                waktu=?,
                tempat=?,
                kouta=?,
                flayer=?,
                link_pendaftaran=?
            WHERE id_kegiatan=? AND id_hima=?`,
            [
                judul,
                deskripsi,
                kategori,
                tanggal,
                waktu,
                tempat,
                kouta,
                fileName,
                link,
                id,
                hima.id_hima
            ]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }
        await conn.commit();

        /* hapus file lama jika upload baru */
        if (fileFlayer && fileFlayer.size > 0 && oldFlayer) {
            try {
                await del(oldFlayer);
            } catch (deleteError) {
                console.error("Gagal menghapus flayer lama:", deleteError);
            }
        }
        return NextResponse.json({
            message: "Kegiatan berhasil diperbarui"
        });

    } catch (error) {
        await conn.rollback();

        console.error("Gagal membuat kegiatan:", error);

        if (uploadedBlobUrl) {
            try {
                await del(uploadedBlobUrl);
            } catch (deleteError) {
                console.error("Gagal menghapus flayer baru:", deleteError);
            }
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
           AMBIL ID DARI QUERY
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
           CEK DATA KEGIATAN
        ====================== */
        const [[kegiatan]] = await conn.query(
            "SELECT flayer,slug  FROM kegiatan WHERE id_kegiatan=? AND id_hima=?",
            [id, hima.id_hima]
        );

        if (!kegiatan) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        await conn.beginTransaction();

        /* ======================
           HAPUS DATABASE
        ====================== */
        const [result] = await conn.query(
            "DELETE FROM kegiatan WHERE id_kegiatan=? AND id_hima=?",
            [id, hima.id_hima]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }
        await conn.commit();
        
        /* ======================
           HAPUS FILE FLAYER
        ====================== */
        if (kegiatan.flayer) {
            try {
                await del(kegiatan.flayer);
            } catch (deleteError) {
                console.error("Gagal menghapus flayer:", deleteError);
            }
        }
        return NextResponse.json({
            message: "Kegiatan berhasil dihapus"
        });

    } catch (error) {
        await conn.rollback();
        return NextResponse.json(
            { message: "Terjadi kesalahan server" },
            { status: 500 }
        );
    } finally {
        conn.release();
    }
}

const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
};

const generateUniqueSlug = async (conn, judul) => {

    let baseSlug = slugify(judul);
    let slug = baseSlug;
    let counter = 1;

    while (true) {

        const [[existing]] = await conn.query(
            "SELECT slug FROM kegiatan WHERE slug=?",
            [slug]
        );

        if (!existing) break;

        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
};

// lama ada custom field peserta pendaftaran
// export async function GET(req) {
//     try {

//         /* ======================
//            CEK TOKEN LOGIN
//         ====================== */
//         const token = req.cookies.get("token")?.value;

//         if (!token) {
//             return NextResponse.json(
//                 { message: "Unauthorized" },
//                 { status: 401 }
//             );
//         }

//         const decoded = jwt.verify(
//             token,
//             process.env.JWT_SECRET
//         );

//         const id_akun = decoded.id;

//         /* ======================
//            AMBIL USER + HIMA
//         ====================== */
//         const [[user]] = await db.query(
//             "SELECT username FROM akun WHERE id_akun=?",
//             [id_akun]
//         );

//         const [[hima]] = await db.query(
//             "SELECT id_hima FROM hima WHERE id_akun=?",
//             [id_akun]
//         );

//         if (!hima) {
//             return NextResponse.json(
//                 { message: "Hima tidak ditemukan" },
//                 { status: 404 }
//             );
//         }

//         /* ======================
//            AMBIL DATA KEGIATAN
//         ====================== */
//         const [rows] = await db.query(`
//             SELECT
//                 id_kegiatan AS id,
//                 judul,
//                 deskripsi,
//                 kategori,
//                 tanggal,
//                 waktu,
//                 tempat,
//                 kouta,
//                 flayer,
//                 slug,
//                 deskripsi_form as deskripsiForm,
//                 custom_fields as customFields
//             FROM kegiatan
//             WHERE id_hima = ?
//             ORDER BY id_kegiatan DESC
//         `, [hima.id_hima]);

//         /* ======================
//            TAMBAHKAN USERNAME
//         ====================== */
//         const result = rows.map(item => ({
//             ...item,
//             username: user.username
//         }));

//         return NextResponse.json(result);

//     } catch (error) {

//         console.log(error.message);

//         return NextResponse.json(
//             { message: "Terjadi kesalahan server" },
//             { status: 500 }
//         );
//     }
// }

// export async function POST(req) {

//     const conn = await db.getConnection();

//     try {

//         /* ======================
//            CEK TOKEN
//         ====================== */
//         const token = req.cookies.get("token")?.value;

//         if (!token) {
//             return NextResponse.json(
//                 { message: "Unauthorized" },
//                 { status: 401 }
//             );
//         }

//         const decoded = jwt.verify(
//             token,
//             process.env.JWT_SECRET
//         );

//         const id_akun = decoded.id;

//         await conn.beginTransaction();

//         /* ======================
//            USER + HIMA
//         ====================== */
//         const [[user]] = await conn.query(
//             "SELECT username FROM akun WHERE id_akun=?",
//             [id_akun]
//         );

//         const [[hima]] = await conn.query(
//             "SELECT id_hima FROM hima WHERE id_akun=?",
//             [id_akun]
//         );

//         if (!hima) {
//             throw new Error("Hima tidak ditemukan");
//         }

//         /* ======================
//            FORM DATA
//         ====================== */
//         const formData = await req.formData();

//         const judul = formData.get("judul");
//         const deskripsi = formData.get("deskripsi");
//         const kategori = formData.get("kategori");
//         const tanggal = formData.get("tanggal");
//         const waktu = formData.get("waktu");
//         const tempat = formData.get("tempat");
//         const kouta = formData.get("kouta");
//         const fileFlayer = formData.get("flayer");
//         const deskripsiForm = formData.get("deskripsiForm");

//         const customFields = JSON.parse(
//             formData.get("customFields") || "[]"
//         );

//         /* ======================
//            SLUG UNIK
//         ====================== */
//         const slug = await generateUniqueSlug(conn, judul);

//         /* ======================
//            UPLOAD FLAYER
//         ====================== */
//         let fileName = "";

//         if (fileFlayer && fileFlayer.size > 0) {

//             const uploadDir = path.join(
//                 process.cwd(),
//                 "public/uploads/event",
//                 user.username
//             );

//             if (!fs.existsSync(uploadDir)) {
//                 fs.mkdirSync(uploadDir, { recursive: true });
//             }

//             const buffer = Buffer.from(
//                 await fileFlayer.arrayBuffer()
//             );

//             fileName = `${Date.now()}-${fileFlayer.name}`;

//             fs.writeFileSync(
//                 path.join(uploadDir, fileName),
//                 buffer
//             );
//         }

//         /* ======================
//            INSERT KEGIATAN
//         ====================== */
//         await conn.query(
//             `INSERT INTO kegiatan
//             (id_hima, judul, deskripsi, kategori, tanggal,
//              waktu, tempat, kouta, flayer, slug,
//              deskripsi_form, custom_fields)
//             VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
//             [
//                 hima.id_hima,
//                 judul,
//                 deskripsi,
//                 kategori,
//                 tanggal,
//                 waktu,
//                 tempat,
//                 kouta,
//                 fileName,
//                 slug,
//                 deskripsiForm,
//                 JSON.stringify(customFields)
//             ]
//         );

//         await conn.commit();

//         return NextResponse.json({
//             message: "Kegiatan berhasil dibuat"
//         });

//     } catch (error) {

//         await conn.rollback();

//         console.log(error);

//         return NextResponse.json(
//             { message: "Terjadi kesalahan server" },
//             { status: 500 }
//         );

//     } finally {
//         conn.release();
//     }
// }

// export async function PUT(req) {
//     try {

//         /* ======================
//            CEK TOKEN
//         ====================== */
//         const token = req.cookies.get("token")?.value;

//         if (!token) {
//             return NextResponse.json(
//                 { message: "Unauthorized" },
//                 { status: 401 }
//             );
//         }

//         const decoded = jwt.verify(
//             token,
//             process.env.JWT_SECRET
//         );

//         const id_akun = decoded.id;

//         /* ======================
//            USER + HIMA
//         ====================== */
//         const [[user]] = await db.query(
//             "SELECT username FROM akun WHERE id_akun=?",
//             [id_akun]
//         );

//         const [[hima]] = await db.query(
//             "SELECT id_hima FROM hima WHERE id_akun=?",
//             [id_akun]
//         );

//         if (!hima) {
//             return NextResponse.json(
//                 { message: "Hima tidak ditemukan" },
//                 { status: 404 }
//             );
//         }

//         /* ======================
//            FORM DATA
//         ====================== */
//         const formData = await req.formData();

//         const id = formData.get("id");
//         const judul = formData.get("judul");
//         const deskripsi = formData.get("deskripsi");
//         const kategori = formData.get("kategori");
//         const tanggal = formData.get("tanggal");
//         const waktu = formData.get("waktu");
//         const tempat = formData.get("tempat");
//         const kouta = formData.get("kouta");
//         const fileFlayer = formData.get("flayer");
//         const deskripsiForm = formData.get("deskripsiForm");

//         /* CUSTOM FIELDS JSON */
//         const customFields = JSON.parse(
//             formData.get("customFields") || "[]"
//         );

//         if (!id || !judul || !tanggal || !kouta) {
//             return NextResponse.json(
//                 { message: "Judul, tanggal, kouta wajib diisi" },
//                 { status: 400 }
//             );
//         }

//         /* ======================
//            CEK KEGIATAN
//         ====================== */
//         const [[kegiatan]] = await db.query(
//             "SELECT flayer FROM kegiatan WHERE id_kegiatan=? AND id_hima=?",
//             [id, hima.id_hima]
//         );

//         if (!kegiatan) {
//             return NextResponse.json(
//                 { message: "Kegiatan tidak ditemukan" },
//                 { status: 404 }
//             );
//         }

//         let fileName = kegiatan.flayer;

//         /* ======================
//            UPDATE FLAYER OPTIONAL
//         ====================== */
//         if (fileFlayer && fileFlayer.size > 0) {

//             const uploadDir = path.join(
//                 process.cwd(),
//                 "public/uploads/event",
//                 user.username
//             );

//             if (!fs.existsSync(uploadDir)) {
//                 fs.mkdirSync(uploadDir, { recursive: true });
//             }

//             /* hapus lama */
//             if (fileName) {
//                 const oldPath = path.join(uploadDir, fileName);

//                 if (fs.existsSync(oldPath)) {
//                     fs.unlinkSync(oldPath);
//                 }
//             }

//             const bytes = await fileFlayer.arrayBuffer();
//             const buffer = Buffer.from(bytes);

//             fileName = `${Date.now()}-${fileFlayer.name}`;

//             fs.writeFileSync(
//                 path.join(uploadDir, fileName),
//                 buffer
//             );
//         }

//         const [[oldKegiatan]] = await db.query(
//             `SELECT custom_fields, slug
//             FROM kegiatan
//             WHERE id_kegiatan=? AND id_hima=?`,
//             [id, hima.id_hima]
//         );

//         const oldFields =
//             typeof oldKegiatan.custom_fields === "string"
//                 ? JSON.parse(oldKegiatan.custom_fields)
//                 : oldKegiatan.custom_fields || [];

//         const newFieldIds = customFields.map(f => Number(f.id));

//         const deletedImageFieldIds = oldFields
//             .filter(old =>
//                 old.type === "image" &&
//                 !newFieldIds.includes(Number(old.id))
//             )
//             .map(f => Number(f.id));
        
//         const pesertaDir = path.join(
//             process.cwd(),
//             "public/uploads/peserta_event",
//             oldKegiatan.slug
//         );

//         /* ======================
//            UPDATE DATABASE
//         ====================== */
//         await db.query(
//             `UPDATE kegiatan SET
//                 judul=?,
//                 deskripsi=?,
//                 kategori=?,
//                 tanggal=?,
//                 waktu=?,
//                 tempat=?,
//                 kouta=?,
//                 flayer=?,
//                 deskripsi_form=?,
//                 custom_fields=?
//             WHERE id_kegiatan=? AND id_hima=?`,
//             [
//                 judul,
//                 deskripsi,
//                 kategori,
//                 tanggal,
//                 waktu,
//                 tempat,
//                 kouta,
//                 fileName,
//                 deskripsiForm,
//                 JSON.stringify(customFields), // penting
//                 id,
//                 hima.id_hima
//             ]
//         );

//         const activeFieldIds = customFields.map(f => Number(f.id));

//         const [participants] = await db.query(
//             `SELECT id_peserta, data_peserta
//             FROM peserta_kegiatan
//             WHERE id_kegiatan=?`,
//             [id]
//         );

//         for (const peserta of participants) {

//             let dataPeserta = peserta.data_peserta;

//             if (typeof dataPeserta === "string") {
//                 dataPeserta = JSON.parse(dataPeserta);
//             }

//             dataPeserta = dataPeserta || [];

//             /* =========================
//             HAPUS FILE IMAGE LAMA
//             ========================= */
//             for (const answer of dataPeserta) {

//                 if (deletedImageFieldIds.includes(Number(answer.id))) {

//                     if (answer.value) {

//                         const imagePath = path.join(
//                             pesertaDir,
//                             answer.value
//                         );

//                         if (fs.existsSync(imagePath)) {
//                             fs.unlinkSync(imagePath);
//                         }
//                     }
//                 }
//             }

//             /* =========================
//             FILTER FIELD VALID
//             ========================= */
//             const filteredData = dataPeserta.filter(answer =>
//                 activeFieldIds.includes(Number(answer.id))
//             );

//             await db.query(
//                 `UPDATE peserta_kegiatan
//                 SET data_peserta=?
//                 WHERE id_peserta=?`,
//                 [
//                     JSON.stringify(filteredData),
//                     peserta.id_peserta
//                 ]
//             );
//         }

//         return NextResponse.json({
//             message: "Kegiatan berhasil diperbarui"
//         });

//     } catch (error) {

//         console.log(error);

//         return NextResponse.json(
//             { message: "Terjadi kesalahan server" },
//             { status: 500 }
//         );
//     }
// }

// export async function DELETE(req) {
//     try {

//         /* ======================
//            CEK TOKEN LOGIN
//         ====================== */
//         const token = req.cookies.get("token")?.value;

//         if (!token) {
//             return NextResponse.json(
//                 { message: "Unauthorized" },
//                 { status: 401 }
//             );
//         }

//         const decoded = jwt.verify(
//             token,
//             process.env.JWT_SECRET
//         );

//         const id_akun = decoded.id;

//         /* ======================
//            AMBIL USER + HIMA
//         ====================== */
//         const [[user]] = await db.query(
//             "SELECT username FROM akun WHERE id_akun=?",
//             [id_akun]
//         );

//         const [[hima]] = await db.query(
//             "SELECT id_hima FROM hima WHERE id_akun=?",
//             [id_akun]
//         );

//         if (!hima) {
//             return NextResponse.json(
//                 { message: "Hima tidak ditemukan" },
//                 { status: 404 }
//             );
//         }

//         /* ======================
//            AMBIL ID DARI QUERY
//         ====================== */
//         const { searchParams } = new URL(req.url);
//         const id = searchParams.get("id");

//         if (!id) {
//             return NextResponse.json(
//                 { message: "data tidak ditemukan" },
//                 { status: 400 }
//             );
//         }

//         /* ======================
//            CEK DATA KEGIATAN
//         ====================== */
//         const [[kegiatan]] = await db.query(
//             "SELECT flayer,slug  FROM kegiatan WHERE id_kegiatan=? AND id_hima=?",
//             [id, hima.id_hima]
//         );

//         if (!kegiatan) {
//             return NextResponse.json(
//                 { message: "Kegiatan tidak ditemukan" },
//                 { status: 404 }
//             );
//         }

//         /* ======================
//            HAPUS FILE FLAYER
//         ====================== */
//         if (kegiatan.flayer) {

//             const filePath = path.join(
//                 process.cwd(),
//                 "public/uploads/event",
//                 user.username,
//                 kegiatan.flayer
//             );

//             if (fs.existsSync(filePath)) {
//                 fs.unlinkSync(filePath);
//             }
//         }
//         /* ======================
//             HAPUS FOLDER PESERTA
//         ====================== */
//         if (kegiatan.slug) {

//             const pesertaDir = path.join(
//                 process.cwd(),
//                 "public/uploads/peserta_event",
//                 kegiatan.slug
//             );

//             if (fs.existsSync(pesertaDir)) {
//                 fs.rmSync(pesertaDir, {
//                     recursive: true,
//                     force: true
//                 });
//             }
//         }

//         /* ======================
//            HAPUS DATABASE
//         ====================== */
//         await db.query(
//             "DELETE FROM kegiatan WHERE id_kegiatan=? AND id_hima=?",
//             [id, hima.id_hima]
//         );

//         return NextResponse.json({
//             message: "Kegiatan berhasil dihapus"
//         });

//     } catch (error) {

//         console.log(error);

//         return NextResponse.json(
//             { message: "Terjadi kesalahan server" },
//             { status: 500 }
//         );
//     }
// }
