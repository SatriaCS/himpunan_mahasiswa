"use client";
import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import Pagination from "../components/Pagination";

export default function DokumentasiPage() {
    const [loading, setLoading] = useState(false);

    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);

    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    const showSuccess = (message) => {
        setAlertTitle("Berhasil!");
        setAlertMessage(message);
        setIsSuccessOpen(true);
    };

    const showError = (message) => {
        setAlertTitle("Gagal!");
        setAlertMessage(message);
        setIsErrorOpen(true);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("upload"); // 'upload', 'view', 'delete'
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [formData, setFormData] = useState({ judul: "", file: null });

    const [photos, setPhotos] = useState([]);

    const [imagePreview, setImagePreview] = useState(null);
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 7;
    // loading
    const [loadingData, setLoadingData] = useState(true);

    const fetchDokumentasi = async (currentPage = 1) => {
        try{
            setLoadingData(true);

            const res = await fetch(`/api/admin/dokumentasi?page=${currentPage}&limit=${limit}`,
                {
                    cache: "no-store"
                }
            );
            if (!res.ok) {
                // Ambil pesan error dari backend
                const errorData = await res.json(); 
                // Lempar error agar masuk ke blok catch
                throw new Error(errorData.message || `Gangguan. Silakan coba beberapa saat lagi.`);
            }
            const result = await res.json();

            setPhotos(result.data);
            setTotalPages(result.totalPages);
            // AUTO FIX PAGE
            if (currentPage > result.totalPages && result.totalPages > 0) {
                setCurrentPage(result.totalPages);
            }

        } catch (err) {
            alert(err.message)
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchDokumentasi(currentPage);
    }, [currentPage]);

    const handleUploadClick = () => {
        setModalMode("upload");
        setFormData({ judul: "", file: null });
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

    const confirmDelete = async () => {
        try {
            setLoading(true);
            const res = await fetch(
                `/api/admin/dokumentasi?id=${selectedPhoto.id}`,
                { method: "DELETE" }
            );

            const result = await res.json();

            if (!res.ok) {
                    // Ambil pesan error dari backend
                    const errorData = await res.json(); 
                    // Lempar error agar masuk ke blok catch
                    throw new Error(errorData.message || `Gangguan. Silakan coba beberapa saat lagi.`);
            }

            setIsModalOpen(false);
            fetchDokumentasi(currentPage);
            showSuccess(result.message);

        } catch (error) {
            showError(error.message);
            fetchDokumentasi(currentPage);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, file: file });
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        if (!formData.file) {
            showError("Foto wajib diisi");
            return;
        }

        try {

            setLoading(true);

            const data = new FormData();
            data.append("judul", formData.judul);
            data.append("foto", formData.file);

            const res = await fetch("/api/admin/dokumentasi", {
                method: "POST",
                body: data
            });

            const result = await res.json();

            if (!res.ok) {
                    // Ambil pesan error dari backend
                    const errorData = await res.json(); 
                    // Lempar error agar masuk ke blok catch
                    throw new Error(errorData.message || `Gangguan. Silakan coba beberapa saat lagi.`);
            }

            /* tambah ke gallery */
            const newPhoto = {
                id: Date.now(),
                judul: formData.judul,
                foto: result.foto
            };

            setPhotos(prev => [newPhoto, ...prev]);

            showSuccess(result.message);
            setFormData({ judul: "", file: null })
            setImagePreview(null)
            setIsModalOpen(false)
            fetchDokumentasi(currentPage);

        } catch (error) {
            showError(error.message);
            fetchDokumentasi(currentPage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dokumentasi</h1>
                    <p className="text-gray-500 mt-1">Kelola galeri foto himpunan</p>
                </div>
                <button
                    onClick={handleUploadClick}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all font-medium text-sm"
                >
                    + Upload Foto
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                {loadingData ? (
                    <div className="flex justify-center items-center gap-2">
                        <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500">Memuat data...</span>
                    </div>
                ) : photos.length === 0 ? (
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
                                <img
                                    src={photo.foto}
                                    alt={photo.judul}
                                    className="w-full h-full object-cover"
                                />

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleView(photo)}
                                        className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/40 backdrop-blur-sm"
                                        title="Lihat"
                                    >
                                        🔍
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
                                    <p className="text-xs font-medium truncate">{photo.judul}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )
                }
                {photos.length > 0 &&
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                }
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
                                : ""
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
                                value={formData.judul}
                                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
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
                                        <p className="text-sm">Klik untuk upload</p>
                                        <p className="text-xs mt-1 text-gray-400">(Tipe: JPG, PNG, Max 5MB)</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all mt-4"
                        >
                            {loading ? "Uploading..." : "Upload Foto"}
                        </button>
                    </form>
                )}

                {modalMode === "view" && selectedPhoto && (
                    <div className="text-center">
                        <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
                            <img
                                src={selectedPhoto.foto}
                                alt={selectedPhoto.judul}
                                className="w-full h-auto object-cover"
                            />
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
                                disabled={loading}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all"
                            >
                                {loading ? "Loading..." : "Hapus"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            {/* Sukses Alert */}
            <Modal
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                title={alertTitle}
            >
                <div className="text-center py-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">✅</span>
                    </div>

                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {alertTitle}
                    </h4>

                    <p className="text-gray-500 mb-6">
                        {alertMessage}
                    </p>

                    <button
                        onClick={() => setIsSuccessOpen(false)}
                        className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium"
                    >
                        Tutup
                    </button>
                </div>
            </Modal>

            {/* Error Modal */}
            <Modal
                isOpen={isErrorOpen}
                onClose={() => setIsErrorOpen(false)}
                title="Terjadi Kesalahan"
            >
                <div className="text-center py-4">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">❌</span>
                    </div>

                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {alertTitle}
                    </h4>

                    <p className="text-gray-500 mb-6">
                        {alertMessage}
                    </p>

                    <button
                        onClick={() => setIsErrorOpen(false)}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium"
                    >
                        Tutup
                    </button>
                </div>
            </Modal>
        </div>
    );
}
