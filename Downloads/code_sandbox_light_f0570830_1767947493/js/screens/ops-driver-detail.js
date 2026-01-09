/**
 * Ops Driver Detail Screen
 */

const opsDriverDetailScreen = {
    driver: null,
    routeDay: null,
    stops: [],
    currentFilter: 'all',

    /**
     * Render driver detail screen
     */
    async render(driverId) {
        ui.showLoading('로딩 중...');

        try {
            // Load driver
            await state.loadDrivers();
            this.driver = state.getDriverById(driverId);

            // Load route day
            const today = utils.formatDate();
            this.routeDay = await api.routeDays.getByDriverAndDate(driverId, today);

            // Load stops
            if (this.routeDay) {
                this.stops = await api.stops.getByRouteDay(this.routeDay.id);
            }

            // Load locations
            await state.loadLocations();

            ui.hideLoading();
            this.renderContent();

        } catch (error) {
            ui.hideLoading();
            ui.showToast('데이터 로드 실패: ' + error.message);
            console.error('Driver detail error:', error);
        }
    },

    /**
     * Render main content
     */
    renderContent() {
        if (!this.routeDay) {
            this.renderNoRoute();
            return;
        }

        const completedStops = this.stops.filter(s => s.status === 'COMPLETED');
        const remainingStops = this.stops.filter(s => s.status !== 'COMPLETED');

        // Calculate late risk
        const etas = utils.calculateETA(completedStops.length, remainingStops.length);
        const lateRiskStops = remainingStops.filter((stop, index) => {
            return utils.hasLateRisk(etas[index], this.routeDay.window_end);
        });

        const html = `
            <div class="min-h-screen bg-gray-50">
                <!-- Header -->
                <div class="bg-white border-b sticky top-0 z-10">
                    <div class="flex items-center px-4 py-4">
                        <button onclick="app.navigateTo('today')" class="mr-3 touch-target">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <div class="flex-1">
                            <h1 class="text-lg font-bold text-gray-900">${this.driver.name}</h1>
                            <p class="text-sm text-gray-600">${utils.getRegionLabel(this.routeDay.region)}</p>
                        </div>
                        <button onclick="opsDriverDetailScreen.showActionsMenu()" 
                                class="p-2 touch-target">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Stats -->
                    <div class="grid grid-cols-4 gap-2 px-4 pb-4">
                        <div class="text-center">
                            <div class="text-xl font-bold text-gray-900">${this.stops.length}</div>
                            <div class="text-xs text-gray-600">전체</div>
                        </div>
                        <div class="text-center">
                            <div class="text-xl font-bold text-blue-600">${remainingStops.length}</div>
                            <div class="text-xs text-gray-600">남음</div>
                        </div>
                        <div class="text-center">
                            <div class="text-xl font-bold text-green-600">${completedStops.length}</div>
                            <div class="text-xs text-gray-600">완료</div>
                        </div>
                        <div class="text-center">
                            <div class="text-xl font-bold text-red-600">${lateRiskStops.length}</div>
                            <div class="text-xs text-gray-600">위험</div>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div class="flex gap-2 px-4 pb-4 overflow-x-auto">
                        <button onclick="opsDriverDetailScreen.setFilter('all')" 
                                class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${this.currentFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}">
                            전체 (${this.stops.length})
                        </button>
                        <button onclick="opsDriverDetailScreen.setFilter('pending')" 
                                class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${this.currentFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}">
                            대기중 (${remainingStops.length})
                        </button>
                        <button onclick="opsDriverDetailScreen.setFilter('completed')" 
                                class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${this.currentFilter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}">
                            완료 (${completedStops.length})
                        </button>
                        <button onclick="opsDriverDetailScreen.setFilter('late-risk')" 
                                class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${this.currentFilter === 'late-risk' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}">
                            위험 (${lateRiskStops.length})
                        </button>
                    </div>
                </div>

                <!-- Stops List -->
                <div class="px-4 py-4 pb-20">
                    ${this.renderStopsList()}
                </div>
            </div>
        `;

        ui.render(html);
        ui.setNavigationVisible(false);
    },

    /**
     * Render no route message
     */
    renderNoRoute() {
        const html = `
            <div class="min-h-screen flex items-center justify-center px-6">
                <div class="text-center">
                    <button onclick="app.navigateTo('today')" class="mb-6">
                        <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">배정된 경로 없음</h3>
                    <p class="text-gray-600">오늘 ${this.driver.name}에게 배정된 경로가 없습니다</p>
                </div>
            </div>
        `;
        ui.render(html);
    },

    /**
     * Set filter
     */
    setFilter(filter) {
        this.currentFilter = filter;
        this.renderContent();
    },

    /**
     * Render stops list
     */
    renderStopsList() {
        let filteredStops = this.stops;

        if (this.currentFilter === 'pending') {
            filteredStops = this.stops.filter(s => s.status !== 'COMPLETED');
        } else if (this.currentFilter === 'completed') {
            filteredStops = this.stops.filter(s => s.status === 'COMPLETED');
        } else if (this.currentFilter === 'late-risk') {
            const completedStops = this.stops.filter(s => s.status === 'COMPLETED');
            const remainingStops = this.stops.filter(s => s.status !== 'COMPLETED');
            const etas = utils.calculateETA(completedStops.length, remainingStops.length);
            
            filteredStops = [];
            let etaIndex = 0;
            this.stops.forEach(stop => {
                if (stop.status !== 'COMPLETED') {
                    if (utils.hasLateRisk(etas[etaIndex], this.routeDay.window_end)) {
                        filteredStops.push(stop);
                    }
                    etaIndex++;
                }
            });
        }

        if (filteredStops.length === 0) {
            return '<p class="text-center text-gray-500 py-8">해당하는 정차지가 없습니다</p>';
        }

        return filteredStops.map(stop => {
            const location = state.getLocationById(stop.location_id);
            if (!location) return '';

            return `
                <div class="bg-white rounded-lg shadow-sm p-4 mb-3" 
                     onclick="opsDriverDetailScreen.showStopActions('${stop.id}')">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex items-center">
                            <span class="text-2xl font-bold text-gray-400 mr-3">${stop.sequence}</span>
                            <div>
                                <div class="font-medium text-gray-900">${location.name}</div>
                                <div class="text-sm text-gray-500">${location.id}</div>
                            </div>
                        </div>
                        <span class="px-3 py-1 text-sm rounded-full ${utils.getStatusClass(stop.status)}">
                            ${utils.getStatusLabel(stop.status)}
                        </span>
                    </div>
                    ${stop.completed_at ? `
                        <div class="text-sm text-gray-600 mb-2">
                            완료: ${utils.formatDateTime(stop.completed_at)} • ${utils.getDeliveredTypeLabel(stop.delivered_type)}
                        </div>
                    ` : ''}
                    <div class="text-sm text-gray-600">
                        CS ${stop.planned_cs} / BT ${stop.planned_bt} / FT ${stop.planned_ft}
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Show actions menu
     */
    showActionsMenu() {
        const modalHtml = `
            <div class="p-6">
                <h3 class="text-xl font-bold mb-4">관리 작업</h3>
                <div class="space-y-2">
                    <button onclick="opsDriverDetailScreen.reorderStops()" 
                            class="w-full py-4 bg-blue-50 text-blue-600 rounded-lg font-medium text-left px-4 touch-target">
                        📋 정차지 순서 변경
                    </button>
                    <button onclick="opsHomeScreen.showMessageModal('${this.driver.id}')" 
                            class="w-full py-4 bg-blue-50 text-blue-600 rounded-lg font-medium text-left px-4 touch-target">
                        💬 메시지 전송
                    </button>
                    <button onclick="ui.hideModal()" 
                            class="w-full py-4 bg-gray-100 text-gray-600 rounded-lg font-medium text-center touch-target">
                        취소
                    </button>
                </div>
            </div>
        `;
        ui.showModal(modalHtml);
    },

    /**
     * Show stop actions
     */
    showStopActions(stopId) {
        const stop = this.stops.find(s => s.id === stopId);
        const location = state.getLocationById(stop.location_id);

        const modalHtml = `
            <div class="p-6">
                <h3 class="text-lg font-bold mb-2">${location.name}</h3>
                <p class="text-sm text-gray-600 mb-4">${location.id}</p>
                
                <div class="space-y-2">
                    <button onclick="opsDriverDetailScreen.editEntryInstruction('${location.id}')" 
                            class="w-full py-3 bg-blue-50 text-blue-600 rounded-lg font-medium text-left px-4 touch-target">
                        ✏️ 출입 안내 수정
                    </button>
                    <button onclick="ui.hideModal()" 
                            class="w-full py-3 bg-gray-100 text-gray-600 rounded-lg font-medium text-center touch-target">
                        닫기
                    </button>
                </div>
            </div>
        `;
        ui.showModal(modalHtml);
    },

    /**
     * Reorder stops
     */
    reorderStops() {
        ui.hideModal();

        const modalHtml = `
            <div class="p-6 max-h-[80vh] overflow-y-auto">
                <h3 class="text-xl font-bold mb-4">정차지 순서 변경</h3>
                <p class="text-sm text-gray-600 mb-4">드래그하여 순서를 변경하세요</p>
                
                <div id="reorder-list" class="space-y-2 mb-6">
                    ${this.stops.map((stop, index) => {
                        const location = state.getLocationById(stop.location_id);
                        return `
                            <div class="flex items-center bg-gray-50 rounded-lg p-3" data-stop-id="${stop.id}">
                                <span class="text-lg font-bold text-gray-400 mr-3 w-8">${index + 1}</span>
                                <div class="flex-1">
                                    <div class="font-medium text-gray-900">${location.name}</div>
                                    <div class="text-sm text-gray-500">${location.id}</div>
                                </div>
                                <div class="flex gap-2">
                                    ${index > 0 ? `
                                        <button onclick="opsDriverDetailScreen.moveStop(${index}, -1)" 
                                                class="p-2 text-gray-600 touch-target">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                                            </svg>
                                        </button>
                                    ` : '<div class="w-9"></div>'}
                                    ${index < this.stops.length - 1 ? `
                                        <button onclick="opsDriverDetailScreen.moveStop(${index}, 1)" 
                                                class="p-2 text-gray-600 touch-target">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </button>
                                    ` : '<div class="w-9"></div>'}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="flex gap-3">
                    <button onclick="ui.hideModal()" 
                            class="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium touch-target">
                        취소
                    </button>
                    <button onclick="opsDriverDetailScreen.saveReorder()" 
                            class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold touch-target">
                        저장
                    </button>
                </div>
            </div>
        `;
        ui.showModal(modalHtml);
    },

    /**
     * Move stop up or down
     */
    moveStop(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.stops.length) return;

        // Swap stops
        [this.stops[index], this.stops[newIndex]] = [this.stops[newIndex], this.stops[index]];

        // Re-render reorder list
        this.reorderStops();
    },

    /**
     * Save reorder
     */
    async saveReorder() {
        ui.hideModal();
        ui.showLoading('저장 중...');

        try {
            // Update stop sequences
            await api.stops.reorder(this.stops);

            // Send notification to driver
            await api.notifications.create(
                'DRIVER',
                this.driver.id,
                'SMS',
                '오늘의 정차지 순서가 변경되었습니다. 앱을 새로고침해주세요.'
            );

            ui.hideLoading();
            ui.showToast('순서가 변경되었습니다');

            // Reload
            this.render(this.driver.id);

        } catch (error) {
            ui.hideLoading();
            ui.showToast('저장 실패: ' + error.message);
            console.error('Save reorder error:', error);
        }
    },

    /**
     * Edit entry instruction
     */
    editEntryInstruction(locationId) {
        ui.hideModal();

        const location = state.getLocationById(locationId);

        const modalHtml = `
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2">출입 안내 수정</h3>
                <p class="text-sm text-gray-600 mb-4">${location.name}</p>
                
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">출입 안내</label>
                    <textarea id="entry-instruction" 
                              rows="6" 
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">${location.entry_instruction_text}</textarea>
                </div>

                <div class="flex gap-3">
                    <button onclick="ui.hideModal()" 
                            class="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium touch-target">
                        취소
                    </button>
                    <button onclick="opsDriverDetailScreen.saveEntryInstruction('${locationId}')" 
                            class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold touch-target">
                        저장
                    </button>
                </div>
            </div>
        `;
        ui.showModal(modalHtml);
    },

    /**
     * Save entry instruction
     */
    async saveEntryInstruction(locationId) {
        const text = document.getElementById('entry-instruction').value.trim();

        if (!text) {
            ui.showToast('출입 안내를 입력해주세요');
            return;
        }

        ui.hideModal();
        ui.showLoading('저장 중...');

        try {
            await api.locations.updateEntryInstruction(locationId, text);

            // Update cache
            const location = state.getLocationById(locationId);
            if (location) {
                location.entry_instruction_text = text;
            }

            // Send notification to driver
            await api.notifications.create(
                'DRIVER',
                this.driver.id,
                'SMS',
                `${location.name}의 출입 안내가 업데이트되었습니다.`
            );

            ui.hideLoading();
            ui.showToast('출입 안내가 수정되었습니다');

        } catch (error) {
            ui.hideLoading();
            ui.showToast('저장 실패: ' + error.message);
            console.error('Save entry instruction error:', error);
        }
    }
};
