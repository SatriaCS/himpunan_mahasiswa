"use client";
import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import Pagination from "../components/Pagination";

export default function MembersPage() {
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
    const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'delete'
    const [formData, setFormData] = useState({ nama: "",  jabatan: "", foto:null });
    const [successData, setSuccessData] = useState(null);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [membersList, setMembersList] = useState([]);
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5;
    // loading
    const [loadingData, setLoadingData] = useState(true);

    const fetchMembers = async (currentPage = 1) => {
        setLoadingData(true)

        const res = await fetch(`/api/admin/member?page=${currentPage}&limit=${limit}`,
            {
                cache: "no-store"
            }
        );
        const result = await res.json();
        
        setMembersList(result.data);
        setTotalPages(result.totalPages);

        // AUTO FIX PAGE
        if (currentPage > result.totalPages && result.totalPages > 0) {
            setCurrentPage(result.totalPages);
        }

        setLoadingData(false)
    };

    useEffect(() => {
        fetchMembers(currentPage);
    }, [currentPage]);

    const handleAdd = () => {
        setModalMode("add");
        setFormData({ nama: "", jabatan: "", foto: null });
        setImagePreview(null)
        setIsModalOpen(true);
    };

    const handleEdit = (member) => {
        setModalMode("edit");
        setEditingId(member.id);
        setFormData({ nama: member.nama, jabatan: member.jabatan, foto: null });
        if (member.foto) {
            setImagePreview(
                `/uploads/member/${member.username}/${member.foto}`
            );
        }        
        setIsModalOpen(true);
    };

    const handleDelete = (member) => {
        setMemberToDelete(member);
        setModalMode("delete");
        setIsModalOpen(true);
    };

    const confirmDelete = async() => {
        try {
            setLoading(true)
            const res = await fetch(
                `/api/admin/member?id=${memberToDelete.id}`,
                { method: "DELETE" }
            );

            const result = await res.json();

            if (!res.ok) {
                showError(result.message);
                return;
            }

            setIsModalOpen(false);
            showSuccess(result.message);
            setLoading(false)
        } catch (error) {
            showError(error.message);            
        }finally {
            fetchMembers(currentPage);
            setLoading(false);
        }
    };

    const handleSubmit = async(e) => {
        e.preventDefault();

        try {

            setLoading(true);

            const data = new FormData();
            data.append("nama", formData.nama);
            data.append("jabatan", formData.jabatan);
            data.append("foto", formData.foto);

            const res = await fetch("/api/admin/member", {
                method: "POST",
                body: data
            });

            const result = await res.json();

            if (!res.ok) {
                showError(result.message);
                return;
            }

            showSuccess(result.message);
            setFormData({ nama: "", jabatan: "", foto: null })
            setImagePreview(null)
            setIsModalOpen(false)

        } catch (error) {
            showError(error.message);
        } finally {
            fetchMembers(currentPage);
            setLoading(false);
        }
    };

    const handleSubmitEdit = async(e) => {
        e.preventDefault();

        try {

            setLoading(true);

            const data = new FormData();
            data.append("id", editingId);
            data.append("nama", formData.nama);
            data.append("jabatan", formData.jabatan);
            data.append("foto", formData.foto);

            const res = await fetch("/api/admin/member", {
                method: "PUT",
                body: data
            });

            const result = await res.json();

            if (!res.ok) {
                showError(result.message);
                return;
            }

            showSuccess(result.message);
            setFormData({ nama: "", jabatan: "", foto: null })
            setImagePreview(null)
            setIsModalOpen(false)

        } catch (error) {
            showError(error.message);
        } finally {
            fetchMembers(currentPage);
            setLoading(false);
        }
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

            <div className="bg-white rounded-2xl shadow-sm border pb-2 border-gray-100 overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="p-6">No</th>
                                <th className="p-6">Nama Lengkap</th>
                                <th className="p-6">Jabatan</th>
                                <th className="p-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loadingData ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10">
                                            <div className="flex justify-center items-center gap-2">
                                                <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-gray-500">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : membersList.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10 text-gray-500">
                                            Data belum tersedia
                                        </td>
                                    </tr>
                                ) : (
                                    membersList.map((member, index) => (
                                        <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-6 font-semibold text-gray-500">
                                                {(currentPage - 1) * limit + index + 1}
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    {member.foto ? (
                                                        <img
                                                            src={`/uploads/member/${member.username}/${member.foto}`}
                                                            alt={member.nama}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400 text-2xl">👤</span>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900">{member.nama}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-gray-600">{member.jabatan}</td>
                                            <td className="p-6 text-right">
                                                <div className="flex gap-2 justify-end">
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
                                                </div>                                                
                                            </td>
                                        </tr>
                                    )
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {membersList.length > 0 && 
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                }
            </div>

            {/* Modal Component */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    modalMode === "delete"
                            ? "Konfirmasi Hapus"
                            : modalMode === "add"
                                ? "Tambah Anggota Baru"
                                : "Edit Data Anggota"
                }
            >
                {modalMode === "delete" ? (
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
                                disabled={loading}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all"
                            >
                                {loading ? "loading... " : "hapus"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={modalMode === "add" ? handleSubmit : handleSubmitEdit } className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                placeholder="Contoh: Budi Santoso"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Jabatan</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                placeholder="Contoh: Ketua Himpunan"
                                value={formData.jabatan || ""}
                                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Foto Profil</label>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
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
                                                                setFormData({ ...formData, foto: file });

                                                                const previewUrl = URL.createObjectURL(file);
                                                                setImagePreview(previewUrl);
                                                            }
                                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all transform active:scale-95"
                            >
                                
                                {loading ? "loading... " : modalMode === "add" ? "Simpan Anggota" : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
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
