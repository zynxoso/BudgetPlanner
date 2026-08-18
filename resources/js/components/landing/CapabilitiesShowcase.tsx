import { useState, useRef } from 'react';
import { use3DScene, getDepthTransform } from '@/hooks/use-3d-scene';
import ScrollReveal from '@/components/landing/ScrollReveal';
import {
    PieChart,
    Target,
    Zap,
    Landmark,
    Sparkles,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';

interface Capability {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    tagline: string;
    image: string;
    description: string;
    bullets: string[];
    stat: { label: string; value: string };
}

const CAPABILITIES: Capability[] = [
    {
        id: 'budget',
        icon: PieChart,
        title: 'Monthly Budgets & Cash Tracking',
        tagline: 'Set spending limits and record cash spent on the fly.',
        image: '/images/landing/hero-budget-rings.jpg',
        description:
            'Most budgeting apps fail because cash spent during the day is never recorded. This system logs spent cash immediately, adjusting your available balance so your numbers stay accurate.',
        bullets: [
            'Per-category monthly spending limits with clear color indicators',
            'Quick cash tracking to prevent missing transactions',
            'Monthly rollover to see how your actual spending compares to your plan',
        ],
        stat: { label: 'Balance Accuracy', value: 'Zero drift' },
    },
    {
        id: 'savings',
        icon: Target,
        title: 'Visual Savings Goals',
        tagline: 'Set target amounts and watch your progress grow.',
        image: '/images/landing/savings-vault.jpg',
        description:
            'Create distinct vaults for emergency funds, vacations, or down payments. Track your monthly contribution rate and see your estimated completion date.',
        bullets: [
            'Separate funds for emergencies, travel, or big purchases',
            'One-click deposit logging to keep your progress updated',
            'Estimated completion dates based on your current monthly savings',
        ],
        stat: { label: 'Goal Tracking', value: 'Visual Progress' },
    },
    {
        id: 'loans',
        icon: Zap,
        title: 'Loan & Debt Payoff',
        tagline: 'Track principal balances and pay down debt faster.',
        image: '/images/landing/debt-geometry.jpg',
        description:
            'Keep all your loans in one place. See how extra monthly payments reduce your payoff timeline and save money on interest.',
        bullets: [
            'Clear breakdown of principal balance and interest rates',
            'Log payments and watch your remaining balance decrease',
            'Calculates months saved with extra monthly payments',
        ],
        stat: { label: 'Average Paydown Time', value: '-14 Months' },
    },
    {
        id: 'banks',
        icon: Landmark,
        title: 'Bank Accounts & Transfers',
        tagline: 'Keep all your accounts together in one place.',
        image: '/images/landing/banking-nexus.jpg',
        description:
            'Track multiple checking, savings, and investment accounts. Record internal transfers with automatic logging so balances match across accounts.',
        bullets: [
            'See total available cash across all linked accounts',
            'Record transfers between accounts with clear source and destination logging',
            'Complete transaction history for quick account auditing',
        ],
        stat: { label: 'Transfers', value: 'Automatic sync' },
    },
    {
        id: 'ai',
        icon: Sparkles,
        title: 'Gemini AI Spending Assistant',
        tagline: 'Smart transaction categorization and practical advice.',
        image: '/images/landing/ai-advisor.jpg',
        description:
            'Use built-in AI to automatically categorize receipts and ask questions about your monthly spending trends.',
        bullets: [
            'Automatically suggests category tags for imported transactions',
            'Highlights recurring expenses that may have crept up',
            'Chat directly with the assistant for quick spending reviews',
        ],
        stat: { label: 'AI Assistant', value: 'Built-in Gemini' },
    },
];

export default function CapabilitiesShowcase() {
    const [activeTab, setActiveTab] = useState<string>('budget');
    const containerRef = useRef<HTMLDivElement | null>(null);
    const scene = use3DScene(containerRef);

    const selectedCap = CAPABILITIES.find((c) => c.id === activeTab) || CAPABILITIES[0];

    return (
        <section
            id="capabilities"
            ref={containerRef}
            className="py-28 px-4 sm:px-6 lg:px-8 bg-neutral-50/70 dark:bg-neutral-950/70 border-t border-border/60 relative overflow-hidden [perspective:1400px]"
        >
            {/* Background Parallax Subtle Depth Ambient */}
            <div
                className="absolute top-1/2 -left-48 w-96 h-96 bg-amber-500/10 blur-[140px] rounded-full pointer-events-none -z-10 will-change-transform"
                style={getDepthTransform(scene, { depth: 0.2, zOffset: -250 })}
            />
            <div
                className="absolute bottom-10 -right-48 w-96 h-96 bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none -z-10 will-change-transform"
                style={getDepthTransform(scene, { depth: 0.2, zOffset: -250 })}
            />

            <div className="max-w-7xl mx-auto z-10 relative [transform-style:preserve-3d]">
                {/* Section Header with ScrollReveal */}
                <ScrollReveal animation="up" className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-2 block font-mono">
                        Core Tools & Features
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                        Everything you need to manage your money
                    </h2>
                    <p className="text-muted-foreground text-base sm:text-lg">
                        Five practical modules designed to keep your balances accurate, knock out loans, and hit your savings targets.
                    </p>
                </ScrollReveal>

                {/* Module Navigation Tabs with ScrollReveal */}
                <ScrollReveal animation="fade" delay={150} className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-12 gap-2 scrollbar-none">
                    {CAPABILITIES.map((cap) => {
                        const Icon = cap.icon;
                        const isCurrent = activeTab === cap.id;
                        return (
                            <button
                                key={cap.id}
                                onClick={() => setActiveTab(cap.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer border ${
                                    isCurrent
                                        ? 'bg-foreground text-background border-foreground shadow-sm scale-105'
                                        : 'bg-background/80 text-muted-foreground border-border hover:text-foreground hover:bg-background'
                                }`}
                            >
                                <Icon className="size-4" />
                                <span>{cap.title.split(' & ')[0]}</span>
                            </button>
                        );
                    })}
                </ScrollReveal>

                {/* Active Capability Display Stage with 3D Depth Planes & ScrollReveal */}
                <ScrollReveal animation="scale" delay={250}>
                    <div
                        className="bg-background border border-border rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center [transform-style:preserve-3d]"
                        style={getDepthTransform(scene, { depth: 0.8, rotateFactor: 4, zOffset: 30 })}
                    >
                    {/* Left Info Column (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col items-start">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-foreground mb-4 shadow-xs">
                            <selectedCap.icon className="size-3.5 text-amber-500" />
                            <span>
                                {selectedCap.stat.label}: {selectedCap.stat.value}
                            </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
                            {selectedCap.title}
                        </h3>
                        <p className="text-sm sm:text-base font-medium text-amber-600 dark:text-amber-400 mb-4">
                            {selectedCap.tagline}
                        </p>
                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
                            {selectedCap.description}
                        </p>

                        <div className="space-y-3.5 w-full mb-8">
                            {selectedCap.bullets.map((bullet, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-sm text-foreground font-medium">
                                        {bullet}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <a
                            href="#simulator"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        >
                            <span>Try this in the budget calculator</span>
                            <ArrowRight className="size-4" />
                        </a>
                    </div>

                    {/* Right Visual 3D Asset Column (5 cols, Plane Z: +140px) */}
                    <div className="lg:col-span-5 flex items-center justify-center [transform-style:preserve-3d]">
                        <div
                            className="relative w-full max-w-[380px] aspect-square rounded-2xl overflow-hidden border border-border/80 bg-neutral-100 dark:bg-neutral-900 shadow-[0_25px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] group will-change-transform"
                            style={getDepthTransform(scene, { depth: 1.6, rotateFactor: 12, zOffset: 140 })}
                        >
                            <img
                                key={selectedCap.image}
                                src={selectedCap.image}
                                alt={selectedCap.title}
                                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                            />
                            {/* Dynamic Specular Glare Sheen */}
                            <div
                                className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-20 transition-opacity"
                                style={{
                                    background: 'radial-gradient(circle 280px at var(--scene-light-x, 50%) var(--scene-light-y, 50%), rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 80%)',
                                }}
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-2xl pointer-events-none" />
                        </div>
                    </div>
                </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
