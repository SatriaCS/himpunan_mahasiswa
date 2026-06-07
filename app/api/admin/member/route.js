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
    let filePath = null;
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
           AMBIL USER + HIMA
        ====================== */
        const [[user]] = await conn.query(
            "SELECT username FROM akun WHERE id_akun=?",
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
            BUAT FOLDER UPLOAD
            ====================== */
            const uploadDir = path.join(
                process.cwd(),
                "public/uploads/member",
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

            fileName = `${Date.now()}-${file.name}`;
            filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);
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
            HAPUS FILE FOTO
            ====================== */
            const filePath = path.join(
                process.cwd(),
                "public/uploads/member",
                member.username,
                member.foto
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        return NextResponse.json({
            message: "Anggota berhasil dihapus"
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
            "SELECT username FROM akun WHERE id_akun=?",
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
        /* folder upload */
        const uploadDir = path.join(
            process.cwd(),
            "public/uploads/member",
            user.username
        );
        if (file && file.size > 0) {            
            
            /* ======================
            JIKA FOTO DIUPDATE
            ====================== */
            if (file && file.size > 0) {

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
                

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }            

                /* simpan foto baru */
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                fileName = `${Date.now()}-${file.name}`;
                filePath = path.join(uploadDir, fileName);
                fs.writeFileSync(filePath, buffer);
            }
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
            const oldPath = path.join(uploadDir, oldFoto);
        
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        return NextResponse.json({
            message: "Data Anggota berhasil diupdate"
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