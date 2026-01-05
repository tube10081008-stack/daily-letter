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

  const weekdayEmoji = ['🌙', '☀️', '🔥', '🌱', '🌸', '🌊', '✨'][new Date().getDay()];
  const todayEmoji = weekdayEmoji;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>오늘의 편지</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Noto Serif KR', serif; 
      line-height: 2.0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header-art {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 50px 30px;
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
      background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 20px 20px;
      animation: float 20s linear infinite;
    }
    @keyframes float {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }
    .envelope-icon {
      font-size: 60px;
      margin-bottom: 20px;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    .header-title {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 15px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .header-date {
      color: rgba(255,255,255,0.9);
      font-size: 16px;
      font-weight: 300;
    }
    .content {
      padding: 50px 40px;
      background: white;
    }
    .greeting {
      font-size: 24px;
      color: #2d3748;
      margin-bottom: 30px;
      font-weight: 700;
      border-bottom: 2px solid #667eea;
      padding-bottom: 15px;
    }
    .section {
      margin-bottom: 35px;
      padding: 25px;
      border-left: 4px solid #667eea;
      background: linear-gradient(to right, rgba(102, 126, 234, 0.05), transparent);
    }
    .section-icon {
      font-size: 24px;
      margin-right: 10px;
      vertical-align: middle;
    }
    .section-title {
      font-size: 18px;
      color: #667eea;
      margin-bottom: 15px;
      font-weight: 600;
    }
    .section-content {
      font-size: 16px;
      color: #4a5568;
      line-height: 2.0;
    }
    .phrase-block {
      background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
      padding: 30px;
      border-radius: 15px;
      margin: 30px 0;
      position: relative;
      box-shadow: 0 10px 30px rgba(253, 203, 110, 0.3);
    }
    .phrase-block::before {
      content: '"';
      position: absolute;
      top: -10px;
      left: 20px;
      font-size: 80px;
      color: rgba(255, 255, 255, 0.5);
      font-family: Georgia, serif;
    }
    .phrase-content {
      font-size: 17px;
      color: #2d3748;
      font-style: italic;
      margin-bottom: 15px;
      position: relative;
      z-index: 1;
    }
    .phrase-author {
      text-align: right;
      font-size: 14px;
      color: #718096;
      font-weight: 600;
    }
    .signature {
      text-align: center;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #e2e8f0;
      font-size: 18px;
      color: #667eea;
      font-weight: 600;
    }
    .footer {
      background: #f7fafc;
      padding: 40px 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer-link {
      display: inline-block;
      margin: 20px 0;
      padding: 15px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    .footer-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.6);
    }
    .footer-text {
      font-size: 14px;
      color: #718096;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header-art">
      <div class="envelope-icon">${todayEmoji}</div>
      <h1 class="header-title">오늘의 편지가 도착했습니다</h1>
      <p class="header-date">${today}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">💌 ${recipientName}님께</div>

      <!-- Intro -->
      <div class="section">
        <div class="section-title"><span class="section-icon">🌅</span>인사</div>
        <div class="section-content">${letterContent.intro}</div>
      </div>

      <!-- Diary Feedback -->
      <div class="section">
        <div class="section-title"><span class="section-icon">📖</span>일기 피드백</div>
        <div class="section-content">${letterContent.diaryFeedback}</div>
      </div>

      <!-- Phrase Feedback (if exists) -->
      ${letterContent.phraseFeedback ? `
      <div class="phrase-block">
        <div class="phrase-content">${letterContent.phraseFeedback}</div>
      </div>
      ` : ''}

      <!-- Outro -->
      <div class="section">
        <div class="section-title"><span class="section-icon">🌟</span>마무리</div>
        <div class="section-content">${letterContent.outro}</div>
      </div>

      <div class="signature">
        오늘도 당신을 응원합니다<br>
        — Daily Condition Letter
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <a href="https://daily-letter.onrender.com" class="footer-link">
        나의 일기장 바로가기 →
      </a>
      <p class="footer-text">
        Daily Condition Letter © 2025<br>
        매일 아침, AI가 전하는 따뜻한 편지
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
