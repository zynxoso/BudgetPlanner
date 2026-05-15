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
    Target,
    Sparkles,
    Send
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartTooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { memo, useState } from 'react';
import { getErrorMessage, postJson } from '@/lib/api';

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

type AiRole = 'user' | 'assistant';

interface AiMessage {
    role: AiRole;
    content: string;
}

interface AiChatResponse {
    status: 'ok' | 'fallback' | 'unavailable';
    reply?: string;
    message?: string | null;
}

const ActivityChart = memo(function ActivityChart({ spendingChart }: { spendingChart: SpendingChartPoint[] }) {
    return (
        <div className="col-span-4 rounded-xl border bg-card p-6 shadow-sm">
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
        <div className="col-span-3 rounded-xl border bg-card p-6 shadow-sm">
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

const AiAssistantCard = memo(function AiAssistantCard() {
    const [messages, setMessages] = useState<AiMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    const quickPrompts = [
        'Where can I cut expenses this month?',
        'What is a safe weekly spending limit?',
        'Summarize my biggest money drains.',
        'Suggest a small savings goal for next month.',
    ];

    const sendMessage = async (content: string) => {
        const trimmed = content.trim();
        if (!trimmed || loading) {
            return;
        }

        setNotice(null);
        setLoading(true);

        const history = messages.slice(-6);
        const nextHistory = [...history, { role: 'user', content: trimmed }];

        setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
        setInput('');

        try {
            const response = await postJson<AiChatResponse>('/ai/chat', {
                message: trimmed,
                history: nextHistory,
            });

            if (response.reply) {
                setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
            }

            if (response.status !== 'ok') {
                setNotice(response.message || 'AI is unavailable right now.');
            }
        } catch (error) {
            setNotice(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">AI Co-Pilot</p>
                        <h3 className="text-lg font-semibold text-foreground">Plan today, spend with intent</h3>
                    </div>
                </div>
                <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">Beta</span>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                <div className="space-y-3">
                    <div className="min-h-[140px] max-h-64 space-y-3 overflow-y-auto rounded-xl border border-border bg-background p-4">
                        {messages.length === 0 && (
                            <p className="text-sm text-muted-foreground">No messages yet. Try asking "Where can I cut expenses this month?"</p>
                        )}
                        {messages.map((message, index) => (
                            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border border-border bg-muted text-foreground'
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {notice && <p className="text-xs text-destructive">{notice}</p>}

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            sendMessage(input);
                        }}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder="Ask about spending, budgets, or goals..."
                            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        />
                        <button
                            type="submit"
                            disabled={loading || input.trim().length === 0}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send'}
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>

                <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quick prompts</p>
                        <div className="mt-3 grid gap-2">
                            {quickPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    type="button"
                                    onClick={() => setInput(prompt)}
                                    className="rounded-lg border border-border bg-background px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">What I can do</p>
                        <div className="mt-3 space-y-2 text-sm text-foreground">
                            <p>Spot overspending patterns across categories.</p>
                            <p>Suggest realistic saving goals based on activity.</p>
                            <p>Explain changes in balance and budget drift.</p>
                        </div>
                    </div>
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
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                        <p className="text-muted-foreground">Financial summary of your activity</p>
                    </div>
                    <div className="flex gap-3">
                        <Link 
                            href="/income" 
                            className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Income
                        </Link>
                        <Link 
                            href="/expenses" 
                            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Expense
                        </Link>
                    </div>
                </div>

                <AiAssistantCard />

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                            <Wallet className="h-4 w-4 text-primary" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl font-bold">{formatCurrency(summary.currentBalance)}</h3>
                        </div>
                    </div>
                    
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl font-bold">{formatCurrency(summary.totalIncome)}</h3>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                            <TrendingDown className="h-4 w-4 text-rose-500" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</h3>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Remaining Budget</p>
                            <PieChart className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl font-bold">{formatCurrency(summary.remainingBudget)}</h3>
                        </div>
                    </div>
                </div>
                {/* Secondary Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Total Savings</p>
                            <Target className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl font-bold">{formatCurrency(summary.totalSavings)}</h3>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Outstanding Loans</p>
                            <BadgePercent className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl font-bold">{formatCurrency(summary.totalLoansOutstanding)}</h3>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Monthly Allowances</p>
                            <HandCoins className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl font-bold">{formatCurrency(summary.totalAllowances)}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <ActivityChart spendingChart={spendingChart} />
                    <TopCategoriesCard topCategories={topCategories} />
                </div>

                {/* Recent Transactions */}
                <RecentTransactionsTable recentTransactions={recentTransactions} formatCurrency={formatCurrency} />
            </div>
        </AppLayout>
    );
}
