"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function KegiatanPage() {
    const activities = [
        {
            id: 1,
            title: "Seminar Nasional Teknologi AI",
            date: "24",
            month: "Januari 2025",
            category: "Seminar",
            time: "09:00 - 15:00 WIB",
            location: "Auditorium Utama",
            description: "Pelajari perkembangan terbaru Artificial Intelligence dan dampaknya di dunia industri masa depan. Menghadirkan pembicara dari Google dan Gojek.",
            registered: 45,
            quota: 100
        },
        {
            id: 2,
            title: "Workshop UI/UX Design Fundamental",
            date: "10",
            month: "Februari 2025",
            category: "Workshop",
            time: "10:00 - 16:00 WIB",
            location: "Lab Komputer 3",
            description: "Workshop intensif membuat desain antarmuka aplikasi yang user-friendly dan estetis. Cocok untuk pemula yang ingin terjun ke dunia desain produk.",
            registered: 28,
            quota: 30
        },
        {
            id: 3,
            title: "Hackathon Mahasiswa 2025",
            date: "15",
            month: "Maret 2025",
            category: "Lomba",
            time: "24 Jam Non-stop",
            location: "Co-working Space Kampus",
            description: "Kompetisi coding 24 jam untuk memecahkan masalah nyata dengan solusi digital inovatif. Total hadiah puluhan juta rupiah.",
            registered: 15,
            quota: 50
        }
    ];

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-gray-900">Agenda Kegiatan</h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Jadwal kegiatan himpunan mahasiswa yang akan datang.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Event List */}
                    {activities.map((item) => (
                        <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col md:flex-row gap-0 hover:shadow-xl transition-all duration-300 group">
                            <div className="w-full md:w-72 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
                                <Image
                                    src={item.image || "/default-activity.png"}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.src = "/default-activity.png";
                                    }}
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-blue-600 px-3 py-1.5 rounded-xl text-center shadow-sm border border-blue-100/50">
                                    <span className="block text-xl font-bold leading-none">{item.date}</span>
                                    <span className="block text-[10px] font-bold uppercase tracking-wide mt-1">{item.month.split(' ')[0]}</span>
                                </div>
                            </div>
                            <div className="flex-1 p-8 flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">{item.category}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                                    {item.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mt-auto pt-6 border-t border-gray-50">
                                    <span className="flex items-center gap-2">
                                        <span className="text-lg">⏰</span>
                                        {item.time}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="text-lg">📍</span>
                                        {item.location}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="text-lg">👥</span>
                                        <span className={item.registered >= item.quota ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
                                            {item.registered}/{item.quota}
                                        </span>
                                        <span className="text-gray-400">Peserta</span>
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 flex items-center bg-gray-50/50 border-l border-gray-50">
                                <Link
                                    href={`/kegiatan/daftar/${item.id}`}
                                    className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                                >
                                    Daftar
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
