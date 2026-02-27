import React, { useEffect, useState } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, description }: ConfirmModalProps) {
    const [shouldRender, setShouldRender] = useState(false);

    // Handle mounting/unmounting for animations
    useEffect(() => {
        if (isOpen) setShouldRender(true);
    }, [isOpen]);

    const handleAnimationEnd = () => {
        if (!isOpen) setShouldRender(false);
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"
                }`}
            onAnimationEnd={handleAnimationEnd}
            onClick={onClose}
        >
            <div
                className={`bg-zinc-900 border border-white/10 rounded-2xl p-6 w-[90%] max-w-md shadow-2xl transition-all duration-200 ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
                    }`}
                onClick={(e) => e.stopPropagation()} // Prevent clicking inside modal from closing it
            >
                <div className="flex flex-col gap-2 mb-6">
                    <h3 className="text-xl font-semibold text-zinc-100 tracking-wide">
                        {title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="flex justify-end items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white rounded-lg bg-transparent hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/10"
                    >
                        取消
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-500/90 hover:bg-red-500 shadow-sm transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                        确认清空
                    </button>
                </div>
            </div>
        </div>
    );
}
