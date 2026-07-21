"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Pagination from "../components/Pagination";



export default function BeritaPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [newsData, setNewsData] = useState([]);

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 6;
    // loading 
    const [loading, setLoading] = useState(true);

    const [username, setUsername] = useState("");

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

    const fetchNews = async (currentPage = 1) => {
        try {
            setLoading(true);

            const res = await fetch(`/api/user/news?page=${currentPage}&limit=${limit}&search=${searchQuery}`,
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

            setNewsData(result.data || []);
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
        fetchNews(currentPage)
        sessionStorage.removeItem("view-berita");
    }, [currentPage]);

    useEffect(() => {
        setCurrentPage(1); // reset ke halaman 1 saat search
        fetchNews(1);
    }, [searchQuery]);


    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-gray-900">Berita</h1>
                    <p className="mt-4 text-xl text-gray-500">
                        berita terbaru dari himpunan.
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
                {loading
                    ?
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} />
                        ))}
                    </div>
                    :
                    newsData.length > 0 ? (
                        <div>
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {newsData.map((item) => (
                                    <div
                                        key={item.slug}
                                        className="group flex flex-col rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                                    >
                                        <div className="aspect-[16/9] w-full overflow-hidden relative bg-gray-100 flex items-center justify-center">
                                            <img
                                                src={item.thumbnail}
                                                alt={item.judul}
                                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 bg-white p-8 flex flex-col justify-between">
                                            <div className="flex-1">
                                                <Link href={`/berita/${item.slug}`} className="block mt-3">
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                        {item.judul}
                                                    </h3>
                                                    <p className="mt-4 text-base text-gray-500 leading-relaxed line-clamp-3">
                                                        {item.deskripsi}
                                                    </p>
                                                </Link>
                                            </div>
                                            <div className="mt-8 flex items-center border-t border-gray-100 pt-6">
                                                <div className="ml-3">
                                                    {item.nama &&
                                                        <p className="text-sm font-medium text-gray-900">
                                                            oleh {item.nama}
                                                        </p>
                                                    }
                                                    <div className="flex space-x-1 text-sm text-gray-500">
                                                        {
                                                            item.updated_at
                                                                ? `Updated : ${new Date(item.updated_at).toLocaleDateString("id-ID", {
                                                                    day: "numeric",
                                                                    month: "long",
                                                                    year: "numeric"
                                                                })}`
                                                                : new Date(item.created_at).toLocaleDateString("id-ID", {
                                                                    day: "numeric",
                                                                    month: "long",
                                                                    year: "numeric"
                                                                })
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {newsData.length !== 0 &&
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            }
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
