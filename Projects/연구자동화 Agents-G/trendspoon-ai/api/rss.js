/**
 * Vercel Serverless Function — RSS 프록시
 * 프로덕션에서 CORS 없이 RSS 피드를 가져옵니다
 */

const RSS_TARGETS = {
    techcrunch: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    theverge: 'https://www.theverge.com/rss/index.xml',
    arstechnica: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
};

export default async function handler(req, res) {
    const { source } = req.query;

    if (!source || !RSS_TARGETS[source]) {
        return res.status(400).json({
            error: '유효하지 않은 소스입니다. techcrunch, theverge, arstechnica 중 선택하세요.',
        });
    }

    try {
        const response = await fetch(RSS_TARGETS[source], {
            headers: {
                'User-Agent': 'TrendSpoon-AI/1.0 (RSS Reader)',
                'Accept': 'application/rss+xml, application/xml, text/xml',
            },
        });

        if (!response.ok) {
            throw new Error(`RSS 요청 실패: HTTP ${response.status}`);
        }

        const xmlText = await response.text();

        // CORS 허용 + XML 응답
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600'); // 5분 캐시
        return res.status(200).send(xmlText);
    } catch (error) {
        console.error(`RSS fetch error (${source}):`, error.message);
        return res.status(500).json({ error: `RSS 수집 실패: ${error.message}` });
    }
}
