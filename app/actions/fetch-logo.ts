'use server'

export async function fetchLogoAction(query: string): Promise<{ success: boolean; url?: string; message?: string }> {
    try {
        const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY
        const GOOGLE_CX = process.env.GOOGLE_SEARCH_ENGINE_ID

        if (!GOOGLE_API_KEY || !GOOGLE_CX) {
            return { success: false, message: 'API keys are missing' }
        }

        const res = await fetch(
            `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
                query + ' logo transparent png'
            )}&cx=${GOOGLE_CX}&key=${GOOGLE_API_KEY}&searchType=image&num=1`
        )

        const data = await res.json()

        if (data.error) {
            console.error('Google API Error:', data.error)
            return { success: false, message: `Google API Error: ${data.error.message}` }
        }

        if (data.items && data.items.length > 0) {
            return { success: true, url: data.items[0].link }
        } else {
            return { success: false, message: 'No logo found for this query. Try a different name.' }
        }
    } catch (error: any) {
        console.error('Error fetching logo:', error)
        return { success: false, message: `Server Error: ${error.message}` }
    }
}
