/**
 * Location Management Screen
 * CRUD operations for locations
 */

const locationManagementScreen = {
    locations: [],
    filteredLocations: [],
    searchQuery: '',
    regionFilter: 'ALL',

    /**
     * Render location management screen
     */
    async render() {
        ui.showLoading('배송지 목록 로딩 중...');

        try {
            this.locations = await api.locations.getAll();
            this.filteredLocations = this.locations;
            
            ui.hideLoading();
            this.renderContent();

        } catch (error) {
            ui.hideLoading();
            ui.showToast('배송지 로드 실패: ' + error.message);
            console.error('Location management error:', error);
        }
    },

    /**
     * Render main content
     */
    renderContent() {
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
                        <h1 class="text-lg font-bold text-gray-900">배송지 관리</h1>
                    </div>

                    <!-- Search and Filter -->
                    <div class="px-4 pb-4 space-y-3">
                        <!-- Search -->
                        <div class="relative">
                            <input type="text" 
                                   id="search-input"
                                   placeholder="이름 또는 주소 검색..."
                                   oninput="locationManagementScreen.handleSearch(this.value)"
                                   class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <svg class="w-5 h-5 absolute left-3 top-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>

                        <!-- Region Filter -->
                        <div class="flex gap-2">
                            <button onclick="locationManagementScreen.setRegionFilter('ALL')" 
                                    class="flex-1 py-2 rounded-lg font-medium ${this.regionFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}">
                                전체 (${this.locations.length})
                            </button>
                            <button onclick="locationManagementScreen.setRegionFilter('N')" 
                                    class="flex-1 py-2 rounded-lg font-medium ${this.regionFilter === 'N' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}">
                                북부 (${this.locations.filter(l => l.region === 'N').length})
                            </button>
                            <button onclick="locationManagementScreen.setRegionFilter('S')" 
                                    class="flex-1 py-2 rounded-lg font-medium ${this.regionFilter === 'S' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}">
                                남부 (${this.locations.filter(l => l.region === 'S').length})
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Add Button (Floating) -->
                <button onclick="locationManagementScreen.showLocationForm()" 
                        class="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg z-20 flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </button>

                <!-- Locations List -->
                <div class="px-4 py-4 pb-24">
                    ${this.filteredLocations.length > 0 ? `
                        <div class="space-y-3">
                            ${this.filteredLocations.map(loc => this.renderLocationCard(loc)).join('')}
                        </div>
                    ` : `
                        <div class="text-center py-12">
                            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                            </svg>
                            <p class="text-gray-600 mb-4">배송지가 없습니다</p>
                            <button onclick="locationManagementScreen.showLocationForm()" 
                                    class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">
                                첫 배송지 추가하기
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;

        ui.render(html);
        ui.setNavigationVisible(false);
    },

    /**
     * Render location card
     */
    renderLocationCard(location) {
        return `
            <div class="bg-white rounded-lg shadow-sm p-4">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="font-bold text-gray-900">${location.name}</h3>
                            <span class="px-2 py-0.5 text-xs rounded-full ${location.region === 'N' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}">
                                ${location.region === 'N' ? '북부' : '남부'}
                            </span>
                        </div>
                        <p class="text-sm text-gray-600 mb-2">${location.address}</p>
                        <p class="text-xs text-gray-500 line-clamp-2">${location.entry_instruction_text}</p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 mt-3 pt-3 border-t">
                    <button onclick="locationManagementScreen.showLocationForm('${location.id}')" 
                            class="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                        수정
                    </button>
                    <button onclick="locationManagementScreen.duplicateLocation('${location.id}')" 
                            class="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                        복제
                    </button>
                    <button onclick="locationManagementScreen.confirmDelete('${location.id}')" 
                            class="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                        삭제
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Handle search
     */
    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    },

    /**
     * Set region filter
     */
    setRegionFilter(region) {
        this.regionFilter = region;
        this.applyFilters();
    },

    /**
     * Apply filters
     */
    applyFilters() {
        this.filteredLocations = this.locations.filter(loc => {
            // Region filter
            if (this.regionFilter !== 'ALL' && loc.region !== this.regionFilter) {
                return false;
            }

            // Search filter
            if (this.searchQuery) {
                const matchName = loc.name.toLowerCase().includes(this.searchQuery);
                const matchAddress = loc.address.toLowerCase().includes(this.searchQuery);
                return matchName || matchAddress;
            }

            return true;
        });

        this.renderContent();
    },

    /**
     * Show location form (add or edit)
     */
    showLocationForm(locationId = null) {
        app.navigateTo('location-form', locationId);
    },

    /**
     * Duplicate location
     */
    async duplicateLocation(locationId) {
        const location = this.locations.find(l => l.id === locationId);
        if (!location) return;

        const confirmed = await ui.showConfirm(
            '배송지 복제',
            `"${location.name}"을(를) 복제하시겠습니까?`,
            '복제',
            '취소'
        );

        if (!confirmed) return;

        // Store location data for form
        window._duplicateLocationData = {
            name: location.name + ' (복사)',
            address: location.address,
            region: location.region,
            entry_instruction_text: location.entry_instruction_text
        };

        app.navigateTo('location-form', null);
    },

    /**
     * Confirm delete
     */
    async confirmDelete(locationId) {
        const location = this.locations.find(l => l.id === locationId);
        if (!location) return;

        const confirmed = await ui.showConfirm(
            '배송지 삭제',
            `"${location.name}"을(를) 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.`,
            '삭제',
            '취소'
        );

        if (!confirmed) return;

        // Double confirm
        const doubleConfirmed = await ui.showConfirm(
            '최종 확인',
            `정말로 "${location.name}"을(를) 삭제하시겠습니까?`,
            '네, 삭제합니다',
            '취소'
        );

        if (!doubleConfirmed) return;

        ui.showLoading('삭제 중...');

        try {
            await fetch(`tables/locations/${locationId}`, {
                method: 'DELETE'
            });

            ui.hideLoading();
            ui.showToast('배송지가 삭제되었습니다');

            // Reload
            this.render();

        } catch (error) {
            ui.hideLoading();
            ui.showToast('삭제 실패: ' + error.message);
            console.error('Delete error:', error);
        }
    }
};
