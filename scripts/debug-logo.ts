
import { MongoClient, GridFSBucket } from 'mongodb';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Manually load env if not picked up (usually tsx picks up .env if configured, but let's be safe)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio'; // Adjust if needed

async function run() {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(); // Uses default db from URI

    console.log(`Connected to database: ${db.databaseName}`);

    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    // 1. List recent files
    console.log('\n--- Recent Files in GridFS (images) ---');
    const files = await bucket.find().sort({ uploadDate: -1 }).limit(5).toArray();
    files.forEach(f => {
        console.log(`Filename: ${f.filename}`);
        console.log(`  ID: ${f._id}`);
        console.log(`  Size: ${f.length}`);
        console.log(`  ContentType: ${(f as any).metadata?.contentType || (f as any).contentType}`);
        console.log(`  UploadDate: ${f.uploadDate}`);
    });

    if (files.length === 0) {
        console.log('No files found.');
    } else {
        // 2. Try to verify retrieval of the most recent file
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
