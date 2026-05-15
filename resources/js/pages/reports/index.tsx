import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download } from 'lucide-react';
import { useMemo } from 'react';

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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});
const tooltipContentStyle = { borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };

export default function ReportsPage({ 
    categorySummary = [], 
    trend = [], 
    loanSummary = { total_original: 0, total_remaining: 0, total_paid: 0 }, 
    savingsSummary = { total_target: 0, total_current: 0, total_needed: 0 } 
}: Props) {
    const formatCurrency = (amount: number) => currencyFormatter.format(amount);

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Reports" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Financial Reports</h2>
                        <p className="text-muted-foreground">Detailed analysis of your spending habits</p>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-md border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
                        <Download className="h-4 w-4" /> Export PDF
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Spending by Category */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <h3 className="font-bold mb-6">Monthly Spending by Category</h3>
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
                                        formatter={(value: any) => [formatCurrency(Number(value)), 'Total']}
                                        contentStyle={tooltipContentStyle}
                                    />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Monthly Trend */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <h3 className="font-bold mb-6">Income vs Expenses (Last 6 Months)</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
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
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2 mt-6">
                    {/* Loan Summary */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <h3 className="font-bold mb-6">Loan Repayment Status</h3>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="h-[200px] w-[200px]">
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
                                        <RechartsTooltip formatter={(value: any) => formatCurrency(Number(value))} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                             <div className="flex-1 space-y-4 w-full">
                                <div className="flex justify-between items-center p-3 rounded-lg border bg-muted/20">
                                    <span className="text-sm font-medium text-muted-foreground">Total Original</span>
                                    <span className="font-bold">{formatCurrency(loanSummary.total_original)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                                    <span className="text-sm font-medium text-emerald-500">Total Paid</span>
                                    <span className="font-bold text-emerald-500">{formatCurrency(loanSummary.total_paid)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg border border-amber-500/20 bg-amber-500/10">
                                    <span className="text-sm font-medium text-amber-500">Remaining</span>
                                    <span className="font-bold text-amber-500">{formatCurrency(loanSummary.total_remaining)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Savings Goal Summary */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <h3 className="font-bold mb-6">Savings Goal Progress</h3>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="h-[200px] w-[200px]">
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
                                        <RechartsTooltip formatter={(value: any) => formatCurrency(Number(value))} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex justify-between items-center p-3 rounded-lg border bg-muted/20">
                                    <span className="text-sm font-medium text-muted-foreground">Global Target</span>
                                    <span className="font-bold">{formatCurrency(savingsSummary.total_target)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg border border-blue-500/20 bg-blue-500/10">
                                    <span className="text-sm font-medium text-blue-500">Amount Saved</span>
                                    <span className="font-bold text-blue-500">{formatCurrency(savingsSummary.total_current)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg border bg-muted/20">
                                    <span className="text-sm font-medium text-muted-foreground">Still Needed</span>
                                    <span className="font-bold">{formatCurrency(savingsSummary.total_needed)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Insights table */}
                <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="font-bold mb-4">Detailed Breakdown</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b">
                                <tr>
                                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">CATEGORY</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">TOTAL SPENT</th>
                                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorySummary.map((cat, i) => (
                                    <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 font-medium">{cat.name}</td>
                                        <td className="p-4 text-right font-bold">{formatCurrency(cat.value)}</td>
                                        <td className="p-4 text-right">
                                            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Healthy</span>
                                        </td>
                                    </tr>
                                ))}
                                {categorySummary.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-muted-foreground">No data available for the current month.</td>
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
