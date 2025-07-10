'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Tag, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/inventory', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory/products', label: 'Products', icon: Package },
  { href: '/inventory/categories', label: 'Categories', icon: Tag },
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

export default function InventorySidebar() {
  const pathname = usePathname();

  // Debug logging to help identify the issue
  React.useEffect(() => {
    if (!Array.isArray(navItems)) {
      console.error('InventorySidebar: navItems is not an array:', navItems);
    }
  }, []);

  return (
    <aside className="hidden w-64 flex-col border-r bg-muted/40 p-4 sm:flex">
      <div className="flex-1 overflow-auto">
        <nav className="flex flex-col items-stretch gap-1 font-medium">
            {Array.isArray(navItems) ? navItems.map(({ href, label, icon }) => (
                <NavLink
                    key={href}
                    href={href}
                    label={label}
                    icon={icon}
                    isActive={pathname === href}
                />
            )) : (
                <div className="text-red-500 p-2 text-sm">
                    Navigation items failed to load
                </div>
            )}
        </nav>
      </div>
    </aside>
  );
} 