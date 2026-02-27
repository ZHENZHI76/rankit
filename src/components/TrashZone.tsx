import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface TrashZoneProps {
    isDragging: boolean;
}

export default function TrashZone({ isDragging }: TrashZoneProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: "trash-zone",
        data: {
            type: "TrashZone",
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={`fixed bottom-10 right-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 z-50 shadow-lg ${!isDragging
                    ? "opacity-50 bg-zinc-900 border border-zinc-700/50 scale-100"
                    : isOver
                        ? "opacity-100 bg-red-600 border border-red-400 scale-125 shadow-red-500/50 animate-pulse"
                        : "opacity-100 bg-zinc-900 border-2 border-red-500/50 scale-110"
                }`}
            title="拖拽到此处删除图片"
        >
            <svg
                className={`w-7 h-7 transition-colors ${isOver ? "text-white" : isDragging ? "text-red-400" : "text-zinc-500"
                    }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={isOver ? 2.5 : 2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
            </svg>
        </div>
    );
}
