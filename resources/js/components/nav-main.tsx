import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface NavMainProps {
    items?: NavItem[];
    groups?: NavGroup[];
}

export function NavMain({ items, groups }: NavMainProps) {
    const page = usePage();

    const navGroups: NavGroup[] = groups || (items ? [{ title: 'Platform', items }] : []);

    return (
        <div className="space-y-2 py-1">
            {navGroups.map((group) => (
                <SidebarGroup key={group.title} className="px-2 py-0">
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2 py-1">
                        {group.title}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) => {
                            const isActive = page.url === item.url || (item.url !== '/dashboard' && page.url.startsWith(item.url));
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={isActive}>
                                        <Link href={item.url} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </div>
    );
}
