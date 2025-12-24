import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const LOGO_MAP_PATH = path.resolve(process.cwd(), 'logoMap.json');
const LOGOS_DIR = path.resolve(process.cwd(), 'public', 'org-logos');

/** Helper – generate a safe filename from the org name */
function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^\w]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** Load the cache map */
function loadLogoMap(): Record<string, string> {
    try {
        if (fs.existsSync(LOGO_MAP_PATH)) {
            const content = fs.readFileSync(LOGO_MAP_PATH, 'utf-8');
            return JSON.parse(content);
        }
    } catch (err) {
        console.error('Failed to load logo map:', err);
    }
    return {};
}

/** Save the cache map */
function saveLogoMap(map: Record<string, string>): void {
    try {
        fs.writeFileSync(LOGO_MAP_PATH, JSON.stringify(map, null, 2));
    } catch (err) {
        console.error('Failed to save logo map:', err);
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const org = searchParams.get('org')?.trim();

    if (!org) {
        return NextResponse.json({ error: 'Missing org query parameter' }, { status: 400 });
    }

    // Check cache first
    const logoMap = loadLogoMap();
    if (logoMap[org]) {
        return NextResponse.json({ url: `/org-logos/${logoMap[org]}`, cached: true });
    }

    // Check for API key
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
        // Fallback: Try Clearbit Logo API (no key needed)
        const clearbitUrl = `https://logo.clearbit.com/${slugify(org)}.com`;

        try {
            const response = await fetch(clearbitUrl, { method: 'HEAD' });
            if (response.ok) {
                // Logo exists, download and cache it
                const logoResponse = await fetch(clearbitUrl);
                const buffer = Buffer.from(await logoResponse.arrayBuffer());

                const filename = `${slugify(org)}-${crypto.randomBytes(4).toString('hex')}.png`;
                if (!fs.existsSync(LOGOS_DIR)) {
                    fs.mkdirSync(LOGOS_DIR, { recursive: true });
                }

                const destPath = path.join(LOGOS_DIR, filename);
                fs.writeFileSync(destPath, buffer);

                logoMap[org] = filename;
                saveLogoMap(logoMap);

                return NextResponse.json({ url: `/org-logos/${filename}`, source: 'clearbit' });
            }
        } catch (err) {
            console.error('Clearbit fallback failed:', err);
        }

        return NextResponse.json(
            { error: 'No API key configured. Please add GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID to .env.local' },
            { status: 503 }
        );
    }

    // Google Custom Search API
    try {
        const searchQuery = `${org} logo`;
        const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
        searchUrl.searchParams.set('key', apiKey);
        searchUrl.searchParams.set('cx', searchEngineId);
        searchUrl.searchParams.set('q', searchQuery);
        searchUrl.searchParams.set('searchType', 'image');
        searchUrl.searchParams.set('num', '5');
        searchUrl.searchParams.set('imgType', 'photo');

        const searchResponse = await fetch(searchUrl.toString());
        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
            return NextResponse.json({ error: 'No logo found for this organization' }, { status: 404 });
        }

        // Pick the first suitable result (prefer PNG/SVG)
        const candidate = searchData.items.find((item: any) => {
            const url = item.link as string;
            return /\.(png|svg|jpg|jpeg)$/i.test(url);
        }) || searchData.items[0];

        const logoUrl = candidate.link;

        // Download the logo
        const logoResponse = await fetch(logoUrl);
        if (!logoResponse.ok) {
            return NextResponse.json({ error: 'Failed to download logo' }, { status: 500 });
        }

        const buffer = Buffer.from(await logoResponse.arrayBuffer());

        // Determine file extension
        const urlExt = path.extname(new URL(logoUrl).pathname);
        const ext = urlExt || '.png';
        const filename = `${slugify(org)}-${crypto.randomBytes(4).toString('hex')}${ext}`;

        // Ensure directory exists
        if (!fs.existsSync(LOGOS_DIR)) {
            fs.mkdirSync(LOGOS_DIR, { recursive: true });
        }

        // Save the file
        const destPath = path.join(LOGOS_DIR, filename);
        fs.writeFileSync(destPath, buffer);

        // Update cache
        logoMap[org] = filename;
        saveLogoMap(logoMap);

        return NextResponse.json({ url: `/org-logos/${filename}`, source: 'google' });
    } catch (err) {
        console.error('Logo fetch error:', err);
        return NextResponse.json(
            { error: 'Failed to fetch logo', details: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
