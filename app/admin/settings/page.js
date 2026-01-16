"use client";
import { useState } from "react";
import Modal from "../../components/Modal";

export default function SettingsPage() {
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [himaData, setHimaData] = useState({
        nama: "Himpunan Mahasiswa Teknik Informatika",
        singkatan: "HIMA TI",
        email: "hima@ti.univ.ac.id",
        kontak: "081234567890",
    });
    const [userData, setUserData] = useState({
        username: "admin",
    });
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Valid dummy image URLs
    const [himaLogoPreview, setHimaLogoPreview] = useState("https://placehold.co/400x400/e2e8f0/1e293b?text=Logo");
    const [userPhotoPreview, setUserPhotoPreview] = useState("https://placehold.co/400x400/e2e8f0/1e293b?text=User");

    const handleHimaLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setHimaLogoPreview(objectUrl);
        }
    };

    const handleUserPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setUserPhotoPreview(objectUrl);
        }
    };

    const handleHimaSubmit = (e) => {
        e.preventDefault();
        setIsSuccessOpen(true);
    };

    const handleUserSubmit = (e) => {
        e.preventDefault();
        setIsSuccessOpen(true);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Konfirmasi password baru tidak cocok!");
            return;
        }
        setIsSuccessOpen(true);
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    };

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Pengaturan Dashboard</h1>
                <p className="text-gray-500 mt-1">Kelola informasi himpunan dan akun administrator</p>
            </div>

            <div className="grid gap-8">
                {/* Profil Hima */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            🏛️ Profil Hima
                        </h2>
                    </div>
                    <div className="p-8">
                        <form onSubmit={handleHimaSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-6">
                                    {/* Thumbnail / Logo Himpunan */}
                                    <div className="flex flex-col gap-2">
                                        <label className="block text-sm font-bold text-gray-700">Thumbnail / Logo Himpunan</label>
                                        <div className="relative w-full md:w-64 h-32 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 group">
                                            <img src={himaLogoPreview} alt="Logo" className="w-full h-full object-cover" />
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs text-center p-1">
                                                Ganti Thumbnail
                                                <input type="file" accept="image/*" className="hidden" onChange={handleHimaLogoChange} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">Upload logo/thumbnail resmi himpunan (Format: JPG, PNG. Aspect Ratio: Persegi Panjang).</p>
                                    </div>

                                    {/* Foto Profil Admin moved here */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 group shrink-0">
                                            <img src={userPhotoPreview} alt="User" className="w-full h-full object-cover" />
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] text-center p-1">
                                                Ubah
                                                <input type="file" accept="image/*" className="hidden" onChange={handleUserPhotoChange} />
                                            </label>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">Foto Profil Ketua/Admin</h3>
                                            <p className="text-xs text-gray-500 mt-1">Foto yang akan ditampilkan di dashboard.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Himpunan</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                        value={himaData.nama}
                                        onChange={(e) => setHimaData({ ...himaData, nama: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Singkatan</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                        value={himaData.singkatan}
                                        onChange={(e) => setHimaData({ ...himaData, singkatan: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Himpunan</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                        value={himaData.email}
                                        onChange={(e) => setHimaData({ ...himaData, email: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">No. Kontak / WhatsApp</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                        value={himaData.kontak}
                                        onChange={(e) => setHimaData({ ...himaData, kontak: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all"
                                >
                                    Simpan Profil Hima
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Profil Pengguna */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            👤 Profil Pengguna
                        </h2>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Username Section */}
                            <form onSubmit={handleUserSubmit} className="space-y-6 border-b lg:border-b-0 lg:border-r border-gray-100 pb-8 lg:pb-0 lg:pr-12">
                                {/* Photo removed from here */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                        value={userData.username}
                                        onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                                >
                                    Update Username
                                </button>
                            </form>

                            {/* Password Section */}
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Ganti Password</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Password Saat Ini"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black mb-3"
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    />
                                    <div className="grid gap-3">
                                        <input
                                            type="password"
                                            required
                                            placeholder="Password Baru"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        />
                                        <input
                                            type="password"
                                            required
                                            placeholder="Konfirmasi Password Baru"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 transition-all mt-4"
                                >
                                    Update Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <Modal
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                title="Berhasil"
            >
                <div className="text-center py-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform">
                        <span className="text-4xl">✅</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Perubahan Disimpan!</h4>
                    <p className="text-gray-500 mb-6">
                        Pengaturan akun Anda telah berhasil diperbarui.
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
