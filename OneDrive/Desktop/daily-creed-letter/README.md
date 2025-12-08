# ✉️ Daily Creed Letter

**어제의 나에게서 오늘 아침 편지가 오는 시스템**

매일 밤 짧은 일기를 작성하면, 다음 날 아침 AI가 감성적인 편지를 작성해 이메일로 보내줍니다.

## 🌟 주요 기능

- 📝 **일기 작성**: 매일 밤 3-5줄의 짧은 일기 작성
- 🤖 **AI 편지 생성**: Gemini API를 활용한 감성 편지 자동 생성
- 📧 **이메일 발송**: 매일 아침 자동으로 편지 발송
- 💾 **데이터 저장**: Prisma + SQLite로 일기 저장
- 🎨 **아름다운 UI**: 깔끔하고 직관적인 인터페이스

## 📦 설치 방법

### 1. 프로젝트 클론 및 의존성 설치

```bash
cd daily-creed-letter
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Gemini API Key
# https://aistudio.google.com/app/apikey 에서 발급
GEMINI_API_KEY=your_gemini_api_key_here

# Gmail 설정
# Gmail 앱 비밀번호: https://myaccount.google.com/apppasswords
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_app_password

# 편지를 받을 이메일
RECIPIENT_EMAIL=your_email@gmail.com
```

#### 🔑 API 키 및 비밀번호 발급 방법

**Gemini API Key:**
1. https://aistudio.google.com/app/apikey 접속
2. "Create API Key" 클릭
3. 생성된 키를 복사하여 `.env`에 붙여넣기

**Gmail 앱 비밀번호:**
1. Google 계정 설정 → 보안
2. 2단계 인증 활성화 (필수)
3. https://myaccount.google.com/apppasswords 접속
4. 앱 선택: "메일", 기기 선택: "기타"
5. 16자리 비밀번호 생성 후 `.env`에 붙여넣기

### 3. 데이터베이스 초기화

```bash
npx prisma generate
npx prisma db push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 🚀 사용 방법

### 1. 일기 작성
- http://localhost:3000/diary 접속
- 오늘 하루의 생각과 감정을 3-5줄로 작성
- 오늘의 기분 선택 (조금 무거움 / 보통 / 가벼움)
- "저장하기" 버튼 클릭

### 2. 편지 발송 테스트
수동으로 편지를 발송하려면:

```bash
curl http://localhost:3000/api/daily-creed
```

또는 브라우저에서 http://localhost:3000/api/daily-creed 접속

### 3. 자동화 설정 (매일 아침 7시 발송)

#### 옵션 A: Vercel Cron Jobs (추천)
`vercel.json` 파일이 이미 포함되어 있습니다:

```json
{
  "crons": [{
    "path": "/api/daily-creed",
    "schedule": "0 22 * * *"  // UTC 22:00 = KST 07:00
  }]
}
```

Vercel에 배포하면 자동으로 설정됩니다!

#### 옵션 B: Netlify 배포
자세한 내용은 **NETLIFY_DEPLOY.md** 파일을 참고하세요.

- Netlify Scheduled Functions (Pro 플랜)
- 또는 무료 외부 Cron 서비스 사용 (EasyCron, cron-job.org)

#### 옵션 C: GitHub Actions
`.github/workflows/daily-letter.yml` 파일 생성:

```yaml
name: Daily Letter

on:
  schedule:
    - cron: '0 22 * * *'  # UTC 22:00 = KST 07:00
  workflow_dispatch:

jobs:
  send-letter:
    runs-on: ubuntu-latest
    steps:
      - name: Send daily letter
        run: |
          curl -X GET ${{ secrets.APP_URL }}/api/daily-creed
```

GitHub Secrets에 `APP_URL` 추가

#### 옵션 D: cron (Linux/Mac 로컬)
```bash
crontab -e
# 다음 줄 추가
0 7 * * * curl http://localhost:3000/api/daily-creed
```

## 📁 프로젝트 구조

```
daily-creed-letter/
├── app/
│   ├── page.tsx                 # 홈페이지
│   ├── diary/
│   │   └── page.tsx            # 일기 작성 페이지
│   └── api/
│       ├── diary/
│       │   └── route.ts        # 일기 저장 API
│       └── daily-creed/
│           └── route.ts        # 편지 생성 & 발송 API
├── lib/
│   ├── prisma.ts               # Prisma 클라이언트
│   └── creeds.ts               # 7가지 신조 데이터
├── prisma/
│   └── schema.prisma           # DB 스키마
├── .env.example                # 환경 변수 예제
└── README.md
```

## 🎯 7가지 신조

이 시스템은 다음 7가지 신조를 기반으로 편지를 작성합니다:

1. **인간존엄에 관한 신조** - 모든 사람의 가치와 존엄, 그들을 위한 원대한 꿈
2. **사랑에 관한 신조** - 악의 선동에 대한 자각과 사랑을 심을 땅 일구기
3. **인정에 관한 신조** - 타인의 성취를 알아보고 인정의 말 전하기
4. **삶의 결정에 관한 신조** - 이웃과 친구를 위한 삶의 결정과 목표 설정
5. **재정과 자유에 관한 신조** - 재정의 한계 안에서 누리는 진정한 자유
6. **기업가정신에 관한 신조** - 타인의 필요를 채우고 두려움 속 기회 잡기
7. **희망과 멘토에 관한 신조** - 긍정과 희망의 태도, 멘토의 정신 계승

## 🛠️ 기술 스택

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Prisma + SQLite (로컬) / MySQL/PostgreSQL (배포)
- **AI**: Google Gemini 2.0 Flash
- **Email**: Nodemailer + Gmail SMTP
- **Deployment**: Vercel / Netlify 지원

## 📝 커스터마이징

### 신조 수정
`lib/creeds.ts` 파일에서 신조 내용을 수정할 수 있습니다.

### 프롬프트 조정
`app/api/daily-creed/route.ts`의 `buildPrompt` 함수에서 AI 프롬프트를 수정할 수 있습니다.

### 이메일 디자인
`app/api/daily-creed/route.ts`의 `buildHtmlEmail` 함수에서 이메일 템플릿을 수정할 수 있습니다.

## 🐛 문제 해결

### 이메일이 발송되지 않아요
- Gmail 앱 비밀번호가 올바른지 확인
- 2단계 인증이 활성화되어 있는지 확인
- `.env` 파일의 환경 변수가 올바른지 확인

### Gemini API 오류
- API 키가 유효한지 확인
- API 사용량 제한을 확인
- 인터넷 연결 상태 확인

### 데이터베이스 오류
```bash
# DB 재생성
rm -f prisma/dev.db
npx prisma db push
```

## 📄 라이선스

MIT License

## 💬 피드백

문제가 있거나 개선 아이디어가 있다면 이슈를 생성해주세요!

---

**Made with ❤️ for daily reflection and growth**
