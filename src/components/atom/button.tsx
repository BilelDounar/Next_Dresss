import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ComponentProps, ReactNode, ReactMouseEvent } from "react";

const buttonVariants = cva(
    "w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background gap-2",
    {
        variants: {
            variant: {
                default: "bg-primary-700 text-white hover:bg-primary-500 hover:text-white",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline: "border border-input hover:bg-accent hover:text-accent-foreground",
                secondary: "border border-primary-900 text-primary-900 hover:bg-primary-100",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "underline-offset-4 hover:underline text-black",
            },
            size: {
                default: "h-10 py-2 ",
                sm: "h-9  rounded-md",
                lg: "h-11 rounded-md",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
    iconLeft?: ReactNode;
    iconRight?: ReactNode;
    children?: ReactNode;
    openLink?: string;
    onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}

const Button = ({
    className,
    variant,
    size,
    iconLeft,
    iconRight,
    children,
    openLink,
    onClick,
    ...props
}: ButtonProps) => {
    const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            onClick(event);
        }
        if (openLink) {
            window.location.href = openLink;
        }
    };

    return (
        <button
            className={cn(buttonVariants({ variant, size, className }))}
            onClick={handleClick}
            {...props}
        >
            {iconLeft && <span className="mr-1">{iconLeft}</span>}
            {children}
            {iconRight && <span className="ml-1">{iconRight}</span>}
        </button>
    );
};

export default Button;
export { buttonVariants };
