// quiz.js - Handles quiz taking for Couple Quiz
const LS_KEY = 'coupleQuizQuestions';
const quizForm = document.getElementById('quizForm');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('resultText');
const playAgainBtn = document.getElementById('playAgain');
const confettiCanvas = document.getElementById('confettiCanvas');

function loadQuestionsFromLS() {
  const data = localStorage.getItem(LS_KEY);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
}

function getQuestionsFromUrlOrLS() {
  const urlParams = new URLSearchParams(window.location.search);
  const qParam = urlParams.get('q');
  if (qParam) {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(qParam))));
    } catch { return []; }
  }
  return loadQuestionsFromLS();
}

let questions = getQuestionsFromUrlOrLS();
let currentQuestion = 0;
let userAnswers = [];

function renderQuestion(idx) {
  quizForm.innerHTML = '';
  if (!questions.length) {
    quizForm.innerHTML = `<div class="text-center text-pink-500 font-bold text-lg mb-4">No questions found.<br><a href="create.html" class="underline text-purple-500">Add some first!</a></div>
    <form id='importForm' class='flex flex-col gap-2 items-center mt-4'>
      <label class='text-xs text-gray-500'>Paste a quiz code:
        <textarea id='importCode' rows='2' class='w-full border rounded px-2 py-1 bg-white text-xs font-mono' placeholder='Paste code here'></textarea>
      </label>
      <button type='submit' class='bg-purple-400 hover:bg-purple-500 text-white font-bold py-1 px-4 rounded-full'>Import Quiz</button>
    </form>`;
    const importForm = document.getElementById('importForm');
    if (importForm) {
      importForm.onsubmit = function(e) {
        e.preventDefault();
        const code = document.getElementById('importCode').value.trim();
        if (!code) return;
        try {
          questions = JSON.parse(decodeURIComponent(escape(atob(code))));
          renderQuestion(0);
        } catch {
          alert('Invalid code!');
        }
      };
    }
    return;
  }
  const q = questions[idx];
  const qDiv = document.createElement('div');
  qDiv.className = 'mb-2 animate-fade-in';
  qDiv.innerHTML = `
    <div class="text-2xl md:text-3xl font-bold text-pink-600 mb-4 text-center drop-shadow-lg">${q.q}</div>
    <div class="flex flex-col gap-4">
      ${q.options.map((opt, j) => `
        <label class="flex items-center gap-3 cursor-pointer bg-white bg-opacity-70 rounded-xl px-4 py-3 shadow-md hover:scale-105 transition-transform border-2 border-transparent hover:border-pink-300">
          <input type="radio" name="q${idx}" value="${j}" class="accent-pink-400 scale-125" required />
          <span class="text-lg md:text-xl">${opt}</span>
        </label>
      `).join('')}
    </div>
  `;
  quizForm.appendChild(qDiv);
  const nextBtn = document.createElement('button');
  nextBtn.type = 'submit';
  nextBtn.className = 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-8 rounded-full transition-all duration-200 shadow-xl mt-8 text-lg tracking-wide';
  nextBtn.textContent = idx === questions.length - 1 ? 'See Results!' : 'Next →';
  quizForm.appendChild(nextBtn);
  // Progress bar
  const progress = document.createElement('div');
  progress.className = 'w-full h-3 bg-pink-100 rounded-full mt-6 mb-2 overflow-hidden';
  progress.innerHTML = `<div class="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500" style="width: ${(100*(idx+1)/questions.length)}%"></div>`;
  quizForm.prepend(progress);
}

function showResult(score) {
  let msg = '', emoji = '';
  if (score === questions.length) {
    msg = "Soulmates 💖";
    emoji = "💖🥰💍";
  } else if (score >= Math.ceil(questions.length*0.6)) {
    msg = "You're doing great 🫶";
    emoji = "🫶😊💗";
  } else {
    msg = "Do you even know their middle name? 😅";
    emoji = "😅🤔💔";
  }
  resultText.innerHTML = `<span class="text-pink-500">${score}/${questions.length}</span> — ${msg} <span class="text-2xl">${emoji}</span>`;
  // Share Results Button
  let shareBtn = document.getElementById('shareResultsBtn');
  if (!shareBtn) {
    shareBtn = document.createElement('button');
    shareBtn.id = 'shareResultsBtn';
    shareBtn.className = 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2 px-6 rounded-full transition-all duration-200 shadow text-sm mt-4';
    shareBtn.textContent = 'Share Results';
    resultDiv.appendChild(shareBtn);
  }
  shareBtn.onclick = async function() {
    const summary = `I scored ${score}/${questions.length} on your Couple Quiz!`;
    let details = '';
    questions.forEach((q, i) => {
      details += `\n${i+1}. ${q.q}\nMy answer: ${q.options[userAnswers[i]] ?? '—'}`;
    });
    const shareText = summary + '\n' + details;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Couple Quiz Results',
          text: shareText
        });
      } catch (e) {
        alert('Sharing cancelled or failed.');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        shareBtn.textContent = 'Results Copied!';
        setTimeout(()=>shareBtn.textContent='Share Results', 1500);
      } catch {
        prompt('Copy your results:', shareText);
      }
    }
  };
  resultDiv.classList.remove('hidden');
  quizForm.classList.add('hidden');
  confettiCanvas.classList.remove('hidden');
  launchConfetti();
}

quizForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(quizForm);
  const answer = formData.get(`q${currentQuestion}`);
  if (answer === null) return;
  userAnswers[currentQuestion] = parseInt(answer);
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion(currentQuestion);
  } else {
    const score = userAnswers.reduce((acc, ans, i) => acc + (ans === questions[i].answer ? 1 : 0), 0);
    showResult(score);
  }
});

playAgainBtn.addEventListener('click', function() {
  resultDiv.classList.add('hidden');
  quizForm.classList.remove('hidden');
  confettiCanvas.classList.add('hidden');
  currentQuestion = 0;
  userAnswers = [];
  renderQuestion(0);
});

function launchConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  const W = window.innerWidth, H = window.innerHeight;
  confettiCanvas.width = W;
  confettiCanvas.height = H;
  let pieces = [];
  for (let i = 0; i < 80; i++) {
    pieces.push({
      x: Math.random() * W,
      y: Math.random() * -H,
      r: 6 + Math.random() * 8,
      d: 2 + Math.random() * 2,
      color: ["#f9a8d4", "#f3e8ff", "#a78bfa", "#f472b6", "#fef3c7"][Math.floor(Math.random()*5)],
      tilt: Math.random() * 10 - 5
    });
  }
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    pieces.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    update();
    frame++;
    if (frame < 120) requestAnimationFrame(draw);
    else confettiCanvas.classList.add('hidden');
  }
  function update() {
    pieces.forEach(p => {
      p.y += p.d + Math.random()*2;
      p.x += Math.sin(frame/10 + p.tilt) * 1.5;
      if (p.y > H) p.y = Math.random() * -20;
    });
  }
  draw();
}

// Add fade-in animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.7s cubic-bezier(.4,2,.6,1) both;
}
`;
document.head.appendChild(style);

renderQuestion(0);
