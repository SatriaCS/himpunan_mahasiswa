"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const newsData = [
    {
        id: 1,
        title: "Mahasiswa Berprestasi Tingkat Nasional Tahun 2024",
        date: "10 okt 2026",
        excerpt: "Mahasiswa Informatika kembali menorehkan prestasi membanggakan di kancah nasional.",
        author: "Admin"
    },
    {
        id: 2,
        title: "Workshop UI/UX Design bersama Expert dari Gojek",
        date: "10 okt 2026",
        excerpt: "Himpunan Mahasiswa akan mengadakan workshop UI/UX Design yang menghadirkan praktisi langsung dari industri."
    },
    {
        id: 3,
        title: "Open Recruitment Pengurus Himpunan Periode 2025/2026",
        date: "10 okt 2026",
        excerpt: "Panggilan untuk seluruh mahasiswa aktif angkatan 2023 dan 2024! Himpunan Mahasiswa membuka kesempatan bagi kalian yang ingin belajar berorganisasi dan berkontribusi nyata bagi jurusan.",
        author: "Admin"
    },
    {
        id: 4,
        title: "Kunjungan Industri ke Kantor Google Indonesia",
        date: "10 okt 2026",
        excerpt: "Himpunan Mahasiswa bekerjasama dengan Program Studi akan mengadakan Kunjungan Industri ke kantor Google Indonesia di Jakarta.",
        author: "Admin"
    }
];

export default function BeritaPage() {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter Logic
    const filteredNews = newsData.filter((news) =>
        news.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-gray-900">Berita & Artikel</h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Informasi terbaru seputar kegiatan akademik dan non-akademik.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-12">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-shadow shadow-sm hover:shadow-md"
                            placeholder="Cari berita..."
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* News Grid */}
                {filteredNews.length > 0 ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {filteredNews.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
                                <div className="relative h-48 bg-gray-200 overflow-hidden shrink-0">
                                    <Image
                                        src="/default-news.png"
                                        alt={item.title}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                        <Link href={`/berita/${item.id}`} className="hover:text-blue-600 transition-colors">
                                            {item.title}
                                        </Link>
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                                        {item.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                                        <span className="flex items-center gap-1">
                                            👤 {item.author}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            📅 {item.date}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Tidak ada berita ditemukan</h3>
                        <p className="mt-1 text-gray-500">Coba kata kunci lain atau periksa ejaan Anda.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
