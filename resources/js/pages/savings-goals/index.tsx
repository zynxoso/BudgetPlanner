import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Target, TrendingUp, Calendar, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Savings Goals', href: '/savings-goals' },
];

interface SavingsGoal {
    id: number;
    name: string;
    target_amount: string;
    current_amount: string;
    deadline: string;
}

interface Props {
    goals: SavingsGoal[];
}

export default function SavingsGoalsPage({ goals }: Props) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<number | null>(null);
    
    const addGoalForm = useForm({
        name: '',
        target_amount: '',
        deadline: '',
    });

    const addFundsForm = useForm({
        amount: '',
    });

    const goalCards = useMemo(
        () =>
            goals.map((goal) => {
                const target = Number(goal.target_amount);
                const current = Number(goal.current_amount);
                const progress = target > 0 ? (current / target) * 100 : 0;

                return {
                    ...goal,
                    targetLabel: target.toLocaleString(),
                    currentLabel: current.toLocaleString(),
                    progress,
                    clampedProgress: Math.min(progress, 100),
                    deadlineLabel: goal.deadline.substring(0, 10),
                };
            }),
        [goals],
    );

    const openAddModal = () => {
        addGoalForm.reset();
        addGoalForm.clearErrors();
        setIsAddModalOpen(true);
    };

    const openFundsModal = (goal: SavingsGoal) => {
        setSelectedGoal(goal);
        addFundsForm.reset();
        addFundsForm.clearErrors();
    };

    const submitAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        addGoalForm.post(route('savings-goals.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addGoalForm.reset();
            },
        });
    };

    const submitAddFunds = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGoal) return;
        
        addFundsForm.patch(route('savings-goals.updateAddAmount', { savingsGoal: selectedGoal.id }), {
            onSuccess: () => {
                setSelectedGoal(null);
                addFundsForm.reset();
            },
        });
    };

    const handleDeleteClick = (id: number) => {
        setGoalToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (goalToDelete) {
            router.delete(route('savings-goals.destroy', { savingsGoal: goalToDelete }), {
                onSuccess: () => setIsDeleteDialogOpen(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Savings Goals" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Savings Goals</h2>
                        <p className="text-muted-foreground">Track your progress toward future dreams</p>
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800"
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Goal
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {goalCards.map((goal) => (
                        <div key={goal.id} className="group relative rounded-xl border bg-card p-6 shadow-sm overflow-hidden">
                            <div className="flex items-start justify-between mb-6">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                                        <TrendingUp className="h-3 w-3" />
                                        Active Goal
                                    </div>
                                    <h4 className="font-bold text-xl">{goal.name}</h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-muted-foreground font-medium">TARGET</span>
                                    <p className="text-xl font-bold">₱{goal.targetLabel}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm font-medium">
                                    <span className="text-muted-foreground">₱{goal.currentLabel} saved</span>
                                    <span className="text-emerald-600">{goal.progress.toFixed(0)}%</span>
                                </div>
                                <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-100">
                                    <div 
                                        className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
                                        style={{ width: `${goal.clampedProgress}%` }}
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                    <Calendar className="h-3 w-3" />
                                    Deadline: {goal.deadlineLabel}
                                </div>
                                
                                <div className="flex pt-4 mt-6 border-t gap-3">
                                    <button 
                                        onClick={() => openFundsModal(goal)}
                                        className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-50 transition-colors hover:bg-zinc-800"
                                    >
                                        Add Funds
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(goal.id)}
                                        className="flex-1 rounded-md border border-rose-200 bg-rose-50 text-rose-600 px-4 py-2 text-xs font-medium transition-colors hover:bg-rose-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Goal Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-sm rounded-xl bg-card p-6 border border-border text-card-foreground">
                        <h3 className="text-xl font-bold mb-4 text-foreground">Set Savings Goal</h3>
                        <form onSubmit={submitAddGoal} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-foreground">Goal Name</label>
                                <input 
                                    type="text" 
                                    className={`w-full rounded-md border ${addGoalForm.errors.name ? 'border-rose-500' : 'border-input'} bg-background p-2 text-foreground`} 
                                    placeholder="New Car, Vacation, Emergency Fund, etc."
                                    value={addGoalForm.data.name}
                                    onChange={e => addGoalForm.setData('name', e.target.value)}
                                    required
                                />
                                {addGoalForm.errors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{addGoalForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-foreground">Target Amount (₱)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className={`w-full rounded-md border ${addGoalForm.errors.target_amount ? 'border-rose-500' : 'border-input'} bg-background p-2 text-foreground`} 
                                    placeholder="0.00"
                                    value={addGoalForm.data.target_amount}
                                    onChange={e => addGoalForm.setData('target_amount', e.target.value)}
                                    required
                                />
                                {addGoalForm.errors.target_amount && <p className="text-xs text-rose-500 mt-1 font-medium">{addGoalForm.errors.target_amount}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-foreground">Deadline Date</label>
                                <input 
                                    type="date" 
                                    className={`w-full rounded-md border ${addGoalForm.errors.deadline ? 'border-rose-500' : 'border-input'} bg-background p-2 text-foreground`}
                                    value={addGoalForm.data.deadline}
                                    onChange={e => addGoalForm.setData('deadline', e.target.value)}
                                    required
                                />
                                {addGoalForm.errors.deadline && <p className="text-xs text-rose-500 mt-1 font-medium">{addGoalForm.errors.deadline}</p>}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors">Cancel</button>
                                <button type="submit" disabled={addGoalForm.processing} className="px-4 py-2 text-sm font-medium bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 rounded-md hover:opacity-90 transition-opacity">
                                    {addGoalForm.processing ? 'Creating...' : 'Create Goal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Funds Modal */}
            {selectedGoal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-sm rounded-xl bg-card p-6 border border-border text-card-foreground">
                        <h3 className="text-xl font-bold mb-4 text-foreground">Add funds to {selectedGoal.name}</h3>
                        <form onSubmit={submitAddFunds} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 uppercase tracking-tight text-xs text-muted-foreground">Amount to save (₱)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className={`w-full rounded-md border ${addFundsForm.errors.amount ? 'border-rose-500' : 'border-input'} bg-background p-3 text-lg font-bold text-foreground focus:ring-2 focus:ring-ring focus:outline-none`} 
                                    placeholder="0.00"
                                    value={addFundsForm.data.amount}
                                    onChange={e => addFundsForm.setData('amount', e.target.value)}
                                    required
                                    autoFocus
                                />
                                {addFundsForm.errors.amount && <p className="text-xs text-rose-500 mt-1 font-medium">{addFundsForm.errors.amount}</p>}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setSelectedGoal(null)} className="px-4 py-2 text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors">Cancel</button>
                                <button type="submit" disabled={addFundsForm.processing} className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
                                    {addFundsForm.processing ? 'Saving...' : 'Confirm Deposit'}
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
                title="Delete Savings Goal"
                description="Are you sure you want to delete this savings goal? This will remove all progress tracking for this item."
            />
        </AppLayout>
    );
}

// Route function for typescript
declare function route(name: string, params?: any): string;
