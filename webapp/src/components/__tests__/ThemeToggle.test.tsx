import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ThemeProvider } from '@/components/ThemeProvider'

// Mock the ThemeProvider context
jest.mock('@/components/ThemeProvider', () => {
    const originalModule = jest.requireActual('@/components/ThemeProvider');
    return {
        ...originalModule,
        useTheme: jest.fn(),
    };
});

import { useTheme } from '@/components/ThemeProvider';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        button: ({ children, whileHover, whileTap, ...props }: any) => <button {...props}>{children}</button>,
        div: ({ children, initial, animate, transition, ...props }: any) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('ThemeToggle', () => {
    it('renders correctly', () => {
        (useTheme as jest.Mock).mockReturnValue({ theme: 'light', setTheme: jest.fn() });
        render(<ThemeToggle />)
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('displays correct icon for light theme', () => {
        (useTheme as jest.Mock).mockReturnValue({ theme: 'light', setTheme: jest.fn() });
        render(<ThemeToggle />)
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
    })

    it('displays correct icon for dark theme', () => {
        (useTheme as jest.Mock).mockReturnValue({ theme: 'dark', setTheme: jest.fn() });
        render(<ThemeToggle />)
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
    })

    it('toggles theme on click', () => {
        const setThemeMock = jest.fn();
        (useTheme as jest.Mock).mockReturnValue({ theme: 'light', setTheme: setThemeMock });
        render(<ThemeToggle />)

        fireEvent.click(screen.getByRole('button'));
        expect(setThemeMock).toHaveBeenCalledWith('dark');
    })
})
