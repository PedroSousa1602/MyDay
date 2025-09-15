// ===================================================
//  SISTEMA DE MODAIS (Login / Criar Conta)
// ===================================================
const modalLogin = document.getElementById('modal-login');
const modalCriarConta = document.getElementById('modal-criar-conta');
const mainContent = document.getElementById('main-content');

// Abrir modais
document.getElementById('btn-login').onclick = () => modalLogin.style.display = 'block';
document.getElementById('btn-criar-conta').onclick = () => modalCriarConta.style.display = 'block';

// Fechar modais
document.getElementById('close-login').onclick = () => modalLogin.style.display = 'none';
document.getElementById('close-criar-conta').onclick = () => modalCriarConta.style.display = 'none';

// Link dentro do login para criar conta
document.getElementById('link-criar-conta').onclick = (e) => {
  e.preventDefault();
  modalLogin.style.display = 'none';
  modalCriarConta.style.display = 'block';
};

// ===================================================
//  GESTÃO DE CONTAS (LocalStorage)
// ===================================================
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUser(email, senha) {
  const users = getUsers();
  users.push({ email, senha });
  localStorage.setItem('users', JSON.stringify(users));
}

function validateUser(email, senha) {
  return getUsers().some(user => user.email === email && user.senha === senha);
}

// Registrar nova conta
document.getElementById('form-criar-conta').onsubmit = (e) => {
  e.preventDefault();
  const email = document.getElementById('criar-email').value;
  const senha = document.getElementById('criar-senha').value;

  saveUser(email, senha);
  notify.success("Conta criada", "A tua conta foi criada com sucesso!");
  modalCriarConta.style.display = 'none';
  modalLogin.style.display = 'block';
};

// Login
document.getElementById('form-login').onsubmit = (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-senha').value;

  if (validateUser(email, senha)) {
    modalLogin.style.display = 'none';
    mainContent.style.display = 'block';
    document.querySelector('#main-content nav').style.display = 'none';
    notify.success("Login bem-sucedido");
  } else {
    notify.error("Email ou senha incorretos.");
  }
};

// ===================================================
//  SISTEMA DE NOTIFICAÇÕES (Toasts)
// ===================================================
(function () {
  const container = document.querySelector('.toast-container');

  function createToast({ title = '', message = '', type = 'info', duration = 4000 }) {
    const toast = document.createElement('div');
    toast.className = 'toast variant-' + type;
    toast.setAttribute('role', 'status');

    toast.innerHTML = `
      <div class="icon">${
        type === 'success' ? '✔️' :
        type === 'error'   ? '⛔' : '📝'
      }</div>
      <div class="content">
        ${title ? `<div class="title">${title}</div>` : ''}
        <div>${message}</div>
      </div>
    `;

    container.prepend(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => removeToast(toast), duration);
  }

  function removeToast(toast) {
    if (!toast) return;
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 200);
  }

  window.notify = {
    success: (t, m) => createToast({ title: t, message: m, type: 'success' }),
    info:    (t, m) => createToast({ title: t, message: m, type: 'info' }),
    error:   (t, m) => createToast({ title: t, message: m, type: 'error' })
  };
})();

// ===================================================
//  BLOCO DE NOTAS (LocalStorage)
// ===================================================
const blocoNotas = document.getElementById("blocoNotas");
const btnSalvar = document.getElementById("btn-salvar");
const btnLimpar = document.getElementById("btn-limpar");

if (blocoNotas) {
  blocoNotas.value = localStorage.getItem("blocoNotas") || "";

  btnSalvar.addEventListener("click", () => {
    localStorage.setItem("blocoNotas", blocoNotas.value);
    notify.success("As tuas notas foram guardadas.");
  });

  btnLimpar.addEventListener("click", () => {
    blocoNotas.value = "";
    localStorage.removeItem("blocoNotas");
    notify.info("O bloco de notas foi limpo.");
  });
}

// ===================================================
//  QUADRO DE PRIORIDADES (Drag & Drop + LocalStorage)
// ===================================================
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const targetColumn = ev.target.closest('.column');
  if (targetColumn) targetColumn.appendChild(document.getElementById(data));
  salvarQuadro();
}

function salvarQuadro() {
  const quadro = { alta: [], media: [], baixa: [] };

  ['alta', 'media', 'baixa'].forEach(id => {
    document.querySelectorAll(`#${id} .task span`).forEach(span => {
      quadro[id].push(span.textContent);
    });
  });

  localStorage.setItem('quadroPrioridades', JSON.stringify(quadro));
}

function carregarQuadro() {
  const quadro = JSON.parse(localStorage.getItem('quadroPrioridades')) || { alta: [], media: [], baixa: [] };

  ['alta', 'media', 'baixa'].forEach(id => {
    quadro[id].forEach(taskText => addTaskToColumn(id, taskText));
  });
}

function addTaskToColumn(columnId, taskText) {
  const task = document.createElement('div');
  task.className = 'task';
  task.draggable = true;
  task.id = 'task-' + Date.now();

  const span = document.createElement('span');
  span.textContent = taskText;

  const removeBtn = createButton("Remover", () => {
    task.remove();
    notify.info('Tarefa removida do quadro');
    salvarQuadro();
  });

  task.ondragstart = drag;
  task.append(span, removeBtn);

  document.getElementById(columnId).appendChild(task);
  salvarQuadro();
}

carregarQuadro();

// ===================================================
//  LISTA DE TAREFAS (com botão "Adicionar ao Quadro")
// ===================================================
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

if (addBtn) {
  addBtn.addEventListener("click", addTask);
  carregarTarefas();
}

function addTask() {
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  const li = document.createElement("li");
  const span = document.createElement("span");
  span.textContent = taskText;

  const removeBtn = createButton("Remover", () => {
    taskList.removeChild(li);
    notify.info("Tarefa removida");
    salvarTarefas();
  });

  const addToBoardBtn = createButton("Adicionar ao Quadro", () => {
    addTaskToColumn('media', taskText);
    li.remove();
    notify.success("Tarefa adicionada ao quadro");
    salvarTarefas();
  });

  li.append(span, removeBtn, addToBoardBtn);
  taskList.appendChild(li);

  taskInput.value = "";
  taskInput.focus();
  salvarTarefas();
}

function salvarTarefas() {
  const tarefas = [];
  document.querySelectorAll("#taskList li span").forEach(span => tarefas.push(span.textContent));
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function carregarTarefas() {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  tarefas.forEach(texto => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = texto;

    const removeBtn = createButton("Remover", () => {
      taskList.removeChild(li);
      salvarTarefas();
    });

    const addToBoardBtn = createButton("Adicionar ao Quadro", () => {
      addTaskToColumn('media', texto);
      li.remove();
      notify.success("Tarefa adicionada ao quadro");
      salvarTarefas();
    });

    li.append(span, removeBtn, addToBoardBtn);
    taskList.appendChild(li);
  });
}

// ===================================================
//  FUNÇÕES AUXILIARES
// ===================================================
function createButton(text, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.style.marginLeft = "5px";
  btn.addEventListener("click", onClick);
  return btn;
}
