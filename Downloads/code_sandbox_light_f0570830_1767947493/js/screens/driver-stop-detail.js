/**
 * Driver Stop Detail Screen
 */

const driverStopDetailScreen = {
    stop: null,
    location: null,
    routeDay: null,

    /**
     * Render stop detail screen
     */
    async render(stopId) {
        ui.showLoading('로딩 중...');

        try {
            // Load stop
            this.stop = await api.stops.getById(stopId);

            // Load location
            await state.loadLocations();
            this.location = state.getLocationById(this.stop.location_id);

            // Load route day
            const allStops = await api.stops.getByRouteDay(this.stop.route_day_id);
            const routeDays = await api.routeDays.getByDate(utils.formatDate());
            this.routeDay = routeDays.find(r => r.id === this.stop.route_day_id);

            ui.hideLoading();
            this.renderContent();

        } catch (error) {
            ui.hideLoading();
            ui.showToast('데이터 로드 실패: ' + error.message);
            console.error('Stop detail error:', error);
        }
    },

    /**
     * Render main content
     */
    renderContent() {
        const canComplete = (utils.isWithinWindow(this.routeDay.window_start, this.routeDay.window_end) || 
                            utils.isAfterWindow(this.routeDay.window_end)) &&
                           this.stop.status !== 'COMPLETED';

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
                        <div>
                            <h1 class="text-lg font-bold text-gray-900">정차지 상세</h1>
                            <p class="text-sm text-gray-600">#{${this.stop.sequence}} ${this.location.id}</p>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div class="px-4 py-6 pb-32">
                    <!-- Status -->
                    <div class="mb-6">
                        <span class="px-4 py-2 text-sm rounded-full ${utils.getStatusClass(this.stop.status)}">
                            ${utils.getStatusLabel(this.stop.status)}
                        </span>
                        ${this.stop.completed_at ? `
                            <div class="mt-2 text-sm text-gray-600">
                                완료 시각: ${utils.formatDateTime(this.stop.completed_at)}
                            </div>
                            <div class="text-sm text-gray-600">
                                처리: ${utils.getDeliveredTypeLabel(this.stop.delivered_type)}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Location Info -->
                    <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
                        <h2 class="font-bold text-gray-900 mb-3">${this.location.name}</h2>
                        
                        <div class="mb-3">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="text-sm text-gray-600 mb-1">주소</div>
                                    <div class="text-gray-900">${this.location.address}</div>
                                </div>
                                <button onclick="driverStopDetailScreen.copyAddress()" 
                                        id="copy-btn"
                                        class="ml-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium touch-target">
                                    복사
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Entry Instructions -->
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 class="font-bold text-blue-900 mb-2 flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            출입 안내
                        </h3>
                        <p class="text-blue-900 whitespace-pre-wrap">${this.location.entry_instruction_text}</p>
                    </div>

                    <!-- Planned Items -->
                    <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
                        <h3 class="font-bold text-gray-900 mb-3">오늘의 작업</h3>
                        <div class="grid grid-cols-3 gap-3">
                            <div class="text-center p-3 bg-gray-50 rounded-lg">
                                <div class="text-2xl font-bold text-gray-900">${this.stop.planned_cs}</div>
                                <div class="text-xs text-gray-600">이불세트</div>
                            </div>
                            <div class="text-center p-3 bg-gray-50 rounded-lg">
                                <div class="text-2xl font-bold text-gray-900">${this.stop.planned_bt}</div>
                                <div class="text-xs text-gray-600">수건(대)</div>
                            </div>
                            <div class="text-center p-3 bg-gray-50 rounded-lg">
                                <div class="text-2xl font-bold text-gray-900">${this.stop.planned_ft}</div>
                                <div class="text-xs text-gray-600">수건(소)</div>
                            </div>
                        </div>
                    </div>

                    <!-- Time Warning -->
                    ${!canComplete && this.stop.status !== 'COMPLETED' ? `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <p class="text-yellow-900 text-sm">
                                ⏰ 완료 처리는 ${this.routeDay.window_start} 이후부터 가능합니다
                            </p>
                        </div>
                    ` : ''}

                    <!-- Last Updated -->
                    <div class="text-center text-sm text-gray-500">
                        최종 업데이트: ${utils.formatDateTime(Date.now())}
                    </div>
                </div>

                <!-- Bottom Actions -->
                ${this.stop.status !== 'COMPLETED' ? `
                    <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-safe">
                        <div class="flex gap-3">
                            <button onclick="driverStopDetailScreen.showNoteModal()" 
                                    class="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium touch-target">
                                메모 전송
                            </button>
                            <button onclick="driverStopDetailScreen.showCompleteModal()" 
                                    ${!canComplete ? 'disabled' : ''}
                                    class="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold touch-target ${!canComplete ? 'opacity-50' : ''}">
                                완료하기
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        ui.render(html);
        ui.setNavigationVisible(false);
    },

    /**
     * Copy address to clipboard
     */
    async copyAddress() {
        const success = await utils.copyToClipboard(this.location.address);
        const btn = document.getElementById('copy-btn');
        
        if (success) {
            btn.textContent = '복사됨!';
            btn.classList.add('copy-btn-success');
            ui.showToast('주소가 복사되었습니다');
            
            setTimeout(() => {
                btn.textContent = '복사';
                btn.classList.remove('copy-btn-success');
            }, 2000);
        } else {
            ui.showToast('복사 실패');
        }
    },

    /**
     * Show complete modal
     */
    showCompleteModal() {
        const modalHtml = `
            <div class="p-6">
                <h3 class="text-xl font-bold mb-4">정차지 완료</h3>
                
                <!-- Delivery Type Selection -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-3">작업 유형 (필수)</label>
                    <div class="space-y-2">
                        <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="delivery-type" value="DELIVERED" class="mr-3" required>
                            <span class="font-medium">배송 완료</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="delivery-type" value="COLLECTED" class="mr-3" required>
                            <span class="font-medium">회수 완료</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="delivery-type" value="BOTH" class="mr-3" required>
                            <span class="font-medium">배송 + 회수 완료</span>
                        </label>
                    </div>
                </div>

                <!-- Optional Note -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">메모 (선택)</label>
                    <textarea id="complete-note" 
                              rows="3" 
                              placeholder="특이사항이 있다면 입력하세요"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                </div>

                <!-- Buttons -->
                <div class="flex gap-3">
                    <button onclick="ui.hideModal()" 
                            class="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium touch-target">
                        취소
                    </button>
                    <button onclick="driverStopDetailScreen.handleComplete()" 
                            class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold touch-target">
                        완료 저장
                    </button>
                </div>
            </div>
        `;

        ui.showModal(modalHtml);
    },

    /**
     * Handle complete
     */
    async handleComplete() {
        const selectedType = document.querySelector('input[name="delivery-type"]:checked');
        
        if (!selectedType) {
            ui.showToast('작업 유형을 선택해주세요');
            return;
        }

        const deliveredType = selectedType.value;
        const note = document.getElementById('complete-note').value.trim();

        ui.hideModal();
        ui.showLoading('완료 처리 중...');

        try {
            await api.stops.complete(this.stop.id, deliveredType, note);

            ui.hideLoading();
            ui.showToast('정차지가 완료되었습니다');

            // Return to home
            setTimeout(() => {
                app.navigateTo('today');
            }, 1000);

        } catch (error) {
            ui.hideLoading();
            ui.showToast('완료 처리 실패: ' + error.message);
            console.error('Complete error:', error);
        }
    },

    /**
     * Show note modal
     */
    showNoteModal() {
        const modalHtml = `
            <div class="p-6">
                <h3 class="text-xl font-bold mb-4">메모 전송</h3>
                
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">메모 내용</label>
                    <textarea id="note-content" 
                              rows="5" 
                              placeholder="관리자에게 전달할 내용을 입력하세요"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                </div>

                <div class="flex gap-3">
                    <button onclick="ui.hideModal()" 
                            class="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium touch-target">
                        취소
                    </button>
                    <button onclick="driverStopDetailScreen.handleNote()" 
                            class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold touch-target">
                        전송
                    </button>
                </div>
            </div>
        `;

        ui.showModal(modalHtml);
    },

    /**
     * Handle note
     */
    async handleNote() {
        const content = document.getElementById('note-content').value.trim();
        
        if (!content) {
            ui.showToast('메모 내용을 입력해주세요');
            return;
        }

        ui.hideModal();
        ui.showLoading('전송 중...');

        try {
            await api.stopEvents.create(
                this.stop.id,
                'NOTE',
                content,
                state.getCurrentUserId()
            );

            // Send notification to ops
            await api.notifications.create(
                'ADMIN',
                'admin',
                'SMS',
                `[메모] ${state.getCurrentUserName()} - ${this.location.name}: ${content.substring(0, 50)}...`
            );

            ui.hideLoading();
            ui.showToast('메모가 전송되었습니다');

        } catch (error) {
            ui.hideLoading();
            ui.showToast('전송 실패: ' + error.message);
            console.error('Note error:', error);
        }
    }
};
