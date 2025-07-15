import { type Meta, type StoryObj } from "@storybook/nextjs-vite";
import Avatar from "@/components/atom/avatar";

const meta = {
    title: "Components/Atom/Avatar",
    component: Avatar,
    args: {
        size: "md",
        isFollowed: true,
        alt: "BD",
        onClick: () => {},
    },
    argTypes: {
        size: {
            control: "radio",
            options: ["sm", "md", "lg"],
        },
    },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
export const Small = { args: { isFollowed: true, size: "sm" } } satisfies Story;
export const Medium = { args: { isFollowed: true, size: "md" } } satisfies Story;
export const Large = { args: { isFollowed: true, size: "lg" } } satisfies Story;
export const PlaceholderText = { args: { isFollowed: false, size: "lg", alt: "BD" } } satisfies Story;