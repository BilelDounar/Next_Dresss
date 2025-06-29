import { type Meta, type StoryObj } from "@storybook/nextjs-vite";
import { Input } from "@/components/atom/input";

const meta = {
    title: "Components/Atom/Input",
    component: Input,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: ['text', 'password', 'number', 'date', 'email'],
        },
        placeholder: { control: 'text' },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        type: 'text',
        placeholder: 'Text Input',
    },
};

export const Password: Story = {
    args: {
        type: 'password',
        placeholder: 'Password Input',
    },
};

export const Number: Story = {
    args: {
        type: 'number',
        placeholder: 'Number Input',
    },
};

export const Date: Story = {
    args: {
        type: 'date',
    },
};

export const Disabled: Story = {
    args: {
        type: 'text',
        placeholder: 'Disabled Input',
        disabled: true,
    },
};
