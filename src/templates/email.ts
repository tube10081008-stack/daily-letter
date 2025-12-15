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
      padding: 20px 0;
      line-height: 1.8;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 0;
      overflow: hidden;
      box-shadow: none;
    }
    
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
      padding: 32px 20px;
      text-align: center;
    }
    
    @media (min-width: 640px) {
      .header {
        padding: 40px 30px;
      }
    }
    
    .header h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    @media (min-width: 640px) {
      .header h1 {
        font-size: 28px;
      }
    }
    
    .header p {
      font-size: 14px;
      opacity: 0.95;
    }
    
    @media (min-width: 640px) {
      .header p {
        font-size: 16px;
      }
    }
    
    .content {
      padding: 32px 24px;
      color: #2d3748;
    }
    
    @media (min-width: 640px) {
      .content {
        padding: 50px 60px;
      }
    }
    
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 24px;
      text-align: center;
    }
    
    @media (min-width: 640px) {
      .greeting {
        font-size: 20px;
        margin-bottom: 30px;
      }
    }
    
    .section {
      margin-bottom: 32px;
      font-size: 15px;
      color: #4a5568;
      text-align: left;
      line-height: 2.0;
    }
    
    @media (min-width: 640px) {
      .section {
        font-size: 16px;
        margin-bottom: 40px;
      }
    }
    
    .section p {
      margin-bottom: 0;
    }
    
    .text-block {
      background: transparent;
      padding: 0;
      border: none;
      margin: 0;
    }
    
    .callout {
      background: linear-gradient(135deg, #fef5e7 0%, #fdebd0 100%);
      padding: 20px;
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
      padding: 24px 20px;
      text-align: center;
      color: #718096;
      font-size: 13px;
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
  <!-- Gmail/Outlook용 모던 버전 -->
  <div class="email-container">
    <div class="header">
      <h1>💌 오늘의 편지가 도착했습니다</h1>
      <p>${today}</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        ${recipientName}님, 안녕하세요! 👋
      </div>
      
      <div class="section">
        ${letterContent.intro}
      </div>
      
      <div class="section">
        <div class="text-block">
          ${letterContent.diaryFeedback}
        </div>
      </div>
      
      ${letterContent.phraseFeedback ? `
      <div class="section">
        <div class="callout">
          ${letterContent.phraseFeedback}
        </div>
      </div>
      ` : ''}
      
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
  
  <!-- 네이버/다음용 Fallback (Inline CSS) -->
  <!--[if mso]>
  <style>
    .email-container { display: none !important; }
  </style>
  <![endif]-->
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; display: none;">
    <tr>
      <td style="background-color: #667eea; color: #ffffff; padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700;">💌 오늘의 편지가 도착했습니다</h1>
        <p style="margin: 0; font-size: 14px;">${today}</p>
      </td>
    </tr>
    
    <tr>
      <td style="padding: 32px 24px 0 24px;">
        <div style="font-size: 18px; font-weight: 600; color: #667eea; margin-bottom: 24px; text-align: center;">
          ${recipientName}님, 안녕하세요! 👋
        </div>
      </td>
    </tr>
    
    <tr>
      <td style="padding: 0 24px 32px 24px; font-size: 15px; color: #4a5568; line-height: 2.0;">
        ${letterContent.intro}
      </td>
    </tr>
    
    <tr>
      <td style="padding: 0 24px 32px 24px; font-size: 15px; color: #4a5568; line-height: 2.0;">
        ${letterContent.diaryFeedback}
      </td>
    </tr>
    
    ${letterContent.phraseFeedback ? `
    <tr>
      <td style="padding: 0 24px 32px 24px;">
        <div style="background-color: #fef5e7; padding: 20px; border-radius: 12px; border-left: 4px solid #f39c12; font-size: 15px; color: #4a5568; line-height: 2.0;">
          ${letterContent.phraseFeedback}
        </div>
      </td>
    </tr>
    ` : ''}
    
    <tr>
      <td style="padding: 0 24px 32px 24px; font-size: 15px; color: #4a5568; line-height: 2.0;">
        ${letterContent.outro}
      </td>
    </tr>
    
    <tr>
      <td style="background-color: #f7fafc; padding: 24px 20px; text-align: center; color: #718096; font-size: 13px; border-top: 1px solid #e2e8f0;">
        <p style="margin: 8px 0;">이 편지는 AI가 당신의 일기를 바탕으로 작성했습니다.</p>
        <p style="margin: 8px 0;">매일 아침 7시, 따뜻한 편지로 하루를 시작하세요.</p>
        <p style="margin: 8px 0;">
          <a href="https://daily-letter.onrender.com" style="color: #667eea; text-decoration: none; font-weight: 600;">Daily Condition Letter</a>
        </p>
      </td>
    </tr>
  </table>
  
  <script>
    // 네이버/다음 감지 시 Fallback 활성화
    if (navigator.userAgent.indexOf('Naver') > -1 || navigator.userAgent.indexOf('Daum') > -1) {
      document.querySelector('.email-container').style.display = 'none';
      document.querySelector('table').style.display = 'table';
    }
  </script>
  
</body>
</html>
  `.trim();
}