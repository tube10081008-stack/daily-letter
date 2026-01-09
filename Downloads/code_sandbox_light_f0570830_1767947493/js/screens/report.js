/**
 * Report Screen (Ops only)
 */

const reportScreen = {
    /**
     * Render report screen
     */
    async render() {
        if (!state.isAdmin()) {
            app.navigateTo('today');
            return;
        }

        const html = `
            <div class="px-4 py-6 pb-20">
                <!-- Header -->
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-2">일일 리포트</h1>
                    <p class="text-gray-600">운영 데이터 분석 및 요약</p>
                </div>

                <!-- Date Selector -->
                <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">날짜 선택</label>
                    <input type="date" 
                           id="report-date" 
                           value="${utils.formatDate()}"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                </div>

                <!-- Generate Button -->
                <button onclick="reportScreen.generateReport()" 
                        class="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg shadow-lg mb-6 touch-target">
                    📊 리포트 생성
                </button>

                <!-- Report Output -->
                <div id="report-output" class="hidden">
                    <!-- Report content will be inserted here -->
                </div>
            </div>
        `;

        ui.render(html);
        ui.setNavigationVisible(true);
        ui.updateNavigation('report');
        ui.setReportTabVisible(true);
    },

    /**
     * Generate report
     */
    async generateReport() {
        const dateInput = document.getElementById('report-date');
        const date = dateInput.value;

        if (!date) {
            ui.showToast('날짜를 선택해주세요');
            return;
        }

        ui.showLoading('리포트 생성 중...');

        try {
            // Load route days for selected date
            const routeDays = await api.routeDays.getByDate(date);

            if (routeDays.length === 0) {
                ui.hideLoading();
                ui.showToast('해당 날짜에 데이터가 없습니다');
                return;
            }

            // Load all data
            const allStops = await api.stops.getAll();
            const allEvents = await api.stopEvents.getAll();
            await state.loadDrivers();
            await state.loadLocations();

            // Build report data
            const reportData = await Promise.all(
                routeDays.map(async (routeDay) => {
                    const driver = state.getDriverById(routeDay.driver_id);
                    const stops = allStops
                        .filter(s => s.route_day_id === routeDay.id)
                        .sort((a, b) => a.sequence - b.sequence);
                    
                    const completedStops = stops.filter(s => s.status === 'COMPLETED');
                    
                    // Calculate timings
                    const firstStart = routeDay.job_started_at;
                    const lastCompletion = completedStops.length > 0 ? 
                        Math.max(...completedStops.map(s => s.completed_at)) : 0;
                    
                    // Calculate average interval
                    let avgInterval = 0;
                    if (completedStops.length > 1) {
                        const intervals = [];
                        for (let i = 1; i < completedStops.length; i++) {
                            intervals.push(completedStops[i].completed_at - completedStops[i-1].completed_at);
                        }
                        avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                    }

                    // Count notes
                    const stopIds = stops.map(s => s.id);
                    const notes = allEvents.filter(e => 
                        stopIds.includes(e.stop_id) && e.type === 'NOTE'
                    );

                    // Find problem locations
                    const problemLocations = [];
                    stops.forEach(stop => {
                        const stopNotes = allEvents.filter(e => 
                            e.stop_id === stop.id && e.type === 'NOTE'
                        );
                        if (stopNotes.length > 0) {
                            const location = state.getLocationById(stop.location_id);
                            problemLocations.push({
                                location: location.name,
                                count: stopNotes.length,
                                issues: stopNotes.map(n => n.content).join('; ')
                            });
                        }
                    });

                    return {
                        driver,
                        routeDay,
                        totalStops: stops.length,
                        completedStops: completedStops.length,
                        firstStart,
                        lastCompletion,
                        avgInterval,
                        notes: notes.length,
                        problemLocations
                    };
                })
            );

            ui.hideLoading();
            this.renderReport(date, reportData);

        } catch (error) {
            ui.hideLoading();
            ui.showToast('리포트 생성 실패: ' + error.message);
            console.error('Generate report error:', error);
        }
    },

    /**
     * Render report
     */
    renderReport(date, reportData) {
        const dateObj = new Date(date);
        const dateStr = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;

        // Generate AI summary (template-based for MVP)
        const aiSummary = this.generateAISummary(reportData);

        const reportHtml = `
            <div class="space-y-6">
                <!-- Summary -->
                <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
                    <h2 class="text-xl font-bold mb-2">📅 ${dateStr}</h2>
                    <p class="text-sm opacity-90">운영 리포트</p>
                </div>

                <!-- AI Summary -->
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 class="font-bold text-yellow-900 mb-3 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        AI 요약
                    </h3>
                    <p class="text-yellow-900 whitespace-pre-wrap">${aiSummary}</p>
                </div>

                <!-- Driver Reports -->
                ${reportData.map(data => this.renderDriverReport(data)).join('')}

                <!-- Top Issues -->
                ${this.renderTopIssues(reportData)}
            </div>
        `;

        const output = document.getElementById('report-output');
        output.innerHTML = reportHtml;
        output.classList.remove('hidden');
    },

    /**
     * Render driver report
     */
    renderDriverReport(data) {
        const completionRate = data.totalStops > 0 ? 
            Math.round((data.completedStops / data.totalStops) * 100) : 0;
        
        const avgIntervalMin = data.avgInterval > 0 ? 
            Math.round(data.avgInterval / 60000) : 0;

        return `
            <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">${data.driver.name} (${utils.getRegionLabel(data.routeDay.region)})</h3>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <div class="text-sm text-gray-600">전체 정차지</div>
                        <div class="text-2xl font-bold text-gray-900">${data.totalStops}</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-600">완료율</div>
                        <div class="text-2xl font-bold ${completionRate === 100 ? 'text-green-600' : 'text-orange-600'}">${completionRate}%</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-600">시작 시각</div>
                        <div class="text-lg font-medium text-gray-900">
                            ${data.firstStart ? utils.formatDateTime(data.firstStart) : '-'}
                        </div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-600">마지막 완료</div>
                        <div class="text-lg font-medium text-gray-900">
                            ${data.lastCompletion ? utils.formatDateTime(data.lastCompletion) : '-'}
                        </div>
                    </div>
                </div>

                ${avgIntervalMin > 0 ? `
                    <div class="bg-blue-50 rounded-lg p-3 mb-4">
                        <div class="text-sm text-blue-900">평균 정차지 간격</div>
                        <div class="text-xl font-bold text-blue-900">${avgIntervalMin}분</div>
                    </div>
                ` : ''}

                ${data.notes > 0 ? `
                    <div class="bg-orange-50 rounded-lg p-3">
                        <div class="text-sm text-orange-900">메모/이슈</div>
                        <div class="text-xl font-bold text-orange-900">${data.notes}건</div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Render top issues
     */
    renderTopIssues(reportData) {
        const allProblems = [];
        reportData.forEach(data => {
            allProblems.push(...data.problemLocations);
        });

        if (allProblems.length === 0) {
            return `
                <div class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div class="text-3xl mb-2">✅</div>
                    <div class="font-bold text-green-900">이슈 없음</div>
                    <div class="text-sm text-green-700">모든 정차지가 순조롭게 진행되었습니다</div>
                </div>
            `;
        }

        // Sort by issue count
        allProblems.sort((a, b) => b.count - a.count);

        return `
            <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">⚠️ 주요 이슈 위치</h3>
                <div class="space-y-3">
                    ${allProblems.slice(0, 5).map(problem => `
                        <div class="border-l-4 border-orange-500 pl-4 py-2">
                            <div class="font-medium text-gray-900">${problem.location}</div>
                            <div class="text-sm text-orange-600">${problem.count}건의 메모</div>
                            <div class="text-sm text-gray-600 mt-1">${utils.truncate(problem.issues, 60)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Generate AI summary (template-based for MVP)
     */
    generateAISummary(reportData) {
        const totalDrivers = reportData.length;
        const totalStops = reportData.reduce((sum, d) => sum + d.totalStops, 0);
        const totalCompleted = reportData.reduce((sum, d) => sum + d.completedStops, 0);
        const totalNotes = reportData.reduce((sum, d) => sum + d.notes, 0);
        
        const completionRate = totalStops > 0 ? Math.round((totalCompleted / totalStops) * 100) : 0;

        let summary = `오늘 ${totalDrivers}명의 기사가 총 ${totalStops}개 정차지 중 ${totalCompleted}개를 완료했습니다 (${completionRate}%).`;

        if (completionRate === 100) {
            summary += '\n\n✅ 모든 정차지가 성공적으로 완료되었습니다.';
        } else if (completionRate >= 80) {
            summary += '\n\n✨ 대부분의 정차지가 완료되었으나, 일부 미완료 건이 있습니다.';
        } else {
            summary += '\n\n⚠️ 완료율이 낮습니다. 미완료 건에 대한 조치가 필요합니다.';
        }

        if (totalNotes > 0) {
            summary += `\n\n📝 총 ${totalNotes}건의 메모/이슈가 기록되었습니다. 반복적인 이슈가 있는 위치는 출입 안내를 업데이트하는 것을 권장합니다.`;
        } else {
            summary += '\n\n✅ 특별한 이슈 없이 순조롭게 진행되었습니다.';
        }

        return summary;
    }
};
