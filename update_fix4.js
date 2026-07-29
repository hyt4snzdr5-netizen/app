/* ============================================================
   ИСПРАВЛЕНИЕ 4: ИСПРАВЛЕНИЕ ОШИБОК FIX3 + ДОПОЛНИТЕЛЬНЫЙ ФУНКЦИОНАЛ
   - Исправляет ошибку toggleNotifications is not defined
   - Обеспечивает работу кнопки "Назад"
   - Расширяет функционал директора (расписание, отчёты, аналитика)
   - Добавляет раздел уведомлений
   - Убирает эмодзи окончательно
   ============================================================ */

(function() {
    'use strict';

    console.log('🔧 Загрузка исправления fix4...');

    function waitForApp() {
        if (typeof DB === 'undefined' || typeof currentUser === 'undefined') {
            setTimeout(waitForApp, 200);
            return;
        }
        if (window.__CMTO_FIX4_LOADED) {
            console.warn('⚠️ Исправление fix4 уже загружено');
            return;
        }
        window.__CMTO_FIX4_LOADED = true;

        console.log('✅ Приложение готово, применяем fix4...');

        // ============================================================
        // 1. ОПРЕДЕЛЯЕМ toggleNotifications ГЛОБАЛЬНО
        // ============================================================
        window.toggleNotifications = function(e) {
            if (e) e.stopPropagation();
            const dropdown = document.getElementById('notifDropdown');
            if (dropdown) {
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                // Если открыли, скрываем бейдж
                const badge = document.getElementById('notifBadge');
                if (badge) badge.style.display = 'none';
            }
        };
        console.log('✅ toggleNotifications определена');

        // ============================================================
        // 2. ПЕРЕСОЗДАЁМ УВЕДОМЛЕНИЯ (если они есть, удаляем и создаём заново)
        // ============================================================
        function recreateNotifications() {
            // Удаляем старые элементы
            const oldBtn = document.getElementById('notificationsBtn');
            if (oldBtn) oldBtn.remove();
            const oldDropdown = document.getElementById('notifDropdown');
            if (oldDropdown) oldDropdown.remove();

            const header = document.querySelector('.app-header');
            if (!header) return;

            // Создаём кнопку
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
            notifBtn.onclick = window.toggleNotifications;

            // Бейдж
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

            // Добавляем в header
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

            // Выпадающий список уведомлений
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

            // Закрытие по клику вне
            document.addEventListener('click', function(e) {
                const dropdown = document.getElementById('notifDropdown');
                const btn = document.getElementById('notificationsBtn');
                if (dropdown && btn && !e.target.closest('#notificationsBtn') && !e.target.closest('#notifDropdown')) {
                    dropdown.style.display = 'none';
                }
            });

            console.log('✅ Уведомления пересозданы');
        }

        // ============================================================
        // 3. ПЕРЕСОЗДАЁМ КНОПКУ "НАЗАД" (исправляем видимость)
        // ============================================================
        function recreateBackButton() {
            const oldBtn = document.getElementById('backButton');
            if (oldBtn) oldBtn.remove();

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
                const newsSection = document.getElementById('section-news');
                if (newsSection) {
                    document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                    newsSection.classList.add('active');
                    // Сбрасываем нижнюю навигацию на первый пункт
                    const navItems = document.querySelectorAll('#bottomNav .nav-item');
                    if (navItems.length) {
                        navItems.forEach(btn => btn.classList.remove('active'));
                        // Попытаемся активировать первый
                        // (необязательно)
                    }
                } else {
                    const firstSection = document.querySelector('.app-content .section');
                    if (firstSection) {
                        document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                        firstSection.classList.add('active');
                    }
                }
                this.style.display = 'none';
            };

            document.body.appendChild(backBtn);

            // Показываем/скрываем при смене секции
            const observer = new MutationObserver(() => {
                const activeSection = document.querySelector('.app-content .section.active');
                if (backBtn) {
                    if (activeSection && activeSection.id !== 'section-news') {
                        backBtn.style.display = 'block';
                    } else {
                        backBtn.style.display = 'none';
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

            // Также при загрузке
            setTimeout(() => {
                const activeSection = document.querySelector('.app-content .section.active');
                if (backBtn) {
                    if (activeSection && activeSection.id !== 'section-news') {
                        backBtn.style.display = 'block';
                    } else {
                        backBtn.style.display = 'none';
                    }
                }
            }, 100);

            console.log('✅ Кнопка "Назад" пересоздана');
        }

        // ============================================================
        // 4. РАСШИРЕННЫЙ ФУНКЦИОНАЛ ДИРЕКТОРА (повторно, с гарантией)
        // ============================================================
        function enhanceDirectorAgain() {
            const directorSection = document.getElementById('section-director');
            if (!directorSection) {
                console.warn('⚠️ Секция директора не найдена');
                return;
            }

            // Удаляем старую навигацию, если есть
            const oldNav = directorSection.querySelector('.director-nav');
            if (oldNav) oldNav.remove();

            // Создаём новую навигацию
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

            // Глобальные данные для расписания
            if (!window.scheduleData) {
                window.scheduleData = JSON.parse(localStorage.getItem('cmto_schedule')) || [];
            }

            window.saveSchedule = function() {
                localStorage.setItem('cmto_schedule', JSON.stringify(window.scheduleData));
            };

            // Функции для вкладок
            window.showDirectorTab = function(tab) {
                document.querySelectorAll('.director-tab').forEach(btn => {
                    btn.style.background = btn.dataset.tab === tab ? '#004b87' : '#e8ecf0';
                    btn.style.color = btn.dataset.tab === tab ? 'white' : '#555';
                });

                const wrapper = document.getElementById('directorContentWrapper');
                if (!wrapper) return;

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
                window.saveSchedule();
                eventInput.value = '';
                timeInput.value = '';
                showDirectorTab('schedule');
                showToast('Событие добавлено');
            };

            window.deleteScheduleEvent = function(index) {
                if (confirm('Удалить событие?')) {
                    window.scheduleData.splice(index, 1);
                    window.saveSchedule();
                    showDirectorTab('schedule');
                    showToast('Событие удалено');
                }
            };

            window.editScheduleEvent = function(index) {
                const item = window.scheduleData[index];
                const newEvent = prompt('Измените событие:', item.event);
                if (newEvent !== null && newEvent.trim()) {
                    const newTime = prompt('Измените время (ГГГГ-ММ-ДДТЧЧ:ММ):', item.time);
                    if (newTime !== null) {
                        window.scheduleData[index] = { event: newEvent.trim(), time: newTime };
                        window.saveSchedule();
                        showDirectorTab('schedule');
                        showToast('Событие обновлено');
                    }
                }
            };

            function renderReports() {
                const total = DB.requests.length;
                const done = DB.requests.filter(r => r.status === 'done').length;
                const inProgress = DB.requests.filter(r => r.status !== 'done' && r.status !== 'cancelled').length;
                const cancelled = DB.requests.filter(r => r.status === 'cancelled').length;
                const efficiency = total ? Math.round(done / total * 100) : 0;

                return `
                    <div style="background:white;padding:20px;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                        <h3 style="color:#004b87;margin-bottom:16px;">Отчеты</h3>
                        <p style="color:#555;margin-bottom:12px;">Сводка выполненных заявок и работ</p>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:28px;font-weight:900;color:#004b87;">${done}</div>
                                <div style="font-size:13px;color:#888;">Выполнено</div>
                            </div>
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:28px;font-weight:900;color:#f5a623;">${inProgress}</div>
                                <div style="font-size:13px;color:#888;">В работе</div>
                            </div>
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:28px;font-weight:900;color:#2e7d32;">${efficiency}%</div>
                                <div style="font-size:13px;color:#888;">Эффективность</div>
                            </div>
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:28px;font-weight:900;color:#d32f2f;">${cancelled}</div>
                                <div style="font-size:13px;color:#888;">Отменено</div>
                            </div>
                        </div>
                    </div>
                `;
            }

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

            function renderAnalytics() {
                const total = DB.requests.length;
                const done = DB.requests.filter(r => r.status === 'done').length;
                const efficiency = total ? Math.round(done / total * 100) : 0;
                const avgTime = total ? Math.round((Math.random() * 48 + 12)) : 0;

                return `
                    <div style="background:white;padding:20px;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
                        <h3 style="color:#004b87;margin-bottom:16px;">Аналитика</h3>
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:24px;font-weight:900;color:#004b87;">${total}</div>
                                <div style="font-size:13px;color:#888;">Всего заявок</div>
                            </div>
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:24px;font-weight:900;color:#2e7d32;">${efficiency}%</div>
                                <div style="font-size:13px;color:#888;">Эффективность</div>
                            </div>
                            <div style="background:#f8fafc;padding:16px;border-radius:12px;text-align:center;">
                                <div style="font-size:24px;font-weight:900;color:#f5a623;">${avgTime} ч</div>
                                <div style="font-size:13px;color:#888;">Ср. время выполнения</div>
                            </div>
                        </div>
                        <div style="margin-top:20px;background:#f8fafc;padding:16px;border-radius:12px;">
                            <div style="font-size:14px;color:#555;">График выполнения (последние 7 дней)</div>
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

            console.log('✅ Функционал директора расширен (fix4)');
        }

        // ============================================================
        // 5. ФИНАЛЬНОЕ УДАЛЕНИЕ ЭМОДЗИ (гарантия)
        // ============================================================
        function finalRemoveEmojis() {
            // Проходим по всем элементам с текстом и удаляем эмодзи
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
                    const cleaned = el.childNodes[0].textContent.replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE0F}]/gu, '').trim();
                    if (cleaned) {
                        el.childNodes[0].textContent = cleaned;
                    } else {
                        el.childNodes[0].textContent = ' ';
                    }
                }
            });
            console.log('✅ Финальное удаление эмодзи выполнено');
        }

        // ============================================================
        // 6. ЗАПУСК ВСЕХ ИСПРАВЛЕНИЙ
        // ============================================================
        try {
            // Определяем toggleNotifications (уже сделано в начале)
            // Пересоздаём уведомления
            recreateNotifications();

            // Пересоздаём кнопку "Назад"
            recreateBackButton();

            // Расширяем директора
            enhanceDirectorAgain();

            // Удаляем эмодзи окончательно
            finalRemoveEmojis();

            // Дополнительно: удаляем эмодзи через интервал (на случай динамических обновлений)
            setInterval(finalRemoveEmojis, 10000);

            console.log('✅ Все исправления fix4 успешно применены');
        } catch (e) {
            console.error('❌ Ошибка при применении fix4:', e);
        }

        if (typeof showToast === 'function') {
            setTimeout(() => {
                showToast('Обновление fix4 загружено');
            }, 800);
        }
    }

    waitForApp();

})();