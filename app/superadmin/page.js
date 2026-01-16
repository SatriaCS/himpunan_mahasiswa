import Link from "next/link";

export default function SuperAdminDashboard() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Superadmin</h1>
                <p className="text-gray-600 mt-2">Selamat datang kembali, Superadmin!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/superadmin/admins">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                                👥
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Admin</p>
                                <h3 className="text-2xl font-bold text-gray-800">12</h3>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
