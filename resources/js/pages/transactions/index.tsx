import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { SectionNav } from '@/components/section-nav';
import { 
    Search, 
    ArrowUpRight, 
    ArrowDownRight, 
    TrendingUp, 
    TrendingDown, 
    DollarSign,
    Layers,
    X
} from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { ServerPagination, LaravelPaginationMeta } from '@/components/pagination-controls';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transactions', href: '/transactions' },
];

interface Transaction {
    id: number;
    amount: string;
    type: 'income' | 'expense';
    source?: string;
    category?: { id?: number; name: string };
    date: string;
    notes?: string;
    is_spent?: boolean;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    transactions: LaravelPaginationMeta & {
        data: Transaction[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    categories: Category[];
}

export default function TransactionsPage({ transactions, categories }: Props) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const deferredSearch = useDeferredValue(search);

    const filteredTransactions = useMemo(() => {
        const query = deferredSearch.trim().toLowerCase();

        return transactions.data.filter((tx) => {
            const matchesSearch = 
                !query ||
                (tx.source || tx.category?.name || '').toLowerCase().includes(query) ||
                (tx.notes || '').toLowerCase().includes(query);

            const matchesType = typeFilter === 'all' || tx.type === typeFilter;

            const matchesCategory = 
                categoryFilter === 'all' || 
                (tx.category && tx.category.name.toLowerCase() === categoryFilter.toLowerCase());

            return matchesSearch && matchesType && matchesCategory;
        });
    }, [transactions.data, deferredSearch, typeFilter, categoryFilter]);

    // Financial Metrics computed from current page data
    const totalInflow = useMemo(() => {
        return transactions.data
            .filter((tx) => tx.type === 'income')
            .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);
    }, [transactions.data]);

    const totalOutflow = useMemo(() => {
        return transactions.data
            .filter((tx) => tx.type === 'expense')
            .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);
    }, [transactions.data]);

    const netCashflow = totalInflow - totalOutflow;

    const isFiltered = search !== '' || typeFilter !== 'all' || categoryFilter !== 'all';

    const clearFilters = () => {
        setSearch('');
        setTypeFilter('all');
        setCategoryFilter('all');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Transactions" />

            <div className="w-full max-w-full min-w-0 p-4 md:p-8 space-y-6 sm:space-y-8">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
                        <p className="text-muted-foreground">Complete history of your finances</p>
                    </div>
                </div>

                {/* Section Navigation Tabs */}
                <SectionNav group="money" />

                {/* Top Summary Banner Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {/* Total Inflow */}
                    <div className="animate-fade-in-up stagger-1 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <TrendingUp className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Page Inflow</span>
                                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <ArrowUpRight className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight mt-3">
                                +₱{totalInflow.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Income credited on page</p>
                        </div>
                    </div>

                    {/* Total Outflow */}
                    <div className="animate-fade-in-up stagger-2 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-rose-500/40 dark:hover:border-rose-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-rose-500/10 via-rose-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <TrendingDown className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Page Outflow</span>
                                <div className="h-9 w-9 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <ArrowDownRight className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight mt-3">
                                -₱{totalOutflow.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Expenses debited on page</p>
                        </div>
                    </div>

                    {/* Net Cashflow */}
                    <div className={`animate-fade-in-up stagger-3 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 sm:col-span-3 lg:col-span-1 ${
                        netCashflow >= 0 ? 'hover:border-emerald-500/40 dark:hover:border-emerald-500/30' : 'hover:border-rose-500/40 dark:hover:border-rose-500/30'
                    }`}>
                        <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500 ${
                            netCashflow >= 0 ? 'from-emerald-500/10 via-emerald-500/[0.02] to-transparent' : 'from-rose-500/10 via-rose-500/[0.02] to-transparent'
                        }`} />
                        <DollarSign className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Net Balance</span>
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs ${
                                    netCashflow >= 0 
                                        ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                                        : 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                }`}>
                                    <DollarSign className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className={`text-2xl font-bold tracking-tight mt-3 ${netCashflow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {netCashflow >= 0 ? '+' : ''}₱{netCashflow.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Net flow for displayed records</p>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-border pb-4 w-full min-w-0">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input 
                                type="text" 
                                placeholder="Search transactions, notes..." 
                                className="w-full rounded-xl border border-input bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all shadow-2xs"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Type Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                            <button
                                onClick={() => setTypeFilter('all')}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                                    typeFilter === 'all'
                                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                All Types
                            </button>
                            <button
                                onClick={() => setTypeFilter('income')}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                                    typeFilter === 'income'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                <ArrowUpRight className="h-3 w-3" /> Income
                            </button>
                            <button
                                onClick={() => setTypeFilter('expense')}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                                    typeFilter === 'expense'
                                        ? 'bg-rose-600 text-white shadow-sm'
                                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                <ArrowDownRight className="h-3 w-3" /> Expenses
                            </button>
                        </div>
                    </div>

                    {/* Category Filter & Clear Button */}
                    <div className="flex items-center gap-2">
                        {categories && categories.length > 0 && (
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="h-9.5 w-[160px] rounded-xl bg-card border-input text-foreground text-xs shadow-2xs">
                                    <Layers className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border text-popover-foreground">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {isFiltered && (
                            <button 
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
                            >
                                <X className="h-3.5 w-3.5" /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Table View */}
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead className="border-b border-border bg-muted/50">
                                <tr>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">DATE</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">NAME / CATEGORY</th>
                                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">TYPE</th>
                                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground pr-10">AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                        <td className="p-6 align-middle text-muted-foreground">{tx.date.substring(0, 10)}</td>
                                        <td className="p-6 align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{tx.type === 'income' ? tx.source : tx.category?.name}</span>
                                                {tx.notes && <span className="text-xs text-muted-foreground truncate max-w-[280px] mt-0.5">{tx.notes}</span>}
                                            </div>
                                        </td>
                                        <td className="p-6 align-middle">
                                            <div className="flex items-center gap-2">
                                                <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    tx.type === 'income' 
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                }`}>
                                                    {tx.type === 'income' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                    {tx.type.toUpperCase()}
                                                </div>
                                                {tx.is_spent && (
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">
                                                        SPENT
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className={`p-6 align-middle text-right pr-10 font-bold ${
                                            tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                                        }`}>
                                            {tx.type === 'income' ? '+' : '-'}₱{parseFloat(tx.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {filteredTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="h-32 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <p className="font-medium text-foreground">No transactions found</p>
                                                <p className="text-xs">Try adjusting your search query, type filter, or category.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <ServerPagination meta={transactions} className="px-6 py-4 border-t border-border" />
                </div>
            </div>
        </AppLayout>
    );
}
