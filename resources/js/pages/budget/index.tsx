import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Settings2, AlertCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Budget Planner', href: '/budget' },
];

interface BudgetCategory {
    id: number;
    name: string;
    icon?: string;
    color?: string;
    limit: number;
    used: number;
    remaining: number;
    percentage: number;
}

interface Props {
    budgetData: BudgetCategory[];
    currentMonth: string;
}

export default function BudgetPage({ budgetData, currentMonth }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
    const { data, setData, post, processing, reset } = useForm({
        category_id: '',
        amount_limit: '',
    });

    const budgetCards = useMemo(
        () =>
            budgetData.map((cat) => ({
                ...cat,
                limitText: cat.limit.toFixed(2),
                usedText: cat.used.toFixed(2),
                remainingText: Math.abs(cat.remaining).toFixed(2),
                percentText: cat.percentage.toFixed(0),
                clampedPercentage: Math.min(cat.percentage, 100),
            })),
        [budgetData],
    );

    const openEditModal = (cat: BudgetCategory) => {
        setSelectedCategory(cat);
        setData({
            category_id: cat.id.toString(),
            amount_limit: cat.limit.toString(),
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('budget.updateOrCreate'), {
            onSuccess: () => {
                setSelectedCategory(null);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Budget Planner" />

            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Budget Planner ({currentMonth})</h2>
                        <p className="text-muted-foreground">Manage and track your category limits</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {budgetCards.map((cat) => (
                        <div key={cat.id} className="group relative rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-start justify-between mb-4">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-lg">{cat.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            ₱{cat.usedText} of ₱{cat.limitText}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => openEditModal(cat)}
                                    className="p-2 border rounded-md hover:bg-muted transition-colors"
                                >
                                    <Settings2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                                    <div 
                                        className={`h-full transition-all duration-500 ${
                                            cat.percentage > 90 ? 'bg-rose-500' : cat.percentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`} 
                                            style={{ width: `${cat.clampedPercentage}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className={cat.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                                            ₱{cat.remainingText} {cat.remaining < 0 ? 'over' : 'left'}
                                    </span>
                                        <span className="text-muted-foreground">{cat.percentText}%</span>
                                </div>
                            </div>
                            
                            {cat.percentage > 100 && (
                                <div className="mt-4 flex items-center gap-2 text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-md">
                                    <AlertCircle className="h-3 w-3" />
                                    Budget limit exceeded
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Modal */}
            {selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-background p-6 shadow-xl border text-foreground">
                        <h3 className="text-xl font-bold mb-4 text-foreground">Set Budget for {selectedCategory.name}</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Monthly Limit</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="w-full rounded-md border border-zinc-200 bg-background p-2 text-foreground" 
                                    placeholder="0.00"
                                    value={data.amount_limit}
                                    onChange={e => setData('amount_limit', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedCategory(null)}
                                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50"
                                >
                                    Update Budget
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

// Route function for typescript
declare function route(name: string, params?: any): string;
