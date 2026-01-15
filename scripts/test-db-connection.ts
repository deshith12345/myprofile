import { getDb } from '../lib/mongodb'

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

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...')
        const db = await getDb()
        const collections = await db.listCollections().toArray()
        console.log('Successfully connected to MongoDB!')
        console.log('Available collections:', collections.map(c => c.name))
        process.exit(0)
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error)
        process.exit(1)
    }
}

testConnection()
