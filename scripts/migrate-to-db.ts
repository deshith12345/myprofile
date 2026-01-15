import { getDb } from '../lib/mongodb'
import { profile } from '../data/profile'
import { projects } from '../data/projects'
import { skills } from '../data/skills'
import { achievements } from '../data/achievements'

// Check for env vars manually if they aren't loaded (for standalone script execution)
if (!process.env.MONGODB_URI) {
    try {
        const fs = require('fs')
        const path = require('path')
        const envPath = path.resolve(__dirname, '../.env.local')
        if (fs.existsSync(envPath)) {
            const env = fs.readFileSync(envPath, 'utf8')
            env.split('\n').forEach((line: string) => {
                const [key, ...value] = line.split('=')
                if (key && value) {
                    process.env[key.trim()] = value.join('=').trim().replace(/^['"]|['"]$/g, '')
                }
            })
        }
    } catch (e) { }
}

async function migrate() {
    try {
        console.log('Starting migration...')
        const db = await getDb()

        // Migrate Profile
        console.log('Migrating profile...')
        await db.collection('config').updateOne(
            { type: 'profile' },
            { $set: { data: profile } },
            { upsert: true }
        )

        // Migrate Projects
        console.log('Migrating projects...')
        await db.collection('config').updateOne(
            { type: 'projects' },
            { $set: { data: projects } },
            { upsert: true }
        )

        // Migrate Skills
        console.log('Migrating skills...')
        await db.collection('config').updateOne(
            { type: 'skills' },
            { $set: { data: skills } },
            { upsert: true }
        )

        // Migrate Achievements
        console.log('Migrating achievements...')
        await db.collection('config').updateOne(
            { type: 'achievements' },
            { $set: { data: achievements } },
            { upsert: true }
        )

        console.log('Migration completed successfully!')
        process.exit(0)
    } catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    }
}

migrate()
