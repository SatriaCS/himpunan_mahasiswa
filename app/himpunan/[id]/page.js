
import React from "react";
// In Next.js App Router (v15), params should be awaited or treated as a promise/async.
// However, since this is a client component for now (or regular server component),
// we can accept params directly as a prop in server components.
// Note: As of Next 15, params is a Promise. We need to await it if it's a server component,
// or use `use` from react if we need to unwrap it in a more complex way.
// For simplicity in this demo, let's make it an async Server Component.

export default async function ProfileDetailPage({ params }) {
    // Await params to access id
    const { id } = await params;

    // Mock Data Lookup based on ID
    // In a real app, this would come from a database or API
    const himaData = {
        1: {
            name: "Himpunan Mahasiswa Teknik Informatika",
            shortName: "HIMA TI",
            vision:
                "Menjadi pusat pengembangan mahasiswa Teknik Informatika yang kompeten dan inovatif.",
            mission: [
                "Menyelenggarakan pelatihan coding dan desain.",
                "Membangun komunitas developer mahasiswa.",
                "Mengadakan kompetisi teknologi tahunan.",
            ],
            icon: "💻",
            contact: {
                email: "hima@ti.univ.ac.id",
                No_Kontak: "081234567890"
            }
        },
        2: {
            name: "Himpunan Mahasiswa Sistem Informasi",
            shortName: "HIMA SI",
            vision:
                "Menjadi organisasi yang adaptif terhadap perkembangan teknologi sistem informasi.",
            mission: [
                "Mengadakan seminar technopreneur.",
                "Fasilitasi studi banding perusahaan.",
                "Pengembangan soft skill analisis sistem.",
            ],
            icon: "📊",
            contact: {
                email: "hima@si.univ.ac.id",
                No_Kontak: "089876543210"
            }
        },
        3: {
            name: "Himpunan Mahasiswa Desain Komunikasi Visual",
            shortName: "HIMA DKV",
            vision: "Mencetak desainer muda yang kreatif, kritis, dan solutif.",
            mission: [
                "Pameran karya mahasiswa rutin.",
                "Workshop ilustrasi dan branding.",
                "Kolaborasi proyek kreatif antar kampus.",
            ],
            icon: "🎨",
            contact: {
                email: "hima@dkv.univ.ac.id",
                No_Kontak: "087712345678"
            }
        },
    };

    const data = himaData[id] || himaData[1]; // Fallback to ID 1 if not found
    const lightColorClass = `bg-blue-50`;
    const textColorClass = `text-blue-600`;
    // We keep colorClass for the mix-blend mode overlay
    const colorClass = `bg-grey-600`;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Hero Profile */}
            <div className={`relative h-[500px] flex items-center justify-center text-white overflow-hidden`}>
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="/profile-hero.png"
                        alt="Profile Hero Background"
                        className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 ${colorClass} mix-blend-multiply opacity-90`}></div>
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className={`inline-flex items-center justify-center p-5 bg-white/20 backdrop-blur-md rounded-3xl mb-8 shadow-2xl border border-white/20`}>
                        <span className="text-6xl drop-shadow-md">{data.icon}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-lg text-white">
                        {data.name}
                    </h1>
                    <div className="flex justify-center mb-8">
                        <span className="px-6 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-base font-bold tracking-widest uppercase shadow-lg">
                            {data.shortName}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20 relative z-10 w-full">
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Visi */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-3 rounded-lg ${lightColorClass} ${textColorClass}`}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Visi Kami</h2>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed border-l-4 border-gray-100 pl-6">
                            "{data.vision}"
                        </p>
                    </div>

                    {/* Misi */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-3 rounded-lg ${lightColorClass} ${textColorClass}`}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Misi Kami</h2>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed border-l-4 border-gray-100 pl-6 whitespace-pre-line">
                            {Array.isArray(data.mission) ? data.mission.join("\n") : data.mission}
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
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="group relative">
                                    <div className="relative mx-auto w-32 h-32 mb-4">
                                        <div className={`absolute inset-0 ${lightColorClass} rounded-full transform rotate-6 group-hover:rotate-12 transition-transform duration-300`}></div>
                                        <div className="absolute inset-0 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-3xl border-4 border-white shadow-sm overflow-hidden z-10">
                                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Nama Pengurus {item}</h3>
                                    <p className={`font-medium ${textColorClass} uppercase text-xs tracking-wider mt-1`}>Jabatan {item}</p>
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
                        <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                            <img src="/doc-seminar.png" alt="Seminar" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white font-bold text-lg">Seminar Nasional</span>
                            </div>
                        </div>
                        <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                            <img src="/doc-workshop.png" alt="Workshop" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white font-bold text-lg">Workshop Kreatif</span>
                            </div>
                        </div>
                        <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                            <img src="/doc-gathering.png" alt="Gathering" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white font-bold text-lg">Gathering Anggota</span>
                            </div>
                        </div>
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
                                <p className="text-blue-600 font-medium">{data.contact?.email}</p>
                            </div>
                            <div className="p-8 text-center hover:bg-blue-50 transition-colors">
                                <div className="text-3xl mb-3">💬</div>
                                <h4 className="font-bold text-gray-900 mb-1">No Kontak</h4>
                                <p className="text-blue-600 font-medium">{data.contact?.No_Kontak}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
