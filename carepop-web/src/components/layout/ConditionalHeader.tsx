'use client';

import Header from "@/components/layout/Header";
import { usePathname } from "next/navigation";

export default function ConditionalHeader() {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');

    return (
        <>
            {!isAdminPage && <Header />}
        </>
    )
} 