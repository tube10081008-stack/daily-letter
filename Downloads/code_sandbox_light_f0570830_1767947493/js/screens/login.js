/**
 * Login Screen
 */

const loginScreen = {
    /**
     * Render login screen
     */
    render() {
        const html = `
            <div class="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-blue-50 to-indigo-100">
                <div class="w-full max-w-md">
                    <!-- Logo -->
                    <div class="text-center mb-8">
                        <div class="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
                            <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">MumuBedding</h1>
                        <p class="text-gray-600">배송/회수 운영 시스템</p>
                    </div>

                    <!-- Login Form -->
                    <div class="bg-white rounded-2xl shadow-xl p-6">
                        <!-- Role Toggle -->
                        <div class="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                            <button id="toggle-driver" 
                                    class="flex-1 py-3 rounded-md font-medium transition-all touch-target bg-blue-600 text-white"
                                    onclick="loginScreen.toggleRole('DRIVER')">
                                기사
                            </button>
                            <button id="toggle-admin" 
                                    class="flex-1 py-3 rounded-md font-medium transition-all touch-target text-gray-600"
                                    onclick="loginScreen.toggleRole('ADMIN')">
                                관리자
                            </button>
                        </div>

                        <!-- ID Input -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <span id="id-label">기사 ID</span>
                            </label>
                            <input id="login-id" 
                                   type="text" 
                                   placeholder="driver-a 또는 driver-b"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>

                        <!-- PIN Input -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">PIN</label>
                            <input id="login-pin" 
                                   type="password" 
                                   inputmode="numeric"
                                   maxlength="4"
                                   placeholder="4자리 PIN"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>

                        <!-- Login Button -->
                        <button onclick="loginScreen.handleLogin()" 
                                class="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg shadow-lg active:bg-blue-700 touch-target">
                            로그인
                        </button>

                        <!-- Demo Info -->
                        <div class="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
                            <p class="font-medium text-blue-900 mb-2">데모 계정:</p>
                            <p class="text-blue-700">기사 A: driver-a / 1234</p>
                            <p class="text-blue-700">기사 B: driver-b / 5678</p>
                            <p class="text-blue-700">관리자: admin / 0000</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        ui.render(html);
        ui.setNavigationVisible(false);

        // Set initial role
        this.currentRole = 'DRIVER';

        // Handle Enter key
        document.getElementById('login-pin').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });
    },

    /**
     * Toggle between Driver and Admin role
     */
    toggleRole(role) {
        this.currentRole = role;

        const driverBtn = document.getElementById('toggle-driver');
        const adminBtn = document.getElementById('toggle-admin');
        const idLabel = document.getElementById('id-label');
        const idInput = document.getElementById('login-id');

        if (role === 'DRIVER') {
            driverBtn.classList.add('bg-blue-600', 'text-white');
            driverBtn.classList.remove('text-gray-600');
            adminBtn.classList.remove('bg-blue-600', 'text-white');
            adminBtn.classList.add('text-gray-600');
            idLabel.textContent = '기사 ID';
            idInput.placeholder = 'driver-a 또는 driver-b';
        } else {
            adminBtn.classList.add('bg-blue-600', 'text-white');
            adminBtn.classList.remove('text-gray-600');
            driverBtn.classList.remove('bg-blue-600', 'text-white');
            driverBtn.classList.add('text-gray-600');
            idLabel.textContent = '관리자 ID';
            idInput.placeholder = 'admin';
        }
    },

    /**
     * Handle login
     */
    async handleLogin() {
        const id = document.getElementById('login-id').value.trim();
        const pin = document.getElementById('login-pin').value.trim();

        if (!id || !pin) {
            ui.showToast('ID와 PIN을 입력해주세요');
            return;
        }

        ui.showLoading('로그인 중...');

        try {
            let user = null;

            // API를 통한 인증 (Neon DB)
            if (this.currentRole === 'DRIVER') {
                user = await dataLayer.authenticateDriver(id, pin);
                
                if (!user) {
                    throw new Error('잘못된 기사 ID 또는 PIN입니다');
                }
            } else {
                user = await dataLayer.authenticateAdmin(id, pin);
                
                if (!user) {
                    throw new Error('잘못된 관리자 ID 또는 PIN입니다');
                }
            }

            // Set user in state (token 포함)
            state.setUser(user, this.currentRole);

            ui.hideLoading();
            ui.showToast(`환영합니다, ${user.name}님!`);

            // Navigate to home
            app.navigateTo('today');

        } catch (error) {
            ui.hideLoading();
            ui.showToast(error.message);
            console.error('Login error:', error);
        }
    }
};
