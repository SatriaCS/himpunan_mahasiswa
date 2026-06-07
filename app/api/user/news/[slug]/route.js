import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req, { params }) {
    const conn = await db.getConnection();
    try {

        const { slug } = params;

        if (!slug) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(req.url);
        const countView = searchParams.get("view") === "true";

        await conn.beginTransaction();
        const [[user]] = await conn.query(
            "SELECT username FROM super_admin WHERE id_akun=1"
        );

        /* ======================
           AMBIL DETAIL BERITA
        ====================== */
        const [[news]] = await conn.query(`
            SELECT
                b.slug,
                b.judul,
                b.thumbnail,
                b.deskripsi,
                b.created_at,
                b.updated_at,
                h.nama AS nama_hima,
                a.username
            FROM berita b
            LEFT JOIN hima h ON b.id_hima = h.id_hima
            LEFT JOIN akun a On h.id_akun = a.id_akun
            WHERE b.slug = ?
            LIMIT 1
        `, [slug]);
        
        if (countView) {
            const [result] = await conn.query(`
                UPDATE berita
                SET views = views + 1
                WHERE slug = ?
            `, [slug]);

            if (result.affectedRows === 0) {
                throw new Error("Update view gagal");
            }
        }

        if (!news) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }
        await conn.commit();
        return NextResponse.json({
            data: news,
            username: user.username    
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