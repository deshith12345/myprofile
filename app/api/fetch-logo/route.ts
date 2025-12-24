import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Logo fetching API - Rebuilt from scratch
 * Priority:
 * 1. Google Custom Search (best quality, works for anything)
 * 2. Simple Icons CDN (covers 3000+ tech brands - no API key needed)
 * 3. Clearbit Logo API (covers companies with domains - no API key needed)
 */

// Common tech brand slug mappings for Simple Icons
const SLUG_MAPPINGS: Record<string, string> = {
    // Programming languages
    'python': 'python',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'java': 'openjdk',
    'c++': 'cplusplus',
    'c#': 'csharp',
    'c': 'c',
    'go': 'go',
    'rust': 'rust',
    'ruby': 'ruby',
    'php': 'php',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'scala': 'scala',
    'r': 'r',
    'perl': 'perl',
    'lua': 'lua',
    'dart': 'dart',

    // Frameworks & Libraries
    'react': 'react',
    'vue': 'vuedotjs',
    'vue.js': 'vuedotjs',
    'angular': 'angular',
    'svelte': 'svelte',
    'next.js': 'nextdotjs',
    'nextjs': 'nextdotjs',
    'nuxt': 'nuxtdotjs',
    'express': 'express',
    'django': 'django',
    'flask': 'flask',
    'fastapi': 'fastapi',
    'spring': 'spring',
    'spring boot': 'springboot',
    'rails': 'rubyonrails',
    'laravel': 'laravel',
    '.net': 'dotnet',
    'dotnet': 'dotnet',
    'node': 'nodedotjs',
    'node.js': 'nodedotjs',
    'nodejs': 'nodedotjs',
    'jquery': 'jquery',
    'bootstrap': 'bootstrap',
    'tailwind': 'tailwindcss',
    'tailwindcss': 'tailwindcss',

    // Databases
    'mongodb': 'mongodb',
    'mysql': 'mysql',
    'postgresql': 'postgresql',
    'postgres': 'postgresql',
    'redis': 'redis',
    'sqlite': 'sqlite',
    'firebase': 'firebase',
    'supabase': 'supabase',
    'prisma': 'prisma',

    // Cloud & DevOps
    'aws': 'amazonaws',
    'amazon': 'amazonaws',
    'azure': 'microsoftazure',
    'gcp': 'googlecloud',
    'google cloud': 'googlecloud',
    'docker': 'docker',
    'kubernetes': 'kubernetes',
    'k8s': 'kubernetes',
    'terraform': 'terraform',
    'ansible': 'ansible',
    'jenkins': 'jenkins',
    'github': 'github',
    'gitlab': 'gitlab',
    'vercel': 'vercel',
    'netlify': 'netlify',
    'heroku': 'heroku',
    'digitalocean': 'digitalocean',
    'cloudflare': 'cloudflare',
    'nginx': 'nginx',

    // Security Tools
    'wireshark': 'wireshark',
    'metasploit': 'metasploit',
    'burp suite': 'burpsuite',
    'burpsuite': 'burpsuite',
    'nmap': 'nmap',
    'kali linux': 'kalilinux',
    'kali': 'kalilinux',
    'parrot': 'parrotsecurity',
    'splunk': 'splunk',
    'owasp': 'owasp',

    // Operating Systems
    'linux': 'linux',
    'ubuntu': 'ubuntu',
    'debian': 'debian',
    'fedora': 'fedora',
    'centos': 'centos',
    'arch linux': 'archlinux',
    'windows': 'windows',
    'macos': 'macos',
    'android': 'android',
    'ios': 'ios',

    // Version Control & Tools
    'git': 'git',
    'bitbucket': 'bitbucket',
    'jira': 'jira',
    'slack': 'slack',
    'discord': 'discord',
    'figma': 'figma',
    'vscode': 'visualstudiocode',
    'visual studio code': 'visualstudiocode',

    // Companies
    'google': 'google',
    'microsoft': 'microsoft',
    'apple': 'apple',
    'meta': 'meta',
    'ibm': 'ibm',
    'cisco': 'cisco',
    'comptia': 'comptia',
    'fortinet': 'fortinet',
    'crowdstrike': 'crowdstrike',
    'palo alto': 'paloaltonetworks',
    'hashicorp': 'hashicorp',
    'redhat': 'redhat',
    'red hat': 'redhat',
    'vmware': 'vmware',
    'salesforce': 'salesforce',
    'oracle': 'oracle',
    'nvidia': 'nvidia',

    // Learning Platforms
    'udemy': 'udemy',
    'coursera': 'coursera',
    'linkedin': 'linkedin',
    'tryhackme': 'tryhackme',
    'hackthebox': 'hackthebox',

    // Other tools
    'bash': 'gnubash',
    'powershell': 'powershell',
    'html': 'html5',
    'html5': 'html5',
    'css': 'css3',
    'css3': 'css3',
    'sass': 'sass',
    'webpack': 'webpack',
    'vite': 'vite',
    'npm': 'npm',
    'yarn': 'yarn',
    'graphql': 'graphql',
    'postman': 'postman',
};

function findSlug(name: string): string | null {
    const normalized = name.toLowerCase().trim();
    if (SLUG_MAPPINGS[normalized]) return SLUG_MAPPINGS[normalized];

    const cleaned = normalized.replace(/[^a-z0-9]/g, '');
    for (const [key, slug] of Object.entries(SLUG_MAPPINGS)) {
        if (key.replace(/[^a-z0-9]/g, '') === cleaned) return slug;
    }
    return cleaned || null;
}

async function tryGoogleSearch(query: string): Promise<string | null> {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) return null;

    try {
        const searchQuery = `${query} logo png transparent`;
        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.set('key', apiKey);
        url.searchParams.set('cx', searchEngineId);
        url.searchParams.set('q', searchQuery);
        url.searchParams.set('searchType', 'image');
        url.searchParams.set('num', '5');
        url.searchParams.set('imgSize', 'medium');
        url.searchParams.set('fileType', 'png');

        const response = await fetch(url.toString(), {
            signal: AbortSignal.timeout(8000)
        });
        const data = await response.json();

        if (response.ok && data.items?.length > 0) {
            // Find best candidate (prefer png/svg)
            const best = data.items.find((item: any) =>
                /\.(png|svg)$/i.test(item.link)
            ) || data.items[0];

            return best.link;
        }
    } catch (error) {
        console.error('Google Search failed:', error);
    }
    return null;
}

async function trySimpleIcons(slug: string): Promise<string | null> {
    try {
        const url = `https://cdn.simpleicons.org/${slug}`;
        const response = await fetch(url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(3000)
        });
        if (response.ok) return url;
    } catch (error) {
        // Ignore
    }
    return null;
}

async function tryClearbit(name: string): Promise<string | null> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const domains = [`${slug}.com`, `${slug}.io`, `${slug}.org`, `${slug}.co`];

    for (const domain of domains) {
        try {
            const url = `https://logo.clearbit.com/${domain}`;
            const response = await fetch(url, {
                method: 'HEAD',
                signal: AbortSignal.timeout(2000)
            });
            if (response.ok) return url;
        } catch (error) {
            // Continue
        }
    }
    return null;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const org = searchParams.get('org')?.trim();

    if (!org) {
        return NextResponse.json({ error: 'Missing org query parameter' }, { status: 400 });
    }

    // 1. Try Simple Icons first (fastest for tech brands)
    const slug = findSlug(org);
    if (slug) {
        const simpleIconUrl = await trySimpleIcons(slug);
        if (simpleIconUrl) {
            return NextResponse.json({ url: simpleIconUrl, source: 'simple-icons' });
        }
    }

    // 2. Try raw slug
    const rawSlug = org.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (rawSlug && rawSlug !== slug) {
        const rawIconUrl = await trySimpleIcons(rawSlug);
        if (rawIconUrl) {
            return NextResponse.json({ url: rawIconUrl, source: 'simple-icons' });
        }
    }

    // 3. Try Google Search (works for anything)
    const googleUrl = await tryGoogleSearch(org);
    if (googleUrl) {
        return NextResponse.json({ url: googleUrl, source: 'google' });
    }

    // 4. Try Clearbit
    const clearbitUrl = await tryClearbit(org);
    if (clearbitUrl) {
        return NextResponse.json({ url: clearbitUrl, source: 'clearbit' });
    }

    // 5. Not found
    return NextResponse.json(
        { error: `No logo found for "${org}"` },
        { status: 404 }
    );
}
