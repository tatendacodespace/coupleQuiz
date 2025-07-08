// --- MODE HANDLING ---
const modeCreateBtn = document.getElementById('modeCreate');
const modeQuizBtn = document.getElementById('modeQuiz');
let mode = 'quiz'; // 'quiz' or 'create'

// --- LOCAL STORAGE ---
const LS_KEY = 'coupleQuizQuestions';
function saveQuestionsToLS(qs) {
  localStorage.setItem(LS_KEY, JSON.stringify(qs));
}
function loadQuestionsFromLS() {
  const data = localStorage.getItem(LS_KEY);
  if (!data) return null;
  try { return JSON.parse(data); } catch { return null; }
}

// --- QUESTION DATA ---
let questions = loadQuestionsFromLS() || [];

const quizForm = document.getElementById('quizForm');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('resultText');
const playAgainBtn = document.getElementById('playAgain');
const confettiCanvas = document.getElementById('confettiCanvas');

let currentQuestion = 0;
let userAnswers = [];

function renderQuestion(idx) {
  quizForm.innerHTML = '';
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

function getScore(formData) {
  let score = 0;
  questions.forEach((q, i) => {
    if (parseInt(formData.get(`q${i}`)) === q.answer) score++;
  });
  return score;
}

function showResult(score) {
  let msg = '', emoji = '';
  if (score === 5) {
    msg = "Soulmates 💖";
    emoji = "💖🥰💍";
  } else if (score >= 3) {
    msg = "You're doing great 🫶";
    emoji = "🫶😊💗";
  } else {
    msg = "Do you even know their middle name? 😅";
    emoji = "😅🤔💔";
  }
  resultText.innerHTML = `<span class="text-pink-500">${score}/5</span> — ${msg} <span class="text-2xl">${emoji}</span>`;
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

// Confetti animation (simple, lightweight)
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

// Initial render
renderQuestion(0);

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

// --- MODE TOGGLE ---
modeCreateBtn.addEventListener('click', () => {
  mode = 'create';
  renderCreate();
  modeCreateBtn.classList.add('bg-pink-400','text-white');
  modeQuizBtn.classList.remove('bg-purple-400','text-white');
});
modeQuizBtn.addEventListener('click', () => {
  mode = 'quiz';
  renderQuestion(0);
  modeQuizBtn.classList.add('bg-purple-400','text-white');
  modeCreateBtn.classList.remove('bg-pink-400','text-white');
});

// --- CREATE MODE ---
function renderCreate() {
  quizForm.innerHTML = '';
  // List existing questions
  questions.forEach((q, i) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'mb-4 w-full bg-pink-50 rounded-xl p-4 shadow flex flex-col gap-2 relative';
    qDiv.innerHTML = `
      <div class="font-bold text-pink-600">${i+1}. ${q.q}</div>
      <ul class="list-disc ml-6 text-sm text-gray-700">
        ${q.options.map((opt, j) => `<li${j===q.answer?' class=\'font-bold text-purple-500\'':''}>${opt}${j===q.answer?' <span class=\'text-xs\'>(correct)</span>':''}</li>`).join('')}
      </ul>
      <div class="flex gap-2 mt-2">
        <button data-edit="${i}" class="editQ bg-purple-100 text-purple-500 px-2 py-1 rounded text-xs font-bold hover:bg-purple-200">Edit</button>
        <button data-del="${i}" class="delQ bg-red-100 text-red-500 px-2 py-1 rounded text-xs font-bold hover:bg-red-200">Delete</button>
      </div>
    `;
    quizForm.appendChild(qDiv);
  });
  // Add new question form
  if (questions.length < 10) {
    const addDiv = document.createElement('div');
    addDiv.className = 'w-full bg-white bg-opacity-80 rounded-xl p-4 shadow flex flex-col gap-2 mt-4';
    addDiv.innerHTML = `
      <form id="addQForm" class="flex flex-col gap-2">
        <input type="text" id="newQ" class="border rounded px-2 py-1" maxlength="80" placeholder="Question (max 80 chars)" required />
        <div class="flex flex-col gap-1">
          <input type="text" class="newOpt border rounded px-2 py-1" maxlength="30" placeholder="Option 1" required />
          <input type="text" class="newOpt border rounded px-2 py-1" maxlength="30" placeholder="Option 2" required />
          <input type="text" class="newOpt border rounded px-2 py-1" maxlength="30" placeholder="Option 3" required />
          <input type="text" class="newOpt border rounded px-2 py-1" maxlength="30" placeholder="Option 4" required />
        </div>
        <label class="text-xs text-gray-500 mt-1">Correct answer:
          <select id="newAns" class="border rounded px-2 py-1 ml-2">
            <option value="0">Option 1</option>
            <option value="1">Option 2</option>
            <option value="2">Option 3</option>
            <option value="3">Option 4</option>
          </select>
        </label>
        <button type="submit" class="bg-pink-400 hover:bg-pink-500 text-white font-bold py-1 px-4 rounded-full mt-2">Add Question</button>
      </form>
    `;
    quizForm.appendChild(addDiv);
    // Add handler
    addDiv.querySelector('#addQForm').onsubmit = function(e) {
      e.preventDefault();
      const q = addDiv.querySelector('#newQ').value.trim();
      const opts = Array.from(addDiv.querySelectorAll('.newOpt')).map(i=>i.value.trim());
      const ans = parseInt(addDiv.querySelector('#newAns').value);
      if (!q || opts.some(o=>!o)) return;
      questions.push({q, options: opts, answer: ans});
      saveQuestionsToLS(questions);
      renderCreate();
    };
  }
  // Edit/delete handlers
  quizForm.querySelectorAll('.delQ').forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(btn.getAttribute('data-del'));
      questions.splice(idx,1);
      saveQuestionsToLS(questions);
      renderCreate();
    };
  });
  quizForm.querySelectorAll('.editQ').forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(btn.getAttribute('data-edit'));
      renderEdit(idx);
    };
  });
}

function renderEdit(idx) {
  const q = questions[idx];
  quizForm.innerHTML = '';
  const editDiv = document.createElement('div');
  editDiv.className = 'w-full bg-white bg-opacity-90 rounded-xl p-4 shadow flex flex-col gap-2';
  editDiv.innerHTML = `
    <form id="editQForm" class="flex flex-col gap-2">
      <input type="text" id="editQ" class="border rounded px-2 py-1" maxlength="80" value="${q.q}" required />
      <div class="flex flex-col gap-1">
        ${q.options.map((opt,j)=>`<input type="text" class="editOpt border rounded px-2 py-1" maxlength="30" value="${opt}" required />`).join('')}
      </div>
      <label class="text-xs text-gray-500 mt-1">Correct answer:
        <select id="editAns" class="border rounded px-2 py-1 ml-2">
          ${q.options.map((_,j)=>`<option value="${j}"${j===q.answer?' selected':''}>Option ${j+1}</option>`).join('')}
        </select>
      </label>
      <div class="flex gap-2 mt-2">
        <button type="submit" class="bg-purple-400 hover:bg-purple-500 text-white font-bold py-1 px-4 rounded-full">Save</button>
        <button id="cancelEdit" class="bg-gray-200 text-gray-600 font-bold py-1 px-4 rounded-full">Cancel</button>
      </div>
    </form>
  `;
  quizForm.appendChild(editDiv);
  editDiv.querySelector('#editQForm').onsubmit = function(e) {
    e.preventDefault();
    const nq = editDiv.querySelector('#editQ').value.trim();
    const nopts = Array.from(editDiv.querySelectorAll('.editOpt')).map(i=>i.value.trim());
    const nans = parseInt(editDiv.querySelector('#editAns').value);
    if (!nq || nopts.some(o=>!o)) return;
    questions[idx] = {q: nq, options: nopts, answer: nans};
    saveQuestionsToLS(questions);
    renderCreate();
  };
  editDiv.querySelector('#cancelEdit').onclick = function(e) {
    e.preventDefault();
    renderCreate();
  };
}
