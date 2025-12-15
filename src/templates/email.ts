export function generateEmailHTML(recipientName: string, letterContent: any): string {
  const today = new Date();
  const dateStr = today.toLocaleDateString('ko-KR', { 
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
    body {
      font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 40px 20px;
      line-height: 1.8;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header .emoji {
      font-size: 40px;
      margin-bottom: 10px;
    }
    .header p {
      margin: 0;
      opacity: 0.95;
      font-size: 16px;
    }
    .content {
      padding: 40px 35px;
    }
    .greeting {
      font-size: 20px;
      color: #333;
      margin-bottom: 30px;
      font-weight: 600;
      border-left: 4px solid #667eea;
      padding-left: 15px;
    }
    .section {
      margin-bottom: 35px;
      background: #f8f9ff;
      padding: 25px;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }
    .section-title .icon {
      font-size: 24px;
      margin-right: 8px;
    }
    .section-content {
      font-size: 16px;
      line-height: 2;
      color: #444;
      white-space: pre-line;
    }
    .quote {
      background: white;
      padding: 20px;
      border-radius: 10px;
      border-left: 4px solid #764ba2;
      margin: 20px 0;
      font-style: italic;
      color: #555;
    }
    .footer {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 30px;
      text-align: center;
      color: #666;
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
    }
    .footer .copyright {
      margin-top: 15px;
      font-size: 13px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">💌</div>
      <h1>Daily Condition Letter</h1>
      <p>${dateStr}</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        ${recipientName}님께,
      </div>

      <div class="section">
        <div class="section-title">
          <span class="icon">🌅</span> 오늘의 이야기
        </div>
        <div class="section-content">${letterContent.intro || '오늘도 소중한 하루를 보내셨네요.'}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="icon">📝</span> 일기에 대한 이야기
        </div>
        <div class="section-content">${letterContent.diaryFeedback || '당신의 이야기를 들려주셔서 감사합니다.'}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="icon">✨</span> 오늘의 문장
        </div>
        <div class="section-content">${letterContent.phraseFeedback || '오늘도 힘내세요!'}</div>
      </div>

      <div class="quote">
        ${letterContent.outro || '내일도 좋은 하루 되세요.'}
      </div>
    </div>
    
    <div class="footer">
      <p>💌 매일 오전 7시, 당신을 위한 편지가 도착합니다</p>
      <p class="copyright">Daily Condition Letter © 2025</p>
    </div>
  </div>
</body>
</html>
  `;
}