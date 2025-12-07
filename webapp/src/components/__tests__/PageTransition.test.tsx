import { render, screen } from '@testing-library/react'
import PageTransition from '@/components/PageTransition'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock usePathname
jest.mock('next/navigation', () => ({
    usePathname: () => '/test-path'
}));

describe('PageTransition', () => {
    it('renders children correctly', () => {
        render(
            <PageTransition>
                <div data-testid="child-content">Test Content</div>
            </PageTransition>
        )
        expect(screen.getByTestId('child-content')).toBeInTheDocument()
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
})
