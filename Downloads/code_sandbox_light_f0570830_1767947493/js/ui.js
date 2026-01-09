/**
 * UI Helper Functions
 */

const ui = {
    /**
     * Show toast notification
     */
    showToast(message, duration = 3000) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('active');
        
        setTimeout(() => {
            toast.classList.remove('active');
        }, duration);
    },

    /**
     * Show modal
     */
    showModal(contentHtml) {
        const backdrop = document.getElementById('modal-backdrop');
        
        // Remove existing modal content
        let modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.remove();
        }
        
        // Create new modal
        modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.innerHTML = contentHtml;
        document.body.appendChild(modalContent);
        
        // Show with animation
        backdrop.classList.add('active');
        setTimeout(() => {
            modalContent.classList.add('active');
        }, 10);
        
        // Close on backdrop click
        backdrop.onclick = () => this.hideModal();
    },

    /**
     * Hide modal
     */
    hideModal() {
        const backdrop = document.getElementById('modal-backdrop');
        const modalContent = document.querySelector('.modal-content');
        
        if (modalContent) {
            modalContent.classList.remove('active');
            setTimeout(() => {
                modalContent.remove();
            }, 300);
        }
        
        backdrop.classList.remove('active');
    },

    /**
     * Show loading indicator
     */
    showLoading(message = '로딩 중...') {
        const loadingHtml = `
            <div class="p-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p class="text-gray-600">${message}</p>
            </div>
        `;
        this.showModal(loadingHtml);
    },

    /**
     * Hide loading indicator
     */
    hideLoading() {
        this.hideModal();
    },

    /**
     * Show confirmation dialog
     */
    async showConfirm(title, message, confirmText = '확인', cancelText = '취소') {
        return new Promise((resolve) => {
            const confirmHtml = `
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-4">${title}</h3>
                    <p class="text-gray-700 mb-6">${message}</p>
                    <div class="flex gap-3">
                        <button onclick="ui.confirmCancel()" class="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium touch-target">
                            ${cancelText}
                        </button>
                        <button onclick="ui.confirmOk()" class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium touch-target">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;
            
            this.showModal(confirmHtml);
            
            // Store resolve function
            this._confirmResolve = resolve;
        });
    },

    /**
     * Confirm dialog OK handler
     */
    confirmOk() {
        if (this._confirmResolve) {
            this._confirmResolve(true);
            this._confirmResolve = null;
        }
        this.hideModal();
    },

    /**
     * Confirm dialog Cancel handler
     */
    confirmCancel() {
        if (this._confirmResolve) {
            this._confirmResolve(false);
            this._confirmResolve = null;
        }
        this.hideModal();
    },

    /**
     * Update bottom navigation active state
     */
    updateNavigation(activeTab) {
        const tabs = ['today', 'feed', 'report', 'profile'];
        tabs.forEach(tab => {
            const button = document.getElementById(`nav-${tab}`);
            if (button) {
                if (tab === activeTab) {
                    button.classList.add('text-blue-600');
                    button.classList.remove('text-gray-600');
                } else {
                    button.classList.remove('text-blue-600');
                    button.classList.add('text-gray-600');
                }
            }
        });
    },

    /**
     * Show/hide bottom navigation
     */
    setNavigationVisible(visible) {
        const nav = document.getElementById('bottom-nav');
        if (visible) {
            nav.classList.remove('hidden');
        } else {
            nav.classList.add('hidden');
        }
    },

    /**
     * Show/hide report tab (for admin only)
     */
    setReportTabVisible(visible) {
        const reportTab = document.getElementById('nav-report');
        if (reportTab) {
            if (visible) {
                reportTab.classList.remove('hidden');
            } else {
                reportTab.classList.add('hidden');
            }
        }
    },

    /**
     * Render content to app container
     */
    render(html) {
        const app = document.getElementById('app');
        app.innerHTML = html;
    },

    /**
     * Create stop card HTML
     */
    createStopCard(stop, location, index, showLateRisk = false) {
        const statusClass = utils.getStatusClass(stop.status);
        const statusLabel = utils.getStatusLabel(stop.status);
        const lateRiskBadge = showLateRisk ? 
            '<span class="ml-2 px-2 py-1 text-xs rounded status-late-risk">지연위험</span>' : '';
        
        return `
            <div class="bg-white rounded-lg shadow-sm p-4 mb-3 cursor-pointer active:bg-gray-50" 
                 onclick="app.navigateTo('stop-detail', '${stop.id}')">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center">
                        <span class="text-2xl font-bold text-gray-400 mr-3">${stop.sequence}</span>
                        <div>
                            <div class="font-medium text-gray-900">${location.name}</div>
                            <div class="text-sm text-gray-500">${location.id}</div>
                        </div>
                    </div>
                    <span class="px-3 py-1 text-sm rounded-full ${statusClass}">
                        ${statusLabel}
                    </span>
                </div>
                <div class="text-sm text-gray-600 mb-2">
                    ${utils.truncate(location.entry_instruction_text, 50)}
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>CS ${stop.planned_cs} / BT ${stop.planned_bt} / FT ${stop.planned_ft}</span>
                    ${lateRiskBadge}
                </div>
            </div>
        `;
    }
};
