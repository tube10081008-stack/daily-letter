import { GoogleGenerativeAI } from '@google/generative-ai';
import type { User, DiaryEntry, FavoritePhrase } from '../utils/db.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `당신은 사용자의 일기를 읽고 따뜻하고 공감적인 편지를 작성하는 AI입니다.

**작성 규칙:**
1. 반드시 JSON 형식으로 응답하세요
2. 각 섹션은 3-5문장으로 구성하세요
3. **매우 중요: 마침표(.) 뒤에는 반드시 [BREAK] 태그를 삽입하세요**
   - 예: "안녕하세요.[BREAK]오늘 하루는 어떠셨나요?[BREAK]일기를 읽어보니..."
4. 문장 간 자연스러운 연결을 유지하세요
5. 따뜻하고 공감적인 어조를 사용하세요

**JSON 출력 형식 (반드시 [BREAK] 태그 사용):**
{
  "intro": "안녕하세요 {{name}}님![BREAK]오늘 하루는 어떠셨나요?[BREAK]일기를 읽어보니 정말 뿌듯한 하루를 보내셨네요.[BREAK]",
  "diaryFeedback": "일기 속 당신의 마음이 느껴집니다.[BREAK]그런 감정을 느끼셨다니 정말 소중한 경험이네요.[BREAK]당신의 성장이 느껴져 저도 기쁩니다.[BREAK]",
  "phraseFeedback": "좋아하시는 명언이네요.[BREAK]이 말씀처럼 당신도 그런 삶을 살아가고 계십니다.[BREAK]",
  "outro": "오늘도 응원합니다.[BREAK]좋은 하루 보내세요![BREAK]내일 또 만나요.[BREAK]"
}

**필수 규칙:**
- 모든 마침표(.) 뒤에 [BREAK] 태그 삽입
- [BREAK]는 나중에 <br><br>로 변환됨
- 각 섹션 마지막에도 [BREAK] 추가`;

export async function generateLetter(
  user: User,
  diary: DiaryEntry,
  phrases: FavoritePhrase[]
): Promise<{
  intro: string;
  diaryFeedback: string;
  phraseFeedback?: string;
  outro: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // 명언 정보 포맷팅
    const phrasesText = phrases.length > 0
      ? phrases.map(p => `- "${p.content}" (${p.author || '작자미상'})`).join('\n')
      : '(저장된 명언 없음)';

    const prompt = `
사용자 정보:
- 이름: ${user.name}
- 이메일: ${user.email}

최근 일기:
"${diary.content}"
(기분: ${diary.mood || '기록 안 함'})

좋아하는 명언:
${phrasesText}

위 정보를 바탕으로 따뜻하고 공감적인 편지를 JSON 형식으로 작성하세요.
반드시 모든 마침표(.) 뒤에 [BREAK] 태그를 삽입하세요.

JSON 형식:
{
  "intro": "인사말 3문장 (각 마침표 뒤 [BREAK])",
  "diaryFeedback": "일기 피드백 3-4문장 (각 마침표 뒤 [BREAK])",
  "phraseFeedback": "명언 피드백 2-3문장 (각 마침표 뒤 [BREAK], 명언 없으면 생략)",
  "outro": "마무리 인사 2-3문장 (각 마침표 뒤 [BREAK])"
}
    `.trim();

    console.log('🤖 Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📄 Gemini raw response:', text.substring(0, 200) + '...');

    // JSON 파싱 (```json``` 태그 제거)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const letterContent = JSON.parse(jsonText);
    console.log('✅ JSON parsed successfully');

    // 🆕 [BREAK] → <br><br> 변환 + 들여쓰기 추가
    const processContent = (text: string): string => {
      if (!text) return text;
      
      return text
        .replace(/\[BREAK\]/g, '<br><br>;') // [BREAK] → 줄바꿈 + 들여쓰기
        .replace(/\.\s+/g, '.<br><br>;') // 마침표 + 공백 → 줄바꿈 + 들여쓰기
        .trim();
    };

    return {
      intro: processContent(letterContent.intro),
      diaryFeedback: processContent(letterContent.diaryFeedback),
      phraseFeedback: letterContent.phraseFeedback 
        ? processContent(letterContent.phraseFeedback) 
        : undefined,
      outro: processContent(letterContent.outro)
    };

  } catch (error) {
    console.error('❌ Gemini API error:', error);

    // Fallback - 기본 템플릿 (안전장치)
    return {
      intro: `안녕하세요 ${user.name}님!<br><br>\;오늘 하루도 평온하게 보내셨다니 정말 다행입니다.<br><br>;일기를 통해 당신의 따뜻한 마음을 느낄 수 있었습니다.`,
      diaryFeedback: `일기에서 '${diary.mood || '대박'}' 이라는 문장을 보니 소소한 즐거움을 발견하시는 모습이 떠올라 저도 미소짓게 됩니다.<br><br>;일상 속 작은 발견에서 행복을 느끼시는 당신은 분명 긍정적인 에너지를 가진 분이실 겁니다.<br><br>;그런 긍정적인 마음이 당신의 하루를 더욱 풍요롭게 만들어줄 것이라고 생각합니다.`,
      phraseFeedback: phrases.length > 0
        ? `평온함 속에서 작은 행복을 발견하는 당신의 능력이 부럽습니다.<br><br>;앞으로도 당신의 평온함이 늘 함께하기를 진심으로 바랍니다.`
        : undefined,
      outro: `오늘도 당신의 따뜻한 마음 덕분에 저 또한 위로를 받았습니다.<br><br>;앞으로도 당신의 평온함이 늘 함께하기를 진심으로 바랍니다.<br><br>;좋은 하루 보내세요!`
    };
  }
}