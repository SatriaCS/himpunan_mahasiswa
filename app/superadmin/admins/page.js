"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import Pagination from "../components/Pagination";

export default function AdminManagementPage() {
    const [admins, setAdmins] = useState([ ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [idAkun, setIdAkun] = useState()
    const [nama, setNama] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);

    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5;
    // loading
    const [loadingData, setLoadingData] = useState(true);

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

    async function fetchData(currentPage = 1) {
        setLoadingData(true);

        const res = await fetch(
            `/api/super-admin/akun-admin?page=${currentPage}&limit=${limit}`,
            {
                cache: "no-store"
            }
        );

        const result = await res.json();
        setAdmins(result.data);
        setTotalPages(result.totalPages);
        // AUTO FIX PAGE
        if (currentPage > result.totalPages && result.totalPages > 0) {
            setCurrentPage(result.totalPages);
        }

        setLoadingData(false);
    }

    useEffect(() => {fetchData(currentPage)},[currentPage])

    const handleAdd = () => {
        setNama("")
        setUsername("")
        setPassword("")
        setIsAddModalOpen(true);
    };

    const handleEdit = (admin) => {
        setIdAkun(admin.id_akun)
        setNama(admin.nama)
        setUsername(admin.username)
        setIsEditModalOpen(true);
    };

    const handlePasswordChange = (admin) => {
        setPassword("")
        setNama(admin.nama);
        setIdAkun(admin.id_akun)
        setIsChangePasswordModalOpen(true);
    };

    const handleDelete = (admin) => {
        setNama(admin.nama);
        setIdAkun(admin.id_akun)
        setIsDeleteModalOpen(true);
    };

    const submitAdd = async (e) => {
        e.preventDefault()
        setLoading(true);

        const res = await fetch("/api/super-admin/akun-admin",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                username,
                password,
                nama,
            })
        });

        const data = await res.json();

        if(res.ok){
            showSuccess(data.message);
            setNama("")
            setUsername("")
            setPassword("")
            setIsAddModalOpen(false);
        }else{
            showError(data.message);
        }
        fetchData(currentPage)
        setLoading(false);
    };

    const submitEdit = async(e) => {
        e.preventDefault()
        setLoading(true);        
        
        const res = await fetch("/api/super-admin/akun-admin",{
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                id_akun: idAkun,
                username,
                nama
            })
        });

        const data = await res.json();

        if(res.ok){
            showSuccess(data.message);
            setIdAkun("")
            setNama("")
            setUsername("")
            setIsEditModalOpen(false);
        }else{
            showError(data.message);
        }
        fetchData(currentPage)
        setLoading(false);
    };

    const submitPasswordChange = async(e) => {
        e.preventDefault()
        setLoading(true);       

        const res = await fetch("/api/super-admin/akun-admin/edit-password",{
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                id_akun: idAkun,
                password
            })
        });

        const data = await res.json();

        if(res.ok){
            showSuccess(data.message);
            setIdAkun("")
            setNama("")
            setIsChangePasswordModalOpen(false);
            setPassword("")
        }else{
            showError(data.message);
        }
        fetchData(currentPage)
        setLoading(false);
    };

    const submitDelete = async(e) => {
        e.preventDefault()
        setLoading(true);

        const res = await fetch("/api/super-admin/akun-admin",{
            method:"DELETE",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                id_akun: idAkun
            })
        });

        const data = await res.json();

        if(res.ok){
            showSuccess(data.message);
            setIdAkun("")
            setNama("")
            setIsDeleteModalOpen(false);
        }else{
            showError(data.message);
        }
        fetchData(currentPage)
        setLoading(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Admin</h1>
                    <p className="text-gray-600 mt-2">Atur akun admin himpunan mahasiswa.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all font-medium flex items-center gap-2"
                >
                    <span>+</span> Tambah Admin
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden py-2">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600">No</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Nama Himpunan</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Username</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingData ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10">
                                            <div className="flex justify-center items-center gap-2">
                                                <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-gray-500">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : admins.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10 text-gray-500">
                                            Data belum tersedia
                                        </td>
                                    </tr>
                                ) : (
                                    admins.map((admin,index) => (
                                        <tr key={admin.id_akun} className="hover:bg-gray-50/50 transition-colors">
                                            {/* NOMOR */}
                                            <td className="px-6 py-4 text-gray-600">
                                                {(currentPage - 1) * limit + index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-gray-800 font-medium">{admin.nama}</td>
                                            <td className="px-6 py-4 text-gray-600">{admin.username}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleEdit(admin)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handlePasswordChange(admin)}
                                                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                                                        title="Ganti Password"
                                                    >
                                                        🔐
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(admin)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Hapus"
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
                
                {admins.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
               
            </div>

            {/* Add Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah Admin Baru">
                <form onSubmit={submitAdd} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Himpunan</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Himpunan Mahasiswa Informatika"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: himif"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-md shadow-indigo-200"
                        >
                             {loading ? "Menyimpan..." : "Tambah Akun"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Admin">
                <form onSubmit={submitEdit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Himpunan</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-md shadow-indigo-200"
                        >
                            {loading ? "Mengubah..." : "Simpan perubahan"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Change Password Modal */}
            <Modal isOpen={isChangePasswordModalOpen} onClose={() => setIsChangePasswordModalOpen(false)} title="Ganti Password Admin">
                <form onSubmit={submitPasswordChange} className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Mengganti password untuk: <span className="font-bold">{nama}</span></p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsChangePasswordModalOpen(false)}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-md shadow-indigo-200"
                        >
                            {loading ? "Menyimpan..." : "Simpan Password"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Hapus Admin">
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Apakah Anda yakin ingin menghapus admin <span className="font-bold text-gray-900">{nama}</span>?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all font-medium"
                        >
                            Batal
                        </button>
                        <button
                            onClick={submitDelete}
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all font-medium shadow-md shadow-red-200"
                        >
                            {loading ? "Menghapus..." : "Hapus"}
                        </button>
                    </div>
                </div>
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
