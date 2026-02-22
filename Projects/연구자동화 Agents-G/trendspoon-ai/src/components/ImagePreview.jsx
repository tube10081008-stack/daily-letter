/**
 * TrendSpoon AI — 이미지 프리뷰 v3 (8장 캐러셀)
 */
import React, { useState } from 'react';
import CardNewsTemplate from './CardNewsTemplate.jsx';
import { downloadAllAsZip, downloadSingleSlide } from '../services/imageGenerator.js';

const SLIDE_NAMES = ['커버', '뉴스1 헤드라인', '뉴스1 요약', '뉴스2 헤드라인', '뉴스2 요약', '뉴스3 헤드라인', '뉴스3 요약', '아웃트로'];
const TOTAL_SLIDES = 8;

export default function ImagePreview({ content }) {
    const [downloading, setDownloading] = useState(false);
    const [downloadStatus, setDownloadStatus] = useState('');
    const [activeSlide, setActiveSlide] = useState(0);

    if (!content || !content.news) return null;

    const handleDownloadAll = async () => {
        setDownloading(true);
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            await downloadAllAsZip(TOTAL_SLIDES, dateStr, (msg) => setDownloadStatus(msg));
        } catch (err) {
            setDownloadStatus('❌ 다운로드 실패: ' + err.message);
        } finally {
            setDownloading(false);
            setTimeout(() => setDownloadStatus(''), 3000);
        }
    };

    const handleDownloadSingle = async (index) => {
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            await downloadSingleSlide(index, `${dateStr}_${SLIDE_NAMES[index]}`);
        } catch (err) {
            console.error('다운로드 실패:', err);
        }
    };

    return (
        <div className="image-preview">
            <div className="preview-header">
                <h2 className="preview-title">🎨 카드뉴스 미리보기 <span className="preview-count">{TOTAL_SLIDES}장</span></h2>
                <button className={`download-all-btn ${downloading ? 'downloading' : ''}`}
                    onClick={handleDownloadAll} disabled={downloading}>
                    {downloading ? '⏳ 변환 중...' : '📦 전체 ZIP 다운로드'}
                </button>
            </div>

            {downloadStatus && <div className="download-status">{downloadStatus}</div>}

            {/* 슬라이드 탭 — 8장 네비게이션 */}
            <div className="slide-tabs slide-tabs-8">
                {SLIDE_NAMES.map((name, i) => (
                    <button key={i} className={`slide-tab ${activeSlide === i ? 'slide-tab-active' : ''}`}
                        onClick={() => setActiveSlide(i)}>
                        <span className="slide-tab-num">{i + 1}</span>
                        <span className="slide-tab-label">{name}</span>
                    </button>
                ))}
            </div>

            {/* 미리보기 영역 */}
            <div className="slide-preview-area">
                <SlideRenderer content={content} activeSlide={activeSlide} />
            </div>

            {/* 슬라이드 네비게이션 */}
            <div className="slide-nav">
                <button className="slide-nav-btn" disabled={activeSlide === 0}
                    onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}>← 이전</button>
                <span className="slide-nav-info">{activeSlide + 1} / {TOTAL_SLIDES}</span>
                <button className="slide-nav-btn" disabled={activeSlide === TOTAL_SLIDES - 1}
                    onClick={() => setActiveSlide(Math.min(TOTAL_SLIDES - 1, activeSlide + 1))}>다음 →</button>
            </div>

            <button className="download-single-btn" onClick={() => handleDownloadSingle(activeSlide)}>
                ⬇️ "{SLIDE_NAMES[activeSlide]}" 슬라이드 다운로드
            </button>

            {/* 숨겨진 렌더 영역 (이미지 변환용) */}
            <div className="card-render-area">
                <CardNewsTemplate content={content} />
            </div>
        </div>
    );
}

// ─── 슬라이드 미리보기 렌더러 ───
function SlideRenderer({ content, activeSlide }) {
    const accentColors = ['#7C6FF7', '#3DD6A7', '#FF785A'];
    const bgPatterns = [
        'linear-gradient(160deg, #0B0B14 0%, #111128 100%)',
        'linear-gradient(160deg, #0B0B14 0%, #0D1F1B 100%)',
        'linear-gradient(160deg, #0B0B14 0%, #1C120E 100%)',
    ];

    // 0: Cover
    if (activeSlide === 0) {
        return (
            <div className="slide-preview-scaled">
                <div className="card-slide card-cover preview-card">
                    <div className="card-deco-line card-deco-line-top" />
                    <div className="card-deco-line card-deco-line-bottom" />
                    <div className="card-content">
                        <div className="cover-top-bar">
                            <span className="cover-brand-tag">@trend_spoon_ai</span>
                            <span className="cover-date-tag">DAILY AI BRIEFING</span>
                        </div>
                        <div className="cover-center">
                            <div className="cover-daily-hook">
                                {content.coverHook || 'AI가 가져올 격변의 세계'}
                            </div>
                            <h1 className="cover-daily-title">
                                {content.date.replace(/.*?(\d+)월\s*(\d+)일\s*([가-힣])요일.*/, '$1월 $2일($3)')}<br />
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
            </div>
        );
    }

    // 7: Outro
    if (activeSlide === 7) {
        return (
            <div className="slide-preview-scaled">
                <div className="card-slide card-outro-v2 preview-card">
                    <div className="card-content">
                        <div className="outro-v2-top">
                            <div className="outro-v2-icon">🍴</div>
                            <div className="outro-v2-title">오늘 뉴스가<br />도움이 되셨나요?</div>
                        </div>
                        <div className="outro-v2-actions">
                            {[
                                { emoji: '❤️', text: '좋아요', sub: '더 좋은 뉴스를 만들어갈 힘이 돼요' },
                                { emoji: '💬', text: '댓글', sub: '어떤 AI 소식이 궁금하세요?' },
                                { emoji: '🔖', text: '저장', sub: '나중에 참고할 때 유용해요' },
                                { emoji: '📤', text: '친구', sub: 'AI 트렌드를 함께 떠먹어요' },
                            ].map((item, i) => (
                                <div key={i} className="outro-v2-action">
                                    <div className="outro-v2-action-emoji">{item.emoji}</div>
                                    <div className="outro-v2-action-text"><strong>{item.text}</strong>{item.text === '댓글' ? '로 의견을 남겨주세요' : item.text === '좋아요' ? '를 눌러주세요' : item.text === '저장' ? '해서 다시 보세요' : '에게 공유하세요'}</div>
                                    <div className="outro-v2-action-sub">{item.sub}</div>
                                </div>
                            ))}
                        </div>
                        <div className="outro-v2-bottom">
                            <div className="outro-v2-follow-box">
                                <div className="outro-v2-follow-text"><strong>@trend_spoon_ai</strong> 팔로우</div>
                                <div className="outro-v2-follow-sub">매일 아침, AI 트렌드를 떠먹여 드립니다 🥄</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 1-6: News slides (odd = headline, even = summary)
    const newsIndex = Math.floor((activeSlide - 1) / 2); // 0, 0, 1, 1, 2, 2
    const isHeadline = (activeSlide - 1) % 2 === 0;
    const news = content.news[newsIndex];
    const accent = accentColors[newsIndex];

    if (!news) return null;

    if (isHeadline) {
        return (
            <div className="slide-preview-scaled">
                <div className="card-slide card-headline preview-card" style={{ background: bgPatterns[newsIndex] }}>
                    <div className="card-content">
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
                        <div className="v2-category-chip" style={{ borderColor: accent, color: accent }}>{news.category || 'AI'}</div>
                        <div className="headline-center">
                            <h2 className="headline-big">{news.headline}</h2>
                        </div>
                        <div className="headline-bottom">
                            <span className="v2-source">📰 {news.source}</span>
                            <span className="headline-next" style={{ color: accent }}>핵심 정리 →</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Summary slide
    return (
        <div className="slide-preview-scaled">
            <div className="card-slide card-summary preview-card" style={{ background: bgPatterns[newsIndex] }}>
                <div className="card-content">
                    <div className="summary-top">
                        <div className="summary-num-badge" style={{ background: accent }}>
                            {String(news.number).padStart(2, '0')}
                        </div>
                        <span className="summary-section-label">핵심 정리</span>
                    </div>
                    <div className="summary-headline-reminder">{news.headline}</div>
                    <div className="v2-divider" style={{ background: accent }} />
                    <div className="summary-list">
                        {news.summary.map((line, i) => (
                            <div key={i} className="summary-row">
                                <span className="summary-bullet" style={{ background: accent }}>{i + 1}</span>
                                <span className="summary-text">{line}</span>
                            </div>
                        ))}
                    </div>
                    <div className="summary-insight" style={{ borderColor: `${accent}44` }}>
                        <div className="summary-insight-header">
                            <span className="summary-insight-icon">💡</span>
                            <span className="summary-insight-label" style={{ color: accent }}>왜 중요할까?</span>
                        </div>
                        <p className="summary-insight-text">{news.insight}</p>
                    </div>
                    <div className="v2-bottom-row">
                        <span className="v2-source">📰 {news.source}</span>
                        <span className="v2-brand">@trend_spoon_ai</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
