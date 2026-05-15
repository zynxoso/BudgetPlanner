import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { HandCoins, Plus, Calendar, CreditCard, Trash2, ArrowRight, LayoutGrid, List } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Loans', href: '/loans' },
];

interface Loan {
    id: number;
    name: string;
    amount: string;
    remaining_amount: string;
    interest_rate: string;
    due_date: string;
    date_borrowed: string;
    status: 'active' | 'paid';
}

interface Props {
    loans: Loan[];
}

export default function LoansPage({ loans }: Props) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [loanToDelete, setLoanToDelete] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    const addLoanForm = useForm({
        name: '',
        amount: '',
        interest_rate: '0',
        due_date: '',
        date_borrowed: new Date().toISOString().split('T')[0],
    });

    const paymentForm = useForm({
        amount: '',
    });

    const loanCards = useMemo(
        () =>
            loans.map((loan) => {
                const amount = Number(loan.amount);
                const remaining = Number(loan.remaining_amount);
                const paid = amount - remaining;
                const progress = amount > 0 ? (paid / amount) * 100 : 0;

                return {
                    ...loan,
                    amountLabel: amount.toLocaleString(),
                    remainingLabel: remaining.toLocaleString(),
                    progress,
                    clampedProgress: Math.min(progress, 100),
                    borrowedLabel: loan.date_borrowed.substring(0, 10),
                    dueLabel: loan.due_date ? loan.due_date.substring(0, 10) : '—',
                };
            }),
        [loans],
    );

    const submitAddLoan = (e: React.FormEvent) => {
        e.preventDefault();
        addLoanForm.post(route('loans.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addLoanForm.reset();
            },
        });
    };

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoan) return;

        paymentForm.patch(route('loans.payment', { loan: selectedLoan.id }), {
            onSuccess: () => {
                setSelectedLoan(null);
                paymentForm.reset();
            },
        });
    };

    const handleDeleteClick = (id: number) => {
        setLoanToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (loanToDelete) {
            router.delete(route('loans.destroy', { loan: loanToDelete }), {
                onSuccess: () => setIsDeleteDialogOpen(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loan Tracking" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Loan Tracking</h2>
                        <p className="text-muted-foreground">Manage your debts and repayments</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-lg border bg-card p-1 mr-2">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`rounded-md p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('table')}
                                className={`rounded-md p-1.5 transition-colors ${viewMode === 'table' ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Loan
                        </button>
                    </div>
                </div>

                {viewMode === 'grid' ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {loanCards.map((loan) => (
                            <div key={loan.id} className="relative rounded-xl border bg-card p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="space-y-1">
                                        <div className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold ${
                                            loan.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            <HandCoins className="h-3 w-3" />
                                            {loan.status.toUpperCase()}
                                        </div>
                                        <h4 className="font-bold text-xl">{loan.name}</h4>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm text-muted-foreground font-medium">TOTAL BORROWED</span>
                                        <p className="text-xl font-bold">₱{loan.amountLabel}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm font-medium">
                                        <span className="text-muted-foreground">Remaining: ₱{loan.remainingLabel}</span>
                                        <span className={loan.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>
                                            {loan.progress.toFixed(0)}% paid
                                        </span>
                                    </div>
                                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-100">
                                        <div 
                                            className={`h-full transition-all duration-700 ease-out ${
                                                loan.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                                            }`} 
                                            style={{ width: `${loan.clampedProgress}%` }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground mt-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Borrowed: {loan.borrowedLabel}
                                        </div>
                                        <div className="flex items-center gap-1 justify-end">
                                            <CreditCard className="h-3 w-3" />
                                            Due: {loan.dueLabel}
                                        </div>
                                    </div>

                                    <div className="flex pt-4 mt-6 border-t gap-3">
                                        {loan.status === 'active' && (
                                            <button 
                                                onClick={() => setSelectedLoan(loan)}
                                                className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-50 transition-colors hover:bg-zinc-800"
                                            >
                                                Make Payment
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDeleteClick(loan.id)}
                                            className="rounded-md border border-rose-200 bg-rose-50 text-rose-600 px-4 py-2 text-xs font-medium transition-colors hover:bg-rose-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 transition-colors">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Source</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Amount</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Remaining</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Progress</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Due Date</th>
                                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {loanCards.map((loan) => (
                                        <tr key={loan.id} className="transition-colors hover:bg-muted/30">
                                            <td className="p-4 align-middle font-bold text-zinc-900 dark:text-zinc-100">{loan.name}</td>
                                            <td className="p-4 align-middle text-right font-medium">₱{loan.amountLabel}</td>
                                            <td className="p-4 align-middle text-right font-bold text-zinc-900 dark:text-zinc-100">₱{loan.remainingLabel}</td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                                                        <div 
                                                            className={`h-full ${loan.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${loan.clampedProgress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] w-6">{loan.progress.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground whitespace-nowrap">
                                                {loan.dueLabel}
                                            </td>
                                            <td className="p-4 align-middle text-center">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                    loan.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {loan.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {loan.status === 'active' && (
                                                        <button 
                                                            onClick={() => setSelectedLoan(loan)}
                                                            className="rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-medium text-zinc-50 hover:bg-zinc-800 transition-colors"
                                                        >
                                                            Pay
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteClick(loan.id)}
                                                        className="rounded-md border border-rose-200 bg-rose-50 text-rose-600 p-1 transition-colors hover:bg-rose-100"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {loans.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-muted-foreground">No loans tracked yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Loan Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border text-zinc-900">
                        <h3 className="text-xl font-bold mb-4">Add External Loan</h3>
                        <form onSubmit={submitAddLoan} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Lender / Name</label>
                                <input 
                                    type="text" 
                                    className="w-full rounded-md border p-2 text-zinc-900" 
                                    placeholder="Friend, Bank, etc."
                                    value={addLoanForm.data.name}
                                    onChange={e => addLoanForm.setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Total Loan Amount</label>
                                    <input 
                                        type="number" 
                                        className="w-full rounded-md border p-2 text-zinc-900" 
                                        placeholder="0.00"
                                        value={addLoanForm.data.amount}
                                        onChange={e => addLoanForm.setData('amount', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
                                    <input 
                                        type="number" 
                                        className="w-full rounded-md border p-2 text-zinc-900" 
                                        placeholder="0"
                                        value={addLoanForm.data.interest_rate}
                                        onChange={e => addLoanForm.setData('interest_rate', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date Borrowed</label>
                                    <input 
                                        type="date" 
                                        className="w-full rounded-md border p-2 text-zinc-900 font-medium text-xs"
                                        value={addLoanForm.data.date_borrowed}
                                        onChange={e => addLoanForm.setData('date_borrowed', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Due Date (Optional)</label>
                                    <input 
                                        type="date" 
                                        className="w-full rounded-md border p-2 text-zinc-900 font-medium text-xs"
                                        value={addLoanForm.data.due_date}
                                        onChange={e => addLoanForm.setData('due_date', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md">Cancel</button>
                                <button type="submit" disabled={addLoanForm.processing} className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-md hover:bg-zinc-800">Save Loan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border text-zinc-900">
                        <h3 className="text-xl font-bold mb-4">Repay {selectedLoan.name}</h3>
                        <form onSubmit={submitPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Amount</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="w-full rounded-md border p-3 border-emerald-500 text-lg font-bold" 
                                    placeholder="0.00"
                                    value={paymentForm.data.amount}
                                    onChange={e => paymentForm.setData('amount', e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Original Loan: ₱{parseFloat(selectedLoan.amount).toLocaleString()}</p>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setSelectedLoan(null)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md">Cancel</button>
                                <button type="submit" disabled={paymentForm.processing} className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Confirm Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationDialog 
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Loan"
                description="Are you sure you want to delete this loan record? This will permanently remove the record and all associated repayment history."
            />
        </AppLayout>
    );
}

declare function route(name: string, params?: any): string;
