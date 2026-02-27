import { useState, useEffect } from "react";

export function useStoreHydration() {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Once the component mounts in the browser, hydration is complete.
        setIsHydrated(true);
    }, []);

    return isHydrated;
}
