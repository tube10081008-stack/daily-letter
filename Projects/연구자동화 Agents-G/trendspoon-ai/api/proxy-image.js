/**
 * TrendSpoon AI — Image Proxy API
 * Fetches an external image and serves it with CORS headers enabled.
 * This is required for html-to-image to bypass tainted canvas issues.
 * 
 * Usage: /api/proxy-image?url=<encoded_image_url>
 */
export default async function handler(request, response) {
    const { url } = request.query;

    if (!url) {
        return response.status(400).json({ error: 'Missing "url" query parameter' });
    }

    try {
        const decodedUrl = decodeURIComponent(url);

        // Fetch the external image with User-Agent
        const imageResponse = await fetch(decodedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

        // Set CORS headers
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        response.setHeader('Content-Type', contentType);

        // Return the image data
        return response.send(buffer);

    } catch (error) {
        console.error('Image Proxy Error:', error);
        return response.status(500).json({ error: 'Failed to proxy image', details: error.message });
    }
}
