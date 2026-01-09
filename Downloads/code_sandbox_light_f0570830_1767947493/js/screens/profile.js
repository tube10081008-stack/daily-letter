/**
 * Profile Screen
 */

const profileScreen = {
    /**
     * Render profile screen
     */
    render() {
        const user = state.getUser();
        const role = state.getRole();

        const html = `
            <div class="px-4 py-6 pb-20">
                <!-- Header -->
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-2">프로필</h1>
                </div>

                <!-- User Info -->
                <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div class="flex items-center mb-4">
                        <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                            ${user.name.charAt(0)}
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-gray-900">${user.name}</h2>
                            <p class="text-sm text-gray-600">${role === 'DRIVER' ? '배송 기사' : '관리자'}</p>
                        </div>
                    </div>

                    <div class="space-y-3 pt-4 border-t">
                        <div class="flex justify-between">
                            <span class="text-gray-600">ID</span>
                            <span class="font-medium text-gray-900">${user.id}</span>
                        </div>
                        ${role === 'DRIVER' && user.region ? `
                            <div class="flex justify-between">
                                <span class="text-gray-600">담당 구역</span>
                                <span class="font-medium text-gray-900">${utils.getRegionLabel(user.region)}</span>
                            </div>
                        ` : ''}
                        ${role === 'DRIVER' && user.status ? `
                            <div class="flex justify-between">
                                <span class="text-gray-600">상태</span>
                                <span class="font-medium ${user.status === 'ON_DUTY' ? 'text-green-600' : 'text-gray-600'}">
                                    ${user.status === 'ON_DUTY' ? '근무중' : '대기'}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- App Info -->
                <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h3 class="font-bold text-gray-900 mb-4">앱 정보</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">버전</span>
                            <span class="font-medium text-gray-900">1.0.0 MVP</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">빌드</span>
                            <span class="font-medium text-gray-900">2026-01-09</span>
                        </div>
                    </div>
                </div>

                <!-- Notifications -->
                ${role === 'DRIVER' ? `
                    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h3 class="font-bold text-gray-900 mb-4">알림 내역</h3>
                        <button onclick="profileScreen.loadNotifications()" 
                                class="w-full py-3 bg-blue-50 text-blue-600 rounded-lg font-medium">
                            알림 내역 보기
                        </button>
                        <div id="notifications-list" class="mt-4 hidden"></div>
                    </div>
                ` : ''}

                <!-- Actions -->
                <div class="space-y-3">
                    <button onclick="profileScreen.refreshData()" 
                            class="w-full py-4 bg-blue-600 text-white rounded-lg font-medium touch-target">
                        🔄 데이터 새로고침
                    </button>
                    <button onclick="profileScreen.logout()" 
                            class="w-full py-4 bg-red-600 text-white rounded-lg font-medium touch-target">
                        로그아웃
                    </button>
                </div>

                <!-- Support Info -->
                <div class="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                    <p class="text-sm text-gray-600 mb-2">문의사항이 있으신가요?</p>
                    <p class="text-sm font-medium text-gray-900">📞 1588-0000</p>
                </div>
            </div>
        `;

        ui.render(html);
        ui.setNavigationVisible(true);
        ui.updateNavigation('profile');
        ui.setReportTabVisible(state.isAdmin());
    },

    /**
     * Load notifications
     */
    async loadNotifications() {
        const user = state.getUser();
        
        try {
            const notifications = await api.notifications.getByTarget('DRIVER', user.id);
            
            const listContainer = document.getElementById('notifications-list');
            
            if (notifications.length === 0) {
                listContainer.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">알림 내역이 없습니다</p>';
            } else {
                const notificationsHtml = notifications.slice(0, 10).map(notif => `
                    <div class="py-3 border-b border-gray-100 last:border-0">
                        <div class="flex items-start">
                            <div class="flex-1">
                                <div class="text-sm text-gray-900">${notif.message}</div>
                                <div class="text-xs text-gray-500 mt-1">
                                    ${utils.formatDateTime(notif.sent_at)} • ${notif.channel}
                                </div>
                            </div>
                            <span class="px-2 py-1 text-xs rounded ${notif.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                                ${notif.status === 'SENT' ? '전송됨' : notif.status}
                            </span>
                        </div>
                    </div>
                `).join('');
                
                listContainer.innerHTML = notificationsHtml;
            }
            
            listContainer.classList.remove('hidden');
        } catch (error) {
            ui.showToast('알림 로드 실패: ' + error.message);
            console.error('Load notifications error:', error);
        }
    },

    /**
     * Refresh data
     */
    async refreshData() {
        ui.showLoading('새로고침 중...');

        try {
            // Reload locations
            await state.loadLocations();

            // Reload drivers for admin
            if (state.isAdmin()) {
                await state.refreshDrivers();
            }

            ui.hideLoading();
            ui.showToast('데이터가 새로고침되었습니다');

            // Navigate back to today
            setTimeout(() => {
                app.navigateTo('today');
            }, 1000);

        } catch (error) {
            ui.hideLoading();
            ui.showToast('새로고침 실패: ' + error.message);
            console.error('Refresh error:', error);
        }
    },

    /**
     * Logout
     */
    async logout() {
        const confirmed = await ui.showConfirm(
            '로그아웃',
            '정말 로그아웃하시겠습니까?',
            '로그아웃',
            '취소'
        );

        if (!confirmed) return;

        // Clear state
        state.clear();

        // Show toast
        ui.showToast('로그아웃되었습니다');

        // Navigate to login
        setTimeout(() => {
            app.navigateTo('login');
        }, 500);
    }
};
