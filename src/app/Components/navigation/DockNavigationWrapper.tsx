"use client";

import { usePathname } from 'next/navigation';
import DockNavigation from './DockNavigation';

export default function DockNavigationWrapper() {
    const pathname = usePathname();
    return <DockNavigation activePath={pathname} />;
}
