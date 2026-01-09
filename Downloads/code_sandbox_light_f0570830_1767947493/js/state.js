/**
 * Application State Management
 * 
 * localStorage 사용 범위:
 * - 로그인 상태 (currentUser, currentRole)
 * - 세션 정보만 영구 저장
 * 
 * 임시 캐시 데이터 (새로고침 시 초기화):
 * - locations, drivers 등은 메모리에만 저장
 */

const state = {
    // Current session (localStorage에 저장)
    currentUser: null,
    currentRole: null, // 'DRIVER' or 'ADMIN'
    
    // Cached data (메모리 전용, 새로고침 시 초기화)
    locations: [],
    drivers: [],
    
    /**
     * Initialize state from localStorage
     */
    init() {
        const stored = localStorage.getItem('mumuBeddingSession');
        if (stored) {
            try {
                const session = JSON.parse(stored);
                this.currentUser = session.currentUser;
                this.currentRole = session.currentRole;
                // token은 currentUser 객체에 포함되어 있음
            } catch (error) {
                console.error('Failed to parse session:', error);
                this.clear();
            }
        }
    },

    /**
     * Save session to localStorage (토큰 포함)
     */
    save() {
        localStorage.setItem('mumuBeddingSession', JSON.stringify({
            currentUser: this.currentUser,
            currentRole: this.currentRole,
            token: this.currentUser?.token || null
        }));
    },

    /**
     * Set current user (토큰 포함)
     */
    setUser(user, role) {
        this.currentUser = user;
        this.currentRole = role;
        this.save();
    },
    
    /**
     * Get token
     */
    getToken() {
        return this.currentUser?.token || null;
    },

    /**
     * Get current user
     */
    getUser() {
        return this.currentUser;
    },

    /**
     * Get current role
     */
    getRole() {
        return this.currentRole;
    },

    /**
     * Get current user ID
     */
    getCurrentUserId() {
        return this.currentUser ? this.currentUser.id : null;
    },

    /**
     * Get current user name
     */
    getCurrentUserName() {
        return this.currentUser ? this.currentUser.name : '';
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.currentUser !== null;
    },

    /**
     * Check if user is driver
     */
    isDriver() {
        return this.currentRole === 'DRIVER';
    },

    /**
     * Check if user is admin
     */
    isAdmin() {
        return this.currentRole === 'ADMIN';
    },

    /**
     * Clear session
     */
    clear() {
        this.currentUser = null;
        this.currentRole = null;
        localStorage.removeItem('mumuBeddingSession');
    },

    /**
     * Load and cache locations
     */
    async loadLocations() {
        if (this.locations.length === 0) {
            this.locations = await api.locations.getAll();
        }
        return this.locations;
    },

    /**
     * Get location by ID
     */
    getLocationById(locationId) {
        return this.locations.find(loc => loc.id === locationId);
    },

    /**
     * Load and cache drivers
     */
    async loadDrivers() {
        if (this.drivers.length === 0) {
            this.drivers = await api.drivers.getAll();
        }
        return this.drivers;
    },

    /**
     * Get driver by ID
     */
    getDriverById(driverId) {
        return this.drivers.find(d => d.id === driverId);
    },

    /**
     * Refresh driver data
     */
    async refreshDrivers() {
        this.drivers = await api.drivers.getAll();
        return this.drivers;
    }
};

// Initialize state on load
state.init();
