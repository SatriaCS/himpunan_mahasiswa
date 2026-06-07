import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import fs from "fs";
import path from "path";
import { verifyAdmin } from "@/lib/auth";

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
    let filePath = null;
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
           AMBIL USER + HIMA
        ====================== */
        const [[user]] = await conn.query(
            "SELECT username FROM akun WHERE id_akun=?",
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
           BUAT FOLDER
        ====================== */
        const uploadDir = path.join(
            process.cwd(),
            "public/uploads/dokumentasi",
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
        await conn.rollback();
        // 🔥 HAPUS FILE JIKA SUDAH TERSIMPAN
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
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
            "SELECT username FROM akun WHERE id_akun=?",
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
           HAPUS FILE FISIK
        ====================== */
        const filePath = path.join(
            process.cwd(),
            "public/uploads/dokumentasi",
            user.username,
            doc.foto
        );

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return NextResponse.json({
            message: "Dokumentasi berhasil dihapus"
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