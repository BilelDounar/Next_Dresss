import { ReactElement } from "react";

interface ActionButtonProps {
    Icon: ReactElement;
    count?: number | string;
    onClick?: () => void;
}

export default function ActionButton({ Icon, count, onClick }: ActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col justify-center items-center focus:outline-none"
        >
            {Icon}
            {count !== undefined && (
                <span className="text-xl text-white font-semibold">{count}</span>
            )}
        </button>
    );
}
