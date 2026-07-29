/* ============================================================
   ОБНОВЛЕНИЕ 3.0 - ЦМТО Кунцево PRO
   - Профиль с верификацией и выбором участка
   - Новостная лента в стиле Яндекс.Дзен
   - Горячая линия (шторка)
   - Настройки: язык, тема, liquid glass, уведомления
   - Новая верхняя плашка с бургер-меню и круглой аватаркой
   - Главный экран: новости + быстрые разделы (чаты, заявки, расписание)
   ============================================================ */

(function() {
    'use strict';

    console.log('🔄 Загрузка обновления 3.0...');

    // ============================================================
    // 1. НОВАЯ ВЕРХНЯЯ ПЛАШКА (бургер вместо шестерёнки)
    // ============================================================

    function upgradeHeader() {
        const header = document.querySelector('.app-header');
        if (!header) return;

        // Удаляем старую кнопку настроек (если есть)
        const oldSettings = header.querySelector('[onclick*="toggleSettings"]');
        if (oldSettings) oldSettings.remove();

        // Добавляем бургер-меню слева
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
            color: var(--blue);
            margin-right: 10px;
        `;
        burger.onmouseover = () => burger.style.background = 'var(--blue-glow)';
        burger.onmouseout = () => burger.style.background = 'none';
        burger.onclick = toggleBurgerMenu;

        // Вставляем бургер в начало header
        const userInfo = header.querySelector('.user-info');
        if (userInfo) {
            userInfo.insertBefore(burger, userInfo.firstChild);
        } else {
            header.insertBefore(burger, header.firstChild);
        }

        // Создаём выпадающее меню для бургера
        const burgerMenu = document.createElement('div');
        burgerMenu.id = 'burgerDropdown';
        burgerMenu.style.cssText = `
            display: none;
            position: absolute;
            top: 60px;
            left: 10px;
            background: white;
            border-radius: var(--radius);
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            padding: 8px 0;
            min-width: 200px;
            z-index: 300;
            overflow: hidden;
        `;
        burgerMenu.innerHTML = `
            <div style="padding:8px 20px;font-weight:700;color:var(--blue);border-bottom:1px solid #eee;">Меню</div>
            <div onclick="openProfile()" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;" onmouseover="this.style.background='var(--blue-glow)'" onmouseout="this.style.background='none'">👤 Профиль</div>
            <div onclick="openSettingsNew()" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;" onmouseover="this.style.background='var(--blue-glow)'" onmouseout="this.style.background='none'">⚙️ Настройки</div>
            <div onclick="openNews()" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;" onmouseover="this.style.background='var(--blue-glow)'" onmouseout="this.style.background='none'">📰 Новости</div>
            <div onclick="openHotline()" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;border-top:1px solid #eee;" onmouseover="this.style.background='var(--blue-glow)'" onmouseout="this.style.background='none'">📞 Горячая линия</div>
            <div onclick="handleLogout()" style="padding:10px 20px;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:10px;color:var(--red);border-top:1px solid #eee;" onmouseover="this.style.background='#fee'" onmouseout="this.style.background='none'">🚪 Выйти</div>
        `;
        header.style.position = 'relative';
        header.appendChild(burgerMenu);

        // Функции для бургера
        window.toggleBurgerMenu = function(e) {
            e.stopPropagation();
            const menu = document.getElementById('burgerDropdown');
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        };

        // Закрытие бургера при клике вне
        document.addEventListener('click', function(e) {
            const menu = document.getElementById('burgerDropdown');
            if (menu && !e.target.closest('#burgerMenu') && !e.target.closest('#burgerDropdown')) {
                menu.style.display = 'none';
            }
        });

        // Делаем аватарку круглой
        const avatar = header.querySelector('.avatar');
        if (avatar) {
            avatar.style.borderRadius = '50%';
            avatar.style.width = '44px';
            avatar.style.height = '44px';
            avatar.style.fontSize = '20px';
            avatar.style.display = 'flex';
            avatar.style.alignItems = 'center';
            avatar.style.justifyContent = 'center';
        }

        // Удаляем старую кнопку "Выйти" если есть в header
        const oldLogout = header.querySelector('.logout-btn');
        if (oldLogout) oldLogout.remove();
    }

    // ============================================================
    // 2. ПРОФИЛЬ (с верификацией, выбором участка, редактированием)
    // ============================================================

    function createProfileSection() {
        // Добавляем раздел профиля в appContent
        const appContent = document.getElementById('appContent');
        if (!appContent) return;

        const profileSection = document.createElement('div');
        profileSection.className = 'section';
        profileSection.id = 'section-profile';
        profileSection.innerHTML = `
            <h2 class="section-title">👤 Профиль</h2>
            <div style="background:white;padding:24px;border-radius:var(--radius);box-shadow:var(--shadow);">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                        <label style="font-size:13px;color:#888;">ФИО</label>
                        <input type="text" id="profileName" value="${currentUser.name || ''}" style="width:100%;padding:10px;border:2px solid #e8ecf0;border-radius:8px;font-size:14px;background:#f8fafc;">
                        <button onclick="saveProfileField('name')" style="margin-top:4px;padding:4px 12px;background:var(--blue);color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer;">Сохранить</button>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#888;">Телефон</label>
                        <input type="text" id="profilePhone" value="${currentUser.phone || ''}" style="width:100%;padding:10px;border:2px solid #e8ecf0;border-radius:8px;font-size:14px;background:#f8fafc;">
                        <button onclick="saveProfileField('phone')" style="margin-top:4px;padding:4px 12px;background:var(--blue);color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer;">Сохранить</button>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#888;">Email</label>
                        <input type="email" id="profileEmail" value="${currentUser.email || ''}" style="width:100%;padding:10px;border:2px solid #e8ecf0;border-radius:8px;font-size:14px;background:#f8fafc;">
                        <button onclick="saveProfileField('email')" style="margin-top:4px;padding:4px 12px;background:var(--blue);color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer;">Сохранить</button>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#888;">Привязка аккаунта</label>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                            <button onclick="linkAccount('gosuslugi')" style="padding:6px 14px;background:#003b6f;color:white;border:none;border-radius:8px;font-size:12px;cursor:pointer;">Госуслуги</button>
                            <button onclick="linkAccount('mosru')" style="padding:6px 14px;background:#d4145a;color:white;border:none;border-radius:8px;font-size:12px;cursor:pointer;">Мос.ру</button>
                        </div>
                        <div id="linkStatus" style="font-size:12px;color:var(--green);margin-top:4px;">${currentUser.linked ? '✅ Привязано' : '❌ Не привязано'}</div>
                    </div>
                </div>
                <hr style="margin:16px 0;border-color:#eee;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                        <label style="font-size:13px;color:#888;">Должность</label>
                        <input type="text" id="profileRole" value="${ROLES[currentUser.role]?.label || ''}" style="width:100%;padding:10px;border:2px solid #e8ecf0;border-radius:8px;font-size:14px;background:#f8fafc;" readonly>
                        <div style="margin-top:4px;font-size:12px;color:${currentUser.verified ? 'var(--green)' : 'var(--red)'};">${currentUser.verified ? '✅ Верифицирован' : '❌ Не верифицирован'}</div>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#888;">Ключ верификации</label>
                        <div style="display:flex;gap:6px;">
                            <input type="text" id="verifyKey" placeholder="Введите ключ" style="flex:1;padding:10px;border:2px solid #e8ecf0;border-radius:8px;font-size:14px;background:#f8fafc;">
                            <button onclick="verifyUser()" style="padding:10px 16px;background:var(--blue);color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Подтвердить</button>
                        </div>
                    </div>
                </div>
                <div style="margin-top:16px;">
                    <label style="font-size:13px;color:#888;">Внутренний ID сотрудника</label>
                    <div style="display:flex;gap:10px;align-items:center;">
                        <input type="text" id="profileId" value="${currentUser.internalId || 'Не назначен'}" style="flex:1;padding:10px;border:2px solid #e8ecf0;border-radius:8px;font-size:14px;background:#f8fafc;" readonly>
                        <button onclick="generateInternalId()" style="padding:10px 16px;background:var(--gold);color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">🎫 Сгенерировать</button>
                    </div>
                    <div style="font-size:12px;color:#888;margin-top:4px;">ID выдается единоразово</div>
                </div>
                <div style="margin-top:16px;">
                    <label style="font-size:13px;color:#888;">Участок</label>
                    <select id="profileSite" style="width:100%;padding:10px;border:2px solid #e8ecf0;border-radius:8px;font-size:14px;background:#f8fafc;">
                        <option value="none">Не выбран</option>
                        <option value="1">Участок №1</option>
                        <option value="2">Участок №2</option>
                        <option value="3">Участок №3</option>
                        <option value="4">Участок №4</option>
                        <option value="5">Участок №5</option>
                        <option value="6">Участок №6</option>
                        <option value="7">Участок №7</option>
                        <option value="8">Участок №8</option>
                        <option value="emergency">Экстренная служба</option>
                        <option value="mto">Центр МТО</option>
                    </select>
                    <button onclick="saveProfileField('site')" style="margin-top:4px;padding:4px 12px;background:var(--blue);color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer;">Сохранить участок</button>
                </div>
            </div>
        `;
        appContent.appendChild(profileSection);

        // Добавляем функции для профиля
        window.saveProfileField = function(field) {
            const map = {
                name: 'profileName',
                phone: 'profilePhone',
                email: 'profileEmail',
                site: 'profileSite'
            };
            const input = document.getElementById(map[field]);
            if (!input) return;
            const value = input.value.trim();
            if (!value) return alert('Поле не может быть пустым');

            if (field === 'name') currentUser.name = value;
            else if (field === 'phone') currentUser.phone = value;
            else if (field === 'email') currentUser.email = value;
            else if (field === 'site') currentUser.site = value;

            // Обновляем в базе
            const user = DB.users.find(u => u.id === currentUser.id);
            if (user) {
                user.name = currentUser.name;
                user.phone = currentUser.phone;
                user.email = currentUser.email;
                user.site = currentUser.site;
            }
            // Обновляем отображение в header
            document.getElementById('userName').textContent = currentUser.name || 'Пользователь';
            showNotification('✅ Сохранено', 'Поле обновлено');
            saveState();
        };

        window.verifyUser = function() {
            const key = document.getElementById('verifyKey').value.trim();
            if (!key) return alert('Введите ключ верификации');
            // Проверяем ключ (в демо-режиме любой ключ подходит)
            if (key.length > 5) {
                currentUser.verified = true;
                // Обновляем в базе
                const user = DB.users.find(u => u.id === currentUser.id);
                if (user) user.verified = true;
                document.getElementById('profileRole').value = ROLES[currentUser.role]?.label || '';
                showNotification('✅ Верификация успешна', 'Должность подтверждена');
                saveState();
                // Обновляем интерфейс
                const statusDiv = document.querySelector('#section-profile [style*="color:"]');
                if (statusDiv) {
                    statusDiv.textContent = '✅ Верифицирован';
                    statusDiv.style.color = 'var(--green)';
                }
            } else {
                alert('❌ Неверный ключ верификации');
            }
        };

        window.generateInternalId = function() {
            if (currentUser.internalId) {
                alert('❌ ID уже выдан: ' + currentUser.internalId);
                return;
            }
            const id = 'MTO-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
            currentUser.internalId = id;
            const user = DB.users.find(u => u.id === currentUser.id);
            if (user) user.internalId = id;
            document.getElementById('profileId').value = id;
            showNotification('🎫 ID сгенерирован', id);
            saveState();
        };

        window.linkAccount = function(provider) {
            currentUser.linked = true;
            const user = DB.users.find(u => u.id === currentUser.id);
            if (user) user.linked = true;
            document.getElementById('linkStatus').textContent = '✅ Привязано (' + provider + ')';
            document.getElementById('linkStatus').style.color = 'var(--green)';
            showNotification('🔗 Аккаунт привязан', provider);
            saveState();
        };

        // Функция открытия профиля
        window.openProfile = function() {
            document.getElementById('burgerDropdown').style.display = 'none';
            document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
            document.getElementById('section-profile').classList.add('active');
            // Обновляем данные
            document.getElementById('profileName').value = currentUser.name || '';
            document.getElementById('profilePhone').value = currentUser.phone || '';
            document.getElementById('profileEmail').value = currentUser.email || '';
            document.getElementById('profileId').value = currentUser.internalId || 'Не назначен';
            if (currentUser.site) {
                document.getElementById('profileSite').value = currentUser.site;
            }
        };
    }

    // ============================================================
    // 3. НОВОСТНАЯ ЛЕНТА (стиль Яндекс.Дзен) + быстрые разделы
    // ============================================================

    function createNewsFeed() {
        const appContent = document.getElementById('appContent');
        if (!appContent) return;

        const newsSection = document.createElement('div');
        newsSection.className = 'section';
        newsSection.id = 'section-news';
        newsSection.innerHTML = `
            <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="nav-item active" data-news-tab="all" onclick="switchNewsTab('all')" style="padding:8px 20px;border:none;border-radius:20px;background:var(--blue);color:white;font-weight:600;cursor:pointer;">Все</button>
                <button class="nav-item" data-news-tab="news" onclick="switchNewsTab('news')" style="padding:8px 20px;border:none;border-radius:20px;background:#e8ecf0;color:#555;font-weight:600;cursor:pointer;">Новости</button>
                <button class="nav-item" data-news-tab="articles" onclick="switchNewsTab('articles')" style="padding:8px 20px;border:none;border-radius:20px;background:#e8ecf0;color:#555;font-weight:600;cursor:pointer;">Статьи</button>
                <button class="nav-item" data-news-tab="orders" onclick="switchNewsTab('orders')" style="padding:8px 20px;border:none;border-radius:20px;background:#e8ecf0;color:#555;font-weight:600;cursor:pointer;">Приказы</button>
            </div>
            <div id="newsFeed" style="display:flex;flex-direction:column;gap:20px;">
                <!-- Карточки новостей будут загружены динамически -->
            </div>
        `;
        appContent.appendChild(newsSection);

        // Данные новостей
        const newsData = {
            all: [
                { type: 'news', title: 'Запуск новой системы заявок', date: '29.07.2026', text: 'С сегодняшнего дня все заявки проходят через цифровую платформу ЦМТО. Это повысит скорость обработки на 30%.', image: '📱' },
                { type: 'articles', title: 'Как оптимизировать складские запасы', date: '28.07.2026', text: 'Рекомендации по управлению запасами: анализ оборачиваемости, система минимальных остатков и автоматизация учёта.', image: '📊' },
                { type: 'orders', title: 'Приказ №45/2026 о назначении ответственных', date: '27.07.2026', text: 'Назначены ответственные за участки №1-8. График работы и зоны ответственности утверждены.', image: '📄' },
                { type: 'news', title: 'Пополнение склада на 5000 единиц', date: '26.07.2026', text: 'Поставка материалов завершена. На складе появились новые позиции: цемент, арматура, краска.', image: '📦' },
                { type: 'articles', title: 'Эффективное планирование закупок', date: '25.07.2026', text: 'Методика прогнозирования потребностей на основе исторических данных и сезонных колебаний.', image: '📈' },
                { type: 'orders', title: 'Приказ №44/2026 о режиме работы', date: '24.07.2026', text: 'Утверждён график смен для складов и хозотдела. Смена А: 08:00-20:00, смена Б: 20:00-08:00.', image: '🕐' },
            ],
            news: [
                { type: 'news', title: 'Запуск новой системы заявок', date: '29.07.2026', text: 'С сегодняшнего дня все заявки проходят через цифровую платформу ЦМТО. Это повысит скорость обработки на 30%.', image: '📱' },
                { type: 'news', title: 'Пополнение склада на 5000 единиц', date: '26.07.2026', text: 'Поставка материалов завершена. На складе появились новые позиции: цемент, арматура, краска.', image: '📦' },
            ],
            articles: [
                { type: 'articles', title: 'Как оптимизировать складские запасы', date: '28.07.2026', text: 'Рекомендации по управлению запасами: анализ оборачиваемости, система минимальных остатков и автоматизация учёта.', image: '📊' },
                { type: 'articles', title: 'Эффективное планирование закупок', date: '25.07.2026', text: 'Методика прогнозирования потребностей на основе исторических данных и сезонных колебаний.', image: '📈' },
            ],
            orders: [
                { type: 'orders', title: 'Приказ №45/2026 о назначении ответственных', date: '27.07.2026', text: 'Назначены ответственные за участки №1-8. График работы и зоны ответственности утверждены.', image: '📄' },
                { type: 'orders', title: 'Приказ №44/2026 о режиме работы', date: '24.07.2026', text: 'Утверждён график смен для складов и хозотдела. Смена А: 08:00-20:00, смена Б: 20:00-08:00.', image: '🕐' },
            ]
        };

        function renderNews(tab = 'all') {
            const feed = document.getElementById('newsFeed');
            if (!feed) return;
            const items = newsData[tab] || newsData.all;
            feed.innerHTML = items.map(item => `
                <div style="background:white;border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden;padding:20px;border-left:4px solid ${item.type === 'news' ? 'var(--blue-light)' : item.type === 'articles' ? 'var(--gold)' : 'var(--green)'};">
                    <div style="display:flex;gap:14px;align-items:flex-start;">
                        <span style="font-size:40px;line-height:1;">${item.image}</span>
                        <div style="flex:1;">
                            <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;">
                                <h3 style="font-size:18px;color:var(--blue);margin:0;">${item.title}</h3>
                                <span style="font-size:12px;color:#888;">${item.date}</span>
                            </div>
                            <p style="margin:8px 0 0;color:#555;font-size:14px;line-height:1.5;">${item.text}</p>
                            <div style="margin-top:10px;font-size:12px;color:#999;display:flex;gap:12px;">
                                <span>🏷️ ${item.type === 'news' ? 'Новость' : item.type === 'articles' ? 'Статья' : 'Приказ'}</span>
                                <span>👁️ 125 просмотров</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        window.switchNewsTab = function(tab) {
            document.querySelectorAll('[data-news-tab]').forEach(btn => {
                btn.style.background = btn.dataset.newsTab === tab ? 'var(--blue)' : '#e8ecf0';
                btn.style.color = btn.dataset.newsTab === tab ? 'white' : '#555';
            });
            renderNews(tab);
        };

        // Первоначальный рендер
        renderNews('all');

        // Функция открытия новостей
        window.openNews = function() {
            document.getElementById('burgerDropdown').style.display = 'none';
            document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
            document.getElementById('section-news').classList.add('active');
        };
    }

    // ============================================================
    // 4. БЫСТРЫЕ РАЗДЕЛЫ НАД НОВОСТЯМИ (чаты, заявки, расписание)
    // ============================================================

    function addQuickTabs() {
        const newsSection = document.getElementById('section-news');
        if (!newsSection) return;

        const quickTabs = document.createElement('div');
        quickTabs.style.cssText = `
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        `;
        quickTabs.innerHTML = `
            <button onclick="openSection('chats')" style="flex:1;min-width:80px;padding:12px;border:none;border-radius:12px;background:var(--blue);color:white;font-weight:700;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;">
                <span style="font-size:24px;">💬</span>
                <span style="font-size:12px;">Чаты</span>
            </button>
            <button onclick="openSection('requests')" style="flex:1;min-width:80px;padding:12px;border:none;border-radius:12px;background:var(--gold);color:white;font-weight:700;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;">
                <span style="font-size:24px;">📋</span>
                <span style="font-size:12px;">Заявки</span>
            </button>
            <button onclick="openSection('schedule')" style="flex:1;min-width:80px;padding:12px;border:none;border-radius:12px;background:var(--green);color:white;font-weight:700;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;">
                <span style="font-size:24px;">📅</span>
                <span style="font-size:12px;">Расписание</span>
            </button>
        `;
        newsSection.insertBefore(quickTabs, newsSection.firstChild);

        window.openSection = function(section) {
            // Определяем, какой таб нужно открыть
            const role = currentUser.role;
            const navMap = {
                'chats': 'chats',
                'requests': 'requests',
                'schedule': 'schedule'
            };
            const tabId = navMap[section];
            if (!tabId) return;

            // Ищем соответствующий таб в навигации
            const navItems = ROLE_NAV[role] || [];
            const found = navItems.find(item => item.id === tabId);
            if (found) {
                // Переключаем на этот таб
                document.querySelectorAll('#bottomNav .nav-item').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.tab === tabId);
                });
                loadTab(tabId, role);
                // Показываем соответствующую секцию
                const sectionMap = {
                    director: 'section-director',
                    dispatcher: 'section-dispatcher',
                    warehouse: 'section-warehouse',
                    site: 'section-site',
                    gbuz: 'section-gbuz',
                    stock: 'section-stock',
                    purchase: 'section-purchase',
                    transport: 'section-transport'
                };
                const secId = sectionMap[role];
                if (secId) {
                    document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
                    document.getElementById(secId).classList.add('active');
                }
            } else {
                // Если нет такого таба, показываем сообщение
                alert(`Раздел "${section}" пока недоступен для вашей роли`);
            }
        };
    }

    // ============================================================
    // 5. ГОРЯЧАЯ ЛИНИЯ (шторка снизу)
    // ============================================================

    function createHotlineDrawer() {
        const drawer = document.createElement('div');
        drawer.id = 'hotlineDrawer';
        drawer.style.cssText = `
            position: fixed;
            bottom: -300px;
            left: 0;
            right: 0;
            background: white;
            border-radius: 20px 20px 0 0;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.15);
            padding: 24px 20px 30px;
            z-index: 500;
            transition: bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-height: 80vh;
            overflow-y: auto;
        `;
        drawer.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="color:var(--blue);font-size:20px;">📞 Горячая линия</h3>
                <button onclick="closeHotline()" style="background:none;border:none;font-size:24px;cursor:pointer;">✕</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="background:#f8fafc;padding:14px;border-radius:12px;">
                    <div style="font-size:12px;color:#888;">Единый номер</div>
                    <div style="font-weight:700;font-size:16px;color:var(--blue);">8-800-XXX-XX-XX</div>
                </div>
                <div style="background:#f8fafc;padding:14px;border-radius:12px;">
                    <div style="font-size:12px;color:#888;">Отдел МТО</div>
                    <div style="font-weight:700;font-size:16px;color:var(--blue);">8-495-XXX-XX-XX</div>
                </div>
                <div style="background:#f8fafc;padding:14px;border-radius:12px;">
                    <div style="font-size:12px;color:#888;">Диспетчерская</div>
                    <div style="font-weight:700;font-size:16px;color:var(--blue);">8-495-XXX-XX-XX</div>
                </div>
                <div style="background:#f8fafc;padding:14px;border-radius:12px;">
                    <div style="font-size:12px;color:#888;">Склад</div>
                    <div style="font-weight:700;font-size:16px;color:var(--blue);">8-495-XXX-XX-XX</div>
                </div>
            </div>
            <div style="margin-top:16px;padding:12px;background:#fff3cd;border-radius:8px;font-size:13px;color:#856404;text-align:center;">
                🕐 Режим работы: круглосуточно, без выходных
            </div>
        `;
        document.body.appendChild(drawer);

        // Оверлей для закрытия
        const overlay = document.createElement('div');
        overlay.id = 'hotlineOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.3);
            z-index: 499;
            display: none;
        `;
        overlay.onclick = closeHotline;
        document.body.appendChild(overlay);

        window.openHotline = function() {
            document.getElementById('burgerDropdown').style.display = 'none';
            document.getElementById('hotlineDrawer').style.bottom = '0';
            document.getElementById('hotlineOverlay').style.display = 'block';
        };

        window.closeHotline = function() {
            document.getElementById('hotlineDrawer').style.bottom = '-300px';
            document.getElementById('hotlineOverlay').style.display = 'none';
        };
    }

    // ============================================================
    // 6. НОВЫЕ НАСТРОЙКИ (язык, тема, уведомления, liquid glass)
    // ============================================================

    function createNewSettings() {
        // Добавляем раздел настроек
        const appContent = document.getElementById('appContent');
        if (!appContent) return;

        const settingsSection = document.createElement('div');
        settingsSection.className = 'section';
        settingsSection.id = 'section-settings';
        settingsSection.innerHTML = `
            <h2 class="section-title">⚙️ Настройки</h2>
            <div style="background:white;padding:24px;border-radius:var(--radius);box-shadow:var(--shadow);">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                        <label style="font-size:13px;color:#888;">Язык</label>
                        <select id="settingsLang" style="width:100%;padding:10px;border:2px solid #e8ecf0;border-radius:8px;font-size:14px;background:#f8fafc;">
                            <option value="ru">Русский</option>
                            <option value="en">English</option>
                        </select>
                        <button onclick="saveSetting('lang')" style="margin-top:4px;padding:4px 12px;background:var(--blue);color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer;">Сохранить</button>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#888;">Уведомления</label>
                        <div style="display:flex;gap:12px;margin-top:6px;">
                            <button onclick="toggleNotifications(true)" style="padding:6px 16px;background:var(--green);color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Вкл</button>
                            <button onclick="toggleNotifications(false)" style="padding:6px 16px;background:var(--red);color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">Выкл</button>
                        </div>
                        <div id="notifStatus" style="font-size:12px;color:var(--green);margin-top:4px;">✅ Включены</div>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#888;">Тема</label>
                        <select id="settingsTheme" style="width:100%;padding:10px;border:2px solid #e8ecf0;border-radius:8px;font-size:14px;background:#f8fafc;">
                            <option value="system">Системная</option>
                            <option value="light">Светлая</option>
                            <option value="dark">Тёмная</option>
                        </select>
                        <button onclick="applyTheme()" style="margin-top:4px;padding:4px 12px;background:var(--blue);color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer;">Применить</button>
                    </div>
                    <div>
                        <label style="font-size:13px;color:#888;">Liquid Glass (iPhone)</label>
                        <button onclick="toggleLiquidGlass()" style="padding:8px 16px;background:var(--blue-light);color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">🔮 Включить</button>
                        <div id="glassStatus" style="font-size:12px;color:#888;margin-top:4px;">Статус: выключено</div>
                    </div>
                </div>
                <hr style="margin:16px 0;border-color:#eee;">
                <div style="display:flex;justify-content:space-between;font-size:14px;color:#888;">
                    <span>Версия сайта: <b>3.0</b></span>
                    <span>Последнее обновление: 29.07.2026</span>
                </div>
            </div>
        `;
        appContent.appendChild(settingsSection);

        // Функции настроек
        window.saveSetting = function(setting) {
            if (setting === 'lang') {
                const lang = document.getElementById('settingsLang').value;
                currentUser.lang = lang;
                showNotification('🌐 Язык сохранён', lang === 'ru' ? 'Русский' : 'English');
                saveState();
            }
        };

        window.toggleNotifications = function(on) {
            currentUser.notifications = on;
            const status = document.getElementById('notifStatus');
            if (on) {
                status.textContent = '✅ Включены';
                status.style.color = 'var(--green)';
                showNotification('🔔 Уведомления включены');
            } else {
                status.textContent = '❌ Выключены';
                status.style.color = 'var(--red)';
                showNotification('🔕 Уведомления выключены');
            }
            saveState();
        };

        window.applyTheme = function() {
            const theme = document.getElementById('settingsTheme').value;
            document.body.className = theme === 'dark' ? 'dark-mode' : '';
            if (theme === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.body.className = prefersDark ? 'dark-mode' : '';
            }
            showNotification('🎨 Тема применена', theme);
            saveState();
        };

        window.toggleLiquidGlass = function() {
            const status = document.getElementById('glassStatus');
            const isEnabled = status.textContent.includes('включено');
            if (isEnabled) {
                document.body.style.backdropFilter = 'none';
                document.body.style.webkitBackdropFilter = 'none';
                status.textContent = 'Статус: выключено';
                status.style.color = '#888';
                showNotification('🔮 Liquid Glass выключен');
            } else {
                document.body.style.backdropFilter = 'blur(10px) saturate(180%)';
                document.body.style.webkitBackdropFilter = 'blur(10px) saturate(180%)';
                document.body.style.backgroundColor = 'rgba(255,255,255,0.7)';
                status.textContent = 'Статус: включено ✨';
                status.style.color = 'var(--blue-light)';
                showNotification('🔮 Liquid Glass включен');
            }
        };

        // Функция открытия настроек
        window.openSettingsNew = function() {
            document.getElementById('burgerDropdown').style.display = 'none';
            document.querySelectorAll('.app-content .section').forEach(s => s.classList.remove('active'));
            document.getElementById('section-settings').classList.add('active');
            // Восстанавливаем состояние
            if (currentUser.lang) {
                document.getElementById('settingsLang').value = currentUser.lang;
            }
            if (currentUser.notifications !== undefined) {
                const status = document.getElementById('notifStatus');
                if (currentUser.notifications) {
                    status.textContent = '✅ Включены';
                    status.style.color = 'var(--green)';
                } else {
                    status.textContent = '❌ Выключены';
                    status.style.color = 'var(--red)';
                }
            }
        };
    }

    // ============================================================
    // 7. ИНИЦИАЛИЗАЦИЯ НОВОГО ГЛАВНОГО ЭКРАНА
    // ============================================================

    function setMainScreen() {
        // При входе показываем новости вместо выбора роли
        // Но выбор роли должен быть доступен через профиль
        // Поэтому мы модифицируем логику входа

        // Сохраняем оригинальную функцию входа
        const originalEnterApp = window.enterApp;
        if (originalEnterApp) {
            window.enterApp = function(role) {
                originalEnterApp(role);
                // После входа переключаем на новости
                setTimeout(() => {
                    openNews();
                }, 300);
            };
        }

        // При открытии приложения показываем новости
        const observer = new MutationObserver(() => {
            if (document.getElementById('app').style.display === 'block') {
                // Если уже залогинены и есть роль, показываем новости
                if (currentUser.role) {
                    setTimeout(openNews, 400);
                }
                observer.disconnect();
            }
        });
        observer.observe(document.getElementById('app'), { attributes: true, attributeFilter: ['style'] });

        // Также при загрузке страницы
        window.addEventListener('load', function() {
            if (currentUser.role) {
                setTimeout(openNews, 500);
            }
        });
    }

    // ============================================================
    // 8. ЗАПУСК ВСЕХ ФУНКЦИЙ
    // ============================================================

    setTimeout(() => {
        try {
            upgradeHeader();
            createProfileSection();
            createNewsFeed();
            addQuickTabs();
            createHotlineDrawer();
            createNewSettings();
            setMainScreen();

            // Добавляем стили для тёмной темы, liquid glass и круглых аватаров
            const style = document.createElement('style');
            style.textContent = `
                /* Тёмная тема */
                body.dark-mode {
                    --bg: #1a1a2e;
                    --bg-alt: #16213e;
                    --white: #2a2a4a;
                    --shadow: 0 4px 20px rgba(0,0,0,0.3);
                    color: #e0e0e0;
                }
                body.dark-mode .card,
                body.dark-mode .material-item,
                body.dark-mode .request-card,
                body.dark-mode .chat-item,
                body.dark-mode .supply-item,
                body.dark-mode .line-item,
                body.dark-mode .auth-container,
                body.dark-mode .request-form,
                body.dark-mode .dashboard div,
                body.dark-mode .stats div,
                body.dark-mode .app-header,
                body.dark-mode .bottom-nav,
                body.dark-mode .chat-window-header,
                body.dark-mode .chat-input-area,
                body.dark-mode .chat-msg.received,
                body.dark-mode #hotlineDrawer,
                body.dark-mode #burgerDropdown,
                body.dark-mode #settingsDropdown,
                body.dark-mode .role-card,
                body.dark-mode .zone,
                body.dark-mode #zoneInfo {
                    background: #2a2a4a !important;
                    border-color: #3a3a5a !important;
                    color: #e0e0e0 !important;
                }
                body.dark-mode .auth-form input,
                body.dark-mode .request-form input,
                body.dark-mode .request-form select,
                body.dark-mode .request-form textarea,
                body.dark-mode .chat-input-area input,
                body.dark-mode #profileName,
                body.dark-mode #profilePhone,
                body.dark-mode #profileEmail,
                body.dark-mode #profileRole,
                body.dark-mode #verifyKey,
                body.dark-mode #profileId,
                body.dark-mode #profileSite,
                body.dark-mode #settingsLang,
                body.dark-mode #settingsTheme {
                    background: #1a1a2e !important;
                    border-color: #3a3a5a !important;
                    color: #e0e0e0 !important;
                }
                body.dark-mode .section-title,
                body.dark-mode .card h3,
                body.dark-mode .material-item .mat-name,
                body.dark-mode .request-card .request-material,
                body.dark-mode .chat-item .chat-name,
                body.dark-mode .level,
                body.dark-mode .zone-label,
                body.dark-mode .step-label {
                    color: var(--blue-light) !important;
                }
                body.dark-mode .auth-tabs {
                    background: #1a1a2e;
                }
                body.dark-mode .auth-tabs button:not(.active) {
                    color: #888;
                }

                /* Liquid Glass */
                .liquid-glass body {
                    backdrop-filter: blur(10px) saturate(180%) !important;
                    -webkit-backdrop-filter: blur(10px) saturate(180%) !important;
                    background-color: rgba(255,255,255,0.7) !important;
                }

                /* Круглая аватарка уже задана в upgradeHeader */
                .avatar {
                    border-radius: 50% !important;
                    width: 44px !important;
                    height: 44px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 20px !important;
                }

                /* Бургер-меню поверх */
                #burgerDropdown {
                    position: absolute;
                    top: 60px;
                    left: 10px;
                    background: white;
                    border-radius: var(--radius);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    padding: 8px 0;
                    min-width: 200px;
                    z-index: 300;
                    overflow: hidden;
                }
                #burgerDropdown div {
                    padding: 10px 20px;
                    cursor: pointer;
                    transition: 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                #burgerDropdown div:hover {
                    background: var(--blue-glow);
                }

                /* Адаптив для бургера */
                @media (max-width: 480px) {
                    #burgerDropdown {
                        left: 0;
                        right: 0;
                        min-width: auto;
                        width: 90%;
                        margin: 0 auto;
                    }
                }
            `;
            document.head.appendChild(style);

            // Обновляем состояние сохранения
            if (currentUser.lang) {
                document.getElementById('settingsLang').value = currentUser.lang;
            }
            if (currentUser.notifications !== undefined) {
                const status = document.getElementById('notifStatus');
                if (status) {
                    status.textContent = currentUser.notifications ? '✅ Включены' : '❌ Выключены';
                    status.style.color = currentUser.notifications ? 'var(--green)' : 'var(--red)';
                }
            }

            console.log('✅ Обновление 3.0 успешно загружено!');
            console.log('📌 Новые функции:');
            console.log('   • Новый профиль с верификацией и выбором участка');
            console.log('   • Новостная лента в стиле Яндекс.Дзен');
            console.log('   • Горячая линия (шторка)');
            console.log('   • Настройки: язык, тема, liquid glass, уведомления');
            console.log('   • Новая верхняя плашка с бургер-меню');
            console.log('   • Быстрые разделы (чаты, заявки, расписание)');

            // Показываем приветствие
            setTimeout(() => {
                showNotification('🚀 ЦМТО PRO 3.0', 'Добро пожаловать в обновлённое приложение!');
            }, 1500);

        } catch (e) {
            console.warn('⚠️ Ошибка при активации обновления 3.0:', e);
        }
    }, 600);

})();