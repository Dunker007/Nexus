import { render, screen } from '@testing-library/react'
import MeetingRoom from '@/components/MeetingRoom'

jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock child components to isolate MeetingRoom logic
jest.mock('@/components/meeting/AvatarCircle', () => {
    return function MockAvatarCircle() { return <div data-testid="avatar-circle">Avatar Circle</div> }
});
jest.mock('@/components/meeting/TranscriptList', () => {
    return function MockTranscriptList() { return <div data-testid="transcript-list">Transcript List</div> }
});
jest.mock('@/components/meeting/ControlPanel', () => {
    return function MockControlPanel() { return <div data-testid="control-panel">Control Panel</div> }
});
jest.mock('@/components/MultimodalViewer', () => {
    return { MultimodalViewer: () => <div data-testid="multimodal-viewer">Multimodal Viewer</div> }
});

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
            result: {
                isActive: false,
                topic: null,
                round: 0,
                transcript: [],
                currentSpeaker: null,
                consensus: null,
                personas: {}
            }
        }),
    })
) as jest.Mock;

describe('MeetingRoom', () => {
    it('renders loading state initially', () => {
        render(<MeetingRoom />)
        expect(screen.getByText('Connecting to Staff Meeting...')).toBeInTheDocument()
    })
})
