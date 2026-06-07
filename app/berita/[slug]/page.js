"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { use } from "react";

export default function DetailBerita({ params }) {
    const { slug } = use(params);
    const [newsItem, setNewsItem] = useState(null)
    // loading
    const [loading, setLoading] = useState(true);
    const [username,setUsername] = useState("");
    

    function DetailSkeleton() {
        return (
            <div className="min-h-screen bg-white pb-20 pt-12 md:pt-20">
                <div className="max-w-5xl mx-auto px-4">

                    {/* Badge */}
                    <div className="h-6 w-32 bg-gray-200 rounded mx-auto mb-6"></div>

                    {/* Title */}
                    <div className="space-y-3 mb-8 text-center">
                        <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>

                    {/* Author + Date */}
                    <div className="flex justify-center gap-6 mb-10">
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        <div className="h-4 w-40 bg-gray-200 rounded"></div>
                    </div>

                    {/* Image */}
                    <div className="w-full h-[400px] bg-gray-200 rounded-3xl mb-12"></div>

                    {/* Content */}
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <div className="h-5 bg-gray-200 rounded"></div>
                        <div className="h-5 bg-gray-200 rounded"></div>
                        <div className="h-5 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-5 bg-gray-200 rounded"></div>
                        <div className="h-5 bg-gray-200 rounded w-4/6"></div>
                        <div className="h-5 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    const fetchNews = async (countView = true) => {
        try {
            setLoading(true);

            const res = await fetch(`/api/user/news/${slug}?view=${countView}`);
            const result = await res.json();

            setNewsItem(result.data);
            setUsername(result.username);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };
    
    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;

        const viewed = sessionStorage.getItem("view-berita");

        if (!viewed) {
            fetchNews(true);   // tambah view
            sessionStorage.setItem("view-berita", "true");
        } else {
            fetchNews(false);  // hanya ambil data
        }

    }, [slug]);

    if (loading) {
        return <DetailSkeleton />;
    }

    if (!newsItem) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Berita Tidak Ditemukan
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20 pt-12 md:pt-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-10">
                    
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                        {newsItem.judul}
                    </h1>
                    <div className="flex items-center justify-center text-gray-500 gap-6 text-sm md:text-base">
                        {/* <span className="flex items-center gap-2">
                            👤 Oleh <span className="font-semibold text-gray-900">{newsItem.nama_hima}</span>
                        </span> */}
                        <span className="flex items-center gap-2">
                            📅 {
                                    newsItem.updated_at
                                        ? `Updated : ${new Date(newsItem.updated_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric"
                                        })}`
                                        : new Date(newsItem.created_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric"
                                        })
                                }
                        </span>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="relative w-md mx-auto mb-12 rounded-3xl overflow-hidden shadow-2xl flex justify-center items-center">
                    {newsItem.username ? 
                        <Image
                            src={`/uploads/news/${newsItem.username}/${newsItem.thumbnail}`}
                            alt={newsItem.judul}
                            width={1200}
                            height={800}
                            className="w-full h-auto object-cover"
                            priority
                        />
                    : 
                        <Image
                            src={`/uploads/news/${username}/${newsItem.thumbnail}`}
                            alt={newsItem.judul}
                            width={1200}
                            height={800}
                            className="w-full h-auto object-cover"
                            priority
                        />
                    }
                    
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto">
                    <div
                        className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: newsItem.deskripsi }}
                    />

                    {/* Back Button */}
                    <div className="mt-16 pt-10 border-t border-gray-100 flex justify-center">
                        <Link
                            href="/berita"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            ← Kembali ke Berita
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
