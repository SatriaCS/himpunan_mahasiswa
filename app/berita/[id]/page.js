import Image from "next/image";
import Link from "next/link";

const newsData = [
    {
        id: 1,
        title: "Mahasiswa Berprestasi Tingkat Nasional Tahun 2024",
        date: "10 okt 2026",
        author: "Admin",
        content: `
            <p class="mb-6">Mahasiswa Informatika kembali menorehkan prestasi membanggakan di kancah nasional. Dalam ajang Gemastik 2024 yang diselenggarakan di Universitas Indonesia, tim dari Himpunan Mahasiswa Informatika berhasil menyabet medali emas di bidang Pemrograman Competitive.</p>
            <p class="mb-6">Kompetisi yang diikuti oleh lebih dari 100 tim dari berbagai universitas di Indonesia ini berlangsung sangat sengit. Tim kita berhasil menyelesaikan 8 dari 10 permasalahan yang diberikan dalam waktu 5 jam.</p>
            <p class="mb-6">Ketua Program Studi Informatika mengapresiasi kerja keras para mahasiswa tersebut. "Ini adalah bukti bahwa kualitas pendidikan di kampus kita mampu bersaing dengan universitas-universitas besar lainnya," ujarnya.</p>
        `
    },
    {
        id: 2,
        title: "Workshop UI/UX Design bersama Expert dari Gojek",
        date: "10 okt 2026",
        author: "Admin",
        content: `
            <p class="mb-6">Himpunan Mahasiswa akan mengadakan workshop UI/UX Design yang menghadirkan praktisi langsung dari industri. Kali ini, kita kedatangan Senior Product Designer dari Gojek yang akan berbagi ilmu mengenai fundamental desain antarmuka.</p>
            <p class="mb-6">Workshop ini akan dilaksanakan selama 3 hari berturut-turut di Laboratorium Komputer 3. Peserta akan diajarkan mulai dari research, wireframing, hingga prototyping menggunakan Figma.</p>
            <p class="mb-6">Jangan lewatkan kesempatan ini untuk meningkatkan skill desainmu!</p>
        `
    },
    {
        id: 3,
        title: "Open Recruitment Pengurus Himpunan Periode 2025/2026",
        date: "10 okt 2026",
        author: "Admin",
        content: `
            <p class="mb-6">Panggilan untuk seluruh mahasiswa aktif angkatan 2023 dan 2024! Himpunan Mahasiswa membuka kesempatan bagi kalian yang ingin belajar berorganisasi dan berkontribusi nyata bagi jurusan.</p>
            <p class="mb-6">Terdapat berbagai divisi yang bisa kalian pilih, mulai dari PSDM, Humas, Kominfo, hingga Kewirausahaan. Daftarkan diri kalian segera melalui link yang tersedia di bio Instagram himpunan.</p>
            <p class="mb-6">Mari bersama-sama wujudkan himpunan yang lebih progresif dan inovatif!</p>
        `
    },
    {
        id: 4,
        title: "Kunjungan Industri ke Kantor Google Indonesia",
        date: "10 okt 2026",
        content: `
            <p class="mb-6">Himpunan Mahasiswa bekerjasama dengan Program Studi akan mengadakan Kunjungan Industri ke kantor Google Indonesia di Jakarta.</p>
            <p class="mb-6">Kegiatan ini bertujuan untuk memberikan wawasan kepada mahasiswa mengenai lingkungan kerja di perusahaan teknologi multinasional. Peserta akan diajak berkeliling kantor dan mengikuti sesi sharing bersama para engineer di sana.</p>
            <p class="mb-6">Kuota terbatas! Segera daftarkan dirimu.</p>
        `
    }
];

export default function DetailBerita({ params }) {
    // Find the news item based on ID
    // Note: params.id comes as a string, so we convert it or compare loosely
    const id = parseInt(params.id);
    const newsItem = newsData.find((item) => item.id === id);

    if (!newsItem) {
        return (
            <div className="min-h-screen bg-white pb-20 pt-12 md:pt-20 flex flex-col items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Berita Tidak Ditemukan</h1>
                    <p className="text-gray-500 mb-8">Maaf, berita yang Anda cari tidak tersedia.</p>
                    <Link
                        href="/berita"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                    >
                        ← Kembali ke Berita
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20 pt-12 md:pt-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-10">
                    <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-100 text-blue-700 text-sm font-bold tracking-wide">
                        Berita Kampus
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                        {newsItem.title}
                    </h1>
                    <div className="flex items-center justify-center text-gray-500 gap-6 text-sm md:text-base">
                        <span className="flex items-center gap-2">
                            👤 Oleh <span className="font-semibold text-gray-900">{newsItem.author}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            📅 {newsItem.date}
                        </span>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="relative w-full mb-12 rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                        src="/default-news.png"
                        alt={newsItem.title}
                        width={1200}
                        height={800}
                        className="w-full h-auto object-cover"
                        priority
                    />
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto">
                    <div
                        className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: newsItem.content }}
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
