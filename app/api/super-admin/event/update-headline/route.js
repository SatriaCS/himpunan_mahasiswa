import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifySuperAdmin } from "@/lib/auth";

export async function PUT(req) {
    const auth = verifySuperAdmin(req);
        
    // jika auth adalah response → langsung return
    if (auth instanceof Response) {
        return auth;
    }
    const conn = await db.getConnection();

    try {

        await conn.beginTransaction();

        /* ======================
           AMBIL DATA REQUEST
        ====================== */
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { message: "data tidak ditemukan" },
                { status: 400 }
            );
        }

        /* ======================
           UPDATE DATABASE
        ====================== */
        const [result] = await conn.query(
            `UPDATE kegiatan SET
                headline = NOT headline
            WHERE id_kegiatan=?`,
            [
                id
            ]
        );
        if (result.affectedRows === 0 ) {
                throw new Error();
        }
        await conn.commit();
        return NextResponse.json({
            message: "healine berhasil diperbarui"
        });

    } catch (error) {
        await conn.rollback();
        console.log(error.message);
        
        return NextResponse.json(
            { message: "Terjadi kesalahan server" },
            { status: 500 }
        );
    } finally {
        conn.release();
    }
}