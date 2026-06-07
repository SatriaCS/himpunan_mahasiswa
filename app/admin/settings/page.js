"use client";
import { useState, useEffect } from "react";
import Modal from "../../components/Modal";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [loadingUsername, setLoadingUsername] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

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

    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [himaData, setHimaData] = useState({
        nama: "",
        singkatan: "",
        visi: "",
        misi: "",
        email: "",
        no_kontak: "",
        username: "",
        logo: null,
        thumbnail: null
    });
    const [userUsername, setUserUsername] = useState("");
    const [userPasswordData, setUserPasswordData] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    // Valid dummy image URLs
    const [himaThumbnailPreview, setHimaThumbnailPreview] = useState();
    const [logoPhotoPreview, setLogoPhotoPreview] = useState();
    // loading
    const [loadingData, setLoadingData] = useState(true);
    const [loadingDataPengguna, setLoadingDataPengguna] = useState(true);

    const fetchSetting = async () => {
        setLoadingData(true)

        const res = await fetch("/api/admin/setting");
        const data = await res.json();
        
        const hima = (data[0]);
        setHimaData({
            nama: hima.nama ?? "",
            singkatan: hima.singkatan ?? "",
            visi: hima.visi ?? "",
            misi: hima.misi ?? "",
            email: hima.email ?? "",
            no_kontak: hima.no_kontak ?? "",
            username: hima.username ?? "",
            logo: hima.logo ?? null,
            thumbnail: hima.thumbnail ?? null,
        });

        setUserUsername(hima.username)

        setLoadingData(false)
    };

    const fetchPengguna = async () => {
        setLoadingDataPengguna(true)

        const res = await fetch("/api/admin/setting");
        const data = await res.json();
        const hima = (data[0]);

        setUserUsername(hima.username)

        setLoadingDataPengguna(false)
    };

    useEffect(() => {
        fetchSetting();
        fetchPengguna();
    }, []);

    const handleHimaThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);

            setHimaData(prev => ({
                ...prev,
                thumbnail: file
            }));

            setHimaThumbnailPreview(objectUrl);
        }
    };

    const handleHimaLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);

            setHimaData(prev => ({
                ...prev,
                logo: file
            }));

            setLogoPhotoPreview(objectUrl);
        }
    };

    const handleHimaSubmit = async(e) => {
        e.preventDefault();

        try {

            setLoading(true);

            const data = new FormData();
            data.append("nama", himaData.nama);
            data.append("singkatan", himaData.singkatan);
            data.append("email", himaData.email);
            data.append("no_kontak", himaData.no_kontak);
            if (himaData.logo instanceof File) {
                data.append("logo", himaData.logo);
            }

            if (himaData.thumbnail instanceof File) {
                data.append("thumbnail", himaData.thumbnail);
            }

            const res = await fetch("/api/admin/setting", {
                method: "PUT",
                body: data
            });

            const result = await res.json();

            if (!res.ok) {
                showError(result.message);
                return;
            }

            showSuccess(result.message);
        } catch (error) {
            showError(error.message);
        } finally {
            setHimaThumbnailPreview(null);
            setLogoPhotoPreview(null);
            await fetchSetting();
            setLoading(false);
        }
    };

    const handleUserSubmit = async(e) => {
        e.preventDefault();
        try {

            setLoadingUsername(true);

            const res = await fetch("/api/admin/setting/update-username",{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    username : userUsername,
                })
            });

            const result = await res.json();

            if (!res.ok) {
                showError(result.message);
                return;
            }

            showSuccess(result.message);
        } catch (error) {
            showError(error.message);
        } finally {
            fetchPengguna();
            setLoadingUsername(false);
        }
    };

    const handlePasswordSubmit = async(e) => {
        e.preventDefault();
        if (userPasswordData.newPassword !== userPasswordData.confirmPassword) {
            alert("Konfirmasi password baru tidak cocok!");
            return;
        }

        try {

            setLoadingPassword(true);

            const res = await fetch("/api/admin/setting/update-password",{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    password : userPasswordData.confirmPassword,
                })
            });

            const result = await res.json();

            if (!res.ok) {
                showError(result.message);
                return;
            }

            showSuccess(result.message);
            setUserPasswordData({newPassword: "", confirmPassword: "" });
        } catch (error) {
            showError(error.message);
        } finally {
            fetchPengguna();
            setLoadingPassword(false);
        }
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
                    {loadingData ? (
                                <div className="flex my-2 justify-center items-center gap-2">
                                    <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-gray-500">Memuat data...</span>
                                </div>
                            )  : (
                                <div className="p-8">
                                    <form onSubmit={handleHimaSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 space-y-6">
                                                {/* Thumbnail / Logo Himpunan */}
                                                <div className="flex flex-col gap-2">
                                                    <label className="block text-sm font-bold text-gray-700">Thumbnail</label>
                                                    <div className="relative w-64 h-32 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 group">
                                                        {(himaThumbnailPreview || himaData?.thumbnail) ? (

                                                            <img
                                                                src={
                                                                    himaThumbnailPreview ||
                                                                    `/uploads/hima/${himaData.username}/${himaData.thumbnail}`
                                                                }
                                                                alt="Thumbnail"
                                                                className="w-full h-full object-contain"
                                                            />

                                                        ) : (

                                                            /* ICON PLACEHOLDER */
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                                <span className="text-4xl">🖼️</span>
                                                                <p className="text-xs mt-1">Belum ada gambar</p>
                                                                <p className="text-xs mt-1 text-gray-400">(Tipe: JPG, PNG, Max 5MB)</p>
                                                            </div>

                                                        )}                                           
                                                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs text-center p-1">
                                                            Ganti Thumbnail
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleHimaThumbnailChange} />
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Foto Profil Admin moved here */}
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 group shrink-0">
                                                        {(logoPhotoPreview || himaData?.logo) ? (

                                                            <img
                                                                src={
                                                                    logoPhotoPreview ||
                                                                    `/uploads/hima/${himaData.username}/${himaData.logo}`
                                                                }
                                                                alt="Thumbnail"
                                                                className="w-full h-full object-cover"
                                                            />

                                                        ) : (

                                                            /* ICON PLACEHOLDER */
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                                <p className="text-[8px] mt-1">Belum ada gambar</p>
                                                            </div>

                                                        )}
                                                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] text-center p-1">
                                                            Ubah
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleHimaLogoChange} />
                                                        </label>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-900">Logo hima</h3>
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
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                                    value={himaData.singkatan}
                                                    onChange={(e) => setHimaData({ ...himaData, singkatan: e.target.value })}
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Himpunan</label>
                                                <input
                                                    type="email"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                                    value={himaData.email}
                                                    onChange={(e) => setHimaData({ ...himaData, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">No. Kontak / WhatsApp</label>
                                                <input
                                                    type="text"                                                    
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                                    value={himaData.no_kontak}
                                                    onChange={(e) => setHimaData({ ...himaData, no_kontak: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all"
                                            >
                                                {loading ? "loading..." : "Simpan Profil Hima"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )
                    }
                </div>

                {/* Profil Pengguna */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            👤 Profil Pengguna
                        </h2>
                    </div>
                    <div className="p-8">
                        {loadingDataPengguna ? (
                                <div className="flex my-2 justify-center items-center gap-2">
                                    <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-gray-500">Memuat data...</span>
                                </div>
                            )  : (
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
                                                value={userUsername}
                                                onChange={(e) => setUserUsername(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loadingUsername}
                                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                                        >
                                            {loadingUsername ? "loading..." : "Update Username"}
                                        </button>
                                    </form>

                                    {/* Password Section */}
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        <div>
                                            <div className="grid gap-3">
                                                <input
                                                    type="password"
                                                    required
                                                    placeholder="Password Baru"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                                    value={userPasswordData.newPassword}
                                                    onChange={(e) => setUserPasswordData({ ...userPasswordData, newPassword: e.target.value })}
                                                />
                                                <input
                                                    type="password"
                                                    required
                                                    placeholder="Konfirmasi Password Baru"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-black"
                                                    value={userPasswordData.confirmPassword}
                                                    onChange={(e) => setUserPasswordData({ ...userPasswordData, confirmPassword: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loadingPassword}
                                            className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 transition-all mt-4"
                                        >
                                            {loadingPassword ? "loading..." : "Update Password"}
                                        </button>
                                    </form>
                                </div>
                            )
                    }
                        
                    </div>
                </div>
            </div>

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
