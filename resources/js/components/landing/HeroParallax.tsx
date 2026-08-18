import { useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { type User } from '@/types';
import { use3DScene, getDepthTransform } from '@/hooks/use-3d-scene';
import {
    ArrowRight,
    Sparkles,
    ShieldCheck,
    TrendingUp,
    CheckCircle2,
    Sliders,
    Wallet,
    Activity,
    Salad,
    Car,
} from 'lucide-react';

interface HeroParallaxProps {
    user?: User | null;
}

export default function HeroParallax({ user }: HeroParallaxProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const scene = use3DScene(containerRef);
    const [hoveredBar, setHoveredBar] = useState<number | null>(4); // Default to Friday

    const spendingDays = [
        { day: 'Mon', amount: 45, height: 35 },
        { day: 'Tue', amount: 80, height: 60 },
        { day: 'Wed', amount: 30, height: 25 },
        { day: 'Thu', amount: 65, height: 50 },
        { day: 'Fri', amount: 110, height: 85 },
        { day: 'Sat', amount: 95, height: 75 },
        { day: 'Sun', amount: 40, height: 30 },
    ];

    return (
        <section
            ref={containerRef}
            className="relative min-h-[105vh] flex flex-col justify-center pt-32 sm:pt-40 lg:pt-44 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden [perspective:1400px]"
        >
            {/* ========================================================= */}
            {/* PLANE 1: DEEP BACKGROUND (Z: -350px, Parallax Multiplier) */}
            {/* ========================================================= */}
            <div
                className="absolute inset-0 pointer-events-none -z-20 will-change-transform"
                style={getDepthTransform(scene, { depth: 0.15, zOffset: -350 })}
            >
                {/* Luminous Ambient Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[1000px] h-[550px] bg-gradient-to-tr from-emerald-500/15 via-amber-500/10 to-teal-500/15 blur-[160px] rounded-full dark:from-emerald-500/10 dark:via-amber-500/10 dark:to-teal-500/10" />

                {/* Geometric Grid Watermark */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.03] dark:opacity-[0.04] text-[16vw] font-black tracking-tighter text-foreground whitespace-nowrap">
                    BUDGET
                </div>

                {/* Floating Spatial Orbs */}
                <div className="absolute top-28 left-[12%] size-24 rounded-full bg-gradient-to-br from-emerald-400/20 to-transparent blur-md animate-float" />
                <div
                    className="absolute bottom-24 right-[10%] size-32 rounded-full bg-gradient-to-tl from-amber-400/20 to-transparent blur-lg animate-float"
                    style={{ animationDelay: '2s' }}
                />
            </div>

            {/* ========================================================= */}
            {/* PLANE 2: MAIN CONTENT HERO GRID (Z: 0px)                  */}
            {/* ========================================================= */}
            <div
                className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10 will-change-transform"
                style={getDepthTransform(scene, { depth: 0.5, rotateFactor: 2, zOffset: 0 })}
            >
                {/* Left Column: Typography & Conversion Copy */}
                <div className="lg:col-span-6 flex flex-col items-start text-left">
                    {/* Subhead Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-md mb-6 shadow-xs animate-reveal-up">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold tracking-tight text-foreground">
                            Budgeting built for real life
                        </span>
                        <span className="text-muted-foreground/40">|</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                            Plan ahead, spend without second-guessing
                        </span>
                    </div>

                    {/* Bold Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08] mb-6 animate-reveal-up delay-100">
                        Give every dollar a job
                        <br />
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 dark:from-emerald-400 dark:via-teal-400 dark:to-amber-400 bg-clip-text text-transparent">
                            before you spend it.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-8 animate-reveal-up delay-200">
                        Most apps only show what went wrong last month. Budget Planner lets you set clear category limits upfront, track cash spent on the fly, and accelerate debt payoff with real clarity.
                    </p>

                    {/* Dual Action CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10 animate-reveal-up delay-300">
                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-foreground text-background font-semibold text-base shadow-lg shadow-foreground/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
                            >
                                <span>Open your dashboard</span>
                                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('register')}
                                    className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-foreground text-background font-semibold text-base shadow-lg shadow-foreground/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
                                >
                                    <span>Get started for free</span>
                                    <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                                <a
                                    href="#simulator"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-border bg-background/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium text-base text-foreground transition-all duration-200 backdrop-blur-sm hover:-translate-y-0.5"
                                >
                                    <Sliders className="size-4 text-muted-foreground" />
                                    <span>Try budget calculator</span>
                                </a>
                            </>
                        )}
                    </div>

                    {/* Micro Trust Indicators */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-border/80 w-full animate-reveal-up delay-400">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                            <span className="text-xs text-muted-foreground font-medium">
                                Monthly spending limits
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                            <span className="text-xs text-muted-foreground font-medium">
                                Real-time cash tracking
                            </span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                            <Sparkles className="size-4 text-amber-500 shrink-0" />
                            <span className="text-xs text-muted-foreground font-medium">
                                Smart AI category tags
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Interactive Dashboard Mockup Stage */}
                <div className="lg:col-span-6 relative flex items-center justify-center mt-4 lg:mt-0 [transform-style:preserve-3d]">
                    {/* Centerpiece Dashboard Canvas */}
                    <div
                        className="relative w-full max-w-[520px] rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] will-change-transform animate-reveal-scale delay-200 transition-all duration-300"
                        style={getDepthTransform(scene, { depth: 1.05, rotateFactor: 10, zOffset: 60 })}
                    >
                        {/* Dynamic Specular Glare Sheen following cursor/tilt */}
                        <div
                            className="absolute inset-0 pointer-events-none rounded-3xl opacity-30 dark:opacity-20 transition-opacity"
                            style={{
                                background:
                                    'radial-gradient(circle 360px at var(--scene-light-x, 50%) var(--scene-light-y, 50%), rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 80%)',
                            }}
                        />

                        {/* Top Mockup Header Bar */}
                        <div className="flex items-center justify-between pb-5 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                    <Wallet className="size-4" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground font-medium">Active Envelope</div>
                                    <div className="text-sm font-bold text-foreground">August 2026 Overview</div>
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>94% On Track</span>
                            </div>
                        </div>

                        {/* Balance Key Figures */}
                        <div className="grid grid-cols-2 gap-4 my-5">
                            <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/70 border border-border/50">
                                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                    Total Income
                                </div>
                                <div className="text-xl font-bold font-mono text-foreground mt-0.5">
                                    $5,200.00
                                </div>
                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                                    <TrendingUp className="size-3" />
                                    <span>100% assigned</span>
                                </div>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/70 border border-border/50">
                                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                    Remaining Buffer
                                </div>
                                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    $1,664.00
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1">
                                    Safe to spend this week
                                </div>
                            </div>
                        </div>

                        {/* Live 7-Day Spending Interactive Mini-Chart */}
                        <div className="mb-5 p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-950/60 border border-border/60">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                    <Activity className="size-3.5 text-emerald-500" />
                                    <span>7-Day Spending Activity</span>
                                </div>
                                <span className="text-[11px] font-mono text-muted-foreground">
                                    {hoveredBar !== null ? `$${spendingDays[hoveredBar].amount}.00` : 'Tap a day'}
                                </span>
                            </div>

                            <div className="h-20 flex items-end justify-between gap-2 pt-2 px-1">
                                {spendingDays.map((item, idx) => (
                                    <div
                                        key={item.day}
                                        onMouseEnter={() => setHoveredBar(idx)}
                                        className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
                                    >
                                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-16 rounded-lg overflow-hidden flex items-end p-0.5">
                                            <div
                                                className={`w-full rounded-md transition-all duration-300 ${
                                                    hoveredBar === idx
                                                        ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                                                        : 'bg-emerald-500/60 group-hover:bg-emerald-500/80'
                                                }`}
                                                style={{ height: `${item.height}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                            {item.day}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Category Spending Envelopes */}
                        <div className="space-y-2.5">
                            <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                                <span>Category Allocations</span>
                                <span className="text-[11px] text-muted-foreground font-normal">Cap & Status</span>
                            </div>

                            {/* Category 1 */}
                            <div className="p-2.5 rounded-xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-border/40 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="flex items-center gap-1.5 text-foreground">
                                        <Salad className="size-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                                        <span>Groceries & Essentials</span>
                                    </span>
                                    <span className="font-mono text-muted-foreground">$420 / $600</span>
                                </div>
                                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full w-[70%]" />
                                </div>
                            </div>

                            {/* Category 2 */}
                            <div className="p-2.5 rounded-xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-border/40 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="flex items-center gap-1.5 text-foreground">
                                        <Car className="size-3.5 text-amber-500 shrink-0" aria-hidden="true" />
                                        <span>Transport & Commute</span>
                                    </span>
                                    <span className="font-mono text-muted-foreground">$180 / $250</span>
                                </div>
                                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full rounded-full w-[72%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================= */}
                    {/* PLANE 3: FLOATING SATELLITE WIDGETS (Z: +220px to +300px) */}
                    {/* ========================================================= */}

                    {/* Floating Satellite Widget A: Savings Goal */}
                    <div
                        className="absolute -top-4 -left-6 sm:-left-10 bg-card/95 backdrop-blur-2xl border border-border/90 rounded-2xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] max-w-[190px] hidden sm:flex flex-col gap-1.5 z-30 pointer-events-none will-change-transform animate-reveal-scale delay-400"
                        style={getDepthTransform(scene, { depth: 1.6, rotateFactor: 6, zOffset: 180 })}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                                Savings Vault
                            </span>
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <span className="text-sm font-bold text-foreground">Emergency Fund</span>
                        <div className="flex items-center justify-between text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            <span>$12,600</span>
                            <span>84%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[84%]" />
                        </div>
                    </div>

                    {/* Floating Satellite Widget B: Debt Payoff Milestone */}
                    <div
                        className="absolute -bottom-5 -right-4 sm:-right-8 bg-card/95 backdrop-blur-2xl border border-border/90 rounded-2xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.75)] max-w-[210px] flex flex-col gap-1.5 z-30 pointer-events-none will-change-transform animate-reveal-scale delay-600"
                        style={getDepthTransform(scene, { depth: 2.1, rotateFactor: 8, zOffset: 220 })}
                    >
                        <div className="flex items-center gap-1.5">
                            <div className="size-5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                                <Sparkles className="size-3" />
                            </div>
                            <span className="text-xs font-semibold text-foreground">Loan Accelerator</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Extra <span className="font-bold text-foreground font-mono">+$150/mo</span> saves{' '}
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">14 Months</span> of interest
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div
                className="mt-auto pt-14 flex flex-col items-center justify-center text-xs text-muted-foreground"
                aria-hidden="true"
                style={{ opacity: 'max(0, calc(1 - var(--scene-scroll-progress, 0) * 4))' }}
            >
                <span className="mb-2 font-medium tracking-wider uppercase text-[10px]">
                    Scroll to discover more
                </span>
                <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
                    <div className="w-1 h-2 rounded-full bg-foreground animate-bounce" />
                </div>
            </div>
        </section>
    );
}
