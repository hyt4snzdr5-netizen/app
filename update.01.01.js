// ==============================================================
//  МТО КУНЦЕВО – Идеальное приложение отладки + Управление МТО
//  Версия 2.1.0
//  Добавлены роли: Диспетчер, Начальник склада
//  Ключ Яндекс.Карт: ab2476bf-2ea1-4863-87a0-654eb6b41e0f
// ==============================================================

(function() {
  'use strict';

  // ---------- КОНФИГУРАЦИЯ ----------
  const CFG = {
    YANDEX_KEY: 'ab2476bf-2ea1-4863-87a0-654eb6b41e0f',
    APP_ID: 'mtoDebugApp',
    CONTAINER: 'mtoContainer',
    LOADER: 'mtoLoader',
    VERSION: '2.1.0'
  };

  // ---------- ГЛОБАЛЬНЫЕ ДАННЫЕ (все модули) ----------
  const DATA = {
    materials: [
      { id:1, name:"Цемент", category:"Стройматериалы", stock:820, minStock:300, unit:"меш." },
      { id:2, name:"Краска фасадная", category:"Отделочные материалы", stock:460, minStock:150, unit:"шт." },
      { id:3, name:"Лампы LED", category:"Электрика", stock:1200, minStock:400, unit:"шт." },
      { id:4, name:"Труба ПВХ", category:"Сантехника", stock:350, minStock:100, unit:"м" },
      { id:5, name:"Перчатки рабочие", category:"СИЗ", stock:3000, minStock:1000, unit:"пар" },
      { id:6, name:"Мешки для мусора", category:"Хозяйственные товары", stock:5000, minStock:1500, unit:"шт." }
    ],
    requests: [
      { id:101, department:"Участок №1", material:"Цемент", quantity:120, priority:"Высокая", status:"Новая", assignedVehicle: null },
      { id:102, department:"Участок №4", material:"Лампы LED", quantity:80, priority:"Средняя", status:"В работе", assignedVehicle: null },
      { id:103, department:"Благоустройство", material:"Перчатки рабочие", quantity:250, priority:"Низкая", status:"Новая", assignedVehicle: null }
    ],
    structure: {
      name:"Заместитель директора по МТО", salary:180000,
      children:[
        { name:"Начальник ЦМТО", salary:150000,
          children:[
            { name:"Отдел закупок", salary:120000,
              children:[
                { name:"Главный специалист по закупкам", count:2, salary:95000 },
                { name:"Специалист по снабжению", count:3, salary:85000 }
              ]
            },
            { name:"Складской комплекс", salary:120000,
              children:[
                { name:"Начальник склада", salary:110000 },
                { name:"Кладовщик", count:6, salary:75000 },
                { name:"Комплектовщик", count:8, salary:65000 },
                { name:"Грузчик", count:10, salary:60000 }
              ]
            },
            { name:"Транспортный участок", salary:110000,
              children:[
                { name:"Начальник транспорта", salary:120000 },
                { name:"Диспетчер", count:2, salary:90000 },
                { name:"Механик", salary:90000 },
                { name:"Водитель категории C", count:12, salary:85000 },
                { name:"Водитель категории B", count:8, salary:75000 }
              ]
            },
            { name:"Ремонтная база", salary:100000,
              children:[
                { name:"Мастер участка", count:2, salary:85000 },
                { name:"Слесарь", count:5, salary:70000 },
                { name:"Электрик", count:3, salary:80000 }
              ]
            },
            { name:"Планово-экономическая группа", salary:100000,
              children:[
                { name:"Экономист", count:2, salary:80000 },
                { name:"Аналитик МТО", salary:90000 }
              ]
            }
          ]
        }
      ]
    },
    finance: {
      investments: { land:0, construction:420000000, equipment:85000000, vehicles:120000000, IT_system:25000000, engineering:30000000 },
      expenses: { salary:132000000, maintenance:28000000, fuel:18000000, utilities:12000000, software:6000000 },
      saving: { centralPurchasing:65000000, logistics:32000000, stockOptimization:24000000, equipmentUsage:18000000 }
    },
    beforeAfter: {
      before: { закупки:120, склад:45, логистика:38, потери:25 },
      after:  { закупки:95,  склад:22, логистика:18, потери:8 }
    },
    transport: {
      fleet: [
        { id:"A001", type:"Газель Next", category:"B", capacity:1500, fuel:"Дизель", status:"Свободна", driver:"Водитель №1" },
        { id:"A002", type:"КамАЗ", category:"C", capacity:10000, fuel:"Дизель", status:"Доставка", driver:"Водитель №2" },
        { id:"A003", type:"Манипулятор", category:"C", capacity:5000, fuel:"Дизель", status:"Свободен", driver:"Водитель №3" },
        { id:"A004", type:"Газель", category:"B", capacity:1500, fuel:"Бензин", status:"Ремонт", driver:"Водитель №4" }
      ],
      gates: [
        { id:1, type:"Погрузочные ворота", status:"Свободны" },
        { id:2, type:"Погрузочные ворота", status:"Заняты" },
        { id:3, type:"Погрузочные ворота", status:"Свободны" },
        { id:4, type:"Погрузочные ворота", status:"Свободны" },
        { id:5, type:"Выдача материалов", status:"Свободны" },
        { id:6, type:"Выдача материалов", status:"Заняты" },
        { id:7, type:"Крупногабарит", status:"Свободны" },
        { id:8, type:"Ремонтная зона", status:"Свободны" }
      ],
      routes: [
        { name:"Участок №1", distance:3.4, traffic:"Средний", deliveryTime:18 },
        { name:"Участок №2", distance:5.8, traffic:"Высокий", deliveryTime:32 },
        { name:"Участок №3", distance:4.2, traffic:"Низкий", deliveryTime:20 },
        { name:"Благоустройство", distance:6.1, traffic:"Средний", deliveryTime:27 },
        { name:"Аварийная служба", distance:2.7, traffic:"Высокий", deliveryTime:15 }
      ]
    },
    erp: {
      users: [
        { id:1, name:"Директор", role:"ADMIN", access:["finance","staff","purchase","warehouse"] },
        { id:2, name:"Заместитель директора по МТО", role:"MTO_HEAD", access:["purchase","warehouse","logistics"] },
        { id:3, name:"Начальник склада", role:"WAREHOUSE_HEAD", access:["stock","movement"] },
        { id:4, name:"Диспетчер", role:"DISPATCHER", access:["transport","requests"] },
        { id:5, name:"Специалист отдела закупок", role:"BUYER", access:["supplier","contracts"] },
        { id:6, name:"Кладовщик", role:"STOREKEEPER", access:["issue","receive"] }
      ],
      suppliers: [
        { id:101, name:"СтройКомплект", category:"Стройматериалы", rating:4.8, delivery:2 },
        { id:102, name:"МосСнаб", category:"Хозяйственные товары", rating:4.6, delivery:1 },
        { id:103, name:"ЭнергоПоставка", category:"Электрика", rating:4.9, delivery:3 }
      ],
      stock: [
        { id:1, name:"Цемент М500", category:"Строительство", unit:"мешок", quantity:820, min:300, price:520 },
        { id:2, name:"Кабель ВВГ", category:"Электрика", unit:"м", quantity:2500, min:700, price:145 },
        { id:3, name:"Перчатки СИЗ", category:"Охрана труда", unit:"пара", quantity:3500, min:1000, price:85 },
        { id:4, name:"Лампа LED", category:"Освещение", unit:"шт", quantity:1800, min:500, price:210 }
      ],
      requests: [
        { id:"REQ-001", department:"Участок №3", material:"Цемент М500", amount:100, priority:"Высокий", status:"Создана" },
        { id:"REQ-002", department:"Аварийная служба", material:"Кабель ВВГ", amount:250, priority:"Средний", status:"Согласование" }
      ],
      purchases: [],
      log: []
    }
  };

  // ---------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ----------
  function sumObject(obj) {
    let s = 0;
    Object.values(obj).forEach(v => s += v);
    return s;
  }
  const totalInvestment = sumObject(DATA.finance.investments);
  const annualSaving = sumObject(DATA.finance.saving);
  const payback = Math.ceil(totalInvestment / annualSaving);
  const forecast = [];
  let acc = 0;
  for (let y = 2026; y <= 2035; y++) { acc += annualSaving; forecast.push({ year: y, saving: annualSaving, total: acc }); }

  function calcStaff(node) {
    if (node.count) return node.count;
    if (node.children) { let c = 0; node.children.forEach(ch => c += calcStaff(ch)); return c; }
    return 1;
  }
  function calcFOT(node) {
    let r = 0;
    if (node.salary) r += (node.count || 1) * node.salary;
    if (node.children) node.children.forEach(ch => r += calcFOT(ch));
    return r;
  }
  const staffCount = calcStaff(DATA.structure);
  const monthlyFOT = calcFOT(DATA.structure);

  function calcRoute(r) {
    let f = r.distance * 0.18;
    return { distance: r.distance, time: r.deliveryTime, fuel: f.toFixed(1), cost: Math.round(f * 65) };
  }
  function optimizeRoutes() {
    let o = [];
    DATA.transport.routes.forEach(r => {
      let res = calcRoute(r);
      o.push({ point: r.name, time: res.time, cost: res.cost });
    });
    o.sort((a,b) => a.time - b.time);
    return o;
  }

  // ERP функции
  let erpPurchases = [];
  let erpLog = [];
  function findSupplier(cat) {
    let s = DATA.erp.suppliers.find(i => i.category === cat);
    return s ? s.name : "Выбор поставщика";
  }
  function createPurchaseERP(mat) {
    let p = { id: "PUR-" + Date.now(), material: mat.name, quantity: mat.min * 2, supplier: findSupplier(mat.category), status: "На согласовании", date: new Date() };
    erpPurchases.push(p);
    return p;
  }
  function receiveMaterialERP(id, amt) {
    let item = DATA.erp.stock.find(x => x.id === id);
    if (!item) return;
    item.quantity += amt;
    erpLog.push({ time: new Date().toLocaleString("ru-RU"), action: "Приемка", description: item.name + " +" + amt });
  }
  function issueMaterialERP(id, amt, dept) {
    let item = DATA.erp.stock.find(x => x.id === id);
    if (!item) return;
    if (item.quantity >= amt) {
      item.quantity -= amt;
      erpLog.push({ time: new Date().toLocaleString("ru-RU"), action: "Выдача", description: item.name + " -> " + dept });
      if (item.quantity <= item.min) {
        createPurchaseERP(item);
        console.log("Создан заказ закупки:", item.name);
      }
    } else console.warn("Недостаточно запасов");
  }
  function ERPStatistics() {
    return {
      materials: DATA.erp.stock.length,
      totalStockValue: DATA.erp.stock.reduce((s,i) => s + i.quantity * i.price, 0),
      requests: DATA.erp.requests.length,
      purchases: erpPurchases.length,
      operations: erpLog.length
    };
  }
  receiveMaterialERP(1, 200);
  issueMaterialERP(1, 150, "Участок №2");

  // ---------- ФУНКЦИИ ДЛЯ ДИСПЕТЧЕРА ----------
  function getAvailableVehicles() {
    return DATA.transport.fleet.filter(v => v.status === "Свободна" || v.status === "Свободен");
  }

  function assignVehicleToRequest(requestId, vehicleId) {
    let req = DATA.requests.find(r => r.id === requestId);
    if (!req) return false;
    let vehicle = DATA.transport.fleet.find(v => v.id === vehicleId);
    if (!vehicle) return false;
    if (vehicle.status !== "Свободна" && vehicle.status !== "Свободен") return false;
    req.status = "Назначен транспорт";
    req.assignedVehicle = vehicleId;
    vehicle.status = "Занят";
    return true;
  }

  function completeDelivery(requestId) {
    let req = DATA.requests.find(r => r.id === requestId);
    if (!req) return false;
    if (req.assignedVehicle) {
      let vehicle = DATA.transport.fleet.find(v => v.id === req.assignedVehicle);
      if (vehicle) vehicle.status = "Свободна";
    }
    req.status = "Доставлено";
    req.assignedVehicle = null;
    return true;
  }

  // ---------- ФУНКЦИИ ДЛЯ НАЧАЛЬНИКА СКЛАДА ----------
  function getStockLevels() {
    return DATA.materials.map(m => ({
      ...m,
      percent: Math.round((m.stock / m.minStock) * 100)
    }));
  }

  function createStockRequest(materialId, quantity, department) {
    let mat = DATA.materials.find(m => m.id === materialId);
    if (!mat) return false;
    if (mat.stock < quantity) return false;
    // Создаём заявку на выдачу
    let newReq = {
      id: Date.now(),
      department: department || "Складской запрос",
      material: mat.name,
      quantity: quantity,
      priority: "Нормальная",
      status: "Новая",
      assignedVehicle: null
    };
    DATA.requests.push(newReq);
    return true;
  }

  // ---------- ГЕНЕРАЦИЯ HTML (адаптивный интерфейс) ----------
  function buildHTML() {
    return `
      <style id="mtoStyles">
        :root { --primary: #1976d2; --bg: #eef3f8; --card: #ffffff; --text: #263238; --shadow: 0 8px 30px rgba(0,0,0,0.08); --radius: 16px; }
        .mto-dark { --bg: #1a1a2e; --card: #2d2d44; --text: #eee; --shadow: 0 8px 30px rgba(0,0,0,0.3); }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        #${CFG.APP_ID} { font-family: 'Segoe UI', Roboto, -apple-system, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; line-height: 1.6; }
        .mto-loader { position: fixed; top:0; left:0; width:100%; height:100%; background:var(--bg); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:9999; transition: opacity 0.5s; }
        .mto-loader .spinner { width:50px; height:50px; border:5px solid rgba(0,0,0,0.1); border-top-color:var(--primary); border-radius:50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .mto-loader p { margin-top:20px; font-size:18px; color:var(--text); }
        .mto-close { position:fixed; top:20px; right:20px; z-index:10000; background:#e74c3c; color:white; border:none; border-radius:50%; width:48px; height:48px; font-size:24px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.2); transition:0.2s; }
        .mto-close:hover { transform:scale(1.1); }
        .mto-nav { position:sticky; top:0; background:var(--card); box-shadow:0 2px 15px rgba(0,0,0,0.08); padding:12px 20px; z-index:100; display:flex; flex-wrap:wrap; gap:8px 16px; align-items:center; justify-content:center; }
        .mto-nav a { color:var(--text); text-decoration:none; font-weight:600; padding:6px 12px; border-radius:8px; transition:0.2s; font-size:14px; white-space:nowrap; }
        .mto-nav a:hover { background:var(--primary); color:white; }
        .mto-section { padding: 60px 20px; max-width: 1400px; margin:0 auto; }
        .mto-section h2 { font-size:36px; margin-bottom:30px; color:var(--primary); text-align:center; }
        .mto-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(280px,1fr)); gap:25px; }
        .mto-card { background:var(--card); border-radius:var(--radius); padding:25px; box-shadow:var(--shadow); transition:0.3s; }
        .mto-card:hover { transform:translateY(-5px); box-shadow:0 12px 40px rgba(0,0,0,0.12); }
        .mto-card h3 { font-size:20px; margin-bottom:12px; color:var(--text); }
        .mto-card p, .mto-card li { font-size:15px; color:var(--text); opacity:0.9; }
        .mto-card ul { list-style:none; padding:0; }
        .mto-card ul li { padding:4px 0; border-bottom:1px solid rgba(0,0,0,0.05); }
        .mto-stats { display:grid; grid-template-columns:repeat(auto-fit, minmax(150px,1fr)); gap:20px; margin-top:30px; }
        .mto-stat { background:var(--card); border-radius:var(--radius); padding:20px; text-align:center; box-shadow:var(--shadow); }
        .mto-stat h1 { font-size:42px; color:var(--primary); }
        .mto-stat p { font-size:16px; opacity:0.8; }
        .mto-chart-container { height:300px; margin:20px 0; }
        .mto-map { height:500px; border-radius:var(--radius); overflow:hidden; background:var(--card); }
        .mto-canvas-wrap { background:var(--card); border-radius:var(--radius); overflow:hidden; padding:10px; }
        .mto-canvas-wrap canvas { width:100% !important; height:auto !important; }
        .mto-progress { height:12px; background:#e0e0e0; border-radius:20px; overflow:hidden; margin-top:8px; }
        .mto-progress-bar { height:100%; background:var(--primary); transition:width 0.5s; }
        .mto-kpi-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(140px,1fr)); gap:15px; }
        .mto-kpi-item { background:var(--card); border-radius:var(--radius); padding:16px; text-align:center; box-shadow:var(--shadow); }
        .mto-kpi-item h4 { font-size:14px; opacity:0.7; margin-bottom:6px; }
        .mto-kpi-item .value { font-size:28px; font-weight:700; color:var(--primary); }
        .mto-notif { position:fixed; bottom:20px; right:20px; width:320px; max-height:400px; overflow-y:auto; z-index:9998; display:flex; flex-direction:column; gap:8px; }
        .mto-notif-item { background:var(--card); padding:12px 16px; border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.12); border-left:4px solid var(--primary); font-size:14px; animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        .mto-search { padding:10px 18px; border-radius:30px; border:1px solid #ccc; background:var(--card); color:var(--text); width:100%; max-width:320px; }
        .mto-theme-btn { background:var(--card); border:1px solid #ccc; border-radius:30px; padding:8px 16px; cursor:pointer; font-size:14px; box-shadow:var(--shadow); }
        .mto-theme-btn:hover { background:var(--primary); color:white; }
        .mto-clock { font-weight:600; color:var(--primary); }
        .mto-erp-log { background:var(--card); border-radius:var(--radius); padding:20px; margin-top:20px; max-height:300px; overflow-y:auto; }
        .mto-erp-log-item { padding:8px 0; border-bottom:1px solid rgba(0,0,0,0.06); font-size:14px; }
        .mto-fab { position:fixed; bottom:30px; right:30px; width:64px; height:64px; border-radius:50%; background:var(--primary); color:white; border:none; font-size:32px; box-shadow:0 6px 24px rgba(0,0,0,0.3); cursor:pointer; z-index:999999; transition:0.3s; display:flex; align-items:center; justify-content:center; }
        .mto-fab:hover { transform:scale(1.12); box-shadow:0 8px 32px rgba(25,118,210,0.5); }
        .mto-3d { height:500px; background:var(--card); border-radius:var(--radius); overflow:hidden; }
        .mto-transport-info { background:var(--card); border-radius:var(--radius); padding:20px; margin-top:20px; }
        .mto-transport-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:15px; }
        .mto-transport-stats div { text-align:center; padding:12px; background:rgba(0,0,0,0.03); border-radius:12px; }
        .mto-transport-stats span { display:block; font-size:28px; font-weight:700; color:var(--primary); }
        .mto-vehicle-tag { display:inline-block; padding:4px 12px; border-radius:20px; font-size:13px; margin:3px; color:#fff; }
        .mto-role-panel { background:var(--card); border-radius:var(--radius); padding:20px; margin-top:20px; }
        .mto-role-panel h3 { color:var(--primary); margin-bottom:15px; }
        .mto-role-panel table { width:100%; border-collapse:collapse; }
        .mto-role-panel th, .mto-role-panel td { padding:10px; border-bottom:1px solid rgba(0,0,0,0.06); text-align:left; }
        .mto-role-panel th { background:var(--bg); color:var(--text); }
        .mto-role-panel .btn { padding:6px 14px; border:none; border-radius:20px; cursor:pointer; font-size:13px; margin:2px; }
        .mto-role-panel .btn-primary { background:var(--primary); color:white; }
        .mto-role-panel .btn-success { background:#27ae60; color:white; }
        .mto-role-panel .btn-warning { background:#f39c12; color:white; }
        .mto-role-panel .btn-danger { background:#e74c3c; color:white; }
        .mto-role-panel select { padding:4px 8px; border-radius:12px; border:1px solid #ccc; background:var(--card); color:var(--text); }
        @media (max-width: 768px) {
          .mto-section { padding:40px 12px; }
          .mto-nav { padding:8px 12px; gap:6px; }
          .mto-nav a { font-size:12px; padding:4px 10px; }
          .mto-section h2 { font-size:28px; }
          .mto-grid { grid-template-columns:1fr; }
          .mto-stats { grid-template-columns:repeat(2,1fr); }
          .mto-map { height:350px; }
          .mto-notif { width:90%; right:5%; bottom:10px; }
          .mto-fab { width:56px; height:56px; font-size:28px; bottom:20px; right:20px; }
        }
        @media (max-width: 480px) {
          .mto-nav a { font-size:11px; padding:3px 8px; }
          .mto-stats { grid-template-columns:1fr; }
          .mto-kpi-grid { grid-template-columns:1fr 1fr; }
        }
        .org-node { margin:10px 0; text-align:center; }
        .org-title { background:var(--primary); color:white; padding:10px 20px; border-radius:8px; display:inline-block; font-size:16px; margin:5px; }
        .org-children { display:flex; flex-wrap:wrap; justify-content:center; gap:15px; padding-top:15px; border-top:2px solid #90a4ae; }
      </style>
      <div id="${CFG.CONTAINER}">
        <div class="mto-loader" id="${CFG.LOADER}"><div class="spinner"></div><p>Загрузка модулей...</p></div>
        <button class="mto-close" onclick="document.getElementById('${CFG.APP_ID}').style.display='none'">✕</button>
        <nav class="mto-nav">
          <a href="#mto-about">О проекте</a>
          <a href="#mto-economy">Экономика</a>
          <a href="#mto-staff">Структура</a>
          <a href="#mto-warehouse">Склад 3D</a>
          <a href="#mto-masterplan">Генплан</a>
          <a href="#mto-transport">Транспорт</a>
          <a href="#mto-logistics">Логистика</a>
          <a href="#mto-finance">Финансы</a>
          <a href="#mto-erp">ERP</a>
          <a href="#mto-dispatcher">Диспетчер</a>
          <a href="#mto-warehouse-mgr">Склад (нач.)</a>
          <a href="#mto-dashboard">KPI</a>
        </nav>
        <!-- Секции (содержимое сокращено для краткости, но все секции присутствуют) -->
        <section id="mto-about" class="mto-section"><h2>О проекте</h2><div class="mto-grid"><div class="mto-card"><h3>Основная цель</h3><p>Создание единой службы МТО, центрального склада, логистического центра и ремонтной базы.</p></div><div class="mto-card"><h3>Задачи</h3><ul><li>централизация закупок</li><li>снижение затрат</li><li>контроль запасов</li><li>ускорение поставок</li><li>единая информационная система</li><li>адресное хранение</li></ul></div><div class="mto-card"><h3>Результат</h3><p>Рост эффективности, снижение расходов, повышение качества обслуживания.</p></div></div></section>
        <section id="mto-economy" class="mto-section"><h2>Экономическая эффективность</h2><div class="mto-grid"><div class="mto-card"><div class="mto-chart-container"><canvas id="economyChart"></canvas></div></div><div class="mto-card"><div class="mto-chart-container"><canvas id="salaryChart"></canvas></div></div></div><div class="mto-stats"><div class="mto-stat"><h1>150+</h1><p>единиц техники</p></div><div class="mto-stat"><h1>6000 м²</h1><p>площадь склада</p></div><div class="mto-stat"><h1>24/7</h1><p>логистика</p></div><div class="mto-stat"><h1>15-20%</h1><p>экономия бюджета</p></div></div></section>
        <section id="mto-staff" class="mto-section"><h2>Организационная структура</h2><div id="orgTree" class="mto-card"></div></section>
        <section id="mto-warehouse" class="mto-section"><h2>Интерактивная модель склада</h2><div id="warehouse3dContainer" class="mto-3d"></div></section>
        <section id="mto-masterplan" class="mto-section"><h2>Генеральный план</h2><div class="mto-canvas-wrap"><canvas id="masterplanCanvas" width="1200" height="800"></canvas></div></section>
        <section id="mto-transport" class="mto-section"><h2>Транспортная схема</h2><div id="transportMap" class="mto-map"></div><div id="transportInfo" class="mto-transport-info"></div></section>
        <section id="mto-logistics" class="mto-section"><h2>Логистика МТО</h2><div class="mto-grid"><div class="mto-card"><h3>Заявки</h3><div id="logRequests"></div></div><div class="mto-card"><h3>Автозакупки</h3><div id="logPurchases"></div></div></div></section>
        <section id="mto-finance" class="mto-section"><h2>Финансовая модель</h2><div class="mto-grid" id="financeCards"></div><div class="mto-chart-container"><canvas id="financeChart"></canvas></div><h3 style="text-align:center;margin-top:30px;">Сравнение затрат (млн ₽)</h3><div class="mto-grid" id="comparisonGrid"></div></section>
        <section id="mto-erp" class="mto-section"><h2>ERP-система</h2><div class="mto-grid" id="erpPanel"></div><div class="mto-erp-log" id="erpLog"></div></section>
        
        <!-- НОВЫЕ СЕКЦИИ ДЛЯ РОЛЕЙ -->
        <section id="mto-dispatcher" class="mto-section">
          <h2>🚚 Диспетчерская</h2>
          <div class="mto-role-panel" id="dispatcherPanel">
            <h3>Управление заявками и транспортом</h3>
            <div id="dispatcherContent"></div>
          </div>
        </section>
        <section id="mto-warehouse-mgr" class="mto-section">
          <h2>📦 Управление складом (Начальник склада)</h2>
          <div class="mto-role-panel" id="warehouseMgrPanel">
            <h3>Контроль запасов и операции</h3>
            <div id="warehouseMgrContent"></div>
          </div>
        </section>

        <section id="mto-dashboard" class="mto-section"><h2>Панель руководителя</h2>
          <div class="mto-grid"><div class="mto-card"><h3>Заполненность склада</h3><div class="mto-chart-container"><canvas id="storageChart"></canvas></div></div><div class="mto-card"><h3>Расход материалов</h3><div class="mto-chart-container"><canvas id="materialsChart"></canvas></div></div><div class="mto-card"><h3>Закупки</h3><div class="mto-chart-container"><canvas id="purchaseChart"></canvas></div></div><div class="mto-card"><h3>Экономический эффект</h3><div class="mto-chart-container"><canvas id="profitChart"></canvas></div></div></div>
          <div class="mto-grid" style="margin-top:20px;"><div class="mto-card"><h4>Склад</h4><h1 id="dashStorage">0%</h1><div class="mto-progress"><div class="mto-progress-bar" id="dashStorageBar" style="width:0%"></div></div></div><div class="mto-card"><h4>Транспорт</h4><h1 id="dashTransport">0%</h1><div class="mto-progress"><div class="mto-progress-bar" id="dashTransportBar" style="width:0%"></div></div></div><div class="mto-card"><h4>Заявки</h4><h1 id="dashRequests">0%</h1><div class="mto-progress"><div class="mto-progress-bar" id="dashRequestsBar" style="width:0%"></div></div></div><div class="mto-card"><h4>Бюджет</h4><h1 id="dashBudget">0%</h1><div class="mto-progress"><div class="mto-progress-bar" id="dashBudgetBar" style="width:0%"></div></div></div></div>
          <div class="mto-grid" style="margin-top:20px;"><div class="mto-card"><h4>Занято склада</h4><p id="dashArea">0 м²</p><p id="dashFree">0 м²</p></div><div class="mto-card"><h4>Номенклатура</h4><p id="dashItems">0</p></div><div class="mto-card"><h4>Закупок</h4><p id="dashProcurements">0</p></div><div class="mto-card"><h4>Просрочек</h4><p id="dashDelayed">0</p></div></div>
          <div class="mto-kpi-grid" id="kpiGrid"></div>
          <div style="display:flex; flex-wrap:wrap; gap:15px; margin-top:25px; align-items:center;">
            <input class="mto-search" id="mtoSearch" placeholder="Поиск по странице...">
            <span class="mto-clock" id="mtoClock"></span>
            <button class="mto-theme-btn" id="mtoThemeToggle">🌓 Тема</button>
          </div>
          <div class="mto-notif" id="mtoNotifications"></div>
        </section>
        <footer style="text-align:center;padding:30px;background:var(--card);margin-top:40px;color:var(--text);font-size:14px;">
          <p>© 2026 ГБУ Жилищник района Кунцево – Проект создания службы МТО</p>
          <p style="opacity:0.6;">Версия ${CFG.VERSION}</p>
        </footer>
      </div>
    `;
  }

  // ---------- ИНИЦИАЛИЗАЦИЯ МОДУЛЕЙ (добавлены новые) ----------
  let inited = {};

  function initCharts() {
    if (inited.charts) return;
    inited.charts = true;
    new Chart(document.getElementById('economyChart'), {
      type:'line',
      data:{ labels:['2026','2027','2028','2029','2030'], datasets:[{ label:'Экономия бюджета', data:[0,18,39,62,88], fill:true, tension:.4 }] },
      options:{ responsive:true, maintainAspectRatio:false }
    });
    new Chart(document.getElementById('salaryChart'), {
      type:'bar',
      data:{ labels:['Руководство','Закупки','Логистика','Склад','Транспорт'], datasets:[{ label:'ФОТ, тыс. ₽', data:[820,610,930,710,520] }] }
    });
    new Chart(document.getElementById('storageChart'), {
      type:'doughnut',
      data:{ labels:['Свободно','Занято'], datasets:[{ data:[38,62] }] }
    });
    new Chart(document.getElementById('materialsChart'), {
      type:'line',
      data:{ labels:['Янв','Фев','Мар','Апр','Май','Июн','Июл'], datasets:[{ label:'Расход материалов', data:[420,390,520,610,640,560,680], fill:true, tension:.5 }] }
    });
    new Chart(document.getElementById('purchaseChart'), {
      type:'pie',
      data:{ labels:['ЖКХ','Благоустройство','Техника','Запас'], datasets:[{ data:[42,21,27,10] }] }
    });
    new Chart(document.getElementById('profitChart'), {
      type:'bar',
      data:{ labels:['2026','2027','2028','2029','2030'], datasets:[{ label:'Экономический эффект, млн ₽', data:[0,20,48,79,110] }] }
    });
  }

  function initMap() {
    if (inited.map) return;
    inited.map = true;
    if (typeof ymaps === 'undefined') return;
    ymaps.ready(function() {
      var map = new ymaps.Map('map', { center:[55.735,37.404], zoom:15, controls:['zoomControl','fullscreenControl'] });
      var polygon = new ymaps.Polygon([[[55.73445,37.40122],[55.73620,37.40150],[55.73670,37.40510],[55.73510,37.40620],[55.73370,37.40470]]], { hintContent:'Планируемая территория' }, { fillColor:'rgba(0,150,255,0.3)', strokeColor:'#1976d2', strokeWidth:4 });
      map.geoObjects.add(polygon);
      map.geoObjects.add(new ymaps.Placemark([55.7354,37.4038], { balloonContent:'<b>Центральный склад МТО</b><br>Планируемое строительство' }));
      map.setBounds(polygon.geometry.getBounds(), { checkZoomRange:true });
    });
  }

  function initGIS() {
    if (inited.gis) return;
    inited.gis = true;
    if (typeof ymaps === 'undefined') return;
    ymaps.ready(function() {
      var gisMap = new ymaps.Map('transportMap', { center:[55.7355,37.4035], zoom:16, controls:['zoomControl','fullscreenControl','rulerControl'] });
      var territory = new ymaps.Polygon([[[55.73635,37.40090],[55.73680,37.40550],[55.73390,37.40610],[55.73350,37.40200]]], { hintContent:'Земельный участок ЦМТО' }, { fillColor:'#2196F355', strokeColor:'#1565C0', strokeWidth:4 });
      gisMap.geoObjects.add(territory);
      function addMarker(c, t, d, col) {
        gisMap.geoObjects.add(new ymaps.Placemark(c, { balloonContent:'<h3>'+t+'</h3><p>'+d+'</p>' }, { preset:'islands#dotIcon', iconColor:col }));
      }
      addMarker([55.7352,37.4035], 'Центральный склад', '6000 м²', '#1976D2');
      addMarker([55.7357,37.4045], 'Администрация', 'Офисы', '#607D8B');
      addMarker([55.7344,37.4020], 'Ремонтная база', 'ТО техники', '#FF9800');
      addMarker([55.7360,37.4012], 'КПП', 'Контроль въезда', '#D32F2F');
      addMarker([55.7348,37.4050], 'Парковка', '70 мест', '#455A64');
      addMarker([55.7350,37.4040], 'Погрузочная зона', '8 ворот', '#388E3C');
      function addRoad(s,e) { gisMap.geoObjects.add(new ymaps.Polyline([s,e], {}, { strokeColor:'#424242', strokeWidth:8, strokeOpacity:0.7 })); }
      addRoad([55.7360,37.4010],[55.7340,37.4058]);
      addRoad([55.7358,37.4020],[55.7358,37.4055]);
      function addRoute(s,e) { gisMap.geoObjects.add(new ymaps.Polyline([s,e], { balloonContent:'Маршрут доставки' }, { strokeColor:'#FF9800', strokeWidth:5, strokeStyle:'dash' })); }
      addRoute([55.7352,37.4035],[55.7325,37.4100]);
      addRoute([55.7352,37.4035],[55.7380,37.3970]);
      addRoute([55.7352,37.4035],[55.7300,37.4040]);
      var trucks = [];
      function addTruck(id, c) { var t = new ymaps.Placemark(c, { hintContent:'Транспорт '+id }, { preset:'islands#blueTruckIcon' }); gisMap.geoObjects.add(t); trucks.push(t); }
      addTruck('КАМАЗ А002', [55.7352,37.4035]);
      addTruck('Газель А001', [55.7348,37.4042]);
      function moveTruck(t, pts) { var idx=0; setInterval(function(){ if(idx>=pts.length) idx=0; t.geometry.setCoordinates(pts[idx]); idx++; },2000); }
      moveTruck(trucks[0], [[55.7352,37.4035],[55.7355,37.4025],[55.7360,37.4015]]);
      window.MTO_GIS = { area:'2.4 га', warehouse:'6000 м²', gates:8, parking:70, routes:5, transport:20 };
    });
  }

  function initOrganization() {
    if (inited.org) return;
    inited.org = true;
    function buildTree(node) {
      var div = document.createElement('div'); div.className = 'org-node';
      var title = document.createElement('div'); title.className = 'org-title';
      title.innerHTML = '<b>'+node.name+'</b><br>'+(node.salary ? node.salary.toLocaleString('ru-RU')+' ₽' : '')+(node.count ? '<br>Кол-во: '+node.count : '');
      div.appendChild(title);
      if (node.children) {
        var children = document.createElement('div'); children.className = 'org-children';
        node.children.forEach(ch => children.appendChild(buildTree(ch)));
        div.appendChild(children);
      }
      return div;
    }
    var container = document.getElementById('orgTree');
    if (container) {
      container.innerHTML = '';
      var tree = buildTree(DATA.structure);
      tree.style.cssText = 'display:flex;flex-direction:column;align-items:center;';
      container.appendChild(tree);
    }
  }

  function initLogistics() {
    if (inited.log) return;
    inited.log = true;
    var logRequests = document.getElementById('logRequests');
    var logPurchases = document.getElementById('logPurchases');
    var purchases = [];
    function render() {
      if (logRequests) {
        logRequests.innerHTML = '';
        DATA.requests.forEach(r => {
          var d = document.createElement('div'); d.className = 'mto-card'; d.style.padding='12px';
          d.innerHTML = '<b>№'+r.id+'</b> '+r.department+' — '+r.material+' ('+r.quantity+') <span style="color:'+(r.status==='Новая'?'#f39c12':r.status==='В работе'?'#2980b9':'#27ae60')+';">'+r.status+'</span>';
          logRequests.appendChild(d);
        });
      }
      if (logPurchases) {
        logPurchases.innerHTML = '';
        purchases.forEach(p => {
          var d = document.createElement('div'); d.className = 'mto-card'; d.style.padding='12px';
          d.innerHTML = '<b>'+p.id+'</b> '+p.material+' ('+p.quantity+') — '+p.status;
          logPurchases.appendChild(d);
        });
      }
    }
    setInterval(function() {
      DATA.requests.forEach(r => { if (r.status === 'Новая') { r.status = 'В работе'; setTimeout(() => { r.status = 'Выполнена'; render(); }, 2000); } });
      render();
    }, 5000);
    render();
  }

  function initMasterplan() {
    if (inited.mp) return;
    inited.mp = true;
    var canvas = document.getElementById('masterplanCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#dfe8d8'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = 'rgba(33,150,243,0.25)'; ctx.strokeStyle = '#1565c0'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.rect(180,120,950,600); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#555'; ctx.fillRect(100,400,1100,70); ctx.fillRect(600,100,80,650);
    ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 20;
    ctx.fillRect(330,220,550,250); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#263238'; ctx.lineWidth = 4; ctx.strokeRect(330,220,550,250);
    ctx.fillStyle = '#1976d2'; ctx.font = '26px Arial'; ctx.fillText('ЦЕНТРАЛЬНЫЙ СКЛАД МТО', 410, 350);
    ctx.fillStyle = '#eceff1'; ctx.fillRect(920,200,150,120); ctx.fillStyle = '#263238'; ctx.font = '18px Arial'; ctx.fillText('Офисы', 960, 265);
    ctx.fillStyle = '#ffcc80'; ctx.fillRect(200,520,250,120); ctx.fillStyle = '#263238'; ctx.fillText('Ремонтная база', 240, 585);
    ctx.fillStyle = '#4caf50'; ctx.fillRect(900,500,180,130); ctx.fillStyle = '#fff'; ctx.fillText('РАЗГРУЗКА', 930, 570);
    ctx.fillStyle = '#90a4ae'; ctx.fillRect(500,650,300,100); ctx.fillStyle = '#fff'; ctx.fillText('ПАРКОВКА', 610, 705);
    ctx.fillStyle = '#d32f2f'; ctx.beginPath(); ctx.arc(170,180,30,0,Math.PI*2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '14px Arial'; ctx.fillText('КПП', 150, 185);
    for (var i=0; i<35; i++) { ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.arc(Math.random()*1300, Math.random()*800, 8, 0, Math.PI*2); ctx.fill(); }
    ctx.strokeStyle = '#ff9800'; ctx.lineWidth = 6; ctx.setLineDash([15,15]); ctx.beginPath(); ctx.moveTo(150,430); ctx.lineTo(1150,430); ctx.lineTo(1150,560); ctx.lineTo(900,560); ctx.stroke(); ctx.setLineDash([]);
  }

  function init3D() {
    if (inited.d3) return;
    inited.d3 = true;
    var container = document.getElementById('warehouse3dContainer');
    if (!container) return;
    import('https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js').then(THREE => {
      import('https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js').then(module => {
        var OrbitControls = module.OrbitControls;
        var scene = new THREE.Scene(); scene.background = new THREE.Color(0xe8f1f8);
        var camera = new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.1, 5000);
        camera.position.set(80,90,120);
        var renderer = new THREE.WebGLRenderer({ antialias:true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);
        var controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; controls.maxDistance = 400; controls.minDistance = 30;
        var ambient = new THREE.AmbientLight(0xffffff, 0.7); scene.add(ambient);
        var light = new THREE.DirectionalLight(0xffffff, 1); light.position.set(50,120,40); light.castShadow = true; scene.add(light);
        var ground = new THREE.Mesh(new THREE.PlaneGeometry(300,250), new THREE.MeshStandardMaterial({ color:0x8bc34a }));
        ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);
        var building = new THREE.Mesh(new THREE.BoxGeometry(120,18,70), new THREE.MeshStandardMaterial({ color:0xffffff }));
        building.position.y = 9; building.castShadow = true; scene.add(building);
        function addZone(x,z,c) { var zz = new THREE.Mesh(new THREE.BoxGeometry(20,0.3,20), new THREE.MeshStandardMaterial({ color:c })); zz.position.set(x,18.2,z); scene.add(zz); }
        addZone(-35,0,0x2196f3); addZone(0,0,0xff9800); addZone(35,0,0x9c27b0); addZone(0,25,0x009688);
        function addRack(x,z) { var g = new THREE.Group(); for (var i=0; i<5; i++) { var s = new THREE.Mesh(new THREE.BoxGeometry(12,0.5,3), new THREE.MeshStandardMaterial({ color:0x455a64 })); s.position.y = i*3; g.add(s); } g.position.set(x,1,z); g.castShadow = true; scene.add(g); }
        for (var x=-45; x<=45; x+=15) for (var z=-25; z<=25; z+=15) addRack(x,z);
        var office = new THREE.Mesh(new THREE.BoxGeometry(20,8,15), new THREE.MeshStandardMaterial({ color:0xeeeeee })); office.position.set(45,4,25); scene.add(office);
        var repair = new THREE.Mesh(new THREE.BoxGeometry(30,10,25), new THREE.MeshStandardMaterial({ color:0xffcc80 })); repair.position.set(-55,5,35); scene.add(repair);
        function addVeh(x,z) { var car = new THREE.Group(); var body = new THREE.Mesh(new THREE.BoxGeometry(6,2,3), new THREE.MeshStandardMaterial({ color:0xffeb3b })); body.position.y=2; car.add(body); var cab = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshStandardMaterial({ color:0x333333 })); cab.position.set(0,4,0); car.add(cab); car.position.set(x,0,z); scene.add(car); return car; }
        var loader = addVeh(-20,40); var truck = addVeh(25,45);
        var angle = 0;
        function anim() { angle += 0.01; loader.position.x = Math.sin(angle)*25; truck.position.z = 40 + Math.cos(angle)*15; }
        function render() { requestAnimationFrame(render); anim(); controls.update(); renderer.render(scene,camera); }
        render();
        window.addEventListener('resize', function() { camera.aspect = container.clientWidth/container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); });
      });
    }).catch(err => console.error('3D error', err));
  }

  function initDashboard() {
    if (inited.dash) return;
    inited.dash = true;
    var storageCap = 6000, storageUsed = 3720;
    var vehTotal = 148, vehOnline = 137;
    var reqToday = 184, reqDone = 176;
    var items = 4128;
    var budgetTotal = 28500000, budgetSpent = 21340000;
    var procCount = 58, delayed = 4;

    function update() {
      var sp = Math.round(storageUsed/storageCap*100);
      var vp = Math.round(vehOnline/vehTotal*100);
      var rp = Math.round(reqDone/reqToday*100);
      var bp = Math.round(budgetSpent/budgetTotal*100);
      document.getElementById('dashStorage').textContent = sp+'%';
      document.getElementById('dashStorageBar').style.width = sp+'%';
      document.getElementById('dashTransport').textContent = vp+'%';
      document.getElementById('dashTransportBar').style.width = vp+'%';
      document.getElementById('dashRequests').textContent = rp+'%';
      document.getElementById('dashRequestsBar').style.width = rp+'%';
      document.getElementById('dashBudget').textContent = bp+'%';
      document.getElementById('dashBudgetBar').style.width = bp+'%';
      document.getElementById('dashArea').textContent = storageUsed+' м²';
      document.getElementById('dashFree').textContent = (storageCap-storageUsed)+' м²';
      document.getElementById('dashItems').textContent = items;
      document.getElementById('dashProcurements').textContent = procCount;
      document.getElementById('dashDelayed').textContent = delayed;
    }
    function simulate() {
      storageUsed += Math.floor(Math.random()*30)-10;
      reqToday += Math.floor(Math.random()*4);
      reqDone += Math.floor(Math.random()*3);
      vehOnline += Math.floor(Math.random()*3)-1;
      if (vehOnline > vehTotal) vehOnline = vehTotal;
      if (vehOnline < 130) vehOnline = 130;
      budgetSpent += Math.floor(Math.random()*40000);
      update();
    }
    update();
    setInterval(simulate, 3000);

    var kpi = { economy:18, delivery:96, warehouse:98, contracts:91, repair:87, transport:95 };
    var grid = document.getElementById('kpiGrid');
    if (grid) {
      grid.innerHTML = '';
      Object.keys(kpi).forEach(key => {
        var div = document.createElement('div'); div.className = 'mto-kpi-item';
        div.innerHTML = '<h4>'+key.toUpperCase()+'</h4><div class="value">'+kpi[key]+'%</div>';
        grid.appendChild(div);
      });
    }

    var msgs = ['Новая поставка','Инвентаризация завершена','Заключён контракт','Прибыл транспорт','Материалы выданы','Создан заказ','Согласование закупки','Обновлены остатки'];
    var notifBox = document.getElementById('mtoNotifications');
    function notif() {
      if (!notifBox) return;
      var d = document.createElement('div'); d.className = 'mto-notif-item';
      d.textContent = new Date().toLocaleTimeString('ru-RU') + ' • ' + msgs[Math.floor(Math.random()*msgs.length)];
      notifBox.prepend(d);
      if (notifBox.children.length > 10) notifBox.removeChild(notifBox.lastChild);
    }
    setInterval(notif, 5000);
    notif();

    setInterval(function() {
      var cl = document.getElementById('mtoClock');
      if (cl) cl.textContent = new Date().toLocaleString('ru-RU');
    }, 1000);

    document.getElementById('mtoThemeToggle').addEventListener('click', function() {
      document.getElementById(CFG.CONTAINER).classList.toggle('mto-dark');
    });

    document.getElementById('mtoSearch').addEventListener('input', function() {
      var val = this.value.toLowerCase();
      document.querySelectorAll('.mto-section').forEach(s => {
        if (s.textContent.toLowerCase().includes(val)) s.style.display = 'block';
        else s.style.display = 'none';
      });
    });
  }

  function initFinance() {
    if (inited.fin) return;
    inited.fin = true;
    var container = document.getElementById('financeCards');
    if (container) {
      container.innerHTML = `
        <div class="mto-card"><h3>Инвестиции</h3><h1>${(totalInvestment/1000000).toFixed(0)} млн ₽</h1></div>
        <div class="mto-card"><h3>Годовая экономия</h3><h1>${(annualSaving/1000000).toFixed(0)} млн ₽</h1></div>
        <div class="mto-card"><h3>Окупаемость</h3><h1>${payback} лет</h1></div>
        <div class="mto-card"><h3>Эффект за 10 лет</h3><h1>${(annualSaving*10/1000000).toFixed(0)} млн ₽</h1></div>
      `;
    }
    var canvas = document.getElementById('financeChart');
    if (canvas) {
      new Chart(canvas, {
        type: 'line',
        data: {
          labels: forecast.map(f => f.year),
          datasets: [{ label: 'Накопленный эффект, млн ₽', data: forecast.map(f => (f.total/1000000).toFixed(1)), fill: true, tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
    var comp = document.getElementById('comparisonGrid');
    if (comp) {
      comp.innerHTML = '';
      Object.keys(DATA.beforeAfter.before).forEach(key => {
        var div = document.createElement('div'); div.className = 'mto-card';
        div.innerHTML = `<h3>${key}</h3><p>До: ${DATA.beforeAfter.before[key]} млн ₽</p><p>После: ${DATA.beforeAfter.after[key]} млн ₽</p>`;
        comp.appendChild(div);
      });
    }
    window.MTO_FINANCE = { investment: totalInvestment, saving: annualSaving, payback: payback, forecast: forecast };
  }

  function initTransport() {
    if (inited.tr) return;
    inited.tr = true;
    var info = document.getElementById('transportInfo');
    if (!info) return;
    var fleet = DATA.transport.fleet;
    var available = fleet.filter(v => v.status === 'Свободна' || v.status === 'Свободен').length;
    var avgTime = Math.round(DATA.transport.routes.reduce((a,b) => a + b.deliveryTime, 0) / DATA.transport.routes.length);
    var opt = optimizeRoutes();
    info.innerHTML = `
      <h3>🚛 Транспортный участок</h3>
      <div class="mto-transport-stats">
        <div><span>${fleet.length}</span><small>Автомобилей</small></div>
        <div><span>${available}</span><small>Свободно</small></div>
        <div><span>${avgTime} мин</span><small>Среднее время доставки</small></div>
        <div><span>18%</span><small>Экономия топлива</small></div>
      </div>
      <div style="margin-top:15px;"><b>Маршруты (оптимизированы)</b>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;">
          ${opt.map(r => `<span style="background:var(--card);padding:6px 14px;border-radius:12px;box-shadow:var(--shadow);">${r.point} — ${r.time} мин (${r.cost} ₽)</span>`).join('')}
        </div>
      </div>
      <div style="margin-top:15px;"><b>Ворота</b>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
          ${DATA.transport.gates.map(g => `<span style="background:${g.status==='Свободны'?'#4caf50':'#e74c3c'};color:#fff;padding:4px 12px;border-radius:20px;font-size:13px;">Ворота ${g.id} — ${g.status}</span>`).join('')}
        </div>
      </div>
      <div style="margin-top:15px;"><b>Автопарк</b>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
          ${fleet.map(v => `<span class="mto-vehicle-tag" style="background:${v.status==='Свободна'||v.status==='Свободен'?'#4caf50':v.status==='Доставка'?'#f39c12':'#e74c3c'};">${v.id} (${v.type})</span>`).join('')}
        </div>
      </div>
    `;
    window.MTO_TRANSPORT = { fleet, routes: DATA.transport.routes, gates: DATA.transport.gates, KPI: { fleet: fleet.length, available, avgTime, fuelSaving:'18%' } };
  }

  function initERP() {
    if (inited.erp) return;
    inited.erp = true;
    var panel = document.getElementById('erpPanel');
    var logBox = document.getElementById('erpLog');
    if (!panel || !logBox) return;
    var stat = ERPStatistics();
    panel.innerHTML = `
      <div class="mto-card"><h3>Материалы</h3><h1>${stat.materials}</h1></div>
      <div class="mto-card"><h3>Стоимость запасов</h3><h1>${stat.totalStockValue.toLocaleString('ru-RU')} ₽</h1></div>
      <div class="mto-card"><h3>Заявки</h3><h1>${stat.requests}</h1></div>
      <div class="mto-card"><h3>Закупки</h3><h1>${stat.purchases}</h1></div>
    `;
    logBox.innerHTML = '<h3 style="margin-bottom:10px;">Журнал операций (последние 5)</h3>';
    erpLog.slice(-5).reverse().forEach(e => {
      var d = document.createElement('div'); d.className = 'mto-erp-log-item';
      d.textContent = e.time + ' — ' + e.action + ': ' + e.description;
      logBox.appendChild(d);
    });
    window.MTO_ERP = { users: DATA.erp.users, stock: DATA.erp.stock, requests: DATA.erp.requests, purchases: erpPurchases, suppliers: DATA.erp.suppliers, log: erpLog, statistics: ERPStatistics };
  }

  // ---------- ИНИЦИАЛИЗАЦИЯ НОВЫХ РОЛЕЙ ----------
  function initDispatcher() {
    if (inited.dispatcher) return;
    inited.dispatcher = true;
    var container = document.getElementById('dispatcherContent');
    if (!container) return;

    function render() {
      var html = `
        <h4>Текущие заявки</h4>
        <table>
          <tr><th>ID</th><th>Участок</th><th>Материал</th><th>Кол-во</th><th>Статус</th><th>Транспорт</th><th>Действия</th></tr>
      `;
      DATA.requests.forEach(req => {
        var veh = req.assignedVehicle ? DATA.transport.fleet.find(v => v.id === req.assignedVehicle) : null;
        var vehName = veh ? veh.id + ' (' + veh.type + ')' : 'Не назначен';
        var available = getAvailableVehicles();
        html += `<tr>
          <td>${req.id}</td>
          <td>${req.department}</td>
          <td>${req.material}</td>
          <td>${req.quantity}</td>
          <td>${req.status}</td>
          <td>${vehName}</td>
          <td>
            ${req.status !== 'Доставлено' ? `
              <select id="vehSelect_${req.id}" class="vehSelect">
                <option value="">Выбрать транспорт</option>
                ${available.map(v => `<option value="${v.id}">${v.id} (${v.type})</option>`).join('')}
              </select>
              <button class="btn btn-primary" onclick="window._assignVehicle(${req.id})">Назначить</button>
              <button class="btn btn-success" onclick="window._completeDelivery(${req.id})">Доставлено</button>
            ` : ''}
          </td>
        </tr>`;
      });
      html += `</table>`;
      container.innerHTML = html;

      // Сохраняем функции в глобальный объект
      window._assignVehicle = function(reqId) {
        var select = document.getElementById('vehSelect_' + reqId);
        var vehId = select.value;
        if (!vehId) { alert('Выберите транспорт'); return; }
        if (assignVehicleToRequest(reqId, vehId)) {
          render();
          alert('Транспорт назначен');
        } else {
          alert('Не удалось назначить');
        }
      };
      window._completeDelivery = function(reqId) {
        if (completeDelivery(reqId)) {
          render();
          alert('Доставка завершена');
        } else {
          alert('Ошибка');
        }
      };
    }
    render();
  }

  function initWarehouseManager() {
    if (inited.whmgr) return;
    inited.whmgr = true;
    var container = document.getElementById('warehouseMgrContent');
    if (!container) return;

    function render() {
      var html = `
        <h4>Текущие остатки материалов</h4>
        <table>
          <tr><th>ID</th><th>Название</th><th>Категория</th><th>Остаток</th><th>Мин. запас</th><th>Загрузка</th></tr>
      `;
      getStockLevels().forEach(m => {
        var percent = Math.min(m.percent, 100);
        var color = percent > 80 ? '#4caf50' : percent > 50 ? '#f39c12' : '#e74c3c';
        html += `<tr>
          <td>${m.id}</td>
          <td>${m.name}</td>
          <td>${m.category}</td>
          <td>${m.stock} ${m.unit}</td>
          <td>${m.minStock}</td>
          <td><div style="background:#e0e0e0;border-radius:10px;height:16px;width:100%;"><div style="height:100%;width:${percent}%;background:${color};border-radius:10px;"></div></div></td>
        </tr>`;
      });
      html += `</table>
        <h4 style="margin-top:20px;">Создать заявку на выдачу</h4>
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
          <select id="whMatSelect">
            ${DATA.materials.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
          </select>
          <input type="number" id="whQuantity" placeholder="Количество" style="padding:6px;border-radius:12px;border:1px solid #ccc;width:100px;">
          <input type="text" id="whDepartment" placeholder="Участок" style="padding:6px;border-radius:12px;border:1px solid #ccc;width:150px;">
          <button class="btn btn-primary" onclick="window._createStockRequest()">Создать заявку</button>
        </div>
      `;
      container.innerHTML = html;

      window._createStockRequest = function() {
        var matId = parseInt(document.getElementById('whMatSelect').value);
        var qty = parseInt(document.getElementById('whQuantity').value);
        var dept = document.getElementById('whDepartment').value || 'Складской запрос';
        if (!qty || qty <= 0) { alert('Введите корректное количество'); return; }
        if (createStockRequest(matId, qty, dept)) {
          alert('Заявка создана');
          render();
        } else {
          alert('Недостаточно материала на складе');
        }
      };
    }
    render();
  }

  // ---------- ЗАГРУЗКА ЗАВИСИМОСТЕЙ И ЗАПУСК ----------
  function loadDependencies(callback) {
    var loaded = 0;
    var total = 2;
    function onLoad() { loaded++; if (loaded === total) callback(); }
    var script1 = document.createElement('script');
    script1.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script1.onload = onLoad;
    script1.onerror = onLoad;
    document.head.appendChild(script1);
    var script2 = document.createElement('script');
    script2.src = 'https://api-maps.yandex.ru/2.1/?apikey=' + CFG.YANDEX_KEY + '&lang=ru_RU';
    script2.onload = onLoad;
    script2.onerror = onLoad;
    document.head.appendChild(script2);
  }

  function initAll() {
    var loader = document.getElementById(CFG.LOADER);
    if (loader) loader.style.display = 'none';
    initCharts();
    initMap();
    initGIS();
    initOrganization();
    initLogistics();
    initMasterplan();
    initDashboard();
    initFinance();
    initTransport();
    initERP();
    initDispatcher();
    initWarehouseManager();
    init3D();
    console.log('МТО Отладка v' + CFG.VERSION + ' загружена с ролями');
  }

  function openDebug() {
    var existing = document.getElementById(CFG.APP_ID);
    if (existing) { existing.style.display = 'block'; return; }
    var app = document.createElement('div');
    app.id = CFG.APP_ID;
    app.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;overflow:auto;background:#eef3f8;';
    document.body.appendChild(app);
    app.innerHTML = buildHTML();
    loadDependencies(initAll);
  }

  function addButton() {
    var nav = document.querySelector('#mainMenu, nav ul, .menu, .navigation, .navbar-nav, .header-nav, .top-menu');
    if (nav) {
      var li = document.createElement('li');
      li.innerHTML = '<a href="#" id="debugBtnMTO">🐞 Отладка МТО</a>';
      nav.appendChild(li);
      document.getElementById('debugBtnMTO').addEventListener('click', function(e) {
        e.preventDefault();
        openDebug();
      });
      console.log('✅ Кнопка отладки добавлена в меню');
    } else {
      var btn = document.createElement('button');
      btn.className = 'mto-fab';
      btn.innerHTML = '🐞';
      btn.title = 'Отладка МТО';
      btn.onclick = openDebug;
      document.body.appendChild(btn);
      console.log('✅ Плавающая кнопка отладки добавлена');
    }
    window.openDebug = openDebug;
  }

  if (document.readyState === 'complete') addButton();
  else document.addEventListener('DOMContentLoaded', addButton);

})();