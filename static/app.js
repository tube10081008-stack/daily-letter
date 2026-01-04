// 전역 상태
let currentUser = null;
let emotionChart = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadDashboard();
  initializeMoodSelector();
});

// 인증 확인
async function checkAuth() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    currentUser = data.user;
    document.getElementById('userName').textContent = currentUser.username || currentUser.email;
  } catch (error) {
    console.error('인증 실패:', error);
    localStorage.clear();
    window.location.href = '/login.html';
  }
}

// 대시보드 데이터 로드
async function loadDashboard() {
  try {
    await Promise.all([
      loadStats(),
      loadEmotionChart(),
      loadPhrases(),
      loadRecentDiaries()
    ]);
  } catch (error) {
    console.error('대시보드 로드 실패:', error);
  }
}

// 통계 로드
async function loadStats() {
  const token = localStorage.getItem('token');
  
  try {
    // 일기 개수
    const diariesResponse = await fetch('/api/diary/recent?limit=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const diariesData = await diariesResponse.json();
    document.getElementById('diaryCount').textContent = diariesData.entries?.length || 0;
    document.getElementById('letterCount').textContent = diariesData.entries?.filter(d => d.sent_at).length || 0;

    // 명언 개수
    const phrasesResponse = await fetch('/api/phrases', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const phrasesData = await phrasesResponse.json();
    document.getElementById('phraseCount').textContent = phrasesData.phrases?.length || 0;
  } catch (error) {
    console.error('통계 로드 실패:', error);
  }
}

// 감정 차트 로드
async function loadEmotionChart() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/diary/recent?limit=30', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    const entries = data.entries || [];

    // 최근 7일 감정 집계
    const emotionCounts = {};
    const emotionColors = {
      '행복함': '#48bb78',
      '평온함': '#4299e1',
      '우울함': '#9ca3af',
      '설렘': '#ed64a6',
      '피곤함': '#a0aec0',
      '화남': '#f56565',
      '고민중': '#ed8936',
      '신남': '#ecc94b',
      '불안함': '#9f7aea'
    };

    entries.slice(0, 7).forEach(entry => {
      const mood = entry.mood || '기록 안 함';
      emotionCounts[mood] = (emotionCounts[mood] || 0) + 1;
    });

    const ctx = document.getElementById('emotionChart');
    if (emotionChart) {
      emotionChart.destroy();
    }

    emotionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(emotionCounts),
        datasets: [{
          data: Object.values(emotionCounts),
          backgroundColor: Object.keys(emotionCounts).map(mood => emotionColors[mood] || '#cbd5e0'),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 14,
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI"'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed + '회';
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('차트 로드 실패:', error);
  }
}

// 명언 로드
async function loadPhrases() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/phrases', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    const phrases = data.phrases || [];

    const grid = document.getElementById('phrasesGrid');
    
    if (phrases.length === 0) {
      grid.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 40px;">아직 저장한 명언이 없습니다. 첫 명언을 추가해보세요! 💭</p>';
      return;
    }

    grid.innerHTML = phrases.map(phrase => `
      <div class="phrase-card">
        <button class="phrase-delete" onclick="deletePhrase(${phrase.id})" title="삭제">×</button>
        <div class="phrase-content">"${phrase.content}"</div>
        <div class="phrase-author">— ${phrase.author || '작자미상'}</div>
      </div>
    `).join('');
  } catch (error) {
    console.error('명언 로드 실패:', error);
  }
}

// 최근 일기 로드
async function loadRecentDiaries() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/diary/recent?limit=5', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    const entries = data.entries || [];

    const timeline = document.getElementById('recentDiaries');
    
    if (entries.length === 0) {
      timeline.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 40px;">아직 작성한 일기가 없습니다. 오늘 하루를 기록해보세요! ✍️</p>';
      return;
    }

    timeline.innerHTML = entries.map(entry => {
      const date = new Date(entry.created_at);
      const dateStr = date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
      
      return `
        <div class="timeline-item">
          <div class="timeline-date">
            📅 ${dateStr}
            ${entry.mood ? `<span class="timeline-mood">${entry.mood}</span>` : ''}
            ${entry.sent_at ? '<span class="timeline-mood" style="background: rgba(72, 187, 120, 0.1); color: #48bb78;">💌 편지 발송됨</span>' : ''}
          </div>
          <div class="timeline-content">${entry.content.substring(0, 200)}${entry.content.length > 200 ? '...' : ''}</div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('일기 로드 실패:', error);
  }
}

// 기분 선택기 초기화
function initializeMoodSelector() {
  const moodButtons = document.querySelectorAll('.mood-btn');
  
  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      moodButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('selectedMood').value = btn.dataset.mood;
    });
  });
}

// 일기 저장
async function saveDiary() {
  const content = document.getElementById('diaryContent').value.trim();
  const mood = document.getElementById('selectedMood').value;
  
  if (!content) {
    alert('일기 내용을 입력해주세요!');
    return;
  }

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/diary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content, mood: mood || null })
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ 일기가 저장되었습니다!\n편지는 내일 오전 7시에 전송됩니다 💌');
      document.getElementById('diaryContent').value = '';
      document.getElementById('selectedMood').value = '';
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
      
      // 대시보드 새로고침
      await loadDashboard();
    } else {
      throw new Error(data.error || '저장 실패');
    }
  } catch (error) {
    console.error('일기 저장 실패:', error);
    alert('❌ 일기 저장에 실패했습니다: ' + error.message);
  }
}

// 명언 추가 모달
function showAddPhraseModal() {
  document.getElementById('addPhraseModal').style.display = 'block';
}

function closeAddPhraseModal() {
  document.getElementById('addPhraseModal').style.display = 'none';
  document.getElementById('newPhraseContent').value = '';
  document.getElementById('newPhraseAuthor').value = '';
}

// 명언 추가
async function addPhrase() {
  const content = document.getElementById('newPhraseContent').value.trim();
  const author = document.getElementById('newPhraseAuthor').value.trim();
  
  if (!content) {
    alert('명언 내용을 입력해주세요!');
    return;
  }

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/phrases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content, author: author || null })
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ 명언이 추가되었습니다!');
      closeAddPhraseModal();
      await loadPhrases();
      await loadStats();
    } else {
      throw new Error(data.error || '추가 실패');
    }
  } catch (error) {
    console.error('명언 추가 실패:', error);
    alert('❌ 명언 추가에 실패했습니다: ' + error.message);
  }
}

// 명언 삭제
async function deletePhrase(id) {
  if (!confirm('이 명언을 삭제하시겠습니까?')) {
    return;
  }

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`/api/phrases/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      alert('✅ 명언이 삭제되었습니다.');
      await loadPhrases();
      await loadStats();
    } else {
      throw new Error('삭제 실패');
    }
  } catch (error) {
    console.error('명언 삭제 실패:', error);
    alert('❌ 명언 삭제에 실패했습니다: ' + error.message);
  }
}

// 로그아웃
function logout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    localStorage.clear();
    window.location.href = '/login.html';
  }
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
  const modal = document.getElementById('addPhraseModal');
  if (event.target === modal) {
    closeAddPhraseModal();
  }
}
