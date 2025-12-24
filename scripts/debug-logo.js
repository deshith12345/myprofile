
const { MongoClient, GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Manually load env from .env.local if exists
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.log('Could not load .env.local', e.message);
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

async function run() {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();

    console.log(`Connected to database: ${db.databaseName}`);

    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    // 1. List recent files
    console.log('\n--- Recent Files in GridFS (images) ---');
    const files = await bucket.find().sort({ uploadDate: -1 }).limit(5).toArray();
    files.forEach(f => {
        console.log(`Filename: ${f.filename}`);
        console.log(`  ID: ${f._id}`);
        console.log(`  Size: ${f.length}`);
        console.log(`  ContentType: ${f.metadata?.contentType || f.contentType}`);
        console.log(`  UploadDate: ${f.uploadDate}`);
    });

    if (files.length === 0) {
        console.log('No files found.');
    } else {
        const latestInfo = files[0];
        console.log(`\n--- verifying retrieval for: ${latestInfo.filename} ---`);

        try {
            const stream = bucket.openDownloadStreamByName(latestInfo.filename);
            let size = 0;
            stream.on('data', (chunk) => {
                size += chunk.length;
            });

            await new Promise((resolve, reject) => {
                stream.on('end', resolve);
                stream.on('error', reject);
            });
            console.log(`Stream read success. Total bytes: ${size}. Matches database? ${size === latestInfo.length}`);
        } catch (err) {
            console.error('FAILED to read stream:', err);
        }
    }

    await client.close();
}

run().catch(console.error);
