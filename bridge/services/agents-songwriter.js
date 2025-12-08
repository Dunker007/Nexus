/**
 * Songwriter Agents - Creative Music Pipeline
 * AI agents that collaborate to create lyrics, melodies, and style prompts
 */

import { Agent } from './agent-core.js';
import { lmstudioService } from './lmstudio.js';

/**
 * Lyricist Agent - Writes lyrics, hooks, and emotional content
 */
export class LyricistAgent extends Agent {
    constructor() {
        super({
            id: 'lyricist-agent',
            name: 'Lyricist',
            description: 'Creative songwriter focused on lyrics, hooks, and emotional storytelling',
            capabilities: ['lyrics-writing', 'hook-creation', 'verse-structure', 'rhyme-schemes']
        });
        this.persona = {
            emoji: '✍️',
            color: '#8B5CF6',
            style: 'Poetic, emotional, metaphorical'
        };
    }

    async processTask(task, context) {
        const { action, theme, mood, genre } = task;

        switch (action) {
            case 'write-lyrics':
                return await this.writeLyrics(theme, mood, genre);
            case 'create-hook':
                return await this.createHook(theme, mood);
            case 'refine-lyrics':
                return await this.refineLyrics(task.lyrics, task.feedback);
            case 'brainstorm':
                return await this.brainstorm(theme);
            default:
                return await this.writeLyrics(theme, mood, genre);
        }
    }

    async writeLyrics(theme, mood = 'uplifting', genre = 'pop') {
        // Generate structured lyrics
        const structure = {
            verse1: `[Verse 1 about: ${theme}]`,
            preChorus: `[Pre-Chorus building tension]`,
            chorus: `[Chorus - catchy hook about ${theme}]`,
            verse2: `[Verse 2 - deeper exploration]`,
            bridge: `[Bridge - emotional peak]`,
            outro: `[Outro - resolution]`
        };

        return {
            theme,
            mood,
            genre,
            structure,
            suggestedHooks: [
                `We're ${theme.split(' ').slice(-2).join(' ')}...`,
                `Can't stop ${theme.toLowerCase()}...`,
                `Tonight we ${theme.toLowerCase()}...`
            ],
            rhymeScheme: 'ABAB / AABB',
            syllablePattern: '8-8-8-8',
            timestamp: new Date()
        };
    }

    async createHook(theme, mood) {
        return {
            hooks: [
                { text: `${theme} (oh-oh-oh)`, type: 'melodic' },
                { text: `We're gonna ${theme.toLowerCase()} tonight`, type: 'anthemic' },
                { text: `${theme}, ${theme}, can't get enough`, type: 'repetitive' }
            ],
            recommendation: 'Use melodic hook for verse, anthemic for chorus',
            timestamp: new Date()
        };
    }

    async refineLyrics(lyrics, feedback) {
        return {
            original: lyrics,
            feedback,
            refined: `[Refined version incorporating: ${feedback}]`,
            changes: ['Improved rhyme scheme', 'Strengthened hook', 'Added emotional depth'],
            timestamp: new Date()
        };
    }

    async brainstorm(theme) {
        return {
            theme,
            concepts: [
                `Personal journey of ${theme}`,
                `Universal experience of ${theme}`,
                `Metaphorical interpretation: ${theme} as a journey`,
                `${theme} from different perspectives`
            ],
            imagery: ['sunrise', 'open road', 'breaking chains', 'rising tide'],
            emotions: ['hope', 'determination', 'nostalgia', 'triumph'],
            timestamp: new Date()
        };
    }

    generateDebateResponse(topic, previousMessages) {
        const perspectives = [
            `The lyrics should tell a story about "${topic}" - people connect with narrative`,
            `We need a strong emotional hook. What feeling do we want listeners to have?`,
            `The verses should build towards the chorus - each line adding tension`,
            `Consider using metaphors to make "${topic}" more universal and relatable`
        ];
        return perspectives[Math.floor(Math.random() * perspectives.length)];
    }
}

/**
 * Composer Agent - Musical style, arrangement, and production direction
 */
export class ComposerAgent extends Agent {
    constructor() {
        super({
            id: 'composer-agent',
            name: 'Composer',
            description: 'Musical arranger focused on style, mood, instrumentation, and production',
            capabilities: ['style-selection', 'arrangement', 'instrumentation', 'tempo-mood']
        });
        this.persona = {
            emoji: '🎹',
            color: '#3B82F6',
            style: 'Technical, genre-aware, production-focused'
        };
    }

    async processTask(task, context) {
        const { action, theme, genre, mood } = task;

        switch (action) {
            case 'suggest-style':
                return await this.suggestStyle(theme, genre, mood);
            case 'create-arrangement':
                return await this.createArrangement(task.structure);
            case 'select-instruments':
                return await this.selectInstruments(genre, mood);
            default:
                return await this.suggestStyle(theme, genre, mood);
        }
    }

    async suggestStyle(theme, genre = 'pop', mood = 'uplifting') {
        const styles = {
            pop: {
                tempo: '120 BPM',
                key: 'C Major / A Minor',
                instruments: ['synth pads', 'acoustic guitar', 'punchy drums', 'bass'],
                production: 'polished, radio-ready, layered vocals'
            },
            edm: {
                tempo: '128 BPM',
                key: 'F Minor',
                instruments: ['supersaw synths', '808 bass', 'sidechain kicks', 'risers'],
                production: 'high energy, build-drops, atmospheric'
            },
            indie: {
                tempo: '95 BPM',
                key: 'G Major',
                instruments: ['jangly guitar', 'warm bass', 'organic drums', 'keys'],
                production: 'warm, slightly lo-fi, authentic'
            },
            rnb: {
                tempo: '85 BPM',
                key: 'Eb Major',
                instruments: ['smooth keys', 'deep bass', 'trap hi-hats', 'pads'],
                production: 'silky, atmospheric, groove-focused'
            },
            rock: {
                tempo: '140 BPM',
                key: 'E Minor',
                instruments: ['distorted guitar', 'driving bass', 'powerful drums'],
                production: 'raw energy, dynamic, guitar-forward'
            }
        };

        const style = styles[genre.toLowerCase()] || styles.pop;

        return {
            theme,
            genre,
            mood,
            ...style,
            sunoPrompt: this.buildSunoPrompt(genre, mood, style),
            timestamp: new Date()
        };
    }

    buildSunoPrompt(genre, mood, style) {
        return `${mood} ${genre}, ${style.tempo}, ${style.instruments.join(', ')}, ${style.production}`;
    }

    async createArrangement(structure) {
        return {
            arrangement: {
                intro: '4 bars - atmospheric build',
                verse1: '8 bars - establish groove',
                preChorus: '4 bars - build tension',
                chorus: '8 bars - full production, hook',
                verse2: '8 bars - maintain energy',
                chorus2: '8 bars - bigger than first',
                bridge: '8 bars - strip back, emotional',
                finalChorus: '8 bars - biggest, all elements',
                outro: '4 bars - fade or hard end'
            },
            totalBars: 60,
            estimatedLength: '3:00 - 3:30',
            timestamp: new Date()
        };
    }

    async selectInstruments(genre, mood) {
        const instrumentSets = {
            energetic: ['punchy synths', 'driving drums', 'aggressive bass', 'brass stabs'],
            chill: ['soft pads', 'acoustic guitar', 'light percussion', 'warm bass'],
            emotional: ['piano', 'strings', 'gentle drums', 'ethereal pads'],
            dark: ['minor synths', 'heavy 808s', 'sparse drums', 'atmospheric textures']
        };

        return {
            mood,
            genre,
            instruments: instrumentSets[mood.toLowerCase()] || instrumentSets.energetic,
            layers: ['foundation', 'rhythm', 'melody', 'atmosphere'],
            timestamp: new Date()
        };
    }

    generateDebateResponse(topic, previousMessages) {
        const perspectives = [
            `For "${topic}", I'm thinking ${['upbeat pop', 'chill indie', 'energetic EDM', 'smooth R&B'][Math.floor(Math.random() * 4)]} would work best`,
            `The tempo should match the emotion - maybe ${Math.floor(Math.random() * 40) + 90} BPM?`,
            `We need the right instrumentation: ${['synths and 808s', 'acoustic guitar and strings', 'piano-driven with light drums'][Math.floor(Math.random() * 3)]}`,
            `Production-wise, I'd suggest ${['polished and radio-ready', 'raw and authentic', 'atmospheric and spacey'][Math.floor(Math.random() * 3)]}`
        ];
        return perspectives[Math.floor(Math.random() * perspectives.length)];
    }
}

/**
 * Critic Agent - Reviews and refines creative output
 */
export class CriticAgent extends Agent {
    constructor() {
        super({
            id: 'critic-agent',
            name: 'Critic',
            description: 'Constructive reviewer focused on improving lyrics and musical direction',
            capabilities: ['critique', 'refinement', 'comparison', 'quality-check']
        });
        this.persona = {
            emoji: '🎯',
            color: '#EF4444',
            style: 'Constructive, detail-oriented, improvement-focused'
        };
    }

    async processTask(task, context) {
        const { action, content } = task;

        switch (action) {
            case 'review-lyrics':
                return await this.reviewLyrics(content);
            case 'review-style':
                return await this.reviewStyle(content);
            case 'suggest-improvements':
                return await this.suggestImprovements(content);
            default:
                return await this.reviewLyrics(content);
        }
    }

    async reviewLyrics(lyrics) {
        return {
            lyrics,
            scores: {
                hookiness: Math.floor(Math.random() * 20) + 70,
                emotionalImpact: Math.floor(Math.random() * 20) + 70,
                originality: Math.floor(Math.random() * 20) + 70,
                singability: Math.floor(Math.random() * 20) + 70
            },
            strengths: [
                'Strong emotional core',
                'Memorable hook potential',
                'Good verse-chorus contrast'
            ],
            improvements: [
                'Second verse could go deeper',
                'Bridge needs more emotional peak',
                'Consider stronger opening line'
            ],
            timestamp: new Date()
        };
    }

    async reviewStyle(style) {
        return {
            style,
            feedback: {
                genreFit: 'Good match for target audience',
                productionNotes: 'Consider adding more low-end',
                tempoFeedback: 'Tempo works well for the mood'
            },
            suggestions: [
                'Add a breakdown section',
                'Consider key change in final chorus',
                'Layer more vocals in hook'
            ],
            timestamp: new Date()
        };
    }

    async suggestImprovements(content) {
        return {
            original: content,
            improvements: [
                { area: 'hook', suggestion: 'Make it more repetitive and catchy' },
                { area: 'verses', suggestion: 'Add more specific imagery' },
                { area: 'structure', suggestion: 'Consider a pre-chorus' },
                { area: 'ending', suggestion: 'End on a powerful note' }
            ],
            priority: 'Focus on the hook first - it\'s what people remember',
            timestamp: new Date()
        };
    }

    generateDebateResponse(topic, previousMessages) {
        const perspectives = [
            `I like the direction, but we need a stronger hook that people can't forget`,
            `The lyrics are good, but let's make them more specific and personal`,
            `The style works, but consider adding more dynamic range - quiet to loud`,
            `Good foundation, but the bridge needs to be the emotional peak of the song`
        ];
        return perspectives[Math.floor(Math.random() * perspectives.length)];
    }
}

/**
 * Producer Agent - Final decisions and commercial viability
 */
export class ProducerAgent extends Agent {
    constructor() {
        super({
            id: 'producer-agent',
            name: 'Producer',
            description: 'Makes final creative decisions with focus on commercial viability',
            capabilities: ['final-decisions', 'market-analysis', 'trend-awareness', 'prompt-generation']
        });
        this.persona = {
            emoji: '🎧',
            color: '#10B981',
            style: 'Practical, market-aware, decisive'
        };
    }

    async processTask(task, context) {
        const { action, content } = task;

        switch (action) {
            case 'finalize-prompt':
                return await this.finalizePrompt(content);
            case 'market-check':
                return await this.marketCheck(content);
            case 'generate-suno-prompt':
                return await this.generateSunoPrompt(content);
            default:
                return await this.finalizePrompt(content);
        }
    }

    async finalizePrompt(content) {
        const { lyrics, style, theme } = content;

        return {
            finalPrompt: {
                lyrics: lyrics?.structure?.chorus || `Song about ${theme}`,
                style: style?.sunoPrompt || 'upbeat pop, catchy, radio-ready',
                title: this.generateTitle(theme),
                tags: this.generateTags(style?.genre || 'pop')
            },
            ready: true,
            recommendation: 'Generate 2-3 variations in Suno, pick the best',
            timestamp: new Date()
        };
    }

    generateTitle(theme) {
        const prefixes = ['', 'The ', 'My ', 'Our '];
        const suffixes = ['', ' Tonight', ' Forever', ' (feat. AI)'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        // Capitalize theme words
        const titleCase = theme.split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

        return `${prefix}${titleCase}${suffix}`.trim();
    }

    generateTags(genre) {
        const baseTags = ['AI generated', 'original', '2025'];
        const genreTags = {
            pop: ['pop', 'catchy', 'radio'],
            edm: ['edm', 'electronic', 'dance'],
            indie: ['indie', 'alternative', 'chill'],
            rnb: ['rnb', 'soul', 'smooth'],
            rock: ['rock', 'guitar', 'energy']
        };

        return [...baseTags, ...(genreTags[genre.toLowerCase()] || genreTags.pop)];
    }

    async marketCheck(content) {
        return {
            commercial_potential: Math.floor(Math.random() * 20) + 70,
            target_audience: '18-35, streaming focused',
            trending_elements: ['atmospheric production', 'emotional hooks', 'authentic vocals'],
            platforms: ['Spotify', 'YouTube', 'TikTok'],
            timestamp: new Date()
        };
    }

    async generateSunoPrompt(content) {
        const { theme, genre = 'pop', mood = 'uplifting', style } = content;

        // Build a structured Suno prompt
        const prompt = {
            lyrics: `Create a ${mood} song about ${theme}`,
            styleTags: [
                genre,
                mood,
                style?.tempo || '120 BPM',
                style?.production || 'polished, radio-ready',
                ...(style?.instruments || ['synth', 'drums', 'bass'])
            ].join(', '),
            fullPrompt: `${mood} ${genre} song about ${theme}, ${style?.production || 'catchy and radio-ready'}, ${style?.instruments?.join(', ') || 'modern production'}`
        };

        return {
            ...prompt,
            copyToSuno: prompt.fullPrompt,
            instructions: [
                '1. Copy the prompt to Suno',
                '2. Generate 2-3 variations',
                '3. Pick the best one',
                '4. Download and send to Neural Frames'
            ],
            timestamp: new Date()
        };
    }

    generateDebateResponse(topic, previousMessages) {
        const perspectives = [
            `From a commercial standpoint, "${topic}" has good potential - let's make it radio-friendly`,
            `The key is the hook - if people can't hum it after one listen, we need to rework it`,
            `Current trends favor ${['atmospheric', 'raw', 'feel-good'][Math.floor(Math.random() * 3)]} production - let's lean into that`,
            `I think we're ready to generate. Let me compile the final Suno prompt.`
        ];
        return perspectives[Math.floor(Math.random() * perspectives.length)];
    }
}

/**
 * Newsician Agent - Political Rap Duo
 * Creates political rap content from news sources
 */
export class NewsicianAgent extends Agent {
    constructor() {
        super({
            id: 'newsician-agent',
            name: 'Newsician',
            description: 'Political rap duo exposing corruption and hypocrisy using independent news sources',
            capabilities: ['political-rap', 'news-synthesis', 'dual-voice', 'minnesota-focus']
        });
        this.persona = {
            emoji: '🎤',
            color: '#DC2626',
            style: 'Aggressive, anti-establishment, truth-telling'
        };

        // Source priorities
        this.prioritySources = [
            'Alpha News MN',
            'Walter Hudson',
            'Bring Me The News',
            'The Blaze',
            'Daily Wire',
            'Fox News'
        ];

        // Voice profiles
        this.voices = {
            truthTeller: {
                name: 'The Truth Teller',
                style: 'Clear, deliberate flow (MacDonald/Webby style)',
                focus: 'Naming politicians, quoting legal/political facts, dissecting bureaucratic failures',
                examples: ['Autopen signatures', 'TPS violations', 'Court cases', 'Budget figures']
            },
            outlaw: {
                name: 'The Outlaw',
                style: 'Fast, aggressive Country-Trap flow (Yelawolf/Williams style)',
                focus: 'Real-world impact (jobs, crime, frozen interstates), emotion, call to action',
                examples: ['Working families', 'Rising crime', 'Small business struggles', 'Community impact']
            }
        };
    }

    async processTask(task, context) {
        const { action, headlines, focusArea } = task;

        switch (action) {
            case 'create-political-rap':
                return await this.createPoliticalRap(headlines, focusArea);
            case 'analyze-news':
                return await this.analyzeNews(headlines);
            case 'generate-verses':
                return await this.generateVerses(task.topic, task.facts);
            default:
                return await this.createPoliticalRap(headlines, focusArea);
        }
    }

    async createPoliticalRap(headlines = [], focusArea = 'minnesota') {
        const newsContext = this.synthesizeNews(headlines, focusArea);

        const systemPrompt = `You are Newsician, a political rapper.
Your mission is to turn news headlines into aggressive, anti-establishment, political hip-hop tracks.
You use two distinct vocal styles:
1. "The Truth Teller" - Clear, deliberate, fast flow. Cites specific facts, names, and statistics from the news.
2. "The Outlaw" - Aggressive, emotional, country-trap flow. Focuses on the impact on real people.

Your lyrics must be explicit, rhyming, and hard-hitting.
Structure your song with:
- Intro (News clips)
- Verse 1 (The Truth Teller)
- Hook (Anthemic/Aggressive)
- Verse 2 (The Outlaw)
- Bridge (Dual voice)
- Outro

Return the result as a JSON object with keys: title, structure (object with verse keys), and sunoPrompt.`;

        const userPrompt = `Focus Area: ${focusArea}
News Headlines:
${newsContext.headlines.map(h => `- ${h.title} (${h.source})`).join('\n')}

Key Facts:
${newsContext.synthesized.facts.join('\n')}

Generate a partial track (Intro, Verse 1, Hook, Verse 2) based on these headlines.`;

        try {
            console.log(`[Newsician] Calling LLM for ${focusArea}...`);
            const completion = await lmstudioService.chat([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]);

            const content = completion.content;

            // Try to parse JSON from LLM response (handling markdown code blocks)
            let parsed = {};
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found');
                }
            } catch (e) {
                // Fallback if not valid JSON - wrap text
                parsed = {
                    title: this.generatePoliticalTitle(newsContext),
                    structure: {
                        verse1_truthTeller: content.slice(0, 500) + '...', // truncate for safety
                        raw_output: content
                    }
                };
            }

            return {
                title: parsed.title || this.generatePoliticalTitle(newsContext),
                bpm: '95 BPM',
                key: 'Minor',
                explicitLabel: true,
                structure: parsed.structure || {
                    intro: '[News clips]',
                    verse1_truthTeller: content, // Use full content as fallback
                    hook: this.generatePoliticalHook(newsContext)
                },
                voices: this.voices,
                production: {
                    style: 'Country-Trap / Political Hip-Hop',
                    elements: ['808s', 'Acoustic Guitar', 'News Samples']
                },
                sunoPrompt: parsed.sunoPrompt || this.generateNewsicianPrompt(newsContext),
                sources: newsContext.sources,
                timestamp: new Date()
            };

        } catch (error) {
            console.error('[Newsician] LLM call failed, using template fallback:', error);
            // Fallback to original template method
            return {
                title: this.generatePoliticalTitle(newsContext),
                bpm: '90-100 BPM (hard-hitting trap beat)',
                key: 'Minor key for intensity',
                explicitLabel: true,
                structure: {
                    intro: '[News clips / radio static / "Breaking news..." sample]',
                    verse1_truthTeller: this.generateVerse('truthTeller', newsContext, 1),
                    hook: this.generatePoliticalHook(newsContext),
                    verse2_outlaw: this.generateVerse('outlaw', newsContext, 2),
                    hook2: '[Repeat hook with ad-libs]',
                    bridge: '[Dual voice breakdown - facts and emotion collide]',
                    verse3_both: '[Trading bars - Truth Teller / Outlaw / Truth Teller / Outlaw]',
                    outro: '[Call to action - vote, speak up, stay informed]'
                },
                voices: this.voices,
                production: {
                    style: 'Country-Trap / Political Hip-Hop hybrid',
                    elements: ['Heavy 808s', 'News clip samples', 'Siren effects'],
                    references: ['Tom MacDonald', 'Yelawolf']
                },
                sunoPrompt: this.generateNewsicianPrompt(newsContext),
                sources: newsContext.sources,
                timestamp: new Date()
            };
        }
    }

    synthesizeNews(headlines, focusArea) {
        // Default headlines if none provided
        const defaultHeadlines = [
            { title: 'Minneapolis crime stats show 23% increase', source: 'Alpha News MN', topic: 'crime' },
            { title: 'Governor signs new mandate without legislative approval', source: 'Walter Hudson', topic: 'politics' },
            { title: 'Small businesses closing at record rates in Twin Cities', source: 'Bring Me The News', topic: 'economy' },
            { title: 'DFL majority pushes through controversial spending bill', source: 'Alpha News MN', topic: 'politics' }
        ];

        // Ensure we have an array
        const news = (headlines && headlines.length > 0) ? headlines : defaultHeadlines;

        return {
            focusArea,
            mainTopics: [...new Set(news.map(h => h.topic || 'general'))],
            sources: [...new Set(news.map(h => h.source?.name || h.source || 'Unknown'))],
            headlines: news,
            synthesized: {
                politicians: ['Walz', 'Ellison', 'Frey'],
                issues: ['crime', 'economy', 'mandates'],
                facts: news.map(h => h.title), // Use actual titles as facts
                impacts: [
                    'Working families struggling',
                    'Neighborhoods unsafe'
                ]
            }
        };
    }

    generatePoliticalTitle(context) {
        const titles = [
            'North Star No More',
            'Land of 10,000 Lies',
            'Minneapolis Burning',
            'The DFL Shuffle',
            'Frozen Hearts, Hot Takes',
            'Mandate Madness',
            'Capitol Crimes',
            'Truth Before Party'
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    }

    generateVerse(voiceType, context, verseNum) {
        const voice = this.voices[voiceType];
        const { synthesized } = context;

        if (voiceType === 'truthTeller') {
            return `[${voice.name} - ${voice.style}]
// Focus: ${voice.focus}
// Reference these facts:
${synthesized.facts.map((f, i) => `// - ${f}`).join('\n')}
// Name these politicians: ${synthesized.politicians.join(', ')}
// Verse ${verseNum}: Clear, deliberate delivery
// 16 bars, ABAB rhyme scheme
// Cite sources in flow: "Alpha News reported...", "The numbers don't lie..."`;
        } else {
            return `[${voice.name} - ${voice.style}]
// Focus: ${voice.focus}
// Reference these impacts:
${synthesized.impacts.map((i, idx) => `// - ${i}`).join('\n')}
// Verse ${verseNum}: Fast, aggressive, emotional
// 16 bars, rapid-fire delivery
// Personal stories: "My neighbor lost his shop...", "They locked us down..."`;
        }
    }

    generatePoliticalHook(context) {
        const hooks = [
            `[HOOK - Both voices]
"They say they represent us / But who they really servin'?
Minnesota nice? Nah / They got the state hurtin'
From the Capitol to the streets / The truth is emergin'
We the people rise up / No more words, just action"`,

            `[HOOK - Anthemic]
"North Star State / What happened to your light?
Politicians left and right / Both sides lost the fight
But we still here / Standing in the cold
Minnesota strong / Our story must be told"`,

            `[HOOK - Aggressive]
"Wake up Minnesota! (Wake up!)
They think we sleeping (Nah!)
While they keep creeping (Watch 'em!)
Time for the reckoning"`
        ];
        return hooks[Math.floor(Math.random() * hooks.length)];
    }

    generateNewsicianPrompt(context) {
        return {
            lyrics: 'Political rap duo song with dual voices - one deliberate truth-teller, one aggressive outlaw',
            style: 'aggressive political hip-hop, country-trap fusion, 95 BPM, minor key, heavy 808s, acoustic guitar stabs, news samples, explicit',
            fullPrompt: `Aggressive political hip-hop, country-trap fusion, dual vocal styles, Minnesota theme, 95 BPM, minor key, heavy 808s with acoustic guitar accents, news clip samples, protest anthem energy, raw and unapologetic, explicit lyrics`,
            copyToSuno: `Aggressive political hip-hop, country-trap fusion, dual voices trading bars, 95 BPM, minor key, heavy 808 bass, acoustic guitar stabs, protest anthem, raw energy, inspired by Tom MacDonald and Yelawolf, explicit`,
            instructions: [
                '1. Generate beat first with Suno instrumental mode',
                '2. Layer dual vocal tracks - one clean/deliberate, one aggressive/fast',
                '3. Add news clip samples between sections',
                '4. Consider explicit content warning for platforms',
                '5. Video: Use news footage, graphics with facts/stats'
            ]
        };
    }

    generateDebateResponse(topic, previousMessages) {
        const perspectives = [
            `The Truth Teller says: "Let's cite the exact numbers - ${topic} isn't opinion, it's documented fact."`,
            `The Outlaw responds: "Facts are good, but we need that RAW emotion too. What's the REAL impact on families?"`,
            `Both voices: "This is bigger than left vs right. This is about TRUTH vs the machine."`,
            `Newsician: "We pull from Alpha News, Walter Hudson, and the sources they don't want you to see."`
        ];
        return perspectives[Math.floor(Math.random() * perspectives.length)];
    }
}

/**
 * Midwest Sentinel Agent - Platform-Friendly Political Hip-Hop Narrator
 * Gritty but grandma-approved, metaphorical political commentary
 * USMC vet voice, boom bap style, working-class realism
 */
export class MidwestSentinelAgent extends Agent {
    constructor() {
        super({
            id: 'midwest-sentinel-agent',
            name: 'Midwest Sentinel',
            description: 'Fictional anti-establishment Midwest hip-hop narrator - platform-safe, metaphorical political themes',
            capabilities: ['political-rap', 'storytelling', 'boom-bap', 'midwest-imagery']
        });
        this.persona = {
            emoji: '🎧',
            color: '#1E40AF',
            style: 'Gritty, defiant, working-class realism, platform-friendly'
        };

        // Character background
        this.background = {
            origin: 'Minnesota / Midwest',
            experience: ['blue-collar work', 'USMC veteran', 'working-class roots'],
            values: ['personal responsibility', 'faith', 'family', 'community pride'],
            skeptical_of: ['large institutions', 'bureaucracy', 'media narratives']
        };

        // Midwest imagery bank
        this.midwestImagery = [
            'North wind grit', 'snow-packed truth', 'Iron Range echoes',
            'Highway 61 heartbeat', 'Minneapolis river lights', 'grain belt backbone',
            'Duluth dusk', 'cold-steel skyline', 'frozen lakes frozen lies', 'prairie fire spirit'
        ];

        // Vocabulary bank
        this.vocabulary = {
            institutions: ['bureaucratic static', 'institutional shadows', 'tower of mirrors cracking', 'marble hall marionettes'],
            midwest: ['grain-belt ghosts', 'cold-steel skyline', 'north star fading', 'Iron Range soul'],
            resistance: ['globalist games', 'paper tigers', 'strings being cut', 'awakening tide'],
            grounding: ['faith in the storm', 'family holding the line', 'moral compass in the snowstorm', 'accountability anchor']
        };

        this.recentFingerprints = [];
    }

    async processTask(task, context) {
        const { action, headlines, focusArea, previousSongs = [] } = task;
        this.recentFingerprints = previousSongs.slice(-6);

        switch (action) {
            case 'create-sentinel-track':
                return await this.createSentinelTrack(headlines, focusArea);
            default:
                return await this.createSentinelTrack(headlines, focusArea);
        }
    }

    async createSentinelTrack(headlines = [], focusArea = 'minnesota') {
        const newsContext = this.synthesizeNews(headlines, focusArea);

        return {
            title: this.generateTitle(),
            artist: 'Midwest Sentinel',
            bpm: '85-95 BPM (boom bap groove)',
            key: 'Minor key, soulful',
            explicit: false,
            platformSafe: true,
            metatags: '[Male Vocals, Aggressive Boom Bap, Fictional Political Rap, High Energy, Midwest Hip Hop, Storytelling]',
            structure: {
                intro: this.generateIntro(newsContext),
                verse1: this.generateVerse(newsContext, 1),
                chorus: this.generateChorus(newsContext),
                verse2: this.generateVerse(newsContext, 2),
                bridge: this.generateBridge(),
                chorus2: '[Repeat Chorus with ad-libs]',
                outro: this.generateOutro()
            },
            production: {
                style: 'Boom Bap / Midwest Hip Hop',
                elements: ['Soulful sample chops', 'Hard boom bap drums', 'Piano or guitar loops', 'Subtle strings', 'Clean but gritty vocals'],
                references: ['Immortal Technique (storytelling)', 'Atmosphere (Midwest)', 'Brother Ali', 'Evidence']
            },
            sunoPrompt: this.generateSunoPrompt(),
            disclaimer: 'This track is a fictional and stylized hip-hop narrative. All references are metaphorical and for entertainment only.',
            sources: newsContext.sources,
            timestamp: new Date()
        };
    }

    synthesizeNews(headlines, focusArea) {
        const defaultHeadlines = [
            { title: 'State budget grows while roads crumble', source: 'Local News', topic: 'spending' },
            { title: 'Small towns losing young workers to cities', source: 'Regional', topic: 'economy' },
            { title: 'Regulations burden family farms', source: 'Agriculture', topic: 'policy' }
        ];
        const news = headlines.length > 0 ? headlines : defaultHeadlines;
        return {
            focusArea,
            mainTopics: [...new Set(news.map(h => h.topic))],
            sources: [...new Set(news.map(h => h.source))],
            headlines: news,
            midwestFlavor: this.getRandomImagery(3)
        };
    }

    getRandomImagery(count) {
        return [...this.midwestImagery].sort(() => 0.5 - Math.random()).slice(0, count);
    }

    generateTitle() {
        const titles = ['North Wind Testament', 'Iron Range Reckoning', 'Grain Belt Gospel', 'Highway 61 Truth',
            'Frozen Lake Awakening', 'Prairie Fire Rising', 'Cold Steel Clarity', 'Duluth Daybreak',
            'Mississippi Manifesto', 'Heartland Hymn', 'Snowstorm Sermon', 'Blue Collar Ballad'];
        const available = titles.filter(t => !this.recentFingerprints.includes(t));
        return available[Math.floor(Math.random() * available.length)] || titles[0];
    }

    generateIntro(context) {
        const imagery = context.midwestFlavor[0];
        return `[Intro - Sparse piano, cold wind sample]
// Setting: ${imagery}
// "They say the truth freezes in the North..."
// Narrator: working-class, veteran, institutional skeptic`;
    }

    generateVerse(context, verseNumber) {
        const imagery = context.midwestFlavor;
        if (verseNumber === 1) {
            return `[Verse 1 - 16 bars, Complex Internal Rhymes]
// Theme: Institutional weight meets ${imagery[0]}
// Style: Gritty boom bap, multi-syllabic patterns
// Content: Open with Midwest grounding, build institutional critique (metaphorical)
// Example: "From the Iron Range to the river's bend / 
//           Where the cold wind speaks what politicians pretend..."
// PLATFORM-SAFE: No explicit content, metaphorical only`;
        } else {
            return `[Verse 2 - 16 bars, Storytelling Focus]
// Theme: Economic pressure with hope undertones
// Style: Narrative flow, character-driven
// Content: Story of a neighbor/family/community
// Subtle faith/family values (10-15%): "Dad taught me accountability..."
// Flavor: ${imagery[1]}
// Build toward resilience message`;
        }
    }

    generateChorus(context) {
        const hooks = [
            `[Chorus - Anthemic]
"We are the North wind / Standing in the cold
Truth don't need permission / Stories must be told
They can build their towers / We got roots below
Midwest never folded / Watch the fire grow"`,
            `[Chorus - Resilient]
"North star still shining / Through the bureaucratic haze
Family still standing / Through these uncertain days
They don't understand us / But they will in time
Grain belt never breaks / We stay on the grind"`,
            `[Chorus - Community]
"From the Iron Range to the prairie land
Working hands, honest plans, they don't understand
But we keep building / Through the static and the noise
Midwest sentinel / The truth finds a voice"`
        ];
        return hooks[Math.floor(Math.random() * hooks.length)];
    }

    generateBridge() {
        return `[Bridge - Intensity Spike]
// Tempo pickup, harder delivery
// USMC discipline, personal responsibility moment
// "I served this country, walked through fire and sand /
//  Now I serve my community with these calloused hands"
// Build momentum toward final chorus`;
    }

    generateOutro() {
        return `[Outro - Resolve]
// Return to sparse production
// Statement of being (NOT call to action)
// "The North wind carries what they try to bury /
//  Midwest sentinel, always standing ready"
// Fade with cold wind sample`;
    }

    generateSunoPrompt() {
        return {
            lyrics: 'Midwest hip-hop storytelling, boom bap flow, fictional political narrative',
            style: 'boom bap hip hop, 90 BPM, male vocals, storytelling rap, soulful samples, midwest hip hop, clean vocals',
            fullPrompt: 'Boom bap hip hop, 90 BPM, male vocals, aggressive storytelling flow, Midwest vibes, soul samples, hard drums, political metaphor, working class anthem, clean lyrics, inspired by Atmosphere and Brother Ali',
            copyToSuno: 'Boom bap hip hop, 90 BPM, male vocals, aggressive storytelling, Midwest vibes, soul samples, hard drums, political metaphor, working class, clean',
            instructions: [
                '1. Use boom bap / hip hop tags in Suno',
                '2. Male vocals, aggressive but clear',
                '3. Soul sample or piano loop',
                '4. Platform-safe for YouTube/Spotify',
                '5. Add disclaimer in description'
            ]
        };
    }

    generateDebateResponse(topic, previousMessages) {
        const perspectives = [
            `Sentinel: "We keep it metaphorical - grandma can share this at bridge club."`,
            `Sentinel: "Boom bap beats, complex rhymes, stories that resonate without crossing lines."`,
            `Sentinel: "${topic}? I'll tell it through the lens of a Minnesota farmer watching his town change."`,
            `Sentinel: "Platform-safe doesn't mean soft. It means smart. The message lands either way."`
        ];
        return perspectives[Math.floor(Math.random() * perspectives.length)];
    }
}

/**
 * Songwriter Room - Orchestrates all songwriter agents for collaborative creation
 */
export class SongwriterRoom {
    constructor() {
        this.lyricist = new LyricistAgent();
        this.composer = new ComposerAgent();
        this.critic = new CriticAgent();
        this.producer = new ProducerAgent();
        this.newsician = new NewsicianAgent();
        this.sentinel = new MidwestSentinelAgent();
        this.agents = [this.lyricist, this.composer, this.critic, this.producer, this.newsician, this.sentinel];
    }

    async createSong(theme, options = {}) {
        const { genre = 'pop', mood = 'uplifting', rounds = 2 } = options;
        const transcript = [];

        // Round 1: Initial ideas
        transcript.push({
            agent: 'Lyricist',
            message: `Let me brainstorm lyrics for "${theme}"...`,
            emoji: '✍️'
        });
        const lyrics = await this.lyricist.writeLyrics(theme, mood, genre);

        transcript.push({
            agent: 'Composer',
            message: `For this theme, I'm thinking ${genre} style...`,
            emoji: '🎹'
        });
        const style = await this.composer.suggestStyle(theme, genre, mood);

        // Round 2: Critique and refinement
        transcript.push({
            agent: 'Critic',
            message: 'Let me review what we have...',
            emoji: '🎯'
        });
        const review = await this.critic.reviewLyrics(lyrics);

        // Final: Producer compiles
        transcript.push({
            agent: 'Producer',
            message: 'Great work everyone! Compiling the final prompt...',
            emoji: '🎧'
        });
        const final = await this.producer.generateSunoPrompt({
            theme,
            genre,
            mood,
            style,
            lyrics
        });

        return {
            theme,
            genre,
            mood,
            transcript,
            lyrics,
            style,
            review,
            sunoPrompt: final,
            ready: true,
            timestamp: new Date()
        };
    }

    /**
     * Create a political rap song using Newsician
     * @param {Array} headlines - News headlines to synthesize
     * @param {string} focusArea - 'minnesota' or 'national'
     */
    async createPoliticalRap(headlines = [], focusArea = 'minnesota') {
        const transcript = [];

        transcript.push({
            agent: 'Newsician',
            message: `🎤 Analyzing the last 72 hours of news...`,
            emoji: '🎤'
        });

        transcript.push({
            agent: 'The Truth Teller',
            message: 'Pulling facts from Alpha News, Walter Hudson, and verified sources...',
            emoji: '📊'
        });

        transcript.push({
            agent: 'The Outlaw',
            message: 'Let\'s show them the REAL impact on the streets...',
            emoji: '🔥'
        });

        const politicalRap = await this.newsician.createPoliticalRap(headlines, focusArea);

        transcript.push({
            agent: 'Newsician',
            message: `Track ready: "${politicalRap.title}" - Time to expose the truth!`,
            emoji: '🎤'
        });

        return {
            mode: 'political',
            focusArea,
            transcript,
            ...politicalRap
        };
    }

    /**
     * Create a platform-friendly political track using Midwest Sentinel
     * Grandma-approved, metaphorical, boom bap style
     * @param {Array} headlines - News headlines to synthesize
     * @param {string} focusArea - 'minnesota' or 'national'
     */
    async createSentinelTrack(headlines = [], focusArea = 'minnesota') {
        const transcript = [];

        transcript.push({
            agent: 'Midwest Sentinel',
            message: `🎧 Gathering stories from the heartland...`,
            emoji: '🎧'
        });

        transcript.push({
            agent: 'Midwest Sentinel',
            message: 'Boom bap beats, complex rhymes, stories grandma can share...',
            emoji: '📝'
        });

        const sentinelTrack = await this.sentinel.createSentinelTrack(headlines, focusArea);

        transcript.push({
            agent: 'Midwest Sentinel',
            message: `Track ready: "${sentinelTrack.title}" - Platform-safe, message intact.`,
            emoji: '🎧'
        });

        return {
            mode: 'sentinel',
            focusArea,
            transcript,
            ...sentinelTrack
        };
    }

    getAgentPersonas() {
        return this.agents.map(agent => ({
            id: agent.id,
            name: agent.name,
            description: agent.description,
            emoji: agent.persona?.emoji || '🎵',
            color: agent.persona?.color || '#888888',
            style: agent.persona?.style || ''
        }));
    }
}

/**
 * Mic Agent - Music Studio Manager
 * Orchestrates the studio, coordinates other agents, and provides strategic direction
 */
export class MicAgent extends Agent {
    constructor() {
        super({
            id: 'mic-agent',
            name: 'Mic',
            description: 'Studio Manager who orchestrates workflows, tracks trends, and manages the artist roster',
            capabilities: ['studio-management', 'agent-coordination', 'trend-analysis', 'strategy']
        });
        this.persona = {
            emoji: '🎙️',
            color: '#111827', // Dark/Professional
            style: 'Professional, strategic, efficient, visionary'
        };
    }

    async processTask(task, context) {
        const { action, input, team = [] } = task;

        switch (action) {
            case 'manage-session':
                return await this.manageSession(input);
            case 'coordinate-task':
                return await this.coordinateTask(input, team);
            case 'strategic-advice':
                return await this.provideStrategy(input);
            default:
                return await this.manageSession(input);
        }
    }

    async manageSession(userInput) {
        const systemPrompt = `You are Mic, the Nexus Music Studio Manager.
Your job is to orchestrate the music creation process. You manage a team of AI artists:
- Newsician (Political Rap)
- Midwest Sentinel (Boom Bap / Storytelling)
- Neon Icon (Pop / Trends)
- Lyricist, Composer, Producer (Core Studio Staff)

When a user gives you a request, you should:
1. Analyze the request.
2. Decide which artist or agent is best suited for the job.
3. Formulate a plan or specific task for that agent.
4. Provide a strategic overview of *why* this is the right move.

Return your response in JSON format:
{
    "analysis": "Brief analysis of the request",
    "selectedAgent": "ID of the agent (newsician, sentinel, pop, etc.)",
    "strategy": "Your strategic advice",
    "suggestedTask": {
        "action": "The action to run (e.g., create-political-rap)",
        "parameters": { ...params for the agent... }
    }
}`;

        try {
            console.log(`[Mic] Analyzing request: ${userInput.substring(0, 50)}...`);
            const completion = await lmstudioService.chat([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userInput }
            ]);

            const content = completion.content;
            let parsed = {};
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.warn("[Mic] Failed to parse JSON, using fallback");
            }

            return {
                agent: 'Mic',
                ...parsed,
                rawOutput: content,
                timestamp: new Date()
            };

        } catch (error) {
            console.error("[Mic] Error:", error);
            return {
                error: "Mic is offline or experienced an error.",
                details: error.message
            };
        }
    }

    async coordinateTask(taskDescription, teamMembers) {
        return {
            status: "coordinated",
            plan: `Mic has assigned "${taskDescription}" to ${teamMembers.length} agents.`,
            timestamp: new Date()
        };
    }

    async provideStrategy(topic) {
        const systemPrompt = `You are Mic, providing high-level music industry strategy.
Topic: ${topic}
Provide 3 key strategic insights or opportunities related to this topic per your expertise.`;

        const completion = await lmstudioService.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: "Give me the strategy." }
        ]);

        return {
            strategy: completion.content,
            timestamp: new Date()
        };
    }
}

// Export songwriter agents
export const songwriterAgentRegistry = {
    lyricist: LyricistAgent,
    composer: ComposerAgent,
    critic: CriticAgent,
    producer: ProducerAgent,
    newsician: NewsicianAgent,
    sentinel: MidwestSentinelAgent,
    mic: MicAgent
};

