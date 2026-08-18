import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { SectionNav } from '@/components/section-nav';
import { 
    Settings2, 
    AlertCircle, 
    PieChart, 
    TrendingUp, 
    DollarSign, 
    ShieldAlert, 
    CheckCircle2, 
    Search, 
    LayoutGrid, 
    List,
    Utensils, 
    Bus, 
    Car, 
    GraduationCap, 
    FileText, 
    Zap, 
    ShoppingBag, 
    ShoppingCart, 
    Repeat, 
    HeartPulse, 
    Film, 
    Home, 
    Plane, 
    Tag, 
    Coffee
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { ClientPagination } from '@/components/pagination-controls';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Budget Planner', href: '/budget' },
];

interface BudgetCategory {
    id: number;
    name: string;
    icon?: string;
    color?: string;
    limit: number;
    used: number;
    remaining: number;
    percentage: number;
}

interface Props {
    budgetData: BudgetCategory[];
    currentMonth: string;
}

interface CategoryTheme {
    Icon: any;
    badgeBg: string;
    badgeText: string;
    accentBorder: string;
    glowBg: string;
    progressBar: string;
}

function getCategoryTheme(name: string, iconStr?: string, colorStr?: string): CategoryTheme {
    const lower = (name || '').toLowerCase();
    const iconKey = (iconStr || '').toLowerCase();

    if (
        lower.includes('food') ||
        lower.includes('dining') ||
        lower.includes('restaurant') ||
        lower.includes('meal') ||
        lower.includes('eat') ||
        lower.includes('snack') ||
        lower.includes('cafe') ||
        iconKey === 'utensils' ||
        iconKey === 'coffee'
    ) {
        return {
            Icon: lower.includes('cafe') || lower.includes('coffee') ? Coffee : Utensils,
            badgeBg: 'bg-orange-500/10 dark:bg-orange-500/15',
            badgeText: 'text-orange-600 dark:text-orange-400',
            accentBorder: 'hover:border-orange-500/40 dark:hover:border-orange-500/30',
            glowBg: 'from-orange-500/10 via-orange-500/[0.02] to-transparent',
            progressBar: 'bg-orange-500',
        };
    }

    if (
        lower.includes('grocer') ||
        lower.includes('market') ||
        lower.includes('supermarket') ||
        iconKey === 'shoppingcart' ||
        iconKey === 'basket'
    ) {
        return {
            Icon: ShoppingCart,
            badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
            badgeText: 'text-emerald-600 dark:text-emerald-400',
            accentBorder: 'hover:border-emerald-500/40 dark:hover:border-emerald-500/30',
            glowBg: 'from-emerald-500/10 via-emerald-500/[0.02] to-transparent',
            progressBar: 'bg-emerald-500',
        };
    }

    if (
        lower.includes('transport') ||
        lower.includes('commute') ||
        lower.includes('gas') ||
        lower.includes('fuel') ||
        lower.includes('car') ||
        lower.includes('ride') ||
        lower.includes('taxi') ||
        lower.includes('bus') ||
        lower.includes('transit') ||
        iconKey === 'bus' ||
        iconKey === 'car'
    ) {
        return {
            Icon: lower.includes('car') || lower.includes('gas') || lower.includes('fuel') ? Car : Bus,
            badgeBg: 'bg-blue-500/10 dark:bg-blue-500/15',
            badgeText: 'text-blue-600 dark:text-blue-400',
            accentBorder: 'hover:border-blue-500/40 dark:hover:border-blue-500/30',
            glowBg: 'from-blue-500/10 via-blue-500/[0.02] to-transparent',
            progressBar: 'bg-blue-500',
        };
    }

    if (
        lower.includes('school') ||
        lower.includes('educat') ||
        lower.includes('tuition') ||
        lower.includes('course') ||
        lower.includes('class') ||
        lower.includes('study') ||
        lower.includes('book') ||
        iconKey === 'graduationcap'
    ) {
        return {
            Icon: GraduationCap,
            badgeBg: 'bg-amber-500/10 dark:bg-amber-500/15',
            badgeText: 'text-amber-600 dark:text-amber-400',
            accentBorder: 'hover:border-amber-500/40 dark:hover:border-amber-500/30',
            glowBg: 'from-amber-500/10 via-amber-500/[0.02] to-transparent',
            progressBar: 'bg-amber-500',
        };
    }

    if (
        lower.includes('utilit') ||
        lower.includes('bill') ||
        lower.includes('electric') ||
        lower.includes('water') ||
        lower.includes('power') ||
        lower.includes('internet') ||
        lower.includes('wifi') ||
        iconKey === 'zap' ||
        iconKey === 'filetext'
    ) {
        return {
            Icon: Zap,
            badgeBg: 'bg-yellow-500/10 dark:bg-yellow-500/15',
            badgeText: 'text-yellow-600 dark:text-yellow-400',
            accentBorder: 'hover:border-yellow-500/40 dark:hover:border-yellow-500/30',
            glowBg: 'from-yellow-500/10 via-yellow-500/[0.02] to-transparent',
            progressBar: 'bg-yellow-500',
        };
    }

    if (
        lower.includes('subscript') ||
        lower.includes('stream') ||
        lower.includes('netflix') ||
        lower.includes('spotify') ||
        lower.includes('recur') ||
        iconKey === 'repeat'
    ) {
        return {
            Icon: Repeat,
            badgeBg: 'bg-purple-500/10 dark:bg-purple-500/15',
            badgeText: 'text-purple-600 dark:text-purple-400',
            accentBorder: 'hover:border-purple-500/40 dark:hover:border-purple-500/30',
            glowBg: 'from-purple-500/10 via-purple-500/[0.02] to-transparent',
            progressBar: 'bg-purple-500',
        };
    }

    if (
        lower.includes('shop') ||
        lower.includes('cloth') ||
        lower.includes('personal') ||
        lower.includes('mall') ||
        lower.includes('fashion') ||
        iconKey === 'shoppingbag'
    ) {
        return {
            Icon: ShoppingBag,
            badgeBg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/15',
            badgeText: 'text-fuchsia-600 dark:text-fuchsia-400',
            accentBorder: 'hover:border-fuchsia-500/40 dark:hover:border-fuchsia-500/30',
            glowBg: 'from-fuchsia-500/10 via-fuchsia-500/[0.02] to-transparent',
            progressBar: 'bg-fuchsia-500',
        };
    }

    if (
        lower.includes('health') ||
        lower.includes('well') ||
        lower.includes('med') ||
        lower.includes('pharma') ||
        lower.includes('doctor') ||
        lower.includes('hospital') ||
        lower.includes('gym') ||
        lower.includes('fitness') ||
        iconKey === 'heartpulse'
    ) {
        return {
            Icon: HeartPulse,
            badgeBg: 'bg-rose-500/10 dark:bg-rose-500/15',
            badgeText: 'text-rose-600 dark:text-rose-400',
            accentBorder: 'hover:border-rose-500/40 dark:hover:border-rose-500/30',
            glowBg: 'from-rose-500/10 via-rose-500/[0.02] to-transparent',
            progressBar: 'bg-rose-500',
        };
    }

    if (
        lower.includes('entertain') ||
        lower.includes('movie') ||
        lower.includes('cinema') ||
        lower.includes('game') ||
        lower.includes('gaming') ||
        lower.includes('hobby') ||
        iconKey === 'film'
    ) {
        return {
            Icon: Film,
            badgeBg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
            badgeText: 'text-indigo-600 dark:text-indigo-400',
            accentBorder: 'hover:border-indigo-500/40 dark:hover:border-indigo-500/30',
            glowBg: 'from-indigo-500/10 via-indigo-500/[0.02] to-transparent',
            progressBar: 'bg-indigo-500',
        };
    }

    if (
        lower.includes('home') ||
        lower.includes('rent') ||
        lower.includes('house') ||
        lower.includes('repair') ||
        lower.includes('mortgage')
    ) {
        return {
            Icon: Home,
            badgeBg: 'bg-teal-500/10 dark:bg-teal-500/15',
            badgeText: 'text-teal-600 dark:text-teal-400',
            accentBorder: 'hover:border-teal-500/40 dark:hover:border-teal-500/30',
            glowBg: 'from-teal-500/10 via-teal-500/[0.02] to-transparent',
            progressBar: 'bg-teal-500',
        };
    }

    if (
        lower.includes('travel') ||
        lower.includes('trip') ||
        lower.includes('flight') ||
        lower.includes('vacation') ||
        lower.includes('hotel')
    ) {
        return {
            Icon: Plane,
            badgeBg: 'bg-sky-500/10 dark:bg-sky-500/15',
            badgeText: 'text-sky-600 dark:text-sky-400',
            accentBorder: 'hover:border-sky-500/40 dark:hover:border-sky-500/30',
            glowBg: 'from-sky-500/10 via-sky-500/[0.02] to-transparent',
            progressBar: 'bg-sky-500',
        };
    }

    // Default fallback
    return {
        Icon: Tag,
        badgeBg: 'bg-zinc-500/10 dark:bg-zinc-500/15',
        badgeText: 'text-zinc-600 dark:text-zinc-400',
        accentBorder: 'hover:border-zinc-500/40 dark:hover:border-zinc-500/30',
        glowBg: 'from-zinc-500/10 via-zinc-500/[0.02] to-transparent',
        progressBar: 'bg-zinc-600 dark:bg-zinc-400',
    };
}

export default function BudgetPage({ budgetData, currentMonth }: Props) {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 12;
    const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'exceeded' | 'on_track'>('all');

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        category_id: '',
        amount_limit: '',
    });

    const totalBudgetLimit = useMemo(() => budgetData.reduce((sum, c) => sum + c.limit, 0), [budgetData]);
    const totalSpent = useMemo(() => budgetData.reduce((sum, c) => sum + c.used, 0), [budgetData]);
    const totalRemaining = totalBudgetLimit - totalSpent;
    const overBudgetCount = useMemo(() => budgetData.filter((c) => c.percentage > 100).length, [budgetData]);

    const filteredCategories = useMemo(() => {
        return budgetData.filter((cat) => {
            const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
            if (filterStatus === 'exceeded') return matchesSearch && cat.percentage > 100;
            if (filterStatus === 'on_track') return matchesSearch && cat.percentage <= 100;
            return matchesSearch;
        });
    }, [budgetData, searchQuery, filterStatus]);

    const totalPages = Math.ceil(filteredCategories.length / PAGE_SIZE) || 1;
    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredCategories.slice(start, start + PAGE_SIZE);
    }, [filteredCategories, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);

    const openEditModal = (cat: BudgetCategory) => {
        setSelectedCategory(cat);
        clearErrors();
        setData({
            category_id: cat.id.toString(),
            amount_limit: cat.limit.toString(),
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('budget.updateOrCreate'), {
            onSuccess: () => {
                setSelectedCategory(null);
                reset();
            },
        });
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(val);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Budget Planner" />

            <div className="w-full max-w-full min-w-0 p-4 md:p-8 space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Budget Planner ({currentMonth})</h2>
                        <p className="text-muted-foreground">
                            Set category limits, monitor spending velocity, and prevent overspending
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-lg border bg-card p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`rounded-md p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Grid View"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`rounded-md p-1.5 transition-colors ${viewMode === 'table' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                title="List / Table View"
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section Navigation Tabs */}
                <SectionNav group="planning" />

                {/* Summary Banner Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Budget Limit */}
                    <div className="animate-fade-in-up stagger-1 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <DollarSign className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Total Budget Limit</span>
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight mt-4">{formatCurrency(totalBudgetLimit)}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Monthly category allocation</p>
                        </div>
                    </div>

                    {/* Total Spent So Far */}
                    <div className="animate-fade-in-up stagger-2 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/10 via-amber-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <TrendingUp className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Total Spent So Far</span>
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight mt-4">{formatCurrency(totalSpent)}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                {totalBudgetLimit > 0 ? `${((totalSpent / totalBudgetLimit) * 100).toFixed(1)}% of total budget` : '0% used'}
                            </p>
                        </div>
                    </div>

                    {/* Remaining Budget */}
                    <div className={`animate-fade-in-up stagger-3 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                        totalRemaining < 0 
                            ? 'hover:border-rose-500/40 dark:hover:border-rose-500/30' 
                            : 'hover:border-emerald-500/40 dark:hover:border-emerald-500/30'
                    }`}>
                        <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500 ${
                            totalRemaining < 0 ? 'from-rose-500/10 via-rose-500/[0.02] to-transparent' : 'from-emerald-500/10 via-emerald-500/[0.02] to-transparent'
                        }`} />
                        {totalRemaining < 0 ? (
                            <ShieldAlert className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />
                        ) : (
                            <CheckCircle2 className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />
                        )}

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Remaining Budget</span>
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs ${
                                    totalRemaining < 0 
                                        ? 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400' 
                                        : 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                }`}>
                                    {totalRemaining < 0 ? <ShieldAlert className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                </div>
                            </div>
                            <h3 className={`text-2xl font-bold tracking-tight mt-4 ${totalRemaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {formatCurrency(totalRemaining)}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">{totalRemaining < 0 ? 'Exceeded budget limit' : 'Safe headroom available'}</p>
                        </div>
                    </div>

                    {/* Over-budget Categories */}
                    <div className="animate-fade-in-up stagger-4 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-rose-500/40 dark:hover:border-rose-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-rose-500/10 via-rose-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <ShieldAlert className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Over-budget Categories</span>
                                <div className="h-10 w-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight mt-4">{overBudgetCount}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Categories requiring attention</p>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b pb-4 min-w-0 w-full">
                    <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 w-full sm:w-auto max-w-full scrollbar-none">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold btn-interactive transition-colors ${
                                filterStatus === 'all'
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            All Categories ({budgetData.length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('on_track')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold btn-interactive transition-colors ${
                                filterStatus === 'on_track'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            On Track ({budgetData.filter((c) => c.percentage <= 100).length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('exceeded')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold btn-interactive transition-colors ${
                                filterStatus === 'exceeded'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            Exceeded ({overBudgetCount})
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Filter categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </div>

                {/* Categories Grid / Table */}
                {filteredCategories.length > 0 ? (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {paginatedCategories.map((cat) => {
                                    const isOver = cat.percentage > 100;
                                    const isWarning = cat.percentage > 80 && !isOver;
                                    const clampedPercentage = Math.min(cat.percentage, 100);
                                    const theme = getCategoryTheme(cat.name, cat.icon, cat.color);
                                    const CategoryIcon = theme.Icon;

                                    return (
                                        <div
                                            key={cat.id}
                                            className={`animate-fade-in-up card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 ${theme.accentBorder}`}
                                        >
                                            {/* Ambient Background Corner Glow */}
                                            <div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${theme.glowBg} blur-2xl pointer-events-none opacity-40 dark:opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

                                            {/* Large Watermark Category Icon in Card Background (+20% visibility) */}
                                            <CategoryIcon className="absolute -right-3 -bottom-3 h-32 w-32 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${theme.badgeBg} ${theme.badgeText} shadow-2xs`}>
                                                            <CategoryIcon className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-base sm:text-lg text-foreground tracking-tight">{cat.name}</h4>
                                                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                                                                {formatCurrency(cat.used)} of {formatCurrency(cat.limit)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => openEditModal(cat)}
                                                        className="p-2 border rounded-xl bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-2xs backdrop-blur-xs"
                                                        title="Set Limit"
                                                    >
                                                        <Settings2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="space-y-2 mt-5">
                                                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className={`h-full transition-all duration-500 rounded-full ${
                                                                isOver
                                                                    ? 'bg-rose-500'
                                                                    : isWarning
                                                                    ? 'bg-amber-500'
                                                                    : theme.progressBar
                                                            }`}
                                                            style={{ width: `${clampedPercentage}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs font-semibold">
                                                        <span className={cat.remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                                                            {formatCurrency(Math.abs(cat.remaining))} {cat.remaining < 0 ? 'over limit' : 'remaining'}
                                                        </span>
                                                        <span className="text-muted-foreground font-mono">{cat.percentage.toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {isOver && (
                                                <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40">
                                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                                    Budget limit exceeded by {formatCurrency(Math.abs(cat.remaining))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Table View */
                            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden min-w-0 w-full animate-fade-in-up">
                                <div className="overflow-x-auto min-w-0 w-full scrollbar-none">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50 transition-colors">
                                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Category</th>
                                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Budget Limit</th>
                                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Spent</th>
                                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Remaining</th>
                                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Progress</th>
                                                <th className="h-12 px-6 text-center align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {paginatedCategories.map((cat) => {
                                                const isOver = cat.percentage > 100;
                                                const isWarning = cat.percentage > 80 && !isOver;
                                                const clampedPercentage = Math.min(cat.percentage, 100);
                                                const theme = getCategoryTheme(cat.name, cat.icon, cat.color);
                                                const CategoryIcon = theme.Icon;

                                                return (
                                                    <tr key={cat.id} className="transition-colors hover:bg-muted/30">
                                                        <td className="p-6 align-middle font-bold text-foreground">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${theme.badgeBg} ${theme.badgeText}`}>
                                                                    <CategoryIcon className="h-4.5 w-4.5" />
                                                                </div>
                                                                <span className="font-semibold text-sm">{cat.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6 align-middle text-right font-bold text-foreground">
                                                            {formatCurrency(cat.limit)}
                                                        </td>
                                                        <td className="p-6 align-middle text-right font-medium text-muted-foreground">
                                                            {formatCurrency(cat.used)}
                                                        </td>
                                                        <td className="p-6 align-middle text-right font-semibold">
                                                            <span className={cat.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                                                                {formatCurrency(Math.abs(cat.remaining))} {cat.remaining < 0 ? 'over' : ''}
                                                            </span>
                                                        </td>
                                                        <td className="p-6 align-middle text-right">
                                                            <div className="flex items-center justify-end gap-2.5">
                                                                <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                                                                    <div
                                                                        className={`h-full transition-all duration-500 ${
                                                                            isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : theme.progressBar
                                                                        }`}
                                                                        style={{ width: `${clampedPercentage}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs font-semibold text-muted-foreground w-9">{cat.percentage.toFixed(0)}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6 align-middle text-center">
                                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                isOver
                                                                    ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                                                    : isWarning
                                                                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                                                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                            }`}>
                                                                {isOver ? 'Exceeded' : isWarning ? 'Warning' : 'On Track'}
                                                            </span>
                                                        </td>
                                                        <td className="p-6 align-middle text-right">
                                                            <button
                                                                onClick={() => openEditModal(cat)}
                                                                className="rounded-lg border bg-card p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs"
                                                                title="Set Limit"
                                                            >
                                                                <Settings2 className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <ClientPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredCategories.length}
                            pageSize={PAGE_SIZE}
                            onPageChange={setCurrentPage}
                            className="pt-2"
                        />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center shadow-2xs">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-foreground mb-4 shadow-sm">
                            <PieChart className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">No Categories Found</h3>
                        <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
                            No budget categories match your current search or filter criteria.
                        </p>
                    </div>
                )}
            </div>

            {/* Edit Budget Modal */}
            {selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm rounded-2xl bg-background p-6 border text-foreground">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Settings2 className="h-5 w-5 text-emerald-600" />
                            Set Monthly Limit
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4">
                            Adjust monthly target budget for <strong className="text-foreground">{selectedCategory.name}</strong>.
                        </p>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Monthly Limit (₱)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className={`w-full rounded-lg border ${errors.amount_limit ? 'border-rose-500' : 'border-input'} bg-background p-2.5 text-sm font-bold text-foreground focus:ring-2 focus:ring-emerald-500/20`}
                                    placeholder="0.00"
                                    value={data.amount_limit}
                                    onChange={(e) => setData('amount_limit', e.target.value)}
                                />
                                {errors.amount_limit && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.amount_limit}</p>}
                                {errors.category_id && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.category_id}</p>}
                            </div>
                            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory(null)}
                                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update Budget'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

declare function route(name: string, params?: any): string;
