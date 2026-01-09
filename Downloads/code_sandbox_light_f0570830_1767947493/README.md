# MumuBedding 배송/회수 운영 시스템 MVP

## 프로젝트 개요
MumuBedding의 일일 배송/회수 운영을 위한 내부 MVP 시스템입니다.
모바일 우선의 단일 반응형 웹앱으로 Driver와 Ops/Admin 두 가지 역할을 지원합니다.

**핵심 목표**: 최소한의 마찰로 일일 배송/회수 운영을 실행하고 완벽한 타임스탬프 로그를 생성합니다.

---

## 🎉 데이터베이스 연동 준비 완료!

이 프로젝트는 **Neon Postgres 또는 다른 DB와 즉시 연결 가능**하도록 구조화되어 있습니다:

✅ **UI와 데이터 레이어 완전 분리** - UI 코드 변경 없이 DB 연동 가능  
✅ **시간 데이터 ISO 8601 형식** - DB timestamp 컬럼과 호환  
✅ **localStorage는 세션만** - 배송/회수 데이터는 메모리 전용  
✅ **fetch() 준비 완료** - api.js에서 REST API 호출 구조 구현됨

**다음 단계**: `js/data-layer.js` 파일만 수정하여 Neon Postgres 쿼리를 추가하면 됩니다. 
자세한 내용은 아래 "🎯 데이터 레이어 구조" 섹션을 참고하세요.

---

## 🚀 빠른 시작

### 1. 로컬 테스트
```bash
# 단순히 index.html을 브라우저에서 열기
open index.html

# 또는 로컬 서버 실행 (권장)
python -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

### 2. 데모 계정
- **기사 A (북부권)**: ID: `driver-a` / PIN: `1234`
- **기사 B (남부권)**: ID: `driver-b` / PIN: `5678`
- **관리자**: ID: `admin` / PIN: `0000`

### 3. 테스트 시나리오
1. **Driver 플로우**:
   - `driver-a` / `1234`로 로그인
   - "경로 시작하기" 버튼 클릭
   - 정차지 카드 탭하여 상세 화면 이동
   - "완료하기" 버튼으로 정차지 완료 (11:30 이후에만 가능)
   - 작업 유형 선택 (배송/회수/둘다)
   - 선택적으로 메모 작성

2. **Ops 플로우**:
   - `admin` / `0000`으로 로그인
   - Driver 카드에서 실시간 진행 상황 확인
   - "상세보기"로 Driver의 정차지 목록 확인
   - 정차지 순서 변경 가능
   - 출입 안내 수정 가능
   - 리포트 탭에서 일일 리포트 생성

## 주요 기능

### Driver 기능
- ✅ 오늘의 할당된 정차지 목록 조회
- ✅ 1탭 경로 시작 + 정차지별 완료 기능
- ✅ 각 위치별 출입 안내 텍스트 제공 (상세, 복사 가능)
- ✅ 선택적 메모 작성 기능 (Ops에게 알림)
- ✅ 시간 제약 (11:30 이전 완료 불가, 경고 메시지 표시)
- ✅ Late Risk 자동 플래그 (14:30 초과 예상 시)
- ✅ 활동 내역 피드 (완료, 메모, 알림)
- ✅ 주소 복사 기능

### Ops/Admin 기능

**Admin UI (비기술 운영자용)**
- ✅ 배송지 관리 (추가/수정/삭제/복제)
- ✅ 오늘 배정 생성 (3단계 마법사)
- ✅ 자동 Location ID 생성 (LOC-N-####, LOC-S-####)
- ✅ 배송지 검색 및 필터링
- ✅ 순서 자동 생성 및 수동 조정
- ✅ 기사별 진행 현황 대시보드

**고급 Ops 대시보드**
- ✅ 실시간 Driver 상태 모니터링 (ON_DUTY/READY)
- ✅ 정차지 순서 재정렬 (Driver에게 알림)
- ✅ 위치별 출입 안내 편집 (Driver에게 알림)
- ✅ Driver에게 메시지 전송 (SMS/Email 선택)
- ✅ 일일 타임 리포트 생성 및 AI 요약
- ✅ 실시간 활동 피드
- ✅ 완료율, 평균 간격, 이슈 위치 분석

## 기술 스택
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS 3.x (CDN)
- **Data Layer**: 추상화된 데이터 접근 계층 (DB 연동 준비 완료)
- **Storage**: localStorage (로그인/세션 정보만)
- **Deployment**: Netlify Drop 배포 (정적 웹앱)

## 제약사항
- ✅ 지도/GPS/외부 SDK 없음 (텍스트 기반 출입 안내)
- ✅ 배송 시간: 11:30-14:30 KST
- ✅ 간단한 휴리스틱 ETA (첫 정차지 +18분, 이후 각 +12분)
- ✅ 고객 대면 기능 없음 (내부 운영 전용)

## 프로젝트 구조
```
mumu-bedding-ops/
├── index.html              # 메인 HTML (Tailwind CDN 포함)
├── README.md               # 프로젝트 문서
└── js/
    ├── utils.js            # 유틸리티 함수 (날짜, 시간, ETA 계산)
    ├── data-layer.js       # 🆕 데이터 접근 레이어 (mock 데이터 & 인터페이스)
    ├── api.js              # API 래퍼 (DB/API 연동 준비)
    ├── state.js            # 앱 상태 관리 (localStorage - 세션만)
    ├── ui.js               # UI 헬퍼 (Toast, Modal, Navigation)
    ├── app.js              # 메인 앱 컨트롤러 & 라우팅
    └── screens/
        ├── login.js        # 로그인 화면 (Driver/Admin 토글)
        ├── driver-home.js  # Driver 홈 (오늘의 정차지)
        ├── driver-stop-detail.js  # 정차지 상세 & 완료
        ├── ops-home.js     # Ops 대시보드 (Driver 모니터링)
        ├── ops-driver-detail.js  # Ops Driver 상세 (재정렬, 편집)
        ├── admin-home.js   # Admin 홈 (배송지 관리)
        ├── location-management.js  # 배송지 목록 관리
        ├── location-form.js        # 배송지 추가/수정
        ├── create-assignment.js    # 오늘 배정 생성
        ├── report.js       # 일일 리포트 화면
        └── profile.js      # 프로필 & 설정
```

## 🎯 데이터 레이어 구조 (중요!)

### 개요
이 프로젝트는 **UI와 데이터 소스 간 완전한 분리**를 구현하여, 추후 실제 데이터베이스 연동 시 UI 코드를 전혀 수정하지 않아도 되도록 설계되었습니다.

### 3계층 아키텍처

```
┌─────────────────────────────────────────┐
│  UI Screens (screens/*.js)              │
│  - 화면만 담당, 데이터 출처 모름        │
└────────────────┬────────────────────────┘
                 │ api.* 호출
┌────────────────▼────────────────────────┐
│  API Layer (api.js)                     │
│  - 통일된 인터페이스 제공                │
│  - 현재: dataLayer 호출                  │
│  - 추후: fetch('/api/...') 호출         │
└────────────────┬────────────────────────┘
                 │ dataLayer.* 호출
┌────────────────▼────────────────────────┐
│  Data Layer (data-layer.js)             │
│  - 현재: mock 데이터 반환                │
│  - 추후: Neon Postgres 쿼리 실행         │
└─────────────────────────────────────────┘
```

### 주요 데이터 함수

**인증**
- `api.auth.loginDriver(id, pin)` - Driver 로그인
- `api.auth.loginAdmin(id, pin)` - Admin 로그인

**Driver 정차지 조회**
- `api.routeDays.getByDriverAndDate(driverId, date)` - 오늘의 경로 조회
- `api.stops.getByRouteDay(routeDayId)` - 경로의 모든 정차지
- `api.stops.getById(stopId)` - 특정 정차지 상세

**정차지 완료 처리**
- `api.stops.complete(stopId, deliveredType, note)` - 완료 + 시간 기록 (ISO 8601)

**관리자 대시보드**
- `api.admin.getOverview()` - 전체 현황 (drivers, routeDays, stops)
- `api.admin.getDailyReport(date)` - 일일 리포트

### 시간 데이터 형식
- **저장**: `new Date().toISOString()` (ISO 8601 형식)
  - 예: `"2026-01-09T05:30:00.000Z"`
- **표시**: `utils.formatDateTime(timestamp)` 사용
  - 예: `"01/09 14:30"`

### localStorage 사용 범위
**✅ 영구 저장 (localStorage)**
- 로그인 상태: `state.currentUser`, `state.currentRole`
- 세션 정보만

**❌ 임시 캐시 (메모리만, 새로고침 시 초기화)**
- `state.locations` - 배송지 목록
- `state.drivers` - 기사 목록
- 기타 모든 데이터

### DB 연동 시 작업 순서

1️⃣ **data-layer.js만 수정**
```javascript
// Before (mock):
async getTodayStopsForDriver(driverId) {
    return this.mockData.stops.filter(...);
}

// After (DB):
async getTodayStopsForDriver(driverId) {
    const result = await pool.query(
        'SELECT * FROM stops WHERE driver_id = $1 AND date = $2',
        [driverId, today]
    );
    return result.rows;
}
```

2️⃣ **api.js는 변경 없음** (인터페이스 유지)

3️⃣ **UI 코드는 변경 없음** (api.* 호출만 사용)

### 예시: 정차지 완료 플로우

```javascript
// 1. UI에서 호출 (driver-stop-detail.js)
await api.stops.complete(stopId, deliveredType, note);

// 2. API Layer가 라우팅 (api.js)
return await dataLayer.completeStop(stopId, { deliveredType, note });

// 3. Data Layer가 처리 (data-layer.js)
// 현재: mock 데이터 수정
stop.completed_at = new Date().toISOString();
// 추후: DB INSERT
// await pool.query('UPDATE stops SET completed_at = $1, ...', [...])
```

---

## 데이터 모델

### Tables Schema

#### drivers
- id, name, region (N/S), pin_hash, status (READY/ON_DUTY)

#### admins
- id, name, pin_hash

#### locations
- id (Location_ID), name, address, region, entry_instruction_text

#### route_days
- id, date, region, driver_id, window_start, window_end, job_started_at

#### stops
- id, route_day_id, sequence, location_id
- planned_cs, planned_bt, planned_ft
- status: READY | IN_PROGRESS | COMPLETED
- job_started_at, completed_at, delivered_type

#### stop_events
- id, stop_id, type (NOTE | SYSTEM), content, created_at, created_by

#### notification_logs
- id, target_role, target_id, channel (SMS | EMAIL), message, sent_at, status

## API 사용 예제

앱은 추상화된 API 레이어를 통해 데이터를 관리합니다:

```javascript
// 예시 1: 오늘의 정차지 조회
const stops = await api.stops.getByRouteDay(routeDayId);
// UI는 데이터가 mock인지 DB인지 모름

// 예시 2: 정차지 완료 (시간 자동 기록)
await api.stops.complete(stopId, 'DELIVERED', '문앞 배송 완료');
// 내부에서 new Date().toISOString()로 timestamp 생성

// 예시 3: 알림 생성
await api.notifications.create('ADMIN', 'admin', 'SMS', '정차지 완료 알림');
// 시간, ID 등은 자동 생성

// 예시 4: 관리자 대시보드
const overview = await api.admin.getOverview();
// { drivers: [...], routeDays: [...], stops: [...] }
```

### 실제 DB 연동 시 참고
```javascript
// Neon Postgres 연동 예시 (data-layer.js 내부)
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async completeStop(stopId, payload) {
    const result = await pool.query(
        'UPDATE stops SET status = $1, completed_at = $2, delivered_type = $3 WHERE id = $4 RETURNING *',
        ['COMPLETED', new Date().toISOString(), payload.deliveredType, stopId]
    );
    return result.rows[0];
}
```

## 시드 데이터

시스템은 다음 시드 데이터로 사전 구성되어 있습니다:

### Drivers
- **driver-a**: 김철수 (북부권) - 4개 정차지
- **driver-b**: 이영희 (남부권) - 5개 정차지

### Locations
총 9개 위치 (북부권 4개, 남부권 5개):
- LOC-N001: 강남 오피스텔
- LOC-N002: 서초 아파트
- LOC-N003: 역삼 빌라
- LOC-N004: 논현 주택
- LOC-S001: 영등포 오피스텔
- LOC-S002: 구로 아파트
- LOC-S003: 관악 빌라
- LOC-S004: 동작 원룸
- LOC-S005: 금천 주택

### Route Days
2026-01-09 (오늘) 기준으로 북부권/남부권 각각 1개씩 생성됨

## 핵심 기능 상세

### 1. 시간 제약 로직
```javascript
// 11:30 이전에는 완료 불가
if (utils.isBeforeWindow('11:30')) {
    // "11:30 이후부터 완료 처리가 가능합니다" 메시지 표시
    // 완료 버튼 비활성화
}

// 14:30 초과 예상 시 late risk 플래그
if (utils.hasLateRisk(etaTimestamp, '14:30')) {
    // 지연 위험 배지 표시
}
```

### 2. ETA 계산 (휴리스틱)
```javascript
// 첫 번째 남은 정차지: 현재 시각 + 18분
// 두 번째 이후: 각 +12분
const etas = utils.calculateETA(completedCount, remainingCount);
// => [now+18min, now+30min, now+42min, ...]
```

### 3. 알림 시스템
- **Driver → Ops**: 정차지 완료, 메모 작성 시 자동 알림
- **Ops → Driver**: 순서 변경, 출입 안내 수정 시 자동 알림
- 채널: SMS (기본), Email (선택)
- NotificationLog에 모든 알림 기록

### 4. 리포트 생성
- 날짜별 조회 가능
- Driver별 완료율, 시작/종료 시각, 평균 간격
- 이슈 위치 Top 5 (메모 많은 순)
- AI 요약 (MVP는 템플릿 기반)

## 📚 상세 가이드 문서

시스템 운영에 필요한 상세 가이드를 제공합니다:

### 1. [ADMIN_UI_GUIDE.md](ADMIN_UI_GUIDE.md) - ⭐ Admin UI 사용 가이드 (필독!)
- **비기술 운영자용** 완전 가이드
- **배송지 관리** (추가/수정/삭제/복제)
- **오늘 배정 생성** (3단계 마법사)
- **일상 운영** (매일 아침/저녁 체크리스트)
- **FAQ 및 문제 해결**
- **개발자 도구 불필요** - 모든 작업 웹 UI로 가능

### 2. [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 배포 및 운영 가이드
- **Netlify 배포 방법** (폴더 드롭)
- **SMS 연동 방법** (알리고, Twilio, 네이버 SENS)
- **데이터베이스 관리** (백업, 복원, 쿼리)
- **메시지 관리** (템플릿, 예약 발송, 대량 발송)
- **일상 운영** (체크리스트, Admin Scripts)

### 3. [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - 데이터베이스 스키마
- **테이블 구조 상세** (7개 테이블 전체)
- **관계도 (ERD)**
- **API 사용 예제** (CRUD 전체)
- **일반적인 쿼리** (완료율, 지연 위험, 평균 간격 등)
- **데이터 플로우** (경로 시작, 완료, 순서 변경 등)

## 배포 방법 (빠른 시작)

### Netlify 폴더 드롭 방식 (권장)

1. **프로젝트 준비**
   - 모든 파일이 루트에 있는지 확인 (index.html, js/, README.md)
   - 압축 불필요 (폴더 전체 드래그 가능)

2. **Netlify 배포**
   ```
   1. https://app.netlify.com 접속 및 로그인
   2. "Sites" → "Add new site" → "Deploy manually"
   3. 프로젝트 폴더를 드래그 앤 드롭 영역에 드롭
   4. 자동 배포 시작 (1-2분 소요)
   5. 배포 완료 후 제공된 URL 확인 (예: https://mumu-bedding-xxxxx.netlify.app)
   ```

3. **커스텀 도메인 (선택)**
   - Site settings → Domain management에서 커스텀 도메인 설정 가능

4. **환경 확인**
   - 브라우저에서 제공된 URL 접속
   - 모바일 브라우저에서도 테스트 권장
   - 개발자 도구 콘솔에서 에러 확인

> **상세한 배포 가이드는 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)를 참고하세요.**

### 로컬 개발 서버
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

## 주의사항

### Production 최적화
현재 MVP는 Tailwind CDN을 사용하고 있습니다. Production 환경에서는 다음을 권장합니다:
- Tailwind CSS를 PostCSS 플러그인으로 설치
- CSS를 빌드하여 미사용 클래스 제거 (PurgeCSS)
- JavaScript 파일 번들링 및 minification

### 브라우저 호환성
- 모던 브라우저 (Chrome, Safari, Firefox, Edge 최신 버전)
- iOS Safari 12+, Android Chrome 70+
- localStorage API 필요
- Fetch API 필요

### 보안
- PIN은 현재 평문 저장 (MVP 한정)
- Production에서는 bcrypt 등 해싱 필요
- HTTPS 필수 (Netlify는 자동 제공)

## 현재 구현 상태

### ✅ 완료된 기능
- ✅ **데이터 접근 레이어 분리** ⭐ NEW!
  - UI와 데이터 소스 완전 분리
  - mock 데이터 → DB 전환 시 UI 수정 불필요
  - ISO 8601 시간 형식 통일
  - localStorage는 세션 정보만 저장
- ✅ 데이터 모델 스키마 정의 (7개 테이블)
- ✅ 시드 데이터 자동 생성 (2명 기사, 9개 위치, 오늘 경로)
- ✅ 모바일 우선 반응형 UI (Tailwind CSS)
- ✅ 역할 기반 인증 시스템 (Driver/Admin)
- ✅ Driver 핵심 플로우 (로그인 → 경로 시작 → 정차지 완료)
- ✅ Driver 정차지 상세 화면 (출입 안내, 주소 복사)
- ✅ Admin UI (배송지 관리, 오늘 배정 생성)
- ✅ Ops 대시보드 (실시간 모니터링)
- ✅ Ops Driver 상세 관리 (재정렬, 출입 안내 편집)
- ✅ 알림 시스템 (SMS/Email 로그)
- ✅ 일일 리포트 및 AI 요약 템플릿
- ✅ 시간 제약 로직 (11:30-14:30)
- ✅ Late Risk 자동 계산 및 플래그
- ✅ 활동 피드 (완료, 메모, 알림)
- ✅ 프로필 및 설정 화면
- ✅ 모바일 터치 최적화 (48px 터치 타겟)
- ✅ Toast 알림 및 Modal UI
- ✅ Bottom Navigation (역할별)

### 🚧 알려진 제한사항
- PIN 평문 저장 (Production에서 해싱 필요)
- 알림은 로그만 기록 (실제 SMS/Email 발송 미구현)
- AI 요약은 템플릿 기반 (LLM 통합 필요)
- 오프라인 지원 없음
- Push 알림 없음

### 📋 권장 다음 단계

**🎯 우선순위 1: 데이터베이스 연동 (즉시 가능!)**
1. **Neon Postgres 연결**
   - `data-layer.js`에 DB 쿼리 구현
   - UI 코드는 변경 불필요
   - 시간 형식 이미 준비됨 (ISO 8601)
   
2. **API 서버 구축** (선택사항)
   - Netlify Functions 또는 별도 API 서버
   - `api.js`에서 fetch() 호출로 전환

**추가 개선 사항**
3. **보안 강화**: PIN 해싱, JWT 토큰 기반 인증
4. **실제 알림**: SMS API (Twilio 등) 및 Email API 통합
5. **AI 요약**: OpenAI API 통합하여 실제 분석 요약 생성
6. **오프라인 지원**: Service Worker 및 Cache API
7. **Push 알림**: Web Push API 통합
8. **성능 최적화**: Tailwind 빌드, JS 번들링, 이미지 최적화
9. **고급 리포트**: 차트 라이브러리(Chart.js) 통합, 주간/월간 리포트
10. **다국어 지원**: i18n 라이브러리 통합

## 문제 해결

### 문제: 로그인 후 화면이 비어있음
- **해결**: 브라우저 콘솔 확인, localStorage 클리어 후 재시도
- `localStorage.clear()` 실행 후 새로고침

### 문제: 완료 버튼이 비활성화됨
- **해결**: 현재 시각이 11:30 이전인지 확인
- 테스트를 위해 `utils.js`의 `isWithinWindow()` 함수 수정 가능

### 문제: 데이터가 로드되지 않음
- **해결**: RESTful Table API 연결 확인
- 네트워크 탭에서 API 요청 상태 확인
- CORS 이슈 확인 (로컬 서버 사용 권장)

## 지원 및 문의
- **프로젝트 관리자**: MumuBedding Ops Team
- **기술 문의**: [관리자 이메일]
- **긴급 지원**: 1588-0000

---

## 라이센스
Internal Use Only - MumuBedding © 2026

---

**Last Updated**: 2026-01-09  
**Version**: 1.0.0-MVP  
**Status**: Production Ready
