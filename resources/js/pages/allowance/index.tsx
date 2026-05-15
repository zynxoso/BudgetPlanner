import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
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

    const { data, setData, post, put, processing, reset, errors } = useForm({
        amount: '',
        frequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    });

    const openAddModal = () => {
        setEditingAllowance(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (allowance: Allowance) => {
        setEditingAllowance(allowance);
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

            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Allowance Management</h2>
                        <p className="text-muted-foreground">Manage recurring funds</p>
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
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add New Allowance
                        </button>
                    </div>
                </div>

                {viewMode === 'grid' ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {allowances.map((allowance) => (
                        <div key={allowance.id} className="relative rounded-xl border bg-card p-6 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl">₱{parseFloat(allowance.amount).toFixed(2)}</h4>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                        <Clock className="h-3 w-3" /> {allowance.frequency}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t gap-3">
                                <button 
                                    onClick={() => openEditModal(allowance)}
                                    className="text-sm text-zinc-600 font-medium hover:underline flex items-center gap-1"
                                >
                                    <Edit2 className="h-4 w-4" /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDeleteClick(allowance.id)}
                                    className="text-sm text-rose-600 font-medium hover:underline flex items-center gap-1"
                                >
                                    <Trash2 className="h-4 w-4" /> Remove
                                </button>
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
                                            <td className="p-4 align-middle text-right font-bold text-zinc-900 dark:text-zinc-100 italic">
                                                ₱{parseFloat(allowance.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 align-middle text-center">
                                                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 uppercase">
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
                                    {allowances.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-muted-foreground">No allowances configured yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border text-zinc-900">
                        <h3 className="text-xl font-bold mb-4 text-zinc-900">
                            {editingAllowance ? 'Edit Allowance' : 'Recurring Allowance'}
                        </h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-zinc-900">Amount</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="w-full rounded-md border border-zinc-200 p-2 text-zinc-900" 
                                    placeholder="0.00"
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    required
                                />
                                {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-zinc-900">Frequency</label>
                                <select 
                                    className="w-full rounded-md border border-zinc-200 p-2 text-zinc-900 bg-white"
                                    value={data.frequency}
                                    onChange={e => setData('frequency', e.target.value as any)}
                                    required
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50"
                                >
                                    {editingAllowance ? 'Update' : 'Save'} Allowance
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
