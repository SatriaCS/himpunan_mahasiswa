"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { use } from "react";
import Modal from "@/app/components/Modal";

export default function ProfileDetailPage({ params }) {
    // Await params to access id
    const { slug } = use(params);
    
    const [data, setData] = useState(null);
    // loading
    const [loading, setLoading] = useState(true);
    // dokumntasi
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleView = (item) => {
        setSelectedPhoto(item);
        setIsModalOpen(true);        
    };
    function Skeleton() {
        return (
            <div className="min-h-screen bg-gray-50">

                {/* HERO */}
                <div className="h-[500px] bg-gray-200"></div>

                <div className="max-w-7xl mx-auto px-4 -mt-16 space-y-10">

                    {/* Visi Misi */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {[1,2].map((i)=>(
                            <div key={i} className="bg-white rounded-2xl p-8 shadow">
                                <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Struktur */}
                    <div className="bg-white rounded-2xl p-10 shadow">
                        <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-10"></div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                            {Array.from({length:4}).map((_,i)=>(
                                <div key={i} className="text-center space-y-4">
                                    <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dokumentasi */}
                    <div>
                        <div className="h-8 w-72 bg-gray-200 rounded mx-auto mb-10"></div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {Array.from({length:3}).map((_,i)=>(
                                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
                            ))}
                        </div>
                    </div>

                    {/* Kontak */}
                    <div className="bg-white rounded-2xl p-8 shadow max-w-2xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="h-20 bg-gray-200 rounded"></div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                    </div>

                </div>
                
                {isModalOpen && selectedPhoto && (
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-3xl w-full p-6 relative">

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-3 right-3 text-gray-500"
                            >
                                ✕
                            </button>

                            <img
                                src={`/uploads/dokumentasi/${selectedPhoto.username}/${selectedPhoto.foto}`}
                                alt={selectedPhoto.judul}
                                className="w-full h-auto object-contain rounded-xl mb-4"
                            />

                            <h4 className="text-xl font-bold text-center">
                                {selectedPhoto.judul}
                            </h4>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    const fetchHima = async () => {
        try {
            setLoading(true);

            const res = await fetch(`/api/user/hima/${slug}`);
            const result = await res.json();

            setData(result);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHima()
    }, [slug]);

    if (loading) {
        return <Skeleton />;
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-white pb-20 pt-12 md:pt-20 flex flex-col items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Tidak Ditemukan</h1>
                    <p className="text-gray-500 mb-8">Maaf, Data yang Anda cari tidak tersedia.</p>
                    <Link
                        href="/himpunan"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                    >
                        ← Kembali ke Halaman Himpunana
                    </Link>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Hero Profile */}
            
            <div className="relative h-[500px] flex items-center justify-center text-white overflow-hidden">

                {/* BLUR BACKGROUND */}
                {data.thumbnail && (
                    <img
                        src={`/uploads/hima/${data.username}/${data.thumbnail}`}
                        className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110"
                        alt=""
                    />
                )}

                {/* DARK OVERLAY */}
                <div className="absolute inset-0 bg-black/60"></div>

                {/* IMAGE ASLI (TIDAK TERPOTONG) */}
                {data.thumbnail && (
                    <img
                        src={`/uploads/hima/${data.username}/${data.thumbnail}`}
                        alt="Profile Hero"
                        className="absolute inset-0 w-full h-full object-contain z-0"
                    />
                )}

                {/* CONTENT */}
                <div className="relative z-10 text-center">
                    <div className={`inline-flex items-center justify-center p-5 bg-white/20 backdrop-blur-md rounded-3xl mb-8 shadow-2xl border border-white/20`}>
                        {data.logo ? 
                            (<div className="relative h-14 w-14 rounded-2xl overflow-hidden shadow-inner">
                                    <Image
                                    src={`/uploads/hima/${data.username}/${data.logo}`}
                                    alt={data.nama}
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
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-lg text-white">
                        {data.nama}
                    </h1>
                    {data.singkatan && 
                        <div className="flex justify-center mb-8">
                            <span className="px-6 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-base font-bold tracking-widest uppercase shadow-lg">
                                {data.singkatan}
                            </span>
                        </div>
                    }
                </div>

            </div>
            

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20 relative z-10 w-full">
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Visi */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-3 rounded-lg bg-blue-50 text-blue-600`}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Visi Kami</h2>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed border-l-4 border-gray-100 pl-6 whitespace-pre-line">
                            {data.visi}
                        </p>
                    </div>

                    {/* Misi */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-3 rounded-lg bg-blue-50 text-blue-600`}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Misi Kami</h2>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed border-l-4 border-gray-100 pl-6 whitespace-pre-line">
                            {data.misi}
                        </p>
                    </div>
                </div>

                {/* Struktur Organisasi (Mock) */}
                <div className="mt-12">
                    <div className="flex items-center justify-center mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900 text-center">
                            Struktur Organisasi
                            <span className={`block mt-2 h-1.5 w-24 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full`}></span>
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                            {data.anggota.map((item, index) => (
                                <div key={index} className="group relative">
                                    <div className="relative mx-auto w-32 h-32 mb-4">
                                        <div className="absolute inset-0 bg-blue-50 rounded-full transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>

                                        <div className="absolute inset-0 rounded-full border-4 border-white shadow-sm overflow-hidden z-10">
                                            {item.foto ?
                                                <img
                                                    src={`/uploads/member/${data.username}/${item.foto}`}
                                                    alt={item.nama}
                                                    className="w-full h-full object-cover"
                                                /> :
                                                <div className="w-full h-full flex justify-center items-center">
                                                    <span className="text-gray-400 text-8xl">👤</span>
                                                </div>
                                                
                                            }                                            

                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {item.nama}
                                    </h3>

                                    <p className="font-medium text-blue-600 uppercase text-xs tracking-wider mt-1">
                                        Jabatan {item.jabatan}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dokumentasi Kegiatan */}
                <div className="mt-12">
                    <div className="flex items-center justify-center mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900 text-center">
                            Dokumentasi Kegiatan
                            <span className={`block mt-2 h-1.5 w-24 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full`}></span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {data.dokumentasi.map((item, index) => (
                                <div
                                    key={index}
                                    className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                                >
                                    {/* IMAGE */}
                                    <img
                                        src={`/uploads/dokumentasi/${data.username}/${item.foto}`}
                                        alt="Seminar"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />

                                    {/* DARK OVERLAY */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* BUTTON CENTER */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleView(item)}
                                            className="p-3 bg-white/20 text-white rounded-lg hover:bg-white/40 backdrop-blur-sm"
                                            title="Lihat"
                                        >
                                            🔍
                                        </button>
                                    </div>

                                    {/* TITLE BOTTOM LEFT */}
                                    <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-white font-bold text-lg">
                                            {item.judul}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            </div>
                </div>

                {/* Hubungi Kami */}
                <div className="mt-12">
                    <div className="flex items-center justify-center mb-10">
                        <h2 className="text-3xl font-extrabold text-gray-900 text-center">
                            Hubungi Kami
                            <span className={`block mt-2 h-1.5 w-24 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full`}></span>
                        </h2>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="p-8 text-center border-b md:border-b-0 md:border-r border-gray-100 hover:bg-blue-50 transition-colors">
                                <div className="text-3xl mb-3">✉️</div>
                                <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                                <p className="text-blue-600 font-medium">{data.email}</p>
                            </div>
                            <div className="p-8 text-center hover:bg-blue-50 transition-colors">
                                <div className="text-3xl mb-3">💬</div>
                                <h4 className="font-bold text-gray-900 mb-1">No Kontak</h4>
                                <p className="text-blue-600 font-medium">{data.no_kontak}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={"Detail Foto"}
            >
                {selectedPhoto && (
                    <div className="text-center">
                        <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
                            <img src={`/uploads/dokumentasi/${data.username}/${selectedPhoto.foto}`} alt={selectedPhoto.judul} className="w-full h-auto object-cover" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6">{selectedPhoto.judul}</h4>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                        >
                            Tutup
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
