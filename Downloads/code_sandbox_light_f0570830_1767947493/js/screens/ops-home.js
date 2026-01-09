/**
 * Ops Home Screen (Today Overview)
 */

const opsHomeScreen = {
    routeDays: [],
    driversData: [],

    /**
     * Render ops home screen
     */
    async render() {
        ui.showLoading('로딩 중...');

        try {
            const today = utils.formatDate();

            // Load route days for today
            this.routeDays = await api.routeDays.getByDate(today);

            // Load drivers
            await state.loadDrivers();

            // Load all stops and events for feed
            const allStops = await api.stops.getAll();
            const allEvents = await api.stopEvents.getAll();

            // Load locations
            await state.loadLocations();

            // Build drivers data
            this.driversData = await Promise.all(
                this.routeDays.map(async (routeDay) => {
                    const driver = state.getDriverById(routeDay.driver_id);
                    const stops = allStops
                        .filter(s => s.route_day_id === routeDay.id)
                        .sort((a, b) => a.sequence - b.sequence);
                    
                    const completedStops = stops.filter(s => s.status === 'COMPLETED');
                    const remainingStops = stops.filter(s => s.status !== 'COMPLETED');
                    
                    // Calculate late risk
                    const etas = utils.calculateETA(completedStops.length, remainingStops.length);
                    const lateRiskCount = remainingStops.filter((stop, index) => {
                        return utils.hasLateRisk(etas[index], routeDay.window_end);
                    }).length;

                    // Get notes count
                    const stopIds = stops.map(s => s.id);
                    const notesCount = allEvents.filter(e => 
                        stopIds.includes(e.stop_id) && e.type === 'NOTE'
                    ).length;

                    // Last activity
                    const lastCompleted = completedStops.length > 0 ? 
                        Math.max(...completedStops.map(s => s.completed_at)) : 0;
                    const lastNote = allEvents
                        .filter(e => stopIds.includes(e.stop_id) && e.type === 'NOTE')
                        .sort((a, b) => b.created_at - a.created_at)[0];
                    const lastActivity = Math.max(lastCompleted, lastNote ? lastNote.created_at : 0);

                    return {
                        driver,
                        routeDay,
                        stops,
                        completedStops,
                        remainingStops,
                        lateRiskCount,
                        notesCount,
                        lastActivity
                    };
                })
            );

            ui.hideLoading();
            this.renderContent();

        } catch (error) {
            ui.hideLoading();
            ui.showToast('데이터 로드 실패: ' + error.message);
            console.error('Ops home error:', error);
        }
    },

    /**
     * Render main content
     */
    renderContent() {
        const today = new Date();
        const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]})`;

        const html = `
            <div class="px-4 py-6 pb-20">
                <!-- Header -->
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-2">운영 대시보드</h1>
                    <div class="text-gray-600">${dateStr}</div>
                </div>

                <!-- Refresh Button -->
                <button onclick="opsHomeScreen.render()" 
                        class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium mb-6 touch-target">
                    🔄 새로고침
                </button>

                <!-- Driver Cards -->
                <div class="space-y-4 mb-6">
                    ${this.driversData.map(data => this.renderDriverCard(data)).join('')}
                </div>

                <!-- Live Feed -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h2 class="font-bold text-gray-900 mb-4 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        실시간 활동
                    </h2>
                    <div id="live-feed">
                        <button onclick="opsHomeScreen.loadFeed()" 
                                class="w-full py-2 text-blue-600 text-sm">
                            활동 내역 불러오기
                        </button>
                    </div>
                </div>
            </div>
        `;

        ui.render(html);
        ui.setNavigationVisible(true);
        ui.updateNavigation('today');
        ui.setReportTabVisible(true);
    },

    /**
     * Render driver card
     */
    renderDriverCard(data) {
        const { driver, routeDay, stops, completedStops, remainingStops, lateRiskCount, notesCount, lastActivity } = data;
        const isStarted = routeDay.job_started_at > 0;

        return `
            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <!-- Header -->
                <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                    <div class="flex items-center justify-between mb-2">
                        <div>
                            <h3 class="text-lg font-bold">${driver.name}</h3>
                            <p class="text-sm opacity-90">${utils.getRegionLabel(routeDay.region)} • ${routeDay.window_start}-${routeDay.window_end}</p>
                        </div>
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${isStarted ? 'bg-green-400 text-green-900' : 'bg-white bg-opacity-20'}">
                            ${isStarted ? 'ON_DUTY' : 'READY'}
                        </span>
                    </div>
                    ${isStarted ? `
                        <div class="text-sm opacity-90">
                            시작: ${utils.formatDateTime(routeDay.job_started_at)}
                        </div>
                    ` : ''}
                </div>

                <!-- Stats -->
                <div class="p-4">
                    <div class="grid grid-cols-3 gap-3 mb-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-gray-900">${remainingStops.length}</div>
                            <div class="text-xs text-gray-600">남은 정차지</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-600">${completedStops.length}</div>
                            <div class="text-xs text-gray-600">완료</div>
                        </div>
                        ${lateRiskCount > 0 ? `
                            <div class="text-center">
                                <div class="text-2xl font-bold text-red-600">${lateRiskCount}</div>
                                <div class="text-xs text-gray-600">지연위험</div>
                            </div>
                        ` : `
                            <div class="text-center">
                                <div class="text-2xl font-bold text-blue-600">${notesCount}</div>
                                <div class="text-xs text-gray-600">메모</div>
                            </div>
                        `}
                    </div>

                    ${lastActivity > 0 ? `
                        <div class="text-sm text-gray-600 mb-4">
                            최근 활동: ${utils.formatDateTime(lastActivity)}
                        </div>
                    ` : ''}

                    <!-- Actions -->
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="app.navigateTo('driver-detail', '${driver.id}')" 
                                class="py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium touch-target">
                            상세보기
                        </button>
                        <button onclick="opsHomeScreen.showMessageModal('${driver.id}')" 
                                class="py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium touch-target">
                            메시지
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Load live feed
     */
    async loadFeed() {
        try {
            const allEvents = await api.stopEvents.getAll();
            const allStops = await api.stops.getAll();

            // Get recent activities (last 20)
            const activities = [];

            // Add completion events
            allStops
                .filter(s => s.completed_at > 0)
                .forEach(stop => {
                    const location = state.getLocationById(stop.location_id);
                    const routeDay = this.routeDays.find(r => r.id === stop.route_day_id);
                    const driver = routeDay ? state.getDriverById(routeDay.driver_id) : null;

                    if (location && driver) {
                        activities.push({
                            time: stop.completed_at,
                            type: 'completion',
                            driver: driver.name,
                            location: location.name,
                            detail: utils.getDeliveredTypeLabel(stop.delivered_type)
                        });
                    }
                });

            // Add note events
            allEvents
                .filter(e => e.type === 'NOTE')
                .forEach(event => {
                    const stop = allStops.find(s => s.id === event.stop_id);
                    if (stop) {
                        const location = state.getLocationById(stop.location_id);
                        const routeDay = this.routeDays.find(r => r.id === stop.route_day_id);
                        const driver = routeDay ? state.getDriverById(routeDay.driver_id) : null;

                        if (location && driver) {
                            activities.push({
                                time: event.created_at,
                                type: 'note',
                                driver: driver.name,
                                location: location.name,
                                detail: utils.truncate(event.content, 30)
                            });
                        }
                    }
                });

            // Sort by time desc
            activities.sort((a, b) => b.time - a.time);

            // Render feed
            const feedHtml = activities.slice(0, 20).map(activity => `
                <div class="py-3 border-b border-gray-100 last:border-0">
                    <div class="flex items-start">
                        <div class="${activity.type === 'completion' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} rounded-full p-2 mr-3">
                            ${activity.type === 'completion' ? '✓' : '📝'}
                        </div>
                        <div class="flex-1">
                            <div class="text-sm font-medium text-gray-900">${activity.driver} • ${activity.location}</div>
                            <div class="text-sm text-gray-600">${activity.detail}</div>
                            <div class="text-xs text-gray-500 mt-1">${utils.formatDateTime(activity.time)}</div>
                        </div>
                    </div>
                </div>
            `).join('');

            document.getElementById('live-feed').innerHTML = feedHtml || '<p class="text-gray-500 text-sm text-center py-4">활동 내역이 없습니다</p>';

        } catch (error) {
            ui.showToast('피드 로드 실패: ' + error.message);
            console.error('Load feed error:', error);
        }
    },

    /**
     * Show message modal
     */
    showMessageModal(driverId) {
        const driver = state.getDriverById(driverId);

        const modalHtml = `
            <div class="p-6">
                <h3 class="text-xl font-bold mb-4">${driver.name}에게 메시지</h3>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">메시지 유형</label>
                    <select id="message-type" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        <option value="order_change">순서 변경</option>
                        <option value="customer_change">고객 변경</option>
                        <option value="urgent">긴급</option>
                        <option value="other">기타</option>
                    </select>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">메시지 내용</label>
                    <textarea id="message-content" 
                              rows="5" 
                              placeholder="메시지를 입력하세요"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">전송 채널</label>
                    <div class="flex gap-4">
                        <label class="flex items-center">
                            <input type="checkbox" id="channel-sms" checked class="mr-2">
                            <span>SMS</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" id="channel-email" class="mr-2">
                            <span>Email</span>
                        </label>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="ui.hideModal()" 
                            class="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium touch-target">
                        취소
                    </button>
                    <button onclick="opsHomeScreen.sendMessage('${driverId}')" 
                            class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold touch-target">
                        전송
                    </button>
                </div>
            </div>
        `;

        ui.showModal(modalHtml);
    },

    /**
     * Send message to driver
     */
    async sendMessage(driverId) {
        const type = document.getElementById('message-type').value;
        const content = document.getElementById('message-content').value.trim();
        const sms = document.getElementById('channel-sms').checked;
        const email = document.getElementById('channel-email').checked;

        if (!content) {
            ui.showToast('메시지 내용을 입력해주세요');
            return;
        }

        if (!sms && !email) {
            ui.showToast('전송 채널을 선택해주세요');
            return;
        }

        ui.hideModal();
        ui.showLoading('전송 중...');

        try {
            const driver = state.getDriverById(driverId);
            const typeLabels = {
                order_change: '순서 변경',
                customer_change: '고객 변경',
                urgent: '긴급',
                other: '기타'
            };

            const message = `[${typeLabels[type]}] ${content}`;

            if (sms) {
                await api.notifications.create('DRIVER', driverId, 'SMS', message);
            }
            if (email) {
                await api.notifications.create('DRIVER', driverId, 'EMAIL', message);
            }

            ui.hideLoading();
            ui.showToast(`${driver.name}에게 메시지를 전송했습니다`);

        } catch (error) {
            ui.hideLoading();
            ui.showToast('전송 실패: ' + error.message);
            console.error('Send message error:', error);
        }
    }
};
