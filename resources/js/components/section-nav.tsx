import { Link, usePage } from '@inertiajs/react';
import { Landmark, PlusCircle, MinusCircle, List, PieChart, Wallet, Target, HandCoins, BarChart2, Settings } from 'lucide-react';

interface SectionNavProps {
    group: 'money' | 'planning' | 'analytics';
}

export function SectionNav({ group }: SectionNavProps) {
    const page = usePage();
    const currentUrl = page.url;

    const moneyItems = [
        { title: 'Banks', url: '/banks', icon: Landmark },
        { title: 'Income', url: '/income', icon: PlusCircle },
        { title: 'Expenses', url: '/expenses', icon: MinusCircle },
        { title: 'Transactions History', url: '/transactions', icon: List },
    ];

    const planningItems = [
        { title: 'Budget Planner', url: '/budget', icon: PieChart },
        { title: 'Allowance', url: '/allowance', icon: Wallet },
        { title: 'Savings Goals', url: '/savings-goals', icon: Target },
        { title: 'Loans & PayLater', url: '/loans', icon: HandCoins },
    ];

    const analyticsItems = [
        { title: 'Reports', url: '/reports', icon: BarChart2 },
        { title: 'Account Settings', url: '/settings/profile', icon: Settings },
    ];

    const items = group === 'money' ? moneyItems : group === 'planning' ? planningItems : analyticsItems;

    return (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 border-b border-border text-xs whitespace-nowrap w-full min-w-0 max-w-full scrollbar-none touch-pan-x">
            {items.map((item, index) => {
                const isActive = currentUrl === item.url || (item.url !== '/dashboard' && currentUrl.startsWith(item.url));
                const Icon = item.icon;

                return (
                    <Link
                        key={item.url}
                        href={item.url}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 font-semibold btn-interactive transition-all duration-200 ${
                            isActive
                                ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm scale-[1.02]'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:scale-[1.01]'
                        }`}
                    >
                        <Icon className={`h-3.5 w-3.5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                        <span>{item.title}</span>
                    </Link>
                );
            })}
        </div>
    );
}
