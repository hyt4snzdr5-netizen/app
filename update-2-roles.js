// ==============================================================
//  ОБНОВЛЕНИЕ 2 – Функционал ролей
//  Версия 3.2.1 – часть 2
//  Подключать после update-1-base.js
// ==============================================================

(function() {
  'use strict';

  // Все функции для ролей (копируются из финального кода)
  function getAvailableVehicles() { /* ... */ }
  function assignVehicleToRequest(requestId, vehicleId) { /* ... */ }
  function completeDelivery(requestId) { /* ... */ }
  function assignTeam(alertId, teamId) { /* ... */ }
  function resolveAlert(alertId) { /* ... */ }
  function completeTask(taskId) { /* ... */ }
  function getTransportReport() { /* ... */ }
  function getAdminStats() { /* ... */ }
  function getStockSummary() { /* ... */ }
  function getHousingStats() { /* ... */ }
  function getAreaRequests(areaName) { /* ... */ }

  // Инициализация ролей
  function initDirector() { /* ... */ }
  function initDispatcher() { /* ... */ }
  function initWarehouseManager() { /* ... */ }
  function initEmergency() { /* ... */ }
  function initTechnical() { /* ... */ }
  function initTransportService() { /* ... */ }
  function initAdmin() { /* ... */ }
  function initStock() { /* ... */ }
  function initHousing() { /* ... */ }
  function initAreaHead() { /* ... */ }

  // Переопределяем showRole, чтобы она вызывала нужные инициализации
  const originalShowRole = window.showRole || function() {};
  window.showRole = function(roleKey) {
    originalShowRole(roleKey);
    // Вызов соответствующей init-функции
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
    if (initMap[roleKey]) initMap[roleKey]();
  };

  console.log('Обновление 2 загружено (роли)');
})();