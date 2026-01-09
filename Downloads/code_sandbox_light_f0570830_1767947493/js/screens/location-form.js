/**
 * Location Form Screen (Add/Edit)
 * System auto-generates IDs
 */

const locationFormScreen = {
    locationId: null,
    location: null,

    /**
     * Render location form
     */
    async render(locationId = null) {
        this.locationId = locationId;
        
        if (locationId) {
            // Edit mode
            ui.showLoading('배송지 정보 로딩 중...');
            try {
                this.location = await api.locations.getById(locationId);
                ui.hideLoading();
            } catch (error) {
                ui.hideLoading();
                ui.showToast('배송지 로드 실패: ' + error.message);
                app.navigateTo('location-management');
                return;
            }
        } else {
            // Add mode - check for duplicate data
            if (window._duplicateLocationData) {
                this.location = window._duplicateLocationData;
                delete window._duplicateLocationData;
            } else {
                this.location = null;
            }
        }

        this.renderContent();
    },

    /**
     * Render main content
     */
    renderContent() {
        const isEdit = this.locationId !== null;
        const location = this.location || {};

        const html = `
            <div class="min-h-screen bg-gray-50">
                <!-- Header -->
                <div class="bg-white border-b sticky top-0 z-10">
                    <div class="flex items-center px-4 py-4">
                        <button onclick="app.navigateTo('location-management')" class="mr-3 touch-target">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <h1 class="text-lg font-bold text-gray-900">
                            ${isEdit ? '배송지 수정' : '새 배송지 추가'}
                        </h1>
                    </div>
                </div>

                <!-- Form -->
                <form id="location-form" class="px-4 py-6 pb-24 space-y-6">
                    ${isEdit ? `
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div class="flex items-start">
                                <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div class="text-sm text-blue-900">
                                    <p class="font-medium mb-1">위치 ID: ${location.id}</p>
                                    <p class="text-blue-700">ID는 시스템이 자동으로 관리합니다</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            배송지 이름 <span class="text-red-500">*</span>
                        </label>
                        <input type="text" 
                               id="location-name" 
                               value="${location.name || ''}"
                               placeholder="예: 강남 오피스텔"
                               required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>

                    <!-- Address -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            주소 <span class="text-red-500">*</span>
                        </label>
                        <input type="text" 
                               id="location-address" 
                               value="${location.address || ''}"
                               placeholder="예: 서울시 강남구 테헤란로 123"
                               required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>

                    <!-- Region Toggle -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            구역 <span class="text-red-500">*</span>
                        </label>
                        <div class="flex gap-3">
                            <label class="flex-1 flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer ${!location.region || location.region === 'N' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}">
                                <input type="radio" 
                                       name="region" 
                                       value="N" 
                                       ${!location.region || location.region === 'N' ? 'checked' : ''}
                                       class="mr-3">
                                <div class="text-center">
                                    <div class="font-bold text-gray-900">북부권</div>
                                    <div class="text-xs text-gray-600">강남, 서초 등</div>
                                </div>
                            </label>
                            <label class="flex-1 flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer ${location.region === 'S' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}">
                                <input type="radio" 
                                       name="region" 
                                       value="S" 
                                       ${location.region === 'S' ? 'checked' : ''}
                                       class="mr-3">
                                <div class="text-center">
                                    <div class="font-bold text-gray-900">남부권</div>
                                    <div class="text-xs text-gray-600">영등포, 구로 등</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Entry Instructions -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            출입 안내 <span class="text-red-500">*</span>
                        </label>
                        <textarea id="location-entry" 
                                  rows="6" 
                                  required
                                  placeholder="기사님이 현장에서 참고할 상세한 출입 안내를 입력하세요.&#10;&#10;예시:&#10;1층 로비 경비실에서 방문증 수령&#10;3동 엘리베이터 이용&#10;1502호 비밀번호 #1234*"
                                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">${location.entry_instruction_text || ''}</textarea>
                        <p class="mt-1 text-sm text-gray-500">기사님이 쉽게 찾을 수 있도록 자세히 작성해주세요</p>
                    </div>

                    <!-- Optional: Contact Phone -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            연락처 (선택)
                        </label>
                        <input type="tel" 
                               id="location-phone" 
                               value="${location.contact_phone || ''}"
                               placeholder="010-1234-5678"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <p class="mt-1 text-sm text-gray-500">긴급 연락이 필요할 때 사용</p>
                    </div>

                    <!-- Optional: Tags -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            태그 (선택)
                        </label>
                        <div class="space-y-2">
                            <label class="flex items-center p-3 border border-gray-200 rounded-lg">
                                <input type="checkbox" 
                                       name="tags" 
                                       value="경비실방문필요"
                                       ${(location.tags || []).includes('경비실방문필요') ? 'checked' : ''}
                                       class="mr-3">
                                <span>경비실 방문 필요</span>
                            </label>
                            <label class="flex items-center p-3 border border-gray-200 rounded-lg">
                                <input type="checkbox" 
                                       name="tags" 
                                       value="주차어려움"
                                       ${(location.tags || []).includes('주차어려움') ? 'checked' : ''}
                                       class="mr-3">
                                <span>주차 어려움</span>
                            </label>
                            <label class="flex items-center p-3 border border-gray-200 rounded-lg">
                                <input type="checkbox" 
                                       name="tags" 
                                       value="비밀번호필요"
                                       ${(location.tags || []).includes('비밀번호필요') ? 'checked' : ''}
                                       class="mr-3">
                                <span>비밀번호 필요</span>
                            </label>
                            <label class="flex items-center p-3 border border-gray-200 rounded-lg">
                                <input type="checkbox" 
                                       name="tags" 
                                       value="엘리베이터없음"
                                       ${(location.tags || []).includes('엘리베이터없음') ? 'checked' : ''}
                                       class="mr-3">
                                <span>엘리베이터 없음</span>
                            </label>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" 
                            class="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg touch-target">
                        ${isEdit ? '수정 완료' : '배송지 추가'}
                    </button>
                </form>
            </div>
        `;

        ui.render(html);
        ui.setNavigationVisible(false);

        // Add form submit handler
        document.getElementById('location-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    },

    /**
     * Handle form submit
     */
    async handleSubmit() {
        const name = document.getElementById('location-name').value.trim();
        const address = document.getElementById('location-address').value.trim();
        const region = document.querySelector('input[name="region"]:checked').value;
        const entry = document.getElementById('location-entry').value.trim();
        const phone = document.getElementById('location-phone').value.trim();
        
        // Get selected tags
        const tagCheckboxes = document.querySelectorAll('input[name="tags"]:checked');
        const tags = Array.from(tagCheckboxes).map(cb => cb.value);

        // Validate
        if (!name || !address || !region || !entry) {
            ui.showToast('필수 항목을 모두 입력해주세요');
            return;
        }

        ui.showLoading(this.locationId ? '수정 중...' : '추가 중...');

        try {
            if (this.locationId) {
                // Update existing location
                await fetch(`tables/locations/${this.locationId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        address,
                        region,
                        entry_instruction_text: entry,
                        contact_phone: phone,
                        tags
                    })
                });

                ui.hideLoading();
                ui.showToast('배송지가 수정되었습니다');

            } else {
                // Create new location with auto-generated ID
                const newId = await this.generateLocationId(region);

                await fetch('tables/locations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: newId,
                        name,
                        address,
                        region,
                        entry_instruction_text: entry,
                        contact_phone: phone,
                        tags
                    })
                });

                ui.hideLoading();
                ui.showToast('배송지가 추가되었습니다');
            }

            // Navigate back
            setTimeout(() => {
                app.navigateTo('location-management');
            }, 1000);

        } catch (error) {
            ui.hideLoading();
            ui.showToast('저장 실패: ' + error.message);
            console.error('Save location error:', error);
        }
    },

    /**
     * Generate location ID (LOC-N-#### or LOC-S-####)
     */
    async generateLocationId(region) {
        // Get all locations for this region
        const response = await fetch('tables/locations?limit=1000');
        const data = await response.json();
        const locations = data.data || [];
        
        const regionLocations = locations.filter(loc => 
            loc.id.startsWith(`LOC-${region}-`)
        );

        // Find highest number
        let maxNum = 0;
        regionLocations.forEach(loc => {
            const match = loc.id.match(/LOC-[NS]-(\d+)/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) maxNum = num;
            }
        });

        // Generate new number (pad with zeros)
        const newNum = String(maxNum + 1).padStart(4, '0');
        return `LOC-${region}-${newNum}`;
    }
};
