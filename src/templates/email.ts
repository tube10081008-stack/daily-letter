export function generateEmailHTML(
  recipientName: string,
  letterContent: {
    intro: string;
    diaryFeedback: string;
    phraseFeedback?: string;
    outro: string;
  }
): string {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>오늘의 편지</title>
  <style>
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px 0; /* 🆕 상하 패딩만 */
      line-height: 1.8;
    }
    
    .email-container {
      max-width: 600px; /* 🆕 모바일 최적화 (800px → 600px) */
      margin: 0 auto;
      background: white;
      border-radius: 0; /* 🆕 모바일에서는 둥근 모서리 제거 */
      overflow: hidden;
      box-shadow: none; /* 🆕 그림자 제거 */
    }
    
    /* 🆕 데스크톱에서만 둥근 모서리 + 그림자 */
    @media (min-width: 640px) {
      body {
        padding: 40px 20px;
      }
      .email-container {
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px 20px; /* 🆕 모바일 패딩 줄임 */
      text-align: center;
    }
    
    @media (min-width: 640px) {
      .header {
        padding: 40px 30px;
      }
    }
    
    .header h1 {
      font-size: 24px; /* 🆕 모바일 폰트 크기 줄임 */
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    @media (min-width: 640px) {
      .header h1 {
        font-size: 28px;
      }
    }
    
    .header p {
      font-size: 14px; /* 🆕 모바일 폰트 크기 */
      opacity: 0.95;
    }
    
    @media (min-width: 640px) {
      .header p {
        font-size: 16px;
      }
    }
    
    .content {
      padding: 32px 24px; /* 🆕 모바일 패딩 최적화 */
      color: #2d3748;
    }
    
    @media (min-width: 640px) {
      .content {
        padding: 50px 60px;
      }
    }
    
    .greeting {
      font-size: 18px; /* 🆕 모바일 폰트 크기 */
      font-weight: 600;
      color: #667eea;
      margin-bottom: 24px;
      text-align: center; /* 🆕 중앙 정렬 */
    }
    
    @media (min-width: 640px) {
      .greeting {
        font-size: 20px;
        margin-bottom: 30px;
      }
    }
    
    .section {
      margin-bottom: 32px; /* 🆕 섹션 간 간격 */
      font-size: 15px; /* 🆕 모바일 폰트 크기 */
      color: #4a5568;
      text-align: left; /* 🆕 본문은 왼쪽 정렬 */
      line-height: 2.0; /* 🆕 줄간격 증가 */
    }
    
    @media (min-width: 640px) {
      .section {
        font-size: 16px;
        margin-bottom: 40px;
      }
    }
    
    /* 🆕 <br><br> 처리를 위한 자연스러운 단락 간격 */
    .section p {
      margin-bottom: 0;
    }
    
    /* 🆕 일반 본문 스타일 (배경 제거, 단순화) */
    .text-block {
      background: transparent; /* 🆕 배경 제거 */
      padding: 0; /* 🆕 패딩 제거 */
      border: none; /* 🆕 테두리 제거 */
      margin: 0;
    }
    
    /* 🆕 강조용 콜아웃 (명언에만 사용) */
    .callout {
      background: linear-gradient(135deg, #fef5e7 0%, #fdebd0 100%);
      padding: 20px; /* 🆕 모바일 패딩 줄임 */
      border-radius: 12px;
      border-left: 4px solid #f39c12;
      margin: 24px 0;
      box-shadow: 0 2px 8px rgba(243, 156, 18, 0.1);
    }
    
    @media (min-width: 640px) {
      .callout {
        padding: 24px;
        margin: 30px 0;
      }
    }
    
    .callout strong {
      color: #e67e22;
      font-weight: 700;
    }
    
    .footer {
      background: #f7fafc;
      padding: 24px 20px; /* 🆕 모바일 패딩 */
      text-align: center;
      color: #718096;
      font-size: 13px; /* 🆕 모바일 폰트 크기 */
      border-top: 1px solid #e2e8f0;
    }
    
    @media (min-width: 640px) {
      .footer {
        padding: 30px;
        font-size: 14px;
      }
    }
    
    .footer p {
      margin: 8px 0;
    }
    
    .footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>💌 오늘의 편지가 도착했습니다</h1>
      <p>${today}</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        ${recipientName}님, 안녕하세요! 👋
      </div>
      
      <!-- 인트로 -->
      <div class="section">
        ${letterContent.intro}
      </div>
      
      <!-- 일기 피드백 (배경 제거, 단순한 텍스트) -->
      <div class="section">
        <div class="text-block">
          ${letterContent.diaryFeedback}
        </div>
      </div>
      
      <!-- 명언 피드백 (강조 콜아웃 - 중간에 한 번만) -->
      ${letterContent.phraseFeedback ? `
      <div class="section">
        <div class="callout">
          ${letterContent.phraseFeedback}
        </div>
      </div>
      ` : ''}
      
      <!-- 아웃트로 -->
      <div class="section">
        ${letterContent.outro}
      </div>
    </div>
    
    <div class="footer">
      <p>이 편지는 AI가 당신의 일기를 바탕으로 작성했습니다.</p>
      <p>매일 아침 7시, 따뜻한 편지로 하루를 시작하세요.</p>
      <p><a href="https://daily-letter.onrender.com">Daily Condition Letter</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}