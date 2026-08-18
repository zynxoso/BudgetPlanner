import { useEffect, useState, useRef } from 'react';

interface ScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
    const { threshold = 0.05, rootMargin = '50px 0px 50px 0px', triggerOnce = true } = options;
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setIsVisible(true);
            return;
        }

        // Safety fallback timer to prevent permanently hidden content
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 300);

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        clearTimeout(timer);
                        if (triggerOnce) {
                            observer.unobserve(element);
                        }
                    } else if (!triggerOnce) {
                        setIsVisible(false);
                    }
                },
                {
                    threshold,
                    rootMargin,
                }
            );

            observer.observe(element);

            return () => {
                clearTimeout(timer);
                observer.disconnect();
            };
        } else {
            setIsVisible(true);
            clearTimeout(timer);
        }
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isVisible };
}
