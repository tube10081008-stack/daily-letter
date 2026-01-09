/**
 * Admin Home Screen (Today Operations)
 * Non-technical operator interface
 */

const adminHomeScreen = {
    /**
     * Render admin home screen
     */
    async render() {
        ui.showLoading('로딩 중...');

        try {
            const today = utils.formatDate();
            const routeDays = await api.routeDays.getByDate(today);
            await state.loadDrivers();
            await state.loadLocations();

            // Get stats for each driver
            const driversStats = await Promise.all(
                routeDays.map(async (routeDay) => {
                    const driver = state.getDriverById(routeDay.driver_id);
                    const stops = await api.stops.getByRouteDay(routeDay.id);
                    const events = await api.stopEvents.getAll();
                    
                    const completed = stops.filter(s => s.status === 'COMPLETED').length;
                    const stopIds = stops.map(s => s.id);
                    const notes = events.data.filter(e => 
                        stopIds.includes(e.stop_id) && e.type === 'NOTE'
                    ).length;

                    return {
                        driver,
                        routeDay,
                        assigned: stops.length,
                        completed,
                        notes
                    };
                })
            );

            ui.hideLoading();
            this.renderContent(driversStats);

        } catch (error) {
            ui.hideLoading();
            ui.showToast('데이터 로드 실패: ' + error.message);
            console.error('Admin home error:', error);
        }
    },

    /**
     * Render main content
     */
    renderContent(driversStats) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

        const html = `
            <div class="px-4 py-6 pb-20">
                <!-- Header -->
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-2">운영 관리</h1>
                    <div class="text-gray-600">${dateStr}</div>
                </div>

                <!-- Quick Actions -->
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <button onclick="app.navigateTo('location-management')" 
                            class="p-4 bg-blue-600 text-white rounded-lg font-medium touch-target flex flex-col items-center">
                        <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span>배송지 관리</span>
                    </button>

                    <button onclick="app.navigateTo('create-assignment')" 
                            class="p-4 bg-green-600 text-white rounded-lg font-medium touch-target flex flex-col items-center">
                        <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <span>오늘 배정하기</span>
                    </button>
                </div>

                <!-- Advanced Operations Link -->
                <div class="mb-6">
                    <button onclick="app.navigateTo('ops-home')" 
                            class="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium touch-target flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <span>고급 운영 대시보드</span>
                    </button>
                </div>

                <!-- Today's Drivers -->
                <div class="mb-4">
                    <h2 class="text-lg font-bold text-gray-900 mb-3">오늘의 기사 현황</h2>
                    ${driversStats.length > 0 ? `
                        <div class="space-y-3">
                            ${driversStats.map(stat => this.renderDriverCard(stat)).join('')}
                        </div>
                    ` : `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <p class="text-yellow-900 mb-3">오늘 배정된 경로가 없습니다</p>
                            <button onclick="app.navigateTo('create-assignment')" 
                                    class="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium">
                                지금 배정하기
                            </button>
                        </div>
                    `}
                </div>

                <!-- System Info -->
                <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                    <div class="flex items-center mb-2">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="font-medium">운영 팁</span>
                    </div>
                    <ul class="space-y-1 ml-7">
                        <li>• 매일 아침 배정 생성을 권장합니다</li>
                        <li>• 배송지는 미리 등록해두세요</li>
                        <li>• 순서는 자동 생성 후 조정 가능합니다</li>
                    </ul>
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
    renderDriverCard(stat) {
        const { driver, assigned, completed, notes } = stat;
        const completionRate = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

        return `
            <div class="bg-white rounded-lg shadow-sm p-4">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <h3 class="font-bold text-gray-900">${driver.name}</h3>
                        <p class="text-sm text-gray-600">${utils.getRegionLabel(driver.region)}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold ${completionRate === 100 ? 'text-green-600' : 'text-blue-600'}">
                            ${completionRate}%
                        </div>
                        <div class="text-xs text-gray-500">완료율</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-3">
                    <div class="text-center p-2 bg-blue-50 rounded">
                        <div class="text-lg font-bold text-blue-900">${assigned}</div>
                        <div class="text-xs text-blue-700">배정</div>
                    </div>
                    <div class="text-center p-2 bg-green-50 rounded">
                        <div class="text-lg font-bold text-green-900">${completed}</div>
                        <div class="text-xs text-green-700">완료</div>
                    </div>
                    <div class="text-center p-2 bg-orange-50 rounded">
                        <div class="text-lg font-bold text-orange-900">${notes}</div>
                        <div class="text-xs text-orange-700">메모</div>
                    </div>
                </div>
            </div>
        `;
    }
};
