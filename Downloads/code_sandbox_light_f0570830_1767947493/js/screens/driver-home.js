/**
 * Driver Home Screen (Today)
 */

const driverHomeScreen = {
    routeDay: null,
    stops: [],

    /**
     * Render driver home screen
     */
    async render() {
        ui.showLoading('로딩 중...');

        try {
            const user = state.getUser();

            // Load today's route and stops (from API/DB)
            const result = await dataLayer.getTodayRouteForDriver(user.id);

            if (!result || !result.routeDay) {
                ui.hideLoading();
                this.renderNoRoute();
                return;
            }

            this.routeDay = result.routeDay;
            this.stops = result.stops; // stops already include location info (JOIN)

            ui.hideLoading();
            this.renderContent();

        } catch (error) {
            ui.hideLoading();
            ui.showToast('데이터 로드 실패: ' + error.message);
            console.error('Driver home error:', error);
        }
    },

    /**
     * Render no route message
     */
    renderNoRoute() {
        const html = `
            <div class="min-h-screen flex items-center justify-center px-6">
                <div class="text-center">
                    <svg class="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">오늘 배정된 경로가 없습니다</h3>
                    <p class="text-gray-600">관리자에게 문의하세요</p>
                </div>
            </div>
        `;
        ui.render(html);
    },

    /**
     * Render main content
     */
    renderContent() {
        const user = state.getUser();
        const today = new Date();
        const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]})`;
        
        // Calculate stats
        const completedStops = this.stops.filter(s => s.status === 'COMPLETED');
        const remainingStops = this.stops.filter(s => s.status !== 'COMPLETED');
        const notesCount = 0; // TODO: Count actual notes
        
        // Calculate late risk
        const etas = utils.calculateETA(completedStops.length, remainingStops.length);
        const lateRiskStops = remainingStops.filter((stop, index) => {
            return utils.hasLateRisk(etas[index], this.routeDay.window_end);
        });

        // Check if route started
        const isStarted = this.routeDay.job_started_at > 0;
        const canComplete = utils.isWithinWindow(this.routeDay.window_start, this.routeDay.window_end) || 
                           utils.isAfterWindow(this.routeDay.window_end);

        const html = `
            <div class="px-4 py-6 pb-20">
                <!-- Header -->
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-2">${user.name}님</h1>
                    <div class="flex items-center text-gray-600">
                        <span>${dateStr}</span>
                        <span class="mx-2">•</span>
                        <span>${utils.getRegionLabel(this.routeDay.region)}</span>
                        <span class="mx-2">•</span>
                        <span class="font-medium text-blue-600">${this.routeDay.window_start}-${this.routeDay.window_end}</span>
                    </div>
                </div>

                <!-- Start Route Button -->
                ${!isStarted ? `
                    <button onclick="driverHomeScreen.startRoute()" 
                            class="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg shadow-lg mb-6 touch-target active:bg-blue-700">
                        🚗 경로 시작하기
                    </button>
                ` : `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            <span class="font-medium text-green-900">경로 진행중</span>
                            <span class="ml-auto text-sm text-green-700">${utils.formatDateTime(this.routeDay.job_started_at)} 시작</span>
                        </div>
                    </div>
                `}

                <!-- Summary Cards -->
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <div class="bg-white rounded-lg shadow-sm p-4">
                        <div class="text-2xl font-bold text-gray-900">${remainingStops.length}</div>
                        <div class="text-sm text-gray-600">남은 정차지</div>
                    </div>
                    <div class="bg-white rounded-lg shadow-sm p-4">
                        <div class="text-2xl font-bold text-green-600">${completedStops.length}</div>
                        <div class="text-sm text-gray-600">완료</div>
                    </div>
                    ${lateRiskStops.length > 0 ? `
                        <div class="bg-red-50 rounded-lg shadow-sm p-4 border border-red-200">
                            <div class="text-2xl font-bold text-red-600">${lateRiskStops.length}</div>
                            <div class="text-sm text-red-700">지연 위험</div>
                        </div>
                    ` : ''}
                </div>

                ${!canComplete && remainingStops.length > 0 ? `
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p class="text-yellow-900 text-sm">
                            ⏰ ${this.routeDay.window_start} 이후부터 완료 처리가 가능합니다
                        </p>
                    </div>
                ` : ''}

                <!-- Stops List -->
                <div class="mb-4">
                    <h2 class="text-lg font-bold text-gray-900 mb-3">오늘의 정차지 (${this.stops.length})</h2>
                    ${this.renderStopsList()}
                </div>
            </div>
        `;

        ui.render(html);
        ui.setNavigationVisible(true);
        ui.updateNavigation('today');
        ui.setReportTabVisible(false);
    },

    /**
     * Render stops list
     */
    renderStopsList() {
        const completedStops = this.stops.filter(s => s.status === 'COMPLETED');
        const etas = utils.calculateETA(completedStops.length, this.stops.length - completedStops.length);
        
        let etaIndex = 0;
        return this.stops.map((stop) => {
            // Location info는 이미 stop 객체에 포함됨 (JOIN)
            const location = {
                id: stop.location_id,
                name: stop.location_name,
                address: stop.location_address,
                region: stop.location_region,
                entry_instruction_text: stop.entry_instruction_text
            };
            
            const isLateRisk = stop.status !== 'COMPLETED' && 
                              utils.hasLateRisk(etas[etaIndex], this.routeDay.window_end);
            
            if (stop.status !== 'COMPLETED') {
                etaIndex++;
            }
            
            return ui.createStopCard(stop, location, stop.sequence, isLateRisk);
        }).join('');
    },

    /**
     * Start route
     */
    async startRoute() {
        const confirmed = await ui.showConfirm(
            '경로 시작',
            '오늘의 배송/회수 경로를 시작하시겠습니까?',
            '시작',
            '취소'
        );

        if (!confirmed) return;

        ui.showLoading('경로 시작 중...');

        try {
            // Update route day
            await api.routeDays.startJob(this.routeDay.id);

            // Update driver status
            const user = state.getUser();
            await api.drivers.updateStatus(user.id, 'ON_DUTY');

            ui.hideLoading();
            ui.showToast('경로를 시작했습니다');

            // Reload
            this.render();

        } catch (error) {
            ui.hideLoading();
            ui.showToast('경로 시작 실패: ' + error.message);
            console.error('Start route error:', error);
        }
    }
};
