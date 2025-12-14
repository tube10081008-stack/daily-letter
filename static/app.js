// API Base URL
const API_BASE = '/api';

// Load phrases on page load
document.addEventListener('DOMContentLoaded', () => {
  loadPhrases();
});

// Diary Form Submission
document.getElementById('diaryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const content = document.getElementById('diaryContent').value;
  const mood = document.getElementById('diaryMood').value;
  
  try {
    const response = await fetch(`${API_BASE}/diary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, mood })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showMessage('diaryMessage', '✅ ' + data.message, 'success');
      document.getElementById('diaryForm').reset();
    } else {
      showMessage('diaryMessage', '❌ ' + data.error, 'error');
    }
  } catch (error) {
    showMessage('diaryMessage', '❌ 서버 연결 실패', 'error');
  }
});

// Phrase Form Submission
document.getElementById('phraseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const content = document.getElementById('phraseContent').value;
  const author = document.getElementById('phraseAuthor').value;
  
  try {
    const response = await fetch(`${API_BASE}/phrases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, author })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      document.getElementById('phraseForm').reset();
      loadPhrases();
    } else {
      alert('❌ ' + data.error);
    }
  } catch (error) {
    alert('❌ 서버 연결 실패');
  }
});

// Load Phrases
async function loadPhrases() {
  try {
    const response = await fetch(`${API_BASE}/phrases`);
    const data = await response.json();
    
    const phrasesList = document.getElementById('phrasesList');
    phrasesList.innerHTML = '';
    
    if (data.phrases.length === 0) {
      phrasesList.innerHTML = '<p class="text-gray-500 text-center">아직 추가된 문장이 없습니다</p>';
      return;
    }
    
    data.phrases.forEach(phrase => {
      const div = document.createElement('div');
      div.className = 'bg-gray-50 p-4 rounded-lg border border-gray-200 relative';
      div.innerHTML = `
        <p class="text-gray-800 font-medium mb-1">"${phrase.content}"</p>
        ${phrase.author ? `<p class="text-sm text-gray-600">- ${phrase.author}</p>` : ''}
        <button 
          onclick="deletePhrase(${phrase.id})"
          class="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl"
        >
          ×
        </button>
      `;
      phrasesList.appendChild(div);
    });
  } catch (error) {
    console.error('Failed to load phrases:', error);
  }
}

// Delete Phrase
async function deletePhrase(id) {
  if (!confirm('이 문장을 삭제하시겠습니까?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/phrases/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      loadPhrases();
    } else {
      alert('❌ 삭제 실패');
    }
  } catch (error) {
    alert('❌ 서버 연결 실패');
  }
}

// Show Message Helper
function showMessage(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `mt-4 p-3 rounded-lg ${
    type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }`;
  element.classList.remove('hidden');
  
  setTimeout(() => {
    element.classList.add('hidden');
  }, 5000);
}