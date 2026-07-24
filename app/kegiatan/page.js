"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Pagination from "../components/Pagination";

export default function KegiatanPage() {
    const [activities, setActivities] = useState([]);
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 6;
    // loading 
    const [loading, setLoading] = useState(true);

    const [username, setUsername] = useState("");

    const [expanded, setExpanded] = useState(null);

    function Skeleton() {
        return (
            <div className="animate-pulse rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-56 bg-gray-200"></div>

                <div className="p-8 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>

                    <div className="pt-6 border-t">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    const fetchEvents = async (currentPage = 1) => {
        try {
            setLoading(true);

            const res = await fetch(`/api/user/event?page=${currentPage}&limit=${limit}`,
                {
                    cache: "no-store"
                }
            );

            if (!res.ok) {
                    // Ambil pesan error dari backend
                    const errorData = await res.json(); 
                    // Lempar error agar masuk ke blok catch
                    throw new Error(errorData.message || `Gangguan. Silakan coba beberapa saat lagi.`);
            }

            const result = await res.json();

            setActivities(result.data || []);
            setTotalPages(result.totalPages || 1);
            // AUTO FIX PAGE
            if (currentPage > result.totalPages && result.totalPages > 0) {
                setCurrentPage(result.totalPages);
            }
            setUsername(result.username)
        } catch (err) {
           alert(err.message);
        } finally {
            setLoading(false);
        }

    };
    useEffect(() => {
        fetchEvents(currentPage)
    }, [currentPage]);
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
                    {loading
                        ?
                        Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} />
                        ))
                        :
                        activities.map((item) => {
                            const isLongDescription = (item.deskripsi || "").length > 180;
                            return (
                                <div key={item.slug} className="bg-white border border-gray-100  rounded-2xl border-gray-300 overflow-hidden flex flex-col lg:flex-row gap-0 hover:shadow-xl transition-all duration-300 group">
                                    <div className="w-full lg:w-72 h-60 md:h-72 lg:h-auto relative overflow-hidden flex-shrink-0">
                                        {item.flayer ?
                                            item.username ?
                                                <Image
                                                    src={item.flayer}
                                                    alt={item.judul}
                                                    fill
                                                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                                                />
                                                : <Image
                                                    src={item.flayer}
                                                    alt={item.judul}
                                                    fill
                                                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                                                />
                                            :
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                <span className="text-gray-400 text-9xl">🖼️</span>
                                            </div>
                                        }

                                        {/* <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-blue-600 px-3 py-1.5 rounded-xl text-center shadow-sm border border-blue-100/50">
                                            <span className="block text-xl font-bold leading-none">
                                                {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric" })}
                                            </span>

                                            <span className="text-sm capitalize">
                                                {new Date(item.tanggal).toLocaleDateString("id-ID", {
                                                    month: "long",
                                                    year: "numeric"
                                                })}
                                            </span>
                                        </div> */}
                                    </div>
                                    <div className="flex-1 p-8 flex flex-col">
                                        {item.kategori &&
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">{item.kategori}</span>
                                            </div>
                                        }
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{item.judul}</h3>
                                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mt-auto pt-6 border-t border-gray-50">
                                            <span className="text-sm text-gray-400 flex items-center gap-1">
                                                📅 {new Date(item.tanggal).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric"
                                                })}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <span className="text-lg">🕒 </span>
                                                {item.waktu}
                                            </span>
                                            {item.tempat &&
                                                <span className="flex items-center gap-2">
                                                    <span className="text-lg">📍</span>
                                                    {item.tempat}
                                                </span>
                                            }
                                            {item.kouta &&
                                                <span className="flex items-center gap-2">
                                                    <span className="text-lg">👥</span>
                                                    <span className={"text-green-600 font-semibold"}>
                                                        {item.kouta}
                                                    </span>
                                                    <span className="text-gray-400">Kouta Peserta</span>
                                                </span>
                                            }
                                        </div>
                                        <p className={`text-gray-600 mb-6 leading-relaxed flex-grow ${expanded === item.slug ? "" : "line-clamp-4"}`}>
                                            {item.deskripsi}
                                        </p>
                                        {isLongDescription && (
                                            <button
                                                onClick={() => setExpanded(expanded === item.slug ? null : item.slug)}
                                                className="self-start text-xs font-semibold text-blue-600"
                                            >
                                                {expanded === item.slug ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
                                            </button>
                                        )}
                                    </div>
                                    {item.link &&
                                        <div className="p-8 flex items-center bg-gray-50/50 border-l border-gray-100 shrink-0">
                                            <Link
                                                href={`${item.link}`}
                                                className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                                            >
                                                Daftar
                                            </Link>
                                        </div>
                                    }
                                </div>
                            )
                        })}
                    {activities.length !== 0 &&
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    }
                </div>
            </div>
        </div>
    );
}
