/**
 * Main Application Controller
 */

const app = {
    currentRoute: null,
    currentParams: null,

    /**
     * Initialize application
     */
    init() {
        console.log('MumuBedding App initializing...');

        // Check if user is logged in
        if (state.isLoggedIn()) {
            // Navigate to home
            this.navigateTo('today');
        } else {
            // Navigate to login
            this.navigateTo('login');
        }

        // Listen for back button
        window.addEventListener('popstate', () => {
            this.handleBackButton();
        });

        console.log('MumuBedding App initialized');
    },

    /**
     * Navigate to a route
     */
    navigateTo(route, params = null) {
        console.log('Navigating to:', route, params);

        // Store current route
        this.currentRoute = route;
        this.currentParams = params;

        // Check authentication
        if (!state.isLoggedIn() && route !== 'login') {
            this.navigateTo('login');
            return;
        }

        // Route to appropriate screen
        switch (route) {
            case 'login':
                loginScreen.render();
                break;

            case 'today':
                if (state.isDriver()) {
                    driverHomeScreen.render();
                } else if (state.isAdmin()) {
                    adminHomeScreen.render();
                }
                break;

            case 'admin-home':
                if (state.isAdmin()) {
                    adminHomeScreen.render();
                } else {
                    this.navigateTo('today');
                }
                break;

            case 'location-management':
                if (state.isAdmin()) {
                    locationManagementScreen.render();
                } else {
                    this.navigateTo('today');
                }
                break;

            case 'location-form':
                if (state.isAdmin()) {
                    locationFormScreen.render(params);
                } else {
                    this.navigateTo('today');
                }
                break;

            case 'create-assignment':
                if (state.isAdmin()) {
                    createAssignmentScreen.render();
                } else {
                    this.navigateTo('today');
                }
                break;

            case 'ops-home':
                if (state.isAdmin()) {
                    opsHomeScreen.render();
                } else {
                    this.navigateTo('today');
                }
                break;

            case 'stop-detail':
                if (state.isDriver() && params) {
                    driverStopDetailScreen.render(params);
                }
                break;

            case 'driver-detail':
                if (state.isAdmin() && params) {
                    opsDriverDetailScreen.render(params);
                }
                break;

            case 'feed':
                if (state.isDriver()) {
                    this.renderDriverFeed();
                } else if (state.isAdmin()) {
                    this.renderOpsFeed();
                }
                break;

            case 'report':
                if (state.isAdmin()) {
                    reportScreen.render();
                } else {
                    this.navigateTo('today');
                }
                break;

            case 'profile':
                profileScreen.render();
                break;

            default:
                console.error('Unknown route:', route);
                this.navigateTo('today');
        }
    },

    /**
     * Render driver feed
     */
    async renderDriverFeed() {
        ui.showLoading('로딩 중...');

        try {
            const user = state.getUser();
            const today = utils.formatDate();
            const routeDay = await api.routeDays.getByDriverAndDate(user.id, today);

            if (!routeDay) {
                ui.hideLoading();
                this.renderNoFeed();
                return;
            }

            const stops = await api.stops.getByRouteDay(routeDay.id);
            const stopIds = stops.map(s => s.id);
            const events = await api.stopEvents.getAll();
            
            // Filter events for this driver's stops
            const myEvents = events.filter(e => stopIds.includes(e.stop_id));

            // Get notifications
            const notifications = await api.notifications.getByTarget('DRIVER', user.id);

            await state.loadLocations();

            ui.hideLoading();

            const activities = [];

            // Add completion events
            stops.filter(s => s.completed_at > 0).forEach(stop => {
                const location = state.getLocationById(stop.location_id);
                activities.push({
                    time: stop.completed_at,
                    type: 'completion',
                    icon: '✓',
                    title: `${location.name} 완료`,
                    detail: utils.getDeliveredTypeLabel(stop.delivered_type),
                    color: 'green'
                });
            });

            // Add note events
            myEvents.filter(e => e.type === 'NOTE').forEach(event => {
                const stop = stops.find(s => s.id === event.stop_id);
                const location = state.getLocationById(stop.location_id);
                activities.push({
                    time: event.created_at,
                    type: 'note',
                    icon: '📝',
                    title: `${location.name} 메모`,
                    detail: utils.truncate(event.content, 40),
                    color: 'blue'
                });
            });

            // Add notifications
            notifications.forEach(notif => {
                activities.push({
                    time: notif.sent_at,
                    type: 'notification',
                    icon: '📬',
                    title: '알림',
                    detail: notif.message,
                    color: 'purple'
                });
            });

            // Sort by time desc
            activities.sort((a, b) => b.time - a.time);

            const html = `
                <div class="px-4 py-6 pb-20">
                    <div class="mb-6">
                        <h1 class="text-2xl font-bold text-gray-900 mb-2">활동 내역</h1>
                        <p class="text-gray-600">오늘의 모든 활동</p>
                    </div>

                    <div class="bg-white rounded-lg shadow-sm">
                        ${activities.length > 0 ? activities.map(activity => `
                            <div class="p-4 border-b border-gray-100 last:border-0">
                                <div class="flex items-start">
                                    <div class="text-2xl mr-3">${activity.icon}</div>
                                    <div class="flex-1">
                                        <div class="font-medium text-gray-900">${activity.title}</div>
                                        <div class="text-sm text-gray-600">${activity.detail}</div>
                                        <div class="text-xs text-gray-500 mt-1">${utils.formatDateTime(activity.time)}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="p-8 text-center text-gray-500">
                                활동 내역이 없습니다
                            </div>
                        `}
                    </div>
                </div>
            `;

            ui.render(html);
            ui.setNavigationVisible(true);
            ui.updateNavigation('feed');
            ui.setReportTabVisible(false);

        } catch (error) {
            ui.hideLoading();
            ui.showToast('데이터 로드 실패: ' + error.message);
            console.error('Driver feed error:', error);
        }
    },

    /**
     * Render ops feed
     */
    async renderOpsFeed() {
        ui.showLoading('로딩 중...');

        try {
            const today = utils.formatDate();
            const routeDays = await api.routeDays.getByDate(today);
            const allStops = await api.stops.getAll();
            const allEvents = await api.stopEvents.getAll();
            const allNotifications = await api.notifications.getAll();

            await state.loadLocations();
            await state.loadDrivers();

            ui.hideLoading();

            const activities = [];

            // Add completions
            routeDays.forEach(routeDay => {
                const stops = allStops.filter(s => s.route_day_id === routeDay.id && s.completed_at > 0);
                const driver = state.getDriverById(routeDay.driver_id);

                stops.forEach(stop => {
                    const location = state.getLocationById(stop.location_id);
                    activities.push({
                        time: stop.completed_at,
                        type: 'completion',
                        icon: '✓',
                        title: `${driver.name} - ${location.name}`,
                        detail: utils.getDeliveredTypeLabel(stop.delivered_type),
                        color: 'green'
                    });
                });
            });

            // Add notes
            allEvents.filter(e => e.type === 'NOTE').forEach(event => {
                const stop = allStops.find(s => s.id === event.stop_id);
                if (stop) {
                    const routeDay = routeDays.find(r => r.id === stop.route_day_id);
                    if (routeDay) {
                        const driver = state.getDriverById(routeDay.driver_id);
                        const location = state.getLocationById(stop.location_id);
                        activities.push({
                            time: event.created_at,
                            type: 'note',
                            icon: '📝',
                            title: `${driver.name} - ${location.name}`,
                            detail: utils.truncate(event.content, 40),
                            color: 'blue'
                        });
                    }
                }
            });

            // Add sent notifications
            allNotifications.slice(0, 20).forEach(notif => {
                activities.push({
                    time: notif.sent_at,
                    type: 'notification',
                    icon: '📬',
                    title: `알림 전송 - ${notif.target_role}`,
                    detail: notif.message,
                    color: 'purple'
                });
            });

            // Sort by time desc
            activities.sort((a, b) => b.time - a.time);

            const html = `
                <div class="px-4 py-6 pb-20">
                    <div class="mb-6">
                        <h1 class="text-2xl font-bold text-gray-900 mb-2">전체 활동</h1>
                        <p class="text-gray-600">실시간 운영 로그</p>
                    </div>

                    <div class="bg-white rounded-lg shadow-sm">
                        ${activities.slice(0, 50).map(activity => `
                            <div class="p-4 border-b border-gray-100 last:border-0">
                                <div class="flex items-start">
                                    <div class="text-2xl mr-3">${activity.icon}</div>
                                    <div class="flex-1">
                                        <div class="font-medium text-gray-900">${activity.title}</div>
                                        <div class="text-sm text-gray-600">${activity.detail}</div>
                                        <div class="text-xs text-gray-500 mt-1">${utils.formatDateTime(activity.time)}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            ui.render(html);
            ui.setNavigationVisible(true);
            ui.updateNavigation('feed');
            ui.setReportTabVisible(true);

        } catch (error) {
            ui.hideLoading();
            ui.showToast('데이터 로드 실패: ' + error.message);
            console.error('Ops feed error:', error);
        }
    },

    /**
     * Render no feed message
     */
    renderNoFeed() {
        const html = `
            <div class="min-h-screen flex items-center justify-center px-6">
                <div class="text-center">
                    <svg class="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">활동 내역 없음</h3>
                    <p class="text-gray-600">아직 활동 내역이 없습니다</p>
                </div>
            </div>
        `;
        ui.render(html);
        ui.setNavigationVisible(true);
        ui.updateNavigation('feed');
    },

    /**
     * Handle back button
     */
    handleBackButton() {
        // For now, just navigate to today
        this.navigateTo('today');
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
