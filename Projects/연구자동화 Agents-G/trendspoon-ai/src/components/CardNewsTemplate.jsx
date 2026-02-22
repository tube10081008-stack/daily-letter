/**
 * TrendSpoon AI — 카드뉴스 템플릿 v3
 * 8장 캐러셀: 커버 + (헤드라인 + 요약) × 3이슈 + 아웃트로
 */
import React from 'react';

// ─── 1. 커버 슬라이드 ───
function CoverSlide({ date, coverHook }) {
    // date 문자열 변환 (예 "2024년 2월 22일 목요일" -> "2월 22일(목)")
    const formattedDate = date.replace(/.*?(\d+)월\s*(\d+)일\s*([가-힣])요일.*/, '$1월 $2일($3)');

    return (
        <div id="card-slide-0" className="card-slide card-cover">
            <div className="card-deco-line card-deco-line-top" />
            <div className="card-deco-line card-deco-line-bottom" />
            <div className="card-content">
                <div className="cover-top-bar">
                    <span className="cover-brand-tag">@trend_spoon_ai</span>
                    <span className="cover-date-tag">DAILY AI BRIEFING</span>
                </div>
                <div className="cover-center">
                    <div className="cover-daily-hook">
                        {coverHook || 'AI가 가져올 격변의 세계'}
                    </div>
                    <h1 className="cover-daily-title">
                        {formattedDate}<br />
                        AI 뉴스 TOP 3
                    </h1>
                </div>
                <div className="cover-bottom">
                    <div className="cover-tags">
                        <span className="cover-tag">생성AI</span>
                        <span className="cover-tag">빅테크</span>
                        <span className="cover-tag">트렌드</span>
                    </div>
                    <div className="cover-swipe">👉 밀어서 확인하기</div>
                </div>
            </div>
        </div>
    );
}

// ─── 2. 뉴스 헤드라인 슬라이드 (Page A) ───
function NewsHeadlineSlide({ news, index, slideId }) {
    const accentColors = ['#7C6FF7', '#3DD6A7', '#FF785A'];
    const accent = accentColors[index] || accentColors[0];
    const bgPatterns = [
        'linear-gradient(160deg, #0B0B14 0%, #111128 100%)',
        'linear-gradient(160deg, #0B0B14 0%, #0D1F1B 100%)',
        'linear-gradient(160deg, #0B0B14 0%, #1C120E 100%)',
    ];

    return (
        <div id={`card-slide-${slideId}`} className="card-slide card-headline" style={{ background: bgPatterns[index] }}>
            <div className="card-content">
                {/* 상단 */}
                <div className="v2-top-row">
                    <div className="v2-number" style={{ color: accent }}>
                        <span className="v2-number-label">NEWS</span>
                        <span className="v2-number-value">{String(news.number).padStart(2, '0')}</span>
                    </div>
                    <div className="v2-page-indicator">
                        {[1, 2, 3].map(n => (
                            <span key={n} className={`v2-dot ${n === news.number ? 'v2-dot-active' : ''}`}
                                style={n === news.number ? { background: accent } : {}} />
                        ))}
                    </div>
                </div>

                {/* 카테고리 */}
                <div className="v2-category-chip" style={{ borderColor: accent, color: accent }}>
                    {news.category || 'AI'}
                </div>

                {/* 큰 헤드라인 — 넉넉한 공간 */}
                <div className="headline-center">
                    <h2 className="headline-big">{news.headline}</h2>
                </div>

                {/* 출처 + 넘김 유도 */}
                <div className="headline-bottom">
                    <span className="v2-source">📰 {news.source}</span>
                    <span className="headline-next" style={{ color: accent }}>핵심 정리 →</span>
                </div>
            </div>
        </div>
    );
}

// ─── 3. 뉴스 요약 + 인사이트 슬라이드 (Page B) ───
function NewsSummarySlide({ news, index, slideId }) {
    const accentColors = ['#7C6FF7', '#3DD6A7', '#FF785A'];
    const accent = accentColors[index] || accentColors[0];
    const bgPatterns = [
        'linear-gradient(160deg, #0B0B14 0%, #111128 100%)',
        'linear-gradient(160deg, #0B0B14 0%, #0D1F1B 100%)',
        'linear-gradient(160deg, #0B0B14 0%, #1C120E 100%)',
    ];

    return (
        <div id={`card-slide-${slideId}`} className="card-slide card-summary" style={{ background: bgPatterns[index] }}>
            <div className="card-content">
                {/* 상단: 뉴스 번호 + 라벨 */}
                <div className="summary-top">
                    <div className="summary-num-badge" style={{ background: accent }}>
                        {String(news.number).padStart(2, '0')}
                    </div>
                    <span className="summary-section-label">핵심 정리</span>
                </div>

                {/* 구분선 */}
                <div className="v2-divider" style={{ background: accent }} />

                {/* 핵심 요약 */}
                <div className="summary-list">
                    {news.summary.map((line, i) => (
                        <div key={i} className="summary-row">
                            <span className="summary-bullet" style={{ background: accent }}>{i + 1}</span>
                            <span className="summary-text">{line}</span>
                        </div>
                    ))}
                </div>

                {/* 인사이트 박스 */}
                <div className="summary-insight" style={{ borderColor: `${accent}44` }}>
                    <div className="summary-insight-header">
                        <span className="summary-insight-icon">💡</span>
                        <span className="summary-insight-label" style={{ color: accent }}>왜 중요할까?</span>
                    </div>
                    <p className="summary-insight-text">{news.insight}</p>
                </div>

                {/* 하단 브랜드 */}
                <div className="v2-bottom-row">
                    <span className="v2-source">📰 {news.source}</span>
                    <span className="v2-brand">@trend_spoon_ai</span>
                </div>
            </div>
        </div>
    );
}

// ─── 8. 아웃트로 슬라이드 ───
function OutroSlide({ slideId }) {
    return (
        <div id={`card-slide-${slideId}`} className="card-slide card-outro-v2">
            <div className="card-content">
                <div className="outro-v2-top">
                    <div className="outro-v2-icon">🍴</div>
                    <div className="outro-v2-title">오늘 뉴스가<br />도움이 되셨나요?</div>
                </div>
                <div className="outro-v2-actions">
                    <div className="outro-v2-action">
                        <div className="outro-v2-action-emoji">❤️</div>
                        <div className="outro-v2-action-text"><strong>좋아요</strong>를 눌러주세요</div>
                        <div className="outro-v2-action-sub">더 좋은 뉴스를 만들어갈 힘이 돼요</div>
                    </div>
                    <div className="outro-v2-action">
                        <div className="outro-v2-action-emoji">💬</div>
                        <div className="outro-v2-action-text"><strong>댓글</strong>로 의견을 남겨주세요</div>
                        <div className="outro-v2-action-sub">어떤 AI 소식이 궁금하세요?</div>
                    </div>
                    <div className="outro-v2-action">
                        <div className="outro-v2-action-emoji">🔖</div>
                        <div className="outro-v2-action-text"><strong>저장</strong>해서 다시 보세요</div>
                        <div className="outro-v2-action-sub">나중에 참고할 때 유용해요</div>
                    </div>
                    <div className="outro-v2-action">
                        <div className="outro-v2-action-emoji">📤</div>
                        <div className="outro-v2-action-text"><strong>친구</strong>에게 공유하세요</div>
                        <div className="outro-v2-action-sub">AI 트렌드를 함께 떠먹어요</div>
                    </div>
                </div>
                <div className="outro-v2-bottom">
                    <div className="outro-v2-follow-box">
                        <div className="outro-v2-follow-text"><strong>@trend_spoon_ai</strong> 팔로우</div>
                        <div className="outro-v2-follow-sub">매일 아침, AI 트렌드를 떠먹여 드립니다 🥄</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── 메인 컴포넌트 ───
export default function CardNewsTemplate({ content }) {
    if (!content || !content.news) return null;

    let slideId = 0;

    return (
        <div className="card-slides-container">
            <CoverSlide date={content.date} coverHook={content.coverHook} />
            {content.news.map((news, i) => (
                <React.Fragment key={i}>
                    <NewsHeadlineSlide news={news} index={i} slideId={i * 2 + 1} />
                    <NewsSummarySlide news={news} index={i} slideId={i * 2 + 2} />
                </React.Fragment>
            ))}
            <OutroSlide slideId={7} />
        </div>
    );
}
