"use client";

import React, { useState } from "react";
import * as htmlToImage from "html-to-image";
import { useTierStore } from "@/store/useTierStore";
import ConfirmModal from "./ConfirmModal";

export default function Header() {
    const [isExporting, setIsExporting] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const clearAll = useTierStore((state) => state.clearAll);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const node = document.getElementById("tier-board-container");
            if (!node) {
                alert("无法找到排名区域以导出。");
                return;
            }

            // Temporarily add class to hide placeholders for a clean screenshot
            node.classList.add("is-exporting");

            // We clone the node or rely on html-to-image to render it. 
            // pixelRatio 2 ensures a high resolution "Retina" crispness.
            const dataUrl = await htmlToImage.toPng(node, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: "#09090b", // Match the deep dark theme background
                filter: (el) => {
                    // If we had internal UI controls, we could filter by class here
                    return true;
                },
            });

            // Create an invisible anchor to trigger the download
            const link = document.createElement("a");
            link.download = `RankIt-TierList-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Failed to export image:", err);
            alert("导出图片失败，请稍后重试。");
        } finally {
            const node = document.getElementById("tier-board-container");
            if (node) {
                node.classList.remove("is-exporting");
            }
            setIsExporting(false);
        }
    };

    return (
        <header className="flex h-20 shrink-0 items-center justify-between px-8 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
            <h1 className="text-lg font-semibold tracking-wider text-zinc-100 flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-gradient-to-b from-zinc-300 to-zinc-600 shadow-sm" />
                RankIt
            </h1>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="rounded-full bg-white/[0.05] text-zinc-400 hover:text-red-400 hover:bg-red-500/10 p-2.5 transition-all border border-transparent hover:border-red-500/20 active:scale-95 flex items-center justify-center opacity-70 hover:opacity-100"
                    title="清空画板"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>

                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="rounded-full bg-zinc-100 text-zinc-900 hover:bg-white px-5 py-2 text-sm font-semibold transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isExporting ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            生成中...
                        </>
                    ) : (
                        "导出图片"
                    )}
                </button>
            </div>

            <ConfirmModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={() => {
                    clearAll();
                }}
                title="清空画板"
                description="确定要清空所有已排名的素材和自定义层级吗？此操作无法撤销。"
            />
        </header>
    );
}
