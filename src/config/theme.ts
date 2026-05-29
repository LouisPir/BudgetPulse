export type ThemeName = 'default';

export interface Theme {
  name: ThemeName;
  colors: {
    primary: string;
    primaryLight: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    danger: string;
    border: string;
    accent: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  fontSize: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    title: number;
  };
}

const defaultTheme: Theme = {
  name: 'default',
  colors: {
    primary: '#6C63FF',
    primaryLight: '#EAE8FF',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#E5E7EB',
    accent: '#F3F4F6',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    full: 999,
  },
  fontSize: {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
    title: 32,
  },
};

export const themes: Record<ThemeName, Theme> = {
  default: defaultTheme,
};