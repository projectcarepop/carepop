'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';

interface AdminContextType {
  session: Session | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children, session }: { children: ReactNode, session: Session | null }) {
  return (
    <AdminContext.Provider value={{ session }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
