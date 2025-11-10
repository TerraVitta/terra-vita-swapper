// This file defines TypeScript types and interfaces used throughout the application.

export interface Theme {
    name: 'light' | 'dark';
    background: string;
    color: string;
}

export interface UserPreferences {
    prefersDarkMode: boolean;
    blurEnabled: boolean;
}

export interface Feature {
    title: string;
    description: string;
    icon: string;
}

export interface GlassCardProps {
    title: string;
    content: string;
    icon?: string;
}

export interface NavbarLink {
    label: string;
    url: string;
}