// ==============================================================
//  ОБНОВЛЕНИЕ 1 – Базовое (интерфейс, данные, исправления)
//  Версия 3.2.1 – часть 1
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
    VERSION: '3.2.1'
  };

  // ---------- ОПРЕДЕЛЕНИЕ РОЛЕЙ ----------
  const ROLES = {
    director:     { label: 'Директор', icon: '👤' },
    dispatcher:   { label: 'Диспетчер', icon: '🚚' },
    warehouse_mgr:{ label: 'Начальник склада', icon: '📦' },
    area_head:    { label: 'Начальник участка', icon: '🧑‍💼' },
    housing:      { label: 'ГБУ Жилищник', icon: '🏘️' },
    stock:        { label: 'Склад', icon: '🏗️' },
    admin:        { label: 'Управление МТО', icon: '👔' },
    technical:    { label: 'Техническая служба', icon: '🔧' },
    transport:    { label: 'Транспортная служба', icon: '🚛' },
    emergency:    { label: 'Аварийная служба', icon: '🚨' }
  };

  // ---------- ДАННЫЕ ----------
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
            { name:"Отдел закупок", salary:120000, children:[
              { name:"Главный специалист по закупкам", count:2, salary:95000 },
              { name:"Специалист по снабжению", count:3, salary:85000 }
            ]},
            { name:"Складской комплекс", salary:120000, children:[
              { name:"Начальник склада", salary:110000 },
              { name:"Кладовщик", count:6, salary:75000 },
              { name:"Комплектовщик", count:8, salary:65000 },
              { name:"Грузчик", count:10, salary:60000 }
            ]},
            { name:"Транспортный участок", salary:110000, children:[
              { name:"Начальник транспорта", salary:120000 },
              { name:"Диспетчер", count:2, salary:90000 },
              { name:"Механик", salary:90000 },
              { name:"Водитель категории C", count:12, salary:85000 },
              { name:"Водитель категории B", count:8, salary:75000 }
            ]},
            { name:"Ремонтная база", salary:100000, children:[
              { name:"Мастер участка", count:2, salary:85000 },
              { name:"Слесарь", count:5, salary:70000 },
              { name:"Электрик", count:3, salary:80000 }
            ]},
            { name:"Планово-экономическая группа", salary:100000, children:[
              { name:"Экономист", count:2, salary:80000 },
              { name:"Аналитик МТО", salary:90000 }
            ]}
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
    },
    emergency: {
      alerts: [
        { id:1, location:"Участок №2", type:"Прорыв трубы", status:"В работе", assigned:"Бригада №1" },
        { id:2, location:"Дом 15", type:"Отключение электроэнергии", status:"Новая", assigned:null }
      ],
      teams: [
        { id:"Бригада №1", members:3, status:"Свободна" },
        { id:"Бригада №2", members:4, status:"На выезде" }
      ]
    },
    technical: {
      equipment: [
        { id:1, name:"Насосная станция", lastMaintenance:"2026-06-01", nextMaintenance:"2026-09-01", status:"Исправен" },
        { id:2, name:"Трансформатор", lastMaintenance:"2026-05-15", nextMaintenance:"2026-08-15", status:"Требует ремонта" }
      ],
      tasks: [
        { id:1, equipment:"Насосная станция", type:"Плановое ТО", date:"2026-09-01", status:"Запланировано" }
      ]
    },
    areas: [
      { id:1, name:"Участок №1", coords:[55.7350,37.4020], address:"ул. Ленина, 1" },
      { id:2, name:"Участок №2", coords:[55.7370,37.4050], address:"ул. Мира, 5" },
      { id:3, name:"Участок №3", coords:[55.7330,37.4080], address:"пр. Победы, 10" },
      { id:4, name:"Участок №4", coords:[55.7380,37.4000], address:"ул. Садовая, 8" },
      { id:5, name:"Благоустройство", coords:[55.7340,37.4100], address:"парк им. Гагарина" }
    ]
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

  // ---------- ГЕНЕРАЦИЯ HTML ----------
  function buildRoleGrid() {
    let html = '<div class="mto-role-grid">';
    for (let [key, role] of Object.entries(ROLES)) {
      html += `
        <div class="mto-role-card" data-role="${key}">
          <div class="icon">${role.icon}</div>
          <h4>${role.label}</h4>
          <p>Войти как ${role.label}</p>
        </div>
      `;
    }
    html += '</div>';
    return html;
  }

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
        .mto-nav a { color:var(--text); text-decoration:none; font-weight:600; padding:6px 12px; border-radius:8px; transition:0.2s; font-size:14px; white-space:nowrap; cursor:pointer; }
        .mto-nav a:hover { background:var(--primary); color:white; }
        .mto-section { padding: 60px 20px; max-width: 1400px; margin:0 auto; display:none; }
        .mto-section.active { display:block; }
        .mto-section h2 { font-size:36px; margin-bottom:30px; color:var(--primary); text-align:center; }
        .mto-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(280px,1fr)); gap:25px; }
        .mto-card { background:var(--card); border-radius:var(--radius); padding:25px; box-shadow:var(--shadow); transition:0.3s; cursor:pointer; }
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
        .mto-role-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px,1fr)); gap:20px; margin-top:30px; }
        .mto-role-card { background:var(--card); border-radius:var(--radius); padding:20px; text-align:center; box-shadow:var(--shadow); cursor:pointer; transition:0.3s; }
        .mto-role-card:hover { transform:scale(1.05); box-shadow:0 12px 40px rgba(0,0,0,0.15); }
        .mto-role-card .icon { font-size:48px; margin-bottom:10px; }
        .mto-role-card h4 { font-size:18px; color:var(--text); }
        .mto-role-card p { font-size:14px; opacity:0.7; }
        .mto-back-btn { background:var(--card); border:1px solid #ccc; border-radius:30px; padding:8px 20px; cursor:pointer; font-size:14px; box-shadow:var(--shadow); margin-bottom:20px; }
        .mto-back-btn:hover { background:var(--primary); color:white; }
        .mto-role-panel .btn { transition:0.2s; }
        .mto-role-panel .btn:hover { opacity:0.8; transform:scale(1.02); }
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
        <nav class="mto-nav" id="mtoNav">
          <a data-section="main">🏠 Главная</a>
          <a data-section="about">О проекте</a>
          <a data-section="economy">Экономика</a>
          <a data-section="staff">Структура</a>
          <a data-section="warehouse">Склад 3D</a>
          <a data-section="masterplan">Генплан</a>
          <a data-section="transport">Транспорт</a>
          <a data-section="logistics">Логистика</a>
          <a data-section="finance">Финансы</a>
          <a data-section="erp">ERP</a>
          <a data-section="realtime">Карта</a>
          <a data-section="dashboard">KPI</a>
        </nav>

        <!-- Главный экран выбора роли -->
        <section id="mto-main" class="mto-section active">
          <h2>🏢 Управление МТО</h2>
          <p style="text-align:center;font-size:18px;margin-bottom:30px;">Выберите вашу роль</p>
          ${buildRoleGrid()}
        </section>

        <!-- Секции для каждой роли -->
        ${Object.keys(ROLES).map(role => `
          <section id="mto-role-${role}" class="mto-section">
            <h2>${ROLES[role].icon} ${ROLES[role].label}</h2>
            <button class="mto-back-btn" onclick="showMain()">← Назад</button>
            <div id="${role}Content" class="mto-role-panel"></div>
          </section>
        `).join('')}

        <!-- Остальные общие секции -->
        <section id="mto-about" class="mto-section"><h2>О проекте</h2>
          <div class="mto-grid">
            <div class="mto-card"><h3>Основная цель</h3><p>Создание единой службы МТО, центрального склада, логистического центра и ремонтной базы.</p></div>
            <div class="mto-card"><h3>Задачи</h3><ul><li>централизация закупок</li><li>снижение затрат</li><li>контроль запасов</li><li>ускорение поставок</li><li>единая информационная система</li><li>адресное хранение</li></ul></div>
            <div class="mto-card"><h3>Результат</h3><p>Рост эффективности, снижение расходов, повышение качества обслуживания.</p></div>
          </div>
        </section>
        <section id="mto-economy" class="mto-section"><h2>Экономическая эффективность</h2>
          <div class="mto-grid">
            <div class="mto-card"><div class="mto-chart-container"><canvas id="economyChart"></canvas></div></div>
            <div class="mto-card"><div class="mto-chart-container"><canvas id="salaryChart"></canvas></div></div>
          </div>
          <div class="mto-stats">
            <div class="mto-stat"><h1>150+</h1><p>единиц техники</p></div>
            <div class="mto-stat"><h1>6000 м²</h1><p>площадь склада</p></div>
            <div class="mto-stat"><h1>24/7</h1><p>логистика</p></div>
            <div class="mto-stat"><h1>15-20%</h1><p>экономия бюджета</p></div>
          </div>
        </section>
        <section id="mto-staff" class="mto-section"><h2>Организационная структура</h2><div id="orgTree" class="mto-card"></div></section>
        <section id="mto-warehouse" class="mto-section"><h2>Интерактивная модель склада</h2><div id="warehouse3dContainer" class="mto-3d"></div></section>
        <section id="mto-masterplan" class="mto-section"><h2>Генеральный план</h2><div class="mto-canvas-wrap"><canvas id="masterplanCanvas" width="1200" height="800"></canvas></div></section>
        <section id="mto-transport" class="mto-section"><h2>Транспортная схема</h2><div id="transportMap" class="mto-map"></div><div id="transportInfo" class="mto-transport-info"></div></section>
        <section id="mto-logistics" class="mto-section"><h2>Логистика МТО</h2><div class="mto-grid"><div class="mto-card"><h3>Заявки</h3><div id="logRequests"></div></div><div class="mto-card"><h3>Автозакупки</h3><div id="logPurchases"></div></div></div></section>
        <section id="mto-finance" class="mto-section"><h2>Финансовая модель</h2>
          <div class="mto-grid" id="financeCards"></div>
          <div class="mto-chart-container"><canvas id="financeChart"></canvas></div>
          <h3 style="text-align:center;margin-top:30px;">Сравнение затрат (млн ₽)</h3>
          <div class="mto-grid" id="comparisonGrid"></div>
        </section>
        <section id="mto-erp" class="mto-section"><h2>ERP-система</h2>
          <div class="mto-grid" id="erpPanel"></div>
          <div class="mto-erp-log" id="erpLog"></div>
        </section>
        <section id="mto-realtime" class="mto-section"><h2>🗺️ Карта в реальном времени</h2>
          <button class="mto-back-btn" onclick="showMain()">← Назад</button>
          <div id="realtimeMap" class="mto-map"></div>
          <button id="realtimeRefresh" class="mto-theme-btn" style="margin-top:10px;">Обновить позиции</button>
        </section>
        <section id="mto-dashboard" class="mto-section"><h2>Панель руководителя</h2>
          <div class="mto-grid">
            <div class="mto-card"><h3>Заполненность склада</h3><div class="mto-chart-container"><canvas id="storageChart"></canvas></div></div>
            <div class="mto-card"><h3>Расход материалов</h3><div class="mto-chart-container"><canvas id="materialsChart"></canvas></div></div>
            <div class="mto-card"><h3>Закупки</h3><div class="mto-chart-container"><canvas id="purchaseChart"></canvas></div></div>
            <div class="mto-card"><h3>Экономический эффект</h3><div class="mto-chart-container"><canvas id="profitChart"></canvas></div></div>
          </div>
          <div class="mto-grid" style="margin-top:20px;">
            <div class="mto-card"><h4>Склад</h4><h1 id="dashStorage">0%</h1><div class="mto-progress"><div class="mto-progress-bar" id="dashStorageBar" style="width:0%"></div></div></div>
            <div class="mto-card"><h4>Транспорт</h4><h1 id="dashTransport">0%</h1><div class="mto-progress"><div class="mto-progress-bar" id="dashTransportBar" style="width:0%"></div></div></div>
            <div class="mto-card"><h4>Заявки</h4><h1 id="dashRequests">0%</h1><div class="mto-progress"><div class="mto-progress-bar" id="dashRequestsBar" style="width:0%"></div></div></div>
            <div class="mto-card"><h4>Бюджет</h4><h1 id="dashBudget">0%</h1><div class="mto-progress"><div class="mto-progress-bar" id="dashBudgetBar" style="width:0%"></div></div></div>
          </div>
          <div class="mto-grid" style="margin-top:20px;">
            <div class="mto-card"><h4>Занято склада</h4><p id="dashArea">0 м²</p><p id="dashFree">0 м²</p></div>
            <div class="mto-card"><h4>Номенклатура</h4><p id="dashItems">0</p></div>
            <div class="mto-card"><h4>Закупок</h4><p id="dashProcurements">0</p></div>
            <div class="mto-card"><h4>Просрочек</h4><p id="dashDelayed">0</p></div>
          </div>
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

  // ---------- ФУНКЦИИ НАВИГАЦИИ ----------
  function showMain() {
    document.querySelectorAll('.mto-section').forEach(s => s.classList.remove('active'));
    document.getElementById('mto-main').classList.add('active');
  }

  function showSection(sectionId) {
    document.querySelectorAll('.mto-section').forEach(s => s.classList.remove('active'));
    let el = document.getElementById('mto-' + sectionId);
    if (el) el.classList.add('active');
  }

  function showRole(roleKey) {
    document.querySelectorAll('.mto-section').forEach(s => s.classList.remove('active'));
    let el = document.getElementById('mto-role-' + roleKey);
    if (el) el.classList.add('active');
    // Инициализация будет выполнена в обновлении 2
  }

  // ---------- ОТКРЫТИЕ ОТЛАДКИ ----------
  function openDebug() {
    let existing = document.getElementById(CFG.APP_ID);
    if (existing) {
      existing.style.display = 'block';
      return;
    }
    let app = document.createElement('div');
    app.id = CFG.APP_ID;
    app.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;overflow:auto;background:#eef3f8;';
    document.body.appendChild(app);
    app.innerHTML = buildHTML();
    loadDependencies(initAll);
  }

  // ---------- ДОБАВЛЕНИЕ КНОПКИ ----------
  function addButton() {
    let nav = document.querySelector('#mainMenu, nav ul, .menu, .navigation, .navbar-nav, .header-nav, .top-menu');
    if (nav) {
      let li = document.createElement('li');
      li.innerHTML = '<a href="#" id="debugBtnMTO">🐞 Отладка МТО</a>';
      nav.appendChild(li);
      let btn = document.getElementById('debugBtnMTO');
      if (btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          openDebug();
        });
      } else {
        nav.addEventListener('click', function(e) {
          if (e.target && e.target.id === 'debugBtnMTO') {
            e.preventDefault();
            openDebug();
          }
        });
      }
    } else {
      let btn = document.createElement('button');
      btn.className = 'mto-fab';
      btn.innerHTML = '🐞';
      btn.title = 'Отладка МТО';
      btn.onclick = openDebug;
      document.body.appendChild(btn);
    }
    window.openDebug = openDebug;
  }

  // ---------- ЗАГРУЗКА ЗАВИСИМОСТЕЙ ----------
  function loadDependencies(callback) {
    let loaded = 0;
    let total = 2;
    function onLoad() { loaded++; if (loaded === total) callback(); }
    if (typeof Chart !== 'undefined' && typeof ymaps !== 'undefined') {
      callback();
      return;
    }
    if (typeof Chart === 'undefined') {
      let s1 = document.createElement('script');
      s1.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      s1.onload = onLoad; s1.onerror = onLoad;
      document.head.appendChild(s1);
    } else {
      loaded++;
    }
    if (typeof ymaps === 'undefined') {
      let s2 = document.createElement('script');
      s2.src = 'https://api-maps.yandex.ru/2.1/?apikey=' + CFG.YANDEX_KEY + '&lang=ru_RU';
      s2.onload = onLoad; s2.onerror = onLoad;
      document.head.appendChild(s2);
    } else {
      loaded++;
    }
    if (loaded === total) callback();
  }

  // ---------- ИНИЦИАЛИЗАЦИЯ (заглушка, будет переопределена в обновлении 3) ----------
  function initAll() {
    let loader = document.getElementById(CFG.LOADER);
    if (loader) loader.style.display = 'none';
    console.log('Обновление 1: база загружена. Ожидайте обновления 2 и 3.');
  }

  // ---------- ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ----------
  window.CFG = CFG;
  window.DATA = DATA;
  window.ROLES = ROLES;
  window.totalInvestment = totalInvestment;
  window.annualSaving = annualSaving;
  window.payback = payback;
  window.forecast = forecast;
  window.staffCount = staffCount;
  window.monthlyFOT = monthlyFOT;
  window.erpPurchases = erpPurchases;
  window.erpLog = erpLog;
  window.findSupplier = findSupplier;
  window.createPurchaseERP = createPurchaseERP;
  window.receiveMaterialERP = receiveMaterialERP;
  window.issueMaterialERP = issueMaterialERP;
  window.ERPStatistics = ERPStatistics;
  window.calcStaff = calcStaff;
  window.calcFOT = calcFOT;
  window.calcRoute = calcRoute;
  window.optimizeRoutes = optimizeRoutes;
  window.sumObject = sumObject;
  window.showMain = showMain;
  window.showSection = showSection;
  window.showRole = showRole;
  window.openDebug = openDebug;
  window.initAll = initAll;

  // ---------- СТАРТ ----------
  if (document.readyState === 'complete') addButton();
  else document.addEventListener('DOMContentLoaded', addButton);

})();