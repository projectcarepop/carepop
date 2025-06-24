'use client'

import { useAuth } from "@/lib/contexts/auth-context"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { signOutUser } from "@/app/auth/actions"
import { Skeleton } from "@/components/ui/skeleton"

export function UserNav() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (!user) {
    return null
  }

  const getInitials = (email: string) => {
    // The user object from useAuth might have a different structure
    const name = user.user_metadata?.full_name;
    if (name) {
        const parts = name.split(' ');
        if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : 'U'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url || ''} alt="User avatar" />
            <AvatarFallback>{getInitials(user.email || '')}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/main-dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/user-profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/appointments">My Appointments</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form action={signOutUser} className="w-full">
            <DropdownMenuItem asChild>
                <button type="submit" className="w-full flex items-center cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </button>
            </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 