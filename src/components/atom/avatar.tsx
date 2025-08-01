import { Avatar as DefaultAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const avatarVariant = cva("block size-8 rounded-full overflow-hidden", {
    variants: {
        size: {
            sm: "size-11",
            md: "size-12",
            lg: "size-25",
        },
    },
    defaultVariants: {
        size: "md",
    },
});

type AvatarVariantProps = VariantProps<typeof avatarVariant>;
export type Size = AvatarVariantProps["size"];

type Props = {
    isFollowed?: boolean,
    clickable?: boolean,
    href?: string,
    onClick?: () => void,
} & AvatarVariantProps &
    Pick<ComponentProps<typeof AvatarImage>, "src" | "alt">;

export default function Avatar({ size, isFollowed, src, alt, onClick, clickable = false, href }: Props) {
    const router = useRouter();
    const handleClick = () => {
        if (clickable && href) {
            router.push(href);
        } else if (onClick) {
            onClick();
        }
    };

    return (
        <div className="relative flex justify-center items-center">
            <DefaultAvatar className={cn(avatarVariant({ size }))} onClick={handleClick}>
                <AvatarImage
                    className="aspect-square size-full object-cover"
                    src={src}
                    alt={alt}
                />
                <AvatarFallback className={cn(
                    "text-center flex justify-center content-center items-center h-full font-logo bg-primary-300 ",
                    size === "sm" && "text-xs",
                    size === "md" && "text-sm",
                    size === "lg" && "text-4xl"
                )}>{alt}</AvatarFallback>
            </DefaultAvatar>

            {!isFollowed && <span className={cn(
                "bg-primary-100 inline-block rounded-full",
                "absolute top-0 right-0",
                "border-primary-700 border",
                "flex justify-center items-center  ",
                size === "sm" && "size-3",
                size === "md" && "size-4",
                size === "lg" && "size-5",
            )} >
                <PlusIcon strokeWidth={3} className={cn(
                    size === "sm" && "size-2",
                    size === "md" && "size-3",
                    size === "lg" && "size-4",
                    "text-primary-700"
                )} />
            </span>}
        </div>
    );
}
