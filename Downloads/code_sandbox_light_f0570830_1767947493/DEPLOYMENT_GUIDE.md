# MumuBedding 배포 및 운영 가이드

## 목차
1. [배포 방법](#1-배포-방법)
2. [SMS 연동 방법](#2-sms-연동-방법)
3. [데이터베이스 관리](#3-데이터베이스-관리)
4. [배송지 관리](#4-배송지-관리)
5. [메시지 관리](#5-메시지-관리)
6. [일상 운영](#6-일상-운영)

---

## 1. 배포 방법

### 1.1 Netlify 배포 (권장)

#### Step 1: Netlify 계정 생성
```
1. https://app.netlify.com 접속
2. GitHub, GitLab, 또는 Email로 가입
3. 무료 계정으로 시작 가능
```

#### Step 2: 폴더 드롭 배포
```
1. Netlify 대시보드에서 "Add new site" 클릭
2. "Deploy manually" 선택
3. 프로젝트 폴더 전체를 드래그 앤 드롭
4. 배포 시작 (1-2분 소요)
5. 배포 완료 후 URL 확인 (예: https://mumu-bedding-xxxxx.netlify.app)
```

#### Step 3: 커스텀 도메인 설정 (선택)
```
1. Site settings → Domain management
2. "Add custom domain" 클릭
3. 도메인 입력 (예: ops.mumubedding.com)
4. DNS 설정 (Netlify가 안내)
5. SSL 인증서 자동 발급 (무료)
```

#### Step 4: 환경 확인
```bash
# 배포된 URL 접속
https://your-site.netlify.app

# 테스트 계정으로 로그인
Driver: driver-a / 1234
Admin: admin / 0000

# 모바일 브라우저에서도 테스트
```

### 1.2 배포 URL 고정
```
Netlify Site settings → General → Site details → Change site name
→ 원하는 이름으로 변경 (예: mumu-bedding-ops)
→ URL이 https://mumu-bedding-ops.netlify.app 으로 고정됨
```

---

## 2. SMS 연동 방법

현재 시스템은 SMS 로그만 기록하는 stub 구현입니다. 실제 SMS를 발송하려면 다음과 같이 연동합니다.

### 2.1 추천 SMS 서비스

#### A. 알리고 (한국 인기)
- **가격**: 건당 15-20원
- **장점**: 한국 특화, 간단한 API, 저렴
- **웹사이트**: https://smartsms.aligo.in

#### B. Twilio (글로벌)
- **가격**: 건당 $0.05-0.10
- **장점**: 글로벌 커버리지, 안정적
- **웹사이트**: https://www.twilio.com

#### C. 네이버 클라우드 SENS
- **가격**: 건당 9-15원
- **장점**: 네이버 인프라, 한국 최적화
- **웹사이트**: https://www.ncloud.com/product/applicationService/sens

### 2.2 알리고 SMS 연동 예제

#### Step 1: 알리고 계정 생성 및 API 키 발급
```
1. https://smartsms.aligo.in 가입
2. 충전소에서 SMS 충전 (최소 10,000원)
3. API 설정 → API Key 발급
4. 발신번호 등록 (사업자 인증 필요)
```

#### Step 2: SMS 발송 함수 생성

`js/sms.js` 파일을 새로 생성:

```javascript
/**
 * SMS Service Integration (알리고)
 */

const smsService = {
    // 알리고 API 설정
    config: {
        apiKey: 'YOUR_API_KEY_HERE',        // 알리고 API Key
        userId: 'YOUR_USER_ID_HERE',        // 알리고 User ID
        sender: '01012345678',              // 발신번호 (등록된 번호)
        apiUrl: 'https://apis.aligo.in/send/'
    },

    /**
     * SMS 발송
     */
    async send(phoneNumber, message) {
        try {
            // API 요청 데이터
            const formData = new FormData();
            formData.append('key', this.config.apiKey);
            formData.append('user_id', this.config.userId);
            formData.append('sender', this.config.sender);
            formData.append('receiver', phoneNumber);
            formData.append('msg', message);
            formData.append('testmode_yn', 'N'); // 테스트 모드: Y/N

            // API 호출
            const response = await fetch(this.config.apiUrl, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.result_code === '1') {
                console.log('SMS 발송 성공:', result);
                return { success: true, messageId: result.msg_id };
            } else {
                console.error('SMS 발송 실패:', result);
                return { success: false, error: result.message };
            }

        } catch (error) {
            console.error('SMS API 오류:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * 테스트 모드로 발송 (실제 발송 안됨, 크레딧 차감 안됨)
     */
    async sendTest(phoneNumber, message) {
        const formData = new FormData();
        formData.append('key', this.config.apiKey);
        formData.append('user_id', this.config.userId);
        formData.append('sender', this.config.sender);
        formData.append('receiver', phoneNumber);
        formData.append('msg', message);
        formData.append('testmode_yn', 'Y'); // 테스트 모드

        const response = await fetch(this.config.apiUrl, {
            method: 'POST',
            body: formData
        });

        return await response.json();
    }
};
```

#### Step 3: API.js 수정

`js/api.js`의 notifications.create 함수를 수정:

```javascript
notifications: {
    async create(targetRole, targetId, channel, message) {
        // 로그 저장
        const notificationLog = await api.request('tables/notification_logs', {
            method: 'POST',
            body: JSON.stringify({
                id: utils.generateId('notif'),
                target_role: targetRole,
                target_id: targetId,
                channel: channel,
                message: message,
                sent_at: Date.now(),
                status: 'PENDING'
            })
        });

        // 실제 SMS 발송
        if (channel === 'SMS') {
            // Driver 또는 Admin 정보에서 전화번호 가져오기
            let phoneNumber = null;
            
            if (targetRole === 'DRIVER') {
                const driver = await api.drivers.getById(targetId);
                phoneNumber = driver.phone_number; // 전화번호 필드 추가 필요
            } else if (targetRole === 'ADMIN') {
                const admin = await api.admins.getById(targetId);
                phoneNumber = admin.phone_number; // 전화번호 필드 추가 필요
            }

            if (phoneNumber) {
                const smsResult = await smsService.send(phoneNumber, message);
                
                // 발송 결과 업데이트
                await api.request(`tables/notification_logs/${notificationLog.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        status: smsResult.success ? 'SENT' : 'FAILED'
                    })
                });
            }
        }

        return notificationLog;
    }
}
```

#### Step 4: index.html에 sms.js 추가

```html
<!-- index.html의 <script> 태그 추가 -->
<script src="js/sms.js"></script>
```

#### Step 5: 전화번호 필드 추가

drivers와 admins 테이블에 phone_number 필드 추가:

```javascript
// 개발자 도구 콘솔에서 실행
// Driver 전화번호 추가
await fetch('tables/drivers/driver-a', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: '01012345678' })
});

await fetch('tables/drivers/driver-b', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: '01087654321' })
});

// Admin 전화번호 추가
await fetch('tables/admins/admin', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: '01099999999' })
});
```

### 2.3 보안 강화 (Production)

**중요**: API Key를 클라이언트에 노출하면 안 됩니다!

#### 옵션 1: Netlify Functions (서버리스)

`netlify/functions/send-sms.js` 생성:

```javascript
// Netlify Function
exports.handler = async (event, context) => {
    // 환경 변수에서 API Key 가져오기
    const apiKey = process.env.ALIGO_API_KEY;
    const userId = process.env.ALIGO_USER_ID;
    const sender = process.env.ALIGO_SENDER;

    const { phoneNumber, message } = JSON.parse(event.body);

    // SMS 발송 로직
    const FormData = require('form-data');
    const fetch = require('node-fetch');

    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('user_id', userId);
    formData.append('sender', sender);
    formData.append('receiver', phoneNumber);
    formData.append('msg', message);

    const response = await fetch('https://apis.aligo.in/send/', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(result)
    };
};
```

클라이언트에서 호출:

```javascript
// js/sms.js
async send(phoneNumber, message) {
    const response = await fetch('/.netlify/functions/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, message })
    });
    return await response.json();
}
```

Netlify 환경 변수 설정:
```
Site settings → Environment variables
→ Add new variable
→ ALIGO_API_KEY, ALIGO_USER_ID, ALIGO_SENDER 설정
```

---

## 3. 데이터베이스 관리

### 3.1 RESTful Table API 이해하기

현재 시스템은 **RESTful Table API**를 사용합니다. 이는 플랫폼에서 제공하는 내장 데이터베이스입니다.

#### 데이터 저장 위치
- 데이터는 **플랫폼 서버**에 저장됩니다
- 각 프로젝트마다 독립된 데이터베이스 공간
- localStorage는 세션 정보만 저장 (로그인 상태)

#### 데이터 구조
```
프로젝트 ID (자동 생성)
├── drivers (테이블)
│   ├── driver-a (레코드)
│   ├── driver-b (레코드)
│   └── ...
├── admins (테이블)
│   └── admin (레코드)
├── locations (테이블)
│   ├── LOC-N001
│   ├── LOC-N002
│   └── ...
├── route_days (테이블)
├── stops (테이블)
├── stop_events (테이블)
└── notification_logs (테이블)
```

### 3.2 데이터 백업

#### 방법 1: API를 통한 백업 스크립트

`backup.html` 파일 생성:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>데이터 백업</title>
</head>
<body>
    <h1>MumuBedding 데이터 백업</h1>
    <button onclick="backupAllData()">전체 데이터 백업</button>
    <pre id="output"></pre>

    <script>
        async function backupAllData() {
            const tables = [
                'drivers', 'admins', 'locations', 
                'route_days', 'stops', 'stop_events', 
                'notification_logs'
            ];

            const backup = {
                timestamp: new Date().toISOString(),
                tables: {}
            };

            for (const table of tables) {
                try {
                    const response = await fetch(`tables/${table}?limit=10000`);
                    const data = await response.json();
                    backup.tables[table] = data.data || [];
                    console.log(`✓ ${table}: ${backup.tables[table].length} records`);
                } catch (error) {
                    console.error(`✗ ${table}:`, error);
                }
            }

            // JSON 파일로 다운로드
            const blob = new Blob([JSON.stringify(backup, null, 2)], 
                { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mumu-backup-${Date.now()}.json`;
            a.click();

            document.getElementById('output').textContent = 
                JSON.stringify(backup, null, 2);
        }
    </script>
</body>
</html>
```

사용법:
```
1. backup.html을 프로젝트에 추가
2. 배포 후 /backup.html 접속
3. "전체 데이터 백업" 버튼 클릭
4. JSON 파일 다운로드
```

#### 방법 2: 정기 백업 자동화 (Node.js 스크립트)

```javascript
// backup-script.js
const fetch = require('node-fetch');
const fs = require('fs');

const BASE_URL = 'https://your-site.netlify.app';

async function backupAllData() {
    const tables = [
        'drivers', 'admins', 'locations', 
        'route_days', 'stops', 'stop_events', 
        'notification_logs'
    ];

    const backup = {
        timestamp: new Date().toISOString(),
        tables: {}
    };

    for (const table of tables) {
        const response = await fetch(`${BASE_URL}/tables/${table}?limit=10000`);
        const data = await response.json();
        backup.tables[table] = data.data || [];
    }

    const filename = `backup-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
    console.log(`✓ Backup saved: ${filename}`);
}

backupAllData();
```

실행:
```bash
node backup-script.js
```

Cron으로 자동화:
```bash
# 매일 새벽 2시에 백업
0 2 * * * /usr/bin/node /path/to/backup-script.js
```

### 3.3 데이터 복원

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>데이터 복원</title>
</head>
<body>
    <h1>MumuBedding 데이터 복원</h1>
    <input type="file" id="backup-file" accept=".json">
    <button onclick="restoreData()">데이터 복원</button>
    <pre id="output"></pre>

    <script>
        async function restoreData() {
            const file = document.getElementById('backup-file').files[0];
            if (!file) {
                alert('백업 파일을 선택하세요');
                return;
            }

            const text = await file.text();
            const backup = JSON.parse(text);

            for (const [tableName, records] of Object.entries(backup.tables)) {
                console.log(`Restoring ${tableName}...`);

                for (const record of records) {
                    try {
                        // 기존 레코드 삭제
                        await fetch(`tables/${tableName}/${record.id}`, {
                            method: 'DELETE'
                        });

                        // 새 레코드 생성
                        await fetch(`tables/${tableName}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(record)
                        });
                    } catch (error) {
                        console.error(`Error restoring ${tableName}:`, error);
                    }
                }

                console.log(`✓ ${tableName} restored`);
            }

            alert('복원 완료!');
        }
    </script>
</body>
</html>
```

### 3.4 데이터베이스 쿼리

브라우저 개발자 도구 콘솔에서 직접 쿼리 가능:

```javascript
// 모든 drivers 조회
const response = await fetch('tables/drivers?limit=100');
const data = await response.json();
console.log(data);

// 특정 driver 조회
const driver = await fetch('tables/drivers/driver-a');
console.log(await driver.json());

// driver 정보 수정
await fetch('tables/drivers/driver-a', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        name: '새이름',
        phone_number: '01099999999'
    })
});

// 오늘의 stops 조회
const stopsRes = await fetch('tables/stops?limit=1000');
const stops = await stopsRes.json();
const todayStops = stops.data.filter(s => 
    s.route_day_id.includes('2026-01-09')
);
console.log(todayStops);

// 완료된 stops만 조회
const completed = stops.data.filter(s => s.status === 'COMPLETED');
console.log(completed);
```

---

## 4. 배송지 관리

### 4.1 새 배송지 추가

#### 방법 1: 개발자 도구 콘솔

```javascript
// 1. 새 location 추가
await fetch('tables/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        id: 'LOC-N005',
        name: '신논현 빌딩',
        address: '서울시 강남구 신논현로 123',
        region: 'N',
        entry_instruction_text: '정문 경비실 방문증 수령. B1 주차장 이용. 엘리베이터로 5층 503호'
    })
});

// 2. 확인
const check = await fetch('tables/locations/LOC-N005');
console.log(await check.json());
```

#### 방법 2: 관리자 UI 추가 (향후 개선)

`js/screens/admin-locations.js` 파일 생성 후 관리 화면 구현:

```javascript
const adminLocationsScreen = {
    async render() {
        const locations = await api.locations.getAll();

        const html = `
            <div class="px-4 py-6">
                <h1 class="text-2xl font-bold mb-6">배송지 관리</h1>
                
                <button onclick="adminLocationsScreen.showAddModal()" 
                        class="w-full py-3 bg-blue-600 text-white rounded-lg mb-6">
                    + 새 배송지 추가
                </button>

                <div class="space-y-3">
                    ${locations.map(loc => `
                        <div class="bg-white rounded-lg p-4">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-bold">${loc.name}</h3>
                                    <p class="text-sm text-gray-600">${loc.id}</p>
                                    <p class="text-sm text-gray-600">${loc.address}</p>
                                </div>
                                <button onclick="adminLocationsScreen.editLocation('${loc.id}')"
                                        class="px-3 py-1 bg-blue-50 text-blue-600 rounded">
                                    수정
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        ui.render(html);
    },

    showAddModal() {
        const modalHtml = `
            <div class="p-6">
                <h3 class="text-xl font-bold mb-4">새 배송지 추가</h3>
                
                <div class="space-y-4">
                    <input id="loc-id" placeholder="Location ID (예: LOC-N010)" 
                           class="w-full px-4 py-3 border rounded-lg">
                    <input id="loc-name" placeholder="이름" 
                           class="w-full px-4 py-3 border rounded-lg">
                    <input id="loc-address" placeholder="주소" 
                           class="w-full px-4 py-3 border rounded-lg">
                    <select id="loc-region" class="w-full px-4 py-3 border rounded-lg">
                        <option value="N">북부권</option>
                        <option value="S">남부권</option>
                    </select>
                    <textarea id="loc-entry" rows="4" placeholder="출입 안내"
                              class="w-full px-4 py-3 border rounded-lg"></textarea>
                </div>

                <div class="flex gap-3 mt-6">
                    <button onclick="ui.hideModal()" 
                            class="flex-1 py-3 bg-gray-200 rounded-lg">취소</button>
                    <button onclick="adminLocationsScreen.saveNewLocation()" 
                            class="flex-1 py-3 bg-blue-600 text-white rounded-lg">저장</button>
                </div>
            </div>
        `;
        ui.showModal(modalHtml);
    },

    async saveNewLocation() {
        const location = {
            id: document.getElementById('loc-id').value,
            name: document.getElementById('loc-name').value,
            address: document.getElementById('loc-address').value,
            region: document.getElementById('loc-region').value,
            entry_instruction_text: document.getElementById('loc-entry').value
        };

        await fetch('tables/locations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(location)
        });

        ui.hideModal();
        ui.showToast('배송지가 추가되었습니다');
        this.render();
    }
};
```

### 4.2 배송지 수정

앱 내에서 Ops가 이미 수정 가능합니다:
```
1. Admin으로 로그인
2. Driver 상세 → 정차지 탭
3. 정차지 선택 → "출입 안내 수정"
```

또는 개발자 도구:
```javascript
await fetch('tables/locations/LOC-N001', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        entry_instruction_text: '새로운 출입 안내 텍스트'
    })
});
```

### 4.3 배송지 삭제

```javascript
// 주의: 해당 location을 사용하는 stops가 있으면 오류 발생 가능
await fetch('tables/locations/LOC-N001', {
    method: 'DELETE'
});
```

### 4.4 내일 경로 준비

매일 새로운 route_days와 stops를 생성해야 합니다:

```javascript
// 내일 경로 생성 스크립트
async function createTomorrowRoutes() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

    // Route Days 생성
    const routeDayN = await fetch('tables/route_days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: `route-${tomorrowStr}-n`,
            date: tomorrowStr,
            region: 'N',
            driver_id: 'driver-a',
            window_start: '11:30',
            window_end: '14:30',
            job_started_at: 0
        })
    });

    const routeDayS = await fetch('tables/route_days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: `route-${tomorrowStr}-s`,
            date: tomorrowStr,
            region: 'S',
            driver_id: 'driver-b',
            window_start: '11:30',
            window_end: '14:30',
            job_started_at: 0
        })
    });

    // Stops 생성 (북부권 예시)
    const northLocations = ['LOC-N001', 'LOC-N002', 'LOC-N003', 'LOC-N004'];
    
    for (let i = 0; i < northLocations.length; i++) {
        await fetch('tables/stops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: `stop-${tomorrowStr}-n-${i + 1}`,
                route_day_id: `route-${tomorrowStr}-n`,
                sequence: i + 1,
                location_id: northLocations[i],
                planned_cs: Math.floor(Math.random() * 4) + 1,
                planned_bt: Math.floor(Math.random() * 8) + 2,
                planned_ft: Math.floor(Math.random() * 8) + 2,
                status: 'READY',
                job_started_at: 0,
                completed_at: 0
            })
        });
    }

    console.log('✓ Tomorrow routes created!');
}

// 실행
createTomorrowRoutes();
```

---

## 5. 메시지 관리

### 5.1 메시지 템플릿 관리

`js/message-templates.js` 파일 생성:

```javascript
const messageTemplates = {
    // 순서 변경
    order_change: '정차지 순서가 변경되었습니다. 앱을 새로고침해주세요.',
    
    // 고객 변경
    customer_change: (locationName) => 
        `${locationName}의 고객 정보가 변경되었습니다. 출입 안내를 확인해주세요.`,
    
    // 긴급
    urgent: (message) => `[긴급] ${message}`,
    
    // 완료 알림
    completion: (driverName, locationName) =>
        `[완료] ${driverName} - ${locationName}`,
    
    // 메모 알림
    note: (driverName, locationName, note) =>
        `[메모] ${driverName} - ${locationName}: ${note}`,
    
    // 출입 안내 변경
    entry_updated: (locationName) =>
        `${locationName}의 출입 안내가 업데이트되었습니다.`,
    
    // 경로 시작
    route_started: (driverName) =>
        `${driverName}님이 경로를 시작했습니다.`,
    
    // 지연 경고
    late_warning: (driverName, stopCount) =>
        `[주의] ${driverName} - ${stopCount}개 정차지가 지연 위험 상태입니다.`
};
```

사용 예:
```javascript
// api.js에서 사용
await api.notifications.create(
    'DRIVER',
    'driver-a',
    'SMS',
    messageTemplates.customer_change('강남 오피스텔')
);
```

### 5.2 메시지 예약 발송

```javascript
// 메시지 예약 기능
const messageScheduler = {
    scheduled: [],

    schedule(datetime, targetRole, targetId, channel, message) {
        this.scheduled.push({
            id: utils.generateId('sched'),
            datetime,
            targetRole,
            targetId,
            channel,
            message,
            status: 'PENDING'
        });
        
        // localStorage에 저장
        localStorage.setItem('scheduledMessages', JSON.stringify(this.scheduled));
    },

    async checkAndSend() {
        const now = Date.now();
        
        for (const msg of this.scheduled) {
            if (msg.status === 'PENDING' && msg.datetime <= now) {
                await api.notifications.create(
                    msg.targetRole,
                    msg.targetId,
                    msg.channel,
                    msg.message
                );
                msg.status = 'SENT';
            }
        }
        
        localStorage.setItem('scheduledMessages', JSON.stringify(this.scheduled));
    }
};

// 1분마다 체크
setInterval(() => messageScheduler.checkAndSend(), 60000);
```

### 5.3 대량 메시지 발송

```javascript
// 모든 Driver에게 메시지 발송
async function broadcastToAllDrivers(message) {
    const drivers = await api.drivers.getAll();
    
    for (const driver of drivers) {
        await api.notifications.create(
            'DRIVER',
            driver.id,
            'SMS',
            message
        );
    }
    
    console.log(`✓ Message sent to ${drivers.length} drivers`);
}

// 사용 예
broadcastToAllDrivers('오늘 오후 3시에 전체 회의가 있습니다.');
```

---

## 6. 일상 운영

### 6.1 매일 아침 체크리스트

```
□ 오늘 경로 확인 (route_days, stops 존재 여부)
□ 배송지 출입 안내 최신 상태 확인
□ Driver 계정 상태 확인 (READY)
□ SMS 크레딧 잔액 확인
□ 이전일 백업 완료 확인
```

### 6.2 매일 저녁 마무리

```
□ 완료율 확인 (리포트 생성)
□ 미완료 정차지 확인 및 조치
□ 메모/이슈 검토
□ 데이터 백업 실행
□ 내일 경로 준비
```

### 6.3 주간 점검

```
□ 반복 이슈 위치 식별 및 개선
□ 평균 완료 시간 추이 분석
□ Driver 피드백 수집
□ SMS 발송 내역 검토
□ 시스템 성능 확인
```

### 6.4 Quick Admin Scripts

`admin-scripts.html` 파일 생성:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Admin Scripts</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">MumuBedding Admin Scripts</h1>
        
        <div class="grid grid-cols-2 gap-4">
            <button onclick="resetTodayStops()" class="p-4 bg-yellow-500 text-white rounded-lg">
                🔄 오늘 정차지 초기화
            </button>
            
            <button onclick="createTomorrowRoutes()" class="p-4 bg-blue-600 text-white rounded-lg">
                📅 내일 경로 생성
            </button>
            
            <button onclick="backupAllData()" class="p-4 bg-green-600 text-white rounded-lg">
                💾 데이터 백업
            </button>
            
            <button onclick="exportReport()" class="p-4 bg-purple-600 text-white rounded-lg">
                📊 리포트 내보내기
            </button>
            
            <button onclick="clearOldData()" class="p-4 bg-red-600 text-white rounded-lg">
                🗑️ 30일 이전 데이터 삭제
            </button>
            
            <button onclick="sendTestSMS()" class="p-4 bg-indigo-600 text-white rounded-lg">
                📱 테스트 SMS 발송
            </button>
        </div>
        
        <pre id="output" class="mt-6 p-4 bg-white rounded-lg"></pre>
    </div>

    <script>
        const output = document.getElementById('output');
        const log = (msg) => {
            output.textContent += msg + '\n';
            console.log(msg);
        };

        async function resetTodayStops() {
            output.textContent = '';
            const today = new Date().toISOString().split('T')[0];
            
            const response = await fetch('tables/stops?limit=1000');
            const data = await response.json();
            const todayStops = data.data.filter(s => 
                s.route_day_id.includes(today)
            );
            
            for (const stop of todayStops) {
                await fetch(`tables/stops/${stop.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'READY',
                        completed_at: 0,
                        delivered_type: null
                    })
                });
            }
            
            log(`✓ ${todayStops.length} stops reset`);
        }

        async function createTomorrowRoutes() {
            output.textContent = '';
            // ... (위의 createTomorrowRoutes 코드 복사)
            log('✓ Tomorrow routes created');
        }

        async function backupAllData() {
            output.textContent = '';
            // ... (위의 backupAllData 코드 복사)
            log('✓ Backup downloaded');
        }

        async function exportReport() {
            output.textContent = '';
            log('Generating report...');
            // 리포트 데이터 수집 및 CSV 생성
        }

        async function clearOldData() {
            output.textContent = '';
            const confirm = window.confirm('30일 이전 데이터를 삭제하시겠습니까?');
            if (!confirm) return;
            
            const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
            
            // stops 삭제
            const stopsRes = await fetch('tables/stops?limit=10000');
            const stops = await stopsRes.json();
            const oldStops = stops.data.filter(s => s.created_at < cutoff);
            
            for (const stop of oldStops) {
                await fetch(`tables/stops/${stop.id}`, { method: 'DELETE' });
            }
            
            log(`✓ ${oldStops.length} old stops deleted`);
        }

        async function sendTestSMS() {
            output.textContent = '';
            const phoneNumber = prompt('전화번호 입력:');
            if (!phoneNumber) return;
            
            log('Sending test SMS...');
            // SMS 발송 로직
            log('✓ Test SMS sent to ' + phoneNumber);
        }
    </script>
</body>
</html>
```

---

## 7. 모니터링 및 알림

### 7.1 시스템 헬스 체크

```javascript
// health-check.js
async function systemHealthCheck() {
    const report = {
        timestamp: new Date().toISOString(),
        checks: []
    };

    // 1. 데이터베이스 연결 확인
    try {
        await fetch('tables/drivers?limit=1');
        report.checks.push({ name: 'Database', status: 'OK' });
    } catch (error) {
        report.checks.push({ name: 'Database', status: 'FAIL', error: error.message });
    }

    // 2. 오늘 경로 존재 확인
    const today = new Date().toISOString().split('T')[0];
    const routeDaysRes = await fetch(`tables/route_days?limit=100`);
    const routeDays = await routeDaysRes.json();
    const todayRoutes = routeDays.data.filter(r => r.date === today);
    
    if (todayRoutes.length > 0) {
        report.checks.push({ name: 'Today Routes', status: 'OK', count: todayRoutes.length });
    } else {
        report.checks.push({ name: 'Today Routes', status: 'WARN', message: 'No routes for today' });
    }

    // 3. SMS 크레딧 확인 (알리고 API)
    // ... SMS 서비스 잔액 조회 로직

    return report;
}

// 매시간 헬스 체크
setInterval(async () => {
    const report = await systemHealthCheck();
    console.log('Health Check:', report);
    
    // 문제 발견 시 관리자에게 알림
    const failures = report.checks.filter(c => c.status === 'FAIL');
    if (failures.length > 0) {
        // 관리자에게 SMS 발송
    }
}, 3600000); // 1시간마다
```

---

## 요약

### SMS 연동
1. 알리고/Twilio/SENS 계정 생성
2. `js/sms.js` 파일 생성 및 API 통합
3. Netlify Functions로 API Key 보안
4. 전화번호 필드 추가
5. 테스트 발송 후 운영 전환

### 데이터베이스 관리
1. RESTful Table API 이해
2. 백업 스크립트 정기 실행
3. 개발자 도구로 직접 쿼리
4. 복원 프로세스 준비

### 배송지 관리
1. 개발자 도구 또는 Admin UI로 추가/수정
2. 매일 내일 경로 생성 스크립트 실행
3. 출입 안내는 Ops가 앱에서 직접 편집 가능

### 메시지 관리
1. 메시지 템플릿 정의
2. 대량 발송 스크립트 준비
3. 예약 발송 기능 구현 (선택)

### 일상 운영
1. 매일 아침/저녁 체크리스트 준수
2. Admin Scripts 활용
3. 헬스 체크 모니터링
4. 주간 데이터 분석

---

**추가 문의사항이 있으시면 언제든 말씀해주세요!**
