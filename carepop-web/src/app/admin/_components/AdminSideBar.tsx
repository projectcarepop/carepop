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
  Package,
} from 'lucide-react';

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['admin'], // Only admins can see dashboard
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['admin'], // Only admins can manage users
  },
  {
    title: 'Clinics',
    href: '/admin/clinics',
    icon: Hospital,
    roles: ['admin'], // Only admins can manage clinics
  },
  {
    title: 'Doctors',
    href: '/admin/doctors',
    icon: Stethoscope,
    roles: ['admin'], // Only admins can manage doctors
  },
  {
    title: 'Services',
    href: '/admin/services',
    icon: Pill,
    roles: ['admin'], // Only admins can manage services
  },
  {
    title: 'Appointments',
    href: '/admin/appointments',
    icon: Calendar,
    roles: ['admin', 'manager'], // Both admins and managers can view appointments
  },
  {
    title: 'Booking Management',
    href: '/admin/booking-management',
    icon: Calendar,
    roles: ['admin'], // Only admins can access booking management
  },
  {
    title: 'Inventory',
    href: '/admin/inventory',
    icon: Package,
    roles: ['admin', 'manager'], // Both admins and managers can manage inventory
  },
];

interface AdminSidebarProps {
  userRole?: string;
}

export default function AdminSidebar({ userRole = 'admin' }: AdminSidebarProps) {
  const pathname = usePathname();

  // Filter nav items based on user role
  const filteredNavItems = sidebarNavItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <aside className="hidden h-full w-64 flex-col border-r bg-gray-100/40 p-4 dark:bg-gray-800/40 lg:flex">
      <nav className="flex flex-col space-y-2">
        {filteredNavItems.map((item) => (
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
