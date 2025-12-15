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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      line-height: 1.8;
    }
    
    .email-container {
      max-width: 800px; /* 🆕 기존보다 넓게 (600px → 800px) */
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .header p {
      font-size: 16px;
      opacity: 0.95;
    }
    
    .content {
      padding: 50px 60px; /* 🆕 좌우 여백 증가 (40px → 60px) */
      color: #2d3748;
    }
    
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 30px;
    }
    
    .section {
      margin-bottom: 40px;
      font-size: 16px;
      color: #4a5568;
    }
    
    .section p {
      margin-bottom: 16px;
      line-height: 2.0; /* 🆕 줄간격 증가 */
    }
    
    /* 🆕 일반 본문 스타일 (콜아웃 아님) */
    .text-block {
      background: #f7fafc;
      padding: 24px;
      border-radius: 12px;
      border-left: 4px solid #e2e8f0;
      margin: 20px 0;
    }
    
    /* 🆕 강조용 콜아웃 (중간에 한 번만 사용) */
    .callout {
      background: linear-gradient(135deg, #fef5e7 0%, #fdebd0 100%);
      padding: 24px;
      border-radius: 12px;
      border-left: 4px solid #f39c12;
      margin: 30px 0;
      box-shadow: 0 2px 8px rgba(243, 156, 18, 0.1);
    }
    
    .callout strong {
      color: #e67e22;
      font-weight: 700;
    }
    
    .footer {
      background: #f7fafc;
      padding: 30px;
      text-align: center;
      color: #718096;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
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
      
      <!-- 일기 피드백 (일반 본문) -->
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