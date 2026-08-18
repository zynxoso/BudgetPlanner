import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { SectionNav } from '@/components/section-nav';
import { Plus, Trash2, Edit2, Search, Calendar, Landmark, TrendingUp } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { ClientPagination } from '@/components/pagination-controls';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Income', href: '/income' },
];

interface Income {
    id: number;
    amount: string;
    source: string;
    date: string;
    notes?: string;
    is_spent: boolean;
}

interface Props {
    incomes: Income[];
}

const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function IncomePage({ incomes }: Props) {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState<string>((now.getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState<string>(now.getFullYear().toString());
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const currentYear = now.getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

    const filteredIncomes = useMemo(() => {
        return incomes.filter(income => {
            const rawDate = typeof income.date === 'string' ? income.date.substring(0, 10) : '';
            const [y, m] = rawDate.split('-');
            const incomeMonth = m ? parseInt(m, 10).toString() : '';
            const incomeYear = y || '';

            const matchesMonth = selectedMonth === 'all' || incomeMonth === selectedMonth;
            const matchesYear = selectedYear === 'all' || incomeYear === selectedYear;
            
            const matchesSearch = 
                income.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (income.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

            return matchesMonth && matchesYear && matchesSearch;
        });
    }, [incomes, selectedMonth, selectedYear, searchQuery]);

    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedMonth, selectedYear, searchQuery]);

    const totalPages = Math.ceil(filteredIncomes.length / PAGE_SIZE) || 1;
    const paginatedIncomes = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredIncomes.slice(start, start + PAGE_SIZE);
    }, [filteredIncomes, currentPage]);

    const totalIncome = useMemo(() => {
        return filteredIncomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
    }, [filteredIncomes]);

    const { data, setData, post, put, reset, clearErrors, processing, errors } = useForm({
        amount: '',
        source: '',
        date: getLocalDateString(),
        notes: '',
        is_spent: false as boolean,
    });

    const openAddModal = () => {
        setEditingIncome(null);
        clearErrors();
        setData({
            amount: '',
            source: '',
            date: getLocalDateString(),
            notes: '',
            is_spent: false,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (income: Income) => {
        setEditingIncome(income);
        clearErrors();
        setData({
            amount: income.amount,
            source: income.source,
            date: income.date ? income.date.substring(0, 10) : getLocalDateString(),
            notes: income.notes || '',
            is_spent: Boolean(income.is_spent),
        });
        setIsModalOpen(true);
    };

    const toggleSpent = (income: Income) => {
        router.put(route('transactions.update', { transaction: income.id }), {
            ...income,
            date: income.date.substring(0, 10),
            is_spent: !income.is_spent,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingIncome) {
            put(route('transactions.update', { transaction: editingIncome.id }), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingIncome(null);
                    reset();
                },
            });
        } else {
            post(route('income.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDeleteClick = (id: number) => {
        setTransactionToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (transactionToDelete) {
            router.delete(route('transactions.destroy', { transaction: transactionToDelete }), {
                onSuccess: () => setIsDeleteDialogOpen(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Income Management" />

            <div className="p-4 md:p-8 space-y-8">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Income Management</h2>
                        <p className="text-muted-foreground">Track your earning sources</p>
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Income
                    </button>
                </div>

                {/* Section Navigation Tabs */}
                <SectionNav group="money" />

                {/* Summary Banner Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="animate-fade-in-up stagger-1 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <TrendingUp className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Period Income</span>
                                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <TrendingUp className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight mt-3">
                                ₱{totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Filtered earnings total</p>
                        </div>
                    </div>

                    <div className="animate-fade-in-up stagger-2 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 via-blue-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <Landmark className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Income Entries</span>
                                <div className="h-9 w-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <Landmark className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight mt-3">
                                {filteredIncomes.length}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Total transactions logged</p>
                        </div>
                    </div>

                    <div className="animate-fade-in-up stagger-3 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all duration-300 sm:col-span-3 lg:col-span-1">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/10 via-amber-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <Calendar className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Average Income</span>
                                <div className="h-9 w-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <Calendar className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight mt-3">
                                ₱{(filteredIncomes.length > 0 ? totalIncome / filteredIncomes.length : 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Average per income entry</p>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border pb-4 w-full min-w-0">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search income..." 
                            className="w-full rounded-xl border border-input bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all shadow-2xs"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="h-9.5 w-[140px] rounded-xl bg-card border-input text-foreground text-xs shadow-2xs">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="all">All Months</SelectItem>
                                {months.map(month => (
                                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="h-9.5 w-[100px] rounded-xl bg-card border-input text-foreground text-xs shadow-2xs">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="all">All Years</SelectItem>
                                {years.map(year => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {(selectedMonth !== 'all' || selectedYear !== 'all' || searchQuery !== '') && (
                            <button 
                                onClick={() => { setSelectedMonth('all'); setSelectedYear('all'); setSearchQuery(''); }}
                                className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm min-w-[600px]">
                        <thead className="border-b border-border bg-muted/50">
                            <tr>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">DATE</th>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">SOURCE</th>
                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">AMOUNT</th>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">STATUS</th>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">NOTES</th>
                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedIncomes.map((income) => (
                                <tr key={income.id} className={`border-b border-border hover:bg-muted/50 ${income.is_spent ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                    <td className="p-6 align-middle text-foreground">{income.date ? income.date.substring(0, 10) : '—'}</td>
                                    <td className="p-6 align-middle font-medium text-foreground">{income.source}</td>
                                    <td className="p-6 align-middle text-right text-emerald-600 dark:text-emerald-400 font-bold">
                                        ₱{parseFloat(income.amount).toFixed(2)}
                                    </td>
                                    <td className="p-6 align-middle">
                                        <button 
                                            onClick={() => toggleSpent(income)}
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                                                income.is_spent 
                                                ? 'bg-muted text-muted-foreground hover:bg-muted/80' 
                                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                                            }`}
                                        >
                                            {income.is_spent ? 'SPENT' : 'AVAILABLE'}
                                        </button>
                                    </td>
                                    <td className="p-6 align-middle text-muted-foreground">{income.notes || '—'}</td>
                                    <td className="p-6 align-middle text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openEditModal(income)}
                                                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                                                title="Edit income"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(income.id)}
                                                className="p-1 text-muted-foreground hover:text-rose-500 transition-colors"
                                                title="Delete income"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredIncomes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="h-24 text-center text-muted-foreground">No income records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <ClientPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredIncomes.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setCurrentPage}
                        className="px-6 py-4"
                    />
                </div>
            </div>

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-2xl bg-card p-6 text-card-foreground border border-border">
                        <h3 className="text-xl font-bold mb-4 text-foreground">
                            {editingIncome ? 'Edit Income' : 'Add Income'}
                        </h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-foreground">Amount (₱)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₱</span>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        className={`w-full rounded-xl border ${errors.amount ? 'border-rose-500' : 'border-input'} bg-background pl-8 pr-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none`} 
                                        placeholder="0.00"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.amount && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.amount}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1 text-foreground">Source</label>
                                <input 
                                    type="text" 
                                    className={`w-full rounded-xl border ${errors.source ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none`} 
                                    placeholder="Salary, Freelance, Business, etc."
                                    value={data.source}
                                    onChange={e => setData('source', e.target.value)}
                                    required
                                />
                                {errors.source && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.source}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1 text-foreground">Date</label>
                                <input 
                                    type="date" 
                                    className={`w-full rounded-xl border ${errors.date ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none`}
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                    required
                                />
                                {errors.date && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.date}</p>}
                            </div>
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-input text-primary focus:ring-primary"
                                        checked={data.is_spent}
                                        onChange={e => setData('is_spent', e.target.checked)}
                                    />
                                    <span className="text-xs font-medium text-foreground">Already spent (Nagastos na)</span>
                                </label>
                                {errors.is_spent && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.is_spent}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1 text-foreground">Notes (Optional)</label>
                                <textarea 
                                    className={`w-full rounded-xl border ${errors.notes ? 'border-rose-500' : 'border-input'} bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none`} 
                                    rows={3}
                                    placeholder="Additional notes..."
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                />
                                {errors.notes && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.notes}</p>}
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingIncome(null);
                                        reset();
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : editingIncome ? 'Update Income' : 'Save Income'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationDialog 
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Transaction"
                description="Are you sure you want to delete this income entry? This will permanently remove the record from your accounts."
            />
        </AppLayout>
    );
}

// Route function for typescript
declare function route(name: string, params?: any): string;
