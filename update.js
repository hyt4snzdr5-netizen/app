/* ============================================================
   ОБНОВЛЕНИЕ 2.0 - ЦМТО Кунцево PRO
   Дополнительный модуль расширения функционала
   ============================================================ */

(function() {
    'use strict';

    console.log('🔄 Загрузка обновления 2.0...');

    // ============================================================
    // 1. РАСШИРЕННАЯ СТАТИСТИКА ДЛЯ ДИРЕКТОРА
    // ============================================================

    function addDirectorStats() {
        const directorContent = document.getElementById('directorContent');
        if (!directorContent) return;

        // Добавляем статистику перед чатами
        const statsHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;">
                <div style="background:white;padding:16px;border-radius:12px;box-shadow:var(--shadow);text-align:center;">
                    <div style="font-size:28px;font-weight:900;color:var(--blue);">${DB.requests.filter(r => r.status === 'done').length}</div>
                    <div style="font-size:12px;color:#888;">Выполнено заявок</div>
                </div>
                <div style="background:white;padding:16px;border-radius:12px;box-shadow:var(--shadow);text-align:center;">
                    <div style="font-size:28px;font-weight:900;color:var(--orange);">${DB.requests.filter(r => r.status !== 'done' && r.status !== 'cancelled').length}</div>
                    <div style="font-size:12px;color:#888;">В работе</div>
                </div>
                <div style="background:white;padding:16px;border-radius:12px;box-shadow:var(--shadow);text-align:center;">
                    <div style="font-size:28px;font-weight:900;color:var(--green);">${DB.requests.length > 0 ? Math.round(DB.requests.filter(r => r.status === 'done').length / DB.requests.length * 100) : 0}%</div>
                    <div style="font-size:12px;color:#888;">Эффективность</div>
                </div>
                <div style="background:white;padding:16px;border-radius:12px;box-shadow:var(--shadow);text-align:center;">
                    <div style="font-size:28px;font-weight:900;color:var(--gold);">${DB.supplies.length}</div>
                    <div style="font-size:12px;color:#888;">Активных поставок</div>
                </div>
            </div>
        `;
        directorContent.insertAdjacentHTML('afterbegin', statsHTML);

        // ===== ПЛАН КОНТРАКТОВ =====
        const contractsHTML = `
            <div style="background:white;padding:20px;border-radius:var(--radius);box-shadow:var(--shadow);margin-bottom:20px;">
                <h3 style="color:var(--blue);margin-bottom:12px;">📋 План выполнения контрактов</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:14px;">
                    <div><span style="color:#888;">Всего контрактов:</span> <b>12</b></div>
                    <div><span style="color:#888;">Выполнено:</span> <b style="color:var(--green);">8</b></div>
                    <div><span style="color:#888;">В процессе:</span> <b style="color:var(--orange);">3</b></div>
                    <div><span style="color:#888;">Просрочено:</span> <b style="color:var(--red);">1</b></div>
                </div>
                <div style="margin-top:12px;background:#f0f4fa;border-radius:8px;height:8px;overflow:hidden;">
                    <div style="height:100%;width:67%;background:linear-gradient(90deg,var(--blue-light),var(--green));border-radius:8px;"></div>
                </div>
                <div style="font-size:12px;color:#888;margin-top:4px;">Выполнение плана: 67%</div>
            </div>
        `;
        directorContent.insertAdjacentHTML('afterbegin', contractsHTML);

        // ===== РАСХОДЫ ПО ЗАКУПКАМ =====
        const expensesHTML = `
            <div style="background:white;padding:20px;border-radius:var(--radius);box-shadow:var(--shadow);margin-bottom:20px;">
                <h3 style="color:var(--blue);margin-bottom:12px;">💰 Расходы по закупкам</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:14px;">
                    <div><span style="color:#888;">Бюджет:</span> <b>45 000 000 ₽</b></div>
                    <div><span style="color:#888;">Израсходовано:</span> <b style="color:var(--orange);">28 500 000 ₽</b></div>
                    <div><span style="color:#888;">Остаток:</span> <b style="color:var(--green);">16 500 000 ₽</b></div>
                </div>
                <div style="margin-top:12px;background:#f0f4fa;border-radius:8px;height:8px;overflow:hidden;">
                    <div style="height:100%;width:63%;background:linear-gradient(90deg,var(--blue-light),var(--orange));border-radius:8px;"></div>
                </div>
                <div style="font-size:12px;color:#888;margin-top:4px;">Исполнение бюджета: 63%</div>
            </div>
        `;
        directorContent.insertAdjacentHTML('afterbegin', expensesHTML);

        // ===== ШТАТ (85 человек) =====
        const staffHTML = `
            <div style="background:white;padding:20px;border-radius:var(--radius);box-shadow:var(--shadow);margin-bottom:20px;">
                <h3 style="color:var(--blue);margin-bottom:12px;">👥 Штат сотрудников ЦМТО</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;font-size:14px;">
                    <div><span style="color:#888;">Всего:</span> <b>85</b></div>
                    <div><span style="color:#888;">Руководство:</span> <b>5</b></div>
                    <div><span style="color:#888;">Склад:</span> <b>30</b></div>
                    <div><span style="color:#888;">Логистика:</span> <b>15</b></div>
                    <div><span style="color:#888;">Закупки:</span> <b>10</b></div>
                    <div><span style="color:#888;">Администрация:</span> <b>25</b></div>
                </div>
            </div>
        `;
        directorContent.insertAdjacentHTML('afterbegin', staffHTML);
    }

    // ============================================================
    // 2. РАСШИРЕННЫЙ РАЗДЕЛ ГБУ ЖИЛИЩНИК
    // ============================================================

    function addGBUZFeatures() {
        const gbuzContent = document.getElementById('gbuzContent');
        if (!gbuzContent) return;

        // Добавляем чат с головным отделом МТО
        const chatHTML = `
            <div style="background:white;padding:20px;border-radius:var(--radius);box-shadow:var(--shadow);margin-bottom:20px;">
                <h3 style="color:var(--blue);margin-bottom:12px;">💬 Чат с головным отделом МТО</h3>
                <div id="gbuzChatMessages" style="max-height:200px;overflow-y:auto;background:#f8fafc;border-radius:12px;padding:12px;margin-bottom:12px;">
                    <div style="font-size:13px;color:#888;text-align:center;padding:20px;">Загрузка сообщений...</div>
                </div>
                <div style="display:flex;gap:10px;">
                    <input type="text" id="gbuzChatInput" placeholder="Сообщение в головной отдел..." 
                           style="flex:1;padding:12px;border:2px solid #e8ecf0;border-radius:12px;font-size:14px;background:#f8fafc;">
                    <button onclick="sendGBUZMessage()" style="padding:12px 24px;background:var(--blue);color:white;border:none;border-radius:12px;font-weight:700;cursor:pointer;">Отправить</button>
                </div>
            </div>
        `;
        gbuzContent.insertAdjacentHTML('beforeend', chatHTML);

        // Добавляем инициацию чата
        if (!DB.messages['gbuz_head']) {
            DB.messages['gbuz_head'] = [
                { from: 'system', text: '📢 Чат с головным отделом МТО', time: new Date().toISOString().slice(0, 16).replace('T', ' ') },
                { from: 'head_mto', text: 'Добрый день! Получаем сводку по району.', time: new Date().toISOString().slice(0, 16).replace('T', ' ') }
            ];
        }

        // Функция отправки сообщения
        window.sendGBUZMessage = function() {
            const input = document.getElementById('gbuzChatInput');
            const text = input.value.trim();
            if (!text) return;

            const msg = {
                from: 'ГБУ Жилищник',
                text: text,
                time: new Date().toISOString().slice(0, 16).replace('T', ' ')
            };
            DB.messages['gbuz_head'].push(msg);
            input.value = '';
            renderGBUZChat();

            // Имитация ответа
            setTimeout(() => {
                const replies = ['Принято!', 'Спасибо за информацию.', 'Подготовим отчет.', 'Ожидайте подтверждения.'];
                const reply = {
                    from: 'Головной отдел МТО',
                    text: replies[Math.floor(Math.random() * replies.length)],
                    time: new Date().toISOString().slice(0, 16).replace('T', ' ')
                };
                DB.messages['gbuz_head'].push(reply);
                renderGBUZChat();
                showNotification('📩 Новое сообщение от головного отдела МТО');
            }, 1500);
        };

        function renderGBUZChat() {
            const container = document.getElementById('gbuzChatMessages');
            if (!container) return;
            const messages = DB.messages['gbuz_head'] || [];
            container.innerHTML = messages.map(m => `
                <div style="padding:8px 12px;margin-bottom:4px;border-radius:8px;background:${m.from === 'ГБУ Жилищник' ? 'var(--blue)' : 'white'};color:${m.from === 'ГБУ Жилищник' ? 'white' : '#1a2634'};font-size:14px;max-width:80%;${m.from === 'ГБУ Жилищник' ? 'margin-left:auto;' : ''}">
                    ${m.from !== 'system' ? '<strong>' + m.from + '</strong><br>' : ''}
                    ${m.text}
                    <span style="font-size:10px;opacity:0.6;display:block;margin-top:2px;">${m.time || ''}</span>
                </div>
            `).join('');
            container.scrollTop = container.scrollHeight;
        }

        // Переопределяем renderGBUZChat для глобального доступа
        window.renderGBUZChat = renderGBUZChat;

        // Загружаем чат
        setTimeout(renderGBUZChat, 100);
    }

    // ============================================================
    // 3. ПУШ-УВЕДОМЛЕНИЯ
    // ============================================================

    function addPushNotifications() {
        // Запрашиваем разрешение
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        window.showNotification = function(title, body) {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body: body || '',
                    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Ccircle cx="24" cy="24" r="22" fill="%23004b87"/%3E%3Ctext x="24" y="30" font-size="20" text-anchor="middle" fill="white" font-weight="bold"%3EЦ%3C/text%3E%3C/svg%3E'
                });
            }
        };

        // Уведомления о срочных заявках
        const urgentRequests = DB.requests.filter(r => r.status === 'pending' && r.material.includes('срочно'));
        urgentRequests.forEach(r => {
            showNotification('🚨 Срочная заявка!', `#${r.id} - ${r.material} (${r.quantity})`);
        });

        // Уведомления о пополнениях склада
        DB.supplies.forEach(s => {
            if (s.status === 'Доставлен') {
                showNotification('📦 Пополнение склада', `${s.name} - ${s.quantity} доставлен`);
            }
        });

        // Уведомления о сроках контрактов
        showNotification('📋 Напоминание', 'Проверьте сроки выполнения контрактов!');
    }

    // ============================================================
    // 4. РАСШИРЕННАЯ РЕГИСТРАЦИЯ (Госуслуги, Мос.ру, ВК, Telegram)
    // ============================================================

    function addSocialLogin() {
        const authContainer = document.querySelector('.auth-container');
        if (!authContainer) return;

        const socialHTML = `
            <div style="margin-top:20px;padding-top:20px;border-top:1px solid #eee;">
                <div style="text-align:center;font-size:13px;color:#888;margin-bottom:12px;">Или войдите через</div>
                <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                    <button onclick="socialLogin('gosuslugi')" style="padding:10px 16px;border:none;border-radius:10px;background:#003b6f;color:white;font-weight:600;font-size:13px;cursor:pointer;">Госуслуги</button>
                    <button onclick="socialLogin('mosru')" style="padding:10px 16px;border:none;border-radius:10px;background:#d4145a;color:white;font-weight:600;font-size:13px;cursor:pointer;">Мос.ру</button>
                    <button onclick="socialLogin('vk')" style="padding:10px 16px;border:none;border-radius:10px;background:#4a76a8;color:white;font-weight:600;font-size:13px;cursor:pointer;">ВК</button>
                    <button onclick="socialLogin('telegram')" style="padding:10px 16px;border:none;border-radius:10px;background:#0088cc;color:white;font-weight:600;font-size:13px;cursor:pointer;">Telegram</button>
                </div>
            </div>
        `;
        authContainer.insertAdjacentHTML('beforeend', socialHTML);

        window.socialLogin = function(provider) {
            const names = {
                gosuslugi: 'Госуслуги',
                mosru: 'Мос.ру',
                vk: 'ВКонтакте',
                telegram: 'Telegram'
            };
            alert(`🔐 Вход через ${names[provider]}\n(Демо-режим: вход выполнен успешно)`);

            const phone = 'user_' + provider + '_' + Date.now().toString(36);
            let user = DB.users.find(u => u.phone === phone);
            if (!user) {
                user = { id: generateId(), name: provider.charAt(0).toUpperCase() + provider.slice(1) + 'User', phone: phone,
                    role: '' };
                DB.users.push(user);
            }
            currentUser = { ...user, isLoggedIn: true };
            showAuthScreen(false);
            showRoleSelection();
            showNotification('✅ Вход выполнен', `Добро пожаловать, ${user.name}!`);
        };
    }

    // ============================================================
    // 5. РАЗДЕЛ НАСТРОЕК (верхний левый угол)
    // ============================================================

    function addSettingsMenu() {
        const header = document.querySelector('.app-header');
        if (!header) return;

        const settingsHTML = `
            <div style="position:relative;">
                <button onclick="toggleSettings()" style="background:none;border:none;font-size:24px;cursor:pointer;padding:4px 8px;border-radius:10px;transition:0.3s;" onmouseover="this.style.background='var(--blue-glow)'" onmouseout="this.style.background='none'">⚙️</button>
                <div id="settingsDropdown" style="display:none;position:absolute;top:50px;left:0;background:white;border-radius:var(--radius);box-shadow:0 10px 40px rgba(0,0,0,0.15);padding:12px 0;min-width:200px;z-index:200;overflow:hidden;">
                    <div style="padding:8px 20px;font-weight:700;color:var(--blue);border-bottom:1px solid #eee;">Настройки</div>
                    <div onclick="openSettings('profile')" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;" onmouseover="this.style.background='var(--blue-glow)'" onmouseout="this.style.background='none'">👤 Профиль</div>
                    <div onclick="openSettings('settings')" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;" onmouseover="this.style.background='var(--blue-glow)'" onmouseout="this.style.background='none'">⚙️ Настройки</div>
                    <div onclick="openSettings('news')" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;" onmouseover="this.style.background='var(--blue-glow)'" onmouseout="this.style.background='none'">📰 Новости</div>
                    <div onclick="openSettings('hotline')" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;border-top:1px solid #eee;" onmouseover="this.style.background='var(--blue-glow)'" onmouseout="this.style.background='none'">📞 Горячая линия</div>
                    <div onclick="openSettings('verify')" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;border-top:1px solid #eee;" onmouseover="this.style.background='var(--blue-glow)'" onmouseout="this.style.background='none'">🔑 Верификация</div>
                </div>
            </div>
        `;

        // Вставляем в начало header
        header.insertAdjacentHTML('afterbegin', settingsHTML);

        // Функции для настроек
        window.toggleSettings = function() {
            const dropdown = document.getElementById('settingsDropdown');
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        };

        window.openSettings = function(section) {
            document.getElementById('settingsDropdown').style.display = 'none';

            const messages = {
                profile: `👤 Профиль\n\nИмя: ${currentUser.name || 'Не указано'}\nТелефон: ${currentUser.phone || 'Не указан'}\nРоль: ${ROLES[currentUser.role]?.label || 'Не выбрана'}\nID: ${currentUser.id || 'Не указан'}`,
                settings: `⚙️ Настройки\n\n• Язык: Русский\n• Уведомления: Включены\n• Тема: Светлая\n• Автосохранение: Включено\n• Версия: 2.0`,
                news: `📰 Новости ЦМТО\n\n• 29.07.2026 - Запущена новая система заявок\n• 28.07.2026 - Пополнение склада на 5000 ед.\n• 27.07.2026 - Начало ремонтных работ на участке №3\n• 26.07.2026 - Обновление мобильного приложения`,
                hotline: `📞 Горячая линия ГБУ Жилищник\n\n• Единый номер: 8-800-XXX-XX-XX\n• Отдел МТО: 8-495-XXX-XX-XX\n• Диспетчерская: 8-495-XXX-XX-XX\n• Склад: 8-495-XXX-XX-XX\n• Время работы: круглосуточно`,
                verify: `🔑 Верификация сотрудника\n\nВведите ваш ID для подтверждения должности:\n\nID: ${currentUser.id || 'Не указан'}\nСтатус: ${currentUser.role ? '✅ Верифицирован' : '❌ Не верифицирован'}\n\nДля получения ключа обратитесь в администрацию.`
            };

            alert(messages[section] || 'Раздел в разработке');
        };

        // Закрываем при клике вне
        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('settingsDropdown');
            if (dropdown && !e.target.closest('.app-header')) {
                dropdown.style.display = 'none';
            }
        });
    }

    // ============================================================
    // 6. НОВЫЕ ОТДЕЛЫ: ЗАКУПОК, ТО ТРАНСПОРТА
    // ============================================================

    function addNewDepartments() {
        const roleGrid = document.getElementById('roleGrid');
        if (!roleGrid) return;

        const newRoles = [
            { id: 'purchase', icon: '📋', label: 'Отдел закупок' },
            { id: 'transport', icon: '🚛', label: 'ТО транспорта' }
        ];

        newRoles.forEach(role => {
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
                alert(`✅ Выбрана роль: ${role.label}\n(Раздел в разработке)`);
                // Добавляем базовый контент
                const content = document.getElementById('appContent');
                const section = document.createElement('div');
                section.className = 'section active';
                section.id = 'section-' + r;
                section.innerHTML = `
                    <h2 class="section-title">${role.icon} ${role.label}</h2>
                    <div style="text-align:center;padding:40px 20px;color:#888;">
                        <span style="font-size:48px;display:block;margin-bottom:16px;">${role.icon}</span>
                        <p style="font-size:18px;font-weight:600;color:var(--blue);">Раздел ${role.label}</p>
                        <p style="font-size:14px;">Функционал в разработке</p>
                    </div>
                `;
                content.appendChild(section);
                // Показываем секцию
                document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                document.getElementById('section-' + r).classList.add('active');
                document.getElementById('roleSelection').style.display = 'none';
                document.getElementById('appContent').style.display = 'block';
                document.getElementById('bottomNav').style.display = 'flex';
                // Обновляем инфо
                document.getElementById('userName').textContent = currentUser.name || 'Пользователь';
                document.getElementById('userRole').textContent = role.label;
                document.getElementById('userAvatar').textContent = role.icon;
            });
            roleGrid.appendChild(card);
        });
    }

    // ============================================================
    // 7. ШТАТ СКЛАДОВ И ХОЗ ОТДЕЛА (30 человек) + СМЕНЫ
    // ============================================================

    function addWarehouseStaff() {
        const warehouseContent = document.getElementById('warehouseContent');
        if (!warehouseContent) return;

        const staffHTML = `
            <div style="background:white;padding:20px;border-radius:var(--radius);box-shadow:var(--shadow);margin-bottom:20px;">
                <h3 style="color:var(--blue);margin-bottom:12px;">👥 Штат складов и хоз отдела</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;font-size:14px;">
                    <div><span style="color:#888;">Всего:</span> <b>30</b></div>
                    <div><span style="color:#888;">Кладовщики:</span> <b>12</b></div>
                    <div><span style="color:#888;">Грузчики:</span> <b>8</b></div>
                    <div><span style="color:#888;">Хоз отдел:</span> <b>10</b></div>
                </div>
                <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div style="background:#f8fafc;padding:12px;border-radius:8px;">
                        <div style="font-size:12px;color:#888;">Смена А (08:00-20:00)</div>
                        <div style="font-weight:700;color:var(--blue);">15 чел.</div>
                    </div>
                    <div style="background:#f8fafc;padding:12px;border-radius:8px;">
                        <div style="font-size:12px;color:#888;">Смена Б (20:00-08:00)</div>
                        <div style="font-weight:700;color:var(--blue);">15 чел.</div>
                    </div>
                </div>
                <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
                    <button onclick="setShift('A')" class="btn-primary" style="padding:8px 16px;border:none;border-radius:8px;background:var(--blue);color:white;font-weight:600;cursor:pointer;">✅ Смена А</button>
                    <button onclick="setShift('B')" class="btn-primary" style="padding:8px 16px;border:none;border-radius:8px;background:var(--blue);color:white;font-weight:600;cursor:pointer;">✅ Смена Б</button>
                    <button onclick="setShift('day')" class="btn-success" style="padding:8px 16px;border:none;border-radius:8px;background:var(--green);color:white;font-weight:600;cursor:pointer;">☀️ Дневная</button>
                    <button onclick="setShift('night')" class="btn-warning" style="padding:8px 16px;border:none;border-radius:8px;background:var(--orange);color:white;font-weight:600;cursor:pointer;">🌙 Ночная</button>
                </div>
                <div id="shiftStatus" style="margin-top:12px;font-size:14px;color:#888;">Текущая смена: не установлена</div>
            </div>
        `;

        // Вставляем после статистики или в начало
        warehouseContent.insertAdjacentHTML('afterbegin', staffHTML);

        window.setShift = function(shift) {
            const names = { A: 'Смена А (08:00-20:00)', B: 'Смена Б (20:00-08:00)', day: 'Дневная смена', night: 'Ночная смена' };
            document.getElementById('shiftStatus').textContent = `✅ Текущая смена: ${names[shift]}`;
            showNotification('🔄 Смена установлена', names[shift]);
        };
    }

    // ============================================================
    // 8. АДМИНИСТРАЦИЯ + ВЕРИФИКАЦИЯ
    // ============================================================

    function addAdminSection() {
        // Добавляем роль администратора
        const roleGrid = document.getElementById('roleGrid');
        if (!roleGrid) return;

        const adminCard = document.createElement('div');
        adminCard.className = 'role-card';
        adminCard.dataset.role = 'admin';
        adminCard.innerHTML = `
            <span class="role-icon">🛡️</span>
            <span class="role-name">Администрация</span>
        `;
        adminCard.addEventListener('click', function() {
            document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');

            const content = document.getElementById('appContent');
            const section = document.createElement('div');
            section.className = 'section active';
            section.id = 'section-admin';
            section.innerHTML = `
                <h2 class="section-title">🛡️ Панель администрации</h2>
                <div style="background:white;padding:24px;border-radius:var(--radius);box-shadow:var(--shadow);">
                    <h3 style="color:var(--blue);margin-bottom:16px;">🔑 Выдача верификационных ключей</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                        <div>
                            <label style="font-size:13px;color:#888;">Сотрудник</label>
                            <input type="text" id="adminUser" placeholder="ID или имя сотрудника" style="width:100%;padding:10px;border:2px solid #e8ecf0;border-radius:8px;font-size:14px;">
                        </div>
                        <div>
                            <label style="font-size:13px;color:#888;">Роль</label>
                            <select id="adminRole" style="width:100%;padding:10px;border:2px solid #e8ecf0;border-radius:8px;font-size:14px;">
                                <option value="director">Директор</option>
                                <option value="dispatcher">Диспетчер</option>
                                <option value="warehouse">Начальник склада</option>
                                <option value="site">Начальник участка</option>
                                <option value="gbuz">ГБУ Жилищник</option>
                                <option value="stock">Склад</option>
                                <option value="purchase">Отдел закупок</option>
                                <option value="transport">ТО транспорта</option>
                            </select>
                        </div>
                    </div>
                    <button onclick="generateVerificationKey()" class="btn-primary" style="width:100%;padding:14px;border:none;border-radius:12px;background:var(--blue);color:white;font-weight:700;cursor:pointer;">🎫 Сгенерировать ключ</button>
                    <div id="generatedKey" style="margin-top:16px;padding:16px;background:#f0f8ff;border-radius:8px;text-align:center;font-weight:700;color:var(--blue);display:none;"></div>
                </div>
                <div style="margin-top:20px;background:white;padding:20px;border-radius:var(--radius);box-shadow:var(--shadow);">
                    <h3 style="color:var(--blue);margin-bottom:12px;">👥 Список сотрудников</h3>
                    <div id="adminStaffList" style="font-size:14px;">
                        <div style="padding:8px 0;border-bottom:1px solid #eee;display:flex;justify-content:space-between;">
                            <span><b>Всего пользователей:</b> ${DB.users.length}</span>
                            <span><b>Верифицировано:</b> ${DB.users.filter(u => u.role).length}</span>
                        </div>
                        ${DB.users.map(u => `
                            <div style="padding:6px 0;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;font-size:13px;">
                                <span>${u.name || 'Без имени'} (${u.phone})</span>
                                <span style="color:${u.role ? 'var(--green)' : 'var(--red)'};">${u.role ? '✅ ' + ROLES[u.role]?.label || u.role : '❌ Не верифицирован'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            content.appendChild(section);
            document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
            document.getElementById('section-admin').classList.add('active');
            document.getElementById('roleSelection').style.display = 'none';
            document.getElementById('appContent').style.display = 'block';
            document.getElementById('bottomNav').style.display = 'flex';
            document.getElementById('userName').textContent = currentUser.name || 'Администратор';
            document.getElementById('userRole').textContent = 'Администрация';
            document.getElementById('userAvatar').textContent = '🛡️';
        });
        roleGrid.appendChild(adminCard);

        // Функция генерации ключа
        window.generateVerificationKey = function() {
            const user = document.getElementById('adminUser').value.trim();
            const role = document.getElementById('adminRole').value;

            if (!user) {
                alert('Введите ID или имя сотрудника!');
                return;
            }

            const key = 'MTO-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
            const container = document.getElementById('generatedKey');
            container.style.display = 'block';
            container.innerHTML = `
                🎫 Ключ для ${user}<br>
                <span style="font-size:20px;font-family:monospace;background:#e8ecf0;padding:8px 16px;border-radius:8px;display:inline-block;margin-top:8px;">${key}</span>
                <br><span style="font-size:12px;color:#888;">Роль: ${ROLES[role]?.label || role}</span>
                <button onclick="navigator.clipboard.writeText('${key}')" style="margin-top:8px;padding:6px 16px;border:none;border-radius:8px;background:var(--blue-light);color:white;cursor:pointer;">📋 Копировать</button>
            `;
            showNotification('🔑 Ключ сгенерирован', `Для ${user} (${ROLES[role]?.label || role})`);
        };
    }

    // ============================================================
    // 9. ЭКСТРЕННАЯ СВЯЗЬ
    // ============================================================

    function addEmergencyButton() {
        const bottomNav = document.getElementById('bottomNav');
        if (!bottomNav) return;

        const emergencyHTML = `
            <button class="nav-item" onclick="emergencyCall()" style="color:var(--red);">
                <span class="nav-icon" style="font-size:28px;">🚨</span>
                <span style="font-size:10px;">Экстренная связь</span>
            </button>
        `;
        bottomNav.insertAdjacentHTML('beforeend', emergencyHTML);

        window.emergencyCall = function() {
            if (confirm('🚨 Экстренная связь с отделом управления МТО\n\nПодтвердите вызов')) {
                showNotification('🚨 Экстренный вызов отправлен!', 'Ожидайте ответа оператора');
                alert('🚨 СВЯЗЬ С ОТДЕЛОМ УПРАВЛЕНИЯ МТО\n\nНомер: 8-495-XXX-XX-XX (доб. 112)\n\n⏳ Оператор будет на связи в ближайшее время.');
            }
        };
    }

    // ============================================================
    // 10. ПАМЯТЬ САЙТА (LocalStorage)
    // ============================================================

    function addPersistence() {
        // Сохраняем состояние при каждом изменении
        const originalPush = window.showNotification;
        window.showNotification = function(title, body) {
            if (originalPush) originalPush(title, body);
            saveState();
        };

        // Функция сохранения
        function saveState() {
            try {
                const state = {
                    users: DB.users,
                    requests: DB.requests,
                    materials: DB.materials,
                    supplies: DB.supplies,
                    messages: DB.messages,
                    currentUser: currentUser
                };
                localStorage.setItem('cmto_data', JSON.stringify(state));
                localStorage.setItem('cmto_last_save', new Date().toISOString());
            } catch (e) {
                console.warn('Ошибка сохранения:', e);
            }
        }

        // Функция загрузки
        function loadState() {
            try {
                const data = localStorage.getItem('cmto_data');
                if (data) {
                    const state = JSON.parse(data);
                    DB.users = state.users || DB.users;
                    DB.requests = state.requests || DB.requests;
                    DB.materials = state.materials || DB.materials;
                    DB.supplies = state.supplies || DB.supplies;
                    DB.messages = state.messages || DB.messages;
                    if (state.currentUser && state.currentUser.isLoggedIn) {
                        currentUser = state.currentUser;
                    }
                    console.log('✅ Данные загружены из LocalStorage');
                    console.log(`📊 Заявок: ${DB.requests.length}, Пользователей: ${DB.users.length}`);
                }
            } catch (e) {
                console.warn('Ошибка загрузки:', e);
            }
        }

        // Загружаем при старте
        loadState();

        // Сохраняем каждые 30 секунд
        setInterval(saveState, 30000);

        // Сохраняем при закрытии
        window.addEventListener('beforeunload', saveState);

        // Добавляем кнопку сохранения в настройки
        const settingsDropdown = document.getElementById('settingsDropdown');
        if (settingsDropdown) {
            const saveBtn = document.createElement('div');
            saveBtn.innerHTML = '💾 Сохранить данные';
            saveBtn.style.cssText = 'padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;border-top:1px solid #eee;';
            saveBtn.onmouseover = function() { this.style.background = 'var(--blue-glow)'; };
            saveBtn.onmouseout = function() { this.style.background = 'none'; };
            saveBtn.onclick = function() {
                saveState();
                alert('✅ Данные сохранены!\n' + new Date().toLocaleString());
                document.getElementById('settingsDropdown').style.display = 'none';
            };
            settingsDropdown.appendChild(saveBtn);
        }

        // Добавляем индикатор сохранения
        const header = document.querySelector('.app-header');
        if (header) {
            const indicator = document.createElement('span');
            indicator.id = 'saveIndicator';
            indicator.style.cssText = 'font-size:11px;color:#888;margin-right:10px;';
            indicator.textContent = '💾 Сохранено';
            header.querySelector('.user-info').appendChild(indicator);

            // Обновляем индикатор при сохранении
            const originalSave = saveState;
            saveState = function() {
                originalSave();
                const ind = document.getElementById('saveIndicator');
                if (ind) {
                    ind.textContent = '✅ Сохранено ' + new Date().toLocaleTimeString();
                    ind.style.color = 'var(--green)';
                    setTimeout(() => { ind.style.color = '#888'; }, 2000);
                }
            };
        }
    }

    // ============================================================
    // 11. ПРИВЕТСТВИЕ И СТАТУС
    // ============================================================

    function addWelcomeMessage() {
        console.log('✅ Обновление 2.0 успешно загружено!');
        console.log('📌 Новые функции:');
        console.log('   • Статистика для директора');
        console.log('   • Чат ГБУ Жилищник с головным отделом МТО');
        console.log('   • Push-уведомления');
        console.log('   • Социальный вход (Госуслуги, Мос.ру, ВК, Telegram)');
        console.log('   • Раздел настроек');
        console.log('   • Новые отделы (закупки, ТО транспорта)');
        console.log('   • Администрация с верификацией');
        console.log('   • Штат складов (30 чел.) + смены');
        console.log('   • Экстренная связь');
        console.log('   • Автосохранение в LocalStorage');
        console.log('   • Горячая линия в настройках');

        // Показываем приветственное уведомление
        setTimeout(() => {
            showNotification('🚀 ЦМТО PRO обновлен!', 'Версия 2.0 - новые функции доступны');
        }, 1000);
    }

    // ============================================================
    // 12. ЗАПУСК ВСЕХ ФУНКЦИЙ
    // ============================================================

    // Запускаем после загрузки основного кода
    setTimeout(() => {
        try {
            addDirectorStats();
            addGBUZFeatures();
            addPushNotifications();
            addSocialLogin();
            addSettingsMenu();
            addNewDepartments();
            addWarehouseStaff();
            addAdminSection();
            addEmergencyButton();
            addPersistence();
            addWelcomeMessage();
            console.log('✅ Все функции обновления 2.0 активированы');
        } catch (e) {
            console.warn('⚠️ Ошибка при активации обновления:', e);
        }
    }, 500);

})();