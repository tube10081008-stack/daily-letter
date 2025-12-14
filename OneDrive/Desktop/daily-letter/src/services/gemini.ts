import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';

config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export interface LetterContent {
  intro: string;
  diaryFeedback: string;
  phraseFeedback: string;
  outro: string;
}

export async function generateLetter(
  diaryContent: string,
  diaryMood: string | null,
  favoritePhrase: string,
  phraseAuthor: string | null
): Promise<LetterContent> {
  const prompt = `
당신은 '우리는 시를 사랑해(우시사)' 뉴스레터 스타일로 따뜻하고 감성적인 편지를 쓰는 AI입니다.

사용자의 어제 일기와 좋아하는 문장을 바탕으로 오늘 아침 편지를 작성해주세요.

**어제 일기:**
${diaryContent}
${diaryMood ? `\n**기분:** ${diaryMood}` : ''}

**좋아하는 문장:**
"${favoritePhrase}"
${phraseAuthor ? `- ${phraseAuthor}` : ''}

---

다음 4가지 섹션으로 편지를 작성해주세요:

1. **intro** (인사말, 2-3문장): 아침 인사와 오늘을 시작하는 따뜻한 말
2. **diaryFeedback** (일기에 대한 공감과 격려, 3-4문장): 사용자의 어제를 인정하고 공감하며 위로
3. **phraseFeedback** (좋아하는 문장에 대한 해석과 연결, 3-4문장): 이 문장이 주는 의미와 사용자의 삶과의 연결
4. **outro** (마무리 인사, 2문장): 오늘 하루를 응원하는 마무리 인사

**톤앤매너:**
- 시적이고 감성적이지만 과하지 않게
- 친구처럼 따뜻하게, 하지만 존중하는 어조
- 구체적인 일기 내용을 언급하며 공감
- 진부한 표현 피하기

**응답 형식 (JSON):**
\`\`\`json
{
  "intro": "...",
  "diaryFeedback": "...",
  "phraseFeedback": "...",
  "outro": "..."
}
\`\`\`
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const letterContent: LetterContent = JSON.parse(jsonText);

    return letterContent;
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Fallback response
    return {
      intro: '좋은 아침입니다. 오늘도 새로운 하루가 시작되었습니다.',
      diaryFeedback: `어제의 당신을 기록해주셔서 감사합니다. "${diaryContent.slice(0, 50)}..." 이 문장에서 당신의 진심이 느껴집니다.`,
      phraseFeedback: `"${favoritePhrase}" - 이 문장은 오늘의 당신에게 꼭 필요한 말인 것 같습니다.`,
      outro: '오늘도 당신의 하루를 응원합니다. 좋은 하루 되세요.'
    };
  }
}