import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/mongodb';
import { GridFSBucket } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Logo fetching API - Downloads OFFICIAL logos and saves to database
 * Priority:
 * 1. Check cache (already downloaded)
 * 2. Wikipedia/Wikimedia (most reliable for official logos)
 * 3. Google Search with site restrictions
 * 4. Simple Icons CDN (tech brands)
 * 5. Clearbit (company logos)
 */

// Known Wikipedia logo URLs for major organizations
const WIKIPEDIA_LOGOS: Record<string, string> = {
    'comptia': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/CompTIA_logo.svg',
    'cisco': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg',
    'microsoft': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
    'google': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    'amazon': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    'aws': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    'ibm': 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
    'oracle': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
    'apple': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    'meta': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    'facebook': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png',
    'linkedin': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
    'twitter': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg',
    'github': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
    'gitlab': 'https://upload.wikimedia.org/wikipedia/commons/e/e1/GitLab_logo.svg',
    'docker': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg',
    'kubernetes': 'https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg',
    'python': 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg',
    'javascript': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png',
    'typescript': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg',
    'react': 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
    'angular': 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Angular_full_color_logo.svg',
    'vue': 'https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg',
    'nodejs': 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg',
    'node.js': 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg',
    'mongodb': 'https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg',
    'postgresql': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg',
    'mysql': 'https://upload.wikimedia.org/wikipedia/commons/0/0a/MySQL_textance.png',
    'redis': 'https://upload.wikimedia.org/wikipedia/commons/6/64/Logo-redis.svg',
    'nginx': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Nginx_logo.svg',
    'linux': 'https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg',
    'ubuntu': 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo-ubuntu_cof-orange-hex.svg',
    'debian': 'https://upload.wikimedia.org/wikipedia/commons/6/66/Openlogo-debianV2.svg',
    'fedora': 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Fedora_logo.svg',
    'redhat': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg',
    'red hat': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg',
    'vmware': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Vmware.svg',
    'terraform': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Terraform_Logo.svg',
    'ansible': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Ansible_logo.svg',
    'jenkins': 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Jenkins_logo.svg',
    'splunk': 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Splunk-Logo.jpg',
    'fortinet': 'https://upload.wikimedia.org/wikipedia/commons/5/54/Fortinet_logo.svg',
    'palo alto': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Palo_Alto_Networks_2020_Logo.svg',
    'paloalto': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Palo_Alto_Networks_2020_Logo.svg',
    'crowdstrike': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/CrowdStrike_logo.svg',
    'wireshark': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Wireshark_icon.svg',
    'kali': 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Kali-dragon-icon.svg',
    'kali linux': 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Kali-dragon-icon.svg',
    'nmap': 'https://upload.wikimedia.org/wikipedia/commons/7/73/Nmap_logo.png',
    'metasploit': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Metasploit_logo_and_wordmark.png',
    'burp suite': 'https://upload.wikimedia.org/wikipedia/commons/8/84/Burp_Suite_Logo.svg',
    'udemy': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg',
    'coursera': 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg',
    'edx': 'https://upload.wikimedia.org/wikipedia/commons/8/8f/EdX.svg',
    'tryhackme': 'https://tryhackme.com/img/favicon.png',
    'hackthebox': 'https://www.hackthebox.com/favicon.ico',
    'salesforce': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
    'slack': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    'discord': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Discord_Logo_2023.svg',
    'figma': 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg',
    'jira': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Jira_Logo.svg',
    'confluence': 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Atlassian_Confluence_2017_logo.svg',
    'notion': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
    'trello': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Trello-logo-blue.svg',
    'vscode': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg',
    'visual studio code': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg',
    'intellij': 'https://upload.wikimedia.org/wikipedia/commons/9/9c/IntelliJ_IDEA_Icon.svg',
    'pycharm': 'https://upload.wikimedia.org/wikipedia/commons/1/1d/PyCharm_Icon.svg',
    'git': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Git-logo.svg',
    'npm': 'https://upload.wikimedia.org/wikipedia/commons/d/db/Npm-logo.svg',
    'yarn': 'https://upload.wikimedia.org/wikipedia/commons/1/11/Yarn-logo-kitten.svg',
    'webpack': 'https://upload.wikimedia.org/wikipedia/commons/9/94/Webpack.svg',
    'vite': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Vitejs-logo.svg',
    'nextjs': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg',
    'next.js': 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg',
    'tailwind': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg',
    'tailwindcss': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg',
    'bootstrap': 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Bootstrap_logo.svg',
    'django': 'https://upload.wikimedia.org/wikipedia/commons/7/75/Django_logo.svg',
    'flask': 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Flask_logo.svg',
    'laravel': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Laravel.svg',
    'spring': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Spring_Framework_Logo_2018.svg',
    'express': 'https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png',
    'graphql': 'https://upload.wikimedia.org/wikipedia/commons/1/17/GraphQL_Logo.svg',
    'postman': 'https://www.svgrepo.com/download/354202/postman-icon.svg',
    'firebase': 'https://upload.wikimedia.org/wikipedia/commons/3/37/Firebase_Logo.svg',
    'supabase': 'https://upload.wikimedia.org/wikipedia/commons/1/10/Supabase_Logo.svg',
    'vercel': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_black.svg',
    'netlify': 'https://upload.wikimedia.org/wikipedia/commons/9/97/Netlify_logo_%282%29.svg',
    'heroku': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Heroku_logo.svg',
    'digitalocean': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/DigitalOcean_logo.svg',
    'cloudflare': 'https://upload.wikimedia.org/wikipedia/commons/9/94/Cloudflare_Logo.svg',
    'azure': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg',
    'gcp': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg',
    'google cloud': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg',
    'java': 'https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg',
    'go': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Go_Logo_Blue.svg',
    'golang': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Go_Logo_Blue.svg',
    'rust': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Rust_programming_language_black_logo.svg',
    'swift': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Swift_logo.svg',
    'kotlin': 'https://upload.wikimedia.org/wikipedia/commons/7/74/Kotlin_Icon.png',
    'ruby': 'https://upload.wikimedia.org/wikipedia/commons/7/73/Ruby_logo.svg',
    'php': 'https://upload.wikimedia.org/wikipedia/commons/2/27/PHP-logo.svg',
    'c++': 'https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg',
    'cplusplus': 'https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg',
    'c#': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Csharp_Logo.png',
    'csharp': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Csharp_Logo.png',
    '.net': 'https://upload.wikimedia.org/wikipedia/commons/e/ee/.NET_Core_Logo.svg',
    'dotnet': 'https://upload.wikimedia.org/wikipedia/commons/e/ee/.NET_Core_Logo.svg',
    'html': 'https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg',
    'html5': 'https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg',
    'css': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg',
    'css3': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg',
    'sass': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Sass_Logo_Color.svg',
    'bash': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Bash_Logo_Colored.svg',
    'powershell': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/PowerShell_5.0_icon.png',
    'ec-council': 'https://upload.wikimedia.org/wikipedia/commons/0/09/EC-Council_logo.png',
    'eccouncil': 'https://upload.wikimedia.org/wikipedia/commons/0/09/EC-Council_logo.png',
    'isc2': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/ISC2_Logo.svg',
    '(isc)²': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/ISC2_Logo.svg',
    'isaca': 'https://upload.wikimedia.org/wikipedia/commons/6/65/ISACA_logo.svg',
    'nvidia': 'https://upload.wikimedia.org/wikipedia/commons/a/a4/NVIDIA_logo.svg',
    'intel': 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg',
    'amd': 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg',
    'dell': 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg',
    'hp': 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg',
    'elastic': 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Elasticsearch_logo.svg',
    'elasticsearch': 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Elasticsearch_logo.svg',
    'kafka': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Apache_kafka.svg',
    'apache kafka': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Apache_kafka.svg',
    'rabbitmq': 'https://upload.wikimedia.org/wikipedia/commons/7/71/RabbitMQ_logo.svg',
    'hashicorp': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Terraform_Logo.svg',
    'prisma': 'https://prismalens.vercel.app/header/logo-dark.svg',
    'owasp': 'https://upload.wikimedia.org/wikipedia/commons/5/5d/OWASP_logo.png',
};

function slugify(name: string): string {
    return name.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
}

async function downloadAndSave(imageUrl: string, name: string, source: string, bucket: GridFSBucket): Promise<string | null> {
    try {
        const response = await fetch(imageUrl, {
            signal: AbortSignal.timeout(15000),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        if (!response.ok) return null;

        const contentType = response.headers.get('content-type') || 'image/png';
        // Accept SVG, PNG, JPG, ICO, GIF
        if (!contentType.includes('image') && !contentType.includes('svg')) return null;

        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length < 100) return null; // Skip tiny/empty files

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
        console.error('Download failed for', imageUrl, ':', error);
        return null;
    }
}

async function tryGoogleSearch(query: string): Promise<string | null> {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    if (!apiKey || !searchEngineId) return null;

    try {
        // Search for official logo with site restrictions
        const searchQueries = [
            `${query} official logo site:wikipedia.org OR site:wikimedia.org`,
            `${query} logo transparent png`,
        ];

        for (const searchQuery of searchQueries) {
            const url = new URL('https://www.googleapis.com/customsearch/v1');
            url.searchParams.set('key', apiKey);
            url.searchParams.set('cx', searchEngineId);
            url.searchParams.set('q', searchQuery);
            url.searchParams.set('searchType', 'image');
            url.searchParams.set('num', '5');
            url.searchParams.set('imgSize', 'medium');
            url.searchParams.set('safe', 'active');

            const response = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
            const data = await response.json();

            if (response.ok && data.items?.length > 0) {
                // Prefer Wikipedia/Wikimedia sources, then PNG/SVG
                const wikimedia = data.items.find((item: any) =>
                    item.link.includes('wikimedia.org') || item.link.includes('wikipedia.org')
                );
                if (wikimedia) return wikimedia.link;

                const best = data.items.find((item: any) =>
                    /\.(png|svg)$/i.test(item.link)
                ) || data.items[0];
                return best.link;
            }
        }
    } catch (error) {
        console.error('Google Search failed:', error);
    }
    return null;
}

async function tryClearbit(name: string): Promise<string | null> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const domains = [`${slug}.com`, `${slug}.io`, `${slug}.org`, `${slug}.co`, `${slug}.dev`];

    for (const domain of domains) {
        try {
            const url = `https://logo.clearbit.com/${domain}`;
            const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
            if (response.ok) return url;
        } catch { }
    }
    return null;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const org = searchParams.get('org')?.trim();

    try {
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

        // 2. Check Wikipedia logos (most reliable)
        const normalized = org.toLowerCase().trim();
        if (WIKIPEDIA_LOGOS[normalized]) {
            const savedUrl = await downloadAndSave(WIKIPEDIA_LOGOS[normalized], org, 'wikipedia', bucket);
            if (savedUrl) {
                return NextResponse.json({ url: savedUrl, source: 'wikipedia' });
            }
        }

        // 3. Try Google Search (with Wikipedia preference)
        const googleUrl = await tryGoogleSearch(org);
        if (googleUrl) {
            const savedUrl = await downloadAndSave(googleUrl, org, 'google', bucket);
            if (savedUrl) {
                return NextResponse.json({ url: savedUrl, source: 'google' });
            }
        }

        // 4. Try Clearbit
        const clearbitUrl = await tryClearbit(org);
        if (clearbitUrl) {
            const savedUrl = await downloadAndSave(clearbitUrl, org, 'clearbit', bucket);
            if (savedUrl) {
                return NextResponse.json({ url: savedUrl, source: 'clearbit' });
            }
        }

        // 5. Not found
        return NextResponse.json({ error: `No official logo found for "${org}". Try uploading manually.` }, { status: 404 });

    } catch (error: any) {
        console.error('Logo Fetch API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
