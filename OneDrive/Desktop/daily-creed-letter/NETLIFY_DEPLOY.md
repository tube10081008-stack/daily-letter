# 🌐 Netlify 배포 가이드

Netlify에서 Daily Creed Letter를 배포하고 자동화하는 완벽한 가이드입니다.

## 📋 사전 준비사항

### 1. API 키 발급

**Gemini API Key:**
- https://aistudio.google.com/app/apikey
- "Create API Key" 클릭

**Gmail 앱 비밀번호:**
- https://myaccount.google.com/apppasswords
- 2단계 인증 활성화 필수
- 16자리 앱 비밀번호 생성

### 2. GitHub 저장소 생성

```bash
git init
git add .
git commit -m "Initial commit: Daily Creed Letter"
git branch -M main
git remote add origin https://github.com/your-username/daily-creed-letter.git
git push -u origin main
```

## 🚀 Netlify 배포 단계

### Step 1: Netlify에 프로젝트 Import

1. **Netlify 로그인**
   - https://app.netlify.com 접속
   - GitHub 계정으로 로그인

2. **새 사이트 추가**
   - "Add new site" → "Import an existing project" 클릭
   - GitHub 선택
   - `daily-creed-letter` 저장소 선택

3. **빌드 설정**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - (자동으로 Next.js 감지됨)

### Step 2: 환경 변수 설정

Netlify 대시보드에서:

1. **Site settings** → **Environment variables** 클릭

2. **다음 변수들을 추가:**

```
GEMINI_API_KEY = your_gemini_api_key_here
GMAIL_USER = your_email@gmail.com
GMAIL_APP_PASSWORD = your_16_digit_app_password
RECIPIENT_EMAIL = your_email@gmail.com
```

3. **저장** 클릭

### Step 3: Netlify 플러그인 설치

프로젝트의 `package.json`에 다음 의존성 추가가 필요합니다:

```bash
npm install --save-dev @netlify/plugin-nextjs @netlify/functions
```

그리고 커밋:

```bash
git add package.json package-lock.json
git commit -m "Add Netlify plugins"
git push
```

Netlify가 자동으로 재배포합니다.

### Step 4: 배포 확인

1. Netlify 대시보드에서 배포 진행 상황 확인
2. 배포 완료 후 제공된 URL 접속 (예: `https://your-site.netlify.app`)
3. `/diary` 페이지에서 일기 작성 테스트

## ⏰ 자동 발송 설정 (Scheduled Functions)

### 옵션 A: Netlify Scheduled Functions (추천)

Netlify는 Scheduled Functions를 지원합니다.

1. **Netlify CLI 설치**
```bash
npm install -g netlify-cli
netlify login
```

2. **함수 테스트**
```bash
netlify functions:invoke scheduled-letter --no-identity
```

3. **자동 배포 후 스케줄 활성화**

Netlify 대시보드:
- **Functions** 탭 → `scheduled-letter` 확인
- Cron 스케줄: `0 22 * * *` (매일 오전 7시 KST)

**주의:** Netlify Scheduled Functions는 Pro 플랜 이상에서 사용 가능합니다.

### 옵션 B: 외부 Cron 서비스 사용 (무료)

무료 플랜에서는 외부 서비스로 API를 호출합니다.

#### 1. EasyCron 사용

1. https://www.easycron.com 가입 (무료)
2. "Create Cron Job" 클릭
3. 설정:
   - **URL**: `https://your-site.netlify.app/api/daily-creed`
   - **Cron Expression**: `0 22 * * *`
   - **HTTP Method**: GET
   - **Time Zone**: UTC

#### 2. cron-job.org 사용

1. https://cron-job.org 가입 (무료)
2. "Create cronjob" 클릭
3. 설정:
   - **Title**: Daily Creed Letter
   - **URL**: `https://your-site.netlify.app/api/daily-creed`
   - **Schedule**: 매일 22:00 (UTC)
   - **Enabled**: 체크

#### 3. GitHub Actions 사용

`.github/workflows/daily-letter.yml` 파일 생성:

```yaml
name: Daily Letter Sender

on:
  schedule:
    - cron: '0 22 * * *'  # UTC 22:00 = KST 07:00
  workflow_dispatch:  # 수동 실행도 가능

jobs:
  send-letter:
    runs-on: ubuntu-latest
    steps:
      - name: Send daily letter
        run: |
          curl -X GET https://your-site.netlify.app/api/daily-creed
```

GitHub Secrets 필요 없음 (API가 퍼블릭이므로)

커밋 및 푸시:
```bash
git add .github/workflows/daily-letter.yml
git commit -m "Add GitHub Actions for daily letter"
git push
```

## 🧪 테스트

### 1. 일기 작성 테스트
```bash
# 브라우저에서
https://your-site.netlify.app/diary
```

### 2. 편지 발송 테스트
```bash
# 수동으로 API 호출
curl https://your-site.netlify.app/api/daily-creed
```

### 3. 로그 확인
Netlify 대시보드:
- **Functions** → **Function logs**
- 에러나 성공 메시지 확인

## 🔧 데이터베이스 주의사항

### SQLite 제한사항

Netlify는 서버리스 환경이므로 SQLite 파일이 배포마다 초기화됩니다.

**해결 방법: Netlify Blobs 또는 외부 DB 사용**

#### 옵션 1: PlanetScale (무료, 추천)

1. https://planetscale.com 가입
2. 새 데이터베이스 생성
3. Connection String 복사

4. `prisma/schema.prisma` 수정:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
```

5. Netlify 환경 변수에 추가:
```
DATABASE_URL = mysql://...@...planetscale.com/...
```

6. Prisma 마이그레이션:
```bash
npx prisma db push
```

#### 옵션 2: Supabase (무료)

1. https://supabase.com 가입
2. 새 프로젝트 생성
3. Database → Connection String 복사

4. `prisma/schema.prisma` 수정:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

5. Netlify 환경 변수에 추가:
```
DATABASE_URL = postgresql://...@...supabase.co:5432/...
```

#### 옵션 3: Railway (무료)

1. https://railway.app 가입
2. New Project → PostgreSQL 선택
3. Connection String 복사
4. 위 Supabase와 동일하게 설정

## 📊 배포 체크리스트

✅ GitHub 저장소 생성 및 푸시  
✅ Netlify에 Import  
✅ 환경 변수 4개 설정  
✅ 데이터베이스 설정 (PlanetScale/Supabase/Railway)  
✅ 배포 성공 확인  
✅ 일기 작성 테스트  
✅ 편지 발송 API 테스트  
✅ Cron Job 설정 (EasyCron/cron-job.org/GitHub Actions)  
✅ 다음날 아침 이메일 수신 확인  

## 🎉 완료!

이제 Netlify에서 Daily Creed Letter가 완벽하게 작동합니다!

**매일 밤 일기를 쓰면, 다음날 아침 7시에 편지가 도착합니다.** ✉️

## 🐛 문제 해결

### 빌드 에러
```bash
# 로컬에서 빌드 테스트
npm run build
```

### 함수 에러
- Netlify Functions 로그 확인
- 환경 변수가 올바른지 확인
- API 키 유효성 확인

### 이메일 미발송
- Gmail 앱 비밀번호 재확인
- 스팸 폴더 확인
- Functions 로그에서 에러 확인

### 데이터베이스 연결 실패
- `DATABASE_URL` 환경 변수 확인
- 데이터베이스 서비스 상태 확인
- Prisma schema가 올바른지 확인

## 💡 팁

1. **무료 플랜 제한**
   - Netlify 무료: 월 100GB 대역폭, 300분 빌드 시간
   - 개인 사용에는 충분합니다!

2. **커스텀 도메인 연결**
   - Netlify 대시보드 → Domain settings
   - 원하는 도메인 연결 가능

3. **HTTPS 자동 설정**
   - Netlify는 자동으로 Let's Encrypt SSL 인증서 제공

---

**Happy Deploying!** 🚀
