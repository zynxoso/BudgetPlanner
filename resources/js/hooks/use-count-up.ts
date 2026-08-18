import { useEffect, useState, useRef } from 'react';

interface UseCountUpOptions {
    end: number;
    start?: number;
    duration?: number; // in milliseconds
    decimals?: number;
    prefix?: string;
    suffix?: string;
}

export function useCountUp(options: UseCountUpOptions) {
    const { end, start = 0, duration = 1600, decimals = 0, prefix = '', suffix = '' } = options;
    const [count, setCount] = useState<number>(start);
    const [hasAnimated, setHasAnimated] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setCount(end);
            setHasAnimated(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);

                    const startTime = performance.now();

                    const animate = (currentTime: number) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        // Ease Out Expo
                        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                        const currentVal = start + (end - start) * easeProgress;

                        setCount(currentVal);

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            setCount(end);
                        }
                    };

                    requestAnimationFrame(animate);
                    observer.unobserve(element);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [end, start, duration, hasAnimated]);

    const formatted = `${prefix}${count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })}${suffix}`;

    return { ref, count, formatted, hasAnimated };
}
