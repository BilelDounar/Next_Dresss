import { type Meta, type StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "@/components/atom/textarea";

const meta = {
    title: "Components/Atom/Textarea",
    component: Textarea,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        placeholder: { control: 'text' },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        placeholder: 'Type your message here.',
    },
};

export const Disabled: Story = {
    args: {
        placeholder: 'Disabled Textarea',
        disabled: true,
    },
};
