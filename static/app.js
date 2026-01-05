Copy// Global state
let currentUser = null;
let emotionChart = null;
let selectedMood = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadDashboard();
  initializeMoodSelector();
});

// Auth check
async function checkAuth() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '/static/login.html';
    return;
  }

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      document.getElementById('userName').textContent = currentUser.name || currentUser.username;
    } else {
      localStorage.clear();
      window.location.href = '/static/login.html';
    }
  } catch (error) {
    console.error('Auth error:', error);
    localStorage.clear();
    window.location.href = '/static/login.html';
  }
}

// Load dashboard data
async function loadDashboard() {
  await Promise.all([
    loadStats(),
    loadEmotionChart(),
    loadPhrases(),
    loadRecentDiaries()
  ]);
}

// Load stats
async function loadStats() {
  const token = localStorage.getItem('token');

  try {
    // 일기 통계
    const diaryResponse = await fetch('/api/diary/recent?limit=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const diaryData = await diaryResponse.json();
    
    if (diaryData.success) {
      document.getElementById('diaryCount').textContent = diaryData.entries.length;
      
      // 발송된 편지 수
      const sentCount = diaryData.entries.filter(e => e.sent_at).length;
      document.getElementById('letterCount').textContent = sentCount;
    }

    // 명언 통계
    const phrasesResponse = await fetch('/api/phrases', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const phrasesData = await phrasesResponse.json();
    
    if (phrasesData.success) {
      document.getElementById('phraseCount').textContent = phrasesData.phrases.length;
    }

  } catch (error) {
    console.error('Stats loading error:', error);
  }
}

// Load emotion chart
async function loadEmotionChart() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/diary/recent?limit=30', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success) {
      const moodCounts = {};
      const moodColors = {
        '행복함': '#48bb78',
        '평온함': '#4299e1',
        '슬픔': '#a0aec0',
        '감사함': '#ed8936',
        '흥분됨': '#f56565',
        '피곤함': '#805ad5',
        '화남': '#e53e3e',
        '불안함': '#ecc94b',
        '기대됨': '#38b2ac'
      };

      data.entries.forEach(entry => {
        if (entry.mood) {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        }
      });

      const ctx = document.getElementById('emotionChart');
      
      if (emotionChart) {
        emotionChart.destroy();
      }

      emotionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(moodCounts),
          datasets: [{
            data: Object.values(moodCounts),
            backgroundColor: Object.keys(moodCounts).map(mood => moodColors[mood] || '#cbd5e0'),
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
                  size: 13,
                  family: 'Noto Sans KR'
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.parsed}회`;
                }
              }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Emotion chart loading error:', error);
  }
}

// Load phrases
async function loadPhrases() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/phrases', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success) {
      const grid = document.getElementById('phrasesGrid');
      
      if (data.phrases.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full text-center py-12 text-gray-500">
            <p class="text-lg mb-4">💭 아직 저장된 명언이 없습니다</p>
            <p class="text-sm">마음에 드는 명언을 추가해보세요!</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = data.phrases.map(phrase => `
        <div class="phrase-card">
          <button class="phrase-delete" onclick="deletePhrase(${phrase.id})">✕</button>
          <div class="phrase-content">"${phrase.content}"</div>
          <div class="phrase-author">— ${phrase.author || '작자미상'}</div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Phrases loading error:', error);
  }
}

// Load recent diaries
async function loadRecentDiaries() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/diary/recent?limit=5', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success) {
      const timeline = document.getElementById('recentDiaries');
      
      if (data.entries.length === 0) {
        timeline.innerHTML = `
          <div class="text-center py-12 text-gray-500">
            <p class="text-lg mb-4">📝 아직 작성된 일기가 없습니다</p>
            <p class="text-sm">오늘의 일기를 작성해보세요!</p>
          </div>
        `;
        return;
      }

      timeline.innerHTML = data.entries.map(entry => {
        const date = new Date(entry.created_at);
        const dateStr = date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const preview = entry.content.length > 200 
          ? entry.content.substring(0, 200) + '...' 
          : entry.content;

        return `
          <div class="timeline-item">
            <div class="timeline-date">
              ${dateStr}
              ${entry.mood ? `<span class="timeline-mood">${entry.mood}</span>` : ''}
              ${entry.sent_at ? `<span class="timeline-sent">✉️ 발송완료</span>` : ''}
            </div>
            <div class="timeline-content">${preview}</div>
          </div>
        `;
      }).join('');
    }
  } catch (error) {
    console.error('Recent diaries loading error:', error);
  }
}

// Initialize mood selector
function initializeMoodSelector() {
  const buttons = document.querySelectorAll('.mood-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMood = btn.dataset.mood;
    });
  });
}

// Save diary
async function saveDiary(event) {
  event.preventDefault();
  
  const token = localStorage.getItem('token');
  const content = document.getElementById('diaryContent').value;

  if (!token) {
    alert('로그인이 필요합니다.');
    window.location.href = '/static/login.html';
    return;
  }

  if (!content.trim()) {
    alert('일기 내용을 입력해주세요.');
    return;
  }

  try {
    const response = await fetch('/api/diary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content: content.trim(),
        mood: selectedMood
      })
    });

    const data = await response.json();

    if (data.success) {
      alert('✅ 일기가 저장되었습니다!');
      document.getElementById('diaryContent').value = '';
      selectedMood = null;
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
      
      // 대시보드 새로고침
      await loadDashboard();
    } else {
      alert(`오류: ${data.error || '일기 저장에 실패했습니다.'}`);
    }
  } catch (error) {
    console.error('Diary save error:', error);
    alert(`일기 저장 중 오류: ${error.message}`);
  }
}

// Modal functions
function openAddPhraseModal() {
  document.getElementById('addPhraseModal').classList.add('active');
}

function closeAddPhraseModal() {
  document.getElementById('addPhraseModal').classList.remove('active');
  document.getElementById('newPhraseContent').value = '';
  document.getElementById('newPhraseAuthor').value = '';
}

function closeModalOnOutside(event) {
  if (event.target.classList.contains('modal')) {
    closeAddPhraseModal();
  }
}

// Add phrase
async function addPhrase(event) {
  event.preventDefault();
  
  const token = localStorage.getItem('token');
  const content = document.getElementById('newPhraseContent').value;
  const author = document.getElementById('newPhraseAuthor').value;

  try {
    const response = await fetch('/api/phrases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content, author })
    });

    const data = await response.json();

    if (data.success) {
      alert('✅ 명언이 추가되었습니다!');
      closeAddPhraseModal();
      await loadPhrases();
      await loadStats();
    } else {
      alert(data.error || '명언 추가에 실패했습니다.');
    }
  } catch (error) {
    console.error('Phrase add error:', error);
    alert('명언 추가 중 오류가 발생했습니다.');
  }
}

// Delete phrase
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

    const data = await response.json();

    if (data.success) {
      await loadPhrases();
      await loadStats();
    } else {
      alert(data.error || '명언 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('Phrase delete error:', error);
    alert('명언 삭제 중 오류가 발생했습니다.');
  }
}

// Logout
function logout() {
  if (confirm('로그아웃 하시겠습니까?')) {
    localStorage.clear();
    window.location.href = '/static/login.html';
  }
}
