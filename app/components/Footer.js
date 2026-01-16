import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                            Tentang Kami
                        </h3>
                        <p className="mt-4 text-base text-gray-500">
                            Platform untuk seluruh Himpunan Mahasiswa. Menghubungkan informasi, kegiatan, dan berita mahasiswa.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                            Tautan Cepat
                        </h3>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <Link href="/berita" className="text-base text-gray-500 hover:text-gray-900">
                                    Berita Terkini
                                </Link>
                            </li>
                            <li>
                                <Link href="/kegiatan" className="text-base text-gray-500 hover:text-gray-900">
                                    Agenda Kegiatan
                                </Link>
                            </li>
                            <li>
                                <Link href="/himpunan" className="text-base text-gray-500 hover:text-gray-900">
                                    Data Himpunan
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                            Hubungi Kami
                        </h3>
                        <ul className="mt-4 space-y-4">
                            <li className="text-base text-gray-500">
                                081122223333
                            </li>
                            <li className="text-base text-gray-500">
                                emailKami@mail.com
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 pt-8">
                    <p className="text-base text-gray-400 text-center">
                        &copy; {new Date().getFullYear()} Portal Himpunan Mahasiswa. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
