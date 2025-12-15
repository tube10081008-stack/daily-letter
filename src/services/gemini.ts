import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import type { User, DiaryEntry, FavoritePhrase } from '../utils/db.js';

config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export interface LetterContent {
  intro: string;
  diaryFeedback: string;
  phraseFeedback?: string;
  outro: string;
}

export async function generateLetter(
  user: User,
  diary: DiaryEntry,
  phrases: FavoritePhrase[]
): Promise<LetterContent> {
  // 명언 정보 포맷팅
  const phrasesText = phrases.length > 0
    ? phrases.map(p => `- "${p.content}" (${p.author || '작자미상'})`).join('\n')
    : '(저장된 명언 없음)';

  const prompt = `
당신은 감성적이고 따뜻한 편지를 쓰는 AI입니다.
시적인 뉴스레터 스타일로 작성해주세요.

사용자 정보:
- 이름: ${user.name}
- 이메일: ${user.email}

**어제 일기:**
${diary.content}
${diary.mood ? `\n**기분:** ${diary.mood}` : ''}

**좋아하는 명언:**
${phrasesText}

---

**작성 규칙:**
1. 반드시 JSON 형식으로 응답하세요
2. 각 섹션은 3-5문장으로 구성하세요
3. **매우 중요: 마침표(.) 뒤에는 반드시 [BREAK] 태그를 삽입하세요**
   - 예: "안녕하세요.[BREAK]오늘 하루는 어떠셨나요?[BREAK]일기를 읽어보니..."
4. 문장 간 자연스러운 연결을 유지하세요
5. 따뜻하고 공감적인 어조를 사용하세요

다음 4가지 섹션으로 편지를 작성해주세요:

1. **intro** (인사말, 2-3문장): 아침 인사와 오늘을 시작하는 따뜻한 말
2. **diaryFeedback** (일기에 대한 공감과 격려, 3-4문장): 사용자의 어제를 인정하고 공감하며 위로
3. **phraseFeedback** (좋아하는 명언에 대한 해석과 연결, 3-4문장): 이 문장이 주는 의미와 사용자의 삶과의 연결 (명언 없으면 생략)
4. **outro** (마무리 인사, 2문장): 오늘 하루를 응원하는 마무리 인사

**톤앤매너:**
- 시적이고 감성적이지만 과하지 않게
- 친구처럼 따뜻하게, 하지만 존중하는 어조
- 구체적인 일기 내용을 언급하며 공감
- 진부한 표현 피하기

**JSON 출력 형식 (반드시 [BREAK] 태그 사용):**
\`\`\`json
{
  "intro": "안녕하세요 ${user.name}님![BREAK]오늘 하루는 어떠셨나요?[BREAK]일기를 읽어보니...[BREAK]",
  "diaryFeedback": "일기 속 당신의 마음이 느껴집니다.[BREAK]그런 감정을 느끼셨다니...[BREAK]당신의 성장이 느껴져 저도 기쁩니다.[BREAK]",
  "phraseFeedback": "좋아하시는 명언이네요.[BREAK]이 말씀처럼 당신도 그런 삶을 살아가고 계십니다.[BREAK]",
  "outro": "오늘도 응원합니다.[BREAK]좋은 하루 보내세요![BREAK]"
}
\`\`\`

**필수 규칙:**
- 모든 마침표(.) 뒤에 [BREAK] 태그 삽입
- [BREAK]는 나중에 <br><br>로 변환됨
- 각 섹션 마지막에도 [BREAK] 추가
`;

  try {
    console.log('🤖 Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📄 Gemini raw response:', text.substring(0, 200) + '...');

    // Extract JSON from response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const letterContent: LetterContent = JSON.parse(jsonText);
    console.log('✅ JSON parsed successfully');

    // [BREAK] → <br><br> 변환 (들여쓰기 없이!)
    const processContent = (text: string): string => {
      if (!text) return text;
      
      return text
        .replace(/\[BREAK\]/g, '<br><br>') // [BREAK] → 줄바꿈만
        .replace(/\.\s+/g, '.<br><br>') // 마침표 + 공백 → 줄바꿈만
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
    console.error('❌ Gemini API Error:', error);
    
    // Fallback response
    return {
      intro: `안녕하세요 ${user.name}님!<br><br>오늘 하루도 평온하게 보내셨다니 정말 다행입니다.<br><br>일기를 통해 당신의 따뜻한 마음을 느낄 수 있었습니다.`,
      diaryFeedback: `일기에서 '${diary.mood || '대박'}' 이라는 문장을 보니 소소한 즐거움을 발견하시는 모습이 떠올라 저도 미소짓게 됩니다.<br><br>일상 속 작은 발견에서 행복을 느끼시는 당신은 분명 긍정적인 에너지를 가진 분이실 겁니다.<br><br>그런 긍정적인 마음이 당신의 하루를 더욱 풍요롭게 만들어줄 것이라고 생각합니다.`,
      phraseFeedback: phrases.length > 0
        ? `평온함 속에서 작은 행복을 발견하는 당신의 능력이 부럽습니다.<br><br>앞으로도 당신의 평온함이 늘 함께하기를 진심으로 바랍니다.`
        : undefined,
      outro: `오늘도 당신의 따뜻한 마음 덕분에 저 또한 위로를 받았습니다.<br><br>앞으로도 당신의 평온함이 늘 함께하기를 진심으로 바랍니다.<br><br>좋은 하루 보내세요!`
    };
  }
}