import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export function useSmoothScroll() {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Initialize Lenis smooth inertial scrolling
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease out
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.5,
            infinite: false,
        });

        lenisRef.current = lenis;

        let frameId: number;
        function raf(time: number) {
            lenis.raf(time);
            frameId = requestAnimationFrame(raf);
        }
        frameId = requestAnimationFrame(raf);

        // Smooth Anchor Click Interception
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    lenis.scrollTo(targetElement as HTMLElement, {
                        offset: -70,
                        duration: 1.3,
                    });
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);

        return () => {
            document.removeEventListener('click', handleAnchorClick);
            cancelAnimationFrame(frameId);
            lenis.destroy();
        };
    }, []);

    return lenisRef;
}
