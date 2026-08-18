import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    TrendingUp, 
    TrendingDown, 
    Wallet, 
    PieChart, 
    Plus, 
    ArrowRight,
    HandCoins,
    BadgePercent,
    Target
} from 'lucide-react';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartTooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { memo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Transaction {
    id: number;
    amount: string;
    type: 'income' | 'expense';
    source?: string;
    category?: { name: string; icon: string; color: string };
    date: string;
    notes?: string;
    is_spent?: boolean;
}

interface DashboardProps {
    summary: {
        currentBalance: number;
        totalIncome: number;
        totalExpenses: number;
        spentIncome?: number;
        remainingBudget: number;
        totalAllowances: number;
        totalLoansOutstanding: number;
        totalSavings: number;
    };
    recentTransactions: Transaction[];
    spendingChart: { date: string; amount: number }[];
    topCategories: { name: string; percentage: number; amount: number }[];
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

type SpendingChartPoint = DashboardProps['spendingChart'][number];
type TopCategory = DashboardProps['topCategories'][number];
type RecentTransaction = DashboardProps['recentTransactions'][number];

const ActivityChart = memo(function ActivityChart({ spendingChart }: { spendingChart: SpendingChartPoint[] }) {
    return (
        <div className="col-span-1 lg:col-span-4 rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Weekly Activity</h3>
                <p className="text-sm text-muted-foreground">Spending behavior for the last 7 days</p>
            </div>
            <div className="mt-4 h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendingChart}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="rgb(9 9 11)" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="rgb(9 9 11)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                        <YAxis hide />
                        <RechartTooltip />
                        <Area type="monotone" dataKey="amount" stroke="rgb(9 9 11)" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

const TopCategoriesCard = memo(function TopCategoriesCard({ topCategories }: { topCategories: TopCategory[] }) {
    return (
        <div className="col-span-1 lg:col-span-3 rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Top Categories</h3>
                    <p className="text-sm text-muted-foreground">This month's major expenses</p>
                </div>
                <Link href="/budget" className="text-xs text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-6">
                {topCategories.length > 0 ? topCategories.map((category) => (
                    <div key={category.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{category.name}</span>
                            <span className="text-muted-foreground">{category.percentage.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                            <div className="h-full bg-zinc-900 transition-all" style={{ width: `${category.percentage}%` }} />
                        </div>
                    </div>
                )) : (
                    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                        No data available for this month
                    </div>
                )}
            </div>
        </div>
    );
});

const RecentTransactionsTable = memo(function RecentTransactionsTable({ recentTransactions, formatCurrency }: { recentTransactions: RecentTransaction[]; formatCurrency: (amount: number) => string }) {
    return (
        <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between p-6 pb-2">
                <div>
                    <h3 className="text-lg font-semibold">Recent Transactions</h3>
                    <p className="text-sm text-muted-foreground">Latest movements in your accounts</p>
                </div>
                <Link href="/transactions" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                    See History <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
            </div>
            <div className="overflow-hidden p-0">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">DATE</th>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">SOURCE / CATEGORY</th>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">TYPE</th>
                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground pr-10">AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {recentTransactions.map((tx) => (
                                <tr key={tx.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-6 align-middle">{tx.date.substring(0, 10)}</td>
                                    <td className="p-6 align-middle font-medium">{tx.type === 'income' ? tx.source : tx.category?.name}</td>
                                    <td className="p-6 align-middle">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'
                                            }`}>
                                                {tx.type}
                                            </span>
                                            {tx.is_spent && (
                                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-zinc-100 text-zinc-500">
                                                    Spent
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={`p-6 align-middle text-right pr-10 font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-zinc-900'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                                    </td>
                                </tr>
                            ))}
                            {recentTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="h-24 text-center text-muted-foreground">No recent transactions.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

export default function Dashboard({ summary, recentTransactions, spendingChart, topCategories }: DashboardProps) {
    const formatCurrency = (amount: number) => currencyFormatter.format(amount);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex flex-col gap-8 p-4 md:p-8">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Overview</h2>
                        <p className="text-muted-foreground">Financial summary and system overview</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link 
                            href="/income" 
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted"
                        >
                            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Income
                        </Link>
                        <Link 
                            href="/expenses" 
                            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-sm"
                        >
                            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Expense
                        </Link>
                    </div>
                </div>

                {/* Primary Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Current Balance */}
                    <div className="animate-fade-in-up stagger-1 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-zinc-500/40 dark:hover:border-zinc-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-zinc-500/10 via-zinc-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <Wallet className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Balance</span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground transition-transform group-hover:scale-110 shadow-2xs">
                                    <Wallet className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(summary.currentBalance)}</h3>
                                <p className="text-xs text-muted-foreground mt-1">Combined balance across accounts</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Total Income */}
                    <div className="animate-fade-in-up stagger-2 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <TrendingUp className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Income</span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <TrendingUp className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(summary.totalIncome)}</h3>
                                <p className="text-xs text-muted-foreground mt-1">Total recorded earnings</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Expenses */}
                    <div className="animate-fade-in-up stagger-3 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-rose-500/40 dark:hover:border-rose-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-rose-500/10 via-rose-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <TrendingDown className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Expenses</span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <TrendingDown className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(summary.totalExpenses)}</h3>
                                <p className="text-xs text-muted-foreground mt-1">Total recorded spending</p>
                            </div>
                        </div>
                    </div>

                    {/* Remaining Budget */}
                    <div className="animate-fade-in-up stagger-4 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 via-blue-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <PieChart className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Remaining Budget</span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <PieChart className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(summary.remainingBudget)}</h3>
                                <p className="text-xs text-muted-foreground mt-1">Unallocated monthly budget</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Planning & Accounts Summary */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link href="/savings-goals" className="animate-fade-in-up stagger-4 card-interactive group rounded-2xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground transition-transform group-hover:scale-110">
                                    <Target className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Savings Goals</p>
                                    <h4 className="text-lg font-bold text-foreground mt-0.5">{formatCurrency(summary.totalSavings)}</h4>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
                        </div>
                    </Link>

                    <Link href="/loans" className="animate-fade-in-up stagger-5 card-interactive group rounded-2xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110">
                                    <BadgePercent className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Outstanding Loans</p>
                                    <h4 className="text-lg font-bold text-foreground mt-0.5">{formatCurrency(summary.totalLoansOutstanding)}</h4>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
                        </div>
                    </Link>

                    <Link href="/allowance" className="animate-fade-in-up stagger-6 card-interactive group rounded-2xl border bg-card p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110">
                                    <HandCoins className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Allowances</p>
                                    <h4 className="text-lg font-bold text-foreground mt-0.5">{formatCurrency(summary.totalAllowances)}</h4>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
                        </div>
                    </Link>
                </div>

                {/* Activity & Category Charts */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <ActivityChart spendingChart={spendingChart} />
                    <TopCategoriesCard topCategories={topCategories} />
                </div>

                {/* Recent Transactions Table */}
                <RecentTransactionsTable recentTransactions={recentTransactions} formatCurrency={formatCurrency} />
            </div>
        </AppLayout>
    );
}
