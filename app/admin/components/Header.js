"use client";

export default function Header({ onMenuClick }) {
    return (
        <header className="bg-white border-b border-gray-200 h-16 px-4 md:px-8 flex items-center gap-4 sticky top-0 z-30">
            <button
                onClick={onMenuClick}
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
            >
                <span className="text-2xl">☰</span>
            </button>
            <div>
                <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
            </div>
        </header>
    );
}
