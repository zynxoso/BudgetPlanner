import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Plus, Trash2, Edit2, Search, Calendar, Landmark, TrendingDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
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

export default function ExpensesPage({ expenses, categories }: Props) {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState<string>((now.getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState<string>(now.getFullYear().toString());
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
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

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const date = new Date(expense.date);
            const matchesMonth = selectedMonth === 'all' || (date.getMonth() + 1).toString() === selectedMonth;
            const matchesYear = selectedYear === 'all' || date.getFullYear().toString() === selectedYear;
            
            const matchesSearch = 
                expense.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (expense.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

            return matchesMonth && matchesYear && matchesSearch;
        });
    }, [expenses, selectedMonth, selectedYear, searchQuery]);

    const totalExpenses = useMemo(() => {
        return filteredExpenses.reduce((sum: number, expense: Expense) => sum + parseFloat(expense.amount), 0);
    }, [filteredExpenses]);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        amount: '',
        category_id: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        setData({
            amount: expense.amount,
            category_id: expense.category.id.toString(),
            date: expense.date.substring(0, 10),
            notes: expense.notes || '',
        });
        setIsModalOpen(true);
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

            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Expense Management</h2>
                        <p className="text-muted-foreground">Monitor your spending activity</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Expense
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {/* Search and Filters Sidebar-style Row */}
                    <div className="md:col-span-3 rounded-xl border bg-card p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                        <div className="relative flex-1 w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input 
                                type="text" 
                                placeholder="Search expenses..." 
                                className="w-full rounded-md border bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 pl-10 pr-4 py-2 text-sm focus:outline-none transition-all"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Period:</span>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="h-9 w-full md:w-[130px] bg-zinc-900/40 border-zinc-800 focus:ring-0">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-800">
                                        <SelectItem value="all">All Months</SelectItem>
                                        {months.map(month => (
                                            <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="h-9 w-full md:w-[100px] bg-zinc-900/40 border-zinc-800 focus:ring-0">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-800">
                                        <SelectItem value="all">All Years</SelectItem>
                                        {years.map(year => (
                                            <SelectItem key={year} value={year}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {(selectedMonth !== 'all' || selectedYear !== 'all' || searchQuery !== '') && (
                                <button 
                                    onClick={() => { setSelectedMonth('all'); setSelectedYear('all'); setSearchQuery(''); }}
                                    className="text-xs text-rose-400/70 hover:text-rose-400 transition-colors px-2"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Summary Card - Exact Dashboard Clone */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Period Expenses</p>
                            <TrendingDown className="h-4 w-4 text-rose-500" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl font-bold">
                                ₱{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
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
                            {filteredExpenses.map((expense) => (
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
                            {expenses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="h-24 text-center text-muted-foreground">No expense records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Simple Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl text-zinc-900 border">
                        <h3 className="text-xl font-bold mb-4 text-zinc-900">
                            {editingExpense ? 'Edit Expense' : 'Add Expense'}
                        </h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-zinc-700">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-zinc-400">₱</span>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        className="w-full rounded-md border border-zinc-200 bg-white pl-8 pr-2 py-2 text-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:outline-none" 
                                        placeholder="0.00"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-zinc-700">Category</label>
                                <select 
                                    className="w-full rounded-md border border-zinc-200 bg-white p-2 text-zinc-900"
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
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-zinc-700">Date</label>
                                <input 
                                    type="date" 
                                    className="w-full rounded-md border border-zinc-200 bg-white p-2 text-zinc-900"
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-zinc-700">Notes</label>
                                <textarea 
                                    className="w-full rounded-md border border-zinc-200 bg-white p-2 text-zinc-900" 
                                    rows={3}
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingExpense(null);
                                        reset();
                                    }}
                                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50"
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
