"use client";
import { useState } from "react";
import Modal from "../../components/Modal";

export default function EventsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'delete', 'success'
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        date: "",
        time: "",
        location: "",
        image: null,
        quota: 100,
        customFields: [], // Dynamic form fields
    });

    // Initial dummy data with new structure
    const [imagePreview, setImagePreview] = useState(null);
    const [events, setEvents] = useState([
        {
            id: 1,
            title: "Seminar Nasional Teknologi AI",
            description: "Membahas perkembangan AI terkini bersama pakar industri.",
            category: "Akademik",
            date: "2025-01-24",
            time: "09:00 WIB",
            location: "Gedung Serbaguna",
            image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Semi+AI",
            quota: 100,
            customFields: [
                { id: 1, label: "Asal Universitas", type: "text", required: true },
                { id: 2, label: "Jurusan", type: "text", required: true },
            ],
        },
        {
            id: 2,
            title: "Workshop UI/UX Design",
            description: "Pelatihan dasar desain antarmuka aplikasi mobile.",
            category: "Workshop",
            date: "2025-02-10",
            time: "13:00 WIB",
            location: "Lab Komputer 3",
            image: "https://placehold.co/600x400/e2e8f0/1e293b?text=UI+UX",
            quota: 30,
            customFields: [
                { id: 1, label: "Laptop Sendiri?", type: "select", options: ["Ya", "Tidak"], required: true },
                { id: 2, label: "Pengalaman Design", type: "select", options: ["Pemula", "Menengah", "Mahir"], required: false },
            ],
        },
    ]);

    // Mock participants data
    const mockParticipants = {
        1: [
            { id: 1, name: "Budi Santoso", email: "budi@example.com", phone: "081234567890", date: "2025-01-20", status: "Terdaftar", answers: { "Asal Universitas": "Universitas Indonesia", "Jurusan": "Teknik Informatika" } },
            { id: 2, name: "Siti Aminah", email: "siti@example.com", phone: "081987654321", date: "2025-01-21", status: "Hadir", answers: { "Asal Universitas": "ITB", "Jurusan": "Sistem Informasi" } },
            { id: 3, name: "Rudi Hartono", email: "rudi@example.com", phone: "081298765432", date: "2025-01-21", status: "Batal", answers: { "Asal Universitas": "UGM", "Jurusan": "Ilmu Komputer" } },
        ],
        2: [
            { id: 1, name: "Dewi Lestari", email: "dewi@example.com", phone: "085678901234", date: "2025-02-01", status: "Terdaftar", answers: { "Laptop Sendiri?": "Ya", "Pengalaman Design": "Pemula" } },
            { id: 2, name: "Andi Saputra", email: "andi@example.com", phone: "081345678901", date: "2025-02-02", status: "Terdaftar", answers: { "Laptop Sendiri?": "Tidak", "Pengalaman Design": "Menengah" } },
        ],
    };

    const handleAdd = () => {
        setModalMode("add");
        setImagePreview(null);
        setFormData({
            title: "",
            description: "",
            category: "",
            date: "",
            time: "",
            location: "",
            image: null,
            quota: 100,
            customFields: [],
            formDescription: "",
        });
        setIsModalOpen(true);
    };

    const handleViewParticipants = (event) => {
        setSelectedEvent(event);
        setModalMode("participants");
        setIsModalOpen(true);
    };


    const handleEdit = (event) => {
        setSelectedEvent(event);
        setModalMode("edit");
        setImagePreview(event.image);
        setFormData({
            title: event.title,
            description: event.description,
            category: event.category,
            date: event.date,
            time: event.time,
            location: event.location,
            image: event.image,
            quota: event.quota || 100,
            customFields: event.customFields || [],
            formDescription: event.formDescription || "",
        });
        setIsModalOpen(true);
    };

    // Dynamic field management
    const addCustomField = () => {
        const newField = {
            id: Date.now(),
            label: "",
            type: "text",
            required: false,
            options: [],
        };
        setFormData({
            ...formData,
            customFields: [...formData.customFields, newField],
        });
    };

    const updateCustomField = (fieldId, key, value) => {
        setFormData({
            ...formData,
            customFields: formData.customFields.map((f) =>
                f.id === fieldId ? { ...f, [key]: value } : f
            ),
        });
    };

    const removeCustomField = (fieldId) => {
        setFormData({
            ...formData,
            customFields: formData.customFields.filter((f) => f.id !== fieldId),
        });
    };


    const handleDelete = (event) => {
        setSelectedEvent(event);
        setModalMode("delete");
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        setEvents(events.filter((e) => e.id !== selectedEvent.id));
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
            const newEvent = {
                id: Date.now(),
                ...formData,
                image: imagePreview || "https://placehold.co/600x400/e2e8f0/1e293b?text=New+Event",
            };
            setEvents([newEvent, ...events]);
        } else if (modalMode === "edit") {
            setEvents(
                events.map((e) => (e.id === selectedEvent.id ? { ...e, ...formData, image: imagePreview || formData.image } : e))
            );
        }
        setModalMode("success");
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
                {events.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100 p-8">Belum ada kegiatan</div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                            <div className="w-full md:w-48 h-48 md:h-auto shrink-0">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </div>
                            <div className="flex-1 py-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wide">
                                        {event.category}
                                    </span>
                                    <span className="text-sm text-gray-400 flex items-center gap-1">
                                        📅 {event.date}
                                    </span>
                                    <span className="text-sm text-gray-400 flex items-center gap-1">
                                        🕒 {event.time}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{event.description}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">📍 {event.location}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center">
                                <button
                                    onClick={() => handleViewParticipants(event)}
                                    className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                    title="Lihat Pendaftar"
                                >
                                    👥
                                </button>
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
                )}
            </div>

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
                                : modalMode === "participants"
                                    ? `Data Pendaftar - ${selectedEvent?.title}`
                                    : "Berhasil"
                }
                maxWidth={modalMode === "participants" ? "max-w-4xl" : "max-w-md"}
            >
                {(modalMode === "add" || modalMode === "edit") && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Judul Kegiatan</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                placeholder="Contoh: Seminar Nasional"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                                        <p className="text-xs mt-1 text-gray-400">(Simulasi Upload)</p>
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
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                    placeholder="Contoh: Akademik"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tempat</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                    placeholder="Contoh: Aula Utama"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Kuota Peserta</label>
                            <input
                                type="number"
                                min="1"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                placeholder="Contoh: 100"
                                value={formData.quota}
                                onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        {/* Dynamic Custom Fields Section */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-bold text-gray-700">Form Pendaftaran Kustom</label>
                                <button
                                    type="button"
                                    onClick={addCustomField}
                                    className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors flex items-center gap-1"
                                >
                                    + Tambah Field
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs text-gray-500 mb-1">Deskripsi Form (opsional)</label>
                                <textarea
                                    rows="2"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black text-sm resize-none"
                                    placeholder="Petunjuk pengisian form pendaftaran untuk peserta..."
                                    value={formData.formDescription || ""}
                                    onChange={(e) => setFormData({ ...formData, formDescription: e.target.value })}
                                ></textarea>
                            </div>

                            {formData.customFields.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-4 bg-gray-50 rounded-xl">
                                    Belum ada field kustom. Klik "Tambah Field" untuk menambahkan.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {formData.customFields.map((field, index) => (
                                        <div key={field.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-xs font-bold text-gray-500 uppercase">Field #{index + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCustomField(field.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    🗑️ Hapus
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Label</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-black"
                                                        placeholder="Nama field"
                                                        value={field.label}
                                                        onChange={(e) => updateCustomField(field.id, "label", e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Tipe</label>
                                                    <select
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-black"
                                                        value={field.type}
                                                        onChange={(e) => updateCustomField(field.id, "type", e.target.value)}
                                                    >
                                                        <option value="text">Text</option>
                                                        <option value="number">Number</option>
                                                        <option value="email">Email</option>
                                                        <option value="select">Dropdown</option>
                                                        <option value="textarea">Textarea</option>
                                                    </select>
                                                </div>
                                            </div>
                                            {field.type === "select" && (
                                                <div className="mt-3">
                                                    <label className="block text-xs text-gray-500 mb-1">Opsi (pisahkan dengan koma)</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-black"
                                                        placeholder="Ya, Tidak"
                                                        value={field.options?.join(", ") || ""}
                                                        onChange={(e) => updateCustomField(field.id, "options", e.target.value.split(",").map(s => s.trim()))}
                                                    />
                                                </div>
                                            )}
                                            <div className="mt-3 flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id={`required-${field.id}`}
                                                    checked={field.required}
                                                    onChange={(e) => updateCustomField(field.id, "required", e.target.checked)}
                                                    className="rounded"
                                                />
                                                <label htmlFor={`required-${field.id}`} className="text-xs text-gray-600">Wajib diisi</label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all mt-4"
                        >
                            {modalMode === "add" ? "Simpan Kegiatan" : "Simpan Perubahan"}
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
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                )}

                {modalMode === "participants" && selectedEvent && (
                    <div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Nama Peserta</th>
                                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Tanggal Daftar</th>
                                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Jawaban Form</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(mockParticipants[selectedEvent.id] || []).length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-gray-400">
                                                Belum ada pendaftar untuk kegiatan ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        (mockParticipants[selectedEvent.id] || []).map((participant) => (
                                            <tr key={participant.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <div className="font-bold text-gray-900">{participant.name}</div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm text-gray-600">{participant.date}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col gap-1">
                                                        {Object.entries(participant.answers || {}).map(([key, value]) => (
                                                            <div key={key} className="text-xs">
                                                                <span className="font-semibold text-gray-500">{key}:</span> <span className="text-gray-700">{value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                            >
                                Tutup
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
                            Data kegiatan berhasil diperbarui.
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
