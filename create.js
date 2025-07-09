// create.js - Handles question creation, editing, and deletion for Couple Quiz
const LS_KEY = 'coupleQuizQuestions';
const quizForm = document.getElementById('quizForm');

function saveQuestionsToLS(qs) {
  localStorage.setItem(LS_KEY, JSON.stringify(qs));
}
function loadQuestionsFromLS() {
  const data = localStorage.getItem(LS_KEY);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
}

let questions = loadQuestionsFromLS();

function renderCreate() {
  quizForm.innerHTML = '';
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
  // --- SHARE/EXPORT ---
  if (questions.length > 0) {
    const shareDiv = document.createElement('div');
    shareDiv.className = 'w-full bg-purple-50 rounded-xl p-4 shadow flex flex-col gap-2 mt-4';
    // Shareable link
    const baseUrl = window.location.origin + window.location.pathname.replace('create.html','quiz.html');
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(questions)))));
    const shareUrl = `${baseUrl}?q=${encoded}`;
    shareDiv.innerHTML = `
      <div class="font-bold text-purple-600 mb-1">Share this quiz:</div>
      <div class="flex flex-col gap-2">
        <label class="text-xs text-gray-500">Shareable Link:
          <input type="text" readonly value="${shareUrl}" class="w-full border rounded px-2 py-1 bg-white text-xs font-mono" onclick="this.select()" />
        </label>
        <label class="text-xs text-gray-500">Or Copy Code:
          <textarea readonly rows="2" class="w-full border rounded px-2 py-1 bg-white text-xs font-mono" onclick="this.select()">${encoded}</textarea>
        </label>
      </div>
      <div class="text-xs text-gray-400 mt-1">Send the link or code to your partner. They can open the link or paste the code on the quiz page.</div>
    `;
    quizForm.appendChild(shareDiv);
  }
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

renderCreate();
