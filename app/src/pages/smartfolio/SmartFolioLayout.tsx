import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/labs/smartfolio/Sidebar';

export function SmartFolioLayout() {
    return (
        <div className="flex h-full w-full overflow-hidden bg-[#0b0e11]">
            <Sidebar />
            <div className="flex-1 h-full overflow-y-auto bg-[#0b0e11]/50 relative w-full">
                <Outlet />
            </div>
        </div>
    );
}
