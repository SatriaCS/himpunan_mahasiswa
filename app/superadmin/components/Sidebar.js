"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { name: "Dashboard", href: "/superadmin", icon: "📊" },
    { name: "Kelola Admin", href: "/superadmin/admins", icon: "👥" },
];

export default function Sidebar({ isOpen, onClose }) {
    const pathname = usePathname();

    const sidebarClasses = `
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out h-screen md:h-auto md:min-h-screen flex flex-col
        ${isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0 md:shadow-none"}
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
                    <h1 className="text-2xl font-bold text-indigo-700">Super Admin</h1>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 md:hidden"
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
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
                                            }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-200 bg-white shrink-0">
                    <Link
                        href="/login"
                    >
                        <button className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <span className="font-medium">Keluar</span>
                        </button>
                    </Link>
                </div>
            </aside>
        </>
    );
}
