"use client";
import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import Pagination from "../components/Pagination";

export default function EventsPage() {
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
    const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'delete', 'success'
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formData, setFormData] = useState({
        judul: "",
        deskripsi: "",
        kategori: "",
        tanggal: "",
        waktu: "",
        tempat: "",
        kouta: '',
        flayer: null,
        link: ""
    });

    // Initial dummy data with new structure
    const [imagePreview, setImagePreview] = useState(null);
    const [events, setEvents] = useState([]);

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5;
    // loading
    const [loadingData, setLoadingData] = useState(true);

    const fetchEvent = async (currentPage = 1) => {
        setLoadingData(true)

        const res = await fetch(`/api/admin/event?page=${currentPage}&limit=${limit}`,
            {
                cache: "no-store"
            }
        );
        const result = await res.json();
        
        setEvents(result.data);
        setTotalPages(result.totalPages);
        // AUTO FIX PAGE
        if (currentPage > result.totalPages && result.totalPages > 0) {
            setCurrentPage(result.totalPages);
        }

        setLoadingData(false)
    };

    useEffect(() => {
        fetchEvent(currentPage);
    }, [currentPage]);

    const handleAdd = () => {
        setModalMode("add");
        setImagePreview(null);
        setFormData({
            judul: "",
            deskripsi: "",
            kategori: "",
            tanggal: "",
            waktu: "",
            tempat: "",
            kouta: '',
            flayer: null,
            link: ""
        });
        setIsModalOpen(true);
    };

    const handleEdit = (event) => {
        setSelectedEvent(event);        
        setModalMode("edit");
        if (event.flayer) {
            setImagePreview(`/uploads/event/${event.username}/${event.flayer}`);
        }        
        setFormData({
            judul: event.judul,
            deskripsi: event.deskripsi,
            kategori: event.kategori,
            tanggal: new Date(event.tanggal)
            .toISOString()
            .split("T")[0],
            waktu: event.waktu,
            tempat: event.tempat,
            flayer: event.flayer,
            kouta: event.kouta,
            link: event.link
        });
        
        setIsModalOpen(true);
    };


    const handleDelete = (event) => {
        setSelectedEvent(event);
        setModalMode("delete");
        setIsModalOpen(true);
    };

    const confirmDelete = async() => {

        try {

            setLoading(true);

            const res = await fetch(`/api/admin/event?id=${selectedEvent.id}`, {
                method: "DELETE"
            });

            const result = await res.json();

            if (!res.ok) {
                showError(result.message);
                return;
            }

            showSuccess(result.message);
            setIsModalOpen(false)

        } catch (error) {
            showError(error.message);
        } finally {
            fetchEvent(currentPage);
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, flayer: file });
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
        }
    };

    const handleSubmit = async(e) => {
        e.preventDefault();

        try {

            setLoading(true);

            const data = new FormData();
            data.append("judul", formData.judul);
            data.append("deskripsi", formData.deskripsi);
            data.append("kategori", formData.kategori);
            data.append("tanggal", formData.tanggal);
            data.append("waktu", formData.waktu);
            data.append("tempat", formData.tempat);
            data.append("kouta", formData.kouta);
            data.append("flayer", formData.flayer);
            data.append("link", formData.link); 
            
            const res = await fetch("/api/admin/event", {
                method: "POST",
                body: data
            });

            const result = await res.json();

            if (!res.ok) {
                showError(result.message);
                return;
            }

            showSuccess(result.message);
            setFormData({
                judul: "",
                deskripsi: "",
                kategori: "",
                tanggal: "",
                waktu: "",
                tempat: "",
                kouta: '',
                flayer: null,
                link: ""
            });
            
            setImagePreview(null)
            setIsModalOpen(false)

        } catch (error) {
            showError(error.message);
        } finally {
            fetchEvent(currentPage);
            setLoading(false);
        }
    };

    const handleSubmitEdit = async(e) => {
        e.preventDefault();

        try {

            setLoading(true);
            
            const data = new FormData();
            data.append("id", selectedEvent.id);
            data.append("judul", formData.judul);
            data.append("deskripsi", formData.deskripsi);
            data.append("kategori", formData.kategori);
            data.append("tanggal", formData.tanggal);
            data.append("waktu", formData.waktu);
            data.append("tempat", formData.tempat);
            data.append("kouta", formData.kouta);
            data.append("flayer", formData.flayer);
            data.append("link", formData.link);

            const res = await fetch("/api/admin/event", {
                method: "PUT",
                body: data
            });

            const result = await res.json();

            if (!res.ok) {
                showError(result.message);
                return;
            }

            showSuccess(result.message);
            setFormData({
                judul: "",
                deskripsi: "",
                kategori: "",
                tanggal: "",
                waktu: "",
                tempat: "",
                kouta: '',
                flayer: null,
                link: ""
            });
            setImagePreview(null)
            setIsModalOpen(false)

        } catch (error) {
            showError(error.message);
        } finally {
            fetchEvent(currentPage);
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Kegiatan</h1>
                    <p className="text-gray-500 mt-1">Kelola jadwal dan informasi kegiatan</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                >
                    <span>+</span> Tambah Kegiatan
                </button>
            </div>

            <div className="grid gap-6">
                {loadingData ? (
                                <div className="flex justify-center items-center gap-2">
                                    <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-gray-500">Memuat data...</span>
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100 p-8">Belum ada kegiatan</div>
                            ) : (
                                events.map((event) => (
                                    <div key={event.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                        <div className="w-full md:w-48 h-48 md:h-auto shrink-0">
                                            {event.flayer ? (
                                                    <img
                                                        src={`/uploads/event/${event.username}/${event.flayer}`}
                                                        alt={event.judul}
                                                        className="h-full object-contain rounded-xl bg-gray-50"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-9xl">🖼️</span>
                                                )}
                                            
                                        </div>
                                        <div className="flex-1 py-2">
                                            <div className="flex items-center gap-3 mb-2">
                                                {event.kategori ? (
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wide">
                                                        {event.kategori}
                                                    </span>
                                                ) : ""}
                                            </div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm text-gray-400 flex items-center gap-1">
                                                    📅 {new Date(event.tanggal).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric"
                                                        })}
                                                </span>
                                                <span className="text-sm text-gray-400 flex items-center gap-1">
                                                    🕒 {event.waktu}
                                                </span>
                                                {event.tempat ? (
                                                    <span className="flex items-center text-gray-400 gap-1">📍 {event.tempat}</span>
                                                ) : ""}
                                                {event.kouta ? (
                                                    <span className="flex items-center text-gray-400 gap-1">👥 {event.kouta} Kuota Peserta</span>
                                                ) : ""}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.judul}</h3>
                                            <p className="text-gray-500 text-sm mb-3 whitespace-pre-line">{event.deskripsi}</p>
                                        </div>

                                        <div className="flex items-center gap-3 self-end md:self-center">
                                            <button
                                                onClick={() => handleEdit(event)}
                                                className="p-2.5 bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event)}
                                                className="p-2.5 bg-gray-50 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                                                title="Hapus"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )
                }
            </div>
            {events.length > 0 && 
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            }

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    modalMode === "add"
                        ? "Tambah Kegiatan Baru"
                        : modalMode === "edit"
                            ? "Edit Kegiatan"
                            : modalMode === "delete"
                                ? "Hapus Kegiatan"
                                    : ""
                }
                maxWidth={"max-w-md"}
            >
                {(modalMode === "add" || modalMode === "edit") && (
                    <form onSubmit={modalMode == "add" ? handleSubmit : handleSubmitEdit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Judul Kegiatan</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                placeholder="Contoh: Seminar Nasional"
                                value={formData.judul}
                                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Flayer Kegiatan</label>
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
                                        <p className="text-sm">Klik untuk upload Flayer</p>
                                        <p className="text-xs mt-1 text-gray-400">(Tipe: JPG, PNG, Max 5MB)</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi</label>
                            <textarea
                                required
                                rows="3"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black resize-none"
                                placeholder="Jelaskan detail kegiatan..."
                                value={formData.deskripsi}
                                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                    placeholder="Contoh: seminar"
                                    value={formData.kategori || ""}
                                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                    value={formData.tanggal}
                                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Waktu</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                    placeholder="Contoh: 09:00 WIB"
                                    value={formData.waktu}
                                    onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tempat</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                    placeholder="Contoh: Aula Utama"
                                    value={formData.tempat || ""}
                                    onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Link pendaftaran</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                    placeholder="link google form atau yang lain"
                                    value={formData.link || ""}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Kuota Peserta</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                placeholder="Contoh: 100"
                                value={formData.kouta || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        kouta: e.target.value === ""
                                            ? ""
                                            : parseInt(e.target.value)
                                    })
                                }
                            />
                        </div>
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all mt-4"
                        >
                            {loading ? "loading..." :modalMode === "add" ? "Simpan Kegiatan" : "Simpan Perubahan"}
                        </button>
                    </form>
                )}

                {modalMode === "delete" && (
                    <div className="text-center py-4">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Hapus Kegiatan Ini?</h4>
                        <p className="text-gray-500 mb-8">
                            Data yang dihapus tidak dapat dikembalikan.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                            >
                                Batal
                            </button>
                            <button
                                disabled={loading}
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all"
                            >
                                {loading ? "loading...":"Hapus"}
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
