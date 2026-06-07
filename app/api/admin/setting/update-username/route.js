import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import fs from "fs";
import path from "path";
import { verifyAdmin } from "@/lib/auth";

export async function PUT(req) {
    const auth = verifyAdmin(req);
            
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();
    try {
        
        const body = await req.json();
        const { username } = body;
        if (!username) {
            return NextResponse.json(
                { message: "Username Harus Diisi" },
                { status: 400 }
            );
        }

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
           CEK DUPLIKAT USERNAME
        ====================== */
        const [cek] = await conn.query(
            "SELECT id_akun FROM akun WHERE username=? AND id_akun!=?",
            [username, id_akun]
        );

        if (cek.length > 0) {
            return NextResponse.json(
                { message: "Username sudah digunakan, gunakan username lain" },
                { status: 400 }
            );
        }

        /* ======================
           AMBIL USER LAMA
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

        const oldUsername = user.username;

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

        await conn.beginTransaction();
        
        /* ======================
           UPDATE DATABASE
        ====================== */
        const [result] = await conn.query(
            "UPDATE akun SET username=? WHERE id_akun=?",
            [username, id_akun]
        );
        if (result.affectedRows === 0) {
                throw new Error();
        }
        
        await conn.commit();
        return NextResponse.json({
            message: "Username berhasil diperbarui"
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