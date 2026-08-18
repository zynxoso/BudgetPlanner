import { useEffect, useRef, RefObject } from 'react';

export interface Scene3DState {
    // Smoothed normalized coordinates (-1 to 1)
    mouseX: number;
    mouseY: number;
    // Smoothed device tilt (-1 to 1)
    tiltX: number;
    tiltY: number;
    // Combined effective offset (-1 to 1)
    effectiveX: number;
    effectiveY: number;
    // Scroll progress (0 to 1)
    scrollProgress: number;
    scrollY: number;
}

export function use3DScene(containerRef?: RefObject<HTMLElement | null>): Scene3DState {
    const targetRef = useRef({
        mouseX: 0,
        mouseY: 0,
        tiltX: 0,
        tiltY: 0,
        scrollProgress: 0,
        scrollY: 0,
    });

    const currentRef = useRef<Scene3DState>({
        mouseX: 0,
        mouseY: 0,
        tiltX: 0,
        tiltY: 0,
        effectiveX: 0,
        effectiveY: 0,
        scrollProgress: 0,
        scrollY: 0,
    });

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // 1. Mouse Tracking with window / container
        const handleMouseMove = (e: MouseEvent) => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const normX = Math.max(-1, Math.min(1, (e.clientX - width / 2) / (width / 2)));
            const normY = Math.max(-1, Math.min(1, (e.clientY - height / 2) / (height / 2)));
            targetRef.current.mouseX = normX;
            targetRef.current.mouseY = normY;
        };

        // 2. Device Orientation (Gyroscope / Mobile Tilt)
        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.gamma === null || e.beta === null) return;
            const normGamma = Math.max(-1, Math.min(1, e.gamma / 45));
            const normBeta = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
            targetRef.current.tiltX = normGamma;
            targetRef.current.tiltY = normBeta;
        };

        // 3. Scroll Tracking
        const handleScroll = () => {
            const y = window.scrollY;
            targetRef.current.scrollY = y;

            if (containerRef?.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const total = window.innerHeight + rect.height;
                const current = window.innerHeight - rect.top;
                targetRef.current.scrollProgress = Math.max(0, Math.min(1, current / total));
            } else {
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                targetRef.current.scrollProgress = maxScroll > 0 ? Math.max(0, Math.min(1, y / maxScroll)) : 0;
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation, { passive: true });
        }
        handleScroll();

        // 4. Spring / Lerp Animation Loop (Smooth Physics via CSS Variables)
        let frameId: number;
        const lerpFactor = 0.08;

        const loop = () => {
            const cur = currentRef.current;
            const tgt = targetRef.current;

            // Interpolate mouse
            cur.mouseX += (tgt.mouseX - cur.mouseX) * lerpFactor;
            cur.mouseY += (tgt.mouseY - cur.mouseY) * lerpFactor;

            // Interpolate tilt
            cur.tiltX += (tgt.tiltX - cur.tiltX) * lerpFactor;
            cur.tiltY += (tgt.tiltY - cur.tiltY) * lerpFactor;

            // Interpolate scroll
            cur.scrollProgress += (tgt.scrollProgress - cur.scrollProgress) * lerpFactor;
            cur.scrollY += (tgt.scrollY - cur.scrollY) * lerpFactor;

            // Combined effective vector (mouse + tilt)
            cur.effectiveX = Math.max(-1, Math.min(1, cur.mouseX + cur.tiltX * 0.7));
            cur.effectiveY = Math.max(-1, Math.min(1, cur.mouseY + cur.tiltY * 0.7));

            const targetElement = containerRef?.current ?? document.documentElement;
            if (targetElement) {
                targetElement.style.setProperty('--scene-effective-x', cur.effectiveX.toFixed(4));
                targetElement.style.setProperty('--scene-effective-y', cur.effectiveY.toFixed(4));
                targetElement.style.setProperty('--scene-mouse-x', cur.mouseX.toFixed(4));
                targetElement.style.setProperty('--scene-mouse-y', cur.mouseY.toFixed(4));
                targetElement.style.setProperty('--scene-tilt-x', cur.tiltX.toFixed(4));
                targetElement.style.setProperty('--scene-tilt-y', cur.tiltY.toFixed(4));
                targetElement.style.setProperty('--scene-scroll-progress', cur.scrollProgress.toFixed(4));
                targetElement.style.setProperty('--scene-scroll-y', `${cur.scrollY.toFixed(2)}px`);
                targetElement.style.setProperty('--scene-light-x', `${(((cur.effectiveX + 1) / 2) * 100).toFixed(2)}%`);
                targetElement.style.setProperty('--scene-light-y', `${(((cur.effectiveY + 1) / 2) * 100).toFixed(2)}%`);
            }

            frameId = requestAnimationFrame(loop);
        };

        frameId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            if (window.DeviceOrientationEvent) {
                window.removeEventListener('deviceorientation', handleOrientation);
            }
            cancelAnimationFrame(frameId);
        };
    }, [containerRef]);

    return currentRef.current;
}

/**
 * Calculates CSS transform for a layer placed at a virtual 3D depth, driven by GPU CSS variables.
 * @param depth Multiplier for depth shift. Negative = pushes back, Positive = pulls forward into foreground.
 * @param rotateFactor How much 3D perspective rotation to apply based on cursor/tilt.
 * @param zOffset Virtual translateZ in pixels.
 */
export function getDepthTransform(
    stateOrOptions?: Scene3DState | { depth?: number; rotateFactor?: number; zOffset?: number; scrollSpeed?: number },
    options?: {
        depth?: number;
        rotateFactor?: number;
        zOffset?: number;
        scrollSpeed?: number;
    }
): React.CSSProperties {
    const opts = (options ?? (stateOrOptions && !('effectiveX' in stateOrOptions) ? stateOrOptions : {})) as {
        depth?: number;
        rotateFactor?: number;
        zOffset?: number;
        scrollSpeed?: number;
    };

    const { depth = 1, rotateFactor = 0, zOffset = 0, scrollSpeed = 0 } = opts;

    const translateExpr = scrollSpeed !== 0
        ? `translate3d(calc(var(--scene-effective-x, 0) * ${depth * 35}px), calc(var(--scene-effective-y, 0) * ${depth * 35}px + var(--scene-scroll-y, 0px) * ${scrollSpeed}), ${zOffset}px)`
        : `translate3d(calc(var(--scene-effective-x, 0) * ${depth * 35}px), calc(var(--scene-effective-y, 0) * ${depth * 35}px), ${zOffset}px)`;

    const rotateExpr = rotateFactor !== 0
        ? ` rotateX(calc(var(--scene-effective-y, 0) * -${rotateFactor}deg)) rotateY(calc(var(--scene-effective-x, 0) * ${rotateFactor}deg))`
        : '';

    return {
        transform: `${translateExpr}${rotateExpr}`,
        willChange: 'transform',
        transformStyle: 'preserve-3d',
    };
}
