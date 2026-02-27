import React, { useRef, useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useTierStore } from "@/store/useTierStore";
import type { Item } from "@/store/useTierStore";
import SortableItem from "./SortableItem";
import { useDebounce } from "@/hooks/useDebounce";

interface GameResult {
    id: string;
    title: string;
    imageUrl: string;
}

interface ItemPoolProps {
    items: Item[];
}

export default function ItemPool({ items }: ItemPoolProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addItem = useTierStore((state) => state.addItem);
    const [isCompressing, setIsCompressing] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<GameResult[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Dropdown ref for click-outside
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    useEffect(() => {
        if (!debouncedSearchQuery.trim()) {
            setSearchResults([]);
            setIsDropdownOpen(false);
            return;
        }

        const fetchGames = async () => {
            setIsSearching(true);
            setIsDropdownOpen(true);
            try {
                const res = await fetch(`/api/search/games?q=${encodeURIComponent(debouncedSearchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.results || []);
                } else {
                    console.error("Failed to fetch search results");
                    setSearchResults([]);
                }
            } catch (error) {
                console.error("Error fetching games:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        fetchGames();
    }, [debouncedSearchQuery]);

    // Handle clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelectGame = (game: GameResult) => {
        addItem(game.imageUrl);
        setSearchQuery("");
        setSearchResults([]);
        setIsDropdownOpen(false);
    };

    const { setNodeRef, isOver } = useDroppable({
        id: "item-pool",
        data: {
            type: "ItemPool",
        },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setIsCompressing(true);
        const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));

        try {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            };

            await Promise.all(
                files.map(async (file) => {
                    try {
                        const compressedFile = await imageCompression(file, options);
                        const objectUrl = URL.createObjectURL(compressedFile);
                        addItem(objectUrl);
                    } catch (err) {
                        console.error("Failed to compress image:", file.name, err);
                    }
                })
            );
        } finally {
            setIsCompressing(false);
            // Reset the input so the same files can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full max-w-5xl mx-auto mt-12">
            <div className="flex items-center justify-between mb-4 px-2 tracking-wide">
                <div className="flex items-center gap-6">
                    <h2 className="text-zinc-400 text-sm font-semibold uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        素材池
                    </h2>

                    {/* Inline Search UI */}
                    <div className="relative w-64" ref={searchContainerRef}>
                        <div className="relative flex items-center w-full h-9 rounded-full bg-white/[0.03] border border-white/10 overflow-hidden focus-within:border-white/20 focus-within:bg-white/[0.05] focus-within:ring-1 focus-within:ring-white/10 transition-all">
                            <div className="pl-3 pr-2 text-zinc-500">
                                {isSearching ? (
                                    <svg className="animate-spin w-4 h-4 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="通过 RAWG 搜索游戏..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => {
                                    if (searchQuery.trim()) setIsDropdownOpen(true);
                                }}
                                className="w-full h-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSearchResults([]);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="pr-3 pl-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Dropdown Results */}
                        {isDropdownOpen && (searchQuery.trim() !== "") && (
                            <div className="absolute top-11 left-0 w-[300px] max-h-[300px] overflow-y-auto bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 py-2 custom-scrollbar">
                                {isSearching && searchResults.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-zinc-500 flex items-center gap-2">
                                        搜索中...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <ul className="flex flex-col">
                                        {searchResults.map((game) => (
                                            <li
                                                key={game.id}
                                                onClick={() => handleSelectGame(game)}
                                                className="px-3 py-2 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors"
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-md bg-zinc-800 bg-cover bg-center shrink-0 border border-white/5"
                                                    style={{ backgroundImage: `url(${game.imageUrl})` }}
                                                />
                                                <span className="text-sm font-medium text-zinc-300 truncate w-full">
                                                    {game.title}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="px-4 py-3 text-sm text-zinc-500">
                                        未找到匹配的游戏
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <span className="text-zinc-600 text-xs font-medium shrink-0">
                    {items.length} 待分类
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={`min-h-[160px] rounded-3xl border bg-white/[0.01] p-6 flex flex-wrap gap-4 items-start justify-center sm:justify-start backdrop-blur-xl shadow-inner shadow-black/30 transition-colors ${isOver ? "border-white/10" : "border-white/5"
                    }`}
            >
                <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                    {items.map((item) => (
                        <SortableItem key={item.id} item={item} />
                    ))}
                </SortableContext>

                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="hidden"
                />

                {/* Helper dashed zone for manual upload/empty state placeholder */}
                {items.length === 0 && !isOver && (
                    <div
                        onClick={() => !isCompressing && triggerFileInput()}
                        className={`w-full min-h-[110px] rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center gap-2 transition-colors ${isCompressing ? "text-zinc-500 cursor-not-allowed" : "text-zinc-700 hover:border-white/10 hover:text-zinc-500 cursor-pointer"
                            }`}
                    >
                        {isCompressing ? (
                            <>
                                <svg className="animate-spin w-8 h-8 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-sm font-medium tracking-wide">
                                    图片压缩处理中...
                                </span>
                            </>
                        ) : (
                            <>
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span className="text-sm font-medium tracking-wide">
                                    点击此处上传本地图片
                                </span>
                            </>
                        )}
                    </div>
                )}

                {/* If there are items but we still want the + button */}
                {items.length > 0 && (
                    <div
                        onClick={() => !isCompressing && triggerFileInput()}
                        className={`w-24 h-24 rounded-2xl border border-dashed flex items-center justify-center transition-colors ${isCompressing ? "border-white/5 text-zinc-500 cursor-not-allowed" : "border-white/5 text-zinc-700 hover:border-white/10 hover:text-zinc-500 cursor-pointer"
                            }`}
                        title={isCompressing ? "处理中..." : "Upload more images"}
                    >
                        {isCompressing ? (
                            <svg className="animate-spin w-6 h-6 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
