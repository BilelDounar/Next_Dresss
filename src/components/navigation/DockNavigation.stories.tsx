import { type Meta, type StoryObj } from "@storybook/nextjs-vite";
import DockNavigation from "./DockNavigation";

const meta = {
    title: "Components/Navigation/DockNavigation",
    component: DockNavigation,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        activePath: {
            control: 'select',
            options: ['/home', '/search', '/notifications', '/profil'],
        },
    },
} satisfies Meta<typeof DockNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
    args: {
        activePath: '/create',
    },
} satisfies Story;

export const HomeActive = {
    args: {
        activePath: '/home',
    },
} satisfies Story;

export const SearchActive = {
    args: {
        activePath: '/search',
    },
} satisfies Story;

export const NotificationsActive = {
    args: {
        activePath: '/notifications',
    },
} satisfies Story;

export const ProfilActive = {
    args: {
        activePath: '/profil',
    },
} satisfies Story;
