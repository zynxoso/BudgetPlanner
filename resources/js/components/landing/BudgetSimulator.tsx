import { useState, useMemo, useEffect, useRef } from 'react';
import { Sliders, Sparkles, Wallet, ArrowRight, RefreshCw } from 'lucide-react';
import ScrollReveal from '@/components/landing/ScrollReveal';

interface Currency {
    code: string;
    symbol: string;
    name: string;
    defaultIncome: number;
    min: number;
    max: number;
    step: number;
}

const CURRENCIES: Currency[] = [
    { code: 'USD', symbol: '$', name: 'USD ($)', defaultIncome: 6500, min: 1500, max: 25000, step: 250 },
    { code: 'PHP', symbol: '₱', name: 'PHP (₱)', defaultIncome: 75000, min: 20000, max: 350000, step: 5000 },
    { code: 'EUR', symbol: '€', name: 'EUR (€)', defaultIncome: 5500, min: 1200, max: 20000, step: 200 },
    { code: 'GBP', symbol: '£', name: 'GBP (£)', defaultIncome: 4500, min: 1000, max: 18000, step: 200 },
    { code: 'CAD', symbol: 'CA$', name: 'CAD ($)', defaultIncome: 7000, min: 1800, max: 28000, step: 250 },
    { code: 'AUD', symbol: 'A$', name: 'AUD ($)', defaultIncome: 7500, min: 2000, max: 30000, step: 250 },
];

interface Preset {
    id: string;
    name: string;
    needsPct: number;
    wantsPct: number;
    savingsPct: number;
    description: string;
}

const PRESETS: Preset[] = [
    {
        id: 'balanced',
        name: '50/30/20 Rule',
        needsPct: 50,
        wantsPct: 30,
        savingsPct: 20,
        description: '50% essentials, 30% fun, 20% savings. A solid, balanced starting point.',
    },
    {
        id: 'wealth',
        name: 'Aggressive Savings (40/15/45)',
        needsPct: 40,
        wantsPct: 15,
        savingsPct: 45,
        description: 'Prioritizes rapid savings for an emergency fund or investments.',
    },
    {
        id: 'debt_crusher',
        name: 'Debt Payoff Focus (45/15/40)',
        needsPct: 45,
        wantsPct: 15,
        savingsPct: 40,
        description: 'Channels extra cash into paying down loans and credit cards.',
    },
];

function useAnimatedValue(target: number, duration = 250) {
    const [display, setDisplay] = useState(target);
    const rafRef = useRef<number | null>(null);
    const fromRef = useRef(target);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setDisplay(target);
            return;
        }

        const start = performance.now();
        const from = fromRef.current;

        const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(2, -8 * t); // quick ease-out
            setDisplay(Math.round(from + (target - from) * eased));
            if (t < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                fromRef.current = target;
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            fromRef.current = display;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, duration]);

    return display;
}

export default function BudgetSimulator() {
    const [currencyCode, setCurrencyCode] = useState<string>('USD');
    const currency = useMemo(() => CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0], [currencyCode]);

    const [income, setIncome] = useState<number>(currency.defaultIncome);
    const animatedIncome = useAnimatedValue(income);
    const [selectedPreset, setSelectedPreset] = useState<string>('balanced');
    const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
    const [aiInsight, setAiInsight] = useState<string | null>(null);

    const handleCurrencyChange = (code: string) => {
        const selected = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
        setCurrencyCode(code);
        setIncome(selected.defaultIncome);
        setAiInsight(null);
    };

    const activePreset = useMemo(() => {
        return PRESETS.find((p) => p.id === selectedPreset) || PRESETS[0];
    }, [selectedPreset]);

    const needsPct = activePreset.needsPct;
    const wantsPct = activePreset.wantsPct;
    const savingsPct = activePreset.savingsPct;

    const needsAmount = (income * needsPct) / 100;
    const wantsAmount = (income * wantsPct) / 100;
    const savingsAmount = (income * savingsPct) / 100;

    // 1-yr, 3-yr, 5-yr compounding with 7% annual returns (0.583% monthly)
    const calculateGrowth = (months: number) => {
        const monthlyRate = 0.07 / 12;
        let total = 0;
        for (let i = 0; i < months; i++) {
            total = (total + savingsAmount) * (1 + monthlyRate);
        }
        return Math.round(total);
    };

    const growth1Yr = calculateGrowth(12);
    const growth3Yr = calculateGrowth(36);
    const growth5Yr = calculateGrowth(60);

    const sym = currency.symbol;

    const handleGenerateAiInsight = () => {
        setIsGeneratingAi(true);
        setTimeout(() => {
            let advice = '';
            if (savingsPct >= 40) {
                advice = `Solid pace. Saving ${sym}${savingsAmount.toLocaleString()}/mo puts your projected 5-year total around ${sym}${growth5Yr.toLocaleString()}. Make sure you keep about 3 to 6 months of expenses (${sym}${(needsAmount * 4).toLocaleString()}) easily accessible before locking money into long-term accounts.`;
            } else if (needsPct > 55) {
                advice = `Fixed essentials take up ${sym}${needsAmount.toLocaleString()} (${needsPct}%). Reviewing recurring subscriptions or bills could free up extra cash each month toward savings.`;
            } else {
                advice = `A balanced plan. Putting ${sym}${needsAmount.toLocaleString()} toward essentials, ${sym}${wantsAmount.toLocaleString()} toward flexible spending, and ${sym}${savingsAmount.toLocaleString()} into savings builds around ${sym}${growth3Yr.toLocaleString()} in 3 years without feeling too restrictive.`;
            }
            setAiInsight(advice);
            setIsGeneratingAi(false);
        }, 400);
    };

    return (
        <section id="simulator" className="py-24 px-4 sm:px-6 lg:px-8 bg-background border-t border-border/60">
            <div className="max-w-7xl mx-auto">
                {/* Section Header with ScrollReveal */}
                <ScrollReveal animation="up" className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3">
                        <Sliders className="size-3.5" />
                        <span>Interactive Budget Calculator</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                        See how your numbers look under different budgets
                    </h2>
                    <p className="text-muted-foreground text-base sm:text-lg">
                        Adjust your monthly income and try different spending splits. See real-time compounding projections for 1, 3, and 5 years.
                    </p>
                </ScrollReveal>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Input & Framework Controls (7 cols) with ScrollReveal */}
                    <ScrollReveal animation="scale" delay={150} className="lg:col-span-7 bg-card/90 dark:bg-neutral-900/60 border border-border/80 rounded-3xl p-6 sm:p-8 flex flex-col gap-8 shadow-xs backdrop-blur-sm">
                        {/* Currency Switcher */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Select Currency
                                </label>
                                <span className="text-xs text-muted-foreground">
                                    Active: <strong className="text-foreground">{currency.name}</strong>
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {CURRENCIES.map((c) => (
                                    <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => handleCurrencyChange(c.code)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                            currencyCode === c.code
                                                ? 'bg-foreground text-background border-foreground shadow-xs'
                                                : 'bg-background/80 border-border text-muted-foreground hover:text-foreground hover:bg-background'
                                        }`}
                                    >
                                        {c.code} ({c.symbol})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Income Slider */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Wallet className="size-4 text-muted-foreground" />
                                    <span>Monthly Take-Home Income</span>
                                </label>
                                <span className="text-2xl font-bold font-mono text-foreground tabular-nums">
                                    {sym}{animatedIncome.toLocaleString()}
                                </span>
                            </div>
                            <input
                                type="range"
                                id="simulator-income"
                                min={currency.min}
                                max={currency.max}
                                step={currency.step}
                                value={income}
                                onChange={(e) => setIncome(Number(e.target.value))}
                                aria-label={`Monthly take-home income, currently ${sym}${income.toLocaleString()}`}
                                className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-foreground"
                            />
                            <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 font-mono">
                                <span>{sym}{currency.min.toLocaleString()}/mo</span>
                                <span>{sym}{Math.round((currency.min + currency.max) / 2).toLocaleString()}/mo</span>
                                <span>{sym}{currency.max.toLocaleString()}/mo</span>
                            </div>
                        </div>

                        {/* Preset Framework Selector */}
                        <div>
                            <label className="text-sm font-semibold text-foreground block mb-3">
                                Choose a budget framework
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {PRESETS.map((p) => {
                                    const active = selectedPreset === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedPreset(p.id);
                                                setAiInsight(null);
                                            }}
                                            className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                                active
                                                    ? 'bg-background border-foreground text-foreground shadow-xs ring-1 ring-foreground/20'
                                                    : 'bg-background/50 border-border text-muted-foreground hover:text-foreground hover:bg-background'
                                            }`}
                                        >
                                            <div className="text-xs font-bold leading-tight mb-1 text-foreground">
                                                {p.name}
                                            </div>
                                            <div className="text-[11px] leading-snug line-clamp-2">
                                                {p.description}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Allocation Visual Bar */}
                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-2">
                                <span>Monthly Spending Split</span>
                                <span className="text-muted-foreground">Essentials / Flexible / Savings</span>
                            </div>
                            <div className="h-4 w-full rounded-full overflow-hidden flex bg-neutral-200 dark:bg-neutral-800 p-0.5 gap-0.5">
                                <div
                                    style={{ width: `${needsPct}%` }}
                                    className="h-full bg-neutral-900 dark:bg-neutral-100 rounded-l-full transition-all duration-300 relative group cursor-pointer"
                                    title={`Needs: ${needsPct}% (${sym}${needsAmount.toLocaleString()})`}
                                />
                                <div
                                    style={{ width: `${wantsPct}%` }}
                                    className="h-full bg-amber-500 transition-all duration-300 relative group cursor-pointer"
                                    title={`Wants: ${wantsPct}% (${sym}${wantsAmount.toLocaleString()})`}
                                />
                                <div
                                    style={{ width: `${savingsPct}%` }}
                                    className="h-full bg-emerald-500 rounded-r-full transition-all duration-300 relative group cursor-pointer"
                                    title={`Savings/Debt: ${savingsPct}% (${sym}${savingsAmount.toLocaleString()})`}
                                />
                            </div>

                            {/* Legend / Bucket Breakdown */}
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                <div className="p-3 rounded-2xl bg-background border border-border/80">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                        <div className="size-2 rounded-full bg-neutral-900 dark:bg-neutral-100" aria-hidden="true" />
                                        <span>Essentials ({needsPct}%)</span>
                                    </div>
                                    <div className="text-base font-bold font-mono text-foreground">
                                        {sym}{needsAmount.toLocaleString()}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">Rent, food, bills</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-background border border-border/80">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                        <div className="size-2 rounded-full bg-amber-500" aria-hidden="true" />
                                        <span>Flexible ({wantsPct}%)</span>
                                    </div>
                                    <div className="text-base font-bold font-mono text-foreground">
                                        {sym}{wantsAmount.toLocaleString()}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">Dining & leisure</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-background border border-border/80">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                        <div className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                                        <span>Savings ({savingsPct}%)</span>
                                    </div>
                                    <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                        {sym}{savingsAmount.toLocaleString()}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">Goals & debt paydown</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive AI Advisor Simulator Box */}
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-amber-500" />
                                    <span className="text-xs font-semibold text-foreground">
                                        AI Budget Assistant
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGenerateAiInsight}
                                    disabled={isGeneratingAi}
                                    aria-live="off"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    <RefreshCw className={`size-3 ${isGeneratingAi ? 'animate-spin' : ''}`} aria-hidden="true" />
                                    <span>{isGeneratingAi ? 'Thinking...' : 'Get Advice'}</span>
                                </button>
                            </div>
                            <p
                                className="text-xs text-muted-foreground leading-relaxed"
                                aria-live="polite"
                            >
                                {aiInsight ||
                                    `With an income of ${sym}${income.toLocaleString()}/mo and ${sym}${savingsAmount.toLocaleString()}/mo going to savings, click "Get Advice" to see how the assistant evaluates your plan.`}
                            </p>
                        </div>
                    </ScrollReveal>

                    {/* Right: Compound Velocity Projection Card (5 cols) */}
                    <ScrollReveal animation="scale" delay={300} className="lg:col-span-5 bg-neutral-900 text-neutral-50 dark:bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                                    Savings Projection
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Assumes 7% avg return
                                </span>
                            </div>

                            <h3 className="text-xl font-bold tracking-tight text-white mb-2">
                                Projected Savings Growth
                            </h3>
                            <p className="text-xs text-neutral-400 mb-8 leading-relaxed">
                                Saving <strong className="text-emerald-400">{sym}{savingsAmount.toLocaleString()}/mo</strong> builds a reliable safety net over time.
                            </p>

                            {/* Milestone Projections */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700/60">
                                    <div>
                                        <div className="text-xs text-neutral-400">After 1 Year</div>
                                        <div className="text-lg font-bold font-mono text-white">
                                            {sym}{growth1Yr.toLocaleString()}
                                        </div>
                                    </div>
                                    <span className="text-xs text-neutral-400">12 months</span>
                                </div>

                                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700/60">
                                    <div>
                                        <div className="text-xs text-neutral-400">After 3 Years</div>
                                        <div className="text-lg font-bold font-mono text-white">
                                            {sym}{growth3Yr.toLocaleString()}
                                        </div>
                                    </div>
                                    <span className="text-xs text-neutral-400">36 months</span>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-inner">
                                    <div>
                                        <div className="text-xs font-semibold text-emerald-400">After 5 Years</div>
                                        <div className="text-2xl font-bold font-mono text-emerald-300">
                                            {sym}{growth5Yr.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] text-emerald-400 font-medium">
                                            +{sym}{(growth5Yr - savingsAmount * 60).toLocaleString()} earned returns
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                            <span>Ready to see all features?</span>
                            <a
                                href="#capabilities"
                                className="text-white hover:text-amber-400 transition-colors inline-flex items-center gap-1 font-semibold"
                            >
                                <span>Explore tools</span>
                                <ArrowRight className="size-3.5" />
                            </a>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
}
