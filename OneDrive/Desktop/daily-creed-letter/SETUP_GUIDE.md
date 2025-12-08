# 🚀 완벽한 설정 가이드

## 단계별 설치 및 설정

### Step 1: 프로젝트 설치

```bash
# 의존성 설치
cd daily-creed-letter
npm install

# Prisma 초기화
npx prisma generate
npx prisma db push
```

### Step 2: API 키 발급

#### 1️⃣ Gemini API Key 발급

1. **Google AI Studio 접속**
   - https://aistudio.google.com/app/apikey
   
2. **API Key 생성**
   - "Create API Key" 버튼 클릭
   - 프로젝트 선택 또는 새로 생성
   - API 키 복사

3. **무료 사용량**
   - 분당 15회 요청
   - 일일 1,500회 요청
   - 개인 사용에는 충분!

#### 2️⃣ Gmail 앱 비밀번호 발급

1. **2단계 인증 활성화** (필수!)
   - Google 계정 설정 → 보안
   - "2단계 인증" 활성화
   
2. **앱 비밀번호 생성**
   - https://myaccount.google.com/apppasswords 접속
   - 앱 선택: "메일"
   - 기기 선택: "기타" → "Daily Creed Letter" 입력
   - 16자리 비밀번호 생성 (공백 제거하고 사용)

3. **주의사항**
   - 일반 Gmail 비밀번호가 아닌 앱 비밀번호를 사용해야 함
   - 2단계 인증 없이는 앱 비밀번호 생성 불가

### Step 3: 환경 변수 설정

`.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 내용:

```env
GEMINI_API_KEY=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=abcdabcdabcdabcd
RECIPIENT_EMAIL=your_email@gmail.com
```

### Step 4: 로컬 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# http://localhost:3000
```

#### 테스트 시나리오

1. **일기 작성 테스트**
   - http://localhost:3000/diary 접속
   - 테스트 일기 작성 후 저장
   - "저장되었어요" 메시지 확인

2. **편지 발송 테스트**
   - 터미널에서 실행:
     ```bash
     curl http://localhost:3000/api/daily-creed
     ```
   - 또는 브라우저에서: http://localhost:3000/api/daily-creed
   - 이메일 수신함 확인 (1-2분 소요)

3. **문제 해결**
   - 터미널에서 에러 로그 확인
   - Gmail 스팸 폴더 확인
   - API 키가 올바른지 재확인

### Step 5: 배포 (Vercel 추천)

#### Vercel 배포

1. **GitHub에 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Vercel 배포**
   - https://vercel.com 접속
   - "Import Project" 클릭
   - GitHub 저장소 선택
   - 환경 변수 입력:
     - `GEMINI_API_KEY`
     - `GMAIL_USER`
     - `GMAIL_APP_PASSWORD`
     - `RECIPIENT_EMAIL`
   - "Deploy" 클릭

3. **Cron Job 설정**
   
   `vercel.json` 파일이 이미 있다면:
   ```json
   {
     "crons": [{
       "path": "/api/daily-creed",
       "schedule": "0 22 * * *"
     }]
   }
   ```
   - 0 22 * * * = UTC 22:00 = 한국 시간 07:00
   - 원하는 시간으로 변경 가능

4. **재배포**
   ```bash
   git add vercel.json
   git commit -m "Add cron job"
   git push
   ```

### Step 6: 자동화 확인

#### 매일 아침 체크리스트

✅ 전날 밤에 일기를 작성했는가?  
✅ 아침 7시에 이메일이 도착했는가?  
✅ 편지 내용이 어제 일기를 반영하고 있는가?  

#### 수동 발송 (테스트용)

언제든 수동으로 편지를 발송하려면:

```bash
# 로컬
curl http://localhost:3000/api/daily-creed

# 배포 후
curl https://your-app.vercel.app/api/daily-creed
```

## 🎨 커스터마이징 가이드

### 신조 내용 변경

`lib/creeds.ts` 파일 수정:

```typescript
export const CREEDS = {
  "1": {
    title: "나만의 신조 1",
    content: `내용...`
  },
  // ... 나머지 신조들
};
```

### 발송 시간 변경

Cron 표현식 참고:
- `0 22 * * *` = 매일 07:00 (한국 시간)
- `0 23 * * *` = 매일 08:00 (한국 시간)
- `30 21 * * *` = 매일 06:30 (한국 시간)

### AI 톤 조정

`app/api/daily-creed/route.ts`의 `buildPrompt` 함수에서:

```typescript
return `
너는 '우시사(Ussisa)' 느낌의 감성 뉴스레터 에디터다.
// ↑ 이 부분을 원하는 톤으로 변경
// 예: "친한 친구처럼 말하는...", "전문 코치처럼..."
`;
```

### 이메일 디자인 변경

`app/api/daily-creed/route.ts`의 `buildHtmlEmail` 함수에서 HTML/CSS 수정

## 🐛 자주 발생하는 문제

### Q: 이메일이 안 와요!
**A:** 체크리스트
1. Gmail 앱 비밀번호가 정확한가? (16자리, 공백 제거)
2. 2단계 인증이 활성화되어 있는가?
3. 스팸 폴더를 확인했는가?
4. Vercel 로그에서 에러를 확인했는가?

### Q: Gemini API 에러
**A:** 
- API 키가 유효한지 확인
- 무료 할당량을 초과하지 않았는지 확인
- https://aistudio.google.com 에서 키 재생성

### Q: Cron이 작동하지 않아요
**A:**
- Vercel: `vercel.json`이 제대로 커밋되었는지 확인
- GitHub Actions: Secrets가 설정되었는지 확인
- 로그에서 실행 여부 확인

### Q: 데이터베이스 초기화하고 싶어요
```bash
rm -f prisma/dev.db
npx prisma db push
```

## 📊 사용량 모니터링

### Gemini API 사용량
- https://aistudio.google.com 에서 확인
- 무료: 일일 1,500회

### Gmail 발송량
- Gmail은 일일 500통까지 무료
- 개인 사용(1일 1통)은 문제없음

## 🎉 완료!

이제 매일 밤 일기를 쓰면, 다음 날 아침 따뜻한 편지가 도착합니다.

**행복한 하루 되세요!** ✨
