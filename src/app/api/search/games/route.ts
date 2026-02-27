import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q");

        if (!q) {
            return NextResponse.json(
                { error: "Search query 'q' is required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.RAWG_API_KEY;

        if (!apiKey) {
            console.error("RAWG_API_KEY is not defined in environment variables");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        const apiUrl = `https://api.rawg.io/api/games?search=${encodeURIComponent(
            q
        )}&key=${apiKey}&page_size=10`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch from RAWG API: ${response.statusText}`);
        }

        const data = await response.json();

        // Data cleaning and mapping
        if (data.results && Array.isArray(data.results)) {
            const cleanedData = data.results
                .filter((game: any) => game.background_image) // Filter out games without an image
                .map((game: any) => ({
                    id: game.id.toString(), // Convert ID to string for consistency with dnd-kit
                    title: game.name,
                    imageUrl: game.background_image,
                }));

            return NextResponse.json({ results: cleanedData });
        }

        return NextResponse.json({ results: [] });
    } catch (error) {
        console.error("Error in RAWG API proxy:", error);
        return NextResponse.json(
            { error: "Failed to fetch games" },
            { status: 500 }
        );
    }
}
