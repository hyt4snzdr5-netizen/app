/* ============================================================
   ИСПРАВЛЕНИЕ ОТОБРАЖЕНИЯ РАЗДЕЛОВ
   - Автоматический показ новостей после входа
   - Исправление активации секций
   ============================================================ */

(function() {
    'use strict';

    console.log('🔧 Загрузка исправления отображения...');

    // Ждём, пока основное приложение и update_final.js загрузятся
    function waitForApp() {
        // Проверяем, что есть необходимые элементы
        const newsSection = document.getElementById('section-news');
        const profileSection = document.getElementById('section-profile');
        const settingsSection = document.getElementById('section-settings');

        if (!newsSection || !profileSection || !settingsSection) {
            console.log('⏳ Ожидание создания разделов...');
            setTimeout(waitForApp, 300);
            return;
        }

        console.log('✅ Все разделы созданы, применяем исправление...');

        // ============================================================
        // 1. Перехватываем выбор роли (enterApp)
        // ============================================================
        const originalEnterApp = window.enterApp;
        if (originalEnterApp) {
            window.enterApp = function(role) {
                // Вызываем оригинальную функцию
                originalEnterApp(role);

                // Через небольшой таймаут переключаем на новости
                setTimeout(function() {
                    showNewsSection();
                }, 500);
            };
            console.log('✅ Перехват enterApp установлен');
        } else {
            console.warn('⚠️ enterApp не найдена, используем альтернативный метод');
        }

        // ============================================================
        // 2. Функция показа новостей
        // ============================================================
        function showNewsSection() {
            const newsSection = document.getElementById('section-news');
            if (!newsSection) {
                console.warn('⚠️ Секция новостей не найдена');
                return;
            }

            // Скрываем все секции
            document.querySelectorAll('.app-content .section').forEach(function(s) {
                s.classList.remove('active');
            });

            // Показываем новости
            newsSection.classList.add('active');
            console.log('📰 Новости активированы');
        }

        // ============================================================
        // 3. Если пользователь уже авторизован и выбрана роль,
        //    но новости не показаны — показываем их
        // ============================================================
        if (currentUser && currentUser.role) {
            // Проверяем, активна ли секция новостей
            const newsSection = document.getElementById('section-news');
            if (newsSection && !newsSection.classList.contains('active')) {
                setTimeout(showNewsSection, 400);
                console.log('📰 Новости активированы для текущего пользователя');
            }
        }

        // ============================================================
        // 4. Дополнительно: при клике на бургер-меню
        //    пункты "Новости", "Профиль", "Настройки" уже работают
        //    через вызовы openNews(), openProfile(), openSettingsNew()
        //    Они уже определены в update_final.js.
        // ============================================================

        // ============================================================
        // 5. Если openNews не определена — определим её здесь
        // ============================================================
        if (typeof window.openNews !== 'function') {
            window.openNews = function() {
                const dropdown = document.getElementById('burgerDropdown');
                if (dropdown) dropdown.style.display = 'none';
                document.querySelectorAll('.app-content .section').forEach(function(s) {
                    s.classList.remove('active');
                });
                const news = document.getElementById('section-news');
                if (news) news.classList.add('active');
                console.log('📰 Открыты новости');
            };
            console.log('✅ openNews определена');
        }

        if (typeof window.openProfile !== 'function') {
            window.openProfile = function() {
                const dropdown = document.getElementById('burgerDropdown');
                if (dropdown) dropdown.style.display = 'none';
                document.querySelectorAll('.app-content .section').forEach(function(s) {
                    s.classList.remove('active');
                });
                const profile = document.getElementById('section-profile');
                if (profile) profile.classList.add('active');
                console.log('👤 Открыт профиль');
            };
            console.log('✅ openProfile определена');
        }

        if (typeof window.openSettingsNew !== 'function') {
            window.openSettingsNew = function() {
                const dropdown = document.getElementById('burgerDropdown');
                if (dropdown) dropdown.style.display = 'none';
                document.querySelectorAll('.app-content .section').forEach(function(s) {
                    s.classList.remove('active');
                });
                const settings = document.getElementById('section-settings');
                if (settings) settings.classList.add('active');
                console.log('⚙️ Открыты настройки');
            };
            console.log('✅ openSettingsNew определена');
        }

        if (typeof window.openHotline !== 'function') {
            window.openHotline = function() {
                const drawer = document.getElementById('hotlineDrawer');
                const overlay = document.getElementById('hotlineOverlay');
                if (drawer) {
                    drawer.style.bottom = '0';
                    if (overlay) overlay.style.display = 'block';
                }
                const dropdown = document.getElementById('burgerDropdown');
                if (dropdown) dropdown.style.display = 'none';
                console.log('📞 Открыта горячая линия');
            };
            console.log('✅ openHotline определена');
        }

        // ============================================================
        // 6. Тост-уведомление об успешной загрузке
        // ============================================================
        if (typeof showToast === 'function') {
            setTimeout(function() {
                showToast('✅ Исправление применено');
            }, 800);
        }

        console.log('✅ Исправление отображения успешно активировано');
    }

    // Запускаем ожидание
    waitForApp();

})();