"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true);
        const res = await fetch("/api/login", {
            method:"POST",
            headers:{ "Content-Type":"application/json"},
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await res.json();

        if(res.ok){
            if(data.role === "super_admin"){
                window.location.href = "/superadmin";
            } 
            else if(data.role === "admin"){
                window.location.href = "/admin";
            }
        }else{
            alert(data.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-900 to-indigo-900 z-0"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>

            <div className="relative z-10 w-full max-w-md p-6">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 text-3xl mb-4 shadow-inner">
                            🔐
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Login</h1>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all bg-gray-50 focus:bg-white text-black"
                                placeholder="Masukkan username..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all bg-gray-50 focus:bg-white text-black"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                "Masuk Dashboard"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-400 text-xs mt-8">
                    &copy; 2026 Portal Himpunan Mahasiswa.
                </p>
            </div>
        </div>
    );
}
