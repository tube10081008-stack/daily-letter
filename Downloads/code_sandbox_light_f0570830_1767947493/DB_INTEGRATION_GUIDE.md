# 데이터베이스 연동 가이드

## 🎯 개요

이 가이드는 현재 mock 데이터를 사용하는 MumuBedding 앱을 **실제 Neon Postgres 또는 다른 데이터베이스와 연결**하는 방법을 설명합니다.

**핵심 장점**: UI 코드는 전혀 수정할 필요가 없으며, `js/data-layer.js` 파일만 수정하면 됩니다.

---

## 📋 사전 준비

### 1. 데이터베이스 테이블 생성

Neon Postgres 또는 다른 PostgreSQL 데이터베이스에 다음 테이블을 생성하세요:

```sql
-- Drivers 테이블
CREATE TABLE drivers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(10) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'READY',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Admins 테이블
CREATE TABLE admins (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Locations 테이블
CREATE TABLE locations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    region VARCHAR(10) NOT NULL,
    entry_instruction_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Route Days 테이블
CREATE TABLE route_days (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    region VARCHAR(10) NOT NULL,
    driver_id VARCHAR(50) REFERENCES drivers(id),
    window_start VARCHAR(10) NOT NULL,
    window_end VARCHAR(10) NOT NULL,
    job_started_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stops 테이블
CREATE TABLE stops (
    id VARCHAR(50) PRIMARY KEY,
    route_day_id VARCHAR(50) REFERENCES route_days(id),
    sequence INT NOT NULL,
    location_id VARCHAR(50) REFERENCES locations(id),
    planned_cs INT DEFAULT 0,
    planned_bt INT DEFAULT 0,
    planned_ft INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'READY',
    job_started_at TIMESTAMP,
    completed_at TIMESTAMP,
    delivered_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stop Events 테이블
CREATE TABLE stop_events (
    id VARCHAR(50) PRIMARY KEY,
    stop_id VARCHAR(50) REFERENCES stops(id),
    type VARCHAR(20) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(50)
);

-- Notification Logs 테이블
CREATE TABLE notification_logs (
    id VARCHAR(50) PRIMARY KEY,
    target_role VARCHAR(20) NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    message TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'SENT'
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_route_days_date ON route_days(date);
CREATE INDEX idx_route_days_driver ON route_days(driver_id);
CREATE INDEX idx_stops_route_day ON stops(route_day_id);
CREATE INDEX idx_stop_events_stop ON stop_events(stop_id);
CREATE INDEX idx_notifications_target ON notification_logs(target_role, target_id);
```

### 2. 시드 데이터 삽입

```sql
-- Drivers
INSERT INTO drivers (id, name, region, pin_hash, status) VALUES
    ('driver-a', '김철수', 'N', '1234', 'READY'),
    ('driver-b', '이영희', 'S', '5678', 'READY');

-- Admins
INSERT INTO admins (id, name, pin_hash) VALUES
    ('admin', '운영관리자', '0000');

-- Locations (북부권)
INSERT INTO locations (id, name, address, region, entry_instruction_text) VALUES
    ('LOC-N001', '강남 오피스텔', '서울 강남구 테헤란로 123', 'N', '정문 → 경비실 호출 → 3층 엘리베이터 → 301호'),
    ('LOC-N002', '서초 아파트', '서울 서초구 서초대로 456', 'N', '후문 → 관리사무소 → 101동 1층'),
    ('LOC-N003', '역삼 빌라', '서울 강남구 역삼로 789', 'N', '지하주차장 → B1 출구 → 우측 계단'),
    ('LOC-N004', '논현 주택', '서울 강남구 논현로 321', 'N', '대문 초인종 → 마당 통과 → 현관');

-- Locations (남부권)
INSERT INTO locations (id, name, address, region, entry_instruction_text) VALUES
    ('LOC-S001', '영등포 오피스텔', '서울 영등포구 여의대로 111', 'S', '정문 → 카드키 필요 → 5층 엘리베이터 → 502호'),
    ('LOC-S002', '구로 아파트', '서울 구로구 디지털로 222', 'S', '정문 → 경비실 확인 → 201동 지하주차장'),
    ('LOC-S003', '관악 빌라', '서울 관악구 신림로 333', 'S', '골목 진입 → 2층 계단 → 좌측 끝'),
    ('LOC-S004', '동작 원룸', '서울 동작구 노량진로 444', 'S', '건물 1층 → 우측 복도 → 104호'),
    ('LOC-S005', '금천 주택', '서울 금천구 가산디지털로 555', 'S', '대문 비밀번호 1234# → 마당 → 현관');
```

---

## 🔧 구현 방법

### 방법 1: 직접 데이터베이스 연결 (권장)

`js/data-layer.js` 파일을 수정하여 PostgreSQL에 직접 연결합니다.

#### 1.1 Node.js 환경 설정

먼저 `pg` (PostgreSQL 클라이언트) 패키지를 설치합니다:

```bash
npm install pg
```

#### 1.2 데이터베이스 연결 설정

`js/data-layer.js` 상단에 다음 코드를 추가:

```javascript
const { Pool } = require('pg');

// Neon Postgres 연결
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 연결 테스트
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected successfully:', res.rows[0]);
    }
});
```

#### 1.3 함수 수정 예시

**Before (mock 데이터):**
```javascript
async getTodayStopsForDriver(driverId) {
    const routeDay = await this.getTodayRouteForDriver(driverId);
    if (!routeDay) return [];
    
    return this.mockData.stops
        .filter(s => s.route_day_id === routeDay.id)
        .sort((a, b) => a.sequence - b.sequence);
}
```

**After (DB 쿼리):**
```javascript
async getTodayStopsForDriver(driverId) {
    const today = utils.formatDate();
    
    const result = await pool.query(`
        SELECT s.* 
        FROM stops s
        JOIN route_days rd ON s.route_day_id = rd.id
        WHERE rd.driver_id = $1 AND rd.date = $2
        ORDER BY s.sequence ASC
    `, [driverId, today]);
    
    return result.rows;
}
```

#### 1.4 완료 처리 예시

**Before (mock 데이터):**
```javascript
async completeStop(stopId, payload) {
    const stop = this.mockData.stops.find(s => s.id === stopId);
    if (!stop) return null;

    stop.status = 'COMPLETED';
    stop.completed_at = new Date().toISOString();
    stop.delivered_type = payload.deliveredType;
    
    return stop;
}
```

**After (DB 쿼리):**
```javascript
async completeStop(stopId, payload) {
    const result = await pool.query(`
        UPDATE stops 
        SET status = 'COMPLETED',
            completed_at = $1,
            delivered_type = $2
        WHERE id = $3
        RETURNING *
    `, [new Date().toISOString(), payload.deliveredType, stopId]);
    
    if (result.rows.length === 0) return null;
    
    // 메모가 있으면 이벤트 생성
    if (payload.note) {
        await this.createStopEvent(stopId, 'NOTE', payload.note);
    }
    
    // 시스템 이벤트 생성
    await this.createStopEvent(stopId, 'SYSTEM', 
        `정차지 완료: ${utils.getDeliveredTypeLabel(payload.deliveredType)}`);
    
    // Ops에게 알림
    await this.createNotification('ADMIN', 'admin', 'SMS', 
        `[완료] ${state.getCurrentUserName()} - 정차지 완료`);
    
    return result.rows[0];
}
```

---

### 방법 2: REST API 서버 경유

별도의 API 서버(Netlify Functions, Express, etc.)를 만들어 DB와 통신합니다.

#### 2.1 Netlify Functions 예시

`netlify/functions/get-stops.js`:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
    const { driverId, date } = event.queryStringParameters;
    
    try {
        const result = await pool.query(`
            SELECT s.* 
            FROM stops s
            JOIN route_days rd ON s.route_day_id = rd.id
            WHERE rd.driver_id = $1 AND rd.date = $2
            ORDER BY s.sequence ASC
        `, [driverId, date]);
        
        return {
            statusCode: 200,
            body: JSON.stringify(result.rows)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
```

#### 2.2 api.js 수정

```javascript
stops: {
    async getByRouteDay(routeDayId) {
        // Before: dataLayer 호출
        // return await dataLayer.getStopsByRouteDay(routeDayId);
        
        // After: API 호출
        const response = await fetch(`/.netlify/functions/get-stops?routeDayId=${routeDayId}`);
        return await response.json();
    }
}
```

---

## 🧪 테스트 체크리스트

DB 연동 후 다음 기능들을 테스트하세요:

### Driver 플로우
- [ ] 로그인 (driver-a / 1234)
- [ ] 오늘의 정차지 목록 조회
- [ ] 경로 시작하기 버튼 클릭
- [ ] 정차지 상세 화면 진입
- [ ] 정차지 완료 (시간 기록 확인)
- [ ] 메모 작성 및 저장
- [ ] 활동 피드에서 완료 내역 확인

### Admin 플로우
- [ ] 로그인 (admin / 0000)
- [ ] 배송지 목록 조회
- [ ] 새 배송지 추가
- [ ] 오늘 배정 생성
- [ ] Ops 대시보드에서 Driver 상태 확인
- [ ] Driver 상세에서 정차지 순서 변경
- [ ] 일일 리포트 생성

### 데이터 검증
```sql
-- 완료된 정차지 확인
SELECT * FROM stops WHERE status = 'COMPLETED' ORDER BY completed_at DESC;

-- 오늘 생성된 이벤트 확인
SELECT * FROM stop_events WHERE DATE(created_at) = CURRENT_DATE ORDER BY created_at DESC;

-- 알림 로그 확인
SELECT * FROM notification_logs ORDER BY sent_at DESC LIMIT 10;
```

---

## 🔒 보안 권장사항

### 1. PIN 해싱
현재 PIN은 평문으로 저장되어 있습니다. Production에서는 bcrypt로 해싱하세요:

```bash
npm install bcrypt
```

```javascript
const bcrypt = require('bcrypt');

// 회원가입/수정 시
const hashedPin = await bcrypt.hash(pin, 10);

// 로그인 시
async authenticateDriver(id, pin) {
    const result = await pool.query('SELECT * FROM drivers WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    
    const driver = result.rows[0];
    const isValid = await bcrypt.compare(pin, driver.pin_hash);
    
    return isValid ? driver : null;
}
```

### 2. 환경 변수 관리
`.env` 파일에 민감한 정보 저장:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

`.gitignore`에 추가:
```
.env
node_modules/
```

### 3. SQL Injection 방지
항상 파라미터화된 쿼리 사용:

```javascript
// ❌ 나쁜 예
const query = `SELECT * FROM drivers WHERE id = '${id}'`;

// ✅ 좋은 예
const query = 'SELECT * FROM drivers WHERE id = $1';
await pool.query(query, [id]);
```

---

## 🚀 배포 시 주의사항

### Netlify 환경 변수 설정
1. Netlify 대시보드 → Site settings → Environment variables
2. `DATABASE_URL` 추가 (Neon Postgres 연결 문자열)
3. 배포 후 Functions가 DB에 접근할 수 있는지 확인

### CORS 설정
API 서버를 별도로 운영하는 경우:

```javascript
// Express 예시
const cors = require('cors');
app.use(cors({
    origin: 'https://your-netlify-site.netlify.app',
    credentials: true
}));
```

---

## 📚 참고 자료

- [Neon Postgres 문서](https://neon.tech/docs)
- [node-postgres (pg) 문서](https://node-postgres.com/)
- [Netlify Functions 가이드](https://docs.netlify.com/functions/overview/)
- [PostgreSQL 시간 데이터 타입](https://www.postgresql.org/docs/current/datatype-datetime.html)

---

## ❓ 문제 해결

### 문제: "Error: connect ECONNREFUSED"
- **원인**: DB 연결 문자열이 잘못되었거나 네트워크 문제
- **해결**: `DATABASE_URL` 환경 변수 확인, Neon 대시보드에서 연결 문자열 재확인

### 문제: "Error: SSL connection required"
- **원인**: SSL 설정 누락
- **해결**: `ssl: { rejectUnauthorized: false }` 옵션 추가

### 문제: "TimeoutError: Query read timeout"
- **원인**: 쿼리가 너무 느림
- **해결**: 인덱스 추가, 쿼리 최적화

### 문제: UI에 데이터가 표시되지 않음
- **원인**: 데이터 형식 불일치
- **해결**: 브라우저 콘솔에서 API 응답 확인, DB 쿼리 결과 검증

---

**Last Updated**: 2026-01-09  
**Version**: 1.0.0
