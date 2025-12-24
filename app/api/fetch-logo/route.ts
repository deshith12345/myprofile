import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/mongodb';
import { GridFSBucket } from 'mongodb';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Logo fetching API - Downloads and saves logos to database
 * Priority:
 * 1. Check cache (already downloaded)
 * 2. Google Custom Search (best quality)
 * 3. Simple Icons CDN (tech brands)
 * 4. Clearbit (company logos)
 */

// Simple Icons slug mappings
const SLUG_MAPPINGS: Record<string, string> = {
    'python': 'python', 'javascript': 'javascript', 'typescript': 'typescript',
    'java': 'openjdk', 'c++': 'cplusplus', 'c#': 'csharp', 'go': 'go', 'rust': 'rust',
    'ruby': 'ruby', 'php': 'php', 'swift': 'swift', 'kotlin': 'kotlin',
    'react': 'react', 'vue': 'vuedotjs', 'vue.js': 'vuedotjs', 'angular': 'angular',
    'svelte': 'svelte', 'next.js': 'nextdotjs', 'nextjs': 'nextdotjs',
    'express': 'express', 'django': 'django', 'flask': 'flask', 'fastapi': 'fastapi',
    'spring': 'spring', 'laravel': 'laravel', '.net': 'dotnet', 'dotnet': 'dotnet',
    'node': 'nodedotjs', 'node.js': 'nodedotjs', 'nodejs': 'nodedotjs',
    'jquery': 'jquery', 'bootstrap': 'bootstrap', 'tailwind': 'tailwindcss',
    'mongodb': 'mongodb', 'mysql': 'mysql', 'postgresql': 'postgresql',
    'postgres': 'postgresql', 'redis': 'redis', 'sqlite': 'sqlite',
    'firebase': 'firebase', 'supabase': 'supabase', 'prisma': 'prisma',
    'aws': 'amazonaws', 'amazon': 'amazonaws', 'azure': 'microsoftazure',
    'gcp': 'googlecloud', 'google cloud': 'googlecloud', 'docker': 'docker',
    'kubernetes': 'kubernetes', 'k8s': 'kubernetes', 'terraform': 'terraform',
    'ansible': 'ansible', 'jenkins': 'jenkins', 'github': 'github', 'gitlab': 'gitlab',
    'vercel': 'vercel', 'netlify': 'netlify', 'heroku': 'heroku',
    'digitalocean': 'digitalocean', 'cloudflare': 'cloudflare', 'nginx': 'nginx',
    'wireshark': 'wireshark', 'metasploit': 'metasploit', 'burp suite': 'burpsuite',
    'burpsuite': 'burpsuite', 'nmap': 'nmap', 'kali linux': 'kalilinux', 'kali': 'kalilinux',
    'parrot': 'parrotsecurity', 'splunk': 'splunk', 'owasp': 'owasp',
    'linux': 'linux', 'ubuntu': 'ubuntu', 'debian': 'debian', 'fedora': 'fedora',
    'centos': 'centos', 'arch linux': 'archlinux', 'windows': 'windows',
    'macos': 'macos', 'android': 'android', 'ios': 'ios',
    'git': 'git', 'bitbucket': 'bitbucket', 'jira': 'jira', 'slack': 'slack',
    'discord': 'discord', 'figma': 'figma', 'vscode': 'visualstudiocode',
    'visual studio code': 'visualstudiocode',
    'google': 'google', 'microsoft': 'microsoft', 'apple': 'apple', 'meta': 'meta',
    'ibm': 'ibm', 'cisco': 'cisco', 'comptia': 'comptia', 'fortinet': 'fortinet',
    'crowdstrike': 'crowdstrike', 'palo alto': 'paloaltonetworks',
    'hashicorp': 'hashicorp', 'redhat': 'redhat', 'red hat': 'redhat',
    'vmware': 'vmware', 'salesforce': 'salesforce', 'oracle': 'oracle', 'nvidia': 'nvidia',
    'udemy': 'udemy', 'coursera': 'coursera', 'linkedin': 'linkedin',
    'tryhackme': 'tryhackme', 'hackthebox': 'hackthebox',
    'bash': 'gnubash', 'powershell': 'powershell', 'html': 'html5', 'html5': 'html5',
    'css': 'css3', 'css3': 'css3', 'sass': 'sass', 'webpack': 'webpack', 'vite': 'vite',
    'npm': 'npm', 'yarn': 'yarn', 'graphql': 'graphql', 'postman': 'postman',
};

function slugify(name: string): string {
    return name.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
}

function findSlug(name: string): string | null {
    const normalized = name.toLowerCase().trim();
    if (SLUG_MAPPINGS[normalized]) return SLUG_MAPPINGS[normalized];
    const cleaned = normalized.replace(/[^a-z0-9]/g, '');
    for (const [key, slug] of Object.entries(SLUG_MAPPINGS)) {
        if (key.replace(/[^a-z0-9]/g, '') === cleaned) return slug;
    }
    return cleaned || null;
}

async function downloadAndSave(imageUrl: string, name: string, source: string, bucket: GridFSBucket): Promise<string | null> {
    try {
        const response = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) return null;

        const contentType = response.headers.get('content-type') || 'image/png';
        if (!contentType.startsWith('image/')) return null;

        const buffer = Buffer.from(await response.arrayBuffer());
        const ext = contentType.includes('svg') ? '.svg' : contentType.includes('png') ? '.png' : '.jpg';
        const filename = `logo_${slugify(name)}-${crypto.randomBytes(4).toString('hex')}${ext}`;

        const uploadStream = bucket.openUploadStream(filename, {
            metadata: { contentType, originalName: `${name} Logo`, source, sourceUrl: imageUrl, uploadDate: new Date() }
        });

        await new Promise((resolve, reject) => {
            uploadStream.on('error', reject);
            uploadStream.on('finish', resolve);
            uploadStream.end(buffer);
        });

        return `/api/images/${filename}`;
    } catch (error) {
        console.error('Download failed:', error);
        return null;
    }
}

async function tryGoogleSearch(query: string): Promise<string | null> {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    if (!apiKey || !searchEngineId) return null;

    try {
        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.set('key', apiKey);
        url.searchParams.set('cx', searchEngineId);
        url.searchParams.set('q', `${query} logo png transparent`);
        url.searchParams.set('searchType', 'image');
        url.searchParams.set('num', '5');
        url.searchParams.set('imgSize', 'medium');

        const response = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
        const data = await response.json();

        if (response.ok && data.items?.length > 0) {
            const best = data.items.find((item: any) => /\.(png|svg)$/i.test(item.link)) || data.items[0];
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
        const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
        if (response.ok) return url;
    } catch { }
    return null;
}

async function tryClearbit(name: string): Promise<string | null> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const domains = [`${slug}.com`, `${slug}.io`, `${slug}.org`, `${slug}.co`];

    for (const domain of domains) {
        try {
            const url = `https://logo.clearbit.com/${domain}`;
            const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
            if (response.ok) return url;
        } catch { }
    }
    return null;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const org = searchParams.get('org')?.trim();

    if (!org) {
        return NextResponse.json({ error: 'Missing org query parameter' }, { status: 400 });
    }

    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    const prefix = `logo_${slugify(org)}`;

    // 1. Check cache
    const existing = await bucket.find({ filename: { $regex: new RegExp(`^${prefix}`) } }).toArray();
    if (existing.length > 0) {
        return NextResponse.json({ url: `/api/images/${existing[0].filename}`, source: 'cache' });
    }

    // 2. Try Google Search first (best quality, downloads and saves)
    const googleUrl = await tryGoogleSearch(org);
    if (googleUrl) {
        const savedUrl = await downloadAndSave(googleUrl, org, 'google', bucket);
        if (savedUrl) {
            return NextResponse.json({ url: savedUrl, source: 'google' });
        }
    }

    // 3. Try Simple Icons (download SVG and save)
    const slug = findSlug(org);
    if (slug) {
        const simpleIconUrl = await trySimpleIcons(slug);
        if (simpleIconUrl) {
            const savedUrl = await downloadAndSave(simpleIconUrl, org, 'simple-icons', bucket);
            if (savedUrl) {
                return NextResponse.json({ url: savedUrl, source: 'simple-icons' });
            }
            // If save failed, return CDN URL directly
            return NextResponse.json({ url: simpleIconUrl, source: 'simple-icons-cdn' });
        }
    }

    // 4. Try Clearbit (download and save)
    const clearbitUrl = await tryClearbit(org);
    if (clearbitUrl) {
        const savedUrl = await downloadAndSave(clearbitUrl, org, 'clearbit', bucket);
        if (savedUrl) {
            return NextResponse.json({ url: savedUrl, source: 'clearbit' });
        }
    }

    // 5. Not found
    return NextResponse.json({ error: `No logo found for "${org}"` }, { status: 404 });
}
