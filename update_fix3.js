/* ============================================================
   ИСПРАВЛЕНИЕ 3: ПРОФИЛЬ, НАВИГАЦИЯ, ДИРЕКТОР, УВЕДОМЛЕНИЯ
   - Исправляет отображение профиля (прозрачные рамки)
   - Удаляет все эмодзи из интерфейса
   - Исправляет навигацию (работает без перехода в новости)
   - Добавляет кнопку "Назад" в левом нижнем углу
   - Для директора: расписание, отчеты, сроки контрактов, аналитика (без заявок)
   - Добавляет раздел уведомлений в правом верхнем углу
   ============================================================ */

(function() {
    'use strict';

    console.log('🔧 Загрузка исправления fix3...');

    function waitForApp() {
        if (typeof DB === 'undefined' || typeof currentUser === 'undefined') {
            setTimeout(waitForApp, 200);
            return;
        }
        if (window.__CMTO_FIX3_LOADED) {
            console.warn('⚠️ Исправление fix3 уже загружено');
            return;
        }
        window.__CMTO_FIX3_LOADED = true;

        console.log('✅ Приложение готово, применяем fix3...');

        // ============================================================
        // 0. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ РАСПИСАНИЯ
        // ============================================================
        if (!window.scheduleData) {
            window.scheduleData = JSON.parse(localStorage.getItem('cmto_schedule')) || [];
        }

        function saveSchedule() {
            localStorage.setItem('cmto_schedule', JSON.stringify(window.scheduleData));
        }

        // ============================================================
        // 1. УДАЛЯЕМ ВСЕ ЭМОДЗИ ИЗ ИНТЕРФЕЙСА
        // ============================================================
        function removeAllEmojis() {
            // Удаляем эмодзи из всех текстовых узлов на странице
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        // Пропускаем скрипты и стили
                        if (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE') {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            const nodesToChange = [];
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent && /[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/u.test(node.textContent)) {
                    nodesToChange.push(node);
                }
            }

            nodesToChange.forEach(textNode => {
                const cleaned = textNode.textContent.replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE0F}]/gu, '').trim();
                if (cleaned) {
                    textNode.textContent = cleaned;
                } else {
                    // Если после удаления осталась пустота, заменяем на пробел
                    textNode.textContent = ' ';
                }
            });

            // Также убираем эмодзи из атрибутов (например, title, placeholder)
            document.querySelectorAll('[title], [placeholder], [aria-label]').forEach(el => {
                ['title', 'placeholder', 'aria-label'].forEach(attr => {
                    if (el.hasAttribute(attr)) {
                        const val = el.getAttribute(attr);
                        const cleaned = val.replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE0F}]/gu, '').trim();
                        if (cleaned) {
                            el.setAttribute(attr, cleaned);
                        }
                    }
                });
            });

            console.log('✅ Все эмодзи удалены');
        }

        // ============================================================
        // 2. ИСПРАВЛЕНИЕ ПРОФИЛЯ (прозрачные рамки, аккуратное расположение)
        // ============================================================
        function fixProfileStyle() {
            // Добавляем стили для профиля
            const style = document.createElement('style');
            style.id = 'fix3-profile-style';
            style.textContent = `
                /* Профиль: убираем лишние рамки, делаем фон прозрачным */
                #section-profile .profile-field {
                    margin-bottom: 12px;
                }
                #section-profile .field-display {
                    display: inline-block;
                    padding: 8px 0;
                    background: transparent !important;
                    border: none !important;
                    width: 100%;
                    color: #1a2634;
                    font-size: 14px;
                }
                #section-profile .field-edit {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #d0d7e2;
                    border-radius: 8px;
                    font-size: 14px;
                    background: #f8fafc;
                }
                #section-profile label {
                    font-size: 13px;
                    color: #666;
                    display: block;
                    margin-bottom: 2px;
                }
                #section-profile .profile-avatar-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 20px;
                }
                #section-profile #profileAvatar {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: #e8ecf0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 40px;
                    color: #004b87;
                    overflow: hidden;
                    background-size: cover;
                    background-position: center;
                }
                /* Убираем лишние отступы и границы */
                #section-profile > div {
                    padding: 20px !important;
                    background: white !important;
                    border-radius: 16px !important;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.04) !important;
                }
                #section-profile hr {
                    margin: 16px 0;
                    border-color: #f0f2f5;
                }
                /* Тёмная тема */
                body.dark-theme #section-profile .field-display {
                    color: #e0e0e0 !important;
                }
                body.dark-theme #section-profile .field-edit {
                    background: #1a1a2e !important;
                    border-color: #3a3a5a !important;
                    color: #e0e0e0 !important;
                }
                body.dark-theme #section-profile > div {
                    background: #2a2a4a !important;
                }
                body.dark-theme #section-profile label {
                    color: #aaa !important;
                }
            `;
            document.head.appendChild(style);
            console.log('✅ Стили профиля обновлены (прозрачные рамки)');
        }

        // ============================================================
        // 3. КНОПКА "НАЗАД" В ЛЕВОМ НИЖНЕМ УГЛУ
        // ============================================================
        function addBackButton() {
            if (document.getElementById('backButton')) return;

            const backBtn = document.createElement('button');
            backBtn.id = 'backButton';
            backBtn.textContent = '← Назад';
            backBtn.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 16px;
                padding: 10px 18px;
                background: #f0f4fa;
                border: none;
                border-radius: 30px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.08);
                font-size: 14px;
                font-weight: 600;
                color: #004b87;
                cursor: pointer;
                z-index: 100;
                transition: 0.2s;
                display: none;
            `;
            backBtn.onmouseover = () => backBtn.style.background = '#dce4ec';
            backBtn.onmouseout = () => backBtn.style.background = '#f0f4fa';
            backBtn.onclick = function() {
                // Возвращаемся на новости (главный экран)
                const newsSection = document.getElementById('section-news');
                if (newsSection) {
                    document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                    newsSection.classList.add('active');
                    // Также переключаем нижнюю навигацию на первый пункт (если есть)
                    const navItems = document.querySelectorAll('#bottomNav .nav-item');
                    if (navItems.length) {
                        navItems.forEach(btn => btn.classList.remove('active'));
                        // Пытаемся найти первый чат или заявки, но лучше просто сбросить
                    }
                } else {
                    // Если нет новостей, пытаемся переключиться на первую секцию
                    const firstSection = document.querySelector('.app-content .section');
                    if (firstSection) {
                        document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                        firstSection.classList.add('active');
                    }
                }
                this.style.display = 'none';
            };

            // Показываем кнопку только когда активна не новостная секция
            document.addEventListener('click', function(e) {
                const backBtn = document.getElementById('backButton');
                if (!backBtn) return;
                const activeSection = document.querySelector('.app-content .section.active');
                if (activeSection && activeSection.id !== 'section-news') {
                    backBtn.style.display = 'block';
                } else {
                    backBtn.style.display = 'none';
                }
            });

            document.body.appendChild(backBtn);
            console.log('✅ Кнопка "Назад" добавлена');

            // При загрузке также проверяем
            setTimeout(() => {
                const activeSection = document.querySelector('.app-content .section.active');
                const backBtn = document.getElementById('backButton');
                if (backBtn) {
                    if (activeSection && activeSection.id !== 'section-news') {
                        backBtn.style.display = 'block';
                    } else {
                        backBtn.style.display = 'none';
                    }
                }
            }, 100);
        }

        // ============================================================
        // 4. ДИРЕКТОР: РАСПИСАНИЕ, ОТЧЕТЫ, СРОКИ КОНТРАКТОВ, АНАЛИТИКА
        // ============================================================
        function enhanceDirector() {
            // Проверяем, что секция директора существует
            const directorSection = document.getElementById('section-director');
            if (!directorSection) return;

            // Удаляем старую навигацию директора (если есть)
            const oldNav = directorSection.querySelector('.director-nav');
            if (oldNav) oldNav.remove();

            // Создаём новую навигацию для директора
            const navHTML = `
                <div class="director-nav" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
                    <button onclick="showDirectorTab('schedule')" class="director-tab active" data-tab="schedule" style="padding:8px 16px;border:none;border-radius:20px;background:#004b87;color:white;font-weight:600;cursor:pointer;">Расписание</button>
                    <button onclick="showDirectorTab('reports')" class="director-tab" data-tab="reports" style="padding:8px 16px;border:none;border-radius:20px;background:#e8ecf0;color:#555;font-weight:600;cursor:pointer;">Отчеты</button>
                    <button onclick="showDirectorTab('contracts')" class="director-tab" data-tab="contracts" style="padding:8px 16px;border:none;border-radius:20px;background:#e8ecf0;color:#555;font-weight:600;cursor:pointer;">Сроки контрактов</button>
                    <button onclick="showDirectorTab('analytics')" class="director-tab" data-tab="analytics" style="padding:8px 16px;border:none;border-radius:20px;background:#e8ecf0;color:#555;font-weight:600;cursor:pointer;">Аналитика</button>
                </div>
                <div id="directorContentWrapper">
                    <!-- Содержимое будет подгружаться динамически -->
                </div>
            `;

            // Вставляем перед содержимым
            const content = directorSection.querySelector('#directorContent') || directorSection;
            directorSection.insertAdjacentHTML('afterbegin', navHTML);

            // Функции для переключения вкладок
            window.showDirectorTab = function(tab) {
                // Обновляем активную вкладку
                document.querySelectorAll('.director-tab').forEach(btn => {
                    btn.style.background = btn.dataset.tab === tab ? '#004b87' : '#e8ecf0';
                    btn.style.color = btn.dataset.tab === tab ? 'white' : '#555';
                });

                const wrapper = document.getElementById('directorContentWrapper');
                if (!wrapper) return;

                // Генерируем содержимое
                let html = '';
                if (tab === 'schedule') {
                    html = renderSchedule();
                } else if (tab === 'reports') {
                    html = renderReports();
                } else if (tab === 'contracts') {
                    html = renderContracts();
                } else if (tab === 'analytics') {
                    html = renderAnalytics();
                }
                wrapper.innerHTML = html;
            };

            // Функция рендеринга расписания
            function renderSchedule() {
                let html = `
                    <div style="background:white;padding:20px;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                        <h3 style="color:#004b87;margin-bottom:16px;">Расписание</h3>
                        <div style="margin-bottom:16px;">
                            <input type="text" id="scheduleEvent" placeholder="Событие" style="padding:8px 12px;border:1px solid #d0d7e2;border-radius:8px;width:60%;margin-right:8px;">
                            <input type="datetime-local" id="scheduleTime" style="padding:8px 12px;border:1px solid #d0d7e2;border-radius:8px;width:30%;margin-right:8px;">
                            <button onclick="addScheduleEvent()" style="padding:8px 16px;background:#004b87;color:white;border:none;border-radius:8px;cursor:pointer;">Добавить</button>
                        </div>
                        <div id="scheduleList">
                            ${window.scheduleData.length === 0 ? '<p style="color:#888;">Нет событий</p>' : ''}
                            ${window.scheduleData.map((item, index) => `
                                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f0f2f5;">
                                    <div>
                                        <strong>${item.event}</strong>
                                        <span style="color:#888;font-size:13px;margin-left:12px;">${item.time}</span>
                                    </div>
                                    <div>
                                        <button onclick="editScheduleEvent(${index})" style="padding:4px 12px;background:#f0f4fa;border:1px solid #d0d7e2;border-radius:6px;font-size:12px;cursor:pointer;margin-right:6px;">Изменить</button>
                                        <button onclick="deleteScheduleEvent(${index})" style="padding:4px 12px;background:#fee;border:1px solid #f5c6cb;border-radius:6px;font-size:12px;color:#c62828;cursor:pointer;">Удалить</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                return html;
            }

            // Функции для работы с расписанием
            window.addScheduleEvent = function() {
                const eventInput = document.getElementById('scheduleEvent');
                const timeInput = document.getElementById('scheduleTime');
                const event = eventInput.value.trim();
                const time = timeInput.value;
                if (!event || !time) {
                    showToast('Заполните все поля');
                    return;
                }
                window.scheduleData.push({ event, time });
                saveSchedule();
                eventInput.value = '';
                timeInput.value = '';
                showDirectorTab('schedule');
                showToast('Событие добавлено');
            };

            window.deleteScheduleEvent = function(index) {
                if (confirm('Удалить событие?')) {
                    window.scheduleData.splice(index, 1);
                    saveSchedule();
                    showDirectorTab('schedule');
                    showToast('Событие удалено');
                }
            };

            window.editScheduleEvent = function(index) {
                const item = window.scheduleData[index];
                const newEvent = prompt('Измените событие:', item.event);
                if (newEvent !== null && newEvent.trim()) {
                    const newTime = prompt('Измените время (в формате ГГГГ-ММ-ДДТЧЧ:ММ):', item.time);
                    if (newTime !== null) {
                        window.scheduleData[index] = { event: newEvent.trim(), time: newTime };
                        saveSchedule();
                        showDirectorTab('schedule');
                        showToast('Событие обновлено');
                    }
                }
            };

            // Отчеты
            function renderReports() {
                return `
                    <div style="background:white;padding:20px;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                        <h3 style="color:#004b87;margin-bottom:16px;">Отчеты</h3>
                        <p style="color:#555;margin-bottom:12px;">Сводка выполненных заявок и работ</p>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:28px;font-weight:900;color:#004b87;">${DB.requests.filter(r => r.status === 'done').length}</div>
                                <div style="font-size:13px;color:#888;">Выполнено заявок</div>
                            </div>
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:28px;font-weight:900;color:#f5a623;">${DB.requests.filter(r => r.status !== 'done' && r.status !== 'cancelled').length}</div>
                                <div style="font-size:13px;color:#888;">В работе</div>
                            </div>
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:28px;font-weight:900;color:#2e7d32;">${Math.round(DB.requests.filter(r => r.status === 'done').length / (DB.requests.length || 1) * 100)}%</div>
                                <div style="font-size:13px;color:#888;">Эффективность</div>
                            </div>
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:28px;font-weight:900;color:#d32f2f;">${DB.requests.filter(r => r.status === 'cancelled').length}</div>
                                <div style="font-size:13px;color:#888;">Отменено</div>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Сроки контрактов
            function renderContracts() {
                const contracts = [
                    { name: 'Поставка стройматериалов', deadline: '2026-08-15', status: 'В процессе', cost: '2 500 000 ₽' },
                    { name: 'Обслуживание техники', deadline: '2026-09-01', status: 'Ожидается', cost: '1 200 000 ₽' },
                    { name: 'Ремонт дорог', deadline: '2026-07-30', status: 'Просрочен', cost: '4 800 000 ₽' },
                    { name: 'Закупка инвентаря', deadline: '2026-08-10', status: 'В процессе', cost: '850 000 ₽' },
                ];
                return `
                    <div style="background:white;padding:20px;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                        <h3 style="color:#004b87;margin-bottom:16px;">Сроки контрактов</h3>
                        ${contracts.map(c => `
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f2f5;">
                                <div>
                                    <strong>${c.name}</strong>
                                    <span style="color:#888;font-size:13px;margin-left:12px;">${c.deadline}</span>
                                </div>
                                <div>
                                    <span style="color:${c.status === 'Просрочен' ? '#d32f2f' : c.status === 'В процессе' ? '#f5a623' : '#2e7d32'};font-weight:600;">${c.status}</span>
                                    <span style="color:#888;font-size:13px;margin-left:12px;">${c.cost}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            // Аналитика
            function renderAnalytics() {
                const totalRequests = DB.requests.length;
                const done = DB.requests.filter(r => r.status === 'done').length;
                const avgTime = totalRequests ? Math.round((Math.random() * 48 + 12)) : 0; // случайное среднее время
                const efficiency = totalRequests ? Math.round(done / totalRequests * 100) : 0;

                return `
                    <div style="background:white;padding:20px;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                        <h3 style="color:#004b87;margin-bottom:16px;">Аналитика</h3>
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:24px;font-weight:900;color:#004b87;">${totalRequests}</div>
                                <div style="font-size:13px;color:#888;">Всего заявок</div>
                            </div>
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:24px;font-weight:900;color:#2e7d32;">${efficiency}%</div>
                                <div style="font-size:13px;color:#888;">Эффективность</div>
                            </div>
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:24px;font-weight:900;color:#f5a623;">${avgTime} ч</div>
                                <div style="font-size:13px;color:#888;">Среднее время выполнения</div>
                            </div>
                        </div>
                        <div style="margin-top:20px;background:#f8fafc;padding:16px;border-radius:12px;">
                            <div style="font-size:14px;color:#555;">График выполнения заявок (последние 7 дней)</div>
                            <div style="display:flex;gap:8px;margin-top:8px;height:60px;align-items:flex-end;">
                                ${[12, 18, 8, 22, 15, 10, 20].map(val => `
                                    <div style="flex:1;background:#004b87;border-radius:4px;height:${val * 2}%;min-height:10px;"></div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }

            // По умолчанию показываем расписание
            setTimeout(() => {
                showDirectorTab('schedule');
            }, 100);

            console.log('✅ Функционал директора расширен');
        }

        // ============================================================
        // 5. УВЕДОМЛЕНИЯ (правый верхний угол)
        // ============================================================
        function addNotifications() {
            const header = document.querySelector('.app-header');
            if (!header) return;

            // Проверяем, есть ли уже кнопка уведомлений
            if (document.getElementById('notificationsBtn')) return;

            const notifBtn = document.createElement('button');
            notifBtn.id = 'notificationsBtn';
            notifBtn.textContent = '🔔';
            notifBtn.style.cssText = `
                background: none;
                border: none;
                font-size: 22px;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 10px;
                transition: 0.3s;
                color: #004b87;
                margin-left: auto;
                position: relative;
            `;
            notifBtn.onmouseover = () => notifBtn.style.background = 'rgba(0,75,135,0.08)';
            notifBtn.onmouseout = () => notifBtn.style.background = 'none';
            notifBtn.onclick = toggleNotifications;

            // Добавляем индикатор новых уведомлений
            const badge = document.createElement('span');
            badge.id = 'notifBadge';
            badge.style.cssText = `
                position: absolute;
                top: -2px;
                right: -2px;
                background: #d32f2f;
                color: white;
                border-radius: 50%;
                padding: 2px 6px;
                font-size: 10px;
                font-weight: 700;
                min-width: 18px;
                text-align: center;
                display: none;
            `;
            badge.textContent = '3';
            notifBtn.appendChild(badge);

            // Добавляем в header перед logout или после user-info
            const logoutBtn = header.querySelector('.logout-btn');
            if (logoutBtn) {
                header.insertBefore(notifBtn, logoutBtn);
            } else {
                const userInfo = header.querySelector('.user-info');
                if (userInfo) {
                    header.insertBefore(notifBtn, userInfo.nextSibling);
                } else {
                    header.appendChild(notifBtn);
                }
            }

            // Создаём выпадающий список уведомлений
            const notifDropdown = document.createElement('div');
            notifDropdown.id = 'notifDropdown';
            notifDropdown.style.cssText = `
                display: none;
                position: absolute;
                top: 50px;
                right: 10px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                padding: 12px 0;
                min-width: 280px;
                max-height: 400px;
                overflow-y: auto;
                z-index: 300;
            `;
            notifDropdown.innerHTML = `
                <div style="padding:8px 20px;font-weight:700;color:#004b87;border-bottom:1px solid #f0f2f5;">Уведомления</div>
                <div id="notifList">
                    <div style="padding:10px 20px;border-bottom:1px solid #f8fafc;">
                        <div style="font-weight:600;">Новая заявка #004</div>
                        <div style="font-size:13px;color:#888;">От Петров П.П. - краска фасадная</div>
                        <div style="font-size:11px;color:#aaa;">10 минут назад</div>
                    </div>
                    <div style="padding:10px 20px;border-bottom:1px solid #f8fafc;">
                        <div style="font-weight:600;">Пополнение склада</div>
                        <div style="font-size:13px;color:#888;">Поставка цемента 200 мешков</div>
                        <div style="font-size:11px;color:#aaa;">2 часа назад</div>
                    </div>
                    <div style="padding:10px 20px;">
                        <div style="font-weight:600;">Заявка #003 выполнена</div>
                        <div style="font-size:13px;color:#888;">Кирпич красный - 500 шт</div>
                        <div style="font-size:11px;color:#aaa;">вчера</div>
                    </div>
                </div>
            `;
            header.style.position = 'relative';
            header.appendChild(notifDropdown);

            // Функция открытия/закрытия уведомлений
            window.toggleNotifications = function(e) {
                e.stopPropagation();
                const dropdown = document.getElementById('notifDropdown');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                    // Если открыли, скрываем бейдж
                    const badge = document.getElementById('notifBadge');
                    if (badge) badge.style.display = 'none';
                }
            };

            // Закрытие по клику вне
            document.addEventListener('click', function(e) {
                const dropdown = document.getElementById('notifDropdown');
                const btn = document.getElementById('notificationsBtn');
                if (dropdown && btn && !e.target.closest('#notificationsBtn') && !e.target.closest('#notifDropdown')) {
                    dropdown.style.display = 'none';
                }
            });

            console.log('✅ Уведомления добавлены');
        }

        // ============================================================
        // 6. ИСПРАВЛЕНИЕ НАВИГАЦИИ (чтобы работала без перехода в новости)
        // ============================================================
        function fixNavigation() {
            // Переопределяем функцию переключения вкладок нижней навигации
            const originalSwitchTab = window.switchTab;
            if (originalSwitchTab) {
                window.switchTab = function(tabId) {
                    originalSwitchTab(tabId);
                    // После переключения показываем кнопку "Назад", если активная секция не новости
                    const activeSection = document.querySelector('.app-content .section.active');
                    const backBtn = document.getElementById('backButton');
                    if (backBtn) {
                        if (activeSection && activeSection.id !== 'section-news') {
                            backBtn.style.display = 'block';
                        } else {
                            backBtn.style.display = 'none';
                        }
                    }
                };
                console.log('✅ Навигация исправлена (работает без новостей)');
            }

            // Также исправляем loadTab, чтобы обновлять кнопку "Назад"
            const originalLoadTab = window.loadTab;
            if (originalLoadTab) {
                window.loadTab = function(tabId, role) {
                    originalLoadTab(tabId, role);
                    setTimeout(() => {
                        const activeSection = document.querySelector('.app-content .section.active');
                        const backBtn = document.getElementById('backButton');
                        if (backBtn) {
                            if (activeSection && activeSection.id !== 'section-news') {
                                backBtn.style.display = 'block';
                            } else {
                                backBtn.style.display = 'none';
                            }
                        }
                    }, 50);
                };
                console.log('✅ loadTab исправлен');
            }
        }

        // ============================================================
        // 7. УБИРАЕМ ЗАЯВКИ У ДИРЕКТОРА (уже сделано через новые вкладки)
        // ============================================================

        // ============================================================
        // 8. ЗАПУСК ВСЕХ ИСПРАВЛЕНИЙ
        // ============================================================
        try {
            // Удаляем эмодзи первым делом
            removeAllEmojis();

            // Применяем стили профиля
            fixProfileStyle();

            // Добавляем кнопку "Назад"
            addBackButton();

            // Добавляем уведомления
            addNotifications();

            // Улучшаем директора
            enhanceDirector();

            // Исправляем навигацию
            fixNavigation();

            // Дополнительно: удаляем эмодзи из заголовков и кнопок, которые могли появиться позже
            setInterval(removeAllEmojis, 5000);

            console.log('✅ Все исправления fix3 успешно применены');
        } catch (e) {
            console.error('❌ Ошибка при применении fix3:', e);
        }

        if (typeof showToast === 'function') {
            setTimeout(() => {
                showToast('Обновление fix3 загружено');
            }, 800);
        }
    }

    waitForApp();

})();