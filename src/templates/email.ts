import type { EmailData } from '../services/mailer.js';

export function generateEmailHTML(data: EmailData): string {
  const { recipientName, date, letterContent } = data;
  
  // 마침표 뒤에 줄바꿈 추가하는 함수
  const formatText = (text: string) => {
    return text
      .split('. ')
      .filter(s => s.trim())
      .map(sentence => `<p style="margin-bottom: 16px;">${sentence.trim()}.</p>`)
      .join('');
  };

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Condition Letter</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
      background-color: #f5f5f0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header .date {
      margin-top: 10px;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      line-height: 1.8;
      color: #333;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }
    .section-content {
      font-size: 15px;
      color: #555;
    }
    .section-content p {
      margin-bottom: 16px;
      line-height: 1.8;
    }
    .quote-box {
      background: #f9f9f9;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      font-style: italic;
    }
    .quote-box p {
      margin-bottom: 16px;
      line-height: 1.8;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #888;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💌 Daily Condition Letter</h1>
      <div class="date">${date}</div>
    </div>

    <div class="content">
      <div class="greeting">
        안녕하세요, ${recipientName}님
      </div>

      <div class="section">
        <div class="section-content">
          ${formatText(letterContent.intro)}
        </div>
      </div>

      <div class="section">
        <div class="section-title">📔 어제의 당신에게</div>
        <div class="section-content">
          ${formatText(letterContent.diaryFeedback)}
        </div>
      </div>

      <div class="quote-box">
        ${formatText(letterContent.phraseFeedback)}
      </div>

      <div class="section">
        <div class="section-content">
          ${formatText(letterContent.outro)}
        </div>
      </div>
    </div>

    <div class="footer">
      <p>이 편지는 매일 아침 7시에 자동으로 발송됩니다.</p>
      <p>Daily Condition Letter © 2024</p>
    </div>
  </div>
</body>
</html>
  `;
}