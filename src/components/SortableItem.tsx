import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Item } from "@/store/useTierStore";

interface SortableItemProps {
    item: Item;
}

export default function SortableItem({ item }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
        data: {
            type: "Item",
            item,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // When tearing the item away from its original spot, leave a hollow placeholder
    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-24 h-24 rounded-2xl border border-dashed border-white/20 bg-white/5 opacity-50 flex items-center justify-center text-xs font-medium text-white/30"
            >
                {/* Placeholder styling indicating original position */}
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
        relative w-24 h-24 rounded-2xl shadow-lg border border-white/10 bg-zinc-800 flex items-center justify-center overflow-hidden
        cursor-grab active:cursor-grabbing hover:border-white/20 transition-all hover:bg-zinc-700
      `}
        >
            {item.imageUrl.startsWith("bg-") ? (
                <div className={`w-full h-full ${item.imageUrl}`} />
            ) : item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={item.imageUrl}
                    alt={`Item ${item.id}`}
                    className="w-full h-full object-cover pointer-events-none"
                />
            ) : (
                <span className="text-xs font-medium text-zinc-500 pointer-events-none tracking-wider">Img</span>
            )}
        </div>
    );
}
