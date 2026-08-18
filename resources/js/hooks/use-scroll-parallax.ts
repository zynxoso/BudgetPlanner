import { useEffect, useState, useRef, RefObject } from 'react';

export interface ScrollProgressInfo {
    progress: number; // 0 to 1 as element traverses the viewport
    pinnedProgress: number; // 0 to 1 while container's scroll track is active
    isInView: boolean;
    scrollY: number;
}

export function useScrollProgress(containerRef: RefObject<HTMLElement | null>): ScrollProgressInfo {
    const [info, setInfo] = useState<ScrollProgressInfo>({
        progress: 0,
        pinnedProgress: 0,
        isInView: false,
        scrollY: 0,
    });

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        let frameId: number;

        const update = () => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const elementHeight = rect.height;

            // Total distance from when top of element enters viewport bottom to when bottom leaves viewport top
            const totalDistance = windowHeight + elementHeight;
            const currentDistance = windowHeight - rect.top;
            const rawProgress = Math.max(0, Math.min(1, currentDistance / totalDistance));

            // Pinned progress: when top hits 0 until bottom hits windowHeight
            const scrollableDistance = elementHeight - windowHeight;
            const pinnedRaw =
                scrollableDistance > 0 ? Math.max(0, Math.min(1, -rect.top / scrollableDistance)) : rawProgress;

            const inView = rect.bottom > 0 && rect.top < windowHeight;

            setInfo({
                progress: rawProgress,
                pinnedProgress: pinnedRaw,
                isInView: inView,
                scrollY: window.scrollY,
            });
        };

        const onScrollOrResize = () => {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(update);
        };

        window.addEventListener('scroll', onScrollOrResize, { passive: true });
        window.addEventListener('resize', onScrollOrResize, { passive: true });
        update();

        return () => {
            window.removeEventListener('scroll', onScrollOrResize);
            window.removeEventListener('resize', onScrollOrResize);
            cancelAnimationFrame(frameId);
        };
    }, [containerRef]);

    return info;
}

export function useWindowScroll(): number {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        let frameId: number;
        const handleScroll = () => {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
                setScrollY(window.scrollY);
            });
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(frameId);
        };
    }, []);

    return scrollY;
}
