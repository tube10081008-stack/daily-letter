# MumuBedding 데이터베이스 스키마 상세 가이드

## 목차
1. [전체 구조 개요](#1-전체-구조-개요)
2. [테이블별 상세 설명](#2-테이블별-상세-설명)
3. [관계도 (ERD)](#3-관계도-erd)
4. [일반적인 쿼리 예제](#4-일반적인-쿼리-예제)
5. [데이터 플로우](#5-데이터-플로우)

---

## 1. 전체 구조 개요

### 데이터베이스 타입
- **RESTful Table API**: 플랫폼 제공 내장 데이터베이스
- **접근 방식**: HTTP REST API (GET, POST, PUT, PATCH, DELETE)
- **데이터 형식**: JSON
- **저장 위치**: 플랫폼 서버 (프로젝트별 독립 공간)

### 테이블 목록
```
1. drivers          - 배송 기사 정보
2. admins           - 관리자 정보
3. locations        - 배송지 정보
4. route_days       - 일일 경로 정보
5. stops            - 정차지 정보 (route_days의 세부 항목)
6. stop_events      - 정차지 이벤트 (메모, 시스템 로그)
7. notification_logs - 알림 발송 기록
```

### 시스템 필드 (자동 생성)
모든 레코드는 다음 시스템 필드를 자동으로 가집니다:
```javascript
{
    id: "user-defined-id",           // 사용자 정의 ID (필수)
    gs_project_id: "auto-generated", // 프로젝트 ID (자동)
    gs_table_name: "table_name",     // 테이블 이름 (자동)
    created_at: 1234567890000,       // 생성 시각 밀리초 (자동)
    updated_at: 1234567890000        // 수정 시각 밀리초 (자동)
}
```

---

## 2. 테이블별 상세 설명

### 2.1 drivers (배송 기사)

#### 스키마
| 필드명 | 타입 | 설명 | 예제 | 필수 |
|--------|------|------|------|------|
| id | text | 기사 고유 ID (로그인 ID) | "driver-a" | ✓ |
| name | text | 기사 이름 | "김철수" | ✓ |
| region | text | 담당 구역 (N/S) | "N" | ✓ |
| pin_hash | text | PIN 번호 (현재 평문) | "1234" | ✓ |
| status | text | 현재 상태 | "READY" 또는 "ON_DUTY" | ✓ |
| phone_number | text | 전화번호 (SMS용) | "01012345678" | - |

#### 샘플 데이터
```json
{
    "id": "driver-a",
    "name": "김철수",
    "region": "N",
    "pin_hash": "1234",
    "status": "READY",
    "phone_number": "01012345678"
}
```

#### API 사용 예제
```javascript
// 모든 기사 조회
GET /tables/drivers?limit=100

// 특정 기사 조회
GET /tables/drivers/driver-a

// 기사 상태 업데이트
PATCH /tables/drivers/driver-a
Body: { "status": "ON_DUTY" }

// 새 기사 추가
POST /tables/drivers
Body: {
    "id": "driver-c",
    "name": "박민수",
    "region": "N",
    "pin_hash": "9999",
    "status": "READY"
}
```

#### 비즈니스 규칙
- `id`는 로그인 시 사용되므로 변경 불가
- `region`은 "N" (북부권) 또는 "S" (남부권)만 허용
- `status`는 경로 시작 시 "ON_DUTY"로 자동 변경
- `pin_hash`는 Production에서 bcrypt로 해싱 필요

---

### 2.2 admins (관리자)

#### 스키마
| 필드명 | 타입 | 설명 | 예제 | 필수 |
|--------|------|------|------|------|
| id | text | 관리자 고유 ID | "admin" | ✓ |
| name | text | 관리자 이름 | "관리자" | ✓ |
| pin_hash | text | PIN 번호 | "0000" | ✓ |
| phone_number | text | 전화번호 | "01099999999" | - |

#### 샘플 데이터
```json
{
    "id": "admin",
    "name": "관리자",
    "pin_hash": "0000",
    "phone_number": "01099999999"
}
```

#### API 사용 예제
```javascript
// 모든 관리자 조회
GET /tables/admins?limit=100

// 관리자 정보 수정
PATCH /tables/admins/admin
Body: { "name": "최고관리자" }
```

---

### 2.3 locations (배송지)

#### 스키마
| 필드명 | 타입 | 설명 | 예제 | 필수 |
|--------|------|------|------|------|
| id | text | 배송지 고유 ID | "LOC-N001" | ✓ |
| name | text | 배송지 이름 | "강남 오피스텔" | ✓ |
| address | text | 전체 주소 | "서울시 강남구 테헤란로 123" | ✓ |
| region | text | 구역 (N/S) | "N" | ✓ |
| entry_instruction_text | rich_text | 출입 안내 상세 | "1층 로비 경비실에서..." | ✓ |

#### 샘플 데이터
```json
{
    "id": "LOC-N001",
    "name": "강남 오피스텔",
    "address": "서울시 강남구 테헤란로 123",
    "region": "N",
    "entry_instruction_text": "1층 로비 경비실에서 방문증 수령 후 3동 엘리베이터 이용. 1502호 비밀번호 #1234*"
}
```

#### API 사용 예제
```javascript
// 모든 배송지 조회
GET /tables/locations?limit=100

// 북부권 배송지만 조회
const response = await fetch('tables/locations?limit=100');
const data = await response.json();
const northLocations = data.data.filter(loc => loc.region === 'N');

// 출입 안내 수정
PATCH /tables/locations/LOC-N001
Body: { "entry_instruction_text": "새로운 출입 안내" }

// 새 배송지 추가
POST /tables/locations
Body: {
    "id": "LOC-N010",
    "name": "신규 아파트",
    "address": "서울시 강남구 역삼로 456",
    "region": "N",
    "entry_instruction_text": "정문 경비실 방문"
}
```

#### 비즈니스 규칙
- `id`는 "LOC-{region}{숫자}" 형식 권장
- `entry_instruction_text`는 Driver가 현장에서 참고하는 핵심 정보
- Ops가 앱에서 직접 수정 가능
- 수정 시 해당 location을 포함한 경로의 Driver에게 자동 알림

---

### 2.4 route_days (일일 경로)

#### 스키마
| 필드명 | 타입 | 설명 | 예제 | 필수 |
|--------|------|------|------|------|
| id | text | 경로 고유 ID | "route-2026-01-09-n" | ✓ |
| date | text | 날짜 (YYYY-MM-DD) | "2026-01-09" | ✓ |
| region | text | 구역 (N/S) | "N" | ✓ |
| driver_id | text | 할당된 기사 ID | "driver-a" | ✓ |
| window_start | text | 배송 시작 시각 (HH:MM) | "11:30" | ✓ |
| window_end | text | 배송 종료 시각 (HH:MM) | "14:30" | ✓ |
| job_started_at | number | 경로 시작 시각 (밀리초) | 1704780600000 | ✓ |

#### 샘플 데이터
```json
{
    "id": "route-2026-01-09-n",
    "date": "2026-01-09",
    "region": "N",
    "driver_id": "driver-a",
    "window_start": "11:30",
    "window_end": "14:30",
    "job_started_at": 1704780600000
}
```

#### API 사용 예제
```javascript
// 오늘의 모든 경로 조회
const today = new Date().toISOString().split('T')[0];
const response = await fetch('tables/route_days?limit=100');
const data = await response.json();
const todayRoutes = data.data.filter(r => r.date === today);

// 특정 기사의 오늘 경로 조회
const driverRoutes = todayRoutes.filter(r => r.driver_id === 'driver-a');

// 경로 시작
PATCH /tables/route_days/route-2026-01-09-n
Body: { "job_started_at": Date.now() }

// 내일 경로 생성
POST /tables/route_days
Body: {
    "id": "route-2026-01-10-n",
    "date": "2026-01-10",
    "region": "N",
    "driver_id": "driver-a",
    "window_start": "11:30",
    "window_end": "14:30",
    "job_started_at": 0
}
```

#### 비즈니스 규칙
- 하루에 region당 1개의 route_day (총 2개: N, S)
- `job_started_at`은 Driver가 "경로 시작" 버튼 클릭 시 자동 기록
- `job_started_at = 0`은 아직 시작 안 함
- 매일 새로운 route_days 생성 필요

---

### 2.5 stops (정차지)

#### 스키마
| 필드명 | 타입 | 설명 | 예제 | 필수 |
|--------|------|------|------|------|
| id | text | 정차지 고유 ID | "stop-n-001" | ✓ |
| route_day_id | text | 소속 route_day ID | "route-2026-01-09-n" | ✓ |
| sequence | number | 순서 번호 | 1 | ✓ |
| location_id | text | 배송지 ID | "LOC-N001" | ✓ |
| planned_cs | number | 예정 이불세트 수 | 3 | ✓ |
| planned_bt | number | 예정 대형 수건 수 | 6 | ✓ |
| planned_ft | number | 예정 소형 수건 수 | 6 | ✓ |
| status | text | 상태 | "READY", "IN_PROGRESS", "COMPLETED" | ✓ |
| job_started_at | number | 시작 시각 (밀리초) | 1704780600000 | ✓ |
| completed_at | number | 완료 시각 (밀리초) | 1704782400000 | ✓ |
| delivered_type | text | 완료 유형 | "DELIVERED", "COLLECTED", "BOTH" | - |

#### 샘플 데이터
```json
{
    "id": "stop-n-001",
    "route_day_id": "route-2026-01-09-n",
    "sequence": 1,
    "location_id": "LOC-N001",
    "planned_cs": 3,
    "planned_bt": 6,
    "planned_ft": 6,
    "status": "COMPLETED",
    "job_started_at": 1704780600000,
    "completed_at": 1704782400000,
    "delivered_type": "DELIVERED"
}
```

#### API 사용 예제
```javascript
// 특정 route_day의 모든 stops 조회 (순서대로)
const response = await fetch('tables/stops?limit=1000');
const data = await response.json();
const routeStops = data.data
    .filter(s => s.route_day_id === 'route-2026-01-09-n')
    .sort((a, b) => a.sequence - b.sequence);

// 완료된 stops만 조회
const completed = data.data.filter(s => s.status === 'COMPLETED');

// Stop 완료 처리
PATCH /tables/stops/stop-n-001
Body: {
    "status": "COMPLETED",
    "completed_at": Date.now(),
    "delivered_type": "DELIVERED"
}

// Stop 순서 변경
PATCH /tables/stops/stop-n-001
Body: { "sequence": 3 }
```

#### 비즈니스 규칙
- `sequence`는 1부터 시작하는 연속 번호
- `status`:
  - "READY": 대기 중
  - "IN_PROGRESS": 진행 중 (현재 미사용)
  - "COMPLETED": 완료
- `completed_at = 0`은 미완료
- `delivered_type`은 완료 시에만 값 설정
- 11:30 이전에는 완료 처리 불가
- 완료 시 ops에게 자동 알림

---

### 2.6 stop_events (정차지 이벤트)

#### 스키마
| 필드명 | 타입 | 설명 | 예제 | 필수 |
|--------|------|------|------|------|
| id | text | 이벤트 고유 ID | "event-123..." | ✓ |
| stop_id | text | 정차지 ID | "stop-n-001" | ✓ |
| type | text | 이벤트 유형 | "NOTE" 또는 "SYSTEM" | ✓ |
| content | rich_text | 내용 | "고객 부재로..." | ✓ |
| created_at | number | 생성 시각 (밀리초) | 1704780600000 | ✓ |
| created_by | text | 생성자 ID | "driver-a" | ✓ |

#### 샘플 데이터
```json
{
    "id": "event-1704780600000-abc123",
    "stop_id": "stop-n-001",
    "type": "NOTE",
    "content": "고객 부재로 경비실에 보관했습니다.",
    "created_at": 1704780600000,
    "created_by": "driver-a"
}
```

#### API 사용 예제
```javascript
// 특정 stop의 모든 이벤트 조회
const response = await fetch('tables/stop_events?limit=1000');
const data = await response.json();
const stopEvents = data.data
    .filter(e => e.stop_id === 'stop-n-001')
    .sort((a, b) => b.created_at - a.created_at); // 최신순

// 메모만 조회
const notes = data.data.filter(e => e.type === 'NOTE');

// 새 메모 추가
POST /tables/stop_events
Body: {
    "id": "event-" + Date.now() + "-" + Math.random().toString(36),
    "stop_id": "stop-n-001",
    "type": "NOTE",
    "content": "특이사항 없음",
    "created_at": Date.now(),
    "created_by": "driver-a"
}

// 시스템 이벤트 추가
POST /tables/stop_events
Body: {
    "id": "event-...",
    "stop_id": "stop-n-001",
    "type": "SYSTEM",
    "content": "정차지 완료: 배송완료",
    "created_at": Date.now(),
    "created_by": "system"
}
```

#### 비즈니스 규칙
- `type`:
  - "NOTE": Driver가 작성한 메모 → Ops에게 알림
  - "SYSTEM": 시스템 자동 생성 로그
- NOTE 생성 시 ops에게 SMS/Email 알림
- 삭제 불가 (감사 로그 용도)

---

### 2.7 notification_logs (알림 기록)

#### 스키마
| 필드명 | 타입 | 설명 | 예제 | 필수 |
|--------|------|------|------|------|
| id | text | 알림 고유 ID | "notif-123..." | ✓ |
| target_role | text | 수신자 역할 | "DRIVER" 또는 "ADMIN" | ✓ |
| target_id | text | 수신자 ID | "driver-a" | ✓ |
| channel | text | 발송 채널 | "SMS" 또는 "EMAIL" | ✓ |
| message | rich_text | 메시지 내용 | "[완료] 김철수 - 강남..." | ✓ |
| sent_at | number | 발송 시각 (밀리초) | 1704780600000 | ✓ |
| status | text | 발송 상태 | "PENDING", "SENT", "FAILED" | ✓ |

#### 샘플 데이터
```json
{
    "id": "notif-1704780600000-xyz789",
    "target_role": "ADMIN",
    "target_id": "admin",
    "channel": "SMS",
    "message": "[완료] 김철수 - 강남 오피스텔",
    "sent_at": 1704780600000,
    "status": "SENT"
}
```

#### API 사용 예제
```javascript
// 모든 알림 조회 (최신순)
GET /tables/notification_logs?limit=1000&sort=-sent_at

// 특정 사용자의 알림 조회
const response = await fetch('tables/notification_logs?limit=1000');
const data = await response.json();
const userNotifications = data.data.filter(n => 
    n.target_role === 'DRIVER' && n.target_id === 'driver-a'
);

// 새 알림 생성
POST /tables/notification_logs
Body: {
    "id": "notif-" + Date.now() + "-" + Math.random().toString(36),
    "target_role": "DRIVER",
    "target_id": "driver-a",
    "channel": "SMS",
    "message": "정차지 순서가 변경되었습니다.",
    "sent_at": Date.now(),
    "status": "SENT"
}

// 발송 상태 업데이트
PATCH /tables/notification_logs/notif-123...
Body: { "status": "SENT" }
```

#### 비즈니스 규칙
- 모든 알림은 반드시 로그 기록
- `status`:
  - "PENDING": 발송 대기
  - "SENT": 발송 완료
  - "FAILED": 발송 실패
- SMS 연동 전에는 stub 구현 (로그만 기록)
- 감사 추적용이므로 삭제 불가

---

## 3. 관계도 (ERD)

```
┌─────────────┐
│  drivers    │
│─────────────│
│ id (PK)     │───┐
│ name        │   │
│ region      │   │
│ pin_hash    │   │
│ status      │   │
└─────────────┘   │
                  │
                  │ driver_id (FK)
                  │
┌─────────────┐   │    ┌──────────────┐
│  admins     │   │    │ route_days   │
│─────────────│   │    │──────────────│
│ id (PK)     │   └───→│ id (PK)      │───┐
│ name        │        │ date         │   │
│ pin_hash    │        │ region       │   │
└─────────────┘        │ driver_id    │   │
                       │ window_start │   │
                       │ window_end   │   │
                       │ job_started  │   │
                       └──────────────┘   │
                                          │ route_day_id (FK)
┌──────────────┐                          │
│  locations   │                          │
│──────────────│                          │
│ id (PK)      │───┐                      │
│ name         │   │                      │
│ address      │   │                      │
│ region       │   │                      │
│ entry_text   │   │                      │
└──────────────┘   │ location_id (FK)    │
                   │                      │
                   │    ┌─────────────┐   │
                   └───→│   stops     │←──┘
                        │─────────────│
                        │ id (PK)     │───┐
                        │ route_day_id│   │
                        │ sequence    │   │
                        │ location_id │   │
                        │ planned_*   │   │
                        │ status      │   │
                        │ completed_at│   │
                        └─────────────┘   │
                                          │ stop_id (FK)
                                          │
                        ┌──────────────┐  │
                        │ stop_events  │←─┘
                        │──────────────│
                        │ id (PK)      │
                        │ stop_id      │
                        │ type         │
                        │ content      │
                        │ created_at   │
                        │ created_by   │
                        └──────────────┘

┌─────────────────────┐
│ notification_logs   │
│─────────────────────│
│ id (PK)             │
│ target_role         │
│ target_id           │  (참조: drivers.id 또는 admins.id)
│ channel             │
│ message             │
│ sent_at             │
│ status              │
└─────────────────────┘
```

### 관계 설명

1. **drivers → route_days**: 1:N
   - 한 기사는 여러 날의 경로를 가질 수 있음
   - 하루에는 1개의 경로만 할당

2. **route_days → stops**: 1:N
   - 한 경로는 여러 정차지를 가짐
   - stops는 sequence로 정렬됨

3. **locations → stops**: 1:N
   - 한 배송지는 여러 날에 여러 번 방문될 수 있음
   - stop은 특정 날짜의 특정 location 방문 기록

4. **stops → stop_events**: 1:N
   - 한 정차지는 여러 이벤트(메모, 로그)를 가질 수 있음

5. **notification_logs**: 독립적
   - target_id로 drivers 또는 admins를 참조
   - 하지만 FK 제약은 없음 (유연성)

---

## 4. 일반적인 쿼리 예제

### 4.1 오늘의 Driver A 경로 전체 조회

```javascript
async function getTodayRouteForDriverA() {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. 오늘의 route_day 찾기
    const routeDaysRes = await fetch('tables/route_days?limit=100');
    const routeDays = await routeDaysRes.json();
    const routeDay = routeDays.data.find(r => 
        r.date === today && r.driver_id === 'driver-a'
    );
    
    if (!routeDay) return null;
    
    // 2. 해당 route_day의 stops 조회
    const stopsRes = await fetch('tables/stops?limit=1000');
    const stops = await stopsRes.json();
    const routeStops = stops.data
        .filter(s => s.route_day_id === routeDay.id)
        .sort((a, b) => a.sequence - b.sequence);
    
    // 3. 각 stop의 location 정보 가져오기
    const locationsRes = await fetch('tables/locations?limit=100');
    const locations = await locationsRes.json();
    
    const enrichedStops = routeStops.map(stop => ({
        ...stop,
        location: locations.data.find(loc => loc.id === stop.location_id)
    }));
    
    return {
        routeDay,
        stops: enrichedStops
    };
}
```

### 4.2 완료율 계산

```javascript
async function calculateCompletionRate(routeDayId) {
    const response = await fetch('tables/stops?limit=1000');
    const data = await response.json();
    const stops = data.data.filter(s => s.route_day_id === routeDayId);
    
    const total = stops.length;
    const completed = stops.filter(s => s.status === 'COMPLETED').length;
    const rate = (completed / total * 100).toFixed(1);
    
    return {
        total,
        completed,
        remaining: total - completed,
        rate: rate + '%'
    };
}
```

### 4.3 지연 위험 정차지 찾기

```javascript
async function findLateRiskStops(routeDayId) {
    const response = await fetch('tables/stops?limit=1000');
    const data = await response.json();
    const stops = data.data
        .filter(s => s.route_day_id === routeDayId)
        .sort((a, b) => a.sequence - b.sequence);
    
    const completedCount = stops.filter(s => s.status === 'COMPLETED').length;
    const remainingStops = stops.filter(s => s.status !== 'COMPLETED');
    
    // ETA 계산 (휴리스틱)
    const lateRiskStops = [];
    const windowEnd = new Date();
    windowEnd.setHours(14, 30, 0, 0); // 14:30
    
    remainingStops.forEach((stop, index) => {
        const minutes = (index === 0) ? 18 : 18 + (index * 12);
        const eta = new Date(Date.now() + minutes * 60 * 1000);
        
        if (eta > windowEnd) {
            lateRiskStops.push({
                ...stop,
                eta: eta.toISOString(),
                minutesLate: Math.round((eta - windowEnd) / 60000)
            });
        }
    });
    
    return lateRiskStops;
}
```

### 4.4 평균 정차지 간격 계산

```javascript
async function calculateAverageInterval(routeDayId) {
    const response = await fetch('tables/stops?limit=1000');
    const data = await response.json();
    const completedStops = data.data
        .filter(s => s.route_day_id === routeDayId && s.status === 'COMPLETED')
        .sort((a, b) => a.completed_at - b.completed_at);
    
    if (completedStops.length < 2) return 0;
    
    const intervals = [];
    for (let i = 1; i < completedStops.length; i++) {
        const interval = completedStops[i].completed_at - completedStops[i-1].completed_at;
        intervals.push(interval);
    }
    
    const avgMilliseconds = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const avgMinutes = Math.round(avgMilliseconds / 60000);
    
    return {
        avgMinutes,
        intervals: intervals.map(i => Math.round(i / 60000))
    };
}
```

### 4.5 이슈 많은 위치 찾기

```javascript
async function findProblematicLocations() {
    const eventsRes = await fetch('tables/stop_events?limit=10000');
    const events = await eventsRes.json();
    const notes = events.data.filter(e => e.type === 'NOTE');
    
    const stopsRes = await fetch('tables/stops?limit=10000');
    const stops = await stopsRes.json();
    
    const locationsRes = await fetch('tables/locations?limit=100');
    const locations = await locationsRes.json();
    
    // Location별 메모 수 집계
    const locationNotes = {};
    
    notes.forEach(note => {
        const stop = stops.data.find(s => s.id === note.stop_id);
        if (stop) {
            const locId = stop.location_id;
            if (!locationNotes[locId]) {
                locationNotes[locId] = {
                    location: locations.data.find(l => l.id === locId),
                    count: 0,
                    notes: []
                };
            }
            locationNotes[locId].count++;
            locationNotes[locId].notes.push(note.content);
        }
    });
    
    // 메모 많은 순으로 정렬
    return Object.values(locationNotes)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5
}
```

### 4.6 데이터 정합성 체크

```javascript
async function checkDataIntegrity() {
    const issues = [];
    
    // 1. Orphaned stops 체크 (route_day 없는 stop)
    const stopsRes = await fetch('tables/stops?limit=10000');
    const stops = await stopsRes.json();
    
    const routeDaysRes = await fetch('tables/route_days?limit=1000');
    const routeDays = await routeDaysRes.json();
    const routeDayIds = new Set(routeDays.data.map(r => r.id));
    
    const orphanedStops = stops.data.filter(s => !routeDayIds.has(s.route_day_id));
    if (orphanedStops.length > 0) {
        issues.push({
            type: 'orphaned_stops',
            count: orphanedStops.length,
            stopIds: orphanedStops.map(s => s.id)
        });
    }
    
    // 2. Invalid location references 체크
    const locationsRes = await fetch('tables/locations?limit=100');
    const locations = await locationsRes.json();
    const locationIds = new Set(locations.data.map(l => l.id));
    
    const invalidLocations = stops.data.filter(s => !locationIds.has(s.location_id));
    if (invalidLocations.length > 0) {
        issues.push({
            type: 'invalid_locations',
            count: invalidLocations.length,
            stopIds: invalidLocations.map(s => s.id)
        });
    }
    
    // 3. Sequence 중복 체크
    const routeGroups = {};
    stops.data.forEach(stop => {
        if (!routeGroups[stop.route_day_id]) {
            routeGroups[stop.route_day_id] = [];
        }
        routeGroups[stop.route_day_id].push(stop.sequence);
    });
    
    for (const [routeId, sequences] of Object.entries(routeGroups)) {
        const duplicates = sequences.filter((item, index) => sequences.indexOf(item) !== index);
        if (duplicates.length > 0) {
            issues.push({
                type: 'duplicate_sequences',
                routeDayId: routeId,
                duplicates
            });
        }
    }
    
    return {
        isHealthy: issues.length === 0,
        issues
    };
}
```

---

## 5. 데이터 플로우

### 5.1 Driver 경로 시작 플로우

```
1. Driver 로그인
   └─→ drivers 테이블 조회 (인증)

2. "경로 시작" 버튼 클릭
   ├─→ route_days 업데이트 (job_started_at = now)
   ├─→ drivers 업데이트 (status = "ON_DUTY")
   └─→ notification_logs 생성 (ops에게 알림)

3. 정차지 목록 표시
   ├─→ route_days 조회 (오늘 + driver_id)
   ├─→ stops 조회 (route_day_id로 필터)
   └─→ locations 조회 (각 stop의 location_id)
```

### 5.2 정차지 완료 플로우

```
1. Driver가 정차지 선택
   └─→ stops 조회 (상세 정보)
   └─→ locations 조회 (출입 안내)

2. "완료하기" 버튼 클릭
   └─→ 시간 체크 (11:30 이후인가?)
       ├─→ Yes: Modal 표시
       └─→ No: 경고 메시지

3. 작업 유형 선택 + 메모 입력 (선택)
   └─→ stops 업데이트
       ├─→ status = "COMPLETED"
       ├─→ completed_at = now
       └─→ delivered_type = 선택값

4. 메모가 있으면
   └─→ stop_events 생성 (type = "NOTE")

5. 시스템 이벤트 생성
   └─→ stop_events 생성 (type = "SYSTEM")

6. Ops에게 알림
   └─→ notification_logs 생성 (target_role = "ADMIN")
```

### 5.3 Ops 정차지 순서 변경 플로우

```
1. Ops가 Driver 선택
   └─→ route_days 조회
   └─→ stops 조회 (정렬)

2. "순서 변경" 버튼 클릭
   └─→ 재정렬 UI 표시

3. 순서 변경 후 "저장"
   └─→ 각 stop 업데이트 (sequence 값 변경)
       ├─→ stop 1: sequence = 1
       ├─→ stop 2: sequence = 2
       └─→ ...

4. Driver에게 알림
   └─→ notification_logs 생성
       └─→ target_role = "DRIVER"
       └─→ message = "순서가 변경되었습니다"
```

### 5.4 리포트 생성 플로우

```
1. Ops가 날짜 선택 + "리포트 생성"
   └─→ route_days 조회 (해당 날짜)

2. 각 route_day별 데이터 수집
   ├─→ stops 조회 (완료/미완료)
   ├─→ stop_events 조회 (메모 수)
   ├─→ drivers 조회 (기사 정보)
   └─→ locations 조회 (위치 정보)

3. 통계 계산
   ├─→ 완료율
   ├─→ 평균 간격
   ├─→ 시작/종료 시각
   └─→ 이슈 위치 Top 5

4. AI 요약 생성 (템플릿 기반)
   └─→ 전체 현황 + 권장사항

5. 화면 렌더링
```

---

## 데이터베이스 백업 예제

### 전체 백업 스크립트

```javascript
async function fullBackup() {
    const tables = [
        'drivers', 'admins', 'locations',
        'route_days', 'stops', 'stop_events',
        'notification_logs'
    ];
    
    const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        tables: {}
    };
    
    for (const table of tables) {
        const response = await fetch(`tables/${table}?limit=100000`);
        const data = await response.json();
        backup.tables[table] = data.data || [];
        console.log(`✓ ${table}: ${backup.tables[table].length} records`);
    }
    
    // JSON 파일로 저장
    const blob = new Blob([JSON.stringify(backup, null, 2)], 
        { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mumu-backup-${Date.now()}.json`;
    a.click();
    
    return backup;
}
```

---

## 요약

### 핵심 포인트

1. **RESTful Table API**: 플랫폼 제공, HTTP REST로 접근
2. **7개 테이블**: drivers, admins, locations, route_days, stops, stop_events, notification_logs
3. **관계**: route_days → stops, locations → stops, stops → stop_events
4. **자동 필드**: id, gs_project_id, gs_table_name, created_at, updated_at
5. **시간 기록**: 모든 타임스탬프는 밀리초 단위
6. **외래키**: 논리적으로만 존재, DB 제약 없음
7. **백업**: REST API로 조회 → JSON 저장

### 데이터 흐름

```
Login → route_days 조회 → stops 조회 → locations 조회 → UI 렌더링
      ↓
완료 처리 → stops 업데이트 → stop_events 생성 → notification_logs 생성
      ↓
리포트 → 모든 테이블 조회 → 통계 계산 → AI 요약 → 표시
```

---

**추가 질문이 있으시면 언제든 말씀해주세요!**
