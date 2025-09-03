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
    document.querySelector('#main-content nav').style.display = 'none'; // Oculta os botões
    notify.success("Login bem-sucedido");
  } else {
    notify.error("Email ou senha incorretos.");
  } 
};

// ---------------------------
// Bloco de Notas
// ---------------------------
const blocoNotas = document.getElementById("blocoNotas");
const btnSalvar = document.getElementById("btn-salvar");
const btnLimpar = document.getElementById("btn-limpar");

// Carregar notas salvas
if (blocoNotas) {
  blocoNotas.value = localStorage.getItem("blocoNotas") || "";

  // Botão Salvar
  btnSalvar.addEventListener("click", () => {
    localStorage.setItem("blocoNotas", blocoNotas.value);
    notify.success("As tuas notas foram guardadas.");
  });

  // Botão Limpar
  btnLimpar.addEventListener("click", () => {
    blocoNotas.value = "";
    localStorage.removeItem("blocoNotas");
    notify.info("O bloco de notas foi limpo.");
  });
}



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

// -------- SISTEMA DE TAREFAS --------
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

if (addBtn) {
  addBtn.addEventListener("click", addTask);
  carregarTarefas();
}

function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === "") return;

  const li = document.createElement("li");
  li.textContent = taskText;
  notify.info("Tarefa adicionada");

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remover";
  removeBtn.addEventListener("click", () => {
    taskList.removeChild(li);
    notify.info("Tarefa removida");
    salvarTarefas();
  });

  li.appendChild(removeBtn);
  taskList.appendChild(li);

  taskInput.value = "";
  taskInput.focus();

  salvarTarefas();
}

function salvarTarefas() {
  const tarefas = [];
  document.querySelectorAll("#taskList li").forEach(li => {
    tarefas.push(li.firstChild.textContent);
  });
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function carregarTarefas() {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  tarefas.forEach(texto => {
    const li = document.createElement("li");
    li.textContent = texto;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remover";
    removeBtn.addEventListener("click", () => {
      taskList.removeChild(li);
      salvarTarefas();
    });

    li.appendChild(removeBtn);
    taskList.appendChild(li);
  });
}

