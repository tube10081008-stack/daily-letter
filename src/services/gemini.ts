import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import type { User, DiaryEntry, FavoritePhrase } from '../utils/db.js';

config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const SYSTEM_PROMPT = `당신은 따뜻하고 공감적인 AI 편지 작가입니다.
사용자의 일기를 읽고, 그들이 좋아하는 명언을 바탕으로 개인화된 편지를 작성합니다.

**핵심 규칙:**
1) 반드시 JSON 형식으로 응답하세요
2) 각 섹션은 3-5문장으로 구성하세요
3) 마침표 뒤에는 줄바꿈만 추가하세요 (들여쓰기 없음)
4) 문장 간 자연스러운 연결을 유지하세요
5) 따뜻하고 공감적인 어조를 사용하세요

**출력 형식:**
{
  "intro": "인사와 오늘에 대한 따뜻한 말",
  "diaryFeedback": "일기 내용에 대한 공감과 피드백",
  "phraseFeedback": "명언에 대한 해석과 격려 (선택적)",
  "outro": "마무리 인사와 응원"
}

**예시:**
{
  "intro": "성현님, 안녕하세요!<br>아침 햇살처럼 따뜻한 인사를 전합니다.<br>오늘 하루도 성현님의 아름다운 생각들로 가득 채워지길 바라요.",
  "diaryFeedback": "어제 일기를 읽어보니 새로운 도전에 대한 설렘이 느껴지네요.<br>변화를 두려워하지 않는 성현님의 용기가 정말 멋집니다.<br>그 열정이 앞으로도 계속 빛나길 응원합니다.",
  "phraseFeedback": "특히 '행복은 습관이다'라는 명언이 마음에 와 닿습니다.<br>작은 행복들을 모아가는 성현님의 모습이 아름답습니다.",
  "outro": "오늘 하루도 성현님의 빛나는 하루를 응원합니다!<br>마음속 행복을 가득 채우는 하루 보내세요!"
}`;

export async function generateLetter(
  user: User,
  diary: DiaryEntry,
  phrases: FavoritePhrase[]
): Promise<{ intro: string; diaryFeedback: string; phraseFeedback?: string; outro: string }> {
  try {
    const userName = user.name || user.email;
    const diaryContent = diary.content;
    const diaryMood = diary.mood || '알 수 없음';
    const favoritePhrase = phrases.length > 0 
      ? `"${phrases[0].content}" - ${phrases[0].author || '작자미상'}`
      : null;

    const userPrompt = `
사용자 이름: ${userName}
일기 내용: ${diaryContent}
기분: ${diaryMood}
${favoritePhrase ? `좋아하는 명언: ${favoritePhrase}` : ''}

위 정보를 바탕으로 따뜻하고 개인화된 편지를 JSON 형식으로 작성해주세요.
${favoritePhrase ? 'phraseFeedback을 포함해주세요.' : 'phraseFeedback은 생략해주세요.'}
`;

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: userPrompt }
    ]);

    const response = result.response.text();
    
    // JSON 파싱
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // 줄바꿈만 유지 (들여쓰기 제거)
      return {
        intro: parsed.intro || '',
        diaryFeedback: parsed.diaryFeedback || '',
        phraseFeedback: parsed.phraseFeedback,
        outro: parsed.outro || ''
      };
    }

    // 파싱 실패 시 기본 템플릿
    return {
      intro: `${userName}님, 안녕하세요!<br>오늘도 좋은 하루 되세요!`,
      diaryFeedback: `어제의 일기를 읽어보니 ${userName}님의 하루가 느껴집니다.<br>소중한 기록 감사합니다.`,
      phraseFeedback: favoritePhrase ? `${userName}님이 좋아하시는 명언처럼, 오늘도 의미 있는 하루 보내세요.` : undefined,
      outro: `오늘 하루도 행복하세요!<br>언제나 응원합니다.`
    };

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // 에러 시 기본 편지
    return {
      intro: `${user.name || user.email}님, 안녕하세요!`,
      diaryFeedback: `어제의 일기를 잘 읽었습니다.<br>소중한 하루를 기록해주셨네요.`,
      outro: `오늘도 좋은 하루 되세요!`
    };
  }
}
