"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Data kegiatan (idealnya dari database/API)
const activities = {
    1: {
        title: "Seminar Nasional Teknologi AI",
        date: "24 Januari 2025",
        description_form: "isi dengan data diri yang valid",
        time: "09:00 - 15:00 WIB",
        location: "Auditorium Utama",
    },
    2: {
        title: "Workshop UI/UX Design Fundamental",
        date: "10 Februari 2025",
        description_form: "isi dengan data diri yang valid",
        time: "10:00 - 16:00 WIB",
        location: "Lab Komputer 3",
    },
    3: {
        title: "Hackathon Mahasiswa 2025",
        date: "15 Maret 2025",
        description_form: "isi dengan data diri yang valid",
        time: "24 Jam Non-stop",
        location: "Co-working Space Kampus",
    },
};

export default function DaftarKegiatanPage() {
    const params = useParams();
    const activity = activities[params.id];

    const [formData, setFormData] = useState({
        namaLengkap: "",
        nim: "",
        email: "",
        noTelepon: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulasi submit
        console.log("Form submitted:", formData);
        setIsSubmitted(true);
    };

    if (!activity) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Kegiatan tidak ditemukan</h1>
                    <Link href="/kegiatan" className="text-blue-600 hover:underline">
                        Kembali ke daftar kegiatan
                    </Link>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">✓</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h1>
                    <p className="text-gray-600 mb-6">
                        Terima kasih telah mendaftar untuk <strong>{activity.title}</strong>.
                        Kami akan mengirimkan informasi lebih lanjut ke email Anda.
                    </p>
                    <Link
                        href="/kegiatan"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        Kembali ke Kegiatan
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/kegiatan" className="text-blue-600 hover:underline flex items-center gap-2 mb-4">
                        ← Kembali ke Kegiatan
                    </Link>
                </div>

                {/* Activity Info Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="relative h-72 w-full bg-gray-100">
                        <Image
                            src="/default-activity.png"
                            alt={activity.title}
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="p-6 border-l-4 border-blue-600">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{activity.title}</h2>
                        <h2 className="text-md text-gray-900 mb-4">{activity.description_form}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <span>📅</span>
                                <span>{activity.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>⏰</span>
                                <span>{activity.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>📍</span>
                                <span>{activity.location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Data Pendaftaran</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                name="namaLengkap"
                                value={formData.namaLengkap}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                                placeholder="Masukkan nama lengkap"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                                placeholder="Masukkan email aktif"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                No. Telepon / WhatsApp
                            </label>
                            <input
                                type="tel"
                                name="noTelepon"
                                value={formData.noTelepon}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                                placeholder="Masukkan nomor telepon"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Daftar Sekarang
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
