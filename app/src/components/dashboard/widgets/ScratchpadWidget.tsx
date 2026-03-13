import { useState, useEffect } from 'react';

export function ScratchpadWidget() {
    const [scratchpadText, setScratchpadText] = useState('');

    useEffect(() => {
        const savedScratchpad = localStorage.getItem('dashboard-scratchpad');
        if (savedScratchpad) {
            setScratchpadText(savedScratchpad);
        }
    }, []);

    return (
        <div className="h-full flex flex-col pb-6 md:pb-0">
            <textarea
                value={scratchpadText}
                onChange={(e) => {
                    setScratchpadText(e.target.value);
                    localStorage.setItem('dashboard-scratchpad', e.target.value);
                }}
                placeholder="Quick notes, ideas, copy/paste staging..."
                className="flex-1 w-full bg-[#12121a] border border-white/5 rounded-xl p-3 text-sm text-white/80 resize-none outline-none focus:border-cyan-500/30 transition-colors placeholder:text-white/20 custom-scrollbar"
            />
        </div>
    );
}
