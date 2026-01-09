# MumuBedding 빠른 시작 가이드

이 가이드는 5분 안에 시스템을 배포하고 테스트하는 방법을 안내합니다.

## 📋 사전 준비

- 인터넷 연결
- 최신 웹 브라우저 (Chrome, Safari, Firefox, Edge)
- Netlify 계정 (무료, 이메일로 가입 가능)

---

## 🚀 5분 배포

### Step 1: Netlify 가입 (1분)

```
1. https://app.netlify.com 접속
2. "Sign up" 클릭
3. Email 또는 GitHub으로 가입
4. 이메일 인증 완료
```

### Step 2: 프로젝트 배포 (2분)

```
1. Netlify 대시보드에서 "Add new site" 클릭
2. "Deploy manually" 선택
3. 프로젝트 폴더 전체를 드래그 앤 드롭
4. 배포 시작 (1-2분 소요)
5. "Site is live" 메시지 확인
```

### Step 3: URL 확인 및 테스트 (2분)

```
1. 배포된 URL 클릭 (예: https://random-name-xxxxx.netlify.app)
2. 로그인 화면 확인
3. 데모 계정으로 로그인 테스트:
   - Driver: driver-a / 1234
   - Admin: admin / 0000
```

**🎉 축하합니다! 배포 완료!**

---

## 🎯 첫 번째 테스트 시나리오

### Driver 플로우 (3분)

```
1. 로그인 화면에서 "기사" 탭 선택
2. ID: driver-a, PIN: 1234 입력 → 로그인
3. "경로 시작하기" 버튼 클릭
4. 정차지 목록에서 첫 번째 정차지 탭
5. 출입 안내 확인 (스크롤)
6. 주소 옆 "복사" 버튼 클릭 (클립보드에 복사됨)
7. "완료하기" 버튼 클릭
   - 시간이 11:30 이전이면 경고 메시지 표시
   - 11:30 이후면 완료 Modal 표시
8. "배송 완료" 선택
9. 메모에 "테스트" 입력 (선택)
10. "완료 저장" 버튼 클릭
11. 목록으로 돌아가기 → 첫 번째 정차지 "완료" 상태 확인
```

### Ops 플로우 (3분)

```
1. 로그아웃 (프로필 → 로그아웃)
2. "관리자" 탭 선택
3. ID: admin, PIN: 0000 입력 → 로그인
4. Driver 카드에서 "김철수" 확인
   - 완료 1개, 남은 3개 표시 확인
5. "상세보기" 버튼 클릭
6. 정차지 목록 확인
7. 아무 정차지 탭 → "출입 안내 수정" 클릭
8. 텍스트 수정 후 "저장"
9. "리포트" 탭 클릭
10. "리포트 생성" 버튼 클릭
11. 완료율, 평균 간격, AI 요약 확인
```

---

## 📱 모바일에서 테스트

### iOS (Safari)

```
1. Safari에서 배포된 URL 접속
2. 로그인 화면 확인
3. 공유 버튼 → "홈 화면에 추가" 선택
4. 아이콘이 홈 화면에 추가됨
5. 아이콘 탭하여 앱처럼 사용
```

### Android (Chrome)

```
1. Chrome에서 배포된 URL 접속
2. 메뉴 (⋮) → "홈 화면에 추가" 선택
3. 아이콘이 홈 화면에 추가됨
4. 아이콤 탭하여 앱처럼 사용
```

---

## 🔧 URL 변경 (선택)

랜덤 URL 대신 원하는 이름으로 변경:

```
1. Netlify 대시보드 → Site settings
2. "Site details" → "Change site name" 클릭
3. 원하는 이름 입력 (예: mumu-bedding-ops)
4. Save
5. 새 URL: https://mumu-bedding-ops.netlify.app
```

---

## 🎨 커스텀 도메인 연결 (선택)

자신의 도메인 연결 (예: ops.mumubedding.com):

```
1. 도메인 구매 (가비아, GoDaddy 등)
2. Netlify → Site settings → Domain management
3. "Add custom domain" 클릭
4. 도메인 입력 (ops.mumubedding.com)
5. DNS 설정:
   - CNAME 레코드 추가
   - 호스트: ops
   - 값: your-site.netlify.app
6. SSL 인증서 자동 발급 (무료, 자동)
7. https://ops.mumubedding.com 으로 접속 가능
```

---

## 📊 데이터 확인

배포 후 데이터가 제대로 로드되는지 확인:

### 브라우저 개발자 도구 사용

```
1. 배포된 사이트 접속
2. F12 (또는 Cmd+Opt+I) → Console 탭
3. 다음 명령어 실행:

// 모든 drivers 조회
const res = await fetch('tables/drivers?limit=100');
const data = await res.json();
console.log(data);

// 오늘의 route_days 조회
const today = new Date().toISOString().split('T')[0];
const routesRes = await fetch('tables/route_days?limit=100');
const routes = await routesRes.json();
const todayRoutes = routes.data.filter(r => r.date === today);
console.log('Today Routes:', todayRoutes);

// 모든 locations 조회
const locsRes = await fetch('tables/locations?limit=100');
const locs = await locsRes.json();
console.log('Locations:', locs.data.length);
```

예상 결과:
```
- drivers: 2개 (driver-a, driver-b)
- admins: 1개 (admin)
- locations: 9개
- route_days: 2개 (오늘 날짜)
- stops: 9개 (오늘 날짜)
```

---

## 🆘 문제 해결

### 문제 1: 로그인 후 화면이 비어있음

**원인**: localStorage에 이전 세션 정보가 남아있음

**해결**:
```
1. F12 → Console 탭
2. 입력: localStorage.clear()
3. 새로고침 (F5)
4. 다시 로그인
```

### 문제 2: 완료 버튼이 비활성화됨

**원인**: 현재 시각이 11:30 이전

**해결**:
```
옵션 1: 11:30 이후에 테스트
옵션 2: 코드 수정 (테스트용)
  - js/utils.js 파일 수정
  - isWithinWindow() 함수에서 return true 강제
```

### 문제 3: 데이터가 로드되지 않음

**원인**: RESTful Table API 연결 문제

**해결**:
```
1. F12 → Network 탭
2. "tables/" 요청 확인
3. 상태 코드 확인 (200이어야 함)
4. CORS 오류 확인
5. 필요시 다시 배포
```

### 문제 4: 모바일에서 터치가 안됨

**원인**: 브라우저 호환성 또는 캐시

**해결**:
```
1. 모바일 브라우저 캐시 삭제
2. 페이지 새로고침
3. 다른 브라우저로 시도
```

---

## 🔄 매일 경로 준비

시스템은 현재 날짜(2026-01-09) 데이터만 있습니다.
내일부터 사용하려면 새 경로를 생성해야 합니다.

### 내일 경로 생성 (개발자 도구)

```javascript
// F12 → Console에 붙여넣기
async function createTomorrowRoutes() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // 북부권 경로 생성
    await fetch('tables/route_days', {
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
    
    // 남부권 경로 생성
    await fetch('tables/route_days', {
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
    
    // 북부권 stops 생성
    const northLocs = ['LOC-N001', 'LOC-N002', 'LOC-N003', 'LOC-N004'];
    for (let i = 0; i < northLocs.length; i++) {
        await fetch('tables/stops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: `stop-${tomorrowStr}-n-${i + 1}`,
                route_day_id: `route-${tomorrowStr}-n`,
                sequence: i + 1,
                location_id: northLocs[i],
                planned_cs: Math.floor(Math.random() * 4) + 1,
                planned_bt: Math.floor(Math.random() * 8) + 2,
                planned_ft: Math.floor(Math.random() * 8) + 2,
                status: 'READY',
                job_started_at: 0,
                completed_at: 0
            })
        });
    }
    
    // 남부권 stops 생성
    const southLocs = ['LOC-S001', 'LOC-S002', 'LOC-S003', 'LOC-S004', 'LOC-S005'];
    for (let i = 0; i < southLocs.length; i++) {
        await fetch('tables/stops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: `stop-${tomorrowStr}-s-${i + 1}`,
                route_day_id: `route-${tomorrowStr}-s`,
                sequence: i + 1,
                location_id: southLocs[i],
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

> **더 쉬운 방법**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)의 Admin Scripts 사용

---

## 📈 다음 단계

### 1단계: 실제 데이터 준비 ✅
- ✅ Driver 정보 수정 (이름, 전화번호)
- ✅ Location 추가/수정
- ✅ 매일 경로 생성 자동화

### 2단계: SMS 연동 📱
- 알리고/Twilio 계정 생성
- API Key 발급
- 실제 SMS 발송 테스트
- [DEPLOYMENT_GUIDE.md - SMS 연동](DEPLOYMENT_GUIDE.md#2-sms-연동-방법) 참고

### 3단계: 운영 정착 🎯
- 매일 아침/저녁 체크리스트 준수
- 백업 자동화
- 리포트 분석
- [DEPLOYMENT_GUIDE.md - 일상 운영](DEPLOYMENT_GUIDE.md#6-일상-운영) 참고

### 4단계: 개선 사항 🚀
- PIN 해싱 (보안 강화)
- AI 요약 (LLM 연동)
- Push 알림
- 오프라인 지원

---

## 🎓 추가 학습 자료

### 필수 문서
- [README.md](README.md) - 전체 프로젝트 개요
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 배포 및 운영 상세 가이드
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - 데이터베이스 구조

### 유용한 링크
- Netlify 문서: https://docs.netlify.com
- Tailwind CSS: https://tailwindcss.com/docs
- RESTful API 기본: https://restfulapi.net

---

## 💬 지원

### 자주 묻는 질문

**Q: 무료로 사용 가능한가요?**
A: 네, Netlify 무료 플랜으로 충분합니다. SMS는 건당 요금 발생합니다.

**Q: 동시에 몇 명이 사용할 수 있나요?**
A: 제한 없습니다. 웹 기반이므로 동시 접속 가능합니다.

**Q: 데이터는 어디에 저장되나요?**
A: 플랫폼 서버에 안전하게 저장됩니다. 정기 백업 권장합니다.

**Q: 오프라인에서도 작동하나요?**
A: 현재 버전은 온라인 필수입니다. Service Worker 추가 시 오프라인 지원 가능합니다.

**Q: 커스터마이징 가능한가요?**
A: 네, 모든 소스 코드가 제공되므로 자유롭게 수정 가능합니다.

### 문의
- 기술 지원: [이메일 주소]
- 긴급 지원: 1588-0000
- 문서 개선 제안: GitHub Issues

---

**🎉 배포 성공을 축하합니다!**

이제 실제 운영을 시작하실 수 있습니다. 
추가 지원이 필요하시면 언제든 문의해주세요.
