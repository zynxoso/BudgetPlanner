import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
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
    Settings 
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
    { title: 'Income', url: '/income', icon: PlusCircle },
    { title: 'Expenses', url: '/expenses', icon: MinusCircle },
    { title: 'Budget', url: '/budget', icon: PieChart },
    { title: 'Allowance', url: '/allowance', icon: Wallet },
    { title: 'Savings Goals', url: '/savings-goals', icon: Target },
    { title: 'Loans', url: '/loans', icon: HandCoins },
    { title: 'Transactions', url: '/transactions', icon: List },
    { title: 'Reports', url: '/reports', icon: BarChart2 },
    { title: 'Settings', url: '/settings/profile', icon: Settings },
];

const footerNavItems: NavItem[] = [];

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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
