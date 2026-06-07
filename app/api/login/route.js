import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// export async function GET(){
// bcrypt.hash("Hima24#",10).then(console.log);
// }

export async function POST(req) {
    try {
        const { username, password } = await req.json();

        const [admin] = await db.query(
            "SELECT * FROM super_admin WHERE username = ?",
            [username]
        );

        if (admin.length > 0) {

            const valid = await bcrypt.compare(
                password,
                admin[0].password
            );

            if (!valid)
                return NextResponse.json({message:"username atau password salah"}, {status:401});

            const token = jwt.sign({
                id: admin[0].id_akun,
                role: "super_admin"
            }, process.env.JWT_SECRET);

            const res = NextResponse.json({message:"Login berhasil", role: "super_admin"});
            res.cookies.set("token", token);

            return res;
        }

        /* ======================
        CEK USER BIASA
        ====================== */
        const [user] = await db.query(
            "SELECT * FROM akun WHERE username = ?",
            [username]
        );

        if (user.length === 0)
            return NextResponse.json({message:"username atau password salah"}, {status:404});

        const valid = await bcrypt.compare(
            password,
            user[0].password
        );

        if (!valid)
            return NextResponse.json({message:"username atau password salah"}, {status:401});

        const token = jwt.sign({
            id: user[0].id_akun,
            role: "admin"
        }, process.env.JWT_SECRET);

        const res = NextResponse.json({message:"Login berhasil", role: "admin"});
        res.cookies.set("token", token);

        return res;
    } catch (error) {
        return Response.json({message: "internal server error"},{status: 500})
    }
    
}