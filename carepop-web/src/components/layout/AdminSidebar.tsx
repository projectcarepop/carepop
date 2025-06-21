'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Hospital, Stethoscope, Users, CalendarCheck, LogOut, CircleUser, LayoutGrid, Briefcase, Warehouse } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth, useUser } from '@clerk/nextjs';

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/providers", label: "Providers", icon: Stethoscope },
    { href: "/admin/clinics", label: "Clinics", icon: Hospital },
    { href: "/admin/services", label: "Services", icon: Briefcase },
    { href: "/admin/service-categories", label: "Categories", icon: LayoutGrid },
    { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
];

const NavLink = ({ href, label, icon: Icon, isActive }: { href: string; label: string; icon: React.ElementType; isActive: boolean; }) => (
    <Link
        href={href}
        className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
            isActive && "bg-primary/10 text-primary"
        )}
    >
        <Icon className="mr-3 h-5 w-5" />
        <span>{label}</span>
    </Link>
);

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user } = useUser();
    const { signOut } = useAuth();

    if (!user) {
        return null; 
    }

    return (
        <aside className="hidden w-64 flex-col border-r bg-muted/40 sm:flex">
          <div className="flex-1 overflow-auto p-4">
              <nav className="flex flex-col items-stretch gap-1 font-medium">
                  {navItems.map(({ href, label, icon }) => (
                      <NavLink
                          key={href}
                          href={href}
                          label={label}
                          icon={icon}
                          isActive={pathname === href}
                      />
                  ))}
              </nav>
          </div>
          <div className="mt-auto p-4 border-t">
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center justify-start gap-3 w-full">
                          <CircleUser className="h-6 w-6" />
                          <div className="text-left">
                              <p className="text-sm font-medium">{user.emailAddresses[0]?.emailAddress}</p>
                          </div>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">
                                  My Account
                              </p>
                              <p className="text-xs leading-none text-muted-foreground">
                                  {user.emailAddresses[0]?.emailAddress}
                              </p>
                          </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => signOut()}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </aside>
    );
} 