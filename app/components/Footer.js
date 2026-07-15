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
                            <li>
                                <a
                                    href="https://wa.me/6283119968079"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-base text-gray-500 hover:text-gray-900"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 32 32"
                                        width="20"
                                        height="20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                        className="text-[#25D366]"
                                    >
                                        <path d="M16.01 3C8.83 3 3 8.82 3 15.99c0 2.29.6 4.53 1.75 6.5L3 29l6.68-1.71A12.93 12.93 0 0 0 16.01 29C23.18 29 29 23.18 29 16S23.18 3 16.01 3Zm0 23.8c-2.05 0-4.05-.55-5.8-1.6l-.42-.25-3.96 1.01 1.06-3.86-.27-.44A10.74 10.74 0 0 1 5.2 16c0-5.96 4.85-10.8 10.81-10.8S26.8 10.04 26.8 16 21.96 26.8 16.01 26.8Zm5.93-8.1c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.52-.16-.74.16-.22.32-.85 1.05-1.04 1.27-.19.22-.38.24-.7.08-.32-.16-1.36-.5-2.6-1.6-.96-.86-1.61-1.92-1.8-2.24-.19-.32-.02-.49.14-.65.14-.14.32-.38.48-.57.16-.19.22-.32.32-.54.11-.22.05-.41-.03-.57-.08-.16-.74-1.78-1.01-2.44-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41-.3.32-1.14 1.11-1.14 2.71 0 1.6 1.17 3.15 1.33 3.37.16.22 2.3 3.51 5.57 4.92.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.3-.21-.62-.37Z" />
                                    </svg>
                                    083119968079
                                </a>
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