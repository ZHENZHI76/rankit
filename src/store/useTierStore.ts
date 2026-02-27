import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Tier {
    id: string;
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    order: number;
}

export interface Item {
    id: string;
    imageUrl: string;
    tierId: string | null;
}

interface TierStoreState {
    tiers: Tier[];
    items: Item[];
    moveItem: (itemId: string, targetTierId: string | null) => void;
    addItem: (imageUrl: string) => void;
    updateTier: (tierId: string, updates: Partial<Tier>) => void;
    updateTierLabel: (tierId: string, label: string) => void;
    addTier: (tierIndex: number, newTier: Omit<Tier, "id" | "order">) => void;
    removeTier: (tierId: string) => void;
    deleteItem: (itemId: string) => void;
    clearAll: () => void;
}

const initialTiers: Tier[] = [
    {
        id: "S",
        label: "S",
        bgClass: "bg-red-950/30",
        textClass: "text-red-400 font-bold",
        borderClass: "border-red-900/30",
        order: 0,
    },
    {
        id: "A",
        label: "A",
        bgClass: "bg-orange-950/30",
        textClass: "text-orange-400 font-bold",
        borderClass: "border-orange-900/30",
        order: 1,
    },
    {
        id: "B",
        label: "B",
        bgClass: "bg-yellow-950/30",
        textClass: "text-yellow-400 font-bold",
        borderClass: "border-yellow-900/30",
        order: 2,
    },
    {
        id: "C",
        label: "C",
        bgClass: "bg-green-950/30",
        textClass: "text-green-400 font-bold",
        borderClass: "border-green-900/30",
        order: 3,
    },
    {
        id: "D",
        label: "D",
        bgClass: "bg-blue-950/30",
        textClass: "text-blue-400 font-bold",
        borderClass: "border-blue-900/30",
        order: 4,
    },
];

export const useTierStore = create<TierStoreState>()(
    persist(
        (set) => ({
            tiers: initialTiers,
            items: [],

            moveItem: (itemId, targetTierId) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === itemId ? { ...item, tierId: targetTierId } : item
                    ),
                })),

            addItem: (imageUrl) =>
                set((state) => ({
                    items: [
                        ...state.items,
                        {
                            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            imageUrl,
                            tierId: null,
                        },
                    ],
                })),

            updateTier: (tierId, updates) =>
                set((state) => ({
                    tiers: state.tiers.map((tier) =>
                        tier.id === tierId ? { ...tier, ...updates } : tier
                    ),
                })),

            updateTierLabel: (tierId, label) =>
                set((state) => ({
                    tiers: state.tiers.map((tier) =>
                        tier.id === tierId ? { ...tier, label } : tier
                    ),
                })),

            addTier: (tierIndex, newTierProps) =>
                set((state) => {
                    const newTierId = `tier-${Date.now()}`;
                    const newTier: Tier = {
                        ...newTierProps,
                        id: newTierId,
                        order: tierIndex,
                    };

                    const updatedTiers = [...state.tiers];
                    updatedTiers.splice(tierIndex, 0, newTier);

                    // Re-calculate orders
                    const normalizedTiers = updatedTiers.map((tier, idx) => ({
                        ...tier,
                        order: idx,
                    }));

                    return { tiers: normalizedTiers };
                }),

            removeTier: (tierId) =>
                set((state) => {
                    const remainingTiers = state.tiers.filter((tier) => tier.id !== tierId);

                    // Re-calculate orders
                    const normalizedTiers = remainingTiers.map((tier, idx) => ({
                        ...tier,
                        order: idx,
                    }));

                    // Items that belonged to the removed tier go back to the item pool
                    const updatedItems = state.items.map((item) =>
                        item.tierId === tierId ? { ...item, tierId: null } : item
                    );

                    return { tiers: normalizedTiers, items: updatedItems };
                }),

            deleteItem: (itemId) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== itemId),
                })),

            clearAll: () =>
                set(() => ({
                    tiers: initialTiers,
                    items: [],
                })),
        }),
        {
            name: "rankit-tier-storage", // unique name to save in localStorage
        }
    )
);
