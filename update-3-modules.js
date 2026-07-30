// ==============================================================
//  ОБНОВЛЕНИЕ 3 – Модули (графики, карты, 3D, генплан, ERP и т.д.)
//  Версия 3.2.1 – часть 3
//  Подключать после update-2-roles.js
// ==============================================================

(function() {
  'use strict';

  // Все функции initCharts, initMap, initGIS, initOrganization, initLogistics,
  // initMasterplan, init3D, initDashboard, initFinance, initTransport,
  // initERP, initRealtimeMap – копируются из финального кода

  function initCharts() { /* ... */ }
  function initMap() { /* ... */ }
  function initGIS() { /* ... */ }
  function initOrganization() { /* ... */ }
  function initLogistics() { /* ... */ }
  function initMasterplan() { /* ... */ }
  function init3D() { /* ... */ }
  function initDashboard() { /* ... */ }
  function initFinance() { /* ... */ }
  function initTransport() { /* ... */ }
  function initERP() { /* ... */ }
  function initRealtimeMap() { /* ... */ }

  // Переопределяем initAll, чтобы она вызывала все модули
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
    // Настройка навигации и карточек ролей (если ещё не сделано)
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

  // Вызываем initAll после загрузки (если уже загружено)
  if (document.readyState === 'complete') initAll();
  else document.addEventListener('DOMContentLoaded', initAll);

})();