// ---------------------------
// Abrir e fechar modais
// ---------------------------
document.getElementById('btn-login').onclick = function() {
  document.getElementById('modal-login').style.display = 'block';
};
document.getElementById('btn-criar-conta').onclick = function() {
  document.getElementById('modal-criar-conta').style.display = 'block';
};
document.getElementById('close-login').onclick = function() {
  document.getElementById('modal-login').style.display = 'none';
};
document.getElementById('close-criar-conta').onclick = function() {
  document.getElementById('modal-criar-conta').style.display = 'none';
};

// Link "Criar conta" no modal de login
document.getElementById('link-criar-conta').onclick = function(e) {
  e.preventDefault();
  document.getElementById('modal-login').style.display = 'none';
  document.getElementById('modal-criar-conta').style.display = 'block';
};

// ---------------------------
// Simulação de contas (LocalStorage)
// ---------------------------
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function saveUser(email, senha) {
  const users = getUsers();
  users.push({ email, senha });
  localStorage.setItem('users', JSON.stringify(users));
}
function validateUser(email, senha) {
  const users = getUsers();
  return users.some(user => user.email === email && user.senha === senha);
}

// Registrar nova conta
document.getElementById('form-criar-conta').onsubmit = function(e) {
  e.preventDefault();
  const email = document.getElementById('criar-email').value;
  const senha = document.getElementById('criar-senha').value;
  saveUser(email, senha);
  notify.success("Conta criada", "A tua conta foi criada com sucesso!");
  document.getElementById('modal-criar-conta').style.display = 'none';
  document.getElementById('modal-login').style.display = 'block';
};

// Login
document.getElementById('form-login').onsubmit = function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-senha').value;
  if (validateUser(email, senha)) {
    document.getElementById('modal-login').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.querySelector('#main-content nav').style.display = 'none';
    notify.success("Login bem-sucedido");
  } else {
    notify.error("Email ou senha incorretos.");
  } 
};

// ---------------------------
// Sistema de Notificações
// ---------------------------
(function () {
  const container = document.querySelector('.toast-container');

  function createToast({title = '', message = '', type = 'info', duration = 4000}) {
    const toast = document.createElement('div');
    toast.className = 'toast variant-' + type;
    toast.setAttribute('role','status');

    toast.innerHTML = `
      <div class="icon">${
        type === 'success' ? '✔️' :
        type === 'error' ? '⛔' : '📝'
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
    success: (t,m)=>createToast({title:t,message:m,type:'success'}),
    info: (t,m)=>createToast({title:t,message:m,type:'info'}),
    error: (t,m)=>createToast({title:t,message:m,type:'error'})
  };
})();

// ---------------------------
// Bloco de Notas
// ---------------------------
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

// ---------------------------
// Quadro de Prioridades (Drag & Drop)
// ---------------------------
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
}

// Salvar o estado do quadro
function salvarQuadro() {
  const quadro = {
    alta: [],
    media: [],
    baixa: []
  };

  ['alta', 'media', 'baixa'].forEach(id => {
    document.querySelectorAll(`#${id} .task span`).forEach(span => {
      quadro[id].push(span.textContent);
    });
  });

  localStorage.setItem('quadroPrioridades', JSON.stringify(quadro));
}

// Carregar o estado do quadro
function carregarQuadro() {
  const quadro = JSON.parse(localStorage.getItem('quadroPrioridades')) || { alta: [], media: [], baixa: [] };

  ['alta', 'media', 'baixa'].forEach(id => {
    quadro[id].forEach(taskText => addTaskToColumn(id, taskText));
  });
}

// Atualizar addTaskToColumn para salvar após adicionar/remover
function addTaskToColumn(columnId, taskText) {
  const task = document.createElement('div');
  task.className = 'task';
  task.draggable = true;
  task.id = 'task-' + Date.now();

  const span = document.createElement('span');
  span.textContent = taskText;

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remover';
  removeBtn.style.marginLeft = '5px';
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    task.remove();
    notify.info('Tarefa removida do quadro');
    salvarQuadro();
  });

  task.ondragstart = drag;

  task.appendChild(span);
  task.appendChild(removeBtn);

  document.getElementById(columnId).appendChild(task);

  salvarQuadro(); // Salvar sempre que uma tarefa é adicionada
}

// Chamar ao carregar a página
carregarQuadro();
// ---------------------------
// Sistema de Tarefas com botão "Adicionar ao Quadro"
// ---------------------------
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

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remover";
  removeBtn.addEventListener("click", () => {
    taskList.removeChild(li);
    notify.info("Tarefa removida");
    salvarTarefas();
  });

  const addToBoardBtn = document.createElement("button");
  addToBoardBtn.textContent = "Adicionar ao Quadro";
  addToBoardBtn.style.marginLeft = "5px";
  addToBoardBtn.addEventListener("click", () => {
    addTaskToColumn('media', taskText);
    li.remove();
    notify.success("Tarefa adicionada ao quadro");
    salvarTarefas();
  });

  li.appendChild(span);
  li.appendChild(removeBtn);
  li.appendChild(addToBoardBtn);

  taskList.appendChild(li);
  taskInput.value = "";
  taskInput.focus();

  salvarTarefas();
}

function salvarTarefas() {
  const tarefas = [];
  document.querySelectorAll("#taskList li span").forEach(span => {
    tarefas.push(span.textContent);
  });
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function carregarTarefas() {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  tarefas.forEach(texto => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = texto;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remover";
    removeBtn.addEventListener("click", () => {
      taskList.removeChild(li);
      salvarTarefas();
    });

    const addToBoardBtn = document.createElement("button");
    addToBoardBtn.textContent = "Adicionar ao Quadro";
    addToBoardBtn.style.marginLeft = "5px";
    addToBoardBtn.addEventListener("click", () => {
      addTaskToColumn('media', texto);
      li.remove();
      notify.success("Tarefa adicionada ao quadro");
      salvarTarefas();
    });

    li.appendChild(span);
    li.appendChild(removeBtn);
    li.appendChild(addToBoardBtn);

    taskList.appendChild(li);
  });
}
