'use client';

import { ReactNode } from "react";

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services Management</h1>
      </div>
      <p className="text-muted-foreground">
        Manage all clinic services and their categories.
      </p>
      {children}
    </div>
  );
} 