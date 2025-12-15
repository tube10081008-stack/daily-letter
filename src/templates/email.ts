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
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 10px;
    }
    .section-content {
      font-size: 15px;
      line-height: 1.8;
      color: #555;
    }
    .footer {
      background: #f9f9f9;
      padding: 20px;
      text-align: center;
      color: #999;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💌 오늘의 편지</h1>
      <p>${dateStr}</p>
    </div>
    <div class="content">
      <div class="greeting">
        ${recipientName}님께,
      </div>

      <div class="section">
        <div class="section-title">📝 일기에 대한 이야기</div>
        <div class="section-content">
          ${letterContent.intro || '오늘도 소중한 하루를 보내셨네요.'}
        </div>
      </div>

      <div class="section">
        <div class="section-title">💭 일기 피드백</div>
        <div class="section-content">
          ${letterContent.diaryFeedback || '당신의 이야기를 들려주셔서 감사합니다.'}
        </div>
      </div>

      <div class="section">
        <div class="section-title">✨ 오늘의 명언</div>
        <div class="section-content">
          ${letterContent.phraseFeedback || '오늘도 힘내세요!'}
        </div>
      </div>

      <div class="section">
        <div class="section-content">
          ${letterContent.outro || '내일도 좋은 하루 되세요.'}
        </div>
      </div>
    </div>
    <div class="footer">
      Daily Condition Letter | 매일 오전 7시 발송
    </div>
  </div>
</body>
</html>
  `;
}