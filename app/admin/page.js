import Link from "next/link";

export default function AdminDashboard() {
    const shortcuts = [
        { title: "Kelola Anggota", icon: "👥", href: "/admin/members", color: "bg-blue-50 text-blue-600" },
        { title: "Kelola Berita", icon: "📰", href: "/admin/news", color: "bg-green-50 text-green-600" },
        { title: "Kelola Kegiatan", icon: "📅", href: "/admin/events", color: "bg-purple-50 text-purple-600" },
        { title: "Update Setting", icon: "⚙️", href: "/admin/settings", color: "bg-orange-50 text-orange-600" },
    ];

    return (
        <div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang kembali, Admin! 👋</h1>
                <p className="text-gray-500">Semoga harimu menyenangkan.</p>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-6">Menu Cepat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {shortcuts.map((item, index) => (
                    <Link href={item.href} key={index}>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <span className="text-2xl">{item.icon}</span>
                            </div>
                            <h3 className="font-bold text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">Akses menu {item.title.toLowerCase()}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
