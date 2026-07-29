/* ============================================================
   ИСПРАВЛЕНИЕ ОШИБОК И ДОПОЛНЕНИЕ ФУНКЦИОНАЛА
   - Исправляет closeHotline, openSettingsNew
   - Добавляет роли: Управление МТО, Техническая служба, Транспортная служба
   - Удаляет все эмодзи из меню (бургер, нижняя навигация, быстрые кнопки)
   - Показывает фото профиля в верхней аватарке
   ============================================================ */

(function() {
    'use strict';

    console.log('🔧 Загрузка исправления fix2...');

    // Ждём, пока основное приложение и update_complete.js загрузятся
    function waitForApp() {
        if (typeof DB === 'undefined' || typeof currentUser === 'undefined') {
            console.log('⏳ Ожидание данных приложения...');
            setTimeout(waitForApp, 200);
            return;
        }
        if (window.__CMTO_FIX2_LOADED) {
            console.warn('⚠️ Исправление уже загружено');
            return;
        }
        window.__CMTO_FIX2_LOADED = true;

        console.log('✅ Приложение готово, применяем исправления...');

        // ============================================================
        // 1. ОПРЕДЕЛЯЕМ ГЛОБАЛЬНЫЕ ФУНКЦИИ (если они не определены)
        // ============================================================
        if (typeof window.closeHotline !== 'function') {
            window.closeHotline = function() {
                const drawer = document.getElementById('hotlineDrawer');
                const overlay = document.getElementById('hotlineOverlay');
                if (drawer) drawer.style.bottom = '-320px';
                if (overlay) overlay.style.display = 'none';
                console.log('📞 Горячая линия закрыта');
            };
            console.log('✅ closeHotline определена глобально');
        }

        if (typeof window.openHotline !== 'function') {
            window.openHotline = function() {
                const drawer = document.getElementById('hotlineDrawer');
                const overlay = document.getElementById('hotlineOverlay');
                if (drawer) drawer.style.bottom = '0';
                if (overlay) overlay.style.display = 'block';
                const dropdown = document.getElementById('burgerDropdown');
                if (dropdown) dropdown.style.display = 'none';
                console.log('📞 Горячая линия открыта');
            };
            console.log('✅ openHotline определена глобально');
        }

        if (typeof window.openSettingsNew !== 'function') {
            window.openSettingsNew = function() {
                const dropdown = document.getElementById('burgerDropdown');
                if (dropdown) dropdown.style.display = 'none';
                document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                const settings = document.getElementById('section-settings');
                if (settings) settings.classList.add('active');
                console.log('⚙️ Открыты настройки');
            };
            console.log('✅ openSettingsNew определена глобально');
        }

        if (typeof window.openProfile !== 'function') {
            window.openProfile = function() {
                const dropdown = document.getElementById('burgerDropdown');
                if (dropdown) dropdown.style.display = 'none';
                document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                const profile = document.getElementById('section-profile');
                if (profile) profile.classList.add('active');
                console.log('👤 Открыт профиль');
            };
            console.log('✅ openProfile определена глобально');
        }

        if (typeof window.openNews !== 'function') {
            window.openNews = function() {
                const dropdown = document.getElementById('burgerDropdown');
                if (dropdown) dropdown.style.display = 'none';
                document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                const news = document.getElementById('section-news');
                if (news) news.classList.add('active');
                console.log('📰 Открыты новости');
            };
            console.log('✅ openNews определена глобально');
        }

        // ============================================================
        // 2. ДОБАВЛЯЕМ НОВЫЕ РОЛИ
        // ============================================================
        function addMissingRoles() {
            const roleGrid = document.getElementById('roleGrid');
            if (!roleGrid) return;

            const newRoles = [
                { id: 'mto_management', icon: '🏢', label: 'Управление МТО' },
                { id: 'technical_service', icon: '🔧', label: 'Техническая служба' },
                { id: 'transport_service', icon: '🚛', label: 'Транспортная служба' }
            ];

            newRoles.forEach(role => {
                if (document.querySelector(`[data-role="${role.id}"]`)) return;
                const card = document.createElement('div');
                card.className = 'role-card';
                card.dataset.role = role.id;
                card.innerHTML = `
                    <span class="role-icon">${role.icon}</span>
                    <span class="role-name">${role.label}</span>
                `;
                card.addEventListener('click', function() {
                    const r = this.dataset.role;
                    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                    // Создаём секцию для роли
                    const content = document.getElementById('appContent');
                    let section = document.getElementById('section-' + r);
                    if (!section) {
                        section = document.createElement('div');
                        section.className = 'section';
                        section.id = 'section-' + r;
                        section.innerHTML = `
                            <h2 class="section-title">${role.icon} ${role.label}</h2>
                            <div style="text-align:center;padding:40px 20px;color:#888;">
                                <span style="font-size:48px;display:block;margin-bottom:16px;">${role.icon}</span>
                                <p style="font-size:18px;font-weight:600;color:#004b87;">Раздел ${role.label}</p>
                                <p style="font-size:14px;">Функционал в разработке</p>
                            </div>
                        `;
                        content.appendChild(section);
                    }
                    document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                    section.classList.add('active');
                    document.getElementById('roleSelection').style.display = 'none';
                    document.getElementById('appContent').style.display = 'block';
                    document.getElementById('bottomNav').style.display = 'flex';
                    document.getElementById('userName').textContent = currentUser.name || 'Пользователь';
                    document.getElementById('userRole').textContent = role.label;
                    document.getElementById('userAvatar').textContent = role.icon;
                    // Обновляем роль в currentUser
                    currentUser.role = r;
                    const user = DB.users.find(u => u.id === currentUser.id);
                    if (user) user.role = r;
                    saveState();
                });
                roleGrid.appendChild(card);
            });
            console.log('✅ Добавлены новые роли');
        }

        // ============================================================
        // 3. УБИРАЕМ ЭМОДЗИ ИЗ МЕНЮ (бургер, нижняя навигация, быстрые кнопки)
        // ============================================================
        function removeEmojisFromMenus() {
            // Бургер-меню
            const burgerDropdown = document.getElementById('burgerDropdown');
            if (burgerDropdown) {
                const items = burgerDropdown.querySelectorAll('div[onclick]');
                items.forEach(item => {
                    // Удаляем эмодзи в начале текста
                    const text = item.textContent.replace(/[^\w\sа-яА-ЯёЁ]/g, '').trim();
                    // Оставляем только текст (иконки удаляем)
                    // Но в HTML они могут быть внутри <span> или просто текстом
                    // Просто заменяем содержимое на чистый текст
                    const cleanText = text.replace(/[^\w\sа-яА-ЯёЁ]/g, '').trim();
                    if (cleanText) {
                        item.textContent = cleanText;
                    }
                });
                console.log('✅ Эмодзи удалены из бургер-меню');
            }

            // Нижняя навигация (bottom-nav)
            const bottomNav = document.getElementById('bottomNav');
            if (bottomNav) {
                const navItems = bottomNav.querySelectorAll('.nav-item');
                navItems.forEach(item => {
                    const iconSpan = item.querySelector('.nav-icon');
                    if (iconSpan) {
                        // Удаляем эмодзи из иконки, оставляем только текст
                        const text = iconSpan.textContent.replace(/[^\w\s]/g, '').trim();
                        if (text) {
                            iconSpan.textContent = text;
                        } else {
                            // Если ничего не осталось, убираем span
                            iconSpan.remove();
                        }
                    }
                    // Также удаляем эмодзи из текста label (если есть)
                    const label = item.childNodes[item.childNodes.length - 1];
                    if (label && label.nodeType === 3) {
                        const cleanLabel = label.textContent.replace(/[^\w\sа-яА-ЯёЁ]/g, '').trim();
                        if (cleanLabel) {
                            label.textContent = cleanLabel;
                        }
                    }
                });
                console.log('✅ Эмодзи удалены из нижней навигации');
            }

            // Быстрые кнопки на главном экране (в новостях)
            const newsSection = document.getElementById('section-news');
            if (newsSection) {
                const quickButtons = newsSection.querySelectorAll('[onclick*="openSection"]');
                quickButtons.forEach(btn => {
                    const spans = btn.querySelectorAll('span');
                    spans.forEach(span => {
                        if (span.textContent.match(/[^\w\s]/)) {
                            const clean = span.textContent.replace(/[^\w\s]/g, '').trim();
                            if (clean) span.textContent = clean;
                        }
                    });
                });
                console.log('✅ Эмодзи удалены из быстрых кнопок');
            }

            // Также в меню выбора ролей (role-grid) могут быть эмодзи
            const roleGrid = document.getElementById('roleGrid');
            if (roleGrid) {
                const roleCards = roleGrid.querySelectorAll('.role-card .role-icon');
                roleCards.forEach(icon => {
                    const text = icon.textContent.replace(/[^\w\s]/g, '').trim();
                    if (text) {
                        icon.textContent = text;
                    } else {
                        icon.textContent = '•';
                    }
                });
                console.log('✅ Эмодзи удалены из карточек ролей');
            }
        }

        // ============================================================
        // 4. ПОКАЗЫВАЕМ ФОТО ПРОФИЛЯ В ВЕРХНЕЙ АВАТАРКЕ
        // ============================================================
        function updateHeaderAvatar() {
            const avatar = document.querySelector('.app-header .avatar');
            if (!avatar) return;

            // Если есть фото в currentUser, показываем его
            if (currentUser.photo) {
                avatar.style.backgroundImage = `url(${currentUser.photo})`;
                avatar.style.backgroundSize = 'cover';
                avatar.style.backgroundPosition = 'center';
                avatar.textContent = ''; // убираем текст
                avatar.style.color = 'transparent';
                console.log('✅ Фото профиля отображается в шапке');
            } else {
                // Если фото нет, показываем инициалы или иконку
                const name = currentUser.name || 'Пользователь';
                const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                avatar.textContent = initials || '👤';
                avatar.style.backgroundImage = 'none';
                avatar.style.color = 'white';
                avatar.style.background = '#004b87';
            }
        }

        // ============================================================
        // 5. ПЕРЕХВАТЫВАЕМ СОХРАНЕНИЕ ПРОФИЛЯ, ЧТОБЫ ОБНОВЛЯТЬ АВАТАРКУ
        // ============================================================
        function hookProfileSave() {
            const originalSaveProfile = window.saveProfileAll;
            if (typeof originalSaveProfile === 'function') {
                window.saveProfileAll = function() {
                    originalSaveProfile();
                    // После сохранения обновляем аватарку
                    setTimeout(updateHeaderAvatar, 100);
                };
                console.log('✅ Перехвачен saveProfileAll для обновления аватара');
            }

            // Также при загрузке фото
            const photoInput = document.getElementById('photoInput');
            if (photoInput) {
                const originalChange = photoInput.onchange;
                photoInput.onchange = function(e) {
                    if (originalChange) originalChange.call(this, e);
                    setTimeout(updateHeaderAvatar, 200);
                };
                console.log('✅ Перехвачен change фото для обновления аватара');
            }
        }

        // ============================================================
        // 6. ЗАПУСК ВСЕХ ИСПРАВЛЕНИЙ
        // ============================================================
        try {
            addMissingRoles();
            removeEmojisFromMenus();
            updateHeaderAvatar();
            hookProfileSave();

            // Дополнительно: переопределяем createHotlineDrawer, чтобы не было ошибки
            // Но это уже сделано в update_complete.js, просто проверим
            if (typeof window.createHotlineDrawer !== 'function') {
                // Если нет, создадим простую версию
                console.log('⚠️ createHotlineDrawer не найдена, создаём простую');
                window.createHotlineDrawer = function() {
                    // уже создана в update_complete.js, но если нет - ничего страшного
                };
            }

            // Принудительно обновляем аватарку через интервал (на случай, если фото загрузится позже)
            setInterval(updateHeaderAvatar, 5000);

            console.log('✅ Все исправления применены успешно');
        } catch (e) {
            console.error('❌ Ошибка при применении исправлений:', e);
        }

        // Если showToast доступна, показываем уведомление
        if (typeof showToast === 'function') {
            setTimeout(function() {
                showToast('✅ Исправления загружены');
            }, 600);
        }

        console.log('🔧 Исправление fix2 завершено');
    }

    // Запускаем ожидание
    waitForApp();

})();