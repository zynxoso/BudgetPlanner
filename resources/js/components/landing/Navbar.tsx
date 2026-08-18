import { Link } from '@inertiajs/react';
import { type User } from '@/types';
import AppLogoIcon from '@/components/app-logo-icon';
import { useAppearance } from '@/hooks/use-appearance';
import { Moon, Sun, ArrowRight, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavbarProps {
    user?: User | null;
}

export default function Navbar({ user }: NavbarProps) {
    const { appearance, updateAppearance } = useAppearance();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-slide-down ${
                scrolled
                    ? 'bg-background/85 backdrop-blur-xl border-b border-border/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]'
                    : 'bg-transparent border-b border-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="bg-foreground text-background flex aspect-square size-9 items-center justify-center rounded-xl shadow-xs group-hover:scale-105 transition-transform duration-200">
                        <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                    </div>
                    <span className="text-base font-bold tracking-tight text-foreground">
                        Budget Planner
                    </span>
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-muted-foreground">
                    <a
                        href="#philosophy"
                        className="hover:text-foreground underline-offset-8 hover:underline decoration-2 decoration-muted-foreground/50 transition-colors duration-150"
                    >
                        Philosophy
                    </a>
                    <a
                        href="#simulator"
                        className="hover:text-foreground underline-offset-8 hover:underline decoration-2 decoration-muted-foreground/50 transition-colors duration-150 flex items-center gap-1.5"
                    >
                        <span>Calculator</span>
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </a>
                    <a
                        href="#capabilities"
                        className="hover:text-foreground underline-offset-8 hover:underline decoration-2 decoration-muted-foreground/50 transition-colors duration-150"
                    >
                        Capabilities
                    </a>
                    <a
                        href="#clarity"
                        className="hover:text-foreground underline-offset-8 hover:underline decoration-2 decoration-muted-foreground/50 transition-colors duration-150"
                    >
                        Impact
                    </a>
                    <a
                        href="#testimonials"
                        className="hover:text-foreground underline-offset-8 hover:underline decoration-2 decoration-muted-foreground/50 transition-colors duration-150"
                    >
                        Reviews
                    </a>
                    <a
                        href="#pricing"
                        className="hover:text-foreground underline-offset-8 hover:underline decoration-2 decoration-muted-foreground/50 transition-colors duration-150"
                    >
                        Pricing
                    </a>
                    <a
                        href="#faq"
                        className="hover:text-foreground underline-offset-8 hover:underline decoration-2 decoration-muted-foreground/50 transition-colors duration-150"
                    >
                        FAQ
                    </a>
                </nav>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Theme Toggle Button */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all"
                    >
                        {appearance === 'dark' ? (
                            <Sun className="size-4.5 text-amber-400" />
                        ) : (
                            <Moon className="size-4.5 text-neutral-700" />
                        )}
                    </button>

                    {user ? (
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-foreground text-background hover:opacity-90 transition-all shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <span>Open Dashboard</span>
                            <ArrowRight className="size-4" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-foreground text-background hover:opacity-90 transition-all shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <span>Get Started</span>
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex lg:hidden items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        {appearance === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-nav"
                    >
                        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {mobileOpen && (
                <div
                    id="mobile-nav"
                    className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 pt-3 pb-6 space-y-4 animate-scale-in"
                >
                    <nav className="flex flex-col space-y-3 text-base font-medium text-muted-foreground">
                        <a
                            href="#philosophy"
                            onClick={() => setMobileOpen(false)}
                            className="hover:text-foreground py-1"
                        >
                            Philosophy
                        </a>
                        <a
                            href="#simulator"
                            onClick={() => setMobileOpen(false)}
                            className="hover:text-foreground py-1 flex items-center justify-between"
                        >
                            <span>Budget Calculator</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                                Interactive
                            </span>
                        </a>
                        <a
                            href="#capabilities"
                            onClick={() => setMobileOpen(false)}
                            className="hover:text-foreground py-1"
                        >
                            System Capabilities
                        </a>
                        <a
                            href="#clarity"
                            onClick={() => setMobileOpen(false)}
                            className="hover:text-foreground py-1"
                        >
                            Financial Impact
                        </a>
                        <a
                            href="#testimonials"
                            onClick={() => setMobileOpen(false)}
                            className="hover:text-foreground py-1"
                        >
                            Customer Stories
                        </a>
                        <a
                            href="#pricing"
                            onClick={() => setMobileOpen(false)}
                            className="hover:text-foreground py-1"
                        >
                            Transparent Pricing
                        </a>
                        <a
                            href="#faq"
                            onClick={() => setMobileOpen(false)}
                            className="hover:text-foreground py-1"
                        >
                            FAQ
                        </a>
                    </nav>

                    <div className="pt-3 border-t border-border flex flex-col gap-2.5">
                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="w-full text-center py-2.5 rounded-xl bg-foreground text-background font-semibold text-sm"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="w-full text-center py-2.5 rounded-xl border border-border text-foreground font-medium text-sm"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="w-full text-center py-2.5 rounded-xl bg-foreground text-background font-semibold text-sm"
                                >
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
