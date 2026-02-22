/**
 * TrendSpoon AI — 대시보드 컴포넌트
 * 3단계 워크플로우를 관리하는 메인 대시보드
 */
import React, { useState } from 'react';
import { fetchAllNews } from '../services/newsService.js';
import { generateNewsContent } from '../services/aiService.js';

const STEPS = [
    { id: 'fetch', label: '뉴스 수집', icon: '🌐', description: 'TechCrunch, Verge, Ars Technica' },
    { id: 'generate', label: 'AI 콘텐츠 생성', icon: '🤖', description: 'Gemini가 TOP 3 선별' },
    { id: 'image', label: '카드뉴스 생성', icon: '🎨', description: '이미지 자동 변환' },
];

export default function Dashboard({ onContentGenerated, onNewsCollected }) {
    const [currentStep, setCurrentStep] = useState(-1);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState('');
    const [newsCount, setNewsCount] = useState(0);

    const handleGenerate = async () => {
        setIsRunning(true);
        setError('');

        try {
            // Step 1: 뉴스 수집
            setCurrentStep(0);
            const news = await fetchAllNews((msg, pct) => {
                setStatus(msg);
                setProgress(pct);
            });
            setNewsCount(news.length);
            onNewsCollected?.(news);

            if (news.length === 0) {
                throw new Error('수집된 뉴스가 없습니다. 네트워크를 확인해주세요.');
            }

            // Step 2: AI 콘텐츠 생성
            setCurrentStep(1);
            setProgress(0);
            const content = await generateNewsContent(news, (msg, pct) => {
                setStatus(msg);
                setProgress(pct);
            });

            // Step 3: 카드뉴스 준비
            setCurrentStep(2);
            setStatus('🎨 카드뉴스 이미지를 준비합니다...');
            setProgress(100);

            onContentGenerated?.(content);
            setStatus('🎉 모든 과정이 완료되었습니다!');

        } catch (err) {
            setError(err.message);
            setStatus('');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="dashboard">
            {/* 헤더 */}
            <div className="dashboard-header">
                <div className="dashboard-emoji">🍴</div>
                <h1 className="dashboard-title">TrendSpoon AI</h1>
                <p className="dashboard-subtitle">버튼 하나로 인스타그램 AI 뉴스레터를 자동 생성합니다</p>
            </div>

            {/* 스텝 인디케이터 */}
            <div className="steps-container">
                {STEPS.map((step, i) => (
                    <div key={step.id} className={`step ${i < currentStep ? 'step-done' : i === currentStep ? 'step-active' : ''
                        }`}>
                        <div className="step-icon-wrap">
                            <div className="step-icon">
                                {i < currentStep ? '✅' : step.icon}
                            </div>
                            {i < STEPS.length - 1 && <div className="step-connector" />}
                        </div>
                        <div className="step-info">
                            <div className="step-label">{step.label}</div>
                            <div className="step-desc">{step.description}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 진행 상태 */}
            {isRunning && (
                <div className="progress-section">
                    <div className="progress-status">{status}</div>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            {/* 에러 */}
            {error && (
                <div className="error-box">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* 결과 요약 */}
            {newsCount > 0 && !isRunning && currentStep >= 0 && (
                <div className="result-summary">
                    📊 <strong>{newsCount}개</strong> 기사에서 <strong>TOP 3</strong> AI 뉴스를 선별했습니다
                </div>
            )}

            {/* 생성 버튼 */}
            <button
                className={`generate-btn ${isRunning ? 'generate-btn-running' : ''}`}
                onClick={handleGenerate}
                disabled={isRunning}
            >
                {isRunning ? (
                    <>
                        <span className="btn-spinner" />
                        생성 중...
                    </>
                ) : (
                    <>🚀 오늘의 뉴스레터 생성</>
                )}
            </button>
        </div>
    );
}
