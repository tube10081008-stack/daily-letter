/**
 * TrendSpoon AI — 콘텐츠 에디터 컴포넌트
 * AI가 생성한 콘텐츠를 미리보기하고 편집
 * v2: 게시용 통합 캡션 자동 생성
 */
import React, { useState } from 'react';

export default function ContentEditor({ content, onContentUpdate }) {
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editData, setEditData] = useState(null);
    const [copiedCaption, setCopiedCaption] = useState(-1);
    const [editingPostCaption, setEditingPostCaption] = useState(false);
    const [postCaptionDraft, setPostCaptionDraft] = useState('');

    if (!content || !content.news) return null;

    const handleEdit = (index) => {
        setEditingIndex(index);
        setEditData({ ...content.news[index] });
    };

    const handleSave = () => {
        const updated = { ...content };
        updated.news[editingIndex] = editData;
        onContentUpdate(updated);
        setEditingIndex(-1);
        setEditData(null);
    };

    const handleCancel = () => {
        setEditingIndex(-1);
        setEditData(null);
    };

    // ─── 통합 캡션 복사 ───
    const copyPostCaption = async () => {
        const caption = content.postCaption || generateFallbackCaption();
        try {
            await navigator.clipboard.writeText(caption);
            setCopiedCaption(100);
            setTimeout(() => setCopiedCaption(-1), 2000);
        } catch (err) {
            console.error('복사 실패:', err);
        }
    };

    // AI가 postCaption을 생성하지 않았을 경우 fallback
    const generateFallbackCaption = () => {
        const date = content.date || new Date().toLocaleDateString('ko-KR');
        const newsLines = content.news.map((n, i) =>
            `[${i + 1}] ${n.headline}\n${n.summary?.[0] || ''}`
        ).join('\n\n');

        return `🥄 오늘의 AI 뉴스 — ${date}\n\n${newsLines}\n\n💬 어떤 뉴스가 가장 인상 깊으셨나요?\n댓글로 의견 남겨주세요!\n\n—\n📌 매일 아침 AI 트렌드를 떠먹여 드립니다\n👉 @trend_spoon_ai 팔로우\n\n#AI뉴스 #인공지능 #테크트렌드 #AI소식 #트렌드스푼`;
    };

    // ─── 통합 캡션 편집 ───
    const startEditPostCaption = () => {
        setEditingPostCaption(true);
        setPostCaptionDraft(content.postCaption || generateFallbackCaption());
    };

    const savePostCaption = () => {
        const updated = { ...content, postCaption: postCaptionDraft };
        onContentUpdate(updated);
        setEditingPostCaption(false);
    };

    const cancelPostCaption = () => {
        setEditingPostCaption(false);
    };

    const postCaption = content.postCaption || generateFallbackCaption();

    return (
        <div className="content-editor">
            {/* ═══ 게시용 통합 캡션 섹션 (최상단) ═══ */}
            <div className="post-caption-section">
                <div className="post-caption-header">
                    <div className="post-caption-title-row">
                        <span className="post-caption-icon">📱</span>
                        <h2 className="post-caption-title">게시용 캡션</h2>
                        <span className="post-caption-badge">복사해서 바로 붙여넣기</span>
                    </div>
                    <div className="post-caption-actions">
                        {editingPostCaption ? (
                            <>
                                <button className="btn-save" onClick={savePostCaption}>✅ 저장</button>
                                <button className="btn-cancel" onClick={cancelPostCaption}>❌ 취소</button>
                            </>
                        ) : (
                            <button className="btn-edit" onClick={startEditPostCaption}>✏️ 편집</button>
                        )}
                        <button
                            className={`btn-copy-main ${copiedCaption === 100 ? 'btn-copied' : ''}`}
                            onClick={copyPostCaption}
                        >
                            {copiedCaption === 100 ? '✅ 복사됨!' : '📋 캡션 복사'}
                        </button>
                    </div>
                </div>

                {editingPostCaption ? (
                    <textarea
                        className="post-caption-edit"
                        value={postCaptionDraft}
                        onChange={e => setPostCaptionDraft(e.target.value)}
                        rows={16}
                    />
                ) : (
                    <div className="post-caption-preview">
                        {postCaption.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            {/* ═══ 뉴스 카드 상세 편집 ═══ */}
            <div className="editor-header">
                <h2 className="editor-title">📝 뉴스 상세 편집</h2>
            </div>

            {content.news.map((news, i) => (
                <div key={i} className="news-card-editor">
                    <div className="news-card-header">
                        <div className="news-card-number">{String(news.number).padStart(2, '0')}</div>
                        <div className="news-card-category">{news.category}</div>
                        <div className="news-card-actions">
                            {editingIndex === i ? (
                                <>
                                    <button className="btn-save" onClick={handleSave}>✅ 저장</button>
                                    <button className="btn-cancel" onClick={handleCancel}>❌ 취소</button>
                                </>
                            ) : (
                                <button className="btn-edit" onClick={() => handleEdit(i)}>✏️ 편집</button>
                            )}
                        </div>
                    </div>

                    {editingIndex === i ? (
                        /* 편집 모드 */
                        <div className="edit-form">
                            <label>
                                <span>헤드라인</span>
                                <input
                                    type="text"
                                    value={editData.headline}
                                    onChange={e => setEditData({ ...editData, headline: e.target.value })}
                                />
                            </label>
                            {editData.summary.map((line, j) => (
                                <label key={j}>
                                    <span>핵심 {j + 1}</span>
                                    <input
                                        type="text"
                                        value={line}
                                        onChange={e => {
                                            const s = [...editData.summary];
                                            s[j] = e.target.value;
                                            setEditData({ ...editData, summary: s });
                                        }}
                                    />
                                </label>
                            ))}
                            <label>
                                <span>인사이트</span>
                                <input
                                    type="text"
                                    value={editData.insight}
                                    onChange={e => setEditData({ ...editData, insight: e.target.value })}
                                />
                            </label>
                        </div>
                    ) : (
                        /* 미리보기 모드 */
                        <div className="preview-content">
                            <h3 className="preview-headline">{news.headline}</h3>
                            <div className="preview-summary">
                                {news.summary.map((line, j) => (
                                    <div key={j} className="preview-summary-line">
                                        <span className="preview-bullet">{j + 1}</span> {line}
                                    </div>
                                ))}
                            </div>
                            <div className="preview-insight">💡 {news.insight}</div>
                            <div className="preview-source">📰 {news.source}</div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
