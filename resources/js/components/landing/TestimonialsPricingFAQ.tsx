import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { type User } from '@/types';
import ScrollReveal from '@/components/landing/ScrollReveal';
import {
    Star,
    Check,
    HelpCircle,
    ChevronDown,
    Sparkles,
    ShieldCheck,
    Zap,
    ArrowRight,
} from 'lucide-react';

interface TestimonialsPricingFAQProps {
    user?: User | null;
}

export default function TestimonialsPricingFAQ({ user }: TestimonialsPricingFAQProps) {
    const [openFaq, setOpenFaq] = useState<number | null>(0); // First item expanded by default
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

    const testimonials = [
        {
            name: 'Sarah Jenkins',
            role: 'Product Designer',
            avatar: 'SJ',
            avatarBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            quote:
                'I tried five different budgeting apps that connected to my bank, but they always classified things wrong after the fact. Setting category envelopes upfront saved me over $4,200 in just six months.',
            rating: 5,
            tag: 'Saved $4,200 in 6mo',
        },
        {
            name: 'Marcus Vance',
            role: 'Freelance Developer',
            avatar: 'MV',
            avatarBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            quote:
                'The loan payoff accelerator completely shifted my mindset. Seeing the exact month my student debt would disappear gave me the motivation to put extra cash into principal payments.',
            rating: 5,
            tag: 'Debt-Free 14mo Early',
        },
        {
            name: 'Elena Rostova',
            role: 'Operations Manager',
            avatar: 'ER',
            avatarBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
            quote:
                'The cash tracking is what makes this app unique. Logging quick everyday expenses right away means my balance never drifts by even one dollar. Absolute peace of mind.',
            rating: 5,
            tag: 'Zero Balance Drift',
        },
    ];

    const faqs = [
        {
            question: 'How is Budget Planner different from automated bank-sync apps?',
            answer:
                'Most automated apps report what you spent days after it happened, which is too late to change behavior. Budget Planner focuses on intentional proactive budgeting: you assign your income into clear category limits at the start of the month and track cash on the fly so you never overspend.',
        },
        {
            question: 'Is my personal and financial data kept private?',
            answer:
                'Yes, 100%. We do not sell your personal data, run targeted advertising, or share your financial records with third parties. All transactions and account numbers are isolated securely under your own account.',
        },
        {
            question: 'How does the Gemini AI financial assistant work?',
            answer:
                'Gemini AI acts as your intelligent spending copilot. It helps automatically suggest category tags for transactions, spots trends in recurring subscriptions, and answers questions like "How much did I spend on dining this quarter?" directly in natural language.',
        },
        {
            question: 'Can I export my financial statements and audit logs?',
            answer:
                'Yes. You can generate and stream complete CSV financial reports anytime. The export includes executive KPI summaries, category breakdowns, 6-month historical trends, active loans, savings goals, and every single transaction ledger entry.',
        },
        {
            question: 'Can I use Budget Planner for free?',
            answer:
                'Yes. The free tier gives you access to full monthly category envelopes, cash tracking, bank transfers, savings vaults, and loan payoff tracking without trial limits or credit card requirements.',
        },
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50/50 dark:bg-neutral-950/40 border-t border-border/60">
            <div className="max-w-7xl mx-auto space-y-28">
                {/* ========================================================= */}
                {/* 1. TESTIMONIALS & SOCIAL PROOF                            */}
                {/* ========================================================= */}
                <div id="testimonials">
                    <ScrollReveal animation="up" className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 mb-2 block">
                            Real stories
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                            Loved by intentional planners
                        </h2>
                        <p className="text-muted-foreground text-base sm:text-lg">
                            Here is how everyday users took control of their spending and reached their savings targets faster.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((item, idx) => (
                            <ScrollReveal
                                key={idx}
                                animation="scale"
                                delay={idx * 120}
                                className="bg-card border border-border/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                            >
                                <div>
                                    {/* Star Rating & Highlight Pill */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-1 text-amber-500">
                                            {[...Array(item.rating)].map((_, i) => (
                                                <Star key={i} className="size-4 fill-amber-500 text-amber-500" />
                                            ))}
                                        </div>
                                        <span className="text-[11px] font-semibold font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                            {item.tag}
                                        </span>
                                    </div>

                                    {/* Quote */}
                                    <p className="text-sm sm:text-base text-foreground leading-relaxed mb-6">
                                        "{item.quote}"
                                    </p>
                                </div>

                                {/* Author Info */}
                                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                    <div
                                        className={`size-10 rounded-full flex items-center justify-center font-bold text-xs ${item.avatarBg}`}
                                    >
                                        {item.avatar}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-foreground">
                                            {item.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {item.role}
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 2. TRANSPARENT PRICING                                    */}
                {/* ========================================================= */}
                <div id="pricing">
                    <ScrollReveal animation="up" className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-2 block">
                            Simple & transparent
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                            Invest in clarity, not bloated fees
                        </h2>
                        <p className="text-muted-foreground text-base sm:text-lg">
                            Get started for free with full core functionality. Upgrade to Pro when you want smart AI coaching and unlimited analytics.
                        </p>

                        {/* Billing Switcher Toggle */}
                        <div className="inline-flex items-center p-1 rounded-xl bg-neutral-200/70 dark:bg-neutral-800/70 mt-6 text-xs font-semibold">
                            <button
                                onClick={() => setBillingPeriod('monthly')}
                                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    billingPeriod === 'monthly'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Monthly Billing
                            </button>
                            <button
                                onClick={() => setBillingPeriod('yearly')}
                                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                    billingPeriod === 'yearly'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <span>Annual Billing</span>
                                <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                    Save 25%
                                </span>
                            </button>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Tier Card */}
                        <ScrollReveal
                            animation="scale"
                            delay={100}
                            className="bg-card border border-border rounded-3xl p-8 flex flex-col justify-between shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                        >
                            <div>
                                <div className="text-lg font-bold text-foreground mb-1">
                                    Standard Free
                                </div>
                                <div className="text-xs text-muted-foreground mb-6">
                                    Everything you need to master your everyday cash flow.
                                </div>

                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-extrabold font-mono text-foreground">$0</span>
                                    <span className="text-xs text-muted-foreground">/ forever</span>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-border/60 text-xs sm:text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2.5 text-foreground">
                                        <Check className="size-4 text-emerald-500 shrink-0" />
                                        <span>Unlimited monthly envelope budgets</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-foreground">
                                        <Check className="size-4 text-emerald-500 shrink-0" />
                                        <span>Real-time cash spending ledger</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-foreground">
                                        <Check className="size-4 text-emerald-500 shrink-0" />
                                        <span>Multi-account tracking & transfers</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-foreground">
                                        <Check className="size-4 text-emerald-500 shrink-0" />
                                        <span>Debt payoff & loan ledger</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-foreground">
                                        <Check className="size-4 text-emerald-500 shrink-0" />
                                        <span>Full CSV statement exports</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <Link
                                    href={user ? route('dashboard') : route('register')}
                                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold text-sm text-foreground transition-all duration-200"
                                >
                                    <span>{user ? 'Open Dashboard' : 'Get Started Free'}</span>
                                </Link>
                            </div>
                        </ScrollReveal>

                        {/* Pro Tier Card */}
                        <ScrollReveal
                            animation="scale"
                            delay={200}
                            className="relative bg-neutral-900 text-neutral-50 dark:bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl overflow-hidden"
                        >
                            {/* Decorative Accent Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="text-lg font-bold text-white">
                                        Pro Copilot
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                                        <Sparkles className="size-3" />
                                        <span>Most Popular</span>
                                    </span>
                                </div>
                                <div className="text-xs text-neutral-400 mb-6">
                                    Smart AI insights, predictive trend models, and automated categorization.
                                </div>

                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-extrabold font-mono text-white">
                                        {billingPeriod === 'yearly' ? '$3.75' : '$5.00'}
                                    </span>
                                    <span className="text-xs text-neutral-400">/ month, billed {billingPeriod}</span>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-neutral-800 text-xs sm:text-sm text-neutral-300">
                                    <div className="flex items-center gap-2.5 text-white">
                                        <Check className="size-4 text-emerald-400 shrink-0" />
                                        <span>Everything included in Free</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-white">
                                        <Check className="size-4 text-emerald-400 shrink-0" />
                                        <span>Unlimited Gemini AI spending assistant</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-white">
                                        <Check className="size-4 text-emerald-400 shrink-0" />
                                        <span>Smart recurring bill & leak detection</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-white">
                                        <Check className="size-4 text-emerald-400 shrink-0" />
                                        <span>Automated category suggestion on import</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-white">
                                        <Check className="size-4 text-emerald-400 shrink-0" />
                                        <span>Priority cloud sync & multi-device backup</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 relative z-10">
                                <Link
                                    href={user ? route('dashboard') : route('register')}
                                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-neutral-950 hover:bg-neutral-100 font-bold text-sm shadow-md transition-all duration-200"
                                >
                                    <span>{user ? 'Upgrade to Pro' : 'Try Pro 14 Days Free'}</span>
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 3. FREQUENTLY ASKED QUESTIONS                             */}
                {/* ========================================================= */}
                <div id="faq" className="max-w-3xl mx-auto">
                    <ScrollReveal animation="up" className="text-center mb-12">
                        <span className="text-xs font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 mb-2 block">
                            Questions & Answers
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                            Frequently asked questions
                        </h2>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            Got questions? We have answers to help you get started with confidence.
                        </p>
                    </ScrollReveal>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <ScrollReveal
                                    key={idx}
                                    animation="up"
                                    delay={idx * 60}
                                    className="bg-card border border-border/80 rounded-2xl overflow-hidden transition-all duration-200"
                                >
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                                        aria-expanded={isOpen}
                                    >
                                        <span className="text-sm sm:text-base font-semibold text-foreground">
                                            {faq.question}
                                        </span>
                                        <ChevronDown
                                            className={`size-5 text-muted-foreground shrink-0 transition-transform duration-300 ${
                                                isOpen ? 'rotate-180 text-foreground' : ''
                                            }`}
                                        />
                                    </button>

                                    {isOpen && (
                                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4 animate-fade-in-up">
                                            {faq.answer}
                                        </div>
                                    )}
                                </ScrollReveal>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
