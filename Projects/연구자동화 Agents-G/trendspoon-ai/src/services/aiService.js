/**
 * TrendSpoon AI — AI 콘텐츠 생성 서비스
 * Gemini API를 사용하여 뉴스를 분석하고 인스타그램 카드뉴스 콘텐츠 생성
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;

/**
 * Gemini API 초기화
 */
export function initializeAI(apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

/**
 * 수집된 뉴스에서 TOP 3 AI 뉴스를 선별하고 콘텐츠 생성
 */
export async function generateNewsContent(newsItems, onProgress) {
    if (!model) {
        throw new Error('Gemini API가 초기화되지 않았습니다. API 키를 먼저 입력해주세요.');
    }

    onProgress?.('🤖 AI가 뉴스를 분석하고 있습니다...', 30);

    // 뉴스 목록을 텍스트로 변환
    const newsListText = newsItems.map((item, i) =>
        `${i + 1}. [${item.source}] ${item.title}\n   요약: ${item.description}\n   링크: ${item.link}\n   이미지: ${item.imageUrl || ''}`
    ).join('\n\n');

    const today = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });

    const prompt = `당신은 인스타그램 @trend_spoon_ai 계정의 SNS 콘텐츠 기획자이자 전문 뉴스 기자입니다.
당신의 역할은 팔로워들에게 매일 아침 가장 중요한 AI 트렌드를 쉽고 재미있게 전달하는 것입니다.

오늘 날짜: ${today}

아래 최신 뉴스 목록에서 '가장 혁신적이고 팔로워들이 관심 가질 AI 뉴스' 3가지를 뽑아주세요.
선정 기준: ① 산업 임팩트가 큰 뉴스 ② 일반인도 체감할 수 있는 변화 ③ 화제성/논쟁 가능성

=== 뉴스 목록 ===
${newsListText}
================

**반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:**

\`\`\`json
{
  "date": "${today}",
  "coverHook": "오늘 선정한 3가지 뉴스를 관통하는 시선 강탈 카피 (예: 오픈AI의 두 얼굴?\\n윤리 논쟁과 기술 혁신 사이 ⚡) - 반드시 적절한 단위(의문문이나 핵심 절)에서 '\\n'을 넣어 두 줄로 구성하세요",
  "postCaption": "게시물 전체 통합 캡션 (아래 구조 참고)",
  "news": [
    {
      "number": 1,
      "headline": "호기심을 자극하는 한 줄 제목 (한국어, 이모지 1개 포함, 20자 이내, 임팩트 있게)",
      "summary": [
        "무엇이 일어났는지 (구체적 수치나 사실 포함, '핵심 1:' 같은 접두사 없이 바로 내용만)",
        "왜 이것이 중요한지 (접두사 없이 내용만)",
        "어떤 변화가 예상되는지 (접두사 없이 내용만)"
      ],
      "insight": "이 뉴스가 우리 일상/산업에 미치는 영향을 한 문장으로 (구체적이고 날카롭게)",
      "source": "출처 미디어 이름",
      "sourceUrl": "원본 기사 URL",
      "category": "AI 카테고리 (생성AI / 로보틱스 / AI윤리 / AI비즈니스 / AI연구 / 빅테크 중 택1)",
      "imageUrl": "제공된 기사 원본 이미지 URL (없으면 빈 문자열)"
    }
  ]
}
\`\`\`

📱 postCaption (통합 캡션) 작성 규칙 — 가장 중요!!!

이 캡션은 인스타그램 캐러셀 게시물에 바로 붙여넣는 최종 텍스트입니다.
아래 구조를 정확히 따라 하나의 자연스러운 글로 작성하세요:

---
🥄 오늘의 AI 뉴스 — ${today}

(시선을 잡는 인트로 한 줄. 예: "오늘도 AI 세계가 요동치고 있어요!")

[1] (뉴스1 헤드라인)
(핵심 내용 1-2문장으로 쉽게 설명)

[2] (뉴스2 헤드라인)
(핵심 내용 1-2문장으로 쉽게 설명)

[3] (뉴스3 헤드라인)
(핵심 내용 1-2문장으로 쉽게 설명)

💬 (팔로워 참여 유도 질문 1줄)
댓글로 의견 남겨주세요!

—
📌 매일 아침 AI 트렌드를 떠먹여 드립니다
👉 @trend_spoon_ai 팔로우

#AI뉴스 #인공지능 #테크트렌드 #AI소식 #트렌드스푼 (+ 뉴스 관련 해시태그 추가하여 총 8-10개, 중복 없이)
---

💡 톤앤매너:
- 뉴스레터 ㅁㅎ, 점선면, 너겟 같은 한국 인스타 뉴스레터 톤
- 친근하면서도 신뢰감 있는 전문가 느낌
- 전문용어는 쉬운 비유로 풀어주기 (예: "AI 모델이 학습한다 = 넷플릭스가 취향을 파악하듯")
- 이모지 적절히 활용하되 과하지 않게
- 실제로 "우와 신기하다" "이건 알아둬야 해" 라는 반응을 이끌어낼 것
- [1], [2], [3] 각 섹션 사이에 줄바꿈을 넣어 가독성 확보`;


    onProgress?.('🧠 AI가 콘텐츠를 생성 중입니다...', 60);

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        onProgress?.('📝 콘텐츠를 정리하고 있습니다...', 85);

        // JSON 추출
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)```/)
            || responseText.match(/\{[\s\S]*"news"[\s\S]*\}/);

        let parsed;
        if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            parsed = JSON.parse(jsonStr);
        } else {
            throw new Error('AI 응답에서 JSON을 파싱할 수 없습니다.');
        }

        onProgress?.('✅ 콘텐츠 생성 완료!', 100);
        return parsed;
    } catch (error) {
        console.error('콘텐츠 생성 오류:', error);
        throw new Error(`AI 콘텐츠 생성 실패: ${error.message}`);
    }
}
