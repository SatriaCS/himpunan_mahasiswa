"use client";
import { useState } from "react";
import Modal from "../../components/Modal";

export default function DokumentasiPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("upload"); // 'upload', 'view', 'delete', 'success'
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [formData, setFormData] = useState({ title: "", file: null });

    // Initial dummy data
    const [photos, setPhotos] = useState([
        { id: 1, title: "Rapat Kerja 2024", url: "https://placehold.co/400x400/e2e8f0/1e293b?text=Raker" },
        { id: 2, title: "Seminar Nasional", url: "https://placehold.co/400x400/e2e8f0/1e293b?text=Seminar" },
        { id: 3, title: "Bakti Sosial", url: "https://placehold.co/400x400/e2e8f0/1e293b?text=Baksos" },
    ]);

    const [imagePreview, setImagePreview] = useState(null);

    const handleUploadClick = () => {
        setModalMode("upload");
        setFormData({ title: "", file: null });
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const handleView = (photo) => {
        setSelectedPhoto(photo);
        setModalMode("view");
        setIsModalOpen(true);
    };

    const handleDelete = (photo) => {
        setSelectedPhoto(photo);
        setModalMode("delete");
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        setPhotos(photos.filter((p) => p.id !== selectedPhoto.id));
        setModalMode("success");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, file: file });
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
        }
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        // Simulate upload using the local preview URL or a placeholder if none
        const newPhoto = {
            id: Date.now(),
            title: formData.title,
            url: imagePreview || "https://placehold.co/400x400/e2e8f0/1e293b?text=New+Img",
        };
        setPhotos([newPhoto, ...photos]);
        setModalMode("success");
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dokumentasi Kegiatan</h1>
                    <p className="text-gray-500 mt-1">Kelola galeri foto kegiatan himpunan</p>
                </div>
                <button
                    onClick={handleUploadClick}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all font-medium text-sm"
                >
                    + Upload Foto
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                {photos.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">Belum ada foto dokumentasi</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* New Upload Placeholder */}
                        <div
                            onClick={handleUploadClick}
                            className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer bg-gray-50"
                        >
                            <span className="text-2xl mb-1">+</span>
                            <span className="text-xs font-medium">Upload Baru</span>
                        </div>

                        {photos.map((photo) => (
                            <div key={photo.id} className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                {/* Use simple img tag for demo or next/image */}
                                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleView(photo)}
                                        className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/40 backdrop-blur-sm"
                                        title="Lihat"
                                    >
                                        👁️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(photo)}
                                        className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 backdrop-blur-sm"
                                        title="Hapus"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                                    <p className="text-xs font-medium truncate">{photo.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    modalMode === "upload"
                        ? "Upload Foto Baru"
                        : modalMode === "view"
                            ? "Detail Foto"
                            : modalMode === "delete"
                                ? "Hapus Foto"
                                : "Berhasil"
                }
            >
                {modalMode === "upload" && (
                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Judul Foto</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                placeholder="Contoh: Kegiatan Workshop"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        {/* Date field removed */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">File Foto</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {imagePreview ? (
                                    <div className="relative h-40 w-full">
                                        <img src={imagePreview} alt="Preview" className="h-full w-full object-contain mx-auto" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                                            Klik untuk ganti
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm">Klik untuk upload atau drag & drop</p>
                                        <p className="text-xs mt-1 text-gray-400">(Tipe: JPG, PNG, Max 5MB)</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all mt-4"
                        >
                            Upload Foto
                        </button>
                    </form>
                )}

                {modalMode === "view" && selectedPhoto && (
                    <div className="text-center">
                        <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
                            <img src={selectedPhoto.url} alt={selectedPhoto.title} className="w-full h-auto max-h-[300px] object-cover" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6">{selectedPhoto.title}</h4>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                        >
                            Tutup
                        </button>
                    </div>
                )}

                {modalMode === "delete" && (
                    <div className="text-center py-4">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">🗑️</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Hapus Foto Ini?</h4>
                        <p className="text-gray-500 mb-8">
                            Foto yang dihapus tidak dapat dikembalikan.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                )}

                {modalMode === "success" && (
                    <div className="text-center py-4">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform">
                            <span className="text-4xl">✅</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Berhasil!</h4>
                        <p className="text-gray-500 mb-6">
                            Aksi berhasil dilakukan.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all"
                        >
                            Tutup
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
