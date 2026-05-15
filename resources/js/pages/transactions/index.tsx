import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transactions', href: '/transactions' },
];

interface Transaction {
    id: number;
    amount: string;
    type: 'income' | 'expense';
    source?: string;
    category?: { name: string };
    date: string;
    notes?: string;
    is_spent?: boolean;
}

interface Props {
    transactions: {
        data: Transaction[];
        links: any;
    };
    categories: any[];
}

export default function TransactionsPage({ transactions, categories }: Props) {
    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);

    const filteredTransactions = useMemo(() => {
        const query = deferredSearch.trim().toLowerCase();

        if (!query) {
            return transactions.data;
        }

        return transactions.data.filter((tx) =>
            (tx.source || tx.category?.name || '').toLowerCase().includes(query) ||
            (tx.notes || '').toLowerCase().includes(query),
        );
    }, [transactions.data, deferredSearch]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Transactions" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Transactions</h2>
                        <p className="text-muted-foreground">Complete history of your finances</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search transactions..." 
                            className="w-full rounded-md border pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
                            <Filter className="h-4 w-4" /> Filter
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">DATE</th>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">NAME / CATEGORY</th>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">TYPE</th>
                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground pr-10">AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="border-b hover:bg-muted/50">
                                    <td className="p-6 align-middle">{tx.date.substring(0, 10)}</td>
                                    <td className="p-6 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{tx.type === 'income' ? tx.source : tx.category?.name}</span>
                                            {tx.notes && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{tx.notes}</span>}
                                        </div>
                                    </td>
                                    <td className="p-6 align-middle">
                                        <div className="flex items-center gap-2">
                                            <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                            }`}>
                                                {tx.type === 'income' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                {tx.type.toUpperCase()}
                                            </div>
                                            {tx.is_spent && (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-zinc-100 text-zinc-500">
                                                    SPENT
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={`p-6 align-middle text-right pr-10 font-bold ${
                                        tx.type === 'income' ? 'text-emerald-600' : 'text-zinc-900'
                                    }`}>
                                        {tx.type === 'income' ? '+' : '-'}₱{parseFloat(tx.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="h-24 text-center text-muted-foreground">No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
