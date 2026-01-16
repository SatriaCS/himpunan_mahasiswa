"use client";
import { useState } from "react";
import Modal from "../../components/Modal";

export default function MembersPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'delete', 'success'
    const [formData, setFormData] = useState({ name: "", nim: "", role: "" });
    const [successData, setSuccessData] = useState(null);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [membersList, setMembersList] = useState([
        { id: 1, name: "Budi Santoso", nim: "210001", role: "Ketua", status: "Aktif", image: "https://placehold.co/100x100/3b82f6/ffffff?text=BS" },
        { id: 2, name: "Siti Aminah", nim: "210002", role: "Sekretaris", status: "Aktif", image: "https://placehold.co/100x100/ec4899/ffffff?text=SA" },
        { id: 3, name: "Rudi Hermawan", nim: "210003", role: "Anggota", status: "Tidak Aktif", image: "https://placehold.co/100x100/10b981/ffffff?text=RH" },
        { id: 4, name: "Dewi Putri", nim: "210004", role: "Anggota", status: "Aktif", image: "https://placehold.co/100x100/f59e0b/ffffff?text=DP" },
    ]);

    const handleAdd = () => {
        setModalMode("add");
        setEditingId(null);
        setFormData({ name: "", nim: "", role: "", image: "" });
        setIsModalOpen(true);
    };

    const handleEdit = (member) => {
        setModalMode("edit");
        setEditingId(member.id);
        setFormData({ name: member.name, nim: member.nim, role: member.role, image: member.image || "" });
        setIsModalOpen(true);
    };

    const handleDelete = (member) => {
        setMemberToDelete(member);
        setModalMode("delete");
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        setMembersList(membersList.filter((m) => m.id !== memberToDelete.id));
        setSuccessData({ mode: "delete" });
        setModalMode("success");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (modalMode === "add") {
            const newId = membersList.length > 0 ? Math.max(...membersList.map((m) => m.id)) + 1 : 1;
            const newMember = {
                ...formData,
                id: newId,
                status: "Aktif",
                image: formData.image || `https://placehold.co/100x100/3b82f6/ffffff?text=${formData.name.charAt(0)}${formData.name.split(' ')[1]?.charAt(0) || ''}`
            };
            setMembersList([...membersList, newMember]);
        } else if (modalMode === "edit") {
            setMembersList(
                membersList.map((m) => (m.id === editingId ? { ...m, ...formData } : m))
            );
        }

        setSuccessData({ ...formData, mode: modalMode });
        setModalMode("success");
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Anggota</h1>
                    <p className="text-gray-500 mt-1">Kelola data anggota himpunan mahasiswa</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                >
                    <span>+</span> Tambah Anggota
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                            <th className="p-6">Nama Lengkap</th>
                            <th className="p-6">NIM</th>
                            <th className="p-6">Jabatan</th>
                            <th className="p-6 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {membersList.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={member.image || `https://placehold.co/100x100/3b82f6/ffffff?text=${member.name.charAt(0)}`}
                                            alt={member.name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900">{member.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 text-gray-600 font-mono">{member.nim}</td>
                                <td className="p-6 text-gray-600">{member.role}</td>
                                <td className="p-6 text-right">
                                    <button
                                        onClick={() => handleEdit(member)}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member)}
                                        className="text-red-600 hover:text-red-800 font-medium text-sm ml-4"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Component */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    modalMode === "success"
                        ? "Berhasil!"
                        : modalMode === "delete"
                            ? "Konfirmasi Hapus"
                            : modalMode === "add"
                                ? "Tambah Anggota Baru"
                                : "Edit Data Anggota"
                }
            >
                {modalMode === "success" ? (
                    <div className="text-center py-4">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform">
                            <span className="text-4xl">✅</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                            {successData?.mode === "delete"
                                ? "Data Berhasil Dihapus!"
                                : successData?.mode === "add"
                                    ? "Anggota Berhasil Ditambahkan!"
                                    : "Data Berhasil Diupdate!"}
                        </h4>
                        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4 text-left space-y-2">
                            {successData?.mode !== "delete" && (
                                <>
                                    <div className="flex justify-between">
                                        <span>Nama:</span>
                                        <span className="font-bold text-gray-900">{successData?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>NIM:</span>
                                        <span className="font-mono text-gray-900">{successData?.nim}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Jabatan:</span>
                                        <span className="font-medium text-blue-600">{successData?.role}</span>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="mt-8 w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all"
                        >
                            Tutup
                        </button>
                    </div>
                ) : modalMode === "delete" ? (
                    <div className="text-center py-4">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Apakah Anda Yakin?</h4>
                        <p className="text-gray-500 mb-8">
                            Data yang dihapus tidak dapat dikembalikan lagi.
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
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                placeholder="Contoh: Budi Santoso"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">NIM</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                placeholder="Contoh: 21012345"
                                value={formData.nim}
                                onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Jabatan</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                placeholder="Contoh: Ketua Himpunan"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Foto Profil</label>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {formData.image ? (
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-2xl">👤</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({ ...formData, image: reader.result });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Upload foto profil (opsional)</p>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all transform active:scale-95"
                            >
                                {modalMode === "add" ? "Simpan Anggota" : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
