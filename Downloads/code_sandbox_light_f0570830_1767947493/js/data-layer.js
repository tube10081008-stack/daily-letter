/**
 * Data Access Layer - Neon DB Integration
 * 
 * 이 레이어는 Netlify Functions를 통해 Neon Postgres와 통신합니다.
 * localStorage에는 token/role/id 같은 세션 정보만 저장합니다.
 * 
 * 모든 시간 데이터는 서버에서 ISO 8601 형식으로 생성됩니다.
 */

const dataLayer = {
    // ============================================
    // 설정
    // ============================================
    
    // API 베이스 URL (Netlify Functions)
    apiBase: '/.netlify/functions',
    
    // 세션 토큰 (localStorage에서 로드)
    getToken() {
        const session = localStorage.getItem('mumuBeddingSession');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                return parsed.token;
            } catch (e) {
                return null;
            }
        }
        return null;
    },
    
    getUserId() {
        const session = localStorage.getItem('mumuBeddingSession');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                return parsed.currentUser?.id;
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    // ============================================
    // HTTP 헬퍼
    // ============================================
    
    async request(endpoint, options = {}) {
        const url = `${this.apiBase}${endpoint}`;
        const token = this.getToken();
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },

    // ============================================
    // 인증 (Authentication)
    // ============================================
    
    /**
     * Driver 로그인
     * @param {string} id - Driver ID
     * @param {string} pin - PIN 코드
     * @returns {Promise<Object|null>} Driver 객체 + token
     */
    async authenticateDriver(id, pin) {
        try {
            const result = await this.request('/auth-login', {
                method: 'POST',
                body: JSON.stringify({ role: 'DRIVER', id, pin })
            });
            
            if (result.success) {
                return {
                    ...result.user,
                    token: result.token
                };
            }
            return null;
        } catch (error) {
            console.error('Driver auth error:', error);
            return null;
        }
    },

    /**
     * Admin 로그인
     * @param {string} id - Admin ID
     * @param {string} pin - PIN 코드
     * @returns {Promise<Object|null>} Admin 객체 + token
     */
    async authenticateAdmin(id, pin) {
        try {
            const result = await this.request('/auth-login', {
                method: 'POST',
                body: JSON.stringify({ role: 'ADMIN', id, pin })
            });
            
            if (result.success) {
                return {
                    ...result.user,
                    token: result.token
                };
            }
            return null;
        } catch (error) {
            console.error('Admin auth error:', error);
            return null;
        }
    },

    // ============================================
    // RouteDay & Stops (오늘의 경로)
    // ============================================
    
    /**
     * 오늘의 Driver 경로 및 정차지 조회
     * @param {string} driverId - Driver ID
     * @returns {Promise<Object|null>} { routeDay, stops }
     */
    async getTodayRouteForDriver(driverId) {
        try {
            const today = utils.formatDate();
            const result = await this.request(`/today?date=${today}&driverId=${driverId}`);
            return result;
        } catch (error) {
            console.error('Today route error:', error);
            return null;
        }
    },

    /**
     * 오늘의 Driver 정차지 목록 조회 (stops만)
     * @param {string} driverId - Driver ID
     * @returns {Promise<Array>} Stop 목록
     */
    async getTodayStopsForDriver(driverId) {
        try {
            const result = await this.getTodayRouteForDriver(driverId);
            return result ? result.stops : [];
        } catch (error) {
            console.error('Today stops error:', error);
            return [];
        }
    },

    /**
     * RouteDay의 모든 정차지 조회
     * @param {string} routeDayId - RouteDay ID
     * @returns {Promise<Array>} Stop 목록
     */
    async getStopsByRouteDay(routeDayId) {
        // 서버에서 routeDayId로 조회하는 엔드포인트가 없으므로
        // 클라이언트에서 필터링 (또는 새 엔드포인트 추가 필요)
        console.warn('getStopsByRouteDay: 서버 엔드포인트 추가 필요');
        return [];
    },

    /**
     * Stop ID로 조회
     * @param {string} stopId - Stop ID
     * @returns {Promise<Object|null>} Stop 객체
     */
    async getStopById(stopId) {
        // 개별 stop 조회 엔드포인트 없음 (필요시 추가)
        console.warn('getStopById: 서버 엔드포인트 추가 필요');
        return null;
    },

    /**
     * 정차지 완료 처리
     * @param {string} stopId - Stop ID
     * @param {Object} payload - { deliveredType, note }
     * @returns {Promise<Object>} 업데이트된 Stop 객체
     */
    async completeStop(stopId, payload) {
        try {
            const userId = this.getUserId();
            const result = await this.request('/stop-complete', {
                method: 'POST',
                body: JSON.stringify({
                    stopId,
                    deliveredType: payload.deliveredType,
                    note: payload.note,
                    userId
                })
            });
            
            return result.success ? result.stop : null;
        } catch (error) {
            console.error('Complete stop error:', error);
            throw error;
        }
    },

    /**
     * 경로 시작 (job_started_at 기록)
     * @param {string} routeDayId - RouteDay ID
     * @returns {Promise<Object>} 업데이트된 RouteDay 객체
     */
    async startRoute(routeDayId) {
        // 서버 엔드포인트 없음 (필요시 추가)
        console.warn('startRoute: 서버 엔드포인트 추가 필요');
        return null;
    },

    /**
     * 정차지 순서 변경
     * @param {Array} stops - 재정렬된 Stop 목록
     * @returns {Promise<Array>} 업데이트된 Stop 목록
     */
    async reorderStops(stops) {
        // 서버 엔드포인트 없음 (필요시 추가)
        console.warn('reorderStops: 서버 엔드포인트 추가 필요');
        return stops;
    },

    // ============================================
    // StopEvent 관련 (메모, 시스템 로그)
    // ============================================
    
    /**
     * 정차지 이벤트 생성 (메모)
     * @param {string} stopId - Stop ID
     * @param {string} type - 'NOTE' | 'SYSTEM'
     * @param {string} content - 내용
     * @returns {Promise<Object>} 생성된 StopEvent 객체
     */
    async createStopEvent(stopId, type, content) {
        try {
            const userId = this.getUserId();
            
            if (type === 'NOTE') {
                const result = await this.request('/stop-note', {
                    method: 'POST',
                    body: JSON.stringify({
                        stopId,
                        content,
                        userId
                    })
                });
                return result.success ? result.event : null;
            }
            
            // SYSTEM 이벤트는 서버에서 자동 생성되므로 클라이언트에서 호출 불필요
            return null;
        } catch (error) {
            console.error('Create stop event error:', error);
            throw error;
        }
    },

    /**
     * 정차지의 모든 이벤트 조회
     * @param {string} stopId - Stop ID
     * @returns {Promise<Array>} StopEvent 목록
     */
    async getStopEvents(stopId) {
        // 서버 엔드포인트 없음 (필요시 추가)
        console.warn('getStopEvents: 서버 엔드포인트 추가 필요');
        return [];
    },

    /**
     * 오늘의 모든 이벤트 조회
     * @returns {Promise<Array>} StopEvent 목록
     */
    async getTodayEvents() {
        // 서버 엔드포인트 없음 (필요시 추가)
        console.warn('getTodayEvents: 서버 엔드포인트 추가 필요');
        return [];
    },

    // ============================================
    // Location 관련
    // ============================================
    
    /**
     * 모든 Location 조회
     * @returns {Promise<Array>} Location 목록
     */
    async getAllLocations() {
        // 서버 엔드포인트 없음 (필요시 추가)
        // 대신 /today에서 location 정보가 join되어 오므로 별도 조회 불필요
        console.warn('getAllLocations: /today 응답에 location 정보 포함됨');
        return [];
    },

    /**
     * Location ID로 조회
     * @param {string} locationId - Location ID
     * @returns {Promise<Object|null>} Location 객체
     */
    async getLocationById(locationId) {
        // 서버 엔드포인트 없음
        console.warn('getLocationById: 서버 엔드포인트 추가 필요');
        return null;
    },

    /**
     * Location 출입 안내 업데이트
     * @param {string} locationId - Location ID
     * @param {string} text - 출입 안내 텍스트
     * @returns {Promise<Object>} 업데이트된 Location 객체
     */
    async updateEntryInstruction(locationId, text) {
        try {
            const result = await this.request('/location-update', {
                method: 'PATCH',
                body: JSON.stringify({
                    locationId,
                    entry_instruction_text: text
                })
            });
            
            return result.success ? result.location : null;
        } catch (error) {
            console.error('Update entry instruction error:', error);
            throw error;
        }
    },

    // ============================================
    // Driver 관련
    // ============================================
    
    /**
     * 모든 Driver 조회
     * @returns {Promise<Array>} Driver 목록
     */
    async getAllDrivers() {
        // 서버 엔드포인트 없음 (필요시 추가)
        console.warn('getAllDrivers: 서버 엔드포인트 추가 필요');
        return [];
    },

    /**
     * Driver ID로 조회
     * @param {string} driverId - Driver ID
     * @returns {Promise<Object|null>} Driver 객체
     */
    async getDriverById(driverId) {
        // 서버 엔드포인트 없음
        console.warn('getDriverById: 서버 엔드포인트 추가 필요');
        return null;
    },

    /**
     * Driver 상태 업데이트
     * @param {string} driverId - Driver ID
     * @param {string} status - 상태
     * @returns {Promise<Object>} 업데이트된 Driver 객체
     */
    async updateDriverStatus(driverId, status) {
        // 서버 엔드포인트 없음
        console.warn('updateDriverStatus: 서버 엔드포인트 추가 필요');
        return null;
    },

    // ============================================
    // Admin 관련
    // ============================================
    
    /**
     * 모든 Admin 조회
     * @returns {Promise<Array>} Admin 목록
     */
    async getAllAdmins() {
        // 서버 엔드포인트 없음 (필요시 추가)
        console.warn('getAllAdmins: 서버 엔드포인트 추가 필요');
        return [];
    },

    /**
     * Admin ID로 조회
     * @param {string} adminId - Admin ID
     * @returns {Promise<Object|null>} Admin 객체
     */
    async getAdminById(adminId) {
        // 서버 엔드포인트 없음
        console.warn('getAdminById: 서버 엔드포인트 추가 필요');
        return null;
    },

    // ============================================
    // Notification 관련
    // ============================================
    
    /**
     * 알림 생성
     * @param {string} targetRole - 'DRIVER' | 'ADMIN'
     * @param {string} targetId - 대상 ID
     * @param {string} channel - 'SMS' | 'EMAIL'
     * @param {string} message - 메시지 내용
     * @returns {Promise<Object>} 생성된 Notification 객체
     */
    async createNotification(targetRole, targetId, channel, message) {
        // 서버 엔드포인트 없음 (필요시 추가)
        console.warn('createNotification: 서버 엔드포인트 추가 필요');
        return null;
    },

    /**
     * 대상별 알림 조회
     * @param {string} targetRole - 'DRIVER' | 'ADMIN'
     * @param {string} targetId - 대상 ID
     * @returns {Promise<Array>} Notification 목록
     */
    async getNotificationsByTarget(targetRole, targetId) {
        // 서버 엔드포인트 없음
        console.warn('getNotificationsByTarget: 서버 엔드포인트 추가 필요');
        return [];
    },

    /**
     * 모든 알림 조회
     * @returns {Promise<Array>} Notification 목록
     */
    async getAllNotifications() {
        // 서버 엔드포인트 없음
        console.warn('getAllNotifications: 서버 엔드포인트 추가 필요');
        return [];
    },

    // ============================================
    // Admin Overview 관련
    // ============================================
    
    /**
     * 관리자 대시보드 개요 데이터 조회
     * @returns {Promise<Object>} { drivers, routeDays, stops }
     */
    async getAdminOverview() {
        // 서버 엔드포인트 없음 (필요시 추가)
        console.warn('getAdminOverview: 서버 엔드포인트 추가 필요');
        return { drivers: [], routeDays: [], stops: [] };
    },

    /**
     * 일일 리포트 데이터 조회
     * @param {string} date - 날짜 (YYYY-MM-DD)
     * @returns {Promise<Object>} 리포트 데이터
     */
    async getDailyReport(date) {
        // 서버 엔드포인트 없음
        console.warn('getDailyReport: 서버 엔드포인트 추가 필요');
        return { date, routeDays: [], stops: [], events: [] };
    },

    // ============================================
    // 특정 날짜의 RouteDay 조회
    // ============================================
    
    /**
     * 특정 날짜의 모든 RouteDay 조회
     * @param {string} date - 날짜 (YYYY-MM-DD)
     * @returns {Promise<Array>} RouteDay 목록
     */
    async getRouteDaysByDate(date) {
        // 서버 엔드포인트 없음
        console.warn('getRouteDaysByDate: 서버 엔드포인트 추가 필요');
        return [];
    }
};

// Mock 데이터 관련 함수 제거 (더 이상 사용하지 않음)
// initSeedData(), validateMockData() 등은 삭제됨
