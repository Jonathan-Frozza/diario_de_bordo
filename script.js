const STORAGE_KEY = 'diario_de_bordo_entries_v1';
const form = document.getElementById('entryForm');
const titleInput = document.getElementById('title');
const dateInput = document.getElementById('date');
const descInput = document.getElementById('description');
const entriesList = document.getElementById('entriesList');
const clearBtn = document.getElementById('clearBtn');
const btnInstall = document.getElementById('btnInstall');
let deferredPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall.classList.remove('hidden');
});

btnInstall.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  btnInstall.classList.add('hidden');
});

function saveEntries(entries){localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));}
function loadEntries(){return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');}

function render(){
  const entries = loadEntries();
  entriesList.innerHTML = '';
  if(entries.length === 0){
    entriesList.innerHTML = '<li class="entry"><div class="meta"><h3>Nenhuma entrada</h3></div></li>';
    return;
  }
  entries.slice().reverse().forEach(entry => {
    const li = document.createElement('li');
    li.className = 'entry';
    const meta = document.createElement('div');
    meta.className = 'meta';
    const h3 = document.createElement('h3');
    h3.textContent = entry.title;
    const p = document.createElement('p');
    p.textContent = entry.description;
    const t = document.createElement('time');
    t.textContent = new Date(entry.date).toLocaleDateString();
    meta.append(h3, p, t);
    const del = document.createElement('button');
    del.textContent = 'Remover';
    del.onclick = () => removeEntry(entry.id);
    li.append(meta, del);
    entriesList.append(li);
  });
}

function addEntry(title, date, description){
  const entries = loadEntries();
  entries.push({ id: Date.now().toString(), title, date, description });
  saveEntries(entries);
  render();
}

function removeEntry(id){
  const entries = loadEntries().filter(e => e.id !== id);
  saveEntries(entries);
  render();
}

form.onsubmit = e => {
  e.preventDefault();
  addEntry(titleInput.value.trim(), dateInput.value, descInput.value.trim());
  form.reset();
};

clearBtn.onclick = () => form.reset();
if(!dateInput.value){dateInput.value = new Date().toISOString().slice(0,10);}
render();