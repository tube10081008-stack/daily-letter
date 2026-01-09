/**
 * API Layer - Future Database/API Integration
 * 
 * 이 파일은 현재 dataLayer를 통해 mock 데이터를 사용하지만,
 * 추후 실제 Neon Postgres 또는 REST API 연동 시 여기에 구현합니다.
 * 
 * UI 코드는 이 파일의 인터페이스만 사용하므로,
 * 실제 DB 연결 시 UI 코드 변경 없이 여기만 수정하면 됩니다.
 */

const api = {
    // ============================================
    // 설정
    // ============================================
    
    // 추후 실제 API 엔드포인트로 변경
    baseUrl: '/api', // 또는 'https://your-api-domain.com/api'
    
    // 현재 모드: 'mock' (추후 'database' 또는 'rest'로 변경)
    mode: 'mock',

    /**
     * Base fetch wrapper (추후 실제 API 호출 시 사용)
     */
    async request(url, options = {}) {
        try {
            const response = await fetch(this.baseUrl + url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // ============================================
    // 인증 (Authentication)
    // ============================================
    
    auth: {
        /**
         * Driver 로그인
         */
        async loginDriver(id, pin) {
            // 현재: dataLayer 사용
            // 추후: await api.request('/auth/driver', { method: 'POST', body: JSON.stringify({ id, pin }) })
            return await dataLayer.authenticateDriver(id, pin);
        },

        /**
         * Admin 로그인
         */
        async loginAdmin(id, pin) {
            // 현재: dataLayer 사용
            // 추후: await api.request('/auth/admin', { method: 'POST', body: JSON.stringify({ id, pin }) })
            return await dataLayer.authenticateAdmin(id, pin);
        }
    },

    // ============================================
    // Driver 관련
    // ============================================
    
    drivers: {
        /**
         * 모든 Driver 조회
         */
        async getAll() {
            // 현재: dataLayer 사용
            // 추후: await api.request('/drivers')
            return await dataLayer.getAllDrivers();
        },

        /**
         * Driver ID로 조회
         */
        async getById(id) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/drivers/${id}`)
            return await dataLayer.getDriverById(id);
        },

        /**
         * Driver 상태 업데이트
         */
        async updateStatus(id, status) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/drivers/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
            return await dataLayer.updateDriverStatus(id, status);
        }
    },

    // ============================================
    // Admin 관련
    // ============================================
    
    admins: {
        /**
         * 모든 Admin 조회
         */
        async getAll() {
            // 현재: dataLayer 사용
            // 추후: await api.request('/admins')
            return await dataLayer.getAllAdmins();
        },

        /**
         * Admin ID로 조회
         */
        async getById(id) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/admins/${id}`)
            return await dataLayer.getAdminById(id);
        }
    },

    // ============================================
    // Location 관련
    // ============================================
    
    locations: {
        /**
         * 모든 Location 조회
         */
        async getAll() {
            // 현재: dataLayer 사용
            // 추후: await api.request('/locations')
            return await dataLayer.getAllLocations();
        },

        /**
         * Location ID로 조회
         */
        async getById(id) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/locations/${id}`)
            return await dataLayer.getLocationById(id);
        },

        /**
         * Location 출입 안내 업데이트
         */
        async updateEntryInstruction(id, text) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/locations/${id}`, { method: 'PATCH', body: JSON.stringify({ entry_instruction_text: text }) })
            return await dataLayer.updateEntryInstruction(id, text);
        }
    },

    // ============================================
    // RouteDay 관련
    // ============================================
    
    routeDays: {
        /**
         * 특정 날짜의 모든 RouteDay 조회
         */
        async getByDate(date) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/route-days?date=${date}`)
            return await dataLayer.getRouteDaysByDate(date);
        },

        /**
         * Driver와 날짜로 RouteDay 조회
         */
        async getByDriverAndDate(driverId, date) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/route-days?driverId=${driverId}&date=${date}`)
            return await dataLayer.getTodayRouteForDriver(driverId);
        },

        /**
         * 경로 시작
         */
        async startJob(routeId) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/route-days/${routeId}/start`, { method: 'POST' })
            return await dataLayer.startRoute(routeId);
        }
    },

    // ============================================
    // Stop 관련
    // ============================================
    
    stops: {
        /**
         * 모든 Stop 조회
         */
        async getAll() {
            // 현재: dataLayer 사용
            // 추후: await api.request('/stops')
            return await dataLayer.mockData.stops; // 전체 조회는 필요 시 dataLayer에 함수 추가
        },

        /**
         * RouteDay의 모든 Stop 조회
         */
        async getByRouteDay(routeDayId) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/stops?routeDayId=${routeDayId}`)
            return await dataLayer.getStopsByRouteDay(routeDayId);
        },

        /**
         * Stop ID로 조회
         */
        async getById(id) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/stops/${id}`)
            return await dataLayer.getStopById(id);
        },

        /**
         * Stop 상태 업데이트
         */
        async updateStatus(id, status) {
            // 현재: dataLayer 사용 (간단히 상태만 변경)
            // 추후: await api.request(`/stops/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
            const stop = await dataLayer.getStopById(id);
            if (stop) {
                stop.status = status;
            }
            return stop;
        },

        /**
         * Stop 완료 처리
         */
        async complete(id, deliveredType, note) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/stops/${id}/complete`, { method: 'POST', body: JSON.stringify({ deliveredType, note }) })
            return await dataLayer.completeStop(id, { deliveredType, note });
        },

        /**
         * Stop 순서 재정렬
         */
        async reorder(stops) {
            // 현재: dataLayer 사용
            // 추후: await api.request('/stops/reorder', { method: 'POST', body: JSON.stringify({ stops }) })
            return await dataLayer.reorderStops(stops);
        }
    },

    // ============================================
    // StopEvent 관련
    // ============================================
    
    stopEvents: {
        /**
         * Stop의 모든 Event 조회
         */
        async getByStop(stopId) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/stop-events?stopId=${stopId}`)
            return await dataLayer.getStopEvents(stopId);
        },

        /**
         * StopEvent 생성
         */
        async create(stopId, type, content, createdBy) {
            // 현재: dataLayer 사용
            // 추후: await api.request('/stop-events', { method: 'POST', body: JSON.stringify({ stopId, type, content, createdBy }) })
            return await dataLayer.createStopEvent(stopId, type, content);
        },

        /**
         * 모든 Event 조회
         */
        async getAll() {
            // 현재: dataLayer 사용
            // 추후: await api.request('/stop-events')
            return await dataLayer.getTodayEvents();
        }
    },

    // ============================================
    // Notification 관련
    // ============================================
    
    notifications: {
        /**
         * 모든 Notification 조회
         */
        async getAll() {
            // 현재: dataLayer 사용
            // 추후: await api.request('/notifications')
            return await dataLayer.getAllNotifications();
        },

        /**
         * 대상별 Notification 조회
         */
        async getByTarget(targetRole, targetId) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/notifications?targetRole=${targetRole}&targetId=${targetId}`)
            return await dataLayer.getNotificationsByTarget(targetRole, targetId);
        },

        /**
         * Notification 생성
         */
        async create(targetRole, targetId, channel, message) {
            // 현재: dataLayer 사용
            // 추후: await api.request('/notifications', { method: 'POST', body: JSON.stringify({ targetRole, targetId, channel, message }) })
            return await dataLayer.createNotification(targetRole, targetId, channel, message);
        }
    },

    // ============================================
    // Admin Overview 관련
    // ============================================
    
    admin: {
        /**
         * 관리자 대시보드 개요 조회
         */
        async getOverview() {
            // 현재: dataLayer 사용
            // 추후: await api.request('/admin/overview')
            return await dataLayer.getAdminOverview();
        },

        /**
         * 일일 리포트 조회
         */
        async getDailyReport(date) {
            // 현재: dataLayer 사용
            // 추후: await api.request(`/admin/reports/daily?date=${date}`)
            return await dataLayer.getDailyReport(date);
        }
    }
};

/**
 * ============================================
 * 실제 DB 연동 시 참고사항
 * ============================================
 * 
 * 1. Neon Postgres 연동 예시:
 * 
 *    const { Pool } = require('pg');
 *    const pool = new Pool({
 *        connectionString: process.env.DATABASE_URL,
 *        ssl: { rejectUnauthorized: false }
 *    });
 * 
 *    async function getDriverById(id) {
 *        const result = await pool.query('SELECT * FROM drivers WHERE id = $1', [id]);
 *        return result.rows[0];
 *    }
 * 
 * 2. REST API 연동 예시:
 * 
 *    async function getDriverById(id) {
 *        const response = await fetch(`https://your-api.com/drivers/${id}`);
 *        return await response.json();
 *    }
 * 
 * 3. Netlify Functions 연동 예시:
 * 
 *    async function getDriverById(id) {
 *        const response = await fetch(`/.netlify/functions/get-driver?id=${id}`);
 *        return await response.json();
 *    }
 * 
 * 4. 인증 토큰 처리:
 * 
 *    // localStorage에서 토큰 가져오기
 *    const token = localStorage.getItem('authToken');
 *    
 *    // 요청 헤더에 포함
 *    const response = await fetch('/api/stops', {
 *        headers: {
 *            'Authorization': `Bearer ${token}`,
 *            'Content-Type': 'application/json'
 *        }
 *    });
 * 
 * 5. 에러 핸들링:
 * 
 *    try {
 *        const data = await api.drivers.getById('driver-a');
 *    } catch (error) {
 *        if (error.message.includes('401')) {
 *            // 인증 오류 - 로그인 페이지로 리다이렉트
 *            app.navigateTo('login');
 *        } else if (error.message.includes('404')) {
 *            // 데이터 없음
 *            ui.showToast('데이터를 찾을 수 없습니다');
 *        } else {
 *            // 기타 오류
 *            ui.showToast('오류가 발생했습니다');
 *        }
 *    }
 * 
 * ============================================
 */
