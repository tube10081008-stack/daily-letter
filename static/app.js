// 로그인 상태 확인
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
  window.location.href = '/login.html';
}

console.log('로그인된 사용자:', user);

// 로그아웃 함수
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

// 일기 저장
document.getElementById('diaryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const content = document.getElementById('content').value;
  const mood = document.getElementById('mood').value;

  try {
    const response = await fetch('/api/diary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content, mood })
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ ' + data.message);
      document.getElementById('content').value = '';
    } else {
      alert('❌ ' + (data.error || '저장 실패'));
    }
  } catch (error) {
    alert('❌ 서버 연결 실패');
  }
});

// 명언 추가
document.getElementById('phraseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const content = document.getElementById('phraseContent').value;
  const author = document.getElementById('phraseAuthor').value;

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

    if (response.ok) {
      alert('✅ ' + data.message);
      document.getElementById('phraseContent').value = '';
      document.getElementById('phraseAuthor').value = '';
      loadPhrases();
    } else {
      alert('❌ ' + (data.error || '추가 실패'));
    }
  } catch (error) {
    alert('❌ 서버 연결 실패');
  }
});

// 명언 목록 로드
async function loadPhrases() {
  try {
    const response = await fetch('/api/phrases', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      const list = document.getElementById('phrasesList');
      list.innerHTML = '';

      data.phrases.forEach(phrase => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${phrase.content}</strong>
          <span>- ${phrase.author || '작자미상'}</span>
          <button onclick="deletePhrase(${phrase.id})">삭제</button>
        `;
        list.appendChild(li);
      });
    }
  } catch (error) {
    console.error('명언 로드 실패:', error);
  }
}

// 명언 삭제
async function deletePhrase(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    const response = await fetch(`/api/phrases/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ ' + data.message);
      loadPhrases();
    } else {
      alert('❌ ' + (data.error || '삭제 실패'));
    }
  } catch (error) {
    alert('❌ 서버 연결 실패');
  }
}

// 페이지 로드 시 명언 목록 로드
loadPhrases();