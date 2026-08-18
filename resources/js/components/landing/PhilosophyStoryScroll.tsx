import { useRef } from 'react';
import { use3DScene, getDepthTransform } from '@/hooks/use-3d-scene';
import ScrollReveal from '@/components/landing/ScrollReveal';
import { Compass, Target, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PhilosophyStoryScroll() {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const scene = use3DScene(sectionRef);

    const pillars = [
        {
            num: '01',
            icon: Compass,
            title: 'Give every dollar a job',
            subtitle: 'Category limits before you tap your card',
            tagline: 'Decide where your money goes ahead of time.',
            image: '/images/landing/hero-budget-rings.jpg',
            description:
                'Logging receipts after dinner is too late. When you set category limits at the start of the month, you know exactly what you can spend without checking your bank app in the checkout line.',
            widget: {
                title: 'Monthly Envelopes',
                stat1: { label: 'Assigned Income', val: '100%' },
                stat2: { label: 'Unbudgeted Cash', val: '$0.00' },
                metric: 'No end-of-month surprises',
            },
        },
        {
            num: '02',
            icon: Target,
            title: 'Track everyday cash spending',
            subtitle: 'Record cash right when you spend it',
            tagline: 'Balances that match the cash in your pocket.',
            image: '/images/landing/savings-vault.jpg',
            description:
                'Small daily expenses, cash allowances, and quick transfers easily slip through the cracks. This system records cash right away so your ledger matches what you actually have.',
            widget: {
                title: 'Account Balances',
                stat1: { label: 'Linked Accounts', val: 'All Synced' },
                stat2: { label: 'Untracked Cash', val: '0%' },
                metric: 'Accurate across every account',
            },
        },
        {
            num: '03',
            icon: Zap,
            title: 'Pay off loans faster',
            subtitle: 'Turn interest charges into savings',
            tagline: 'Every loan paid off frees up monthly income.',
            image: '/images/landing/debt-geometry.jpg',
            description:
                'High interest balances eat away at your monthly income. By putting extra cash directly toward principal balances, you can see the exact month you will be debt free.',
            widget: {
                title: 'Loan Payoff Estimate',
                stat1: { label: 'Time Saved', val: '14 Months' },
                stat2: { label: 'Interest Saved', val: 'Over $4,000' },
                metric: 'Freed money goes straight to savings',
            },
        },
    ];

    const lightX = ((scene.effectiveX + 1) / 2) * 100;
    const lightY = ((scene.effectiveY + 1) / 2) * 100;

    return (
        <section
            id="philosophy"
            ref={sectionRef}
            className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-neutral-950 text-neutral-50 relative overflow-hidden border-t border-neutral-800/80 [perspective:1400px]"
        >
            {/* Background Ambient Glow (Plane Z: -300px) */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-emerald-500/10 to-blue-500/10 blur-[180px] rounded-full pointer-events-none -z-20 will-change-transform"
                style={getDepthTransform(scene, { depth: 0.15, zOffset: -300 })}
            />

            <div className="max-w-7xl mx-auto w-full z-10 [transform-style:preserve-3d]">
                {/* Section Header with ScrollReveal */}
                <ScrollReveal animation="up" className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold mb-2 block">
                        How it works
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
                        Why planning beats checking bank statements after the fact
                    </h2>
                    <p className="text-neutral-400 text-base sm:text-lg leading-relaxed">
                        Three simple rules that replace end-of-month stress with clear spending limits.
                    </p>
                </ScrollReveal>

                {/* 3 Pillars Grid: All 3 Parts Visible Simultaneously */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch [transform-style:preserve-3d]">
                    {pillars.map((pillar, idx) => {
                        const Icon = pillar.icon;
                        return (
                            <ScrollReveal
                                key={pillar.num}
                                animation="scale"
                                delay={idx * 150}
                                className="flex flex-col h-full [transform-style:preserve-3d]"
                            >
                                <div
                                    className="bg-neutral-900/90 border border-neutral-800/90 hover:border-neutral-700 rounded-3xl p-6 sm:p-7 flex flex-col justify-between h-full shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 will-change-transform"
                                    style={getDepthTransform(scene, {
                                        depth: 0.8 + idx * 0.2,
                                        rotateFactor: 4,
                                        zOffset: 20 + idx * 20,
                                    })}
                                >
                                    <div>
                                        {/* 3D Artwork Frame with Specular Glare */}
                                        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-neutral-800 bg-neutral-950">
                                            <img
                                                src={pillar.image}
                                                alt={pillar.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {/* Dynamic Specular Glare */}
                                            <div
                                                className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-40 transition-opacity"
                                                style={{
                                                    background: `radial-gradient(circle 240px at ${lightX}% ${lightY}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 80%)`,
                                                }}
                                            />
                                            {/* Pillar Number Badge */}
                                            <div className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-md border border-neutral-800 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-amber-400">
                                                Part {pillar.num}
                                            </div>
                                        </div>

                                        {/* Header Info */}
                                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
                                            <Icon className="size-3.5" />
                                            <span>{pillar.subtitle}</span>
                                        </div>

                                        <h3 className="text-xl font-bold tracking-tight text-white mb-2 leading-snug">
                                            {pillar.title}
                                        </h3>

                                        <p className="text-xs text-neutral-300 font-medium italic mb-4">
                                            "{pillar.tagline}"
                                        </p>

                                        <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                                            {pillar.description}
                                        </p>
                                    </div>

                                    {/* Live Metric Widget Card */}
                                    <div className="mt-auto bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-4 flex flex-col gap-2.5">
                                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                                            <span>{pillar.widget.title}</span>
                                            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/60">
                                            <div>
                                                <div className="text-[10px] text-neutral-400">
                                                    {pillar.widget.stat1.label}
                                                </div>
                                                <div className="text-sm font-bold font-mono text-emerald-400">
                                                    {pillar.widget.stat1.val}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-neutral-400">
                                                    {pillar.widget.stat2.label}
                                                </div>
                                                <div className="text-sm font-bold font-mono text-white">
                                                    {pillar.widget.stat2.val}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-neutral-800/60 text-[11px] text-neutral-400 flex items-center gap-1.5">
                                            <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                                            <span className="truncate">{pillar.widget.metric}</span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        );
                    })}
                </div>

                {/* Bottom Link to Next Stage */}
                <div className="mt-12 text-center">
                    <a
                        href="#simulator"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-all backdrop-blur-sm"
                    >
                        <span>Test these principles in the Budget Simulator below</span>
                        <ArrowRight className="size-3.5 text-amber-400" />
                    </a>
                </div>
            </div>
        </section>
    );
}
