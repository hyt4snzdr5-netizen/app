// ============================================================
//  МТО КУНЦЕВО – Кнопка отладки (автономное обновление)
//  Добавляет пункт меню или плавающую кнопку для вызова отладки.
//  Подключать после основного бандла mto-debug-bundle.js
// ============================================================
(function() {
  'use strict';

  // Ждём, пока загрузится основной модуль (openDebug должна стать доступной)
  function waitForOpenDebug(callback, attempts) {
    attempts = attempts || 0;
    if (typeof window.openDebug === 'function') {
      callback();
      return;
    }
    if (attempts > 20) { // ~10 секунд
      console.warn('Модуль отладки не загружен. Убедитесь, что mto-debug-bundle.js подключен.');
      return;
    }
    setTimeout(function() {
      waitForOpenDebug(callback, attempts + 1);
    }, 500);
  }

  function addButton() {
    // Проверяем, не добавлена ли уже кнопка
    if (document.getElementById('debugModeBtn') || document.getElementById('floatingDebugBtn')) {
      return;
    }

    // Ищем меню
    var nav = document.querySelector('#mainMenu, nav ul, .menu, .navigation, .navbar-nav, .header-nav, .top-menu');
    if (nav) {
      var li = document.createElement('li');
      li.innerHTML = '<a href="#" id="debugModeBtn">🐞 Отладка МТО</a>';
      nav.appendChild(li);
      document.getElementById('debugModeBtn').addEventListener('click', function(e) {
        e.preventDefault();
        window.openDebug();
      });
      console.log('✅ Кнопка отладки добавлена в меню');
    } else {
      // Меню не найдено – создаём плавающую кнопку
      var btn = document.createElement('button');
      btn.id = 'floatingDebugBtn';
      btn.innerHTML = '🐞';
      btn.title = 'Отладка МТО';
      btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #1976d2;
        color: white;
        border: none;
        font-size: 32px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.3);
        cursor: pointer;
        z-index: 999999;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
      `;
      btn.onmouseenter = function() {
        this.style.transform = 'scale(1.15)';
        this.style.boxShadow = '0 8px 32px rgba(25,118,210,0.5)';
      };
      btn.onmouseleave = function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 6px 24px rgba(0,0,0,0.3)';
      };
      btn.onclick = function() {
        if (typeof window.openDebug === 'function') {
          window.openDebug();
        } else {
          console.error('Модуль отладки не загружен. Подключите mto-debug-bundle.js');
        }
      };
      document.body.appendChild(btn);
      console.log('✅ Плавающая кнопка отладки добавлена');
    }
  }

  // Запускаем после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      waitForOpenDebug(addButton);
    });
  } else {
    waitForOpenDebug(addButton);
  }
})();