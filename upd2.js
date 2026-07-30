// ==============================================================
//  ОБНОВЛЕНИЕ 2 – Функционал ролей
//  Версия 3.2.1 – часть 2
//  Подключать после update-1-base.js
// ==============================================================

(function() {
  'use strict';

  // Все данные и функции берём из глобальной области
  const DATA = window.DATA;
  const ROLES = window.ROLES;

  // ---------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РОЛЕЙ ----------
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

  function assignTeam(alertId, teamId) {
    let alert = DATA.emergency.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    let team = DATA.emergency.teams.find(t => t.id === teamId);
    if (!team || team.status !== "Свободна") return false;
    alert.status = "В работе";
    alert.assigned = teamId;
    team.status = "На выезде";
    return true;
  }

  function resolveAlert(alertId) {
    let alert = DATA.emergency.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    alert.status = "Решена";
    let team = DATA.emergency.teams.find(t => t.id === alert.assigned);
    if (team) team.status = "Свободна";
    return true;
  }

  function completeTask(taskId) {
    let task = DATA.technical.tasks.find(t => t.id === taskId);
    if (!task) return false;
    task.status = "Выполнена";
    let eq = DATA.technical.equipment.find(e => e.name === task.equipment);
    if (eq) {
      eq.lastMaintenance = new Date().toISOString().slice(0,10);
      let d = new Date();
      d.setMonth(d.getMonth() + 3);
      eq.nextMaintenance = d.toISOString().slice(0,10);
    }
    return true;
  }

  function getTransportReport() {
    let fleet = DATA.transport.fleet;
    let total = fleet.length;
    let available = fleet.filter(v => v.status === "Свободна" || v.status === "Свободен").length;
    let inUse = fleet.filter(v => v.status === "Доставка" || v.status === "Занят").length;
    let inRepair = fleet.filter(v => v.status === "Ремонт").length;
    return { total, available, inUse, inRepair };
  }

  function getAdminStats() {
    return {
      staff: window.staffCount,
      monthlyFOT: window.monthlyFOT,
      requests: DATA.requests.length,
      stockItems: DATA.materials.reduce((s,m) => s + m.stock, 0),
      vehicles: DATA.transport.fleet.length,
      emergencies: DATA.emergency.alerts.filter(a => a.status !== "Решена").length
    };
  }

  function getStockSummary() {
    return DATA.materials.map(m => ({ ...m, percent: Math.round((m.stock / m.minStock) * 100) }));
  }

  function getHousingStats() {
    return {
      totalAreas: DATA.areas.length,
      activeRequests: DATA.requests.filter(r => r.status !== "Доставлено" && r.status !== "Выполнена").length,
      completedRequests: DATA.requests.filter(r => r.status === "Доставлено" || r.status === "Выполнена").length,
      emergencyAlerts: DATA.emergency.alerts.filter(a => a.status !== "Решена").length
    };
  }

  function getAreaRequests(areaName) {
    return DATA.requests.filter(r => r.department === areaName);
  }

  // ---------- ИНИЦИАЛИЗАЦИЯ РОЛЕЙ ----------
  function initDirector() {
    let container = document.getElementById('directorContent');
    if (!container) return;
    let stats = getAdminStats();
    container.innerHTML = `
      <h3>Панель директора</h3>
      <div class="mto-stats">
        <div class="mto-stat"><h1>${stats.staff}</h1><p>Сотрудники</p></div>
        <div class="mto-stat"><h1>${(stats.monthlyFOT/1000).toFixed(0)} тыс.₽</h1><p>ФОТ</p></div>
        <div class="mto-stat"><h1>${stats.requests}</h1><p>Заявки</p></div>
        <div class="mto-stat"><h1>${stats.stockItems}</h1><p>Остатки</p></div>
        <div class="mto-stat"><h1>${stats.vehicles}</h1><p>Транспорт</p></div>
        <div class="mto-stat"><h1>${stats.emergencies}</h1><p>Аварии</p></div>
      </div>
      <p style="margin-top:20px;">Полный доступ ко всем разделам системы.</p>
    `;
  }

  function initDispatcher() {
    let container = document.getElementById('dispatcherContent');
    if (!container) return;
    function render() {
      let html = `<h3>Управление заявками</h3><table>
        <tr><th>ID</th><th>Участок</th><th>Материал</th><th>Кол-во</th><th>Статус</th><th>Транспорт</th><th>Действия</th></tr>`;
      DATA.requests.forEach(req => {
        let veh = req.assignedVehicle ? DATA.transport.fleet.find(v => v.id === req.assignedVehicle) : null;
        let vehName = veh ? veh.id + ' (' + veh.type + ')' : 'Не назначен';
        let available = getAvailableVehicles();
        html += `<tr>
          <td>${req.id}</td>
          <td>${req.department}</td>
          <td>${req.material}</td>
          <td>${req.quantity}</td>
          <td>${req.status}</td>
          <td>${vehName}</td>
          <td>
            ${req.status !== 'Доставлено' ? `
              <select id="vehSelect_${req.id}"><option value="">Выбрать</option>${available.map(v => `<option value="${v.id}">${v.id}</option>`).join('')}</select>
              <button class="btn btn-primary" onclick="window._assignVeh(${req.id})">Назначить</button>
              <button class="btn btn-success" onclick="window._completeDel(${req.id})">Доставлено</button>
            ` : ''}
          </td>
        </tr>`;
      });
      html += `</table>`;
      container.innerHTML = html;
      window._assignVeh = function(reqId) {
        let select = document.getElementById('vehSelect_' + reqId);
        let vehId = select.value;
        if (!vehId) { alert('Выберите транспорт'); return; }
        if (assignVehicleToRequest(reqId, vehId)) {
          render();
          alert('Транспорт назначен');
        } else alert('Ошибка');
      };
      window._completeDel = function(reqId) {
        if (completeDelivery(reqId)) {
          render();
          alert('Доставка завершена');
        } else alert('Ошибка');
      };
    }
    render();
  }

  function initWarehouseManager() {
    let container = document.getElementById('warehouse_mgrContent');
    if (!container) return;
    function render() {
      let html = `<h3>Остатки материалов</h3><table><tr><th>Название</th><th>Остаток</th><th>Мин.</th><th>Загрузка</th></tr>`;
      DATA.materials.forEach(m => {
        let pct = Math.min(Math.round((m.stock / m.minStock) * 100), 100);
        let color = pct > 80 ? '#4caf50' : pct > 50 ? '#f39c12' : '#e74c3c';
        html += `<tr><td>${m.name}</td><td>${m.stock} ${m.unit}</td><td>${m.minStock}</td><td><div style="background:#e0e0e0;border-radius:10px;height:16px;width:100%;"><div style="height:100%;width:${pct}%;background:${color};border-radius:10px;"></div></div></td></tr>`;
      });
      html += `</table><h3 style="margin-top:20px;">Создать заявку на выдачу</h3>
        <select id="whMatSelect">${DATA.materials.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}</select>
        <input type="number" id="whQuantity" placeholder="Кол-во" style="padding:6px;border-radius:12px;border:1px solid #ccc;width:100px;margin:0 10px;">
        <input type="text" id="whDepartment" placeholder="Участок" style="padding:6px;border-radius:12px;border:1px solid #ccc;width:150px;">
        <button class="btn btn-primary" onclick="window._createStockReq()">Создать</button>`;
      container.innerHTML = html;
      window._createStockReq = function() {
        let matId = parseInt(document.getElementById('whMatSelect').value);
        let qty = parseInt(document.getElementById('whQuantity').value);
        let dept = document.getElementById('whDepartment').value || 'Складской запрос';
        if (!qty || qty <= 0) { alert('Введите количество'); return; }
        let mat = DATA.materials.find(m => m.id === matId);
        if (!mat) return;
        if (mat.stock < qty) { alert('Недостаточно материала'); return; }
        DATA.requests.push({ id: Date.now(), department: dept, material: mat.name, quantity: qty, priority: "Нормальная", status: "Новая", assignedVehicle: null });
        mat.stock -= qty;
        render();
        alert('Заявка создана');
      };
    }
    render();
  }

  function initEmergency() {
    let container = document.getElementById('emergencyContent');
    if (!container) return;
    function render() {
      let html = `<h3>Аварийные сигналы</h3><table><tr><th>ID</th><th>Место</th><th>Тип</th><th>Статус</th><th>Бригада</th><th>Действия</th></tr>`;
      DATA.emergency.alerts.forEach(a => {
        let teams = DATA.emergency.teams.filter(t => t.status === "Свободна");
        html += `<tr>
          <td>${a.id}</td>
          <td>${a.location}</td>
          <td>${a.type}</td>
          <td>${a.status}</td>
          <td>${a.assigned || 'Не назначена'}</td>
          <td>
            ${a.status !== 'Решена' ? `
              <select id="teamSelect_${a.id}"><option value="">Выбрать</option>${teams.map(t => `<option value="${t.id}">${t.id}</option>`).join('')}</select>
              <button class="btn btn-primary" onclick="window._assignTeam(${a.id})">Назначить</button>
              <button class="btn btn-success" onclick="window._resolveAlert(${a.id})">Решена</button>
            ` : ''}
          </td>
        </tr>`;
      });
      html += `</table>`;
      container.innerHTML = html;
      window._assignTeam = function(alertId) {
        let select = document.getElementById('teamSelect_' + alertId);
        let teamId = select.value;
        if (!teamId) { alert('Выберите бригаду'); return; }
        if (assignTeam(alertId, teamId)) {
          render();
          alert('Бригада назначена');
        } else alert('Ошибка');
      };
      window._resolveAlert = function(alertId) {
        if (resolveAlert(alertId)) {
          render();
          alert('Авария решена');
        } else alert('Ошибка');
      };
    }
    render();
  }

  function initTechnical() {
    let container = document.getElementById('technicalContent');
    if (!container) return;
    function render() {
      let html = `<h3>Оборудование</h3><table><tr><th>Название</th><th>Последнее ТО</th><th>Следующее ТО</th><th>Статус</th></tr>`;
      DATA.technical.equipment.forEach(e => {
        html += `<tr><td>${e.name}</td><td>${e.lastMaintenance}</td><td>${e.nextMaintenance}</td><td>${e.status}</td></tr>`;
      });
      html += `</table><h3 style="margin-top:20px;">Задачи по ТО</h3><table><tr><th>Оборудование</th><th>Тип</th><th>Дата</th><th>Статус</th><th>Действие</th></tr>`;
      DATA.technical.tasks.forEach(t => {
        html += `<tr><td>${t.equipment}</td><td>${t.type}</td><td>${t.date}</td><td>${t.status}</td>
          <td>${t.status !== 'Выполнена' ? `<button class="btn btn-success" onclick="window._completeTask(${t.id})">Выполнить</button>` : ''}</td></tr>`;
      });
      html += `</table>`;
      container.innerHTML = html;
      window._completeTask = function(taskId) {
        if (completeTask(taskId)) {
          render();
          alert('Задача выполнена');
        } else alert('Ошибка');
      };
    }
    render();
  }

  function initTransportService() {
    let container = document.getElementById('transportContent');
    if (!container) return;
    function render() {
      let report = getTransportReport();
      let html = `<h3>Отчёт по автопарку</h3>
        <div class="mto-stats">
          <div class="mto-stat"><h1>${report.total}</h1><p>Всего</p></div>
          <div class="mto-stat"><h1>${report.available}</h1><p>Свободно</p></div>
          <div class="mto-stat"><h1>${report.inUse}</h1><p>В работе</p></div>
          <div class="mto-stat"><h1>${report.inRepair}</h1><p>Ремонт</p></div>
        </div>
        <h3 style="margin-top:20px;">Состояние техники</h3>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          ${DATA.transport.fleet.map(v => `<span class="mto-vehicle-tag" style="background:${v.status==='Свободна'||v.status==='Свободен'?'#4caf50':v.status==='Доставка'?'#f39c12':'#e74c3c'};">${v.id} (${v.type}) — ${v.status}</span>`).join('')}
        </div>`;
      container.innerHTML = html;
    }
    render();
  }

  function initAdmin() {
    let container = document.getElementById('adminContent');
    if (!container) return;
    let stats = getAdminStats();
    container.innerHTML = `
      <h3>Общая панель администрации</h3>
      <div class="mto-stats">
        <div class="mto-stat"><h1>${stats.staff}</h1><p>Сотрудники</p></div>
        <div class="mto-stat"><h1>${(stats.monthlyFOT/1000).toFixed(0)} тыс.₽</h1><p>Месячный ФОТ</p></div>
        <div class="mto-stat"><h1>${stats.requests}</h1><p>Заявки</p></div>
        <div class="mto-stat"><h1>${stats.stockItems}</h1><p>Единиц на складе</p></div>
        <div class="mto-stat"><h1>${stats.vehicles}</h1><p>Транспорт</p></div>
        <div class="mto-stat"><h1>${stats.emergencies}</h1><p>Активных аварий</p></div>
      </div>
    `;
  }

  function initStock() {
    let container = document.getElementById('stockContent');
    if (!container) return;
    let summary = getStockSummary();
    let html = `<h3>Остатки материалов</h3><table><tr><th>Название</th><th>Категория</th><th>Остаток</th><th>Мин.</th><th>Загрузка</th></tr>`;
    summary.forEach(m => {
      let pct = Math.min(m.percent, 100);
      let color = pct > 80 ? '#4caf50' : pct > 50 ? '#f39c12' : '#e74c3c';
      html += `<tr><td>${m.name}</td><td>${m.category}</td><td>${m.stock} ${m.unit}</td><td>${m.minStock}</td><td><div style="background:#e0e0e0;border-radius:10px;height:16px;width:100%;"><div style="height:100%;width:${pct}%;background:${color};border-radius:10px;"></div></div></td></tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;
  }

  function initHousing() {
    let container = document.getElementById('housingContent');
    if (!container) return;
    let stats = getHousingStats();
    container.innerHTML = `
      <h3>Сводка по району для ГБУ Жилищник</h3>
      <div class="mto-stats">
        <div class="mto-stat"><h1>${stats.totalAreas}</h1><p>Обслуживаемых участков</p></div>
        <div class="mto-stat"><h1>${stats.activeRequests}</h1><p>Активных заявок</p></div>
        <div class="mto-stat"><h1>${stats.completedRequests}</h1><p>Выполненных заявок</p></div>
        <div class="mto-stat"><h1>${stats.emergencyAlerts}</h1><p>Аварийных сигналов</p></div>
      </div>
      <p style="margin-top:20px;">Текущие участки: ${DATA.areas.map(a => a.name).join(', ')}</p>
    `;
  }

  function initAreaHead() {
    let container = document.getElementById('area_headContent');
    if (!container) return;
    function render(areaName) {
      areaName = areaName || DATA.areas[0].name;
      let reqs = getAreaRequests(areaName);
      let html = `<h3>Заявки по участку: ${areaName}</h3>`;
      if (reqs.length === 0) {
        html += `<p>Нет заявок для этого участка.</p>`;
      } else {
        html += `<table><tr><th>ID</th><th>Материал</th><th>Кол-во</th><th>Статус</th></tr>`;
        reqs.forEach(r => {
          html += `<tr><td>${r.id}</td><td>${r.material}</td><td>${r.quantity}</td><td>${r.status}</td></tr>`;
        });
        html += `</table>`;
      }
      html += `<h3 style="margin-top:20px;">Выбрать другой участок</h3>
        <select id="areaSelect">${DATA.areas.map(a => `<option value="${a.name}">${a.name}</option>`).join('')}</select>
        <button class="btn btn-primary" onclick="window._changeArea()">Показать</button>`;
      container.innerHTML = html;
      window._changeArea = function() {
        let sel = document.getElementById('areaSelect');
        render(sel.value);
      };
    }
    render();
  }

  // ---------- ПЕРЕОПРЕДЕЛЯЕМ showRole ДЛЯ ВЫЗОВА ИНИЦИАЛИЗАЦИЙ ----------
  const originalShowRole = window.showRole || function() {};
  window.showRole = function(roleKey) {
    originalShowRole(roleKey);
    const initMap = {
      director: initDirector,
      dispatcher: initDispatcher,
      warehouse_mgr: initWarehouseManager,
      area_head: initAreaHead,
      housing: initHousing,
      stock: initStock,
      admin: initAdmin,
      technical: initTechnical,
      transport: initTransportService,
      emergency: initEmergency
    };
    if (initMap[roleKey]) {
      // Инициализируем только если ещё не было
      if (!window['_inited_' + roleKey]) {
        window['_inited_' + roleKey] = true;
        initMap[roleKey]();
      }
    }
  };

  // Экспортируем функции в глобальную область для возможности вызова из HTML
  window.assignVehicleToRequest = assignVehicleToRequest;
  window.completeDelivery = completeDelivery;
  window.assignTeam = assignTeam;
  window.resolveAlert = resolveAlert;
  window.completeTask = completeTask;
  window.getTransportReport = getTransportReport;
  window.getAdminStats = getAdminStats;
  window.getStockSummary = getStockSummary;
  window.getHousingStats = getHousingStats;
  window.getAreaRequests = getAreaRequests;

  console.log('Обновление 2 загружено (роли)');
})();