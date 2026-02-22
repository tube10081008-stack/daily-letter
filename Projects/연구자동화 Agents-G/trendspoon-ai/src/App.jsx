/**
 * TrendSpoon AI — 메인 앱 컴포넌트
 * 전체 워크플로우를 오케스트레이션하는 루트 컴포넌트
 */
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.jsx';
import ContentEditor from './components/ContentEditor.jsx';
import ImagePreview from './components/ImagePreview.jsx';
import { initializeAI } from './services/aiService.js';

const DEFAULT_API_KEY = 'AIzaSyCKxzbDRGYJzffCQWtgruC174rbhig-BwA';

export default function App() {
    const [apiKey, setApiKey] = useState('');
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [isApiReady, setIsApiReady] = useState(false);
    const [content, setContent] = useState(null);
    const [collectedNews, setCollectedNews] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showApiModal, setShowApiModal] = useState(false);

    // 초기 API 키 설정
    useEffect(() => {
        const savedKey = localStorage.getItem('trendspoon_api_key') || DEFAULT_API_KEY;
        if (savedKey) {
            setApiKey(savedKey);
            initializeAI(savedKey);
            setIsApiReady(true);
        }
    }, []);

    const handleApiKeySave = () => {
        const key = apiKeyInput.trim();
        if (key) {
            setApiKey(key);
            localStorage.setItem('trendspoon_api_key', key);
            initializeAI(key);
            setIsApiReady(true);
            setShowApiModal(false);
        }
    };

    const handleContentGenerated = (generatedContent) => {
        setContent(generatedContent);
        setActiveTab('editor');
    };

    const handleContentUpdate = (updatedContent) => {
        setContent(updatedContent);
    };

    return (
        <div className="app">
            {/* 네비게이션 바 */}
            <nav className="navbar">
                <div className="navbar-brand">
                    <span className="navbar-logo">🍴</span>
                    <span className="navbar-name">TrendSpoon AI</span>
                </div>
                <div className="navbar-tabs">
                    <button
                        className={`nav-tab ${activeTab === 'dashboard' ? 'nav-tab-active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        🏠 대시보드
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'editor' ? 'nav-tab-active' : ''}`}
                        onClick={() => setActiveTab('editor')}
                        disabled={!content}
                    >
                        📝 콘텐츠
                    </button>
                    <button
                        className={`nav-tab ${activeTab === 'preview' ? 'nav-tab-active' : ''}`}
                        onClick={() => setActiveTab('preview')}
                        disabled={!content}
                    >
                        🎨 카드뉴스
                    </button>
                </div>
                <div className="navbar-actions">
                    <button className="api-key-btn" onClick={() => setShowApiModal(true)}>
                        {isApiReady ? '🔑 API 연결됨' : '🔐 API 키 설정'}
                    </button>
                </div>
            </nav>

            {/* 메인 컨텐츠 */}
            <main className="main-content">
                {activeTab === 'dashboard' && (
                    <Dashboard
                        onContentGenerated={handleContentGenerated}
                        onNewsCollected={setCollectedNews}
                    />
                )}
                {activeTab === 'editor' && (
                    <ContentEditor
                        content={content}
                        onContentUpdate={handleContentUpdate}
                    />
                )}
                {activeTab === 'preview' && (
                    <ImagePreview content={content} />
                )}
            </main>

            {/* 수집된 뉴스 사이드바 */}
            {collectedNews.length > 0 && activeTab === 'dashboard' && (
                <aside className="news-sidebar">
                    <h3 className="sidebar-title">📰 수집된 뉴스 ({collectedNews.length}건)</h3>
                    <div className="news-list">
                        {collectedNews.slice(0, 15).map((item, i) => (
                            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="news-item-link">
                                <div className="news-item">
                                    <span className="news-item-source">{item.sourceIcon} {item.source}</span>
                                    <span className="news-item-title">{item.title}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </aside>
            )}

            {/* API 키 모달 */}
            {showApiModal && (
                <div className="modal-overlay" onClick={() => setShowApiModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">🔑 Gemini API 키 설정</h2>
                        <p className="modal-desc">
                            Google AI Studio에서 발급받은 API 키를 입력하세요.
                            <br />
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                                → API 키 발급받기
                            </a>
                        </p>
                        <input
                            type="password"
                            className="modal-input"
                            placeholder="AIza..."
                            value={apiKeyInput}
                            onChange={e => setApiKeyInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleApiKeySave()}
                        />
                        <div className="modal-actions">
                            <button className="modal-btn-cancel" onClick={() => setShowApiModal(false)}>취소</button>
                            <button className="modal-btn-save" onClick={handleApiKeySave}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 푸터 */}
            <footer className="footer">
                <p>Made with 🍴 by TrendSpoon AI — Powered by Gemini</p>
            </footer>
        </div>
    );
}
