import { useRef } from 'react';
import ScrollReveal from '@/components/landing/ScrollReveal';
import { useCountUp } from '@/hooks/use-count-up';
import { use3DScene, getDepthTransform } from '@/hooks/use-3d-scene';

function MetricCard({
    value,
    prefix,
    suffix,
    label,
    sub,
    delay,
}: {
    value: number;
    prefix?: string;
    suffix?: string;
    label: string;
    sub: string;
    delay: number;
}) {
    const { ref, formatted } = useCountUp({
        end: value,
        prefix,
        suffix,
        duration: 1800,
    });

    return (
        <ScrollReveal
            animation="scale"
            delay={delay}
            className="bg-card/80 dark:bg-neutral-900/60 border border-border/80 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
        >
            <div
                ref={ref}
                className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground mb-1 tabular-nums"
            >
                {formatted}
            </div>
            <div className="text-sm font-semibold text-foreground mb-1">
                {label}
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
                {sub}
            </div>
        </ScrollReveal>
    );
}

export default function FinancialClarityMetrics() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const scene = use3DScene(containerRef);

    const quotes = [
        {
            text: 'Do not save what is left after spending, but spend what is left after saving.',
            author: 'Warren Buffett',
            title: 'Chairman, Berkshire Hathaway',
        },
        {
            text: 'The first rule of compounding is to never interrupt it unnecessarily.',
            author: 'Charlie Munger',
            title: 'Investor & Author',
        },
        {
            text: 'Wealth consists not in having great possessions, but in having few wants and a clear plan.',
            author: 'Epictetus',
            title: 'Philosopher',
        },
    ];

    return (
        <section
            id="clarity"
            ref={containerRef}
            className="py-24 px-4 sm:px-6 lg:px-8 bg-background border-t border-border/60 relative overflow-hidden [perspective:1400px]"
        >
            {/* Background Ambient Glow with Subtle Scroll Parallax */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-emerald-500/5 via-amber-500/5 to-transparent blur-[140px] rounded-full pointer-events-none -z-10 will-change-transform"
                style={getDepthTransform(scene, { depth: 0.25, zOffset: -200 })}
            />

            <div className="max-w-7xl mx-auto">
                {/* Section Header with ScrollReveal */}
                <ScrollReveal animation="up" className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 mb-2 block">
                        Measurable impact
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                        What changes when you stick to a plan
                    </h2>
                    <p className="text-muted-foreground text-base sm:text-lg">
                        Budgeting does not mean giving up everything you enjoy. It means knowing what you can spend with total confidence and zero end-of-month guilt.
                    </p>
                </ScrollReveal>

                {/* 4 Quant Metrics Grid with Count-Up Animations */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-20">
                    <MetricCard
                        value={99}
                        suffix="%"
                        label="Tracking accuracy"
                        sub="No missing receipts or balance drift"
                        delay={0}
                    />
                    <MetricCard
                        value={650}
                        prefix="+$"
                        suffix="/mo"
                        label="Average monthly savings"
                        sub="Reclaimed from unbudgeted impulse spending"
                        delay={100}
                    />
                    <MetricCard
                        value={14}
                        suffix=" mo"
                        label="Faster debt payoff"
                        sub="Average timeline reduction on active loans"
                        delay={200}
                    />
                    <MetricCard
                        value={3}
                        suffix="x"
                        label="Goal completion rate"
                        sub="Through steady automated visual tracking"
                        delay={300}
                    />
                </div>

                {/* Philosophy Quotes Grid with Staggered ScrollReveal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quotes.map((q, idx) => (
                        <ScrollReveal
                            key={idx}
                            animation="up"
                            delay={100 + idx * 120}
                            className="bg-card/60 dark:bg-neutral-900/40 border border-border/70 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-border transition-all duration-300"
                        >
                            <p className="text-sm sm:text-base text-foreground leading-relaxed italic mb-6">
                                "{q.text}"
                            </p>
                            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold text-foreground">
                                        {q.author}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {q.title}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
