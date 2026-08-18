import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { SectionNav } from '@/components/section-nav';
import { Plus, Trash2, Edit2, Search, Calendar, Landmark, TrendingDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { ClientPagination } from '@/components/pagination-controls';
import { getErrorMessage, postJson } from '@/lib/api';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Expenses', href: '/expenses' },
];

interface Category {
    id: number;
    name: string;
    icon?: string;
}

interface Expense {
    id: number;
    amount: string;
    category: Category;
    date: string;
    notes?: string;
}

interface Props {
    expenses: Expense[];
    categories: Category[];
}

interface AiCategorizeResponse {
    status: 'suggested' | 'needs_review' | 'fallback' | 'unavailable';
    suggestion?: {
        category_id: number;
        category_name: string;
        confidence: number;
        reason?: string;
    };
    message?: string | null;
}

type AiSuggestionState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'suggested' | 'needs_review' | 'fallback'; suggestion: NonNullable<AiCategorizeResponse['suggestion']>; message?: string | null }
    | { status: 'unavailable'; message: string };

const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function ExpensesPage({ expenses, categories }: Props) {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState<string>((now.getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState<string>(now.getFullYear().toString());
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
    const [aiSuggestion, setAiSuggestion] = useState<AiSuggestionState>({ status: 'idle' });

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

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const rawDate = typeof expense.date === 'string' ? expense.date.substring(0, 10) : '';
            const [y, m] = rawDate.split('-');
            const expenseMonth = m ? parseInt(m, 10).toString() : '';
            const expenseYear = y || '';

            const matchesMonth = selectedMonth === 'all' || expenseMonth === selectedMonth;
            const matchesYear = selectedYear === 'all' || expenseYear === selectedYear;
            
            const matchesSearch = 
                (expense.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (expense.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

            return matchesMonth && matchesYear && matchesSearch;
        });
    }, [expenses, selectedMonth, selectedYear, searchQuery]);

    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedMonth, selectedYear, searchQuery]);

    const totalPages = Math.ceil(filteredExpenses.length / PAGE_SIZE) || 1;
    const paginatedExpenses = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredExpenses.slice(start, start + PAGE_SIZE);
    }, [filteredExpenses, currentPage]);

    const totalExpenses = useMemo(() => {
        return filteredExpenses.reduce((sum: number, expense: Expense) => sum + parseFloat(expense.amount), 0);
    }, [filteredExpenses]);

    const { data, setData, post, put, reset, clearErrors, processing, errors } = useForm({
        amount: '',
        category_id: '',
        date: getLocalDateString(),
        notes: '',
    });

    useEffect(() => {
        if (!isModalOpen) {
            setAiSuggestion({ status: 'idle' });
        }
    }, [isModalOpen]);

    useEffect(() => {
        if (aiSuggestion.status !== 'loading') {
            setAiSuggestion({ status: 'idle' });
        }
    }, [data.amount, data.notes, data.date]);

    const openAddModal = () => {
        setEditingExpense(null);
        setAiSuggestion({ status: 'idle' });
        clearErrors();
        setData({
            amount: '',
            category_id: '',
            date: getLocalDateString(),
            notes: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        setAiSuggestion({ status: 'idle' });
        clearErrors();
        setData({
            amount: expense.amount,
            category_id: expense.category?.id ? expense.category.id.toString() : '',
            date: expense.date ? expense.date.substring(0, 10) : getLocalDateString(),
            notes: expense.notes || '',
        });
        setIsModalOpen(true);
    };

    const suggestCategory = async () => {
        if (!data.amount) {
            setAiSuggestion({ status: 'unavailable', message: 'Add an amount before requesting a suggestion.' });
            return;
        }

        const amountValue = Number(data.amount);
        if (Number.isNaN(amountValue)) {
            setAiSuggestion({ status: 'unavailable', message: 'Amount must be a valid number.' });
            return;
        }

        setAiSuggestion({ status: 'loading' });

        try {
            const response = await postJson<AiCategorizeResponse>('/ai/categorize', {
                amount: amountValue,
                notes: data.notes,
                date: data.date,
            });

            if (response.status === 'unavailable') {
                setAiSuggestion({
                    status: 'unavailable',
                    message: response.message || 'AI is unavailable right now.',
                });
                return;
            }

            if (response.suggestion) {
                setAiSuggestion({
                    status: response.status as 'suggested' | 'needs_review' | 'fallback',
                    suggestion: response.suggestion,
                    message: response.message ?? null,
                });
                return;
            }

            setAiSuggestion({
                status: 'unavailable',
                message: response.message || 'No suggestion available.',
            });
        } catch (error) {
            setAiSuggestion({ status: 'unavailable', message: getErrorMessage(error) });
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingExpense) {
            put(route('transactions.update', { transaction: editingExpense.id }), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingExpense(null);
                    reset();
                },
            });
        } else {
            post(route('expenses.store'), {
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
            <Head title="Expense Management" />

            <div className="p-4 md:p-8 space-y-8">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Expense Management</h2>
                        <p className="text-muted-foreground">Track and manage your spending</p>
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Expense
                    </button>
                </div>

                {/* Section Navigation Tabs */}
                <SectionNav group="money" />
                
                {/* Summary Banner Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="animate-fade-in-up stagger-1 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-rose-500/40 dark:hover:border-rose-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-rose-500/10 via-rose-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <TrendingDown className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Period Expenses</span>
                                <div className="h-9 w-9 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <TrendingDown className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight mt-3">
                                ₱{totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Filtered spending total</p>
                        </div>
                    </div>

                    <div className="animate-fade-in-up stagger-2 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 via-blue-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <Landmark className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recorded Transactions</span>
                                <div className="h-9 w-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <Landmark className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight mt-3">
                                {filteredExpenses.length}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Total count for selected period</p>
                        </div>
                    </div>

                    <div className="animate-fade-in-up stagger-3 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all duration-300 sm:col-span-3 lg:col-span-1">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/10 via-amber-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <Calendar className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Average Expense</span>
                                <div className="h-9 w-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <Calendar className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight mt-3">
                                ₱{(filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Average per transaction</p>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border pb-4 w-full min-w-0">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search expenses..." 
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
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">DATE</th>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">CATEGORY</th>
                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">AMOUNT</th>
                                <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">NOTES</th>
                                <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground pr-10">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedExpenses.map((expense) => (
                                <tr key={expense.id} className="border-b hover:bg-muted/50">
                                    <td className="p-6 align-middle">{expense.date.substring(0, 10)}</td>
                                    <td className="p-6 align-middle font-medium">{expense.category.name}</td>
                                    <td className="p-6 align-middle text-right text-rose-600 font-bold">
                                        -₱{parseFloat(expense.amount).toFixed(2)}
                                    </td>
                                    <td className="p-6 align-middle text-muted-foreground">{expense.notes}</td>
                                    <td className="p-6 align-middle text-right pr-4">
                                        <div className="flex justify-end gap-2 pr-4">
                                            <button 
                                                onClick={() => openEditModal(expense)}
                                                className="p-2 hover:bg-muted rounded-md"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(expense.id)}
                                                className="p-2 hover:bg-rose-50 text-rose-600 rounded-md"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredExpenses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="h-24 text-center text-muted-foreground">No expense records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <ClientPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredExpenses.length}
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
                            {editingExpense ? 'Edit Expense' : 'Add Expense'}
                        </h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-foreground">Amount (₱)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₱</span>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" 
                                        placeholder="0.00"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                            </div>
                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <label className="block text-xs font-medium text-foreground">Category</label>
                                    <button
                                        type="button"
                                        onClick={suggestCategory}
                                        disabled={aiSuggestion.status === 'loading'}
                                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-60"
                                    >
                                        {aiSuggestion.status === 'loading' ? 'Suggesting...' : 'Suggest with AI'}
                                    </button>
                                </div>
                                <select 
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-xs text-rose-500 mt-1">{errors.category_id}</p>}
                                {aiSuggestion.status === 'unavailable' && (
                                    <p className="mt-2 text-xs text-amber-600">{aiSuggestion.message}</p>
                                )}
                                {(aiSuggestion.status === 'suggested' || aiSuggestion.status === 'needs_review' || aiSuggestion.status === 'fallback') && (
                                    <div className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-900 dark:text-emerald-300">
                                        <p>
                                             Suggested: <span className="font-semibold">{aiSuggestion.suggestion.category_name}</span> ({Math.round(aiSuggestion.suggestion.confidence * 100)}% confidence)
                                        </p>
                                        {aiSuggestion.suggestion.reason && (
                                            <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">{aiSuggestion.suggestion.reason}</p>
                                        )}
                                        {aiSuggestion.message && (
                                            <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">{aiSuggestion.message}</p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setData('category_id', aiSuggestion.suggestion.category_id.toString())}
                                            className="mt-2 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors"
                                        >
                                            Use suggestion
                                        </button>
                                    </div>
                                )}
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
                                        setEditingExpense(null);
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
                                    {editingExpense ? 'Update Expense' : 'Save Expense'}
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
                description="Are you sure you want to delete this expense entry? This will permanently remove the record from your accounts."
            />
        </AppLayout>
    );
}

// Route function for typescript
declare function route(name: string, params?: any): string;
