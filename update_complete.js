/* ============================================================
   ФИНАЛЬНОЕ ОБНОВЛЕНИЕ — ВСЕ ФУНКЦИИ В ОДНОМ ФАЙЛЕ
   - Исправлена ошибка closeHotline
   - Вход через Госуслуги, Мос.ру, Telegram
   - Профиль: редактирование фото, одна кнопка сохранения
   - Настройки: Liquid Glass (как у iPhone), две темы
   - Новости с источниками Мос.ру и ГБУ Жилищник
   - Дизайн в цветах жилищника (без ярких цветов)
   - Меню без лишних эмодзи
   - Добавлены роли: администрация МТО, аварийная, транспортная, техническая
   - Общие чаты для участков, склада и управления МТО
   ============================================================ */

(function() {
    'use strict';

    console.log('⏳ Загрузка финального обновления...');

    // ============================================================
    // ОЖИДАНИЕ ГОТОВНОСТИ
    // ============================================================
    function waitForApp() {
        if (typeof DB === 'undefined' || typeof currentUser === 'undefined' || typeof ROLES === 'undefined') {
            setTimeout(waitForApp, 200);
            return;
        }
        if (typeof ROLE_NAV === 'undefined' || typeof loadTab === 'undefined') {
            setTimeout(waitForApp, 200);
            return;
        }
        if (window.__CMTO_COMPLETE_LOADED) {
            console.warn('⚠️ Обновление уже активировано');
            return;
        }
        window.__CMTO_COMPLETE_LOADED = true;

        console.log('✅ Все данные загружены, запускаем обновление...');
        runUpdate();
    }

    // ============================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================================
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: #004b87;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            animation: fadeInUp 0.3s ease;
            font-size: 14px;
            max-width: 90%;
            text-align: center;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = '0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
    window.showToast = showToast;

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
            }
        } catch (e) {
            console.warn('Ошибка загрузки:', e);
        }
    }

    // ============================================================
    // 1. ДОБАВЛЕНИЕ СОЦИАЛЬНЫХ КНОПОК НА СТРАНИЦУ ВХОДА
    // ============================================================
    function addSocialLoginButtons() {
        const authContainer = document.querySelector('.auth-container');
        if (!authContainer) return;
        // Проверяем, не добавлены ли уже
        if (document.getElementById('socialLogin')) return;

        const socialDiv = document.createElement('div');
        socialDiv.id = 'socialLogin';
        socialDiv.style.cssText = `
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e0e4ea;
            text-align: center;
        `;
        socialDiv.innerHTML = `
            <div style="font-size:13px;color:#888;margin-bottom:12px;">Войти через</div>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                <button onclick="socialLogin('gosuslugi')" style="padding:8px 20px;background:#003b6f;color:white;border:none;border-radius:20px;font-weight:600;font-size:13px;cursor:pointer;">Госуслуги</button>
                <button onclick="socialLogin('mosru')" style="padding:8px 20px;background:#d4145a;color:white;border:none;border-radius:20px;font-weight:600;font-size:13px;cursor:pointer;">Мос.ру</button>
                <button onclick="socialLogin('telegram')" style="padding:8px 20px;background:#0088cc;color:white;border:none;border-radius:20px;font-weight:600;font-size:13px;cursor:pointer;">Telegram</button>
            </div>
        `;
        authContainer.appendChild(socialDiv);

        window.socialLogin = function(provider) {
            const names = { gosuslugi: 'Госуслуги', mosru: 'Мос.ру', telegram: 'Telegram' };
            showToast('🔐 Вход через ' + names[provider] + ' (демо-режим)');
            const phone = 'social_' + provider + '_' + Date.now().toString(36);
            let user = DB.users.find(u => u.phone === phone);
            if (!user) {
                user = { id: generateId(), name: provider.charAt(0).toUpperCase() + provider.slice(1) + 'User', phone: phone,
                    role: '' };
                DB.users.push(user);
            }
            currentUser = { ...user, isLoggedIn: true };
            showAuthScreen(false);
            showRoleSelection();
            saveState();
        };

        // Функция generateId, если не определена
        if (typeof generateId === 'undefined') {
            window.generateId = function() {
                return Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
            };
        }
    }

    // ============================================================
    // 2. НОВАЯ ВЕРХНЯЯ ПЛАШКА (бургер без эмодзи)
    // ============================================================
    function upgradeHeader() {
        const header = document.querySelector('.app-header');
        if (!header) return;

        const oldBurger = document.getElementById('burgerMenu');
        if (oldBurger) oldBurger.remove();
        const oldDropdown = document.getElementById('burgerDropdown');
        if (oldDropdown) oldDropdown.remove();

        const burger = document.createElement('button');
        burger.id = 'burgerMenu';
        burger.innerHTML = '☰';
        burger.style.cssText = `
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 10px;
            transition: 0.3s;
            color: #004b87;
            margin-right: 10px;
        `;
        burger.onmouseover = () => burger.style.background = 'rgba(0,75,135,0.08)';
        burger.onmouseout = () => burger.style.background = 'none';
        burger.onclick = function(e) {
            e.stopPropagation();
            const menu = document.getElementById('burgerDropdown');
            if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        };

        const userInfo = header.querySelector('.user-info');
        if (userInfo) userInfo.insertBefore(burger, userInfo.firstChild);
        else header.insertBefore(burger, header.firstChild);

        const dropdown = document.createElement('div');
        dropdown.id = 'burgerDropdown';
        dropdown.style.cssText = `
            display: none;
            position: absolute;
            top: 60px;
            left: 10px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            padding: 8px 0;
            min-width: 200px;
            z-index: 300;
            overflow: hidden;
        `;
        dropdown.innerHTML = `
            <div style="padding:8px 20px;font-weight:700;color:#004b87;border-bottom:1px solid #f0f2f5;">Меню</div>
            <div onclick="openProfile()" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;" onmouseover="this.style.background='#f0f4fa'" onmouseout="this.style.background='none'">👤 Профиль</div>
            <div onclick="openSettingsNew()" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;" onmouseover="this.style.background='#f0f4fa'" onmouseout="this.style.background='none'">⚙️ Настройки</div>
            <div onclick="openNews()" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;" onmouseover="this.style.background='#f0f4fa'" onmouseout="this.style.background='none'">📰 Новости</div>
            <div onclick="openHotline()" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;border-top:1px solid #f0f2f5;" onmouseover="this.style.background='#f0f4fa'" onmouseout="this.style.background='none'">📞 Горячая линия</div>
            <div onclick="handleLogout()" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;color:#d32f2f;border-top:1px solid #f0f2f5;" onmouseover="this.style.background='#fde8e8'" onmouseout="this.style.background='none'">🚪 Выйти</div>
        `;
        header.style.position = 'relative';
        header.appendChild(dropdown);

        document.addEventListener('click', function(e) {
            const menu = document.getElementById('burgerDropdown');
            if (menu && !e.target.closest('#burgerMenu') && !e.target.closest('#burgerDropdown')) {
                menu.style.display = 'none';
            }
        });

        const avatar = header.querySelector('.avatar');
        if (avatar) {
            avatar.style.borderRadius = '50%';
            avatar.style.width = '44px';
            avatar.style.height = '44px';
            avatar.style.display = 'flex';
            avatar.style.alignItems = 'center';
            avatar.style.justifyContent = 'center';
            avatar.style.fontSize = '20px';
            avatar.style.background = '#004b87';
            avatar.style.color = 'white';
        }

        const oldLogout = header.querySelector('.logout-btn');
        if (oldLogout) oldLogout.remove();
    }

    // ============================================================
    // 3. ПРОФИЛЬ (с фото, одной кнопкой сохранения)
    // ============================================================
    function createProfileSection() {
        if (document.getElementById('section-profile')) return;
        const appContent = document.getElementById('appContent');
        if (!appContent) return;

        const section = document.createElement('div');
        section.className = 'section';
        section.id = 'section-profile';
        section.innerHTML = `
            <h2 class="section-title">Профиль</h2>
            <div style="background:white;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.05);padding:24px;">
                <!-- Фото профиля -->
                <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:20px;">
                    <div id="profileAvatar" style="width:100px;height:100px;border-radius:50%;background:#e8ecf0;display:flex;align-items:center;justify-content:center;font-size:40px;color:#004b87;margin-bottom:10px;overflow:hidden;background-size:cover;background-position:center;">
                        ${currentUser.photo ? `<img src="${currentUser.photo}" style="width:100%;height:100%;object-fit:cover;">` : '👤'}
                    </div>
                    <input type="file" id="photoInput" accept="image/*" capture="environment" style="display:none;">
                    <button onclick="document.getElementById('photoInput').click()" style="padding:6px 16px;background:#f0f4fa;border:1px solid #d0d7e2;border-radius:20px;font-size:13px;color:#004b87;cursor:pointer;">📷 Изменить фото</button>
                </div>

                <div id="profileFields" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                        <label style="font-size:13px;color:#666;">ФИО</label>
                        <div class="profile-field" data-field="name">
                            <span class="field-display">${currentUser.name || 'Не указано'}</span>
                            <input class="field-edit" type="text" value="${currentUser.name || ''}" style="display:none;width:100%;padding:8px 12px;border:2px solid #d0d7e2;border-radius:8px;font-size:14px;">
                        </div>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#666;">Телефон</label>
                        <div class="profile-field" data-field="phone">
                            <span class="field-display">${currentUser.phone || 'Не указан'}</span>
                            <input class="field-edit" type="text" value="${currentUser.phone || ''}" style="display:none;width:100%;padding:8px 12px;border:2px solid #d0d7e2;border-radius:8px;font-size:14px;">
                        </div>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#666;">Email</label>
                        <div class="profile-field" data-field="email">
                            <span class="field-display">${currentUser.email || 'Не указан'}</span>
                            <input class="field-edit" type="email" value="${currentUser.email || ''}" style="display:none;width:100%;padding:8px 12px;border:2px solid #d0d7e2;border-radius:8px;font-size:14px;">
                        </div>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#666;">Участок</label>
                        <div class="profile-field" data-field="site">
                            <span class="field-display">${currentUser.site || 'Не выбран'}</span>
                            <select class="field-edit" style="display:none;width:100%;padding:8px 12px;border:2px solid #d0d7e2;border-radius:8px;font-size:14px;background:#f8fafc;">
                                <option value="none">Не выбран</option>
                                <option value="1" ${currentUser.site === '1' ? 'selected' : ''}>Участок №1</option>
                                <option value="2" ${currentUser.site === '2' ? 'selected' : ''}>Участок №2</option>
                                <option value="3" ${currentUser.site === '3' ? 'selected' : ''}>Участок №3</option>
                                <option value="4" ${currentUser.site === '4' ? 'selected' : ''}>Участок №4</option>
                                <option value="5" ${currentUser.site === '5' ? 'selected' : ''}>Участок №5</option>
                                <option value="6" ${currentUser.site === '6' ? 'selected' : ''}>Участок №6</option>
                                <option value="7" ${currentUser.site === '7' ? 'selected' : ''}>Участок №7</option>
                                <option value="8" ${currentUser.site === '8' ? 'selected' : ''}>Участок №8</option>
                                <option value="emergency" ${currentUser.site === 'emergency' ? 'selected' : ''}>Экстренная служба</option>
                                <option value="mto" ${currentUser.site === 'mto' ? 'selected' : ''}>Центр МТО</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
                    <button id="editProfileBtn" onclick="enableProfileEdit()" style="padding:8px 20px;background:#f0f4fa;border:1px solid #d0d7e2;border-radius:20px;font-size:14px;color:#004b87;cursor:pointer;">✏️ Редактировать</button>
                    <button id="saveProfileBtn" onclick="saveProfileAll()" style="display:none;padding:8px 20px;background:#004b87;border:none;border-radius:20px;font-size:14px;color:white;cursor:pointer;">💾 Сохранить</button>
                </div>

                <hr style="margin:20px 0;border-color:#f0f2f5;">

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                        <label style="font-size:13px;color:#666;">Должность</label>
                        <input type="text" id="profileRole" value="${ROLES[currentUser.role]?.label || ''}" style="width:100%;padding:8px 12px;border:2px solid #d0d7e2;border-radius:8px;font-size:14px;background:#f8fafc;" readonly>
                        <div style="margin-top:4px;font-size:12px;color:${currentUser.verified ? '#2e7d32' : '#d32f2f'};">${currentUser.verified ? '✅ Верифицирован' : '❌ Не верифицирован'}</div>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#666;">Ключ верификации</label>
                        <div style="display:flex;gap:6px;">
                            <input type="text" id="verifyKey" placeholder="Введите ключ" style="flex:1;padding:8px 12px;border:2px solid #d0d7e2;border-radius:8px;font-size:14px;background:#f8fafc;">
                            <button onclick="verifyUser()" style="padding:8px 16px;background:#004b87;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Подтвердить</button>
                        </div>
                    </div>
                </div>

                <div style="margin-top:16px;">
                    <label style="font-size:13px;color:#666;">Внутренний ID</label>
                    <div style="display:flex;gap:10px;align-items:center;">
                        <input type="text" id="profileId" value="${currentUser.internalId || 'Не назначен'}" style="flex:1;padding:8px 12px;border:2px solid #d0d7e2;border-radius:8px;font-size:14px;background:#f8fafc;" readonly>
                        <button onclick="generateInternalId()" style="padding:8px 16px;background:#f5a623;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">🎫 Сгенерировать</button>
                    </div>
                </div>
            </div>
        `;
        appContent.appendChild(section);

        // Функции профиля
        window.enableProfileEdit = function() {
            document.querySelectorAll('.profile-field').forEach(field => {
                const display = field.querySelector('.field-display');
                const edit = field.querySelector('.field-edit');
                if (display) display.style.display = 'none';
                if (edit) edit.style.display = 'block';
            });
            document.getElementById('editProfileBtn').style.display = 'none';
            document.getElementById('saveProfileBtn').style.display = 'inline-block';
        };

        window.saveProfileAll = function() {
            document.querySelectorAll('.profile-field').forEach(field => {
                const fieldName = field.dataset.field;
                const display = field.querySelector('.field-display');
                const edit = field.querySelector('.field-edit');
                let value = '';
                if (edit.tagName === 'SELECT') {
                    value = edit.options[edit.selectedIndex].value;
                } else {
                    value = edit.value.trim();
                }
                if (fieldName === 'name') currentUser.name = value;
                else if (fieldName === 'phone') currentUser.phone = value;
                else if (fieldName === 'email') currentUser.email = value;
                else if (fieldName === 'site') currentUser.site = value;

                // Обновляем отображение
                if (display) {
                    if (fieldName === 'site') {
                        const select = edit;
                        const selectedText = select.options[select.selectedIndex]?.text || 'Не выбран';
                        display.textContent = selectedText;
                    } else {
                        display.textContent = value || 'Не указано';
                    }
                    display.style.display = 'inline';
                }
                if (edit) edit.style.display = 'none';
            });

            // Обновляем пользователя в БД
            const user = DB.users.find(u => u.id === currentUser.id);
            if (user) {
                user.name = currentUser.name;
                user.phone = currentUser.phone;
                user.email = currentUser.email;
                user.site = currentUser.site;
            }
            document.getElementById('userName').textContent = currentUser.name || 'Пользователь';
            document.getElementById('editProfileBtn').style.display = 'inline-block';
            document.getElementById('saveProfileBtn').style.display = 'none';
            showToast('✅ Профиль сохранён');
            saveState();
        };

        // Фото
        document.getElementById('photoInput')?.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                const avatarDiv = document.getElementById('profileAvatar');
                avatarDiv.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
                currentUser.photo = ev.target.result;
                saveState();
                showToast('📸 Фото обновлено');
            };
            reader.readAsDataURL(file);
        });

        // Остальные функции
        window.verifyUser = function() {
            const key = document.getElementById('verifyKey').value.trim();
            if (!key) return showToast('⚠️ Введите ключ');
            if (key.length > 5) {
                currentUser.verified = true;
                const user = DB.users.find(u => u.id === currentUser.id);
                if (user) user.verified = true;
                document.getElementById('profileRole').value = ROLES[currentUser.role]?.label || '';
                showToast('✅ Верификация успешна');
                saveState();
                const statusDiv = document.querySelector('#section-profile [style*="color:"]');
                if (statusDiv) {
                    statusDiv.textContent = '✅ Верифицирован';
                    statusDiv.style.color = '#2e7d32';
                }
            } else {
                showToast('❌ Неверный ключ');
            }
        };

        window.generateInternalId = function() {
            if (currentUser.internalId) return showToast('❌ ID уже выдан');
            const id = 'MTO-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
            currentUser.internalId = id;
            const user = DB.users.find(u => u.id === currentUser.id);
            if (user) user.internalId = id;
            document.getElementById('profileId').value = id;
            showToast('🎫 ID сгенерирован');
            saveState();
        };

        window.openProfile = function() {
            const dropdown = document.getElementById('burgerDropdown');
            if (dropdown) dropdown.style.display = 'none';
            document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
            document.getElementById('section-profile').classList.add('active');
            // Обновляем значения
            document.querySelectorAll('.profile-field').forEach(field => {
                const fieldName = field.dataset.field;
                const display = field.querySelector('.field-display');
                const edit = field.querySelector('.field-edit');
                if (fieldName === 'site') {
                    const select = edit;
                    if (select) {
                        const selectedText = select.options[select.selectedIndex]?.text || 'Не выбран';
                        if (display) display.textContent = selectedText;
                    }
                } else {
                    const val = currentUser[fieldName] || 'Не указано';
                    if (display) display.textContent = val;
                    if (edit) edit.value = currentUser[fieldName] || '';
                }
                if (display) display.style.display = 'inline';
                if (edit) edit.style.display = 'none';
            });
            document.getElementById('editProfileBtn').style.display = 'inline-block';
            document.getElementById('saveProfileBtn').style.display = 'none';
            // Фото
            const avatarDiv = document.getElementById('profileAvatar');
            if (currentUser.photo) {
                avatarDiv.innerHTML = `<img src="${currentUser.photo}" style="width:100%;height:100%;object-fit:cover;">`;
            } else {
                avatarDiv.innerHTML = '👤';
            }
        };
    }

    // ============================================================
    // 4. НОВОСТНАЯ ЛЕНТА (с источниками Мос.ру, ГБУ Жилищник)
    // ============================================================
    function createNewsFeed() {
        if (document.getElementById('section-news')) return;
        const appContent = document.getElementById('appContent');
        if (!appContent) return;

        const section = document.createElement('div');
        section.className = 'section';
        section.id = 'section-news';
        section.innerHTML = `
            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="news-tab active" data-tab="all" onclick="switchNewsTab('all')" style="padding:8px 20px;border:none;border-radius:20px;background:#004b87;color:white;font-weight:600;cursor:pointer;">Все</button>
                <button class="news-tab" data-tab="mosru" onclick="switchNewsTab('mosru')" style="padding:8px 20px;border:none;border-radius:20px;background:#e8ecf0;color:#555;font-weight:600;cursor:pointer;">Мос.ру</button>
                <button class="news-tab" data-tab="gbuz" onclick="switchNewsTab('gbuz')" style="padding:8px 20px;border:none;border-radius:20px;background:#e8ecf0;color:#555;font-weight:600;cursor:pointer;">ГБУ Жилищник</button>
                <button class="news-tab" data-tab="orders" onclick="switchNewsTab('orders')" style="padding:8px 20px;border:none;border-radius:20px;background:#e8ecf0;color:#555;font-weight:600;cursor:pointer;">Приказы</button>
            </div>
            <div id="newsFeed" style="display:flex;flex-direction:column;gap:20px;"></div>
        `;
        appContent.appendChild(section);

        const newsData = {
            all: [
                { type: 'mosru', title: 'Мос.ру: Новый сервис для заявок', date: '29.07.2026', text: 'На портале Мос.ру запущен сервис подачи заявок на ремонт', image: '🏛️', source: 'mos.ru' },
                { type: 'gbuz', title: 'ГБУ Жилищник: Итоги работы за июль', date: '28.07.2026', text: 'Подведены итоги работы за месяц, выполнено 1200 заявок', image: '🏢', source: 'ГБУ Жилищник' },
                { type: 'orders', title: 'Приказ №45/2026 о назначении ответственных', date: '27.07.2026', text: 'Назначены ответственные за участки №1-8', image: '📄', source: 'ЦМТО' },
                { type: 'mosru', title: 'Мос.ру: Обновление мобильного приложения', date: '26.07.2026', text: 'Доступна новая версия приложения с улучшенным интерфейсом', image: '📱', source: 'mos.ru' },
                { type: 'gbuz', title: 'ГБУ Жилищник: Семинар по охране труда', date: '25.07.2026', text: 'Проведён семинар для сотрудников по технике безопасности', image: '📋', source: 'ГБУ Жилищник' },
                { type: 'orders', title: 'Приказ №44/2026 о режиме работы', date: '24.07.2026', text: 'Утверждён график смен для складов и хозотдела', image: '🕐', source: 'ЦМТО' },
            ],
            mosru: [
                { type: 'mosru', title: 'Мос.ру: Новый сервис для заявок', date: '29.07.2026', text: 'На портале Мос.ру запущен сервис подачи заявок на ремонт', image: '🏛️', source: 'mos.ru' },
                { type: 'mosru', title: 'Мос.ру: Обновление мобильного приложения', date: '26.07.2026', text: 'Доступна новая версия приложения с улучшенным интерфейсом', image: '📱', source: 'mos.ru' },
            ],
            gbuz: [
                { type: 'gbuz', title: 'ГБУ Жилищник: Итоги работы за июль', date: '28.07.2026', text: 'Подведены итоги работы за месяц, выполнено 1200 заявок', image: '🏢', source: 'ГБУ Жилищник' },
                { type: 'gbuz', title: 'ГБУ Жилищник: Семинар по охране труда', date: '25.07.2026', text: 'Проведён семинар для сотрудников по технике безопасности', image: '📋', source: 'ГБУ Жилищник' },
            ],
            orders: [
                { type: 'orders', title: 'Приказ №45/2026 о назначении ответственных', date: '27.07.2026', text: 'Назначены ответственные за участки №1-8', image: '📄', source: 'ЦМТО' },
                { type: 'orders', title: 'Приказ №44/2026 о режиме работы', date: '24.07.2026', text: 'Утверждён график смен для складов и хозотдела', image: '🕐', source: 'ЦМТО' },
            ]
        };

        function renderNews(tab) {
            const feed = document.getElementById('newsFeed');
            if (!feed) return;
            const items = newsData[tab] || newsData.all;
            feed.innerHTML = items.map(item => `
                <div style="background:white;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.04);overflow:hidden;padding:20px;border-left:4px solid ${item.type === 'mosru' ? '#003b6f' : item.type === 'gbuz' ? '#004b87' : '#888'};">
                    <div style="display:flex;gap:14px;align-items:flex-start;">
                        <span style="font-size:36px;line-height:1;">${item.image}</span>
                        <div style="flex:1;">
                            <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;">
                                <h3 style="font-size:18px;color:#004b87;margin:0;">${item.title}</h3>
                                <span style="font-size:12px;color:#888;">${item.date}</span>
                            </div>
                            <p style="margin:8px 0 0;color:#555;font-size:14px;line-height:1.5;">${item.text}</p>
                            <div style="margin-top:10px;font-size:12px;color:#999;display:flex;gap:12px;">
                                <span>🏷️ ${item.source}</span>
                                <span>👁️ ${Math.floor(50 + Math.random() * 150)} просмотров</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        window.switchNewsTab = function(tab) {
            document.querySelectorAll('.news-tab').forEach(btn => {
                btn.style.background = btn.dataset.tab === tab ? '#004b87' : '#e8ecf0';
                btn.style.color = btn.dataset.tab === tab ? 'white' : '#555';
            });
            renderNews(tab);
        };
        renderNews('all');

        window.openNews = function() {
            const dropdown = document.getElementById('burgerDropdown');
            if (dropdown) dropdown.style.display = 'none';
            document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
            const news = document.getElementById('section-news');
            if (news) news.classList.add('active');
        };

        // Быстрые кнопки
        const quickTabs = document.createElement('div');
        quickTabs.style.cssText = `
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        `;
        quickTabs.innerHTML = `
            <button onclick="openSection('chats')" style="flex:1;min-width:80px;padding:12px;border:none;border-radius:12px;background:#004b87;color:white;font-weight:600;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;">
                <span style="font-size:22px;">💬</span>
                <span style="font-size:11px;">Чаты</span>
            </button>
            <button onclick="openSection('requests')" style="flex:1;min-width:80px;padding:12px;border:none;border-radius:12px;background:#5a6c7d;color:white;font-weight:600;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;">
                <span style="font-size:22px;">📋</span>
                <span style="font-size:11px;">Заявки</span>
            </button>
            <button onclick="openSection('schedule')" style="flex:1;min-width:80px;padding:12px;border:none;border-radius:12px;background:#5a7d6c;color:white;font-weight:600;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;">
                <span style="font-size:22px;">📅</span>
                <span style="font-size:11px;">Расписание</span>
            </button>
        `;
        section.insertBefore(quickTabs, section.firstChild);

        window.openSection = function(sectionName) {
            const role = currentUser.role;
            const tabMap = { 'chats': 'chats', 'requests': 'requests', 'schedule': 'schedule' };
            const tabId = tabMap[sectionName];
            if (!tabId) return showToast('Раздел пока недоступен');
            const navItems = ROLE_NAV[role] || [];
            const found = navItems.find(item => item.id === tabId);
            if (found) {
                document.querySelectorAll('#bottomNav .nav-item').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.tab === tabId);
                });
                if (typeof loadTab === 'function') {
                    loadTab(tabId, role);
                }
                const sectionMap = {
                    director: 'section-director',
                    dispatcher: 'section-dispatcher',
                    warehouse: 'section-warehouse',
                    site: 'section-site',
                    gbuz: 'section-gbuz',
                    stock: 'section-stock'
                };
                const secId = sectionMap[role];
                if (secId) {
                    document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                    document.getElementById(secId).classList.add('active');
                }
            } else {
                showToast('Раздел недоступен для вашей роли');
            }
        };
    }

    // ============================================================
    // 5. ГОРЯЧАЯ ЛИНИЯ (с исправленной closeHotline)
    // ============================================================
    function createHotlineDrawer() {
        if (document.getElementById('hotlineDrawer')) {
            // Удаляем старый, чтобы пересоздать
            document.getElementById('hotlineDrawer').remove();
            document.getElementById('hotlineOverlay')?.remove();
        }

        const drawer = document.createElement('div');
        drawer.id = 'hotlineDrawer';
        drawer.style.cssText = `
            position: fixed;
            bottom: -320px;
            left: 0;
            right: 0;
            background: white;
            border-radius: 20px 20px 0 0;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
            padding: 24px 20px 30px;
            z-index: 500;
            transition: bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-height: 80vh;
            overflow-y: auto;
        `;
        drawer.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="color:#004b87;font-size:20px;">Горячая линия</h3>
                <button id="hotlineCloseBtn" style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="background:#f8fafc;padding:14px;border-radius:12px;">
                    <div style="font-size:12px;color:#888;">Единый номер</div>
                    <div style="font-weight:700;font-size:16px;color:#004b87;">8-800-XXX-XX-XX</div>
                </div>
                <div style="background:#f8fafc;padding:14px;border-radius:12px;">
                    <div style="font-size:12px;color:#888;">Отдел МТО</div>
                    <div style="font-weight:700;font-size:16px;color:#004b87;">8-495-XXX-XX-XX</div>
                </div>
                <div style="background:#f8fafc;padding:14px;border-radius:12px;">
                    <div style="font-size:12px;color:#888;">Диспетчерская</div>
                    <div style="font-weight:700;font-size:16px;color:#004b87;">8-495-XXX-XX-XX</div>
                </div>
                <div style="background:#f8fafc;padding:14px;border-radius:12px;">
                    <div style="font-size:12px;color:#888;">Склад</div>
                    <div style="font-weight:700;font-size:16px;color:#004b87;">8-495-XXX-XX-XX</div>
                </div>
            </div>
            <div style="margin-top:16px;padding:12px;background:#f0f4fa;border-radius:8px;font-size:13px;color:#004b87;text-align:center;">🕐 Круглосуточно</div>
        `;
        document.body.appendChild(drawer);

        const overlay = document.createElement('div');
        overlay.id = 'hotlineOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.2);
            z-index: 499;
            display: none;
        `;
        overlay.onclick = closeHotline;
        document.body.appendChild(overlay);

        // Определяем глобальные функции
        window.closeHotline = function() {
            const drawerEl = document.getElementById('hotlineDrawer');
            const overlayEl = document.getElementById('hotlineOverlay');
            if (drawerEl) drawerEl.style.bottom = '-320px';
            if (overlayEl) overlayEl.style.display = 'none';
            console.log('Горячая линия закрыта');
        };

        window.openHotline = function() {
            const dropdown = document.getElementById('burgerDropdown');
            if (dropdown) dropdown.style.display = 'none';
            const drawerEl = document.getElementById('hotlineDrawer');
            const overlayEl = document.getElementById('hotlineOverlay');
            if (drawerEl) drawerEl.style.bottom = '0';
            if (overlayEl) overlayEl.style.display = 'block';
            console.log('Горячая линия открыта');
        };

        // Привязываем кнопку закрытия
        const closeBtn = document.getElementById('hotlineCloseBtn');
        if (closeBtn) {
            closeBtn.onclick = closeHotline;
        }
    }

    // ============================================================
    // 6. НАСТРОЙКИ (Liquid Glass, две темы)
    // ============================================================
    function createNewSettings() {
        if (document.getElementById('section-settings')) return;
        const appContent = document.getElementById('appContent');
        if (!appContent) return;

        const section = document.createElement('div');
        section.className = 'section';
        section.id = 'section-settings';
        section.innerHTML = `
            <h2 class="section-title">Настройки</h2>
            <div style="background:white;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.05);padding:24px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                        <label style="font-size:13px;color:#666;">Язык</label>
                        <select id="settingsLang" style="width:100%;padding:8px 12px;border:2px solid #d0d7e2;border-radius:8px;font-size:14px;background:#f8fafc;">
                            <option value="ru">Русский</option>
                            <option value="en">English</option>
                        </select>
                        <button onclick="saveSetting('lang')" style="margin-top:4px;padding:4px 12px;background:#004b87;color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer;">Сохранить</button>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#666;">Уведомления</label>
                        <div style="display:flex;gap:12px;margin-top:6px;">
                            <button onclick="toggleNotifications(true)" style="padding:6px 16px;background:#2e7d32;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Вкл</button>
                            <button onclick="toggleNotifications(false)" style="padding:6px 16px;background:#c62828;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Выкл</button>
                        </div>
                        <div id="notifStatus" style="font-size:12px;color:#2e7d32;margin-top:4px;">✅ Включены</div>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#666;">Тема</label>
                        <select id="settingsTheme" style="width:100%;padding:8px 12px;border:2px solid #d0d7e2;border-radius:8px;font-size:14px;background:#f8fafc;">
                            <option value="system">Системная</option>
                            <option value="light">Светлая</option>
                            <option value="dark">Тёмная</option>
                        </select>
                        <button onclick="applyTheme()" style="margin-top:4px;padding:4px 12px;background:#004b87;color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer;">Применить</button>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#666;">Liquid Glass (iPhone)</label>
                        <button onclick="toggleLiquidGlass()" style="padding:8px 16px;background:#004b87;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">🔮 Включить</button>
                        <div id="glassStatus" style="font-size:12px;color:#888;margin-top:4px;">Статус: выключено</div>
                    </div>
                </div>
                <hr style="margin:16px 0;border-color:#f0f2f5;">
                <div style="display:flex;justify-content:space-between;font-size:14px;color:#888;flex-wrap:wrap;">
                    <span>Версия: <b>3.0</b></span>
                    <span>Обновлено: 29.07.2026</span>
                    <span>👤 ${currentUser.name || 'Гость'}</span>
                </div>
            </div>
        `;
        appContent.appendChild(section);

        // Функции
        window.saveSetting = function(setting) {
            if (setting === 'lang') {
                currentUser.lang = document.getElementById('settingsLang').value;
                showToast('Язык сохранён');
                saveState();
            }
        };

        window.toggleNotifications = function(on) {
            currentUser.notifications = on;
            const status = document.getElementById('notifStatus');
            if (on) {
                status.textContent = '✅ Включены';
                status.style.color = '#2e7d32';
                showToast('🔔 Уведомления включены');
            } else {
                status.textContent = '❌ Выключены';
                status.style.color = '#c62828';
                showToast('🔕 Уведомления выключены');
            }
            saveState();
        };

        window.applyTheme = function() {
            const theme = document.getElementById('settingsTheme').value;
            document.body.className = theme === 'dark' ? 'dark-theme' : '';
            if (theme === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.body.className = prefersDark ? 'dark-theme' : '';
            }
            // Добавляем дополнительные стили для тёмной темы (переопределяем все цвета)
            if (document.body.classList.contains('dark-theme')) {
                document.body.style.setProperty('--bg', '#1a1a2e');
                document.body.style.setProperty('--bg-alt', '#16213e');
                document.body.style.setProperty('--white', '#2a2a4a');
                document.body.style.setProperty('--shadow', '0 4px 20px rgba(0,0,0,0.3)');
                document.body.style.setProperty('--text', '#e0e0e0');
                document.body.style.color = '#e0e0e0';
            } else {
                document.body.style.setProperty('--bg', '#f0f4fa');
                document.body.style.setProperty('--bg-alt', '#e8eef5');
                document.body.style.setProperty('--white', '#ffffff');
                document.body.style.setProperty('--shadow', '0 4px 20px rgba(0,0,0,0.05)');
                document.body.style.setProperty('--text', '#1a2634');
                document.body.style.color = '#1a2634';
            }
            showToast('Тема применена');
            saveState();
        };

        window.toggleLiquidGlass = function() {
            const status = document.getElementById('glassStatus');
            const isEnabled = status.textContent.includes('включено');
            if (isEnabled) {
                document.body.style.backdropFilter = 'none';
                document.body.style.webkitBackdropFilter = 'none';
                document.body.style.backgroundColor = '';
                status.textContent = 'Статус: выключено';
                status.style.color = '#888';
                showToast('Liquid Glass выключен');
            } else {
                document.body.style.backdropFilter = 'blur(20px) saturate(180%)';
                document.body.style.webkitBackdropFilter = 'blur(20px) saturate(180%)';
                document.body.style.backgroundColor = 'rgba(255,255,255,0.6)';
                status.textContent = 'Статус: включено ✨';
                status.style.color = '#004b87';
                showToast('Liquid Glass включен (как на iPhone)');
            }
        };

        window.openSettingsNew = function() {
            const dropdown = document.getElementById('burgerDropdown');
            if (dropdown) dropdown.style.display = 'none';
            document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
            document.getElementById('section-settings').classList.add('active');
            if (currentUser.lang) document.getElementById('settingsLang').value = currentUser.lang;
            if (currentUser.notifications !== undefined) {
                const status = document.getElementById('notifStatus');
                if (status) {
                    status.textContent = currentUser.notifications ? '✅ Включены' : '❌ Выключены';
                    status.style.color = currentUser.notifications ? '#2e7d32' : '#c62828';
                }
            }
        };
    }

    // ============================================================
    // 7. ДОБАВЛЕНИЕ НОВЫХ РОЛЕЙ
    // ============================================================
    function addNewRoles() {
        const roleGrid = document.getElementById('roleGrid');
        if (!roleGrid) return;

        const newRoles = [
            { id: 'admin_mto', icon: '🛡️', label: 'Администрация МТО' },
            { id: 'emergency', icon: '🚨', label: 'Аварийная служба' },
            { id: 'transport', icon: '🚛', label: 'Транспортная служба' },
            { id: 'technical', icon: '🔧', label: 'Техническая служба' }
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
                // Создаем секцию для роли
                const content = document.getElementById('appContent');
                const section = document.createElement('div');
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
                document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                document.getElementById('section-' + r).classList.add('active');
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
    }

    // ============================================================
    // 8. ОБЩИЕ ЧАТЫ (для участков, склада, управления МТО)
    // ============================================================
    function addCommonChats() {
        // Добавляем чаты в ROLE_NAV для соответствующих ролей
        // Эти чаты будут отображаться в разделе "Чаты" для ролей, у которых есть доступ
        // Мы добавляем новые чаты в список чатов для ролей

        const chatList = document.createElement('div');
        chatList.id = 'commonChats';
        chatList.style.display = 'none';
        // Будет заполняться динамически при открытии вкладки "Чаты"
        // Мы переопределим функцию renderChats для каждой роли, чтобы добавить общие чаты

        // Добавляем общие чаты в объект DB.messages
        const commonChats = [
            { id: 'common_sites', name: 'Общий чат участков', roles: ['site', 'dispatcher', 'director'] },
            { id: 'common_warehouse', name: 'Общий чат склада', roles: ['warehouse', 'stock', 'dispatcher'] },
            { id: 'common_mto', name: 'Чат управления МТО', roles: ['director', 'dispatcher', 'warehouse', 'admin_mto'] }
        ];

        commonChats.forEach(chat => {
            if (!DB.messages[chat.id]) {
                DB.messages[chat.id] = [
                    { from: 'system', text: `Чат "${chat.name}" создан`, time: new Date().toISOString().slice(0, 16).replace('T', ' ') }
                ];
            }
        });

        // Переопределяем функцию отображения чатов для каждой роли
        // Используем существующую структуру ROLE_NAV, добавляя вкладку "chats" (она уже есть)
        // Мы перехватываем loadTab для 'chats' и добавляем общие чаты

        const originalLoadTab = window.loadTab;
        if (originalLoadTab) {
            window.loadTab = function(tabId, role) {
                if (tabId === 'chats') {
                    const container = getContentContainer(role);
                    if (container) {
                        renderChatsWithCommon(container, role);
                    }
                } else {
                    originalLoadTab(tabId, role);
                }
            };
        }

        function renderChatsWithCommon(container, role) {
            // Получаем список общих чатов для этой роли
            const commonForRole = commonChats.filter(chat => chat.roles.includes(role));

            // Строим HTML
            let html = `<div class="chat-list">`;

            // Добавляем персональные чаты (если есть)
            // Используем оригинальную функцию, если она определена
            if (typeof renderPersonalChats === 'function') {
                // Но мы не знаем, есть ли такая функция, поэтому просто добавим чаты из ROLE_NAV
                // Лучше вызовем оригинальный loadTab с 'chats' через оригинальную функцию
                // Но чтобы не зацикливаться, просто покажем общие чаты
            }

            // Показываем общие чаты
            commonForRole.forEach(chat => {
                html += `
                    <div class="chat-item" onclick="openChat('${chat.id}', '${chat.name}')">
                        <div class="chat-info">
                            <div class="chat-avatar">💬</div>
                            <div>
                                <div class="chat-name">${chat.name}</div>
                                <div class="chat-last">${getChatLast(chat.id)}</div>
                            </div>
                        </div>
                        <span class="chat-badge">${getChatUnread(chat.id)}</span>
                    </div>
                `;
            });

            // Добавляем персональные чаты (если есть)
            // Для демонстрации добавим стандартные для роли
            if (role === 'director') {
                html += `
                    <div class="chat-item" onclick="openChat('director_dispatcher', 'Диспетчер')">
                        <div class="chat-info">
                            <div class="chat-avatar">📡</div>
                            <div>
                                <div class="chat-name">Диспетчер</div>
                                <div class="chat-last">${getChatLast('director_dispatcher')}</div>
                            </div>
                        </div>
                        <span class="chat-badge">${getChatUnread('director_dispatcher')}</span>
                    </div>
                `;
            } else if (role === 'dispatcher') {
                html += `
                    <div class="chat-item" onclick="openChat('dispatcher_director', 'Директор')">
                        <div class="chat-info">
                            <div class="chat-avatar">👔</div>
                            <div>
                                <div class="chat-name">Директор</div>
                                <div class="chat-last">${getChatLast('dispatcher_director')}</div>
                            </div>
                        </div>
                        <span class="chat-badge">${getChatUnread('dispatcher_director')}</span>
                    </div>
                    <div class="chat-item" onclick="openChat('dispatcher_warehouse', 'Начальник склада')">
                        <div class="chat-info">
                            <div class="chat-avatar">📦</div>
                            <div>
                                <div class="chat-name">Начальник склада</div>
                                <div class="chat-last">${getChatLast('dispatcher_warehouse')}</div>
                            </div>
                        </div>
                        <span class="chat-badge">${getChatUnread('dispatcher_warehouse')}</span>
                    </div>
                `;
            } else if (role === 'warehouse') {
                html += `
                    <div class="chat-item" onclick="openChat('warehouse_dispatcher', 'Диспетчер')">
                        <div class="chat-info">
                            <div class="chat-avatar">📡</div>
                            <div>
                                <div class="chat-name">Диспетчер</div>
                                <div class="chat-last">${getChatLast('warehouse_dispatcher')}</div>
                            </div>
                        </div>
                        <span class="chat-badge">${getChatUnread('warehouse_dispatcher')}</span>
                    </div>
                    <div class="chat-item" onclick="openChat('warehouse_director', 'Директор')">
                        <div class="chat-info">
                            <div class="chat-avatar">👔</div>
                            <div>
                                <div class="chat-name">Директор</div>
                                <div class="chat-last">${getChatLast('warehouse_director')}</div>
                            </div>
                        </div>
                        <span class="chat-badge">${getChatUnread('warehouse_director')}</span>
                    </div>
                `;
            } else if (role === 'site') {
                html += `
                    <div class="chat-item" onclick="openChat('site_dispatcher', 'Диспетчер')">
                        <div class="chat-info">
                            <div class="chat-avatar">📡</div>
                            <div>
                                <div class="chat-name">Диспетчер</div>
                                <div class="chat-last">${getChatLast('site_dispatcher')}</div>
                            </div>
                        </div>
                        <span class="chat-badge">${getChatUnread('site_dispatcher')}</span>
                    </div>
                `;
            } else if (role === 'stock') {
                html += `
                    <div class="chat-item" onclick="openChat('stock_dispatcher', 'Диспетчер')">
                        <div class="chat-info">
                            <div class="chat-avatar">📡</div>
                            <div>
                                <div class="chat-name">Диспетчер</div>
                                <div class="chat-last">${getChatLast('stock_dispatcher')}</div>
                            </div>
                        </div>
                        <span class="chat-badge">${getChatUnread('stock_dispatcher')}</span>
                    </div>
                    <div class="chat-item" onclick="openChat('stock_warehouse', 'Начальник склада')">
                        <div class="chat-info">
                            <div class="chat-avatar">📦</div>
                            <div>
                                <div class="chat-name">Начальник склада</div>
                                <div class="chat-last">${getChatLast('stock_warehouse')}</div>
                            </div>
                        </div>
                        <span class="chat-badge">${getChatUnread('stock_warehouse')}</span>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        }

        // Функция getContentContainer для получения контейнера
        function getContentContainer(role) {
            const map = {
                director: document.getElementById('directorContent'),
                dispatcher: document.getElementById('dispatcherContent'),
                warehouse: document.getElementById('warehouseContent'),
                site: document.getElementById('siteContent'),
                stock: document.getElementById('stockContent'),
                admin_mto: document.getElementById('admin_mtoContent'),
                emergency: document.getElementById('emergencyContent'),
                transport: document.getElementById('transportContent'),
                technical: document.getElementById('technicalContent')
            };
            return map[role];
        }

        // Сохраняем ссылки на функции getChatLast, getChatUnread
        // Они уже определены в основном коде, но если нет, определяем
        if (typeof getChatLast === 'undefined') {
            window.getChatLast = function(chatId) {
                const msgs = DB.messages[chatId] || [];
                if (msgs.length === 0) return 'Нет сообщений';
                const last = msgs[msgs.length - 1];
                return last.text.length > 30 ? last.text.slice(0, 30) + '...' : last.text;
            };
        }
        if (typeof getChatUnread === 'undefined') {
            window.getChatUnread = function(chatId) {
                const msgs = DB.messages[chatId] || [];
                const unread = msgs.filter(m => m.from !== 'system' && m.from !== (currentUser.name || 'Пользователь'));
                return unread.length > 0 ? unread.length : 0;
            };
        }
    }

    // ============================================================
    // 9. АВТОМАТИЧЕСКИЙ ПОКАЗ НОВОСТЕЙ
    // ============================================================
    function autoShowNews() {
        const originalEnterApp = window.enterApp;
        if (originalEnterApp) {
            window.enterApp = function(role) {
                originalEnterApp(role);
                setTimeout(function() {
                    const newsSection = document.getElementById('section-news');
                    if (newsSection) {
                        document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                        newsSection.classList.add('active');
                        console.log('📰 Новости активированы автоматически');
                    }
                }, 500);
            };
        }

        if (currentUser && currentUser.role) {
            const newsSection = document.getElementById('section-news');
            if (newsSection && !newsSection.classList.contains('active')) {
                setTimeout(function() {
                    document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                    newsSection.classList.add('active');
                    console.log('📰 Новости активированы для текущего пользователя');
                }, 400);
            }
        }
    }

    // ============================================================
    // 10. ЗАПУСК ВСЕХ ФУНКЦИЙ
    // ============================================================
    function runUpdate() {
        loadState();

        setTimeout(function() {
            try {
                addSocialLoginButtons();
                upgradeHeader();
                createProfileSection();
                createNewsFeed();
                createHotlineDrawer();
                createNewSettings();
                addNewRoles();
                addCommonChats();
                autoShowNews();

                // Добавляем стили для тёмной темы и Liquid Glass
                const style = document.createElement('style');
                style.textContent = `
                    /* Тёмная тема (все элементы) */
                    body.dark-theme {
                        --bg: #1a1a2e !important;
                        --bg-alt: #16213e !important;
                        --white: #2a2a4a !important;
                        --shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
                        --text: #e0e0e0 !important;
                        background: #1a1a2e !important;
                        color: #e0e0e0 !important;
                    }
                    body.dark-theme .app-header,
                    body.dark-theme .bottom-nav,
                    body.dark-theme .card,
                    body.dark-theme .material-item,
                    body.dark-theme .request-card,
                    body.dark-theme .chat-item,
                    body.dark-theme .supply-item,
                    body.dark-theme .line-item,
                    body.dark-theme .auth-container,
                    body.dark-theme .request-form,
                    body.dark-theme .dashboard div,
                    body.dark-theme .stats div,
                    body.dark-theme .chat-window-header,
                    body.dark-theme .chat-input-area,
                    body.dark-theme .chat-msg.received,
                    body.dark-theme #hotlineDrawer,
                    body.dark-theme #burgerDropdown,
                    body.dark-theme .role-card,
                    body.dark-theme .zone,
                    body.dark-theme #zoneInfo,
                    body.dark-theme #section-profile > div,
                    body.dark-theme #section-settings > div,
                    body.dark-theme .news-tab,
                    body.dark-theme .process-step {
                        background: #2a2a4a !important;
                        border-color: #3a3a5a !important;
                        color: #e0e0e0 !important;
                    }
                    body.dark-theme .auth-form input,
                    body.dark-theme .request-form input,
                    body.dark-theme .request-form select,
                    body.dark-theme .request-form textarea,
                    body.dark-theme .chat-input-area input,
                    body.dark-theme #profileName,
                    body.dark-theme #profilePhone,
                    body.dark-theme #profileEmail,
                    body.dark-theme #profileRole,
                    body.dark-theme #verifyKey,
                    body.dark-theme #profileId,
                    body.dark-theme #profileSite,
                    body.dark-theme #settingsLang,
                    body.dark-theme #settingsTheme,
                    body.dark-theme .field-edit {
                        background: #1a1a2e !important;
                        border-color: #3a3a5a !important;
                        color: #e0e0e0 !important;
                    }
                    body.dark-theme .section-title,
                    body.dark-theme .card h3,
                    body.dark-theme .material-item .mat-name,
                    body.dark-theme .request-card .request-material,
                    body.dark-theme .chat-item .chat-name,
                    body.dark-theme .level,
                    body.dark-theme .zone-label,
                    body.dark-theme .step-label {
                        color: #6a9fd8 !important;
                    }
                    body.dark-theme .section-tag {
                        background: rgba(22,131,216,0.2) !important;
                        color: #6a9fd8 !important;
                    }
                    body.dark-theme .chat-msg.sent {
                        background: #004b87 !important;
                        color: white !important;
                    }
                    body.dark-theme .hero {
                        background: linear-gradient(135deg, #00264d, #004b87) !important;
                    }
                    body.dark-theme #burgerDropdown div:hover {
                        background: rgba(22,131,216,0.15) !important;
                    }
                    body.dark-theme .quick-actions button {
                        background: #2a2a4a !important;
                        color: #e0e0e0 !important;
                    }
                    body.dark-theme .quick-actions .fab-main {
                        background: #004b87 !important;
                        color: white !important;
                    }

                    /* Liquid Glass */
                    body.liquid-glass {
                        backdrop-filter: blur(20px) saturate(180%) !important;
                        -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
                        background-color: rgba(255,255,255,0.6) !important;
                    }
                    body.liquid-glass.dark-theme {
                        background-color: rgba(26,26,46,0.7) !important;
                    }

                    /* Профиль: поля */
                    .profile-field {
                        margin-bottom: 8px;
                    }
                    .field-display {
                        display: inline-block;
                        padding: 8px 12px;
                        background: #f8fafc;
                        border-radius: 8px;
                        width: 100%;
                        color: #1a2634;
                    }
                    body.dark-theme .field-display {
                        background: #1a1a2e;
                        color: #e0e0e0;
                    }

                    /* Аватарка */
                    #profileAvatar {
                        width: 100px;
                        height: 100px;
                        border-radius: 50%;
                        background: #e8ecf0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 40px;
                        color: #004b87;
                        margin-bottom: 10px;
                        overflow: hidden;
                        background-size: cover;
                        background-position: center;
                    }
                    body.dark-theme #profileAvatar {
                        background: #2a2a4a;
                    }
                `;
                document.head.appendChild(style);

                setTimeout(function() {
                    showToast('🚀 ЦМТО PRO загружено!');
                }, 1000);

                console.log('✅ Финальное обновление успешно активировано');
            } catch (e) {
                console.error('❌ Ошибка при активации обновления:', e);
            }
        }, 500);
    }

    // Запуск
    waitForApp();

})();