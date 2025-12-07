export interface MusicAgent {
    id: string;
    name: string;
    role: string;
    style: string;
    description: string;
    generateLyrics: (topic: string, context: string) => string;
}

export const MUSIC_AGENTS: Record<string, MusicAgent> = {
    political: {
        id: 'political',
        name: 'Newsician',
        role: 'Political Commentator',
        description: 'Generates aggressive, lyrical, anti-establishment hip hop based on the selected news story.',
        style: 'Aggressive Political Hip Hop, Lyrical, Fast Flow, Anti-Establishment',
        generateLyrics: (topic: string, context: string) => `[Verse 1]
(Aggressive delivery)
Look at the headlines, look at what they say
"${topic}" is the game they play
They claim it's progress, but I see the lies
${context.slice(0, 50)}... open your eyes!

[Chorus]
We speak truth to power, we never back down
The real news report straight from the underground
No more corruption, no more deceit
Newsician on the mic, turning up the heat!

[Verse 2]
Facts over feelings, that's how we roll
They want control, but they can't have our soul
(Fast flow)
System broken, policies failing, people are wailing
Time to rise up, keep the truth prevailing.`
    },

    sentinel: {
        id: 'sentinel',
        name: 'Midwest Sentinel',
        role: 'Community Guardian',
        description: 'Generates soulful, storytelling boom-bap focused on faith, family, and resilience.',
        style: 'Midwest Boom Bap, Soulful, Storytelling, 90bpm, Smooth',
        generateLyrics: (topic: string, context: string) => `[Verse 1]
(Smooth, storytelling flow)
Woke up this morning, frost on the window pane
Heard the news about "${topic}", amidst the rain
But in the heartland, we know what is real
Faith in our neighbors, and the strength that we feel.

[Chorus]
Roots run deep in the soil below
Faith and family, that's the way we grow
Midwest Sentinel, watching over the land
Through every storm, together we stand.

[Verse 2]
${context.slice(0, 80)}...
Life moves fast, but we take it slow
Protecting our own, everywhere we go.`
    },

    pop: {
        id: 'pop',
        name: 'Neon Icon',
        role: 'Pop Star',
        description: 'Generates catchy, viral pop hits based on trends and entertainment news.',
        style: 'Modern Pop, Billboard Top 40, Electropop, Catchy Hook, Upbeat',
        generateLyrics: (topic: string, context: string) => `[Verse 1]
Did you see what's trending? It's all on the screen
"${topic}" is the wildest thing I've seen
Everybody's talking, lighting up the night
Capture the feeling, yeah it feels so right.

[Chorus]
(Explosive energy)
Ooh-whoa! It's a moment, it's a vibe
Living for the now, with my whole tribe
Can't stop, won't stop, dancing to the beat
This headline energy is bringing the heat!`
    }
};
