import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { verifySuperAdmin } from "@/lib/auth";

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
            `INSERT INTO hima (nama,slug,id_akun)
             VALUES (?,?,?)`,
            [nama, slug, idAkun]
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
        return NextResponse.json({
            message: "Internal Server Error"
        }, { status: 500 });
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
            "SELECT username FROM akun WHERE id_akun=?",
            [id_akun]
        );

        if (!user) {
            return NextResponse.json({
                message: "data tidak ditemukan"
            }, { status: 404 });
        }

        const username = user.username;

        await conn.beginTransaction();

        /* ======================
           DELETE AKUN
        ====================== */
        const [result] = await conn.query(
            "DELETE FROM akun WHERE id_akun = ?",
            [id_akun]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }

        await conn.commit();
        /* ======================
        FUNCTION DELETE FOLDER
        ====================== */
        const deleteFolder = (baseFolder) => {

            const folderPath = path.join(
                process.cwd(),
                baseFolder,
                username
            );

            if (fs.existsSync(folderPath)) {
                fs.rmSync(folderPath, {
                    recursive: true, // hapus isi folder
                    force: true      // tidak error jika file terkunci
                });
            }
        };

        /* ======================
        DELETE SEMUA FOLDER
        ====================== */
        deleteFolder("public/uploads/hima");
        deleteFolder("public/uploads/dokumentasi");
        deleteFolder("public/uploads/member");
        deleteFolder("public/uploads/news");
        deleteFolder("public/uploads/event");

        return NextResponse.json({
            message: "Akun HIMA berhasil dihapus"
        });

    } catch (error) {

        await conn.rollback();

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
        
        const oldUsername = user.username;

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

        /* ======================
           FUNCTION RENAME FOLDER
        ====================== */
        const renameFolder = (baseFolder) => {

            const oldPath = path.join(
                process.cwd(),
                baseFolder,
                oldUsername
            );

            const newPath = path.join(
                process.cwd(),
                baseFolder,
                username
            );

            if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath);
            }
        };

        /* ======================
           RENAME SEMUA FOLDER
        ====================== */
        renameFolder("public/uploads/hima");
        renameFolder("public/uploads/dokumentasi");
        renameFolder("public/uploads/member");
        renameFolder("public/uploads/news");
        renameFolder("public/uploads/event");

        return NextResponse.json({
            message:"Data berhasil diperbarui"
        });

    }catch(error){

        await conn.rollback();
        
        return NextResponse.json({
            message:"Internal Server Error"
        },{status:500});

    }finally{
        conn.release();
    }
}