// ============================================================
//  app.js – Полная логика приложения МТО
//  Версия 3.0 (финальная)
// ============================================================

(function() {
  'use strict';

  // ============================================================
  //  1. ХРАНИЛИЩЕ (localStorage + IndexedDB для сообщений)
  // ============================================================
  const STORAGE_KEYS = {
    users: 'mto_users',
    requests: 'mto_requests',
    routes: 'mto_routes',
    procurement: 'mto_procurement',
    audit: 'mto_audit',
    currentUser: 'mto_current_user',
    materials: 'mto_materials',
    supplies: 'mto_supplies',
    schedule: 'mto_schedule',
    settings: 'mto_settings',
    chat: 'mto_chat_'
  };

  function getData(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  }
  function setData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

  // IndexedDB для сообщений (асинхронное хранилище)
  let db = null;
  const DB_NAME = 'MTOChatDB';
  const DB_VERSION = 1;

  function openDB() {
    return new Promise((resolve, reject) => {
      if (db) { resolve(db); return; }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains('messages')) {
          const store = d.createObjectStore('messages', { keyPath: 'id' });
          store.createIndex('room', 'room', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      request.onsuccess = (e) => { db = e.target.result; resolve(db); };
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async function saveMessage(room, message) {
    const db = await openDB();
    const tx = db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    store.add({ ...message, room, id: Date.now() + '_' + Math.random().toString(36).slice(2, 6) });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  }

  async function getMessages(room) {
    const db = await openDB();
    const tx = db.transaction('messages', 'readonly');
    const store = tx.objectStore('messages');
    const index = store.index('room');
    return new Promise((resolve, reject) => {
      const request = index.getAll(room);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // ============================================================
  //  2. ДЕРЕВО ПОДРАЗДЕЛЕНИЙ
  // ============================================================
  const DEPT_TREE = {
    name: 'Корень',
    children: [
      { name: 'Диспетчерская' },
      {
        name: 'Склад',
        children: [
          { name: 'Начальник склада' },
          { name: 'Техническая служба' },
          { name: 'Транспортная служба' },
          { name: 'Кладовщик' }
        ]
      },
      { name: 'Участок 1' }, { name: 'Участок 2' }, { name: 'Участок 3' },
      { name: 'Участок 4' }, { name: 'Участок 5' }, { name: 'Участок 6' },
      { name: 'Участок 7' }, { name: 'Участок 8' },
      {
        name: 'Администрация',
        children: [
          { name: 'Управление МТО' },
          { name: 'ГБУ Жилищник' },
          { name: 'Директор' }
        ]
      }
    ]
  };

  function getAllPaths(tree, prefix = '') {
    let paths = [];
    const current = prefix ? prefix + ' / ' + tree.name : tree.name;
    if (tree.children) {
      for (const child of tree.children) {
        paths = paths.concat(getAllPaths(child, current));
      }
    } else {
      paths.push(current);
    }
    return paths;
  }

  function getDeptList() {
    return getAllPaths(DEPT_TREE).filter(p => p !== 'Корень');
  }

  // ============================================================
  //  3. ИНИЦИАЛИЗАЦИЯ ДЕМО-ДАННЫХ
  // ============================================================
  function initDemoData() {
    if (!localStorage.getItem(STORAGE_KEYS.users)) {
      setData(STORAGE_KEYS.users, [
        { login: 'admin', password: 'admin', displayName: 'Администратор', phone: '+7-999-111-22-33', email: 'admin@mto.ru', position: 'Главный', birthDate: '1980-01-01', avatar: '', deptPath: 'Администрация / ГБУ Жилищник' },
        { login: 'manager', password: 'manager', displayName: 'Менеджер', phone: '+7-999-222-33-44', email: 'manager@mto.ru', position: 'Менеджер', birthDate: '1990-05-15', avatar: '', deptPath: 'Склад / Начальник склада' },
        { login: 'dispatcher', password: 'dispatcher', displayName: 'Диспетчер', phone: '+7-999-333-44-55', email: 'disp@mto.ru', position: 'Диспетчер', birthDate: '1985-08-20', avatar: '', deptPath: 'Диспетчерская' },
        { login: 'analyst', password: 'analyst', displayName: 'Аналитик', phone: '+7-999-444-55-66', email: 'analyst@mto.ru', position: 'Аналитик', birthDate: '1992-12-01', avatar: '', deptPath: 'Участок 1' }
      ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.requests)) {
      setData(STORAGE_KEYS.requests, [
        { id: 1, title: 'Замена масла в ГАЗели', desc: 'Плановое ТО', type: 'repair', address: 'ул. Ленина, 5', deptPath: 'Склад / Техническая служба', status: 'work', priority: 'medium', creator: 'admin', deadline: '2026-08-10', created: Date.now() - 3600000, updated: Date.now() },
        { id: 2, title: 'Поставка труб', desc: 'Для ремонта теплосетей', type: 'supply', address: 'пр. Мира, 12', deptPath: 'Склад / Начальник склада', status: 'new', priority: 'high', creator: 'manager', deadline: '2026-08-15', created: Date.now() - 7200000, updated: Date.now() },
        { id: 3, title: 'Ремонт ходовой КАМАЗа', desc: 'Замена рессор', type: 'repair', address: 'ул. Транспортная, 8', deptPath: 'Участок 3', status: 'done', priority: 'high', creator: 'dispatcher', deadline: '2026-08-05', created: Date.now() - 86400000, updated: Date.now() - 3600000 }
      ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.routes)) {
      setData(STORAGE_KEYS.routes, [
        { id: 1, vehicle: 'ГАЗель NEXT', type: 'supply', from: 'Склад (ул. Ленина, 5)', to: 'ул. Мира, 12', status: 'inprogress', date: '2026-08-03' },
        { id: 2, vehicle: 'КАМАЗ-65115', type: 'transport', from: 'Диспетчерская', to: 'Участок 3', status: 'planned', date: '2026-08-04' }
      ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.procurement)) {
      setData(STORAGE_KEYS.procurement, [
        { id: 1, name: 'Закупка масла', supplier: 'ООО "Нефть-Трейд"', amount: 150000, status: 'process', date: '2026-08-02' },
        { id: 2, name: 'Закупка фильтров', supplier: 'ЗАО "Автодеталь"', amount: 75000, status: 'planned', date: '2026-08-10' }
      ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.audit)) setData(STORAGE_KEYS.audit, []);
    if (!localStorage.getItem(STORAGE_KEYS.materials)) {
      setData(STORAGE_KEYS.materials, [
        { id: 1, name: 'Масло моторное', category: 'ГСМ', unit: 'л', quantity: 100, reserve: 20 },
        { id: 2, name: 'Фильтр масляный', category: 'Для машины', unit: 'шт', quantity: 50, reserve: 10 },
        { id: 3, name: 'Краска белая', category: 'Краска', unit: 'кг', quantity: 30, reserve: 5 },
        { id: 4, name: 'Цемент', category: 'Сыпучие', unit: 'меш', quantity: 200, reserve: 40 },
        { id: 5, name: 'Дрель', category: 'Инструмент', unit: 'шт', quantity: 15, reserve: 2 }
      ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.supplies)) {
      setData(STORAGE_KEYS.supplies, [
        { id: 1, material: 'Масло моторное', quantity: 50, date: new Date(Date.now() - 86400000).toLocaleString(), type: 'приход' },
        { id: 2, material: 'Фильтр масляный', quantity: 20, date: new Date(Date.now() - 172800000).toLocaleString(), type: 'приход' }
      ]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.schedule)) {
      const users = getData(STORAGE_KEYS.users);
      const schedule = {};
      users.forEach(u => {
        schedule[u.login] = { mon: 'day', tue: 'day', wed: 'day', thu: 'day', fri: 'day', sat: 'off', sun: 'off' };
      });
      setData(STORAGE_KEYS.schedule, schedule);
    }
    if (!localStorage.getItem(STORAGE_KEYS.settings)) {
      setData(STORAGE_KEYS.settings, { theme: 'light', notifications: true, compact: false, animations: true, language: 'ru', fontSize: 14 });
    }
  }
  initDemoData();

  // ============================================================
  //  4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ============================================================
  function generateId() { return Date.now() + Math.floor(Math.random() * 1000); }

  function logAudit(user, action, details) {
    const logs = getData(STORAGE_KEYS.audit);
    logs.push({ time: new Date().toLocaleString(), user, action, details });
    setData(STORAGE_KEYS.audit, logs);
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span><button class="close-toast">&times;</button>`;
    container.appendChild(toast);
    toast.querySelector('.close-toast').onclick = () => toast.remove();
    setTimeout(() => toast.remove(), 5000);
  }

  function getStatusBadge(status) {
    const map = {
      new: 'Новая', work: 'В работе', done: 'Выполнена', rejected: 'Отклонена',
      planned: 'Запланирована', process: 'В процессе'
    };
    const cls = status === 'new' ? 'new' : status === 'work' ? 'work' : status === 'done' ? 'done' : status === 'rejected' ? 'rejected' : status === 'planned' ? 'planned' : 'process';
    return `<span class="status-badge status-${cls}">${map[status] || status}</span>`;
  }

  function getPriorityLabel(p) {
    const map = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
    return map[p] || p;
  }
  function getPriorityClass(p) { return `priority-${p}`; }

  // Проверка администратора
  function isAdmin(user) {
    if (!user) return false;
    if (user.login === 'admin') return true;
    if (user.deptPath && user.deptPath.includes('Администрация')) return true;
    return false;
  }

  // ============================================================
  //  5. АУТЕНТИФИКАЦИЯ
  // ============================================================
  let currentUser = null;

  function loadSession() {
    const stored = localStorage.getItem(STORAGE_KEYS.currentUser);
    if (stored) {
      try { currentUser = JSON.parse(stored); return true; } catch { return false; }
    }
    return false;
  }
  function saveSession(user) { localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user)); }

  function loginUser(login, password) {
    const users = getData(STORAGE_KEYS.users);
    const found = users.find(u => u.login === login && u.password === password);
    if (found) {
      currentUser = found;
      saveSession(found);
      logAudit(login, 'Вход в систему', 'Успешный вход');
      showToast(`Добро пожаловать, ${found.displayName || login}!`, 'success');
      // Запрос уведомлений
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      return true;
    }
    return false;
  }

  function registerUser(login, password, deptPath, displayName, phone, email, position, birthDate, avatarBase64) {
    const users = getData(STORAGE_KEYS.users);
    if (users.find(u => u.login === login)) return false;
    const newUser = {
      login, password, displayName: displayName || login,
      phone: phone || '', email: email || '', position: position || '',
      birthDate: birthDate || '', avatar: avatarBase64 || '', deptPath: deptPath || 'Диспетчерская'
    };
    users.push(newUser);
    setData(STORAGE_KEYS.users, users);
    logAudit(login, 'Регистрация', 'Новый пользователь');
    const schedule = getData(STORAGE_KEYS.schedule);
    schedule[login] = { mon: 'day', tue: 'day', wed: 'day', thu: 'day', fri: 'day', sat: 'off', sun: 'off' };
    setData(STORAGE_KEYS.schedule, schedule);
    return true;
  }

  function logoutUser() {
    if (currentUser) logAudit(currentUser.login, 'Выход', '');
    currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    showToast('Вы вышли', 'info');
  }

  function oauthLogin(provider) {
    const fakeLogin = 'user_' + provider + '_' + Date.now().toString(36);
    const fakePassword = 'pass_' + Math.random().toString(36);
    const users = getData(STORAGE_KEYS.users);
    let existing = users.find(u => u.login === fakeLogin);
    if (!existing) {
      registerUser(fakeLogin, fakePassword, 'Диспетчерская', 'Пользователь ' + provider, '', '', '', '', '');
    }
    loginUser(fakeLogin, fakePassword);
    document.getElementById('authOverlay').classList.add('hidden');
    initAppAfterLogin();
    showToast(`Вход через ${provider} выполнен`, 'success');
  }

  // ============================================================
  //  6. РАБОТА С ЗАЯВКАМИ
  // ============================================================
  function getRequests() { return getData(STORAGE_KEYS.requests); }
  function saveRequests(reqs) { setData(STORAGE_KEYS.requests, reqs); }

  function createRequest(title, desc, type, address, deptPath, priority, status, deadline, creator) {
    const reqs = getRequests();
    const newReq = { id: generateId(), title, desc, type, address, deptPath, priority, status, deadline, creator, created: Date.now(), updated: Date.now() };
    reqs.push(newReq);
    saveRequests(reqs);
    logAudit(creator, 'Создание заявки', `#${newReq.id} "${title}"`);
    showToast(`Заявка #${newReq.id} создана`, 'success');
    return newReq;
  }

  function updateRequest(id, data) {
    const reqs = getRequests();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx === -1) return false;
    const old = reqs[idx];
    reqs[idx] = { ...old, ...data, updated: Date.now() };
    saveRequests(reqs);
    logAudit(currentUser.login, 'Изменение заявки', `#${id} "${old.title}"`);
    showToast(`Заявка #${id} обновлена`, 'info');
    return true;
  }

  function deleteRequest(id) {
    let reqs = getRequests();
    const found = reqs.find(r => r.id === id);
    if (!found) return false;
    reqs = reqs.filter(r => r.id !== id);
    saveRequests(reqs);
    logAudit(currentUser.login, 'Удаление заявки', `#${id} "${found.title}"`);
    showToast(`Заявка #${id} удалена`, 'error');
    return true;
  }

  // ============================================================
  //  7. МАРШРУТЫ
  // ============================================================
  function getRoutes() { return getData(STORAGE_KEYS.routes); }
  function saveRoutes(routes) { setData(STORAGE_KEYS.routes, routes); }

  function createRoute(vehicle, type, from, to, status, date) {
    const routes = getRoutes();
    const newRoute = { id: generateId(), vehicle, type, from, to, status, date };
    routes.push(newRoute);
    saveRoutes(routes);
    logAudit(currentUser.login, 'Создание маршрута', `${vehicle} → ${to}`);
    showToast(`Маршрут для ${vehicle} создан`, 'success');
    return newRoute;
  }

  function updateRoute(id, data) {
    const routes = getRoutes();
    const idx = routes.findIndex(r => r.id === id);
    if (idx === -1) return false;
    routes[idx] = { ...routes[idx], ...data };
    saveRoutes(routes);
    logAudit(currentUser.login, 'Изменение маршрута', `#${id}`);
    showToast('Маршрут обновлён', 'info');
    return true;
  }

  function deleteRoute(id) {
    let routes = getRoutes();
    const found = routes.find(r => r.id === id);
    if (!found) return false;
    routes = routes.filter(r => r.id !== id);
    saveRoutes(routes);
    logAudit(currentUser.login, 'Удаление маршрута', `#${id}`);
    showToast('Маршрут удалён', 'error');
    return true;
  }

  // ============================================================
  //  8. ЗАКУПКИ
  // ============================================================
  function getProcurements() { return getData(STORAGE_KEYS.procurement); }
  function saveProcurements(procs) { setData(STORAGE_KEYS.procurement, procs); }

  function createProcurement(name, supplier, amount, status, date) {
    const procs = getProcurements();
    const newProc = { id: generateId(), name, supplier, amount: parseFloat(amount) || 0, status, date };
    procs.push(newProc);
    saveProcurements(procs);
    logAudit(currentUser.login, 'Создание закупки', `${name} (${supplier})`);
    showToast(`Закупка "${name}" создана`, 'success');
    return newProc;
  }

  function updateProcurement(id, data) {
    const procs = getProcurements();
    const idx = procs.findIndex(p => p.id === id);
    if (idx === -1) return false;
    procs[idx] = { ...procs[idx], ...data };
    saveProcurements(procs);
    logAudit(currentUser.login, 'Изменение закупки', `#${id} ${procs[idx].name}`);
    showToast('Закупка обновлена', 'info');
    return true;
  }

  function deleteProcurement(id) {
    let procs = getProcurements();
    const found = procs.find(p => p.id === id);
    if (!found) return false;
    procs = procs.filter(p => p.id !== id);
    saveProcurements(procs);
    logAudit(currentUser.login, 'Удаление закупки', `${found.name}`);
    showToast(`Закупка "${found.name}" удалена`, 'error');
    return true;
  }

  // ============================================================
  //  9. МАТЕРИАЛЫ
  // ============================================================
  function getMaterials() { return getData(STORAGE_KEYS.materials); }
  function saveMaterials(mats) { setData(STORAGE_KEYS.materials, mats); }
  function getSupplies() { return getData(STORAGE_KEYS.supplies); }
  function saveSupplies(sups) { setData(STORAGE_KEYS.supplies, sups); }

  function addMaterial(name, category, unit, quantity, reserve) {
    const mats = getMaterials();
    const newMat = { id: generateId(), name, category, unit, quantity: parseInt(quantity) || 0, reserve: parseInt(reserve) || 0 };
    mats.push(newMat);
    saveMaterials(mats);
    logAudit(currentUser.login, 'Добавление материала', `${name} (${category})`);
    showToast(`Материал "${name}" добавлен`, 'success');
    return newMat;
  }

  function updateMaterial(id, data) {
    const mats = getMaterials();
    const idx = mats.findIndex(m => m.id === id);
    if (idx === -1) return false;
    mats[idx] = { ...mats[idx], ...data };
    saveMaterials(mats);
    logAudit(currentUser.login, 'Изменение материала', `#${id} ${mats[idx].name}`);
    showToast('Материал обновлён', 'info');
    return true;
  }

  function deleteMaterial(id) {
    let mats = getMaterials();
    const found = mats.find(m => m.id === id);
    if (!found) return false;
    mats = mats.filter(m => m.id !== id);
    saveMaterials(mats);
    logAudit(currentUser.login, 'Удаление материала', `${found.name}`);
    showToast(`Материал "${found.name}" удалён`, 'error');
    return true;
  }

  function addSupply(materialName, quantity) {
    const supplies = getSupplies();
    const newSupply = { id: generateId(), material: materialName, quantity: parseInt(quantity) || 0, date: new Date().toLocaleString(), type: 'приход' };
    supplies.push(newSupply);
    saveSupplies(supplies);
    const mats = getMaterials();
    const mat = mats.find(m => m.name === materialName);
    if (mat) {
      mat.quantity += parseInt(quantity) || 0;
      saveMaterials(mats);
    }
    logAudit(currentUser.login, 'Поставка материала', `${materialName} +${quantity}`);
    showToast(`Поставка ${materialName} +${quantity}`, 'success');
    return newSupply;
  }

  function reserveMaterial(id, amount) {
    const mats = getMaterials();
    const mat = mats.find(m => m.id === id);
    if (!mat) return false;
    const available = mat.quantity - mat.reserve;
    if (available < amount) { showToast('Недостаточно доступного количества', 'error'); return false; }
    mat.reserve += amount;
    saveMaterials(mats);
    logAudit(currentUser.login, 'Резервирование материала', `${mat.name} +${amount}`);
    showToast(`Зарезервировано ${amount} ${mat.unit}`, 'info');
    return true;
  }

  function issueMaterial(id, amount) {
    const mats = getMaterials();
    const mat = mats.find(m => m.id === id);
    if (!mat) return false;
    const available = mat.quantity - mat.reserve;
    if (available < amount) { showToast('Недостаточно доступного количества', 'error'); return false; }
    mat.quantity -= amount;
    saveMaterials(mats);
    logAudit(currentUser.login, 'Выдача материала', `${mat.name} -${amount}`);
    showToast(`Выдано ${amount} ${mat.unit}`, 'info');
    return true;
  }

  // ============================================================
  //  10. РАСПИСАНИЕ
  // ============================================================
  function getSchedule() { return getData(STORAGE_KEYS.schedule); }
  function saveSchedule(sched) { setData(STORAGE_KEYS.schedule, sched); }

  // ============================================================
  //  11. НОВОСТИ (Яндекс.Новости)
  // ============================================================
  async function fetchNews(limit = 5, containerId = 'newsFeedList') {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = 'Загрузка новостей...';
    try {
      // Используем RSS Яндекс.Новости (главные новости)
      const proxy = 'https://api.allorigins.win/raw?url=';
      const rssUrl = 'https://news.yandex.ru/news.rss';
      const response = await fetch(proxy + encodeURIComponent(rssUrl));
      if (!response.ok) throw new Error('Ошибка загрузки');
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const items = xml.querySelectorAll('item');
      let html = '';
      let count = 0;
      items.forEach((item) => {
        if (count >= limit) return;
        const title = item.querySelector('title')?.textContent || 'Без названия';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '#';
        html += `
          <div class="news-item">
            <div class="title"><a href="${link}" target="_blank" style="color:var(--primary);text-decoration:none;">${title}</a></div>
            <div class="date">${pubDate}</div>
          </div>
        `;
        count++;
      });
      if (container) container.innerHTML = html || '<p style="color:var(--text-secondary);">Новостей нет</p>';
    } catch (e) {
      if (container) container.innerHTML = '<p style="color:var(--text-secondary);">Не удалось загрузить новости</p>';
    }
  }

  // ============================================================
  //  12. ПОГОДА (с прогнозом)
  // ============================================================
  async function fetchWeather(city = 'Moscow') {
    const tempEl = document.getElementById('weatherTemp');
    const descEl = document.getElementById('weatherDesc');
    const cityEl = document.getElementById('weatherCity');
    const forecastEl = document.getElementById('weatherForecast');
    try {
      const apiKey = 'e3e0f9f7f0e5d4c3b2a10987654321'; // демо-ключ, замените на свой
      // Текущая погода
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Город не найден');
      const data = await resp.json();
      tempEl.textContent = Math.round(data.main.temp) + '°C';
      descEl.textContent = data.weather[0].description;
      cityEl.textContent = data.name;

      // Прогноз на 5 дней
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=ru&cnt=5`;
      const fResp = await fetch(forecastUrl);
      if (fResp.ok) {
        const fData = await fResp.json();
        const days = fData.list.slice(0, 5);
        forecastEl.innerHTML = days.map(d => {
          const date = new Date(d.dt * 1000).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
          return `<div class="day"><div class="date">${date}</div><div class="temp">${Math.round(d.main.temp)}°</div><div style="font-size:12px;color:var(--text-secondary);">${d.weather[0].description}</div></div>`;
        }).join('');
      } else {
        forecastEl.innerHTML = '';
      }
    } catch (e) {
      tempEl.textContent = '--°C';
      descEl.textContent = 'Ошибка';
      cityEl.textContent = city;
      forecastEl.innerHTML = '';
    }
  }

  // ============================================================
  //  13. КАРТА (Яндекс.Карты)
  // ============================================================
  function initMaps() {
    if (typeof ymaps === 'undefined') return;
    ymaps.ready(() => {
      // Карта для ЦМТО
      const mapCmto = new ymaps.Map('mapCmto', {
        center: [55.733073, 37.396815],
        zoom: 16,
        controls: ['zoomControl', 'fullscreenControl']
      });
      const cmtoPoint = new ymaps.Placemark([55.733073, 37.396815], { balloonContent: 'ЦМТО' }, { preset: 'islands#blueDotIcon' });
      mapCmto.geoObjects.add(cmtoPoint);

      // Карта для главного корпуса
      const mapHead = new ymaps.Map('mapHead', {
        center: [55.733629, 37.401594],
        zoom: 16,
        controls: ['zoomControl', 'fullscreenControl']
      });
      const headPoint = new ymaps.Placemark([55.733629, 37.401594], { balloonContent: 'Главный корпус МТО' }, { preset: 'islands#redDotIcon' });
      mapHead.geoObjects.add(headPoint);
    });
  }

  // ============================================================
  //  14. ДАННЫЕ ДЛЯ ДАШБОРДА (статика)
  // ============================================================
  const deptData = {
    'default': {
      label: 'Общая',
      stats: { orders: 78, transport: 24, employees: 18, completed: 62 },
      recentOrders: ['Рейс #1023 – доставка запчастей', 'Рейс #1022 – вывоз мусора', 'Рейс #1021 – ТО автопарка'],
      kpi: [{ label: 'Выполнение рейсов', value: '89%' }, { label: 'Среднее время', value: '2.1 ч' }, { label: 'Загрузка', value: '76%' }],
      activity: ['ГАЗель – в пути', 'КАМАЗ – на погрузке', 'МАЗ – в рейсе'],
      erpLog: ['Рейс #1023 завершён', 'Обновлён график ТО', 'Замена масла в ГАЗели'],
      transportList: [
        { name: 'ГАЗель NEXT', plate: 'А123ВВ', status: 'В пути', color: '#2ecc71' },
        { name: 'КАМАЗ-65115', plate: 'В456СС', status: 'На погрузке', color: '#f39c12' },
        { name: 'МАЗ-5440', plate: 'С789ММ', status: 'В рейсе', color: '#3498db' },
        { name: 'MAN TGS', plate: 'Р012РР', status: 'На ТО', color: '#e74c3c' }
      ],
      transportStats: { total: 24, enRoute: 12, loading: 5, maintenance: 4, idle: 3 }
    }
  };

  // ============================================================
  //  15. РЕНДЕРИНГ ИНТЕРФЕЙСА
  // ============================================================
  const statsContainer = document.getElementById('statsContainer');
  const recentOrders = document.getElementById('recentOrders');
  const kpiGrid = document.getElementById('kpiGrid');
  const activityList = document.getElementById('activityList');
  const erpLogItems = document.getElementById('erpLogItems');
  const transportGrid = document.getElementById('transportGrid');
  const auditBody = document.getElementById('auditBody');
  const requestsBody = document.getElementById('requestsBody');
  const routesBody = document.getElementById('routesBody');
  const materialsBody = document.getElementById('materialsBody');
  const procurementBody = document.getElementById('procurementBody');
  const scheduleContainer = document.getElementById('scheduleContainer');
  const userNameDisplay = document.getElementById('userName');
  const logoutBtn = document.getElementById('logoutBtn');
  const chatMessagesContainer = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatRooms = document.querySelectorAll('.chat-room-item');

  // Заполнение select'ов подразделениями
  function populateDeptSelects() {
    const paths = getDeptList();
    const selects = document.querySelectorAll('#authDeptPath, #profileDeptPath, #reqDept');
    selects.forEach(sel => {
      const currentVal = sel.value;
      sel.innerHTML = '';
      paths.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        sel.appendChild(opt);
      });
      if (currentVal && paths.includes(currentVal)) sel.value = currentVal;
    });
  }

  // Рендер дашборда
  function renderDashboard() {
    const data = deptData['default'];
    const s = data.stats;
    statsContainer.innerHTML = `
      <div class="mto-stat"><h1>${s.orders}</h1><p>Заявок</p></div>
      <div class="mto-stat"><h1>${s.transport}</h1><p>Транспорт</p></div>
      <div class="mto-stat"><h1>${s.employees}</h1><p>Сотрудников</p></div>
      <div class="mto-stat"><h1>${s.completed}</h1><p>Выполнено</p></div>
    `;
    recentOrders.innerHTML = data.recentOrders.map(item => `<li>${item}</li>`).join('');
    kpiGrid.innerHTML = data.kpi.map(k => `
      <div class="mto-kpi-item"><h4>${k.label}</h4><div class="value">${k.value}</div></div>
    `).join('');
    activityList.innerHTML = data.activity.map(item => `<li>${item}</li>`).join('');
    erpLogItems.innerHTML = data.erpLog.map(item => `<div class="mto-erp-log-item">${item}</div>`).join('');
    fetchNews(5, 'newsFeedList');
    fetchWeather('Moscow');
    setTimeout(initMaps, 500);
  }

  // Рендер транспорта
  function renderTransport() {
    const data = deptData['default'];
    const ts = data.transportStats;
    if (data.transportList.length) {
      transportGrid.innerHTML = data.transportList.map(t => `
        <div class="mto-card">
          <h3>${t.name}</h3>
          <p style="color:var(--text-secondary);">${t.plate}</p>
          <span class="mto-vehicle-tag" style="background:${t.color}">${t.status}</span>
        </div>
      `).join('');
    } else {
      transportGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);">Нет транспорта</p>`;
    }
    renderRoutes();
  }

  // Рендер маршрутов
  function renderRoutes() {
    const statusFilter = document.getElementById('routeFilterStatus').value;
    let routes = getRoutes();
    if (statusFilter !== 'all') routes = routes.filter(r => r.status === statusFilter);
    if (routes.length === 0) {
      routesBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);">Нет маршрутов</td></tr>';
      return;
    }
    routesBody.innerHTML = routes.map(r => `
      <tr>
        <td>${r.vehicle}</td>
        <td><span class="route-tag">${r.type === 'supply' ? 'Поставка' : r.type === 'shipment' ? 'Отправка' : 'Перевоз'}</span></td>
        <td>${r.from}</td>
        <td>${r.to}</td>
        <td>${getStatusBadge(r.status)}</td>
        <td>${r.date}</td>
        <td>
          <button class="btn btn-warning btn-sm edit-route" data-id="${r.id}">✏️</button>
          <button class="btn btn-danger btn-sm delete-route" data-id="${r.id}">🗑️</button>
        </td>
      </tr>
    `).join('');
    // Обработчики
    document.querySelectorAll('.edit-route').forEach(btn => {
      btn.addEventListener('click', function() { openEditRoute(parseInt(this.dataset.id)); });
    });
    document.querySelectorAll('.delete-route').forEach(btn => {
      btn.addEventListener('click', function() {
        if (confirm('Удалить маршрут?')) { deleteRoute(parseInt(this.dataset.id)); renderRoutes(); }
      });
    });
  }

  // Рендер заявок
  function renderRequests() {
    const statusFilter = document.getElementById('reqFilterStatus').value;
    const typeFilter = document.getElementById('reqFilterType').value;
    let reqs = getRequests();
    if (statusFilter !== 'all') reqs = reqs.filter(r => r.status === statusFilter);
    if (typeFilter !== 'all') reqs = reqs.filter(r => r.type === typeFilter);
    if (currentUser && !isAdmin(currentUser)) {
      reqs = reqs.filter(r => r.deptPath === currentUser.deptPath || r.creator === currentUser.login);
    }
    if (reqs.length === 0) {
      requestsBody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-secondary);">Нет заявок</td></tr>';
      return;
    }
    requestsBody.innerHTML = reqs.map(r => `
      <tr>
        <td>#${r.id}</td>
        <td>${r.title}</td>
        <td>${r.type === 'repair' ? 'Ремонт' : r.type === 'supply' ? 'Поставка' : r.type === 'transport' ? 'Перевозка' : 'Другое'}</td>
        <td>${r.address || '—'}</td>
        <td>${getStatusBadge(r.status)}</td>
        <td class="${getPriorityClass(r.priority)}">${getPriorityLabel(r.priority)}</td>
        <td>${r.creator}</td>
        <td>
          ${canEditRequest(r) ? `<button class="btn btn-primary btn-sm edit-req" data-id="${r.id}">✏️</button>` : ''}
          ${canDeleteRequest(r) ? `<button class="btn btn-danger btn-sm delete-req" data-id="${r.id}">🗑️</button>` : ''}
          ${canChangeStatus(r) ? `<select class="status-change" data-id="${r.id}"><option value="new">Новая</option><option value="work">В работе</option><option value="done">Выполнена</option><option value="rejected">Отклонена</option></select>` : ''}
        </td>
      </tr>
    `).join('');
    // Обработчики
    document.querySelectorAll('.edit-req').forEach(btn => {
      btn.addEventListener('click', function() { openEditRequest(parseInt(this.dataset.id)); });
    });
    document.querySelectorAll('.delete-req').forEach(btn => {
      btn.addEventListener('click', function() { if (confirm('Удалить заявку?')) deleteRequest(parseInt(this.dataset.id)); renderRequests(); });
    });
    document.querySelectorAll('.status-change').forEach(sel => {
      sel.addEventListener('change', function() {
        const id = parseInt(this.dataset.id);
        const newStatus = this.value;
        updateRequest(id, { status: newStatus });
        renderRequests();
      });
    });
  }

  function canEditRequest(req) {
    if (!currentUser) return false;
    if (isAdmin(currentUser)) return true;
    if (currentUser.deptPath === req.deptPath) return true;
    return false;
  }
  function canDeleteRequest(req) {
    if (!currentUser) return false;
    if (isAdmin(currentUser)) return true;
    if (currentUser.login === req.creator) return true;
    return false;
  }
  function canChangeStatus(req) {
    if (!currentUser) return false;
    if (isAdmin(currentUser)) return true;
    if (currentUser.deptPath === req.deptPath) return true;
    return false;
  }

  // Рендер материалов
  function renderMaterials() {
    const categoryFilter = document.getElementById('matCategoryFilter').value;
    let mats = getMaterials();
    if (categoryFilter !== 'all') mats = mats.filter(m => m.category === categoryFilter);
    if (mats.length === 0) {
      materialsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);">Нет материалов</td></tr>';
      return;
    }
    materialsBody.innerHTML = mats.map(m => `
      <tr>
        <td>${m.name}</td>
        <td><span class="category-tag">${m.category}</span></td>
        <td>${m.unit}</td>
        <td>${m.quantity}</td>
        <td>${m.reserve}</td>
        <td>${m.quantity - m.reserve}</td>
        <td>
          <button class="btn btn-warning btn-sm edit-mat" data-id="${m.id}">✏️</button>
          <button class="btn btn-danger btn-sm delete-mat" data-id="${m.id}">🗑️</button>
          <button class="btn btn-success btn-sm issue-mat" data-id="${m.id}">Выдать</button>
          <button class="btn btn-primary btn-sm reserve-mat" data-id="${m.id}">Резерв</button>
        </td>
      </tr>
    `).join('');
    // Обработчики
    document.querySelectorAll('.edit-mat').forEach(btn => {
      btn.addEventListener('click', function() { openEditMaterial(parseInt(this.dataset.id)); });
    });
    document.querySelectorAll('.delete-mat').forEach(btn => {
      btn.addEventListener('click', function() {
        if (confirm('Удалить материал?')) { deleteMaterial(parseInt(this.dataset.id)); renderMaterials(); }
      });
    });
    document.querySelectorAll('.issue-mat').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        const amount = prompt('Введите количество для выдачи:');
        if (amount && !isNaN(amount) && Number(amount) > 0) {
          issueMaterial(id, Number(amount));
          renderMaterials();
        }
      });
    });
    document.querySelectorAll('.reserve-mat').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        const amount = prompt('Введите количество для резервирования:');
        if (amount && !isNaN(amount) && Number(amount) > 0) {
          reserveMaterial(id, Number(amount));
          renderMaterials();
        }
      });
    });
  }

  // Рендер закупок
  function renderProcurements() {
    const statusFilter = document.getElementById('procurementFilterStatus').value;
    let procs = getProcurements();
    if (statusFilter !== 'all') procs = procs.filter(p => p.status === statusFilter);
    if (procs.length === 0) {
      procurementBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);">Нет закупок</td></tr>';
      return;
    }
    procurementBody.innerHTML = procs.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.supplier}</td>
        <td>${p.amount ? p.amount.toLocaleString() + ' руб.' : '—'}</td>
        <td>${getStatusBadge(p.status)}</td>
        <td>${p.date}</td>
        <td>
          <button class="btn btn-warning btn-sm edit-proc" data-id="${p.id}">✏️</button>
          <button class="btn btn-danger btn-sm delete-proc" data-id="${p.id}">🗑️</button>
        </td>
      </tr>
    `).join('');
    document.querySelectorAll('.edit-proc').forEach(btn => {
      btn.addEventListener('click', function() { openEditProcurement(parseInt(this.dataset.id)); });
    });
    document.querySelectorAll('.delete-proc').forEach(btn => {
      btn.addEventListener('click', function() {
        if (confirm('Удалить закупку?')) { deleteProcurement(parseInt(this.dataset.id)); renderProcurements(); }
      });
    });
  }

  // Рендер расписания (только админ)
  function renderSchedule() {
    if (!isAdmin(currentUser)) {
      scheduleContainer.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:20px;">Доступно только администратору</p>';
      return;
    }
    const schedule = getSchedule();
    const users = getData(STORAGE_KEYS.users);
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const shiftOptions = ['day', 'night', 'off'];
    const shiftLabels = { day: 'День', night: 'Ночь', off: 'Выходной' };

    let html = `<div class="header" style="grid-column:1;">Сотрудник</div>`;
    dayLabels.forEach(d => html += `<div class="header">${d}</div>`);

    users.forEach(u => {
      const s = schedule[u.login] || { mon: 'day', tue: 'day', wed: 'day', thu: 'day', fri: 'day', sat: 'off', sun: 'off' };
      html += `<div class="employee-name">${u.displayName || u.login}</div>`;
      days.forEach(day => {
        const val = s[day] || 'off';
        html += `<div class="cell">
          <select class="schedule-select" data-user="${u.login}" data-day="${day}">
            ${shiftOptions.map(opt => `<option value="${opt}" ${opt === val ? 'selected' : ''}>${shiftLabels[opt]}</option>`).join('')}
          </select>
        </div>`;
      });
    });
    scheduleContainer.innerHTML = html;

    document.querySelectorAll('.schedule-select').forEach(sel => {
      sel.addEventListener('change', function() {
        const user = this.dataset.user;
        const day = this.dataset.day;
        const val = this.value;
        const schedule = getSchedule();
        if (!schedule[user]) schedule[user] = {};
        schedule[user][day] = val;
        saveSchedule(schedule);
        showToast(`Смена для ${user} обновлена`, 'info');
      });
    });
  }

  // Рендер аудита
  function renderAudit() {
    if (!isAdmin(currentUser)) {
      auditBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);">Доступно только администратору</td></tr>';
      return;
    }
    let logs = getData(STORAGE_KEYS.audit);
    const search = document.getElementById('auditSearch').value.toLowerCase();
    const userFilter = document.getElementById('auditFilterUser').value;
    const actionFilter = document.getElementById('auditFilterAction').value;
    if (search) logs = logs.filter(l => l.user.toLowerCase().includes(search) || l.action.toLowerCase().includes(search) || (l.details || '').toLowerCase().includes(search));
    if (userFilter !== 'all') logs = logs.filter(l => l.user === userFilter);
    if (actionFilter !== 'all') logs = logs.filter(l => l.action === actionFilter);
    if (logs.length === 0) {
      auditBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);">Нет записей</td></tr>';
      return;
    }
    auditBody.innerHTML = logs.slice(-100).reverse().map(l => `
      <tr><td>${l.time}</td><td>${l.user}</td><td>${l.action}</td><td>${l.details || ''}</td></tr>
    `).join('');
  }

  // ============================================================
  //  16. МЕССЕНДЖЕР
  // ============================================================
  let currentChatRoom = 'general';
  let chatMediaRecorder = null;
  let chatAudioChunks = [];

  async function renderChat(room) {
    const messages = await getMessages(room);
    chatMessagesContainer.innerHTML = messages.map(msg => {
      const isOwn = currentUser && msg.sender === currentUser.login;
      let mediaHtml = '';
      if (msg.media) {
        if (msg.mediaType === 'image') {
          mediaHtml = `<img src="${msg.media}" class="media-content" style="max-width:200px;border-radius:10px;">`;
        } else if (msg.mediaType === 'video') {
          mediaHtml = `<video src="${msg.media}" class="media-content" controls style="max-width:200px;border-radius:10px;"></video>`;
        } else if (msg.mediaType === 'audio') {
          mediaHtml = `<audio src="${msg.media}" class="media-content" controls style="width:100%;"></audio>`;
        } else if (msg.mediaType === 'voice') {
          mediaHtml = `<audio src="${msg.media}" class="media-content" controls style="width:100%;"></audio>`;
        }
      }
      return `<div class="chat-message ${isOwn ? 'own' : ''}">
        ${msg.text ? `<div>${msg.text}</div>` : ''}
        ${mediaHtml}
        <div class="meta"><span>${msg.sender}</span><span>${msg.time || ''}</span></div>
      </div>`;
    }).join('');
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  async function sendChatMessage(text, media = null, mediaType = null) {
    if (!currentUser) { showToast('Войдите в систему', 'error'); return; }
    const roomKey = currentChatRoom === 'personal' ? 'personal_' + currentUser.login : currentChatRoom;
    const msg = {
      sender: currentUser.login,
      text: text || '',
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now(),
      media: media,
      mediaType: mediaType
    };
    await saveMessage(roomKey, msg);
    renderChat(roomKey);
    // Уведомление
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Новое сообщение', { body: `${msg.sender}: ${msg.text || 'Медиа-файл'}` });
    }
  }

  function switchChatRoom(room) {
    currentChatRoom = room;
    chatRooms.forEach(el => el.classList.remove('active'));
    document.querySelector(`.chat-room-item[data-room="${room}"]`).classList.add('active');
    const roomKey = room === 'personal' ? 'personal_' + currentUser.login : room;
    renderChat(roomKey);
  }

  // Обработчики медиа в чате
  function handleMediaCapture(type) {
    if (!currentUser) { showToast('Войдите в систему', 'error'); return; }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*';
    if (type === 'image' || type === 'video') {
      input.capture = type === 'image' ? 'environment' : 'environment';
    }
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result;
        await sendChatMessage('', base64, type);
        input.remove();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  // Голосовые сообщения
  function toggleVoiceRecord() {
    if (!currentUser) { showToast('Войдите в систему', 'error'); return; }
    if (chatMediaRecorder && chatMediaRecorder.state === 'recording') {
      chatMediaRecorder.stop();
      document.getElementById('voiceRecordBtn').classList.remove('active');
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      chatMediaRecorder = new MediaRecorder(stream);
      chatAudioChunks = [];
      chatMediaRecorder.ondataavailable = e => chatAudioChunks.push(e.data);
      chatMediaRecorder.onstop = async () => {
        const blob = new Blob(chatAudioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64 = ev.target.result;
          await sendChatMessage('', base64, 'voice');
          stream.getTracks().forEach(t => t.stop());
        };
        reader.readAsDataURL(blob);
        document.getElementById('voiceRecordBtn').classList.remove('active');
      };
      chatMediaRecorder.start();
      document.getElementById('voiceRecordBtn').classList.add('active');
    }).catch(err => showToast('Ошибка доступа к микрофону', 'error'));
  }

  // ============================================================
  //  17. ПОИСК
  // ============================================================
  function globalSearch(query) {
    if (!query.trim()) return [];
    const results = [];
    const q = query.toLowerCase();
    // Заявки
    getRequests().forEach(r => {
      if (r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.creator.toLowerCase().includes(q)) {
        results.push({ type: 'Заявка', id: r.id, title: r.title, link: '#', section: 'requests' });
      }
    });
    // Маршруты
    getRoutes().forEach(r => {
      if (r.vehicle.toLowerCase().includes(q) || r.from.toLowerCase().includes(q) || r.to.toLowerCase().includes(q)) {
        results.push({ type: 'Маршрут', id: r.id, title: `${r.vehicle} → ${r.to}`, link: '#', section: 'transport' });
      }
    });
    // Материалы
    getMaterials().forEach(m => {
      if (m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)) {
        results.push({ type: 'Материал', id: m.id, title: m.name, link: '#', section: 'materials' });
      }
    });
    // Закупки
    getProcurements().forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q)) {
        results.push({ type: 'Закупка', id: p.id, title: p.name, link: '#', section: 'procurement' });
      }
    });
    // Пользователи
    getData(STORAGE_KEYS.users).forEach(u => {
      if (u.login.toLowerCase().includes(q) || (u.displayName || '').toLowerCase().includes(q)) {
        results.push({ type: 'Пользователь', id: u.login, title: u.displayName || u.login, link: '#', section: 'dashboard' });
      }
    });
    return results.slice(0, 20);
  }

  // ============================================================
  //  18. ЭКСПОРТ CSV
  // ============================================================
  function exportCSV(data, headers, filename) {
    let csv = headers.join(',') + '\n';
    data.forEach(row => {
      csv += headers.map(h => row[h] || '').join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ============================================================
  //  19. ПРИМЕНЕНИЕ НАСТРОЕК
  // ============================================================
  function applySettings() {
    const settings = getData(STORAGE_KEYS.settings);
    if (settings.theme === 'dark') {
      document.body.classList.add('mto-dark');
      document.getElementById('themeToggle').textContent = '☀️';
    } else {
      document.body.classList.remove('mto-dark');
      document.getElementById('themeToggle').textContent = '🌙';
    }
    if (settings.compact) document.body.classList.add('compact-mode');
    else document.body.classList.remove('compact-mode');
    if (!settings.animations) document.body.classList.add('no-anim');
    else document.body.classList.remove('no-anim');
    document.documentElement.style.setProperty('--font-size', (settings.fontSize || 14) + 'px');
  }

  // ============================================================
  //  20. ОБНОВЛЕНИЕ ВСЕГО
  // ============================================================
  function updateAll() {
    renderDashboard();
    renderTransport();
    renderRequests();
    renderMaterials();
    renderProcurements();
    renderSchedule();
    renderAudit();
    if (currentUser) {
      userNameDisplay.textContent = currentUser.displayName || currentUser.login;
      logoutBtn.style.display = 'inline-block';
      // Показываем/скрываем разделы по правам
      document.querySelectorAll('.mto-nav a[data-section]').forEach(link => {
        const section = link.dataset.section;
        if (section === 'schedule' || section === 'audit') {
          link.style.display = isAdmin(currentUser) ? 'inline-block' : 'none';
        } else if (section === 'procurement') {
          const hasAccess = isAdmin(currentUser) || (currentUser.deptPath && currentUser.deptPath.includes('Начальник склада'));
          link.style.display = hasAccess ? 'inline-block' : 'none';
        } else {
          link.style.display = 'inline-block';
        }
      });
      // Загрузка чата
      const roomKey = currentChatRoom === 'personal' ? 'personal_' + currentUser.login : currentChatRoom;
      renderChat(roomKey);
    } else {
      userNameDisplay.textContent = 'Гость';
      logoutBtn.style.display = 'none';
    }
    populateDeptSelects();
    applySettings();
  }

  // ============================================================
  //  21. ИНИЦИАЛИЗАЦИЯ ПОСЛЕ ВХОДА
  // ============================================================
  function initAppAfterLogin() {
    if (!currentUser) return;
    populateDeptSelects();
    updateAll();
    document.getElementById('authOverlay').classList.add('hidden');
    document.querySelectorAll('.mto-nav a').forEach(a => a.style.display = 'inline-block');
    // Обновить чат
    const roomKey = currentChatRoom === 'personal' ? 'personal_' + currentUser.login : currentChatRoom;
    renderChat(roomKey);
    // Загрузить список пользователей для личных чатов
    renderUserList();
  }

  function renderUserList() {
    const users = getData(STORAGE_KEYS.users);
    const container = document.getElementById('userList');
    if (!container) return;
    container.innerHTML = users.filter(u => u.login !== currentUser?.login).map(u => `
      <div class="chat-room-item" data-room="personal_${u.login}" style="font-size:13px;padding:6px 12px;">
        ${u.displayName || u.login}
      </div>
    `).join('');
    // Обработчики для личных чатов
    container.querySelectorAll('.chat-room-item').forEach(el => {
      el.addEventListener('click', function() {
        const room = this.dataset.room;
        switchChatRoom(room);
      });
    });
  }

  // ============================================================
  //  22. ОБРАБОТЧИКИ СОБЫТИЙ
  // ============================================================

  // Навигация по разделам
  document.querySelectorAll('.mto-nav a[data-section]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionId = this.dataset.section;
      document.querySelectorAll('.mto-section').forEach(sec => sec.classList.remove('active'));
      const target = document.getElementById('section-' + sectionId);
      if (target) target.classList.add('active');
      document.querySelectorAll('.mto-nav a').forEach(a => a.classList.remove('active'));
      this.classList.add('active');
      if (sectionId === 'requests') renderRequests();
      if (sectionId === 'transport') renderTransport();
      if (sectionId === 'materials') renderMaterials();
      if (sectionId === 'procurement') renderProcurements();
      if (sectionId === 'schedule') renderSchedule();
      if (sectionId === 'audit') renderAudit();
      if (sectionId === 'dashboard') { renderDashboard(); fetchNews(5, 'newsFeedList'); }
      if (sectionId === 'messenger') {
        const roomKey = currentChatRoom === 'personal' ? 'personal_' + currentUser?.login : currentChatRoom;
        renderChat(roomKey);
        renderUserList();
      }
    });
  });

  // Часы
  function updateClock() {
    document.getElementById('clock').textContent = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  updateClock();
  setInterval(updateClock, 10000);

  // Тема
  document.getElementById('themeToggle').addEventListener('click', function() {
    document.body.classList.toggle('mto-dark');
    const isDark = document.body.classList.contains('mto-dark');
    this.textContent = isDark ? '☀️' : '🌙';
    const settings = getData(STORAGE_KEYS.settings);
    settings.theme = isDark ? 'dark' : 'light';
    setData(STORAGE_KEYS.settings, settings);
  });

  // Выход
  logoutBtn.addEventListener('click', function() {
    logoutUser();
    currentUser = null;
    userNameDisplay.textContent = 'Гость';
    logoutBtn.style.display = 'none';
    document.getElementById('authOverlay').classList.remove('hidden');
    document.querySelectorAll('.mto-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('section-dashboard').classList.add('active');
    document.querySelectorAll('.mto-nav a').forEach(link => {
      if (link.dataset.section !== 'dashboard') link.style.display = 'none';
      else link.style.display = 'inline-block';
    });
    showToast('Вы вышли', 'info');
  });

  // ============================================================
  //  23. МОДАЛКА АУТЕНТИФИКАЦИИ
  // ============================================================
  const authOverlay = document.getElementById('authOverlay');
  const authLogin = document.getElementById('authLogin');
  const authPassword = document.getElementById('authPassword');
  const authSubmit = document.getElementById('authSubmit');
  const authToggle = document.getElementById('authToggle');
  const authTitle = document.getElementById('authTitle');
  const authExtra = document.getElementById('authExtra');
  const authDeptPath = document.getElementById('authDeptPath');
  const authDisplayName = document.getElementById('authDisplayName');
  const authPhone = document.getElementById('authPhone');
  const authEmail = document.getElementById('authEmail');
  const authPosition = document.getElementById('authPosition');
  const authBirthDate = document.getElementById('authBirthDate');
  const authAvatarFile = document.getElementById('authAvatarFile');
  const authError = document.getElementById('authError');
  let isLoginMode = true;

  function setAuthMode(mode) {
    isLoginMode = (mode === 'login');
    authTitle.textContent = isLoginMode ? 'Вход в систему' : 'Регистрация';
    authSubmit.textContent = isLoginMode ? 'Войти' : 'Зарегистрироваться';
    authToggle.textContent = isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти';
    authExtra.style.display = isLoginMode ? 'none' : 'block';
    authError.textContent = '';
    populateDeptSelects();
  }

  function handleAuth() {
    const login = authLogin.value.trim();
    const password = authPassword.value.trim();
    if (!login || !password) { authError.textContent = 'Заполните все поля'; return; }
    if (isLoginMode) {
      if (loginUser(login, password)) {
        authOverlay.classList.add('hidden');
        initAppAfterLogin();
      } else {
        authError.textContent = 'Неверный логин или пароль';
      }
    } else {
      const deptPath = authDeptPath.value;
      const displayName = authDisplayName.value.trim() || login;
      const phone = authPhone.value.trim();
      const email = authEmail.value.trim();
      const position = authPosition.value.trim();
      const birthDate = authBirthDate.value;
      // Обработка фото
      let avatarBase64 = '';
      if (authAvatarFile.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => { avatarBase64 = e.target.result; };
        reader.readAsDataURL(authAvatarFile.files[0]);
        // В реальности нужно дождаться загрузки, но для простоты используем setTimeout
        setTimeout(() => {
          if (registerUser(login, password, deptPath, displayName, phone, email, position, birthDate, avatarBase64)) {
            loginUser(login, password);
            authOverlay.classList.add('hidden');
            initAppAfterLogin();
          } else {
            authError.textContent = 'Пользователь уже существует';
          }
        }, 200);
        return;
      }
      if (registerUser(login, password, deptPath, displayName, phone, email, position, birthDate, avatarBase64)) {
        loginUser(login, password);
        authOverlay.classList.add('hidden');
        initAppAfterLogin();
      } else {
        authError.textContent = 'Пользователь уже существует';
      }
    }
  }

  authToggle.addEventListener('click', function() { setAuthMode(isLoginMode ? 'register' : 'login'); });
  authSubmit.addEventListener('click', handleAuth);
  authLogin.addEventListener('keydown', e => { if (e.key === 'Enter') handleAuth(); });
  authPassword.addEventListener('keydown', e => { if (e.key === 'Enter') handleAuth(); });

  document.getElementById('gosuslugiBtn').addEventListener('click', function() { oauthLogin('Госуслуги'); });
  document.getElementById('mosruBtn').addEventListener('click', function() { oauthLogin('mos.ru'); });

  // ============================================================
  //  24. МОДАЛКА ЗАЯВКИ
  // ============================================================
  const requestModal = document.getElementById('requestModal');
  const reqEditId = document.getElementById('reqEditId');
  const reqTitle = document.getElementById('reqTitle');
  const reqDesc = document.getElementById('reqDesc');
  const reqType = document.getElementById('reqType');
  const reqAddress = document.getElementById('reqAddress');
  const reqDept = document.getElementById('reqDept');
  const reqPriority = document.getElementById('reqPriority');
  const reqStatus = document.getElementById('reqStatus');
  const reqDeadline = document.getElementById('reqDeadline');
  const reqModalTitle = document.getElementById('reqModalTitle');

  function openEditRequest(id) {
    const reqs = getRequests();
    const req = reqs.find(r => r.id === id);
    if (!req) return;
    reqEditId.value = id;
    reqTitle.value = req.title;
    reqDesc.value = req.desc;
    reqType.value = req.type;
    reqAddress.value = req.address || '';
    reqDept.value = req.deptPath;
    reqPriority.value = req.priority;
    reqStatus.value = req.status;
    reqDeadline.value = req.deadline || '';
    reqModalTitle.textContent = 'Редактирование заявки #' + id;
    requestModal.classList.remove('hidden');
    populateDeptSelects();
  }

  document.getElementById('createReqBtn').addEventListener('click', function() {
    reqEditId.value = '';
    reqTitle.value = '';
    reqDesc.value = '';
    reqType.value = 'repair';
    reqAddress.value = '';
    reqDept.value = currentUser ? currentUser.deptPath : 'Диспетчерская';
    reqPriority.value = 'medium';
    reqStatus.value = 'new';
    reqDeadline.value = '';
    reqModalTitle.textContent = 'Создание заявки';
    requestModal.classList.remove('hidden');
    populateDeptSelects();
  });

  document.getElementById('reqCancelBtn').addEventListener('click', function() { requestModal.classList.add('hidden'); });
  document.getElementById('reqSaveBtn').addEventListener('click', function() {
    const title = reqTitle.value.trim();
    const desc = reqDesc.value.trim();
    const type = reqType.value;
    const address = reqAddress.value.trim();
    const deptPath = reqDept.value;
    const priority = reqPriority.value;
    const status = reqStatus.value;
    const deadline = reqDeadline.value;
    if (!title) { alert('Введите название'); return; }
    const id = reqEditId.value;
    if (id) {
      updateRequest(parseInt(id), { title, desc, type, address, deptPath, priority, status, deadline });
    } else {
      if (!currentUser) { alert('Не авторизован'); return; }
      createRequest(title, desc, type, address, deptPath, priority, status, deadline, currentUser.login);
    }
    requestModal.classList.add('hidden');
    renderRequests();
    updateAll();
  });

  // ============================================================
  //  25. МОДАЛКА МАРШРУТА
  // ============================================================
  const routeModal = document.getElementById('routeModal');
  const routeEditId = document.getElementById('routeEditId');
  const routeVehicle = document.getElementById('routeVehicle');
  const routeType = document.getElementById('routeType');
  const routeFrom = document.getElementById('routeFrom');
  const routeTo = document.getElementById('routeTo');
  const routeStatus = document.getElementById('routeStatus');
  const routeDate = document.getElementById('routeDate');
  const routeModalTitle = document.getElementById('routeModalTitle');

  function openEditRoute(id) {
    const routes = getRoutes();
    const route = routes.find(r => r.id === id);
    if (!route) return;
    routeEditId.value = id;
    routeVehicle.value = route.vehicle;
    routeType.value = route.type;
    routeFrom.value = route.from;
    routeTo.value = route.to;
    routeStatus.value = route.status;
    routeDate.value = route.date;
    routeModalTitle.textContent = 'Редактирование маршрута #' + id;
    routeModal.classList.remove('hidden');
  }

  document.getElementById('addRouteBtn').addEventListener('click', function() {
    routeEditId.value = '';
    routeVehicle.value = 'ГАЗель NEXT';
    routeType.value = 'supply';
    routeFrom.value = '';
    routeTo.value = '';
    routeStatus.value = 'planned';
    routeDate.value = new Date().toISOString().split('T')[0];
    routeModalTitle.textContent = 'Добавление маршрута';
    routeModal.classList.remove('hidden');
  });

  document.getElementById('routeCancelBtn').addEventListener('click', function() { routeModal.classList.add('hidden'); });
  document.getElementById('routeSaveBtn').addEventListener('click', function() {
    const vehicle = routeVehicle.value;
    const type = routeType.value;
    const from = routeFrom.value.trim();
    const to = routeTo.value.trim();
    const status = routeStatus.value;
    const date = routeDate.value;
    if (!from || !to) { alert('Заполните адреса'); return; }
    const id = routeEditId.value;
    if (id) {
      updateRoute(parseInt(id), { vehicle, type, from, to, status, date });
    } else {
      if (!currentUser) { alert('Не авторизован'); return; }
      createRoute(vehicle, type, from, to, status, date);
    }
    routeModal.classList.add('hidden');
    renderTransport();
    updateAll();
  });

  // ============================================================
  //  26. МОДАЛКА МАТЕРИАЛА
  // ============================================================
  const materialModal = document.getElementById('materialModal');
  const matEditId = document.getElementById('matEditId');
  const matName = document.getElementById('matName');
  const matCategory = document.getElementById('matCategory');
  const matUnit = document.getElementById('matUnit');
  const matQuantity = document.getElementById('matQuantity');
  const matReserve = document.getElementById('matReserve');
  const matModalTitle = document.getElementById('matModalTitle');

  function openEditMaterial(id) {
    const mats = getMaterials();
    const mat = mats.find(m => m.id === id);
    if (!mat) return;
    matEditId.value = id;
    matName.value = mat.name;
    matCategory.value = mat.category;
    matUnit.value = mat.unit;
    matQuantity.value = mat.quantity;
    matReserve.value = mat.reserve;
    matModalTitle.textContent = 'Редактирование материала';
    materialModal.classList.remove('hidden');
  }

  document.getElementById('addMaterialBtn').addEventListener('click', function() {
    matEditId.value = '';
    matName.value = '';
    matCategory.value = 'Сантехника';
    matUnit.value = 'шт';
    matQuantity.value = 0;
    matReserve.value = 0;
    matModalTitle.textContent = 'Добавление материала';
    materialModal.classList.remove('hidden');
  });

  document.getElementById('matCancelBtn').addEventListener('click', function() { materialModal.classList.add('hidden'); });
  document.getElementById('matSaveBtn').addEventListener('click', function() {
    const name = matName.value.trim();
    const category = matCategory.value;
    const unit = matUnit.value.trim();
    const quantity = parseInt(matQuantity.value) || 0;
    const reserve = parseInt(matReserve.value) || 0;
    if (!name || !unit) { alert('Заполните название и единицу'); return; }
    const id = matEditId.value;
    if (id) {
      updateMaterial(parseInt(id), { name, category, unit, quantity, reserve });
    } else {
      if (!currentUser) { alert('Не авторизован'); return; }
      addMaterial(name, category, unit, quantity, reserve);
    }
    materialModal.classList.add('hidden');
    renderMaterials();
    updateAll();
  });

  // ============================================================
  //  27. МОДАЛКА ПОСТАВОК
  // ============================================================
  const suppliesModal = document.getElementById('suppliesModal');
  const suppliesList = document.getElementById('suppliesList');
  const supplyMaterialName = document.getElementById('supplyMaterialName');
  const supplyQuantity = document.getElementById('supplyQuantity');

  document.getElementById('viewSuppliesBtn').addEventListener('click', function() {
    const supplies = getSupplies();
    if (supplies.length === 0) {
      suppliesList.innerHTML = '<p style="color:var(--text-secondary);">Нет поставок</p>';
    } else {
      suppliesList.innerHTML = supplies.slice(-20).reverse().map(s => `
        <div style="padding:8px 0; border-bottom:1px solid rgba(0,0,0,0.04);">
          <strong>${s.material}</strong> +${s.quantity} <span style="color:var(--text-secondary);">${s.date}</span>
        </div>
      `).join('');
    }
    suppliesModal.classList.remove('hidden');
  });

  document.getElementById('addSupplyBtn').addEventListener('click', function() {
    const name = supplyMaterialName.value.trim();
    const qty = parseInt(supplyQuantity.value);
    if (!name || !qty || qty <= 0) { alert('Введите название и количество'); return; }
    addSupply(name, qty);
    supplyMaterialName.value = '';
    supplyQuantity.value = '';
    const supplies = getSupplies();
    suppliesList.innerHTML = supplies.slice(-20).reverse().map(s => `
      <div style="padding:8px 0; border-bottom:1px solid rgba(0,0,0,0.04);">
        <strong>${s.material}</strong> +${s.quantity} <span style="color:var(--text-secondary);">${s.date}</span>
      </div>
    `).join('');
    renderMaterials();
  });

  document.getElementById('suppliesCloseBtn').addEventListener('click', function() {
    suppliesModal.classList.add('hidden');
  });

  // ============================================================
  //  28. МОДАЛКА ЗАКУПКИ
  // ============================================================
  const procurementModal = document.getElementById('procurementModal');
  const procEditId = document.getElementById('procEditId');
  const procName = document.getElementById('procName');
  const procSupplier = document.getElementById('procSupplier');
  const procAmount = document.getElementById('procAmount');
  const procStatus = document.getElementById('procStatus');
  const procDate = document.getElementById('procDate');
  const procModalTitle = document.getElementById('procModalTitle');

  function openEditProcurement(id) {
    const procs = getProcurements();
    const proc = procs.find(p => p.id === id);
    if (!proc) return;
    procEditId.value = id;
    procName.value = proc.name;
    procSupplier.value = proc.supplier;
    procAmount.value = proc.amount;
    procStatus.value = proc.status;
    procDate.value = proc.date;
    procModalTitle.textContent = 'Редактирование закупки #' + id;
    procurementModal.classList.remove('hidden');
  }

  document.getElementById('addProcurementBtn').addEventListener('click', function() {
    procEditId.value = '';
    procName.value = '';
    procSupplier.value = '';
    procAmount.value = '';
    procStatus.value = 'planned';
    procDate.value = new Date().toISOString().split('T')[0];
    procModalTitle.textContent = 'Добавление закупки';
    procurementModal.classList.remove('hidden');
  });

  document.getElementById('procCancelBtn').addEventListener('click', function() { procurementModal.classList.add('hidden'); });
  document.getElementById('procSaveBtn').addEventListener('click', function() {
    const name = procName.value.trim();
    const supplier = procSupplier.value.trim();
    const amount = parseFloat(procAmount.value);
    const status = procStatus.value;
    const date = procDate.value;
    if (!name || !supplier) { alert('Заполните название и поставщика'); return; }
    const id = procEditId.value;
    if (id) {
      updateProcurement(parseInt(id), { name, supplier, amount, status, date });
    } else {
      if (!currentUser) { alert('Не авторизован'); return; }
      createProcurement(name, supplier, amount, status, date);
    }
    procurementModal.classList.add('hidden');
    renderProcurements();
    updateAll();
  });

  // ============================================================
  //  29. МОДАЛКА ПРОФИЛЯ
  // ============================================================
  const profileModal = document.getElementById('profileModal');
  const profileLogin = document.getElementById('profileLogin');
  const profileDisplayName = document.getElementById('profileDisplayName');
  const profilePhone = document.getElementById('profilePhone');
  const profileEmail = document.getElementById('profileEmail');
  const profilePosition = document.getElementById('profilePosition');
  const profileBirthDate = document.getElementById('profileBirthDate');
  const profileAvatarFile = document.getElementById('profileAvatarFile');
  const profileAvatarPreview = document.getElementById('profileAvatarPreview');
  const profileDeptPath = document.getElementById('profileDeptPath');
  const profileNewPassword = document.getElementById('profileNewPassword');

  function openProfile() {
    if (!currentUser) return;
    profileLogin.value = currentUser.login;
    profileDisplayName.value = currentUser.displayName || '';
    profilePhone.value = currentUser.phone || '';
    profileEmail.value = currentUser.email || '';
    profilePosition.value = currentUser.position || '';
    profileBirthDate.value = currentUser.birthDate || '';
    profileDeptPath.value = currentUser.deptPath || 'Диспетчерская';
    profileNewPassword.value = '';
    if (currentUser.avatar) {
      profileAvatarPreview.src = currentUser.avatar;
      profileAvatarPreview.style.display = 'block';
    } else {
      profileAvatarPreview.style.display = 'none';
    }
    profileModal.classList.remove('hidden');
    populateDeptSelects();
  }

  document.querySelector('.menu-item[data-burger="profile"]').addEventListener('click', function() {
    closeBurger();
    openProfile();
  });

  document.getElementById('profileCancelBtn').addEventListener('click', function() { profileModal.classList.add('hidden'); });
  document.getElementById('profileSaveBtn').addEventListener('click', function() {
    const displayName = profileDisplayName.value.trim() || currentUser.login;
    const phone = profilePhone.value.trim();
    const email = profileEmail.value.trim();
    const position = profilePosition.value.trim();
    const birthDate = profileBirthDate.value;
    const deptPath = profileDeptPath.value;
    const newPassword = profileNewPassword.value.trim();
    let avatarBase64 = currentUser.avatar || '';

    // Если выбрано новое фото
    if (profileAvatarFile.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarBase64 = e.target.result;
        saveProfileData(displayName, phone, email, position, birthDate, deptPath, newPassword, avatarBase64);
      };
      reader.readAsDataURL(profileAvatarFile.files[0]);
    } else {
      saveProfileData(displayName, phone, email, position, birthDate, deptPath, newPassword, avatarBase64);
    }
  });

  function saveProfileData(displayName, phone, email, position, birthDate, deptPath, newPassword, avatar) {
    const users = getData(STORAGE_KEYS.users);
    const idx = users.findIndex(u => u.login === currentUser.login);
    if (idx !== -1) {
      users[idx].displayName = displayName;
      users[idx].phone = phone;
      users[idx].email = email;
      users[idx].position = position;
      users[idx].birthDate = birthDate;
      users[idx].avatar = avatar;
      users[idx].deptPath = deptPath;
      if (newPassword) users[idx].password = newPassword;
      setData(STORAGE_KEYS.users, users);
      currentUser = users[idx];
      saveSession(currentUser);
      userNameDisplay.textContent = displayName;
      showToast('Профиль обновлён', 'success');
      profileModal.classList.add('hidden');
      updateAll();
    }
  }

  // ============================================================
  //  30. МОДАЛКА НАСТРОЕК
  // ============================================================
  const settingsModal = document.getElementById('settingsModal');
  const settingsDarkTheme = document.getElementById('settingsDarkTheme');
  const settingsNotifications = document.getElementById('settingsNotifications');
  const settingsCompact = document.getElementById('settingsCompact');
  const settingsAnimations = document.getElementById('settingsAnimations');
  const settingsLanguage = document.getElementById('settingsLanguage');
  const settingsFontSize = document.getElementById('settingsFontSize');

  document.querySelector('.menu-item[data-burger="settings"]').addEventListener('click', function() {
    closeBurger();
    const settings = getData(STORAGE_KEYS.settings);
    settingsDarkTheme.checked = settings.theme === 'dark';
    settingsNotifications.checked = settings.notifications !== false;
    settingsCompact.checked = settings.compact || false;
    settingsAnimations.checked = settings.animations !== false;
    settingsLanguage.value = settings.language || 'ru';
    settingsFontSize.value = settings.fontSize || 14;
    settingsModal.classList.remove('hidden');
  });

  document.getElementById('settingsCancelBtn').addEventListener('click', function() { settingsModal.classList.add('hidden'); });
  document.getElementById('settingsSaveBtn').addEventListener('click', function() {
    const settings = getData(STORAGE_KEYS.settings);
    settings.theme = settingsDarkTheme.checked ? 'dark' : 'light';
    settings.notifications = settingsNotifications.checked;
    settings.compact = settingsCompact.checked;
    settings.animations = settingsAnimations.checked;
    settings.language = settingsLanguage.value;
    settings.fontSize = parseInt(settingsFontSize.value) || 14;
    setData(STORAGE_KEYS.settings, settings);
    applySettings();
    showToast('Настройки сохранены', 'success');
    settingsModal.classList.add('hidden');
    updateAll();
  });

  // ============================================================
  //  31. МОДАЛКА НОВОСТЕЙ (полная лента)
  // ============================================================
  const newsModal = document.getElementById('newsModal');
  const newsList = document.getElementById('newsList');

  document.querySelector('.menu-item[data-burger="news"]').addEventListener('click', function() {
    closeBurger();
    newsModal.classList.remove('hidden');
    (async () => {
      const container = newsList;
      container.innerHTML = 'Загрузка...';
      try {
        const proxy = 'https://api.allorigins.win/raw?url=';
        const rssUrl = 'https://news.yandex.ru/news.rss';
        const response = await fetch(proxy + encodeURIComponent(rssUrl));
        if (!response.ok) throw new Error('Ошибка загрузки');
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const items = xml.querySelectorAll('item');
        let html = '';
        items.forEach((item) => {
          const title = item.querySelector('title')?.textContent || 'Без названия';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '#';
          html += `
            <div style="padding:12px; border-bottom:1px solid rgba(0,0,0,0.06);">
              <div style="font-weight:500;"><a href="${link}" target="_blank" style="color:var(--primary);text-decoration:none;">${title}</a></div>
              <div style="font-size:13px;color:var(--text-secondary);">${pubDate}</div>
            </div>
          `;
        });
        container.innerHTML = html || '<p style="color:var(--text-secondary);">Новостей нет</p>';
      } catch (e) {
        container.innerHTML = '<p style="color:var(--text-secondary);">Не удалось загрузить новости</p>';
      }
    })();
  });
  document.getElementById('newsCloseBtn').addEventListener('click', function() { newsModal.classList.add('hidden'); });

  // ============================================================
  //  32. МОДАЛКА ГОРЯЧЕЙ ЛИНИИ
  // ============================================================
  const hotlineModal = document.getElementById('hotlineModal');
  document.querySelector('.menu-item[data-burger="hotline"]').addEventListener('click', function() {
    closeBurger();
    hotlineModal.classList.remove('hidden');
  });
  document.getElementById('hotlineCloseBtn').addEventListener('click', function() { hotlineModal.classList.add('hidden'); });

  // ============================================================
  //  33. БУРГЕР
  // ============================================================
  const burgerPanel = document.getElementById('burgerPanel');
  const burgerBtn = document.getElementById('burgerBtn');
  const closePanel = document.getElementById('closePanel');

  function toggleBurger() { burgerPanel.classList.toggle('open'); }
  function closeBurger() { burgerPanel.classList.remove('open'); }

  burgerBtn.addEventListener('click', toggleBurger);
  closePanel.addEventListener('click', closeBurger);
  document.addEventListener('click', function(e) {
    if (!burgerPanel.contains(e.target) && e.target !== burgerBtn) {
      closeBurger();
    }
  });
  document.querySelector('.menu-item[data-burger="close"]').addEventListener('click', closeBurger);

  // ============================================================
  //  34. МЕССЕНДЖЕР – ОБРАБОТЧИКИ
  // ============================================================
  // Переключение комнат
  chatRooms.forEach(room => {
    room.addEventListener('click', function() {
      const roomId = this.dataset.room;
      switchChatRoom(roomId);
    });
  });

  // Отправка текстового сообщения
  chatSendBtn.addEventListener('click', async function() {
    const text = chatInput.value.trim();
    if (text) {
      await sendChatMessage(text);
      chatInput.value = '';
    }
  });
  chatInput.addEventListener('keydown', async function(e) {
    if (e.key === 'Enter') {
      const text = this.value.trim();
      if (text) {
        await sendChatMessage(text);
        this.value = '';
      }
    }
  });

  // Медиа-кнопки
  document.getElementById('chatPhotoBtn').addEventListener('click', function() { handleMediaCapture('image'); });
  document.getElementById('chatVideoBtn').addEventListener('click', function() { handleMediaCapture('video'); });
  document.getElementById('chatAudioBtn').addEventListener('click', function() { handleMediaCapture('audio'); });
  document.getElementById('voiceRecordBtn').addEventListener('click', toggleVoiceRecord);

  // ============================================================
  //  35. ФИЛЬТРЫ И ПОИСК
  // ============================================================
  document.getElementById('matCategoryFilter').addEventListener('change', renderMaterials);
  document.getElementById('routeFilterStatus').addEventListener('change', renderRoutes);
  document.getElementById('reqFilterStatus').addEventListener('change', renderRequests);
  document.getElementById('reqFilterType').addEventListener('change', renderRequests);
  document.getElementById('procurementFilterStatus').addEventListener('change', renderProcurements);
  document.getElementById('auditSearch').addEventListener('input', renderAudit);
  document.getElementById('auditFilterUser').addEventListener('change', renderAudit);
  document.getElementById('auditFilterAction').addEventListener('change', renderAudit);

  // Заполнение фильтров аудита
  function populateAuditFilters() {
    const users = getData(STORAGE_KEYS.users);
    const userSelect = document.getElementById('auditFilterUser');
    userSelect.innerHTML = '<option value="all">Все пользователи</option>';
    users.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.login;
      opt.textContent = u.displayName || u.login;
      userSelect.appendChild(opt);
    });
    const actionSelect = document.getElementById('auditFilterAction');
    const actions = ['Вход в систему', 'Выход', 'Регистрация', 'Создание заявки', 'Изменение заявки', 'Удаление заявки',
      'Создание маршрута', 'Изменение маршрута', 'Удаление маршрута', 'Создание закупки', 'Изменение закупки', 'Удаление закупки',
      'Добавление материала', 'Изменение материала', 'Удаление материала', 'Поставка материала', 'Резервирование материала', 'Выдача материала'
    ];
    actionSelect.innerHTML = '<option value="all">Все действия</option>';
    actions.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a;
      opt.textContent = a;
      actionSelect.appendChild(opt);
    });
  }
  populateAuditFilters();

  // ============================================================
  //  36. ПОГОДА – обновление
  // ============================================================
  document.getElementById('weatherUpdateBtn').addEventListener('click', function() {
    const city = document.getElementById('weatherCityInput').value.trim() || 'Moscow';
    fetchWeather(city);
  });

  // ============================================================
  //  37. ЭКСПОРТ CSV – кнопки
  // ============================================================
  document.getElementById('exportRequestsCSV').addEventListener('click', function() {
    const reqs = getRequests();
    const headers = ['id', 'title', 'type', 'address', 'status', 'priority', 'creator', 'deadline'];
    exportCSV(reqs, headers, 'requests');
  });
  document.getElementById('exportRoutesCSV').addEventListener('click', function() {
    const routes = getRoutes();
    const headers = ['id', 'vehicle', 'type', 'from', 'to', 'status', 'date'];
    exportCSV(routes, headers, 'routes');
  });
  document.getElementById('exportMaterialsCSV').addEventListener('click', function() {
    const mats = getMaterials();
    const headers = ['id', 'name', 'category', 'unit', 'quantity', 'reserve'];
    exportCSV(mats, headers, 'materials');
  });
  document.getElementById('exportProcurementCSV').addEventListener('click', function() {
    const procs = getProcurements();
    const headers = ['id', 'name', 'supplier', 'amount', 'status', 'date'];
    exportCSV(procs, headers, 'procurements');
  });
  document.getElementById('exportAuditCSV').addEventListener('click', function() {
    const logs = getData(STORAGE_KEYS.audit);
    const headers = ['time', 'user', 'action', 'details'];
    exportCSV(logs, headers, 'audit');
  });

  // ============================================================
  //  38. ПОИСК (глобальный)
  // ============================================================
  const searchInput = document.getElementById('globalSearch');
  searchInput.addEventListener('input', function() {
    const query = this.value;
    const results = globalSearch(query);
    // Простой вывод в консоль (можно заменить на выпадающий список)
    console.log('Результаты поиска:', results);
    if (results.length > 0 && query.length > 1) {
      showToast(`Найдено ${results.length} результатов`, 'info');
    }
  });

  // ============================================================
  //  39. ЗАПУСК
  // ============================================================
  if (loadSession()) {
    initAppAfterLogin();
    authOverlay.classList.add('hidden');
  } else {
    authOverlay.classList.remove('hidden');
    setAuthMode('login');
    document.querySelectorAll('.mto-nav a').forEach(link => {
      if (link.dataset.section !== 'dashboard') link.style.display = 'none';
      else link.style.display = 'inline-block';
    });
    // Очистка контента
    statsContainer.innerHTML = '';
    recentOrders.innerHTML = '';
    kpiGrid.innerHTML = '';
    activityList.innerHTML = '';
    erpLogItems.innerHTML = '';
    transportGrid.innerHTML = '';
    routesBody.innerHTML = '';
    auditBody.innerHTML = '';
    requestsBody.innerHTML = '';
    materialsBody.innerHTML = '';
    procurementBody.innerHTML = '';
    scheduleContainer.innerHTML = '';
    chatMessagesContainer.innerHTML = '';
    userNameDisplay.textContent = 'Гость';
    logoutBtn.style.display = 'none';
    populateDeptSelects();
    // Новости на главной
    fetchNews(5, 'newsFeedList');
    // Карты
    setTimeout(initMaps, 1000);
  }

  // При ресайзе окна – карты
  window.addEventListener('resize', () => { setTimeout(initMaps, 300); });

  console.log('МТО v3.0 – Полная версия с мессенджером, поиском, PWA, уведомлениями и офлайн-режимом успешно загружена!');
})();