"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const shouldHideLayout = pathname.startsWith("/admin") || pathname.startsWith("/superadmin") || pathname === "/login";

    return (
        <>
            {!shouldHideLayout && <Navbar />}
            <main className={`flex-grow ${shouldHideLayout ? "bg-gray-100 min-h-screen" : ""}`}>
                {children}
            </main>
            {!shouldHideLayout && <Footer />}
        </>
    );
}
