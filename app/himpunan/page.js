import Link from "next/link";

export default function ProfileListPage() {
    const himpunanLists = [
        {
            id: 1,
            name: "Himpunan Mahasiswa Teknik Informatika",
            shortName: "HIMA TI",
            desc: "Wadah kreativitas dan inovasi mahasiswa Teknik Informatika. Fokus pada pengembangan software, hardware, dan teknologi masa depan.",
            icon: "💻"
        },
        {
            id: 2,
            name: "Himpunan Mahasiswa Sistem Informasi",
            shortName: "HIMA SI",
            desc: "Mengintegrasikan teknologi dan bisnis untuk masa depan. Mencetak analis sistem dan manajer teknologi yang handal.",
            icon: "📊"
        },
        {
            id: 3,
            name: "Himpunan Mahasiswa Desain Komunikasi Visual",
            shortName: "HIMA DKV",
            desc: "Mengekspresikan ide melalui visual yang berdampak. Rumah bagi para kreator, ilustrator, dan desainer muda.",
            icon: "🎨"
        },
    ];

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
                            Temukan komunitasmu, kembangkan potensimu. Jelajahi berbagai himpunan mahasiswa yang sesuai dengan minat dan jurusanmu.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {himpunanLists.map((hima) => (
                        <Link
                            href={`/himpunan/${hima.id}`}
                            key={hima.id}
                            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 hover:-translate-y-1"
                        >
                            {/* Card Header with Color Accent */}
                            <div className={`h-2 w-full `}></div>

                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner`}>
                                        {hima.icon}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 uppercase tracking-wider`}>
                                        {hima.shortName}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {hima.name}
                                </h3>

                                <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                                    {hima.desc}
                                </p>

                                <div className="flex items-center text-blue-600 font-medium text-sm group-hover:underline">
                                    Lihat Profil Lengkap
                                    <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
