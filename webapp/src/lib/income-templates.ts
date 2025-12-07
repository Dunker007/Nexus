import {
    Zap, Target, BookOpen,
    CheckCircle, Circle, AlertCircle,
    Music, Video, ShoppingBag, Mic, Printer, TrendingUp
} from 'lucide-react';

export interface IncomeStreamTemplate {
    id: string;
    title: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    potential: string;
    startupCost: string;
    description: string;
    iconName: string; // Store string name, map to component in UI
    steps: { text: string; completed: false }[]; // Template always false
    defaultStatus: 'locked' | 'active' | 'completed';
    howItWorks?: string;
}

export const STREAM_TEMPLATES_DATA: IncomeStreamTemplate[] = [
    {
        id: 'youtube-music',
        title: 'AI Music Channel',
        category: 'Tier 1: Foundation',
        difficulty: 'Easy',
        potential: '$10-500/mo',
        startupCost: '$0',
        description: 'Create a 24/7 LoFi/Ambient radio or upload daily music videos using ToneLab.',
        iconName: 'Video',
        howItWorks: "You upload consistent videos. YouTube places ads on them. You get ~55% of the ad revenue once monetized.",
        steps: [
            { text: 'Create YouTube Brand Account', completed: false },
            { text: 'Generate 5 tracks in ToneLab', completed: false },
            { text: 'Create visuals in Neural Frames', completed: false },
            { text: 'Upload first video with SEO tags', completed: false },
            { text: 'Schedule 3 more videos', completed: false }
        ],
        defaultStatus: 'active'
    },
    {
        id: 'spotify-royalties',
        title: 'Streaming Royalties',
        category: 'Tier 1: Foundation',
        difficulty: 'Medium',
        potential: '$0.004/stream',
        startupCost: 'Free / $20yr',
        description: 'Distribute your best AI tracks to Spotify, Apple Music, and more.',
        iconName: 'Music',
        howItWorks: "Distributors send your music to Spotify/Apple. You earn per stream. 1M streams ≈ $3,000 - $5,000.",
        steps: [
            { text: 'Sign up for DistroKid or Amuse (Free)', completed: false },
            { text: 'Export High-Quality Audio from Suno', completed: false },
            { text: 'Create Album Art (DLX Art Studio)', completed: false },
            { text: 'Submit first single for distribution', completed: false },
            { text: 'Claim Spotify for Artists profile', completed: false }
        ],
        defaultStatus: 'locked'
    },
    {
        id: 'print-demand',
        title: 'Etsy Merch Store',
        category: 'Tier 2: Content',
        difficulty: 'Medium',
        potential: '$50-500/mo',
        startupCost: '$0.20/listing',
        description: 'Higher margin custom store using Etsy + Printful integration.',
        iconName: 'ShoppingBag',
        howItWorks: "You create the listing on Etsy. When a sale happens, Printful automatically prints and ships it. You keep the profit (Sales Price - Print Cost). You handle customer service.",
        steps: [
            { text: 'Create Etsy Seller Account', completed: false },
            { text: 'Connect Printful/Printify', completed: false },
            { text: 'Generate 10 niche designs (Midjourney/Dall-E)', completed: false },
            { text: 'Create product mockups', completed: false },
            { text: 'Publish 5 listings with SEO keywords', completed: false }
        ],
        defaultStatus: 'locked'
    },
    {
        id: 'pod-farm',
        title: 'Redbubble / TPOD',
        category: 'Tier 2: Content',
        difficulty: 'Easy',
        potential: '$20-200/mo',
        startupCost: '$0',
        description: 'Zero-overhead Print on Demand. Updates CafePress, Redbubble, TeePublic.',
        iconName: 'ShoppingBag',
        howItWorks: "Exactly! You upload the graphic once. When someone buys a shirt/mug, the platform prints it, ships it, and answers customer emails. You just get a royalty check (usually 15-20%). True passive income.",
        steps: [
            { text: 'Create Redbubble Account', completed: false },
            { text: 'Create TeePublic/CafePress Account', completed: false },
            { text: 'Generate 20 simple text/graphic designs', completed: false },
            { text: 'Bulk upload to all platforms', completed: false },
            { text: 'Add 15+ relevant tags per design', completed: false }
        ],
        defaultStatus: 'locked'
    },
    {
        id: '3d-print-farm',
        title: 'Closet 3D Farm',
        category: 'Tier 1: Hardware',
        difficulty: 'Medium',
        potential: '$50-500/mo',
        startupCost: '$25 (Filament)',
        description: 'Resurrect your old printer. Turn cheap plastic into high-value niche parts.',
        iconName: 'Printer',
        howItWorks: "You own the factory! 1kg of filament costs $20. You can print $200+ worth of small parts (knobs, brackets, toys) from that one roll. 10x ROI.",
        steps: [
            { text: 'Dust off printer & perform bed leveling', completed: false },
            { text: 'Buy fresh PLA+ (Matte finish looks premium)', completed: false },
            { text: 'Print a "Benchy" to verify calibration', completed: false },
            { text: 'Find commercial-use models (Printables/Thangs)', completed: false },
            { text: 'List "Custom Lithophanes" on FB Marketplace', completed: false }
        ],
        defaultStatus: 'active'
    },
    {
        id: 'voice-service',
        title: 'Voiceover Services',
        category: 'Tier 3: Services',
        difficulty: 'Medium',
        potential: '$20-100/gig',
        startupCost: '$5/mo',
        description: 'Offer AI narrations for audiobooks, intros, and ads using ElevenLabs.',
        iconName: 'Mic',
        howItWorks: "You list your voice. Client sends script. You generate audio. You get paid per project.",
        steps: [
            { text: 'Create Fiverr Seller Account', completed: false },
            { text: 'Set up ElevenLabs subscription', completed: false },
            { text: 'Generate 3 diverse voice samples', completed: false },
            { text: 'Create Gig banner and description', completed: false },
            { text: 'Respond to first inquiry', completed: false }
        ],
        defaultStatus: 'locked'
    },
    {
        id: 'laser-lab',
        title: 'Laser Engraving Lab',
        category: 'Tier 4: Future Hardware',
        difficulty: 'Hard',
        potential: '$50-100/unit',
        startupCost: '$500+',
        description: 'High-margin physical customization. Buy blanks ($7), sell custom engraved ($50).',
        iconName: 'Zap',
        howItWorks: "You buy a laser (Fiber/CO2). You buy cheap blanks (tumblers, slate, leather). You burn custom designs. The perceived value transforms a $5 item into a $50 gift.",
        steps: [
            { text: 'Research Fiber (Metal) vs CO2 (Wood/Acrylic)', completed: false },
            { text: 'Scout FB Marketplace for used xTool/OmTech', completed: false },
            { text: 'Design 5 vector templates in Illustrator/Inkscape', completed: false },
            { text: 'Source bulk blanks (Alibaba/JDS)', completed: false },
            { text: 'Setup ventilation & safety workspace', completed: false },
            { text: 'Launch "Custom Crypto Merch" store', completed: false }
        ],
        defaultStatus: 'locked'
    }
];
