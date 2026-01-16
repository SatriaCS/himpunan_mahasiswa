"use client";
import { useState } from "react";
import Modal from "../../components/Modal";

export default function VisiMisiPage() {
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    const handleSave = () => {
        setIsSuccessOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Visi & Misi</h1>
                    <p className="text-gray-500 mt-1">Kelola visi dan misi organisasi</p>
                </div>
                <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all"
                >
                    Simpan Perubahan
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 max-w-3xl">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Visi Organisasi
                    </label>
                    <textarea
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all h-32 text-black"
                        placeholder="Masukkan visi organisasi..."
                        defaultValue="Menjadi himpunan mahasiswa yang unggul dalam teknologi dan inovasi..."
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-2">
                        Tuliskan visi jangka panjang organisasi.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Misi Organisasi
                    </label>
                    <textarea
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all h-64 text-black"
                        placeholder="Masukkan misi organisasi..."
                        defaultValue="1. Menyelenggarakan kegiatan ilmiah...&#10;2. Mengembangkan potensi anggota...&#10;3. Membangun kerjasama dengan pihak luar..."
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-2">
                        Tuliskan misi organisasi (bisa format poin atau paragraf).
                    </p>
                </div>
            </div>

            {/* Success Modal */}
            <Modal
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                title="Berhasil!"
            >
                <div className="text-center py-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform">
                        <span className="text-4xl">✅</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                        Perubahan Berhasil Disimpan!
                    </h4>
                    <p className="text-gray-500 mb-6">
                        Data visi dan misi organisasi telah diperbarui.
                    </p>
                    <button
                        onClick={() => setIsSuccessOpen(false)}
                        className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all"
                    >
                        Tutup
                    </button>
                </div>
            </Modal>
        </div>
    );
}
