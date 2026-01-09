# Admin 로그인 테스트 가이드

## 🧪 빠른 테스트 방법

### 1️⃣ 브라우저 개발자 도구 테스트

앱을 열고 **F12** (개발자 도구)를 누른 후, 콘솔(Console) 탭에서 다음 명령어를 실행하세요:

#### Admin 데이터 확인
```javascript
// Admin 목록 조회
await dataLayer.getAllAdmins();
// 예상 결과: [{id: 'admin', name: '운영관리자', pin_hash: '0000'}]
```

#### Admin 인증 테스트
```javascript
// 올바른 PIN
await dataLayer.authenticateAdmin('admin', '0000');
// 예상 결과: {id: 'admin', name: '운영관리자', pin_hash: '0000'}

// 잘못된 PIN
await dataLayer.authenticateAdmin('admin', '9999');
// 예상 결과: null
```

#### API 레이어 테스트
```javascript
// Admin 목록 (API를 통해)
await api.admins.getAll();
// 예상 결과: [{id: 'admin', name: '운영관리자', pin_hash: '0000'}]

// Admin 개별 조회
await api.admins.getById('admin');
// 예상 결과: {id: 'admin', name: '운영관리자', pin_hash: '0000'}
```

---

### 2️⃣ UI 테스트

#### 테스트 케이스 1: 정상 로그인
1. 앱 접속 (또는 새로고침)
2. **"관리자"** 버튼 클릭
3. ID 입력: `admin`
4. PIN 입력: `0000`
5. **"로그인"** 버튼 클릭

**✅ 예상 결과**:
- Toast 메시지: "환영합니다, 운영관리자님!"
- Admin 홈 화면으로 이동
- 하단 네비게이션: "홈", "배송지", "활동", "리포트", "프로필" 표시

---

#### 테스트 케이스 2: 잘못된 ID
1. "관리자" 버튼 클릭
2. ID 입력: `admin123` (존재하지 않는 ID)
3. PIN 입력: `0000`
4. "로그인" 버튼 클릭

**✅ 예상 결과**:
- Toast 메시지: "잘못된 관리자 ID 또는 PIN입니다"
- 로그인 화면 유지

---

#### 테스트 케이스 3: 잘못된 PIN
1. "관리자" 버튼 클릭
2. ID 입력: `admin`
3. PIN 입력: `1111` (잘못된 PIN)
4. "로그인" 버튼 클릭

**✅ 예상 결과**:
- Toast 메시지: "잘못된 관리자 ID 또는 PIN입니다"
- 로그인 화면 유지

---

#### 테스트 케이스 4: Driver 로그인 (회귀 테스트)
1. "기사" 버튼 클릭
2. ID 입력: `driver-a`
3. PIN 입력: `1234`
4. "로그인" 버튼 클릭

**✅ 예상 결과**:
- Toast 메시지: "환영합니다, 김철수님!"
- Driver 홈 화면으로 이동
- 하단 네비게이션: "홈", "활동", "프로필" 표시

---

### 3️⃣ Mock 데이터 확인

브라우저 콘솔에서 다음 명령어로 전체 mock 데이터 확인:

```javascript
// 전체 mock 데이터 확인
console.log('Drivers:', dataLayer.mockData.drivers);
console.log('Admins:', dataLayer.mockData.admins);
console.log('Locations:', dataLayer.mockData.locations);
console.log('Route Days:', dataLayer.mockData.routeDays);
console.log('Stops:', dataLayer.mockData.stops);
```

**예상 결과**:
```javascript
Drivers: [
  {id: 'driver-a', name: '김철수', region: 'N', pin_hash: '1234', status: 'READY'},
  {id: 'driver-b', name: '이영희', region: 'S', pin_hash: '5678', status: 'READY'}
]

Admins: [
  {id: 'admin', name: '운영관리자', pin_hash: '0000'}
]

Locations: [...] (9개)
Route Days: [...] (오늘 경로 2개)
Stops: [...] (오늘 정차지 9개)
```

---

### 4️⃣ 로그인 플로우 디버깅

로그인 실패 시 브라우저 콘솔에서 다음을 확인하세요:

```javascript
// 1. Admin 목록이 제대로 불러와지는지
const admins = await api.admins.getAll();
console.log('Admins:', admins);

// 2. 입력한 ID와 PIN으로 검색
const id = 'admin';
const pin = '0000';
const user = admins.find(a => a.id === id && a.pin_hash === pin);
console.log('Found user:', user);

// 3. 찾은 사용자로 상태 설정
if (user) {
    state.setUser(user, 'ADMIN');
    console.log('Logged in as:', state.getUser());
    console.log('Role:', state.getRole());
}
```

---

### 5️⃣ localStorage 확인

로그인 후 브라우저 콘솔에서:

```javascript
// localStorage 확인
console.log('Session:', localStorage.getItem('mumuBeddingSession'));

// 또는 파싱해서 확인
const session = JSON.parse(localStorage.getItem('mumuBeddingSession'));
console.log('Current User:', session.currentUser);
console.log('Current Role:', session.currentRole);
```

**예상 결과** (Admin 로그인 후):
```javascript
{
  currentUser: {
    id: 'admin',
    name: '운영관리자',
    pin_hash: '0000'
  },
  currentRole: 'ADMIN'
}
```

---

## 🔍 문제 해결

### 문제: "dataLayer is not defined"
- **원인**: 스크립트 로딩 순서 문제
- **해결**: 페이지 새로고침 (F5)
- **확인**: `index.html`에 `<script src="js/data-layer.js"></script>` 존재 확인

### 문제: Admin 목록이 비어있음
- **원인**: Mock 데이터 초기화 안 됨
- **해결**: 브라우저 캐시 삭제 후 새로고침 (Ctrl+Shift+R)
- **확인**: `dataLayer.mockData.admins` 콘솔 확인

### 문제: "Admins: undefined"
- **원인**: `api.js` 수정 사항이 반영 안 됨
- **해결**: 
  1. 브라우저 캐시 삭제 (Ctrl+Shift+Del)
  2. 페이지 새로고침 (Ctrl+F5)
  3. 파일이 제대로 저장되었는지 확인

### 문제: 로그인 후 화면이 비어있음
- **원인**: Role에 따른 화면 라우팅 문제
- **확인**: 
  ```javascript
  console.log('Current Role:', state.getRole());
  console.log('Is Admin:', state.isAdmin());
  ```
- **해결**: Admin 홈 화면(`admin-home.js`) 확인

---

## 📊 체크리스트

로그인 테스트 전 다음을 확인하세요:

- [ ] `js/data-layer.js` 파일에 `getAllAdmins()` 함수 존재
- [ ] `js/data-layer.js` 파일에 `getAdminById()` 함수 존재
- [ ] `js/api.js` 파일에서 `dataLayer.getAllAdmins()` 호출
- [ ] `js/api.js` 파일에서 `dataLayer.getAdminById()` 호출
- [ ] `index.html`에 `<script src="js/data-layer.js"></script>` 포함
- [ ] Mock 데이터에 Admin 계정 존재 (`id: 'admin', pin_hash: '0000'`)

---

## 🎯 성공 기준

다음 모든 조건이 충족되어야 합니다:

1. ✅ Admin 로그인 성공 (`admin` / `0000`)
2. ✅ Admin 홈 화면 표시
3. ✅ localStorage에 `currentRole: 'ADMIN'` 저장
4. ✅ 하단 네비게이션에 "배송지", "리포트" 탭 표시
5. ✅ Driver 로그인도 정상 작동 (회귀 테스트)

---

**테스트 작성일**: 2026-01-09  
**버전**: 1.1.1  
**상태**: ✅ Ready for Testing
