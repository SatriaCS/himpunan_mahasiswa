"use client";
import { useState } from "react";
import Modal from "../../components/Modal";

export default function NewsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'delete', 'success'
    const [selectedNews, setSelectedNews] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image: null,
    });

    // Initial dummy data
    const [imagePreview, setImagePreview] = useState(null);
    const [newsList, setNewsList] = useState([
        {
            id: 1,
            title: "Recap Kegiatan Semnas AI 2025",
            description: "Kegiatan Seminar Nasional AI 2025 telah sukses dilaksanakan dengan menghadirkan pakar industri terkemuka.",
            image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Semnas+AI",
            date: "26 Jan 2025",
        },
        {
            id: 2,
            title: "Pendaftaran Anggota Baru Batch 2",
            description: "Kesempatan bagi mahasiswa untuk bergabung dengan himpunan melalui pendaftaran batch kedua.",
            image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Open+Member",
            date: "15 Jan 2025",
        },
    ]);

    const handleAdd = () => {
        setModalMode("add");
        setImagePreview(null);
        setFormData({ title: "", description: "", image: null });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setSelectedNews(item);
        setModalMode("edit");
        setImagePreview(item.image);
        setFormData({
            title: item.title,
            description: item.description,
            image: item.image,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (item) => {
        setSelectedNews(item);
        setModalMode("delete");
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        setNewsList(newsList.filter((n) => n.id !== selectedNews.id));
        setModalMode("success");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalMode === "add") {
            const newItem = {
                id: Date.now(),
                ...formData,
                image: imagePreview || "https://placehold.co/600x400/e2e8f0/1e293b?text=News",
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            };
            setNewsList([newItem, ...newsList]);
        } else if (modalMode === "edit") {
            setNewsList(
                newsList.map((n) => (n.id === selectedNews.id ? { ...n, ...formData, image: imagePreview || formData.image } : n))
            );
        }
        setModalMode("success");
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Berita & Artikel</h1>
                    <p className="text-gray-500 mt-1">Publikasi informasi terbaru</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                >
                    <span>+</span> Tulis Berita
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsList.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                        <div className="h-48 overflow-hidden relative">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                    {item.date}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Hapus"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                                {item.title}
                            </h3>
                            <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    modalMode === "add"
                        ? "Tulis Berita Baru"
                        : modalMode === "edit"
                            ? "Edit Berita"
                            : modalMode === "delete"
                                ? "Hapus Berita"
                                : "Berhasil"
                }
            >
                {(modalMode === "add" || modalMode === "edit") && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Judul Berita</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                placeholder="Masukkan judul berita..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Thumbnail Berita</label>
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
                                        <p className="text-sm">Klik untuk upload gambar</p>
                                        <p className="text-xs mt-1 text-gray-400">(Simulasi Upload)</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi / Konten</label>
                            <textarea
                                required
                                rows="6"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black resize-none"
                                placeholder="Tulis deskripsi atau konten berita di sini..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all mt-4"
                        >
                            {modalMode === "add" ? "Publikasikan" : "Simpan Perubahan"}
                        </button>
                    </form>
                )}

                {modalMode === "delete" && (
                    <div className="text-center py-4">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Hapus Berita Ini?</h4>
                        <p className="text-gray-500 mb-8">
                            Berita yang dihapus tidak dapat dikembalikan.
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
                            Data berita berhasil diperbarui.
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
