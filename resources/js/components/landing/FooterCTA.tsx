import { Link } from '@inertiajs/react';
import { type User } from '@/types';
import AppLogoIcon from '@/components/app-logo-icon';
import { ArrowRight, ShieldCheck, Sparkles, Heart, CheckCircle2, Lock } from 'lucide-react';
import ScrollReveal from '@/components/landing/ScrollReveal';

interface FooterCTAProps {
    user?: User | null;
}

export default function FooterCTA({ user }: FooterCTAProps) {
    return (
        <footer className="bg-background border-t border-border/80">
            {/* Top High-Impact Minimal CTA Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <ScrollReveal animation="scale">
                    <div className="relative rounded-3xl bg-neutral-900 text-neutral-50 dark:bg-neutral-900 border border-neutral-800 p-8 sm:p-14 overflow-hidden shadow-2xl">
                        {/* Background Subtle Ambient Glow */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="relative max-w-2xl z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700 mb-4">
                                <Sparkles className="size-3.5 text-amber-400" />
                                <span>Start planning with clarity</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                                Ready to take control of your monthly spending?
                            </h2>
                            <p className="text-base sm:text-lg text-neutral-400 mb-8 leading-relaxed">
                                No ads, no intrusive bank selling, and no hidden subscriptions. Just a clean, intentional planner that helps you keep more of what you earn.
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                                {user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-neutral-950 font-bold hover:bg-neutral-100 transition-all shadow-md hover:-translate-y-0.5"
                                    >
                                        <span>Open your dashboard</span>
                                        <ArrowRight className="size-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-neutral-950 font-bold hover:bg-neutral-100 transition-all shadow-md hover:-translate-y-0.5"
                                        >
                                            <span>Create a free account</span>
                                            <ArrowRight className="size-4" />
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-200 font-medium transition-all"
                                        >
                                            <span>Sign In</span>
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Trust badges */}
                            <div className="flex flex-wrap items-center gap-5 text-xs text-neutral-400 pt-4 border-t border-neutral-800">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                                    <span>Free forever core features</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Lock className="size-3.5 text-emerald-400" />
                                    <span>No data selling or ads</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck className="size-3.5 text-emerald-400" />
                                    <span>Instant setup in &lt; 30 seconds</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            {/* Bottom Footer Credits & Links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                    <div className="bg-foreground text-background flex aspect-square size-7 items-center justify-center rounded-lg shadow-xs">
                        <AppLogoIcon className="size-4 fill-current text-white dark:text-black" />
                    </div>
                    <span className="font-bold text-sm text-foreground">Budget Planner</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <a href="#philosophy" className="hover:text-foreground transition-colors">
                        Philosophy
                    </a>
                    <a href="#simulator" className="hover:text-foreground transition-colors">
                        Calculator
                    </a>
                    <a href="#capabilities" className="hover:text-foreground transition-colors">
                        Capabilities
                    </a>
                    <a href="#clarity" className="hover:text-foreground transition-colors">
                        Impact
                    </a>
                    <a href="#testimonials" className="hover:text-foreground transition-colors">
                        Reviews
                    </a>
                    <a href="#pricing" className="hover:text-foreground transition-colors">
                        Pricing
                    </a>
                    <a href="#faq" className="hover:text-foreground transition-colors">
                        FAQ
                    </a>
                </div>
            </div>
        </footer>
    );
}
