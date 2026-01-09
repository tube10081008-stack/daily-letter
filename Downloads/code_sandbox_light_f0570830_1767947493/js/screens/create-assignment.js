/**
 * Create Today Assignment Screen
 * Multi-step wizard for creating daily routes
 */

const createAssignmentScreen = {
    step: 1,
    formData: {
        date: utils.formatDate(),
        region: 'N',
        selectedLocations: [],
        orderedLocations: []
    },

    /**
     * Render create assignment screen
     */
    async render() {
        this.step = 1;
        this.formData = {
            date: utils.formatDate(),
            region: 'N',
            selectedLocations: [],
            orderedLocations: []
        };

        await this.renderStep1();
    },

    /**
     * Step 1: Select date, region, locations
     */
    async renderStep1() {
        ui.showLoading('배송지 로딩 중...');

        try {
            const locations = await api.locations.getAll();
            ui.hideLoading();

            const html = `
                <div class="min-h-screen bg-gray-50">
                    <!-- Header -->
                    <div class="bg-white border-b sticky top-0 z-10">
                        <div class="flex items-center px-4 py-4">
                            <button onclick="app.navigateTo('admin-home')" class="mr-3 touch-target">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <h1 class="text-lg font-bold text-gray-900">배정 생성</h1>
                        </div>

                        <!-- Progress -->
                        <div class="px-4 pb-4">
                            <div class="flex items-center">
                                <div class="flex items-center flex-1">
                                    <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                                    <div class="flex-1 h-1 bg-blue-600 mx-2"></div>
                                </div>
                                <div class="flex items-center flex-1">
                                    <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">2</div>
                                    <div class="flex-1 h-1 bg-gray-200 mx-2"></div>
                                </div>
                                <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">3</div>
                            </div>
                            <div class="flex justify-between mt-2 text-xs text-gray-600">
                                <span>배송지 선택</span>
                                <span>순서 정렬</span>
                                <span>확인</span>
                            </div>
                        </div>
                    </div>

                    <!-- Form -->
                    <div class="px-4 py-6 pb-24 space-y-6">
                        <!-- Date -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">배송 날짜</label>
                            <input type="date" 
                                   id="assignment-date"
                                   value="${this.formData.date}"
                                   onchange="createAssignmentScreen.updateDate(this.value)"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        </div>

                        <!-- Region -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">구역</label>
                            <div class="flex gap-3">
                                <label class="flex-1 flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer ${this.formData.region === 'N' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}">
                                    <input type="radio" 
                                           name="assignment-region" 
                                           value="N" 
                                           ${this.formData.region === 'N' ? 'checked' : ''}
                                           onchange="createAssignmentScreen.updateRegion('N')"
                                           class="mr-3">
                                    <span class="font-bold">북부권</span>
                                </label>
                                <label class="flex-1 flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer ${this.formData.region === 'S' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}">
                                    <input type="radio" 
                                           name="assignment-region" 
                                           value="S" 
                                           ${this.formData.region === 'S' ? 'checked' : ''}
                                           onchange="createAssignmentScreen.updateRegion('S')"
                                           class="mr-3">
                                    <span class="font-bold">남부권</span>
                                </label>
                            </div>
                        </div>

                        <!-- Driver Info -->
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div class="flex items-center">
                                <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span class="text-sm text-blue-900">
                                    ${this.formData.region === 'N' ? '김철수 기사' : '이영희 기사'}에게 배정됩니다
                                </span>
                            </div>
                        </div>

                        <!-- Locations -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <label class="block text-sm font-medium text-gray-700">
                                    배송지 선택 (${this.formData.selectedLocations.length}개)
                                </label>
                                <button onclick="createAssignmentScreen.selectAll()" 
                                        class="text-sm text-blue-600 font-medium">
                                    전체 선택
                                </button>
                            </div>

                            <div class="space-y-2">
                                ${locations.filter(loc => loc.region === this.formData.region).map(loc => `
                                    <label class="flex items-start p-4 border-2 rounded-lg cursor-pointer ${this.formData.selectedLocations.includes(loc.id) ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}">
                                        <input type="checkbox" 
                                               value="${loc.id}"
                                               ${this.formData.selectedLocations.includes(loc.id) ? 'checked' : ''}
                                               onchange="createAssignmentScreen.toggleLocation('${loc.id}')"
                                               class="mt-1 mr-3">
                                        <div class="flex-1">
                                            <div class="font-medium text-gray-900">${loc.name}</div>
                                            <div class="text-sm text-gray-600">${loc.address}</div>
                                        </div>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Next Button -->
                        <button onclick="createAssignmentScreen.goToStep2()" 
                                ${this.formData.selectedLocations.length === 0 ? 'disabled' : ''}
                                class="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg touch-target ${this.formData.selectedLocations.length === 0 ? 'opacity-50' : ''}">
                            다음: 순서 정렬 (${this.formData.selectedLocations.length}개)
                        </button>
                    </div>
                </div>
            `;

            ui.render(html);
            ui.setNavigationVisible(false);

        } catch (error) {
            ui.hideLoading();
            ui.showToast('데이터 로드 실패: ' + error.message);
        }
    },

    /**
     * Update date
     */
    updateDate(date) {
        this.formData.date = date;
    },

    /**
     * Update region
     */
    updateRegion(region) {
        this.formData.region = region;
        this.formData.selectedLocations = [];
        this.renderStep1();
    },

    /**
     * Toggle location selection
     */
    toggleLocation(locationId) {
        const index = this.formData.selectedLocations.indexOf(locationId);
        if (index > -1) {
            this.formData.selectedLocations.splice(index, 1);
        } else {
            this.formData.selectedLocations.push(locationId);
        }
        this.renderStep1();
    },

    /**
     * Select all locations
     */
    async selectAll() {
        const locations = await api.locations.getAll();
        const regionLocations = locations.filter(loc => loc.region === this.formData.region);
        this.formData.selectedLocations = regionLocations.map(loc => loc.id);
        this.renderStep1();
    },

    /**
     * Go to step 2: Reorder
     */
    async goToStep2() {
        if (this.formData.selectedLocations.length === 0) {
            ui.showToast('배송지를 선택해주세요');
            return;
        }

        this.step = 2;

        // Auto-generate order (simple rule: by name)
        const locations = await api.locations.getAll();
        this.formData.orderedLocations = this.formData.selectedLocations
            .map(id => locations.find(loc => loc.id === id))
            .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

        this.renderStep2();
    },

    /**
     * Step 2: Reorder locations
     */
    renderStep2() {
        const html = `
            <div class="min-h-screen bg-gray-50">
                <!-- Header -->
                <div class="bg-white border-b sticky top-0 z-10">
                    <div class="flex items-center px-4 py-4">
                        <button onclick="createAssignmentScreen.renderStep1()" class="mr-3 touch-target">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <h1 class="text-lg font-bold text-gray-900">순서 정렬</h1>
                    </div>

                    <!-- Progress -->
                    <div class="px-4 pb-4">
                        <div class="flex items-center">
                            <div class="flex items-center flex-1">
                                <div class="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">✓</div>
                                <div class="flex-1 h-1 bg-green-600 mx-2"></div>
                            </div>
                            <div class="flex items-center flex-1">
                                <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                                <div class="flex-1 h-1 bg-blue-600 mx-2"></div>
                            </div>
                            <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">3</div>
                        </div>
                    </div>
                </div>

                <!-- Reorder List -->
                <div class="px-4 py-6 pb-32">
                    <div class="mb-4 text-sm text-gray-600">
                        버튼으로 순서를 조정하세요. 순서는 나중에도 변경할 수 있습니다.
                    </div>

                    <div class="space-y-2">
                        ${this.formData.orderedLocations.map((loc, index) => `
                            <div class="bg-white rounded-lg p-4 shadow-sm">
                                <div class="flex items-start">
                                    <div class="text-2xl font-bold text-gray-400 mr-3">${index + 1}</div>
                                    <div class="flex-1">
                                        <div class="font-medium text-gray-900">${loc.name}</div>
                                        <div class="text-sm text-gray-600">${loc.address}</div>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        ${index > 0 ? `
                                            <button onclick="createAssignmentScreen.moveLocation(${index}, -1)" 
                                                    class="p-2 bg-gray-100 rounded touch-target">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                                                </svg>
                                            </button>
                                        ` : '<div class="w-9"></div>'}
                                        ${index < this.formData.orderedLocations.length - 1 ? `
                                            <button onclick="createAssignmentScreen.moveLocation(${index}, 1)" 
                                                    class="p-2 bg-gray-100 rounded touch-target">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </button>
                                        ` : '<div class="w-9"></div>'}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Bottom Actions -->
                <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-safe">
                    <button onclick="createAssignmentScreen.goToStep3()" 
                            class="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg touch-target">
                        다음: 확인 및 저장
                    </button>
                </div>
            </div>
        `;

        ui.render(html);
        ui.setNavigationVisible(false);
    },

    /**
     * Move location up or down
     */
    moveLocation(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.formData.orderedLocations.length) return;

        // Swap
        [this.formData.orderedLocations[index], this.formData.orderedLocations[newIndex]] = 
        [this.formData.orderedLocations[newIndex], this.formData.orderedLocations[index]];

        this.renderStep2();
    },

    /**
     * Go to step 3: Confirm
     */
    goToStep3() {
        this.step = 3;
        this.renderStep3();
    },

    /**
     * Step 3: Confirm and save
     */
    renderStep3() {
        const driver = this.formData.region === 'N' ? '김철수' : '이영희';

        const html = `
            <div class="min-h-screen bg-gray-50">
                <!-- Header -->
                <div class="bg-white border-b sticky top-0 z-10">
                    <div class="flex items-center px-4 py-4">
                        <button onclick="createAssignmentScreen.renderStep2()" class="mr-3 touch-target">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <h1 class="text-lg font-bold text-gray-900">배정 확인</h1>
                    </div>

                    <!-- Progress -->
                    <div class="px-4 pb-4">
                        <div class="flex items-center">
                            <div class="flex items-center flex-1">
                                <div class="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">✓</div>
                                <div class="flex-1 h-1 bg-green-600 mx-2"></div>
                            </div>
                            <div class="flex items-center flex-1">
                                <div class="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">✓</div>
                                <div class="flex-1 h-1 bg-green-600 mx-2"></div>
                            </div>
                            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                        </div>
                    </div>
                </div>

                <!-- Summary -->
                <div class="px-4 py-6 pb-32 space-y-6">
                    <!-- Info Card -->
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 class="font-bold text-blue-900 mb-3">배정 정보</h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-blue-700">날짜:</span>
                                <span class="font-medium text-blue-900">${this.formData.date}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-blue-700">구역:</span>
                                <span class="font-medium text-blue-900">${this.formData.region === 'N' ? '북부권' : '남부권'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-blue-700">기사:</span>
                                <span class="font-medium text-blue-900">${driver}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-blue-700">정차지:</span>
                                <span class="font-medium text-blue-900">${this.formData.orderedLocations.length}개</span>
                            </div>
                        </div>
                    </div>

                    <!-- Location List -->
                    <div>
                        <h3 class="font-bold text-gray-900 mb-3">배송 순서</h3>
                        <div class="space-y-2">
                            ${this.formData.orderedLocations.map((loc, index) => `
                                <div class="bg-white rounded-lg p-3 shadow-sm flex items-center">
                                    <div class="text-lg font-bold text-gray-400 mr-3">${index + 1}</div>
                                    <div class="flex-1">
                                        <div class="font-medium text-gray-900 text-sm">${loc.name}</div>
                                        <div class="text-xs text-gray-600">${loc.address}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Email Notice Option -->
                    <div class="bg-white rounded-lg p-4 border border-gray-200">
                        <label class="flex items-start">
                            <input type="checkbox" 
                                   id="send-notification"
                                   checked
                                   class="mt-1 mr-3">
                            <div>
                                <div class="font-medium text-gray-900">기사에게 알림 전송</div>
                                <div class="text-sm text-gray-600">배정 완료 시 자동으로 알림을 전송합니다</div>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Bottom Actions -->
                <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-safe">
                    <button onclick="createAssignmentScreen.saveAssignment()" 
                            class="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg touch-target">
                        저장 및 배정 완료
                    </button>
                </div>
            </div>
        `;

        ui.render(html);
        ui.setNavigationVisible(false);
    },

    /**
     * Save assignment
     */
    async saveAssignment() {
        const sendNotification = document.getElementById('send-notification').checked;

        ui.showLoading('배정 생성 중...');

        try {
            const driverId = this.formData.region === 'N' ? 'driver-a' : 'driver-b';
            const routeDayId = `route-${this.formData.date}-${this.formData.region.toLowerCase()}`;

            // Create route_day
            await fetch('tables/route_days', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: routeDayId,
                    date: this.formData.date,
                    region: this.formData.region,
                    driver_id: driverId,
                    window_start: '11:30',
                    window_end: '14:30',
                    job_started_at: 0
                })
            });

            // Create stops
            for (let i = 0; i < this.formData.orderedLocations.length; i++) {
                const loc = this.formData.orderedLocations[i];
                await fetch('tables/stops', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: `stop-${this.formData.date}-${this.formData.region.toLowerCase()}-${i + 1}`,
                        route_day_id: routeDayId,
                        sequence: i + 1,
                        location_id: loc.id,
                        planned_cs: Math.floor(Math.random() * 4) + 1,
                        planned_bt: Math.floor(Math.random() * 8) + 2,
                        planned_ft: Math.floor(Math.random() * 8) + 2,
                        status: 'READY',
                        job_started_at: 0,
                        completed_at: 0
                    })
                });
            }

            // Send notification
            if (sendNotification) {
                const driverName = this.formData.region === 'N' ? '김철수' : '이영희';
                await api.notifications.create(
                    'DRIVER',
                    driverId,
                    'SMS',
                    `[배정 완료] ${this.formData.date} 경로가 배정되었습니다. ${this.formData.orderedLocations.length}개 정차지`
                );
            }

            ui.hideLoading();
            ui.showToast('배정이 완료되었습니다');

            // Navigate to admin home
            setTimeout(() => {
                app.navigateTo('admin-home');
            }, 1500);

        } catch (error) {
            ui.hideLoading();
            ui.showToast('배정 실패: ' + error.message);
            console.error('Save assignment error:', error);
        }
    }
};
