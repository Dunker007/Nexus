import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/labs/smartfolio/Sidebar';
import { PortfolioProvider } from '@/contexts/labs/smartfolio/PortfolioContext';

export function SmartFolioLayout() {
    return (
        <PortfolioProvider>
            <div className="flex h-full w-full overflow-hidden bg-[var(--bg-void)]">
                <Sidebar />
                <div className="flex-1 h-full overflow-y-auto bg-[var(--bg-deep)]/50 relative w-full custom-scrollbar">
                    <Outlet />
                </div>
            </div>
        </PortfolioProvider>
    );
}
