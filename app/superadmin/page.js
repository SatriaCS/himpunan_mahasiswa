"use client";
import Link from "next/link";
import { useState,useEffect } from "react";

export default function SuperAdminDashboard() {
    const [Admins,setAdmins] = useState(0)
    // loading
    const [loadingData, setLoadingData] = useState(true);

    async function fetchData(){
        setLoadingData(true);
        const res = await fetch("/api/super-admin/dashboard");
        const data = await res.json();   
        setAdmins(data.total_data);
        setLoadingData(false);
    }

    useEffect(() => {fetchData()},[])
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Superadmin</h1>
                <p className="text-gray-600 mt-2">Selamat datang kembali, Superadmin!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loadingData ? (
                                <div className="flex justify-center items-center gap-2">
                                    <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-gray-500">Memuat data...</span>
                                </div>
                            
                            ) : (
                                <Link href="/superadmin/admins">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                                                👥
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Total Admin</p>
                                                <h3 className="text-2xl font-bold text-gray-800">{Admins}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                )}
                
            </div>
        </div>
    );
}
