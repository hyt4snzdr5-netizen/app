// ==============================================================
//  ОБНОВЛЕНИЕ 1 – Базовое (интерфейс, данные, исправления)
//  Версия 3.2.1 – часть 1
//  Ключ Яндекс.Карт: ab2476bf-2ea1-4863-87a0-654eb6b41e0f
// ==============================================================

(function() {
  'use strict';

  const CFG = {
    YANDEX_KEY: 'ab2476bf-2ea1-4863-87a0-654eb6b41e0f',
    APP_ID: 'mtoDebugApp',
    CONTAINER: 'mtoContainer',
    LOADER: 'mtoLoader',
    VERSION: '3.2.1'
  };

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
    structure: { /* ... полная структура из финального кода ... */ },
    finance: { /* ... */ },
    beforeAfter: { /* ... */ },
    transport: { /* ... */ },
    erp: { /* ... */ },
    emergency: { /* ... */ },
    technical: { /* ... */ },
    areas: [ /* ... */ ]
  };

  // Вспомогательные функции (sumObject, calcStaff, calcFOT, calcRoute, optimizeRoutes, ERP-функции) – все из финального кода.
  // ... (здесь нужно вставить все вспомогательные функции, чтобы они были доступны для ролей и модулей)

  // Функции навигации
  function showMain() { /* ... */ }
  function showSection(sectionId) { /* ... */ }
  function showRole(roleKey) { /* ... */ }

  // Генерация HTML (с главным экраном и секциями для ролей – пустыми)
  function buildHTML() { /* ... полный HTML из финального кода ... */ }

  // Исправленные функции addButton и openDebug
  function addButton() { /* ... исправленная версия ... */ }
  function openDebug() { /* ... исправленная версия ... */ }

  // Загрузка зависимостей и initAll (пустой, только скрывает лоадер)
  function loadDependencies(callback) { /* ... */ }
  function initAll() {
    let loader = document.getElementById(CFG.LOADER);
    if (loader) loader.style.display = 'none';
    // Здесь пока ничего не инициализируем – это сделают обновления 2 и 3
    console.log('Обновление 1 загружено (база)');
  }

  // Старт
  if (document.readyState === 'complete') addButton();
  else document.addEventListener('DOMContentLoaded', addButton);

})();