import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const SYSTEM_PROMPT = `
당신은 따뜻하고 공감 능력이 뛰어난 편지 작가입니다.

사용자의 일기를 읽고, 그들의 감정에 공감하며, 
좋아하는 문장을 해석하여 위로와 격려가 담긴 편지를 작성합니다.

편지는 다음 형식의 JSON으로 작성하되, 각 필드는 **문단으로 나뉘어야 합니다**:
- 마침표(.) 뒤에는 반드시 줄바꿈(\\n\\n)을 추가하세요.
- 각 문장이 독립된 문단처럼 보이게 작성하세요.

{
  "intro": "일기에 대한 첫 인사와 공감 (2-3문장, 각 문장 뒤 \\n\\n)",
  "diaryFeedback": "일기 내용에 대한 따뜻한 피드백 (3-4문장, 각 문장 뒤 \\n\\n)",
  "phraseFeedback": "좋아하는 문장에 대한 해석과 응원 (2-3문장, 각 문장 뒤 \\n\\n)",
  "outro": "마무리 인사와 격려 (1-2문장, 각 문장 뒤 \\n\\n)"
}

**중요:**
- 반말 금지, 존댓말 사용
- '~습니다', '~세요' 형식
- 각 문장 끝에 \\n\\n 추가
- 따뜻하고 친근한 톤
- **마침표(.) 뒤에는 반드시 줄바꿈(<br><br>)을 추가하세요** ⬅️ 🆕 강조
- 문장 간 자연스러운 연결을 유지하세요
`;

export async function generateLetter(
  diaryContent: string,
  mood: string,
  phraseContent: string,
  phraseAuthor: string
): Promise<any> {
  try {
    const prompt = `
${SYSTEM_PROMPT}

일기 내용: ${diaryContent}
기분: ${mood}
좋아하는 문장: "${phraseContent}" - ${phraseAuthor}

위 정보를 바탕으로 따뜻한 편지를 JSON 형식으로 작성해주세요.
각 문장 끝에 반드시 \\n\\n을 추가하여 문단을 나눠주세요.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSON 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return {
      intro: `안녕하세요.\n\n오늘도 소중한 이야기를 들려주셔서 감사합니다.\n\n`,
      diaryFeedback: `${mood} 기분으로 하루를 보내셨군요.\n\n당신의 이야기를 읽으며 많은 생각이 들었습니다.\n\n`,
      phraseFeedback: `"${phraseContent}"라는 문장을 좋아하신다니, 당신의 마음이 느껴집니다.\n\n${phraseAuthor}의 이 말처럼, 오늘도 힘내세요.\n\n`,
      outro: `내일도 좋은 하루 되세요.\n\n`
    };

  } catch (error) {
    console.error('❌ Gemini API error:', error);
    return {
      intro: `안녕하세요.\n\n오늘도 일기를 작성해주셔서 감사합니다.\n\n`,
      diaryFeedback: `당신의 하루가 소중합니다.\n\n`,
      phraseFeedback: `좋아하는 문장처럼, 오늘도 힘내세요.\n\n`,
      outro: `내일도 응원합니다.\n\n`
    };
  }
}