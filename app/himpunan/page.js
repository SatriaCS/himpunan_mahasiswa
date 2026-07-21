"use client"
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import Pagination from "../components/Pagination";

export default function ProfileListPage() {
    const [himpunanLists, setHimpunanLists] = useState([]);
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 6;
    // loading 
    const [loading, setLoading] = useState(true);

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

    const fetchHima = async (currentPage = 1) => {
        try {
            setLoading(true);

            const res = await fetch(`/api/user/hima?page=${currentPage}&limit=${limit}`,
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

            setHimpunanLists(result.data || []);
            setTotalPages(result.totalPages || 1);
            // AUTO FIX PAGE
            if (currentPage > result.totalPages && result.totalPages > 0) {
                setCurrentPage(result.totalPages);
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        fetchHima(currentPage)
    }, [currentPage]);
    const limitWords = (text, maxWords) => {
        if (!text) return "";

        const words = text.split(" ");
        return words.length > maxWords
            ? words.slice(0, maxWords).join(" ") + "..."
            : text;
    };
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Hero Header */}
            <div className="bg-white pb-12 pt-16 sm:pt-24 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                            Himpunan Mahasiswa
                        </h1>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            Temukan komunitasmu, Jelajahi berbagai himpunan mahasiswa yang sesuai dengan minat dan jurusanmu.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {loading
                        ?
                        Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} />
                        ))
                        :
                        himpunanLists.map((hima) => (
                            <Link
                                href={`/himpunan/${hima.slug}`}
                                key={hima.slug}
                                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 hover:-translate-y-1"
                            >
                                {/* Card Header with Color Accent */}
                                <div className={`h-2 w-full `}></div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        {hima.logo ?
                                            (<div className="relative h-14 w-14 rounded-2xl overflow-hidden shadow-inner">
                                                <Image
                                                    src={hima.logo}
                                                    alt={hima.nama}
                                                    fill
                                                    sizes="56px"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>) :
                                            (
                                                <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl shadow-inner">
                                                    🎓
                                                </div>
                                            )
                                        }

                                        {hima.singkatan &&
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 uppercase tracking-wider`}>
                                                {hima.singkatan}
                                            </span>
                                        }

                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                        {hima.nama}
                                    </h3>

                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1 whitespace-pre-line">

                                        {
                                            hima.visi || hima.misi ? limitWords(
                                                `Visi: ${hima.visi}\nMisi: ${hima.misi}`,
                                                35 // jumlah kata
                                            ) : "-"
                                        }
                                    </p>

                                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:underline">
                                        Lihat Profil Lengkap
                                        <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                </div>
                {himpunanLists.length !== 0 &&
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                }
            </div>

            <div className="mt-3 mb-3 max-w-3xl mx-auto rounded-2xl border border-blue-100 bg-blue-50 px-6 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                <div className="text-left">
                    <p className="text-lg font-bold text-gray-900">
                        Ingin himpunan Anda tampil pada web?
                    </p>
                    <p className="mt-1 text-base text-gray-600">
                        Ayo bergabung ikut menyebarkan informasi profil, kegiatan dan berita seputar himpunan mahasiswa Anda.
                    </p>
                </div>
                <a
                    href="https://wa.me/6283119968079?text=Halo%2C%20saya%20tertarik%20untuk%20bergabung%20menjadi%20admin%20untuk%20membagikan%20informasi%20himpunan%20mahasiswa%20saya."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:mt-0 sm:shrink-0"
                >
                    Hubungi Kami
                </a>
            </div>
        </div>
    );
}
