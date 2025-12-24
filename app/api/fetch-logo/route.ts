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

async function tryClearbit(org: string, slug: string, gridPrefix: string, bucket: GridFSBucket) {
    // If org looks like a domain, use it. Otherwise, guess {slug}.com
    const domain = org.includes('.') ? (org.includes('://') ? new URL(org).hostname : org) : `${slug}.com`;
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;

    try {
        const response = await fetch(clearbitUrl, { method: 'HEAD' });
        if (response.ok) {
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

            return { url: `/api/images/${filename}`, source: 'clearbit' };
        }
    } catch (err) {
        console.error('Clearbit fetch failed:', err);
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
    const slug = slugify(org);
    const gridPrefix = `logo_${slug}`;

    // 1. Check if we already have this logo in GridFS
    const existingFiles = await bucket.find({ filename: { $regex: new RegExp(`^${gridPrefix}`) } }).toArray();
    if (existingFiles.length > 0) {
        return NextResponse.json({
            url: `/api/images/${existingFiles[0].filename}`,
            cached: true
        });
    }

    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    // 2. Google Custom Search (Primary)
    if (apiKey && searchEngineId) {
        try {
            const searchQuery = `${org} official logo brand icon png transparent`;
            const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
            searchUrl.searchParams.set('key', apiKey);
            searchUrl.searchParams.set('cx', searchEngineId);
            searchUrl.searchParams.set('q', searchQuery);
            searchUrl.searchParams.set('searchType', 'image');
            searchUrl.searchParams.set('num', '5');
            searchUrl.searchParams.set('imgSize', 'medium'); // Prefer decent quality

            const searchResponse = await fetch(searchUrl.toString());
            const searchData = await searchResponse.json();

            if (searchResponse.ok && searchData.items && searchData.items.length > 0) {
                // Filter and pick the best candidate
                const candidate = searchData.items.find((item: any) => {
                    const url = item.link as string;
                    // Prefer PNGs or SVGs from reputable sources
                    return /\.(png|svg)$/i.test(url);
                }) || searchData.items[0];

                const logoUrl = candidate.link;
                const logoResponse = await fetch(logoUrl);

                if (logoResponse.ok) {
                    const contentType = logoResponse.headers.get('content-type') || 'image/png';

                    // Only accept images
                    if (contentType.startsWith('image/')) {
                        const buffer = Buffer.from(await logoResponse.arrayBuffer());
                        const urlExt = new URL(logoUrl).pathname.split('.').pop();
                        const ext = urlExt && urlExt.length < 5 ? `.${urlExt}` : '.png';

                        const filename = `${gridPrefix}-${crypto.randomBytes(4).toString('hex')}${ext}`;

                        const uploadStream = bucket.openUploadStream(filename, {
                            metadata: {
                                contentType,
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
                    }
                }
            }
        } catch (err) {
            console.error('Google search failed, falling back to Clearbit:', err);
        }
    }

    // 3. Fallback to Clearbit if Google failed or skipped
    const clearbitResult = await tryClearbit(org, slug, gridPrefix, bucket);
    if (clearbitResult) {
        return NextResponse.json(clearbitResult);
    }

    // 4. Ultimate Failure
    return NextResponse.json(
        { error: 'No logo found. Try uploading a custom image or check search API configuration.' },
        { status: 404 }
    );
}
