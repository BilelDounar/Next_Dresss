import { type Meta, type StoryObj } from "@storybook/nextjs-vite";
import Button from "@/components/atom/button";
import { fn } from "storybook/test";

const meta = {
    title: "Components/Atom/Button",
    component: Button,
    args: {
        children: "Button",
        onClick: fn(),
    },
    argTypes: {
        variant: {
            control: "radio",
            options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
        },
        size: {
            control: "radio",
            options: ["default", "sm", "lg"],
        },
        // Masquer iconLeft et iconRight des contrôles Storybook
        iconLeft: { table: { disable: true } },
        iconRight: { table: { disable: true } },
    },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const Destructive = {
    args: {
        variant: "destructive",
    },
} satisfies Story;

export const Outline = {
    args: {
        variant: "outline",
    },
} satisfies Story;

export const Secondary = {
    args: {
        variant: "secondary",
    },
} satisfies Story;

export const Ghost = {
    args: {
        variant: "ghost",
    },
} satisfies Story;

export const Link = {
    args: {
        variant: "link",
    },
} satisfies Story;

export const Small = {
    args: {
        size: "sm",
    },
} satisfies Story;

export const Large = {
    args: {
        size: "lg",
    },
} satisfies Story;
