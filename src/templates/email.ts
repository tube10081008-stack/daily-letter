export function generateEmailHTML(
  recipientName: string,
  letterContent: {
    intro: string;
    diaryFeedback: string;
    phraseFeedback?: string;
    outro: string;
  }
): string {
  const today = new Date();
  const dateStr = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  
  const weekday = today.getDay();
  const weekdayEmojis = ['🌙', '☀️', '🔥', '🌱', '🌸', '🌊', '✨'];
  const todayEmoji = weekdayEmojis[weekday];

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>오늘의 편지</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Noto Serif KR', -apple-system, 'Malgun Gothic', serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      line-height: 1.8;
    }
    
    .email-wrapper {
      max-width: 650px;
      margin: 0 auto;
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    }
    
    .header-art {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 60px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header-art::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 4s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    
    .header-content {
      position: relative;
      z-index: 1;
    }
    
    .envelope-icon {
      font-size: 64px;
      margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .header-title {
      font-size: 32px;
      font-weight: 700;
      color: white;
      margin-bottom: 12px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    
    .header-date {
      font-size: 16px;
      color: rgba(255,255,255,0.95);
      font-weight: 400;
    }
    
    .letter-body {
      padding: 50px 40px;
      background: #fff;
    }
    
    .greeting {
      font-size: 26px;
      font-weight: 700;
      color: #667eea;
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }
    
    .section {
      margin-bottom: 35px;
      font-size: 17px;
      color: #333;
      line-height: 2.0;
      text-align: justify;
    }
    
    .section-icon {
      display: inline-block;
      font-size: 24px;
      margin-right: 8px;
      vertical-align: middle;
    }
    
    .quote-section {
      background: linear-gradient(135deg, #fef5e7 0%, #fdebd0 100%);
      padding: 30px;
      border-radius: 15px;
      border-left: 5px solid #f39c12;
      margin: 35px 0;
      box-shadow: 0 4px 15px rgba(243, 156, 18, 0.15);
      position: relative;
    }
    
    .quote-section::before {
      content: '"';
      position: absolute;
      top: -10px;
      left: 20px;
      font-size: 80px;
      color: rgba(243, 156, 18, 0.2);
      font-family: Georgia, serif;
    }
    
    .quote-section .section {
      margin-bottom: 0;
      color: #744210;
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e0e0e0, transparent);
      margin: 40px 0;
    }
    
    .footer {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      padding: 40px;
      text-align: center;
      border-top: 3px solid #e2e8f0;
    }
    
    .footer-icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
    
    .footer-text {
      color: #718096;
      font-size: 15px;
      line-height: 1.8;
      margin-bottom: 12px;
    }
    
    .footer-link {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      text-decoration: none;
      border-radius: 25px;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      transition: transform 0.2s;
    }
    
    .footer-link:hover {
      transform: translateY(-2px);
    }
    
    .signature {
      margin-top: 50px;
      text-align: right;
      font-style: italic;
      color: #9ca3af;
      font-size: 15px;
    }
    
    /* 모바일 반응형 */
    @media (max-width: 600px) {
      body { padding: 20px 10px; }
      .header-art { padding: 40px 20px; }
      .header-title { font-size: 24px; }
      .letter-body { padding: 30px 20px; }
      .greeting { font-size: 22px; }
      .section { font-size: 16px; }
      .quote-section { padding: 20px; }
    }
  </style>
</head>
<body>
  
  <div class="email-wrapper">
    
    <!-- 헤더 -->
    <div class="header-art">
      <div class="header-content">
        <div class="envelope-icon">${todayEmoji}</div>
        <h1 class="header-title">오늘의 편지가 도착했습니다</h1>
        <p class="header-date">${dateStr}</p>
      </div>
    </div>
    
    <!-- 편지 본문 -->
    <div class="letter-body">
      
      <!-- 인사말 -->
      <div class="greeting">
        ${recipientName}님께 💌
      </div>
      
      <!-- 인트로 -->
      <div class="section">
        <span class="section-icon">🌅</span>
        ${letterContent.intro}
      </div>
      
      <div class="divider"></div>
      
      <!-- 일기 피드백 -->
      <div class="section">
        <span class="section-icon">📖</span>
        ${letterContent.diaryFeedback}
      </div>
      
      ${letterContent.phraseFeedback ? `
      <div class="divider"></div>
      
      <!-- 명언 피드백 -->
      <div class="quote-section">
        <div class="section">
          <span class="section-icon">✨</span>
          ${letterContent.phraseFeedback}
        </div>
      </div>
      ` : ''}
      
      <div class="divider"></div>
      
      <!-- 아웃트로 -->
      <div class="section">
        <span class="section-icon">🌟</span>
        ${letterContent.outro}
      </div>
      
      <!-- 서명 -->
      <div class="signature">
        오늘도 당신을 응원합니다<br>
        — Daily Condition Letter
      </div>
      
    </div>
    
    <!-- 푸터 -->
    <div class="footer">
      <div class="footer-icon">🎨</div>
      <p class="footer-text">
        이 편지는 AI가 당신의 일기를 바탕으로<br>
        정성껏 작성한 특별한 메시지입니다
      </p>
      <p class="footer-text">
        매일 아침 7시, 따뜻한 편지로<br>
        새로운 하루를 시작하세요
      </p>
      <a href="https://daily-letter.onrender.com" class="footer-link">
        나의 일기장 바로가기 →
      </a>
      <p class="footer-text" style="margin-top: 30px; font-size: 13px;">
        Daily Condition Letter © 2025
      </p>
    </div>
    
  </div>
  
</body>
</html>
  `.trim();
}
