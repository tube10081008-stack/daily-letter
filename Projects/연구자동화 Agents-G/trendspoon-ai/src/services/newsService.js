/**
 * TrendSpoon AI — 뉴스 수집 서비스
 * TechCrunch, The Verge, Ars Technica에서 최신 AI 뉴스를 RSS로 수집
 * 
 * 개발: Vite dev server 프록시 (/api/rss/*)
 * 프로덕션: Vercel Serverless 함수 (/api/rss?source=*)
 */

const isDev = import.meta.env.DEV;

const NEWS_SOURCES = [
    {
        name: 'TechCrunch',
        icon: '🟢',
        key: 'techcrunch',
    },
    {
        name: 'The Verge',
        icon: '🔵',
        key: 'theverge',
    },
    {
        name: 'Ars Technica',
        icon: '🟠',
        key: 'arstechnica',
    },
];

/**
 * 환경에 따라 RSS 요청 URL 결정
 */
function getRssUrl(sourceKey) {
    if (isDev) {
        // 개발: Vite 프록시
        return `/api/rss/${sourceKey}`;
    }
    // 프로덕션: Vercel 서버리스 함수
    return `/api/rss?source=${sourceKey}`;
}

/**
 * RSS XML을 파싱하여 뉴스 아이템 배열로 변환
 */
function parseRSSItems(xmlText, sourceName, sourceIcon) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
        console.warn(`${sourceName} RSS 파싱 오류:`, parseError.textContent);
        return [];
    }

    // RSS 2.0 형식
    let items = xmlDoc.querySelectorAll('item');

    // Atom 형식 fallback
    if (items.length === 0) {
        items = xmlDoc.querySelectorAll('entry');
    }

    const newsItems = [];
    items.forEach((item, index) => {
        if (index >= 10) return; // 소스당 최대 10개

        const title = item.querySelector('title')?.textContent?.trim() || '';
        const link = item.querySelector('link')?.textContent?.trim()
            || item.querySelector('link')?.getAttribute('href') || '';
        const description = item.querySelector('description')?.textContent?.trim()
            || item.querySelector('summary')?.textContent?.trim()
            || item.querySelector('content')?.textContent?.trim() || '';
        const pubDate = item.querySelector('pubDate')?.textContent
            || item.querySelector('published')?.textContent
            || item.querySelector('updated')?.textContent || '';

        // HTML 태그 제거
        const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 300);

        // 이미지 추출 강화 (TechCrunch 등 다양한 워드프레스 RSS 대응)
        let imageUrl = '';

        // 1. <media:thumbnail> 체크
        const mediaThumbnail = item.getElementsByTagName('media:thumbnail');
        if (mediaThumbnail.length > 0 && mediaThumbnail[0].getAttribute('url')) {
            imageUrl = mediaThumbnail[0].getAttribute('url');
        }

        // 2. <media:content> 체크
        if (!imageUrl) {
            const mediaContent = item.getElementsByTagName('media:content');
            if (mediaContent.length > 0) {
                for (let i = 0; i < mediaContent.length; i++) {
                    const url = mediaContent[i].getAttribute('url');
                    const medium = mediaContent[i].getAttribute('medium');
                    if (url && (medium === 'image' || !medium)) { imageUrl = url; break; }
                }
            }
        }

        // 3. 네임스페이스가 엉켰을 경우 대비
        if (!imageUrl) {
            const mediaContentNS = item.getElementsByTagNameNS('*', 'content');
            if (mediaContentNS.length > 0) {
                for (let i = 0; i < mediaContentNS.length; i++) {
                    const url = mediaContentNS[i].getAttribute('url');
                    if (url) { imageUrl = url; break; }
                }
            }
        }

        // 4. <enclosure type="image/*"> 체크
        if (!imageUrl) {
            const enclosure = item.querySelector('enclosure');
            if (enclosure && enclosure.getAttribute('type')?.startsWith('image')) {
                imageUrl = enclosure.getAttribute('url');
            }
        }

        // 5. description 내의 img 태그 src 체크
        if (!imageUrl && description) {
            const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i);
            if (imgMatch) {
                imageUrl = imgMatch[1];
            }
        }

        // 6. content:encoded 내의 img 태그 체크 (보통 본문에 큰 이미지가 있음)
        if (!imageUrl) {
            const contentEncoded = item.getElementsByTagName('content:encoded');
            if (contentEncoded.length > 0) {
                const imgMatch = contentEncoded[0].textContent.match(/<img[^>]+src="([^">]+)"/i);
                if (imgMatch) {
                    imageUrl = imgMatch[1];
                }
            }
        }

        if (title) {
            newsItems.push({
                id: `${sourceName}-${index}`,
                source: sourceName,
                sourceIcon: sourceIcon,
                title,
                link,
                description: cleanDescription,
                pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                imageUrl: imageUrl || '',
            });
        }
    });

    return newsItems;
}

/**
 * 단일 소스에서 뉴스 수집
 */
async function fetchFromSource(source) {
    try {
        const url = getRssUrl(source.key);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const xmlText = await response.text();
        return parseRSSItems(xmlText, source.name, source.icon);
    } catch (error) {
        console.warn(`${source.name} 뉴스 수집 실패:`, error.message);
        return [];
    }
}

/**
 * 모든 소스에서 뉴스 수집 후 날짜순 정렬
 */
export async function fetchAllNews(onProgress) {
    const allNews = [];

    for (let i = 0; i < NEWS_SOURCES.length; i++) {
        const source = NEWS_SOURCES[i];
        onProgress?.(`${source.icon} ${source.name}에서 뉴스 수집 중...`, ((i + 1) / NEWS_SOURCES.length) * 100);

        const items = await fetchFromSource(source);
        allNews.push(...items);

        // 약간의 딜레이로 자연스러운 UX
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // 날짜순 정렬 (최신순)
    allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    onProgress?.('✅ 뉴스 수집 완료!', 100);
    return allNews;
}

export { NEWS_SOURCES };
