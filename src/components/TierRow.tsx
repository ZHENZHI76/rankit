import React, { useState, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useTierStore } from "@/store/useTierStore";
import type { Tier, Item } from "@/store/useTierStore";
import SortableItem from "./SortableItem";

interface TierRowProps {
    tier: Tier;
    items: Item[];
}

export default function TierRow({ tier, items }: TierRowProps) {
    const updateTierLabel = useTierStore((state) => state.updateTierLabel);
    const addTier = useTierStore((state) => state.addTier);
    const removeTier = useTierStore((state) => state.removeTier);

    const [editingLabel, setEditingLabel] = useState(tier.label);

    // Sync local state if external state changes
    useEffect(() => {
        setEditingLabel(tier.label);
    }, [tier.label]);

    const handleLabelBlur = () => {
        if (editingLabel.trim() !== "") {
            updateTierLabel(tier.id, editingLabel);
        } else {
            setEditingLabel(tier.label); // Revert on empty
        }
    };

    const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        }
    };

    const handleInsertAbove = () => {
        addTier(tier.order, {
            label: "NEW",
            bgClass: "bg-zinc-800",
            textClass: "text-zinc-300 font-bold",
            borderClass: "border-zinc-700/50",
        });
    };

    const handleInsertBelow = () => {
        addTier(tier.order + 1, {
            label: "NEW",
            bgClass: "bg-zinc-800",
            textClass: "text-zinc-300 font-bold",
            borderClass: "border-zinc-700/50",
        });
    };

    const { setNodeRef, isOver } = useDroppable({
        id: tier.id,
        data: {
            type: "Tier",
            tier,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={`group relative flex flex-col sm:flex-row min-h-[120px] rounded-2xl bg-white/[0.02] border overflow-hidden shadow-sm backdrop-blur-md transition-all ${isOver
                ? "border-white/20 shadow-[0_0_25px_rgba(255,255,255,0.03)] bg-white/[0.04]"
                : "border-white/5 hover:bg-white/[0.03]"
                }`}
        >
            {/* Inline Tier Label */}
            <div
                className={`w-full sm:w-32 shrink-0 flex items-center justify-center font-semibold text-2xl tracking-widest ${tier.bgClass} ${tier.textClass} sm:border-r ${tier.borderClass} border-b sm:border-b-0 py-4 sm:py-0 transition-colors`}
            >
                <input
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onBlur={handleLabelBlur}
                    onKeyDown={handleLabelKeyDown}
                    className="w-full h-full bg-transparent text-center focus:outline-none placeholder:text-white/20"
                    maxLength={10}
                />
            </div>

            {/* Tier Drop Zone */}
            <div className="flex-1 p-5 pr-16 flex flex-wrap gap-4 items-start content-start min-h-[120px]">
                {items.length === 0 ? (
                    <div className="tier-row-placeholder w-full h-full min-h-[80px] rounded-xl flex items-center justify-center pointer-events-none transition-colors border border-transparent">
                        <span
                            className={`text-sm tracking-wide transition-colors ${isOver ? "text-zinc-600" : "text-zinc-700"
                                }`}
                        >
                            此时拖拽至此
                        </span>
                    </div>
                ) : (
                    <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                        {items.map((item) => (
                            <SortableItem key={item.id} item={item} />
                        ))}
                    </SortableContext>
                )}
            </div>

            {/* Hover Actions Menu */}
            <div className="absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-zinc-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                <button
                    onClick={handleInsertAbove}
                    className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                    title="在上方插入一行"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </button>
                <button
                    onClick={() => removeTier(tier.id)}
                    className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-white/10 transition-colors"
                    title="删除该行（图片退回素材池）"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                <button
                    onClick={handleInsertBelow}
                    className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                    title="在下方插入一行"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
