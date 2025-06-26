'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ShieldCheck, LayoutDashboard, Stethoscope, Users, Building, Syringe, CalendarClock, Package, LogOut } from 'lucide-react';
import { signOut } from '@/app/sign-in/actions';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/appointments', label: 'Appointments', icon: CalendarClock },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
    { href: '/admin/clinics', label: 'Clinics', icon: Building },
    { href: '/admin/services', label: 'Services', icon: Syringe },
    { href: '/admin/inventory', label: 'Inventory', icon: Package },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 flex-shrink-0 border-r bg-muted/40 p-4 flex flex-col">
            <div>
                <div className="flex items-center gap-2 px-2 py-4">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>
                <nav className="mt-8 flex flex-col gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                {
                                    'bg-primary/10 text-primary': pathname === item.href,
                                }
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto">
                 <form action={signOut}>
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </form>
            </div>
        </aside>
    );
} 