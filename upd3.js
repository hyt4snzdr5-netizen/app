// ==============================================================
//  ОБНОВЛЕНИЕ 3 – Модули (графики, карты, 3D, генплан, ERP и т.д.)
//  Версия 3.2.1 – часть 3
//  Подключать после update-2-roles.js
// ==============================================================

(function() {
  'use strict';

  const DATA = window.DATA;
  const CFG = window.CFG;
  const totalInvestment = window.totalInvestment;
  const annualSaving = window.annualSaving;
  const payback = window.payback;
  const forecast = window.forecast;
  const erpPurchases = window.erpPurchases;
  const erpLog = window.erpLog;
  const ERPStatistics = window.ERPStatistics;
  const optimizeRoutes = window.optimizeRoutes;
  const showMain = window.showMain;
  const showSection = window.showSection;
  const showRole = window.showRole;

  let inited = {};

  // ---------- МОДУЛЬ ГРАФИКИ ----------
  function initCharts() {
    if (inited.charts) return;
    inited.charts = true;
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js не загружен');
      return;
    }
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

  // ---------- МОДУЛЬ КАРТЫ (основная) ----------
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

  // ---------- МОДУЛЬ GIS-КАРТЫ ----------
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

  // ---------- МОДУЛЬ ОРГАНИЗАЦИОННОЙ СТРУКТУРЫ ----------
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

  // ---------- МОДУЛЬ ЛОГИСТИКИ ----------
  function initLogistics() {
    if (inited.log) return;
    inited.log = true;
    var logRequests = document.getElementById('logRequests');
    var logPurchases = document.getElementById('logPurchases');
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
        erpPurchases.forEach(p => {
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

  // ---------- МОДУЛЬ ГЕНПЛАНА ----------
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

  // ---------- МОДУЛЬ 3D СКЛАДА ----------
  function init3D() {
    if (inited.d3) return;
    inited.d3 = true;
    var container = document.getElementById('warehouse3dContainer');
    if (!container) return;
    if (typeof import === 'undefined') {
      console.warn('Dynamic import не поддерживается');
      return;
    }
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

  // ---------- МОДУЛЬ ПАНЕЛИ РУКОВОДИТЕЛЯ (DASHBOARD) ----------
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

  // ---------- МОДУЛЬ ФИНАНСОВ ----------
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
    if (canvas && typeof Chart !== 'undefined') {
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

  // ---------- МОДУЛЬ ТРАНСПОРТА (общая страница) ----------
  function initTransport() {
    if (inited.tr) return;
    inited.tr = true;
    var info = document.getElementById('transportInfo');
    if (!info) return;
    var fleet = DATA.transport.fleet;
    var available = fleet.filter(v => v.status === "Свободна" || v.status === "Свободен").length;
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

  // ---------- МОДУЛЬ ERP ----------
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

  // ---------- МОДУЛЬ КАРТЫ РЕАЛЬНОГО ВРЕМЕНИ ----------
  let realtimeMap = null;
  let mapMarkers = [];
  let mapInterval = null;

  function initRealtimeMap() {
    if (inited.realtime) return;
    inited.realtime = true;
    if (typeof ymaps === 'undefined') return;
    ymaps.ready(function() {
      realtimeMap = new ymaps.Map('realtimeMap', {
        center: [55.735, 37.404],
        zoom: 13,
        controls: ['zoomControl', 'fullscreenControl']
      });
      DATA.areas.forEach(area => {
        let placemark = new ymaps.Placemark(
          area.coords,
          { balloonContent: `<b>${area.name}</b><br>${area.address}`, hintContent: area.name },
          { preset: 'islands#greenDotIcon' }
        );
        realtimeMap.geoObjects.add(placemark);
        mapMarkers.push(placemark);
      });
      DATA.transport.fleet.forEach((v, idx) => {
        let coords = [55.735 + (idx * 0.002), 37.403 + (idx * 0.002)];
        let marker = new ymaps.Placemark(
          coords,
          { hintContent: v.id + ' (' + v.type + ')' },
          { preset: 'islands#blueTruckIcon' }
        );
        realtimeMap.geoObjects.add(marker);
        mapMarkers.push(marker);
      });
      let step = 0;
      if (mapInterval) clearInterval(mapInterval);
      mapInterval = setInterval(() => {
        step += 0.01;
        DATA.transport.fleet.forEach((v, idx) => {
          if (v.status === 'Доставка' || v.status === 'Занят') {
            let baseLat = 55.735 + (idx * 0.002);
            let baseLon = 37.403 + (idx * 0.002);
            let lat = baseLat + Math.sin(step + idx) * 0.01;
            let lon = baseLon + Math.cos(step + idx) * 0.01;
            let marker = mapMarkers[mapMarkers.length - DATA.transport.fleet.length + idx];
            if (marker) marker.geometry.setCoordinates([lat, lon]);
          }
        });
      }, 2000);
      document.getElementById('realtimeRefresh')?.addEventListener('click', function() {
        DATA.transport.fleet.forEach((v, idx) => {
          let marker = mapMarkers[mapMarkers.length - DATA.transport.fleet.length + idx];
          if (marker) {
            let lat = 55.735 + (idx * 0.002) + (Math.random() - 0.5) * 0.02;
            let lon = 37.403 + (idx * 0.002) + (Math.random() - 0.5) * 0.02;
            marker.geometry.setCoordinates([lat, lon]);
          }
        });
      });
    });
  }

  // ---------- ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ ----------
  window.initAll = function() {
    let loader = document.getElementById(CFG.LOADER);
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
    initRealtimeMap();
    init3D();

    // Настройка навигации и карточек ролей (если ещё не настроены)
    document.querySelectorAll('.mto-nav a[data-section]').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        let section = this.dataset.section;
        if (section === 'main') { showMain(); return; }
        showSection(section);
      });
    });
    document.querySelectorAll('.mto-role-card').forEach(card => {
      card.addEventListener('click', function() {
        let role = this.dataset.role;
        showRole(role);
      });
    });
    console.log('Обновление 3 загружено (все модули)');
  };

  // Если initAll уже вызван из обновления 1, то просто вызываем его снова
  if (typeof window.initAll === 'function' && window.initAll !== arguments.callee) {
    window.initAll();
  }

})();