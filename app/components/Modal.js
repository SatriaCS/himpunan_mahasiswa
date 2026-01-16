"use client";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
            <div className={`${maxWidth} w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200`}>
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
