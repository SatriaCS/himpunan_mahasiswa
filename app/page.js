"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
const newsData = [
  {
    id: 1,
    title: "Mahasiswa Berprestasi Tingkat Nasional Tahun 2024",
    date: "12 Des 2024",
    excerpt: "Mahasiswa Informatika berhasil meraih medali emas dalam kompetisi Gemastik 2024 bidang pemrograman.",
    author: "Admin"
  },
  {
    id: 2,
    title: "Workshop UI/UX Design bersama Expert dari Gojek",
    date: "10 Jan 2025",
    excerpt: "Himpunan mengadakan workshop intensif selama 3 hari membahas fundamental desain antarmuka aplikasi.",
    author: "Admin"
  },
  {
    id: 3,
    title: "Open Recruitment Pengurus Himpunan Periode 2025/2026",
    date: "15 Jan 2025",
    excerpt: "Mari berkontribusi membangun himpunan yang lebih baik. Pendaftaran dibuka mulai hari ini.",
    author: "Admin"
  },
  {
    id: 4,
    title: "Kunjungan Industri ke Kantor Google Indonesia",
    date: "20 Feb 2025",
    excerpt: "Kesempatan emas bagi mahasiswa untuk melihat langsung budaya kerja di perusahaan teknologi raksasa.",
    author: "Admin"
  }
];

export default function Home() {
  const upcomingEvents = [
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
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Improved Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 text-white overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl mix-blend-multiply filter animate-blob"></div>
          <div className="absolute top-0 -right-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl mix-blend-multiply filter animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-500 rounded-full blur-3xl mix-blend-multiply filter animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col md:flex-row items-center z-10">
          <div className="md:w-1/2 text-center md:text-left">
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-800/50 border border-blue-500/30 text-blue-200 text-sm font-semibold tracking-wide backdrop-blur-sm">
              ✨ Portal Himpunan Mahasiswa
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Wadah Informasi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-300">
                Himpunan Mahasiswa
              </span>
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Temukan informasi terbaru, kegiatan, dan berita himpunan mahasiswa di sini.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/kegiatan"
                className="px-8 py-4 rounded-xl text-blue-900 bg-white hover:bg-gray-100 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                Jelajahi Kegiatan
              </Link>
              <Link
                href="/berita"
                className="px-8 py-4 rounded-xl text-white bg-white/10 border border-white/20 hover:bg-white/20 font-bold text-lg backdrop-blur-md transition-all"
              >
                Baca Berita
              </Link>
            </div>
          </div>

          <div className="md:w-1/2 mt-12 md:mt-0 relative flex justify-center">
            {/* Feature Image */}
            <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 backdrop-blur-sm transform hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src="/hero-image.png"
                  alt="Kolaborasi Mahasiswa"
                  width={600}
                  height={600}
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured News Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Berita Terkini
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Update terbaru dari kampus dan himpunan.
            </p>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {newsData.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="group flex flex-col rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="relative h-56 w-full flex-shrink-0 bg-gray-200 overflow-hidden">
                  <Image
                    src="/default-news.png"
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 bg-white p-8 flex flex-col justify-between">
                  <div className="flex-1">
                    <Link href={`/berita/${item.id}`} className="block mt-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="mt-4 text-base text-gray-500 leading-relaxed line-clamp-3">
                        {item.excerpt}
                      </p>
                    </Link>
                  </div>
                  <div className="mt-8 flex items-center border-t border-gray-100 pt-6">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        oleh {item.author}
                      </p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <time dateTime={item.date}>{item.date}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href={`/berita`} className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-700 hover:bg-blue-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Selengkapnya
            </Link>
          </div>

        </div>
      </section>

      {/* Upcoming Activities Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Kegiatan Mendatang
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Jangan lewatkan event-event seru yang akan datang.
            </p>
          </div>
          <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row items-stretch border border-gray-100 group">
                <div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden">
                  <Image
                    src={event.image || "/default-activity.png"}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "/default-activity.png";
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-blue-600 px-3 py-1.5 rounded-xl text-center shadow-sm min-w-[60px] border border-blue-100/50">
                    <span className="block text-xl font-bold leading-none">{event.date}</span>
                    <span className="block text-[10px] font-bold uppercase tracking-wide mt-1">{event.month}</span>
                  </div>
                </div>
                <div className="flex-grow p-8">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                    <span className="flex items-center gap-1">
                      📍 {event.location}
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span className="flex items-center gap-1">
                      ⏰ {event.time}
                    </span>
                    <span className="text-lg">👥</span>
                    <span className={event.registered >= event.quota ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
                      {event.registered}/{event.quota}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-4 leading-relaxed">
                    {event.description}
                  </p>
                </div>
                <div className="p-8 flex items-center bg-gray-50/50 border-l border-gray-100 shrink-0">
                  <Link
                    href={`/kegiatan/daftar/${event.id}`}
                    className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                  >
                    Daftar
                  </Link>
                </div>
              </div>

            ))}
            <Link href={`/kegiatan`} className="w-50 md:w-50 mx-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-700 hover:bg-blue-800 transition-colors">
              Selengkapnya</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
