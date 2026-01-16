"use client";

import { useState } from "react";
import Modal from "@/app/components/Modal";

export default function AdminManagementPage() {
    const [admins, setAdmins] = useState([
        { id: 1, name: "Himpunan Mahasiswa Informatika", username: "himif" },
        { id: 2, name: "Himpunan Mahasiswa Sistem Informasi", username: "hmsi" },
        { id: 3, name: "Himpunan Mahasiswa Teknik Komputer", username: "hmtk" },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    // Form states
    const [formData, setFormData] = useState({ name: "", username: "", password: "" });

    const handleAdd = () => {
        setFormData({ name: "", username: "", password: "" });
        setIsAddModalOpen(true);
    };

    const handleEdit = (admin) => {
        setSelectedAdmin(admin);
        setFormData({ name: admin.name, username: admin.username, password: "" });
        setIsEditModalOpen(true);
    };

    const handlePasswordChange = (admin) => {
        setSelectedAdmin(admin);
        setFormData({ name: admin.name, username: admin.username, password: "" });
        setIsChangePasswordModalOpen(true);
    };

    const handleDelete = (admin) => {
        setSelectedAdmin(admin);
        setIsDeleteModalOpen(true);
    };

    const submitAdd = (e) => {
        e.preventDefault();
        const newAdmin = {
            id: admins.length + 1,
            ...formData,
        };
        // Remove password from local state display for security (mock)
        const { password, ...adminData } = newAdmin;
        setAdmins([...admins, adminData]);
        setIsAddModalOpen(false);
    };

    const submitEdit = (e) => {
        e.preventDefault();
        // Remove password from local state display for security (mock)
        const { password, ...adminData } = formData;
        setAdmins(admins.map((a) => (a.id === selectedAdmin.id ? { ...a, ...adminData } : a)));
        setIsEditModalOpen(false);
    };

    const submitPasswordChange = (e) => {
        e.preventDefault();
        // In a real app, this would send an API request to update the password
        console.log(`Password for ${selectedAdmin.name} changed to: ${formData.password}`);
        setIsChangePasswordModalOpen(false);
    };

    const submitDelete = () => {
        setAdmins(admins.filter((a) => a.id !== selectedAdmin.id));
        setIsDeleteModalOpen(false);
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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">Nama Himpunan</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Username</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {admins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-gray-800 font-medium">{admin.name}</td>
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
                        ))}
                    </tbody>
                </table>
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
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: himif"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                            className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-md shadow-indigo-200"
                        >
                            Simpan
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
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                            className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-md shadow-indigo-200"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Change Password Modal */}
            <Modal isOpen={isChangePasswordModalOpen} onClose={() => setIsChangePasswordModalOpen(false)} title="Ganti Password Admin">
                <form onSubmit={submitPasswordChange} className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Mengganti password untuk: <span className="font-bold">{selectedAdmin?.name}</span></p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                            className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-md shadow-indigo-200"
                        >
                            Simpan Password
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Hapus Admin">
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Apakah Anda yakin ingin menghapus admin <span className="font-bold text-gray-900">{selectedAdmin?.name}</span>?
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
                            className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all font-medium shadow-md shadow-red-200"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
