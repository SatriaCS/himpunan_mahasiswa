"use client";
import { useState, useEffect } from "react";
import Modal from "../../components/Modal";

export default function VisiMisiPage() {
    const [visi, setVisi] = useState("")
    const [misi, setMisi] = useState("")

    const [loading, setLoading] = useState(false)

    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);

    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
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

    async function fetchData(){
        try{
            setLoadingData(true);

            const res = await fetch("/api/admin/visi-misi");

            if (!res.ok) {
                    // Ambil pesan error dari backend
                    const errorData = await res.json(); 
                    // Lempar error agar masuk ke blok catch
                    throw new Error(errorData.message || `Gangguan. Silakan coba beberapa saat lagi.`);
            }

            const data = await res.json();   
            setVisi(data.visi ?? "");
            setMisi(data.misi ?? "");
        } catch (err) {
            alert(err.message)
        } finally {
            setLoadingData(false);
        }
    }

    const handleSave = async () => {
        setLoading(true);
        const res = await fetch("/api/admin/visi-misi",{
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                visi,
                misi
            })
        });

        const data = await res.json();

        if(res.ok){
            showSuccess(data.message);
        }else{
            showError(data.message);
        }
        fetchData()
        setLoading(false);
    };
    
    useEffect(() => {fetchData()},[])

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Visi & Misi</h1>
                    <p className="text-gray-500 mt-1">Kelola visi dan misi organisasi</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all"
                >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 max-w-3xl">
                {loadingData ? (
                                <div className="flex justify-center items-center gap-2">
                                    <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-gray-500">Memuat data...</span>
                                </div>
                            
                            ) : (
                                <div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            Visi Organisasi
                                        </label>
                                        <textarea
                                            value={visi  || ""}
                                            onChange={(e) => {setVisi(e.target.value)}}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all h-32 text-black"
                                            placeholder="Masukkan visi organisasi..."
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            Misi Organisasi
                                        </label>
                                        <textarea
                                            value={misi  || ""}
                                            onChange={(e) => {setMisi(e.target.value)}}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all h-64 text-black"
                                            placeholder="Masukkan misi organisasi..."
                                        ></textarea>
                                    </div>
                                </div>
                                
                )}
                
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
