"use client";

import React, { useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import Header from "@/components/Header";
import TierBoard from "@/components/TierBoard";
import ItemPool from "@/components/ItemPool";
import SortableItem from "@/components/SortableItem";
import TrashZone from "@/components/TrashZone";
import { useTierStore } from "@/store/useTierStore";
import { useStoreHydration } from "@/hooks/useStoreHydration";

export default function Home() {
  const isHydrated = useStoreHydration();
  const items = useTierStore((state) => state.items);
  const moveItem = useTierStore((state) => state.moveItem);
  const addItem = useTierStore((state) => state.addItem); // Keep handy for future upload feature
  const deleteItem = useTierStore((state) => state.deleteItem);

  // Local state for the drag overlay
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // For initial dev/demo, let's inject some dummy items if the pool is empty 
  // Normally you'd want to do this via a persistent backend or an 'Add Item' button
  React.useEffect(() => {
    if (items.length === 0) {
      const colors = ["bg-purple-500", "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-fuchsia-500"];
      colors.forEach((c, idx) => {
        // We're abusing addItem strictly for a quick demo of 5 items. 
        // In real app, imageUrl would be an actual URL. Here we pass the color class to simulate images.
        addItem(c);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before drag starts (helps click vs drag)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Active item info for the drag overlay
  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId),
    [activeId, items]
  );

  const unassignedItems = useMemo(
    () => items.filter((item) => item.tierId === null),
    [items]
  );

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    // In a fully sortable list, we might rearrange elements 'during' drag here (arrayMove).
    // For this tier list, moving it via Zustand is simpler handled primarily at DragEnd,
    // though immediate visual feedback during DragOver can be achieved if needed.
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      // Dropped outside any valid droppable. Return item to the pool.
      moveItem(active.id as string, null);
      return;
    }

    const activeIdVal = active.id as string;
    const overIdVal = over.id as string;

    // Determine target tier
    let targetTierId: string | null = null;

    if (over.id === "trash-zone" || over.data.current?.type === "TrashZone") {
      deleteItem(activeIdVal);
      return;
    } else if (over.data.current?.type === "Tier") {
      targetTierId = over.id as string;
    } else if (over.data.current?.type === "ItemPool") {
      targetTierId = null;
    } else if (over.data.current?.type === "Item") {
      // If dropped *on top* of another item, put it in the same tier
      const overItem = items.find((i) => i.id === overIdVal);
      targetTierId = overItem ? overItem.tierId : null;
    }

    if (activeIdVal !== overIdVal) {
      moveItem(activeIdVal, targetTierId);
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.4",
        },
      },
    }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800 selection:text-white">
      <Header />

      <main className="flex-1 w-full p-6 md:p-10 flex flex-col pt-10">
        {!isHydrated ? (
          <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row min-h-[120px] rounded-2xl bg-white/[0.01] border border-white/5 overflow-hidden">
                <div className="w-full sm:w-32 shrink-0 bg-white/[0.02] border-b sm:border-r border-white/5 py-4 sm:py-0"></div>
                <div className="flex-1 p-5 flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-white/[0.02]"></div>
                  <div className="w-20 h-20 rounded-xl bg-white/[0.02]"></div>
                </div>
              </div>
            ))}
            <div className="mt-auto mb-10 min-h-[160px] rounded-3xl border border-white/5 bg-white/[0.01] p-6 flex gap-4 items-start">
              <div className="w-full min-h-[110px] rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/[0.02] mb-2"></div>
                <div className="w-32 h-4 rounded bg-white/[0.02]"></div>
              </div>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* Tier Board Area - Wrapped for export */}
            <section className="w-full flex justify-center">
              <div id="tier-board-container" className="w-full relative py-4">
                <TierBoard />

                {/* Subtle watermark for exports */}
                <div className="absolute bottom-1 right-2 opacity-20 text-[10px] font-medium tracking-widest text-white/50 pointer-events-none select-none">
                  Created by RankIt
                </div>
              </div>
            </section>

            {/* Item Pool Area */}
            <section className="w-full mt-auto mb-10">
              <ItemPool items={unassignedItems} />
            </section>

            {/* Trash Zone */}
            <TrashZone isDragging={!!activeId} />

            {/* Drag Overlay for physical-feeling item drag effect */}
            <DragOverlay dropAnimation={dropAnimation}>
              {activeItem ? (
                <div className="w-24 h-24 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-white/20 bg-zinc-700 flex items-center justify-center scale-105 rotate-3 opacity-90 transition-transform cursor-grabbing overflow-hidden">
                  {/* Quick hack to show the "color" if it's our dev data, otherwise normal image */}
                  {activeItem.imageUrl.startsWith("bg-") ? (
                    <div className={`w-full h-full ${activeItem.imageUrl}`} />
                  ) : (
                    <span className="text-xs font-medium text-white shadow-sm pointer-events-none tracking-wider">Img</span>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>
    </div>
  );
}
