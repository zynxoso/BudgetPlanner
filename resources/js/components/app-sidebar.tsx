import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    LayoutGrid, 
    PlusCircle, 
    MinusCircle, 
    PieChart, 
    Wallet, 
    Target, 
    HandCoins,
    List, 
    BarChart2,
    Landmark, 
    Settings 
} from 'lucide-react';
import AppLogo from './app-logo';

const navGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        ],
    },
    {
        title: 'Money & Accounts',
        items: [
            { title: 'Banks', url: '/banks', icon: Landmark },
            { title: 'Income', url: '/income', icon: PlusCircle },
            { title: 'Expenses', url: '/expenses', icon: MinusCircle },
            { title: 'Transactions', url: '/transactions', icon: List },
        ],
    },
    {
        title: 'Planning & Goals',
        items: [
            { title: 'Budget', url: '/budget', icon: PieChart },
            { title: 'Allowance', url: '/allowance', icon: Wallet },
            { title: 'Savings Goals', url: '/savings-goals', icon: Target },
            { title: 'Loans', url: '/loans', icon: HandCoins },
        ],
    },
    {
        title: 'Analytics & System',
        items: [
            { title: 'Reports', url: '/reports', icon: BarChart2 },
            { title: 'Settings', url: '/settings/profile', icon: Settings },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
