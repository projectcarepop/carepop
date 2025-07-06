'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Hospital,
  Stethoscope,
  Pill,
  Calendar,
  //Package,
} from 'lucide-react';

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Clinics',
    href: '/admin/clinics',
    icon: Hospital,
  },
  {
    title: 'Doctors',
    href: '/admin/doctors',
    icon: Stethoscope,
  },
  {
    title: 'Services',
    href: '/admin/services',
    icon: Pill,
  },
  {
    title: 'Appointments',
    href: '/admin/appointments',
    icon: Calendar,
  },
  {
    title: 'Booking Management',
    href: '/admin/booking-management',
    icon: Calendar,
  },
  //{
  //  title: 'Inventory',
  //  href: '/admin/inventory',
  //  icon: Package,
  //},
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 flex-col border-r bg-gray-100/40 p-4 dark:bg-gray-800/40 lg:flex">
      <nav className="flex flex-col space-y-2">
        {sidebarNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center rounded-lg px-3 py-2 text-slate-700 transition-colors hover:bg-primary/10 hover:text-primary dark:text-gray-50 dark:hover:bg-primary/20',
              pathname === item.href
                ? 'bg-primary/20 text-primary font-semibold'
                : 'hover:bg-primary/5'
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
