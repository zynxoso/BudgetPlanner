import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { SectionNav } from '@/components/section-nav';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    Legend 
} from 'recharts';
import { 
    Download, 
    Sparkles, 
    TrendingDown, 
    TrendingUp, 
    DollarSign, 
    CreditCard, 
    PiggyBank, 
    FileText, 
    FileSpreadsheet,
    Check
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { getErrorMessage, postJson } from '@/lib/api';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Financial Reports', href: '/reports' },
];

interface CategoryData {
    name: string;
    value: number;
}

interface TrendData {
    month: string;
    income: number;
    expense: number;
}

interface LoanSummary {
    total_original: number;
    total_remaining: number;
    total_paid: number;
}

interface SavingsSummary {
    total_target: number;
    total_current: number;
    total_needed: number;
}

interface Props {
    categorySummary: CategoryData[];
    trend: TrendData[];
    loanSummary: LoanSummary;
    savingsSummary: SavingsSummary;
}

interface AiInsightsResponse {
    status: 'ok' | 'fallback' | 'unavailable';
    insights?: string[];
    message?: string | null;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});
const tooltipContentStyle = { borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };

export default function ReportsPage({ 
    categorySummary = [], 
    trend = [], 
    loanSummary = { total_original: 0, total_remaining: 0, total_paid: 0 }, 
    savingsSummary = { total_target: 0, total_current: 0, total_needed: 0 } 
}: Props) {
    const formatCurrency = (amount: number) => currencyFormatter.format(amount);
    const [aiInsights, setAiInsights] = useState<string[]>([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiNotice, setAiNotice] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    const totalCategorySpent = useMemo(
        () => categorySummary.reduce((sum, item) => sum + Number(item.value), 0),
        [categorySummary]
    );

    const latestIncome = useMemo(
        () => (trend.length > 0 ? trend[trend.length - 1].income : 0),
        [trend]
    );

    const latestExpense = useMemo(
        () => (trend.length > 0 ? trend[trend.length - 1].expense : 0),
        [trend]
    );

    const netCashFlow = latestIncome - latestExpense;

    const loanStatusData = useMemo(
        () => [
            { name: 'Paid', value: loanSummary.total_paid },
            { name: 'Remaining', value: loanSummary.total_remaining },
        ],
        [loanSummary.total_paid, loanSummary.total_remaining],
    );

    const savingsProgressData = useMemo(
        () => [
            { name: 'Saved', value: savingsSummary.total_current },
            { name: 'Needed', value: savingsSummary.total_needed },
        ],
        [savingsSummary.total_current, savingsSummary.total_needed],
    );

    const handleExportCsv = () => {
        setExporting(true);
        window.location.href = '/reports/export';
        setTimeout(() => setExporting(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    const loadInsights = async () => {
        if (aiLoading) {
            return;
        }

        setAiLoading(true);
        setAiNotice(null);

        try {
            const response = await postJson<AiInsightsResponse>('/ai/insights', {});
            if (Array.isArray(response.insights)) {
                setAiInsights(response.insights);
            } else {
                setAiInsights([]);
            }

            if (response.status !== 'ok') {
                setAiNotice(response.message || 'AI insights unavailable.');
            }
        } catch (error) {
            setAiNotice(getErrorMessage(error));
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Reports" />

            <div className="w-full max-w-full min-w-0 p-4 md:p-8 space-y-6 sm:space-y-8">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Financial Reports</h2>
                        <p className="text-muted-foreground">Detailed analysis of your spending habits and financial health</p>
                    </div>

                    <div className="flex items-center gap-2.5 print:hidden">
                        <Link 
                            href="/reports/statement"
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted shadow-2xs"
                            title="Open formal bank account statement report"
                        >
                            <FileText className="h-4 w-4" /> Bank Statement (PDF)
                        </Link>
                        <button 
                            onClick={handleExportCsv}
                            disabled={exporting}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-50 transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-sm disabled:opacity-75"
                        >
                            {exporting ? (
                                <>
                                    <Check className="h-4 w-4 animate-scale-in text-emerald-400" /> Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" /> Export CSV (Excel)
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Section Navigation Tabs */}
                <div className="print:hidden">
                    <SectionNav group="analytics" />
                </div>

                {/* KPI Summary Banner */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Spent This Month */}
                    <div className="animate-fade-in-up stagger-1 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-rose-500/40 dark:hover:border-rose-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-rose-500/10 via-rose-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <TrendingDown className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Spent This Month</span>
                                <div className="h-9 w-9 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <TrendingDown className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mt-3 tracking-tight">
                                {formatCurrency(totalCategorySpent)}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Across all expense categories</p>
                        </div>
                    </div>

                    {/* Net Cash Flow */}
                    <div className="animate-fade-in-up stagger-2 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <DollarSign className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Net Cash Flow</span>
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs ${
                                    netCashFlow >= 0 
                                        ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                                        : 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                }`}>
                                    {netCashFlow >= 0 ? <TrendingUp className="h-4.5 w-4.5" /> : <TrendingDown className="h-4.5 w-4.5" />}
                                </div>
                            </div>
                            <h3 className={`text-2xl font-bold mt-3 tracking-tight ${netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Latest month income vs expense</p>
                        </div>
                    </div>

                    {/* Loans Outstanding */}
                    <div className="animate-fade-in-up stagger-3 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/10 via-amber-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <CreditCard className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Loans Outstanding</span>
                                <div className="h-9 w-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <CreditCard className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-3 tracking-tight">
                                {formatCurrency(loanSummary.total_remaining)}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Remaining debt to settle</p>
                        </div>
                    </div>

                    {/* Savings Progress */}
                    <div className="animate-fade-in-up stagger-4 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 via-blue-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <PiggyBank className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Savings Progress</span>
                                <div className="h-9 w-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <PiggyBank className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-3 tracking-tight">
                                {formatCurrency(savingsSummary.total_current)}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Total saved toward target</p>
                        </div>
                    </div>
                </div>

                {/* Primary Report Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Spending by Category */}
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                        <h3 className="font-bold text-lg text-foreground mb-4">Monthly Spending by Category</h3>
                        {categorySummary.length > 0 ? (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categorySummary}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categorySummary.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            formatter={(value: any) => [formatCurrency(Number(value)), 'Total Spent']}
                                            contentStyle={tooltipContentStyle}
                                        />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] rounded-xl border border-dashed border-border bg-muted/20 text-center p-6">
                                <p className="text-sm font-semibold text-foreground">No Category Expense Data</p>
                                <p className="text-xs text-muted-foreground mt-1">Add expenses to visualize category breakdown.</p>
                            </div>
                        )}
                    </div>

                    {/* Monthly Trend */}
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                        <h3 className="font-bold text-lg text-foreground mb-4">Income vs Expenses (Last 6 Months)</h3>
                        {trend.length > 0 ? (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₱${value}`} />
                                        <RechartsTooltip 
                                            formatter={(value: any) => [formatCurrency(Number(value))]}
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={tooltipContentStyle}
                                        />
                                        <Legend />
                                        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] rounded-xl border border-dashed border-border bg-muted/20 text-center p-6">
                                <p className="text-sm font-semibold text-foreground">No Income/Expense Trend Data</p>
                                <p className="text-xs text-muted-foreground mt-1">Record monthly activity to view trends.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Secondary Status Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Loan Summary */}
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                        <h3 className="font-bold text-lg text-foreground mb-4">Loan Repayment Status</h3>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="h-[200px] w-[200px] shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={loanStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill="#10b981" />
                                            <Cell fill="#f59e0b" />
                                        </Pie>
                                        <RechartsTooltip 
                                            formatter={(value: any) => formatCurrency(Number(value))}
                                            contentStyle={tooltipContentStyle}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-3 w-full">
                                <div className="flex justify-between items-center p-3.5 rounded-xl border border-border bg-muted/20">
                                    <span className="text-xs font-medium text-muted-foreground">Total Borrowed</span>
                                    <span className="font-bold text-foreground text-sm">{formatCurrency(loanSummary.total_original)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Total Repaid</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatCurrency(loanSummary.total_paid)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10">
                                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Balance Remaining</span>
                                    <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{formatCurrency(loanSummary.total_remaining)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Savings Goal Summary */}
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                        <h3 className="font-bold text-lg text-foreground mb-4">Savings Goal Fulfillment</h3>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="h-[200px] w-[200px] shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={savingsProgressData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill="#3b82f6" />
                                            <Cell fill="#e4e4e7" />
                                        </Pie>
                                        <RechartsTooltip 
                                            formatter={(value: any) => formatCurrency(Number(value))}
                                            contentStyle={tooltipContentStyle}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-3 w-full">
                                <div className="flex justify-between items-center p-3.5 rounded-xl border border-border bg-muted/20">
                                    <span className="text-xs font-medium text-muted-foreground">Global Target</span>
                                    <span className="font-bold text-foreground text-sm">{formatCurrency(savingsSummary.total_target)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10">
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Saved</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{formatCurrency(savingsSummary.total_current)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3.5 rounded-xl border border-border bg-muted/20">
                                    <span className="text-xs font-medium text-muted-foreground">Still Needed</span>
                                    <span className="font-bold text-foreground text-sm">{formatCurrency(savingsSummary.total_needed)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Insights Card */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4 print:break-inside-avoid">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-foreground" />
                            <h3 className="font-bold text-lg text-foreground">AI Report Summary</h3>
                        </div>
                        <button
                            onClick={loadInsights}
                            disabled={aiLoading}
                            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-50 transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-sm disabled:opacity-50 print:hidden"
                        >
                            {aiLoading ? 'Analyzing...' : 'Generate AI Report'}
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Get an automated summary of spending patterns, loan health, and savings recommendations.
                    </p>
                    {aiNotice && <p className="text-xs text-amber-600 dark:text-amber-400">{aiNotice}</p>}
                    <div className="space-y-2.5">
                        {aiInsights.length > 0 ? (
                            aiInsights.map((insight, index) => (
                                <div key={index} className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs text-foreground leading-relaxed">
                                    {insight}
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                                Click "Generate AI Report" to create automated financial insights based on your recent activity.
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Category Breakdown Table */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4 print:break-inside-avoid">
                    <h3 className="font-bold text-lg text-foreground">Category Breakdown</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">CATEGORY</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground text-xs uppercase tracking-wider">TOTAL SPENT</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground text-xs uppercase tracking-wider">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {categorySummary.map((cat, i) => (
                                    <tr key={i} className="transition-colors hover:bg-muted/30">
                                        <td className="p-4 font-medium text-foreground">{cat.name}</td>
                                        <td className="p-4 text-right font-bold text-foreground">{formatCurrency(cat.value)}</td>
                                        <td className="p-4 text-right">
                                            <span className="inline-flex rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
                                        </td>
                                    </tr>
                                ))}
                                {categorySummary.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-muted-foreground text-xs">No category spending recorded for the current report period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
