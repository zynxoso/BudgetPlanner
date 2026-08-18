import React from 'react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    animation?: 'up' | 'scale' | 'fade' | 'slide-down';
    delay?: number; // Milliseconds
    threshold?: number;
}

export default function ScrollReveal({
    children,
    className = '',
    animation = 'up',
    delay = 0,
    threshold = 0.05,
}: ScrollRevealProps) {
    const { ref, isVisible } = useScrollReveal({ threshold });

    const transitionStyle = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;

    let transform = 'none';
    let filter = 'none';

    if (!isVisible) {
        if (animation === 'up') {
            transform = 'translateY(24px)';
            filter = 'blur(3px)';
        } else if (animation === 'scale') {
            transform = 'scale(0.96) translateY(16px)';
            filter = 'blur(4px)';
        } else if (animation === 'slide-down') {
            transform = 'translateY(-20px)';
        }
    }

    return (
        <div
            ref={ref}
            style={{
                opacity: isVisible ? 1 : 0,
                transform,
                filter,
                transition: transitionStyle,
            }}
            className={`will-change-transform ${className}`}
        >
            {children}
        </div>
    );
}
