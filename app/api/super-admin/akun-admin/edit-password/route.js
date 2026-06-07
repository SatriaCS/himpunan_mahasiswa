import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifySuperAdmin } from "@/lib/auth";

export async function PUT(req) {
    const auth = verifySuperAdmin(req);

    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();

    try {

        const { id_akun, password } = await req.json(); // id hima
        if (!password) {
            return NextResponse.json(
                { message: "password wajib diisi" },
                { status: 400 }
            );
        }
        if (!id_akun) {
            return NextResponse.json(
                { message: "gagal mengupdate password" },
                { status: 400 }
            );
        }
        const hashPassword = await bcrypt.hash(password, 10);
        await conn.beginTransaction();

        /* ======================
           EDIT PASSWORD
        ====================== */
        const [result] = await conn.query(
            "UPDATE akun SET password = ? WHERE id_akun = ?",
            [hashPassword, id_akun]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }

        await conn.commit();

        return NextResponse.json({
            message: "Password Berhasil di ubah"
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