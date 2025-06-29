"use client";

import * as React from "react";
import { X, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
    value: string;
    label: string;
};

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    className?: string;
    placeholder?: string;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
    ({ options, selected, onChange, className, placeholder = "Sélectionnez..." }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const containerRef = React.useRef<HTMLDivElement>(null);

        React.useEffect(() => {
            const handleOutsideClick = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleOutsideClick);
            return () => {
                document.removeEventListener("mousedown", handleOutsideClick);
            };
        }, []);

        const handleSelect = (value: string) => {
            if (selected.includes(value)) {
                onChange(selected.filter((item) => item !== value));
            } else {
                onChange([...selected, value]);
            }
        };

        const handleUnselect = (value: string) => {
            onChange(selected.filter((s) => s !== value));
        };

        return (
            <div className="relative w-full" ref={containerRef}>
                <div
                    ref={ref}
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsOpen(!isOpen)}
                    className={cn(
                        "flex h-auto min-h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1">
                        {selected.length > 0 ? (
                            selected.map((value) => {
                                const label = options.find((opt) => opt.value === value)?.label || value;
                                return (
                                    <div key={value} className="flex items-center gap-1 rounded-full bg-gray-200 px-2 py-1 text-xs">
                                        {label}
                                        <span
                                            role="button"
                                            aria-label={`Supprimer ${label}`}
                                            tabIndex={0}
                                            className="ml-1 cursor-pointer rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnselect(value);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.stopPropagation();
                                                    handleUnselect(value);
                                                }
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
                {isOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-white text-gray-800 shadow-lg outline-none animate-in fade-in-0 zoom-in-95">
                        <ul className="max-h-fit overflow-auto p-1">
                            {options.map((option) => (
                                <li
                                    key={option.value}
                                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100"
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {selected.includes(option.value) && (
                                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                            <Check className="h-4 w-4" />
                                        </span>
                                    )}
                                    {option.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
