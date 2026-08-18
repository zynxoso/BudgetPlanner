import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/components/landing/Navbar';
import HeroParallax from '@/components/landing/HeroParallax';
import PhilosophyStoryScroll from '@/components/landing/PhilosophyStoryScroll';
import BudgetSimulator from '@/components/landing/BudgetSimulator';
import CapabilitiesShowcase from '@/components/landing/CapabilitiesShowcase';
import FinancialClarityMetrics from '@/components/landing/FinancialClarityMetrics';
import TestimonialsPricingFAQ from '@/components/landing/TestimonialsPricingFAQ';
import FooterCTA from '@/components/landing/FooterCTA';
import ScrollProgressBar from '@/components/landing/ScrollProgressBar';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user ?? null;

    // Initialize luxury smooth inertial scrolling
    useSmoothScroll();

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background font-sans antialiased overflow-x-hidden">
            {/* Top Reading Progress Bar */}
            <ScrollProgressBar />

            <Head>
                <title>Budget Planner | Manage your money with confidence</title>
                <meta
                    name="description"
                    content="A straightforward, interactive budget planner. Set category limits, track cash on the fly, and pay down debt faster."
                />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            {/* Top Navigation */}
            <Navbar user={user} />

            {/* Main Interactive Flow */}
            <main>
                {/* 1. Hero Parallax Stage */}
                <HeroParallax user={user} />

                {/* 2. Pinned Scroll Narrative Philosophy Stage */}
                <PhilosophyStoryScroll />

                {/* 3. Live Interactive Budget Simulator */}
                <BudgetSimulator />

                {/* 4. Complete System Capabilities (5 Modules) */}
                <CapabilitiesShowcase />

                {/* 5. Financial Clarity & Measurable Outcomes */}
                <FinancialClarityMetrics />

                {/* 6. Social Proof, Pricing & FAQ */}
                <TestimonialsPricingFAQ user={user} />
            </main>

            {/* 7. Minimal High-Impact CTA & Footer */}
            <FooterCTA user={user} />
        </div>
    );
}
