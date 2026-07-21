import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { verifySuperAdmin } from "@/lib/auth";
import { put, del } from "@vercel/blob";

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

        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 5;
        const sort = searchParams.get("sort") || "latest";        

        const offset = (page - 1) * limit;

        /* ======================
           AMBIL DATA KEGIATAN
        ====================== */
        let orderBy = "id_kegiatan DESC";

        if (sort === "tanggal") {
           orderBy = `
                CASE 
                    WHEN tanggal >= CURDATE() THEN 0
                    ELSE 1
                END,
                ABS(DATEDIFF(tanggal, CURDATE())) ASC
            `;
        }

        
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
                k.slug,
                headline,
                link_pendaftaran as link,
                a.username
            FROM kegiatan k
            LEFT JOIN hima h ON k.id_hima = h.id_hima
            LEFT JOIN akun a On a.id_akun = h.id_akun
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        /* ======================
            TOTAL DATA
        ====================== */
        const [[total]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM kegiatan
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
        console.error("[ERROR] GET /api/super-admin/event:", error);
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
                    message: "Gangguan koneksi Gagal Memuat data kegiatan. Silakan coba beberapa saat lagi.",
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
           USER
        ====================== */
        const [[user]] = await conn.query(
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
            ( judul, deskripsi, kategori, tanggal,
             waktu, tempat, kouta, flayer, slug,
             link_pendaftaran)
            VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [
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
        console.error("[ERROR] POST /api/super-admin/event:", error);
        // 🔥 HAPUS FILE JIKA SUDAH TERSIMPAN
        if (uploadedBlobUrl) {
            try {
                await del(uploadedBlobUrl);
            } catch (deleteError) {
                console.error("Gagal menghapus flayer baru:", deleteError);
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
                    message: "Gangguan koneksi Gagal Menambah data kegiatan. Silakan coba beberapa saat lagi.",
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
           USER
        ====================== */
        const [[user]] = await conn.query(
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
            "SELECT flayer, id_hima FROM kegiatan WHERE id_kegiatan=?",
            [id]
        );

        if (!kegiatan) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        let akun = null;
        
        if (kegiatan.id_hima) {
            const [[hima]] = await conn.query(
                "SELECT id_hima, id_akun FROM hima WHERE id_hima=?",
                [kegiatan.id_hima]
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

            const uploadUsername = kegiatan.id_hima ? akun.folder_name : user.username;

            const blob = await put(
                `event/${uploadUsername}/${Date.now()}-${fileFlayer.name}`,
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
            WHERE id_kegiatan=?`,
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

        console.error("[ERROR] PUT /api/super-admin/event:", error);

        if (uploadedBlobUrl) {
            try {
                await del(uploadedBlobUrl);
            } catch (deleteError) {
                console.error("Gagal menghapus flayer baru:", deleteError);
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
                    message: "Gangguan koneksi Gagal Mengubah data kegiatan. Silakan coba beberapa saat lagi.",
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
           USER
        ====================== */
        const [[user]] = await conn.query(
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
            "SELECT flayer, slug, id_hima  FROM kegiatan WHERE id_kegiatan=?",
            [id]
        );

        if (!kegiatan) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        let akun = null;
        
        if (kegiatan.id_hima) {
            const [[hima]] = await conn.query(
                "SELECT id_hima, id_akun FROM hima WHERE id_hima=?",
                [kegiatan.id_hima]
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
           HAPUS DATABASE
        ====================== */
        const [result] = await conn.query(
            "DELETE FROM kegiatan WHERE id_kegiatan=?",
            [id]
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
        console.error("[ERROR] DELETE /api/super-admin/event:", error);
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
                    message: "Gangguan koneksi Gagal Mengubah data kegiatan. Silakan coba beberapa saat lagi.",
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
