"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-h-screen w-full">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
