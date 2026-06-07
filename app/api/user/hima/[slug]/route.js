import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req, { params }) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 400 }
            );
        }

        const [rows] = await db.query(`
            SELECT 
                h.id_hima,
                h.slug,
                h.nama,
                h.singkatan,
                h.visi,
                h.misi,
                h.logo,
                h.thumbnail,
                h.no_kontak,
                h.email,
                a.username
            FROM hima h
            JOIN akun a ON h.id_akun = a.id_akun
            WHERE h.slug = ?
        `, [slug]);

        const hima = rows[0];

        if (!hima) {
            return NextResponse.json(
                { message: "Data tidak ditemukan" },
                { status: 404 }
            );
        }

        const [dokumentasi] = await db.query(`
            SELECT foto, judul
            FROM dokumentasi
            WHERE id_hima = ?
        `, [hima.id_hima]);
        
        const [anggota] = await db.query(`
            SELECT nama, jabatan, foto
            FROM anggota
            WHERE id_hima = ?
        `, [hima.id_hima]);

        hima.dokumentasi = dokumentasi;
        hima.anggota = anggota;

        return NextResponse.json(hima);

    } catch (error) {

        return NextResponse.json(
            { message: "Internal server  error" },
            { status: 500 }
        );
    }
}