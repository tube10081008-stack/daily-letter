import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { CREEDS, getFullCreedText } from "@/lib/creeds";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

export async function GET(req: NextRequest) {
  try {
    // 1. 어제 날짜 계산
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    // 2. 어제 일기 가져오기
    const diary = await prisma.diaryEntry.findUnique({
      where: { date: dateOnly },
    });

    const yesterdayStr = dateOnly.toISOString().slice(0, 10);
    const diaryText = diary?.text || "어제 일기는 작성되지 않았습니다.";
    const mood = diary?.mood || "unknown";

    // 3. Gemini API로 감성 편지 생성
    const prompt = buildPrompt({ yesterdayStr, diaryText, mood });
    
    console.log("Calling Gemini API...");
    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2000,
        },
      }),
    });

    if (!geminiRes.ok) {
      throw new Error(`Gemini API error: ${geminiRes.statusText}`);
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    // 4. JSON 파싱
    let intro = "";
    let outro = "";
    let comments: Record<string, string> = {};

    try {
      // Gemini가 ```json ... ``` 형태로 반환할 수 있으므로 정리
      const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      const parsed = JSON.parse(cleanText);
      intro = parsed.intro || "";
      outro = parsed.outro || "";
      comments = parsed.comments || {};
    } catch (e) {
      console.error("JSON parsing failed:", e);
      console.log("Raw Gemini response:", text);
      // Fallback
      intro = "오늘도 당신의 신조를 조용히 떠올리며 하루를 시작해 봅니다.";
      outro = "이 신조들이 오늘도 당신의 마음을 조금 덜 흔들리게 해주기를 바랍니다.";
      for (let i = 1; i <= 7; i++) {
        comments[i.toString()] = "오늘 하루도 이 신조를 마음에 담아보세요.";
      }
    }

    // 5. HTML 이메일 생성
    const htmlBody = buildHtmlEmail({ intro, outro, comments, yesterdayStr });

    // 6. 이메일 발송
    const recipientEmail = process.env.RECIPIENT_EMAIL || "your_email@gmail.com";
    
    await sendEmail({
      to: recipientEmail,
      subject: `☀️ 오늘의 신조 리마인더 - ${yesterdayStr}를 지나 보낸 아침에`,
      html: htmlBody,
    });

    return NextResponse.json({
      ok: true,
      message: "편지가 발송되었습니다.",
      preview: { intro, outro, comments },
    });
  } catch (err: any) {
    console.error("daily-creed error:", err);
    return NextResponse.json(
      { error: err.message || "편지 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

function buildPrompt({
  yesterdayStr,
  diaryText,
  mood,
}: {
  yesterdayStr: string;
  diaryText: string;
  mood: string;
}): string {
  const moodText =
    mood === "low"
      ? "조금 무거운 하루"
      : mood === "high"
      ? "가벼운 하루"
      : "평범한 하루";

  return `
너는 '우시사(Ussisa)' 느낌의 감성 뉴스레터 에디터다.
한 사람에게만 보내는 아침 편지를 쓴다.
톤은 따뜻하고 부드러우며, 설교조가 아닌 대화하듯이 써야 한다.

[요청사항]
- intro: 2~3문장으로 편지를 시작하는 인사. 어제의 기분과 일기를 살짝 언급하면서 자연스럽게.
- outro: 2~3문장으로 편지를 마무리하는 따뜻한 말.
- comments: 각 신조별로 1~2문장의 코멘트. 어제 일기 내용을 반영하되, 일기를 그대로 복사하지 말 것.

[어제의 정보]
- 날짜: ${yesterdayStr}
- 기분: ${moodText}
- 일기 내용:
${diaryText}

[참고: 7가지 신조 전문]
${getFullCreedText()}

결과는 반드시 아래 JSON 형식으로만 출력해라:

{
  "intro": "인트로 문장...",
  "outro": "아웃트로 문장...",
  "comments": {
    "1": "첫 번째 신조에 대한 한마디...",
    "2": "두 번째 신조에 대한 한마디...",
    "3": "세 번째 신조에 대한 한마디...",
    "4": "네 번째 신조에 대한 한마디...",
    "5": "다섯 번째 신조에 대한 한마디...",
    "6": "여섯 번째 신조에 대한 한마디...",
    "7": "일곱 번째 신조에 대한 한마디..."
  }
}
`;
}

function buildHtmlEmail({
  intro,
  outro,
  comments,
  yesterdayStr,
}: {
  intro: string;
  outro: string;
  comments: Record<string, string>;
  yesterdayStr: string;
}): string {
  const c = (n: string) => comments?.[n] || "오늘도 이 신조를 마음에 담아보세요.";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif;
      line-height: 1.8;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .container {
      background-color: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 24px;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .date {
      color: #7f8c8d;
      font-size: 14px;
      margin-bottom: 30px;
    }
    .intro {
      font-size: 16px;
      color: #555;
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f8f9fa;
      border-left: 4px solid #3498db;
      border-radius: 4px;
    }
    .creed-section {
      margin: 30px 0;
      padding: 20px;
      border-radius: 8px;
      background-color: #fafafa;
    }
    .creed-title {
      font-size: 18px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .creed-content {
      font-size: 15px;
      color: #555;
      margin-bottom: 15px;
      line-height: 1.7;
    }
    .comment {
      font-style: italic;
      color: #3498db;
      padding: 10px 15px;
      background-color: #e8f4f8;
      border-radius: 6px;
      font-size: 14px;
    }
    .outro {
      font-size: 16px;
      color: #555;
      margin-top: 30px;
      padding: 20px;
      background-color: #fff3e0;
      border-left: 4px solid #ff9800;
      border-radius: 4px;
    }
    hr {
      border: none;
      border-top: 1px solid #e0e0e0;
      margin: 30px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #999;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>☀️ 오늘의 신조 리마인더</h1>
    <div class="date">${yesterdayStr}를 지나 보낸 아침에</div>
    
    <div class="intro">${intro.replace(/\n/g, "<br/>")}</div>
    
    <hr/>
    
    <div class="creed-section">
      <div class="creed-title">1. ${CREEDS["1"].title}</div>
      <div class="creed-content">${CREEDS["1"].content}</div>
      <div class="comment">💭 ${c("1")}</div>
    </div>
    
    <div class="creed-section">
      <div class="creed-title">2. ${CREEDS["2"].title}</div>
      <div class="creed-content">${CREEDS["2"].content}</div>
      <div class="comment">💭 ${c("2")}</div>
    </div>
    
    <div class="creed-section">
      <div class="creed-title">3. ${CREEDS["3"].title}</div>
      <div class="creed-content">${CREEDS["3"].content}</div>
      <div class="comment">💭 ${c("3")}</div>
    </div>
    
    <div class="creed-section">
      <div class="creed-title">4. ${CREEDS["4"].title}</div>
      <div class="creed-content">${CREEDS["4"].content}</div>
      <div class="comment">💭 ${c("4")}</div>
    </div>
    
    <div class="creed-section">
      <div class="creed-title">5. ${CREEDS["5"].title}</div>
      <div class="creed-content">${CREEDS["5"].content}</div>
      <div class="comment">💭 ${c("5")}</div>
    </div>
    
    <div class="creed-section">
      <div class="creed-title">6. ${CREEDS["6"].title}</div>
      <div class="creed-content">${CREEDS["6"].content}</div>
      <div class="comment">💭 ${c("6")}</div>
    </div>
    
    <div class="creed-section">
      <div class="creed-title">7. ${CREEDS["7"].title}</div>
      <div class="creed-content">${CREEDS["7"].content}</div>
      <div class="comment">💭 ${c("7")}</div>
    </div>
    
    <hr/>
    
    <div class="outro">${outro.replace(/\n/g, "<br/>")}</div>
    
    <div class="footer">
      이 편지는 어제의 당신이 남긴 기록을 바탕으로 작성되었습니다.<br/>
      오늘도 좋은 하루 되세요 🌟
    </div>
  </div>
</body>
</html>
`;
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Gmail 앱 비밀번호
    },
  });

  await transporter.sendMail({
    from: `"Daily Creed Letter" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
