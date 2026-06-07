"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Visi Misi", href: "/admin/visi-misi", icon: "🎯" },
    { name: "Dokumentasi", href: "/admin/dokumentasi", icon: "📷" },
    { name: "Anggota", href: "/admin/members", icon: "👥" },
    { name: "Kegiatan", href: "/admin/events", icon: "📅" },
    { name: "Berita", href: "/admin/news", icon: "📰" },
    { name: "Pengaturan", href: "/admin/settings", icon: "⚙️" },
];

export default function Sidebar({ isOpen, onClose }) {
    const pathname = usePathname();
    const handleLogout = async () => {
        await fetch("/api/logout", {
            method: "POST",
        });

        window.location.replace("/login");
    };
    const sidebarClasses = `
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out h-screen lg:h-auto lg:min-h-screen flex flex-col
        ${isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0 lg:shadow-none"}
    `;

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={sidebarClasses}>
                <div className="p-6 flex justify-between items-center shrink-0">
                    <h1 className="text-2xl font-bold text-blue-700">Dashboard</h1>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 lg:hidden"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto md:overflow-visible px-4 mt-2 mb-4 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={() => onClose()} // Close sidebar on click (mobile)
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-black ${isActive
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                            : "hover:bg-gray-50 hover:text-black"
                                            }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                        <li>
                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                    <span className="font-medium">Keluar</span>
                                </button>
                        </li>
                        
                    </ul>
                </nav>
            </aside>
        </>
    );
}
