// components/DockNavigation.tsx
import { Plus, Bell, Search, User, House } from 'lucide-react';
import Link from 'next/link';

export default function DockNavigation() {
    return (
        <nav className=" bg-white h-1/12 fixed bottom-0 left-0 right-0 shadow-lg z-50 min-[750px]:max-w-[500px] min-[750px]:invisible" aria-label="Navigation principale">
            <ul className="flex justify-around items-center py-2">
                <li>
                    <Link href="/" aria-label="Accueil">
                        <button className="flex flex-col items-center">
                            <House color="black" size={28} />
                            {/* <span className="dock-label text-black text-xs">Home</span> */}
                        </button>
                    </Link>
                </li>
                <li>
                    <Link href="/recherche" aria-label="Recherche">
                        <button className="flex flex-col items-center">
                            <Search color="black" size={28} />
                            {/* <span className="dock-label text-black text-xs">Recherche</span> */}
                        </button>
                    </Link>
                </li>
                <li>
                    <Link href="/creer" aria-label="Créer">
                        <button className="flex flex-col items-center">
                            <div className="py-1 px-3 bg-stone-200 rounded-tl-xl rounded-tr-none rounded-br-xl rounded-bl-none ">
                                <Plus color="black" size={30} />
                            </div>
                        </button>
                    </Link>
                </li>
                <li>
                    <Link href="/notifications" aria-label="Notifications">
                        <button className="flex flex-col items-center">
                            <Bell color="black" size={28} />
                            {/* <span className="dock-label text-black text-xs">Notifications</span> */}
                        </button>
                    </Link>
                </li>
                <li>
                    <Link href="/profil" aria-label="Profil">
                        <button className="flex flex-col items-center">
                            <User color="black" size={28} />
                            {/* <span className="dock-label text-black text-xs">Profil</span> */}
                        </button>
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
