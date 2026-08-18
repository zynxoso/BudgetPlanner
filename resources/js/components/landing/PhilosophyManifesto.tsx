import { useState } from 'react';
import { Target, Compass, Zap, ArrowRight, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

export default function PhilosophyManifesto() {
    const [activePillar, setActivePillar] = useState(0);

    const pillars = [
        {
            icon: Compass,
            title: 'Intentionality Over Reaction',
            tagline: 'Tell your money where to go instead of wondering where it went.',
            summary:
                'Most financial apps are just digital autopsy reports. They show you overspent on dining after the damage is done. Budget Planner is built on proactive assignment: every dollar has a job before the month starts.',
            principle: 'Proactive Envelopes',
            quote: 'A budget is telling your money where to go instead of wondering where it went. (John C. Maxwell)',
        },
        {
            icon: Target,
            title: 'Catch the small leaks',
            tagline: 'Track every cent, including cash spent before recording.',
            summary:
                'Traditional trackers ignore off-the-books cash flow and unbudgeted allowances. Our system treats spent income with clear double-entry discipline, keeping your true net cash flow transparent.',
            principle: '100% Cash Flow Coverage',
            quote: 'Beware of little expenses. A small leak will sink a great ship. (Benjamin Franklin)',
        },
        {
            icon: Zap,
            title: 'Pay down debt with purpose',
            tagline: 'Pay off liabilities to free up your monthly income.',
            summary:
                'Debt interest eats away at your money. By tracking principal balances, interest rates, and accelerated payments in one place, you turn money lost to interest into steady savings.',
            principle: 'Clear Financial Road',
            quote: 'Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1. (Warren Buffett)',
        },
    ];

    return (
        <section id="philosophy" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border/60 bg-neutral-50/50 dark:bg-neutral-950/40">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-2 block">
                        The Core Philosophy
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
                        Why proactive planning beats reactive tracking
                    </h2>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                        Looking at a graph of past mistakes does not build wealth. Purposeful allocation before spending creates financial sovereignty.
                    </p>
                </div>

                {/* Comparison Matrix: Tracking vs Planning */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {/* Reactive Tracking Card */}
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 sm:p-8 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
                                    <ShieldAlert className="size-4" />
                                </span>
                                <h3 className="font-semibold text-foreground text-lg">
                                    Reactive Tracking (The Trap)
                                </h3>
                            </div>
                            <ul className="space-y-3.5 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2.5">
                                    <X className="size-4 text-destructive shrink-0 mt-0.5" />
                                    <span>Records transactions after money is already spent</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <X className="size-4 text-destructive shrink-0 mt-0.5" />
                                    <span>Creates guilt without providing an actionable roadmap</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <X className="size-4 text-destructive shrink-0 mt-0.5" />
                                    <span>Ignores off-the-books allowances and cash leakage</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <X className="size-4 text-destructive shrink-0 mt-0.5" />
                                    <span>Leaves savings goals as vague wishful thinking</span>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-6 pt-4 border-t border-destructive/10 text-xs font-medium text-destructive">
                            Result: Recurring end-of-month anxiety & stagnated wealth
                        </div>
                    </div>

                    {/* Proactive Budget Planning Card */}
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Sparkles className="size-4" />
                                </span>
                                <h3 className="font-semibold text-foreground text-lg">
                                    Proactive Budget Planning (Our Standard)
                                </h3>
                            </div>
                            <ul className="space-y-3.5 text-sm text-foreground">
                                <li className="flex items-start gap-2.5">
                                    <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>Envelopes assign strict limits before you tap your card</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>Guilt-free spending within designated discretionary buckets</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>Integrated loan amortizations and milestone savings vaults</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>Gemini AI contextual guidance to optimize monthly cash flow</span>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-6 pt-4 border-t border-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            Result: Compounding peace of mind & accelerated financial independence
                        </div>
                    </div>
                </div>

                {/* 3 Interactive Pillars Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {pillars.map((pillar, idx) => {
                        const Icon = pillar.icon;
                        const isSelected = activePillar === idx;
                        return (
                            <div
                                key={idx}
                                onClick={() => setActivePillar(idx)}
                                className={`rounded-2xl p-6 transition-all duration-300 cursor-pointer border ${
                                    isSelected
                                        ? 'bg-background border-foreground/30 shadow-lg dark:shadow-black/40 ring-1 ring-foreground/10'
                                        : 'bg-background/60 border-border hover:border-border/80 hover:bg-background/90'
                                } card-interactive flex flex-col justify-between`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div
                                            className={`size-10 rounded-xl flex items-center justify-center ${
                                                isSelected
                                                    ? 'bg-foreground text-background'
                                                    : 'bg-neutral-100 dark:bg-neutral-800 text-foreground'
                                            }`}
                                        >
                                            <Icon className="size-5" />
                                        </div>
                                        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                                            0{idx + 1}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-foreground mb-1.5">
                                        {pillar.title}
                                    </h4>
                                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-3">
                                        {pillar.tagline}
                                    </p>
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                        {pillar.summary}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-border/60">
                                    <blockquote className="text-xs italic text-muted-foreground/80">
                                        "{pillar.quote}"
                                    </blockquote>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
