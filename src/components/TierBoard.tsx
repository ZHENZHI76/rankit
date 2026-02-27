import React from "react";
import TierRow from "./TierRow";
import { useTierStore } from "@/store/useTierStore";

export default function TierBoard() {
    const tiers = useTierStore((state) => state.tiers);
    const items = useTierStore((state) => state.items);

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
            {tiers.map((tier) => {
                // Filter items that belong to this tier
                const tierItems = items.filter((item) => item.tierId === tier.id);
                return <TierRow key={tier.id} tier={tier} items={tierItems} />;
            })}
        </div>
    );
}
