// components/DockNavigation.tsx
import { Plus, Bell, Search, User, House } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type DockNavigationProps = {
    activePath?: string;
};

export default function DockNavigation({ activePath = '/' }: DockNavigationProps) {
    const navItems = [
        { href: '/home', label: 'Accueil', icon: House },
        { href: '/search', label: 'Recherche', icon: Search },
        { href: '/create', label: 'Créer', icon: Plus },
        { href: '/notifications', label: 'Notifications', icon: Bell },
        { href: '/profil', label: 'Profil', icon: User },
    ];

    return (
        <nav className="bg-white fixed bottom-0 left-0 right-0 shadow-lg z-50 min-[750px]:invisible" aria-label="Navigation principale">
            <ul className="flex justify-around items-center py-2 px-2">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = activePath === href;
                    if (href === '/create') {
                        return (
                            <li key={href}>
                                <Link href={href} aria-label={label}>
                                    <button className="flex flex-col items-center p-2">
                                        <div className="py-1 px-3 bg-primary-100 rounded-tl-xl rounded-tr-none rounded-br-xl rounded-bl-none ">
                                            <Icon color="black" size={30} />
                                        </div>
                                    </button>
                                </Link>
                            </li>
                        );
                    }
                    return (
                        <li key={href}>
                            <Link href={href} aria-label={label}>
                                <button className={cn(
                                    "flex items-center gap-x-1.5 py-2 px-3 transition-all duration-300 rounded-full",
                                    isActive ? "bg-primary-300 text-primary-900 " : "bg-transparent"
                                )}>
                                    <Icon size={28} />
                                    {isActive && <span className=" text-sm font-medium">{label}</span>}
                                </button>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
