import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { SectionNav } from '@/components/section-nav';
import { Plus, Wallet, Clock, Trash2, Edit2, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Allowance Settings', href: '/allowance' },
];

interface Allowance {
    id: number;
    amount: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

interface Props {
    allowances: Allowance[];
}

export default function AllowancePage({ allowances }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAllowance, setEditingAllowance] = useState<Allowance | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [allowanceToDelete, setAllowanceToDelete] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    const { data, setData, post, put, processing, reset, clearErrors, errors } = useForm({
        amount: '',
        frequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    });

    const openAddModal = () => {
        setEditingAllowance(null);
        clearErrors();
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (allowance: Allowance) => {
        setEditingAllowance(allowance);
        clearErrors();
        setData({
            amount: allowance.amount,
            frequency: allowance.frequency,
        });
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAllowance) {
            put(route('allowance.update', { allowance: editingAllowance.id }), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('allowance.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDeleteClick = (id: number) => {
        setAllowanceToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (allowanceToDelete) {
            router.delete(route('allowance.destroy', { allowance: allowanceToDelete }), {
                onSuccess: () => setIsDeleteDialogOpen(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Allowance Management" />

            <div className="w-full max-w-full min-w-0 p-4 md:p-8 space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Allowance Management</h2>
                        <p className="text-muted-foreground">Manage recurring funds</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-lg border bg-card p-1 mr-2">
                             <button 
                                onClick={() => setViewMode('grid')}
                                className={`rounded-md p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('table')}
                                className={`rounded-md p-1.5 transition-colors ${viewMode === 'table' ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                        <button 
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add New Allowance
                        </button>
                    </div>
                </div>

                {/* Section Navigation Tabs */}
                <SectionNav group="planning" />

                {/* Top Metrics Banner */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="animate-fade-in-up stagger-1 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-indigo-500/40 dark:hover:border-indigo-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 via-indigo-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <Wallet className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Allowance</span>
                                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <Wallet className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight mt-3">
                                ₱{allowances.reduce((sum, a) => sum + Number(a.amount), 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Total recurring stipend</p>
                        </div>
                    </div>

                    <div className="animate-fade-in-up stagger-2 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-500/40 dark:hover:border-zinc-500/30 transition-all duration-300">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-slate-500/10 via-slate-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <Clock className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Sources</span>
                                <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-foreground transition-transform group-hover:scale-110 shadow-2xs">
                                    <Clock className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight mt-3">
                                {allowances.length}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Configured recurring funds</p>
                        </div>
                    </div>

                    <div className="animate-fade-in-up stagger-3 card-interactive group relative rounded-2xl border bg-card p-6 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300 sm:col-span-3 lg:col-span-1">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.02] to-transparent blur-2xl pointer-events-none opacity-50 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <Wallet className="absolute -right-2 -bottom-2 h-28 w-28 text-foreground/[0.20] dark:text-foreground/[0.18] pointer-events-none transition-all duration-500 group-hover:scale-110 group-hover:text-foreground/[0.28] -rotate-12 stroke-[1.25]" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Primary Frequency</span>
                                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110 shadow-2xs">
                                    <Wallet className="h-4.5 w-4.5" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-foreground tracking-tight mt-3 capitalize">
                                {allowances.length > 0 ? allowances[0].frequency : 'None'}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Schedule interval</p>
                        </div>
                    </div>
                </div>

                {allowances.length === 0 ? (
                    <div className="animate-fade-in-up flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center shadow-2xs">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-foreground mb-4 shadow-sm animate-float">
                            <Wallet className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">No Allowances Configured</h3>
                        <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
                            Set up daily, weekly, or monthly allowances to automatically calculate income.
                        </p>
                        <button
                            onClick={openAddModal}
                            className="mt-6 inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-zinc-50 transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-sm btn-interactive"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Allowance
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {allowances.map((allowance) => (
                        <div key={allowance.id} className="animate-fade-in-up card-interactive relative rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-400">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-foreground">₱{parseFloat(allowance.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                                        <Clock className="h-3.5 w-3.5" /> {allowance.frequency}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-border gap-3">
                                <button 
                                    onClick={() => openEditModal(allowance)}
                                    className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors"
                                >
                                    <Edit2 className="h-3.5 w-3.5" /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDeleteClick(allowance.id)}
                                    className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 transition-colors">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Allowance Source</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Amount</th>
                                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Frequency</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {allowances.map((allowance) => (
                                        <tr key={allowance.id} className="transition-colors hover:bg-muted/30">
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <div className="rounded-full bg-emerald-500/10 p-1.5 text-emerald-500">
                                                        <Wallet className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="font-bold">Recurring Allowance</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-right font-bold text-foreground italic">
                                                ₱{parseFloat(allowance.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 align-middle text-center">
                                                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                                                    {allowance.frequency}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button 
                                                        onClick={() => openEditModal(allowance)}
                                                        className="text-muted-foreground hover:text-foreground transition-all"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClick(allowance.id)}
                                                        className="text-rose-500 hover:text-rose-700 transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm rounded-2xl bg-card p-6 border border-border text-card-foreground">
                        <h3 className="text-xl font-bold mb-4 text-foreground">
                            {editingAllowance ? 'Edit Allowance' : 'Recurring Allowance'}
                        </h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-foreground">Amount (₱)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className={`w-full rounded-xl border ${errors.amount ? 'border-rose-500' : 'border-input'} bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none`} 
                                    placeholder="0.00"
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    required
                                />
                                {errors.amount && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.amount}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1 text-foreground">Frequency</label>
                                <select 
                                    className={`w-full rounded-xl border ${errors.frequency ? 'border-rose-500' : 'border-input'} bg-background p-2.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none`}
                                    value={data.frequency}
                                    onChange={e => setData('frequency', e.target.value as any)}
                                    required
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                                {errors.frequency && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.frequency}</p>}
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {editingAllowance ? 'Update Allowance' : 'Save Allowance'}
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
                title="Remove Allowance"
                description="Are you sure you want to remove this allowance? This will stop the recurring tracking of this fund."
            />
        </AppLayout>
    );
}

// Route function for typescript
declare function route(name: string, params?: any): string;
;
