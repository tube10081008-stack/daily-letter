/**
 * Utility Functions
 */

const utils = {
    /**
     * Format timestamp to Korean datetime string
     */
    formatDateTime(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}/${day} ${hours}:${minutes}`;
    },

    /**
     * Format date to YYYY-MM-DD
     */
    formatDate(date) {
        if (!date) date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Format time to HH:MM
     */
    formatTime(date) {
        if (!date) date = new Date();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    },

    /**
     * Check if current time is within delivery window
     */
    isWithinWindow(windowStart = '11:30', windowEnd = '14:30') {
        const now = new Date();
        const currentTime = this.formatTime(now);
        return currentTime >= windowStart && currentTime <= windowEnd;
    },

    /**
     * Check if current time is before window start
     */
    isBeforeWindow(windowStart = '11:30') {
        const now = new Date();
        const currentTime = this.formatTime(now);
        return currentTime < windowStart;
    },

    /**
     * Check if current time is after window end
     */
    isAfterWindow(windowEnd = '14:30') {
        const now = new Date();
        const currentTime = this.formatTime(now);
        return currentTime > windowEnd;
    },

    /**
     * Calculate heuristic ETA for stops
     * First stop: +18 min, each subsequent: +12 min
     */
    calculateETA(completedCount, remainingCount) {
        const now = Date.now();
        const etas = [];
        
        for (let i = 0; i < remainingCount; i++) {
            const minutes = (i === 0) ? 18 : 18 + (i * 12);
            etas.push(now + (minutes * 60 * 1000));
        }
        
        return etas;
    },

    /**
     * Check if stop has late risk
     */
    hasLateRisk(etaTimestamp, windowEnd = '14:30') {
        const etaDate = new Date(etaTimestamp);
        const etaTime = this.formatTime(etaDate);
        return etaTime > windowEnd;
    },

    /**
     * Generate unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            }
        } catch (error) {
            console.error('Copy failed:', error);
            return false;
        }
    },

    /**
     * Truncate text to specified length
     */
    truncate(text, length = 40) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },

    /**
     * Get status color class
     */
    getStatusClass(status) {
        const statusMap = {
            'READY': 'status-ready',
            'IN_PROGRESS': 'status-in-progress',
            'COMPLETED': 'status-completed'
        };
        return statusMap[status] || 'status-ready';
    },

    /**
     * Get status label
     */
    getStatusLabel(status) {
        const labelMap = {
            'READY': '대기',
            'IN_PROGRESS': '진행중',
            'COMPLETED': '완료'
        };
        return labelMap[status] || status;
    },

    /**
     * Get delivered type label
     */
    getDeliveredTypeLabel(type) {
        const labelMap = {
            'DELIVERED': '배송완료',
            'COLLECTED': '회수완료',
            'BOTH': '배송+회수'
        };
        return labelMap[type] || '-';
    },

    /**
     * Debounce function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Format region
     */
    getRegionLabel(region) {
        return region === 'N' ? '북부권' : '남부권';
    }
};
