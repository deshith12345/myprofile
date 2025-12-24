import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/mongodb';
import { GridFSBucket } from 'mongodb';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow enough time for search + download + GridFS save

/** Helper – generate a safe filename from the org name */
function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^\w]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const org = searchParams.get('org')?.trim();

    if (!org) {
        return NextResponse.json({ error: 'Missing org query parameter' }, { status: 400 });
    }

    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    const slug = slugify(org);
    const gridPrefix = `logo_${slug}`;

    // 1. Check if we already have this logo in GridFS
    // We search for files starting with "logo_{slug}"
    const existingFiles = await bucket.find({ filename: { $regex: new RegExp(`^${gridPrefix}`) } }).toArray();
    if (existingFiles.length > 0) {
        return NextResponse.json({
            url: `/api/images/${existingFiles[0].filename}`,
            cached: true
        });
    }

    // Check for API key
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
        // Fallback: Try Clearbit Logo API (no key needed)
        const clearbitUrl = `https://logo.clearbit.com/${slug}.com`;

        try {
            const response = await fetch(clearbitUrl, { method: 'HEAD' });
            if (response.ok) {
                // Logo exists, download and cache it in GridFS
                const logoResponse = await fetch(clearbitUrl);
                const buffer = Buffer.from(await logoResponse.arrayBuffer());

                const filename = `${gridPrefix}-${crypto.randomBytes(4).toString('hex')}.png`;

                const uploadStream = bucket.openUploadStream(filename, {
                    metadata: {
                        contentType: 'image/png',
                        originalName: `${org} Logo`,
                        source: 'clearbit',
                        uploadDate: new Date()
                    }
                });

                await new Promise((resolve, reject) => {
                    uploadStream.on('error', reject);
                    uploadStream.on('finish', resolve);
                    uploadStream.end(buffer);
                });

                return NextResponse.json({ url: `/api/images/${filename}`, source: 'clearbit' });
            }
        } catch (err) {
            console.error('Clearbit fallback failed:', err);
        }

        return NextResponse.json(
            { error: 'No API key configured. Please add GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID to Vercel Environment Variables.' },
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

        if (!searchResponse.ok) {
            console.error('Google API Error:', searchData);
            return NextResponse.json({
                error: `Google API Error: ${searchData.error?.message || searchResponse.statusText}`
            }, { status: searchResponse.status });
        }

        if (!searchData.items || searchData.items.length === 0) {
            return NextResponse.json({ error: 'No logo found for this organization on Google' }, { status: 404 });
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

        // Determine file extension and content type
        const urlExt = new URL(logoUrl).pathname.split('.').pop();
        const ext = urlExt ? `.${urlExt}` : '.png';
        const contentType = logoResponse.headers.get('content-type') || 'application/octet-stream';

        const filename = `${gridPrefix}-${crypto.randomBytes(4).toString('hex')}${ext}`;

        // Save to GridFS
        const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
                contentType: contentType,
                originalName: `${org} Logo`,
                source: 'google',
                sourceUrl: logoUrl,
                uploadDate: new Date()
            }
        });

        await new Promise((resolve, reject) => {
            uploadStream.on('error', reject);
            uploadStream.on('finish', resolve);
            uploadStream.end(buffer);
        });

        return NextResponse.json({ url: `/api/images/${filename}`, source: 'google' });
    } catch (err) {
        console.error('Logo fetch error:', err);
        return NextResponse.json(
            { error: 'Failed to fetch logo', details: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
