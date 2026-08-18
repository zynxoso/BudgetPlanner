import { useEffect, useState } from 'react';

export default function ScrollProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let frameId: number;

        const updateScroll = () => {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            if (total > 0) {
                const current = window.scrollY;
                setProgress(Math.min(100, Math.max(0, (current / total) * 100)));
            }
        };

        const onScroll = () => {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(updateScroll);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        updateScroll();

        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[60] pointer-events-none bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-75 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
