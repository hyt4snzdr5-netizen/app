/* ============================================================
   ОБНОВЛЕНИЕ: СКЛАД (только для начальника склада)
   - Полноценная база материалов: приход, расход, резерв, контракты, накладная
   - Для директора: вкладка "Складские запасы" (только просмотр)
   - Все данные сохраняются в localStorage
   ============================================================ */

(function() {
    'use strict';

    console.log('🔧 Загрузка складского обновления...');

    function waitForApp() {
        if (typeof DB === 'undefined' || typeof currentUser === 'undefined' || typeof ROLES === 'undefined') {
            setTimeout(waitForApp, 200);
            return;
        }
        if (window.__CMTO_WAREHOUSE_LOADED) {
            console.warn('⚠️ Обновление уже загружено');
            return;
        }
        window.__CMTO_WAREHOUSE_LOADED = true;

        console.log('✅ Приложение готово, запускаем складское обновление...');

        // ============================================================
        // 1. ИНИЦИАЛИЗАЦИЯ ДАННЫХ
        // ============================================================
        if (!window.materialsData) {
            window.materialsData = JSON.parse(localStorage.getItem('cmto_materials')) || [];
        }
        if (!window.contractsData) {
            window.contractsData = JSON.parse(localStorage.getItem('cmto_contracts')) || [
                { id: 1, name: 'Поставка стройматериалов', amount: 2500000, date: '2026-08-15' },
                { id: 2, name: 'Обслуживание техники', amount: 1200000, date: '2026-09-01' },
                { id: 3, name: 'Ремонт дорог', amount: 4800000, date: '2026-07-30' },
            ];
        }

        function saveMaterials() {
            localStorage.setItem('cmto_materials', JSON.stringify(window.materialsData));
        }

        function saveContracts() {
            localStorage.setItem('cmto_contracts', JSON.stringify(window.contractsData));
        }

        window.saveMaterials = saveMaterials;
        window.saveContracts = saveContracts;

        // ============================================================
        // 2. ПЕРЕОПРЕДЕЛЕНИЕ НАВИГАЦИИ
        // ============================================================
        // Начальник склада (warehouse)
        if (typeof ROLE_NAV !== 'undefined' && ROLE_NAV.warehouse) {
            ROLE_NAV.warehouse = [
                { id: 'stock_base', icon: '📋', label: 'База материалов' },
                { id: 'stock_income', icon: '📥', label: 'Приход' },
                { id: 'stock_expense', icon: '📤', label: 'Расход' },
                { id: 'stock_reserve', icon: '🔒', label: 'Резерв' },
                { id: 'stock_contracts', icon: '📄', label: 'Контракты' },
                { id: 'stock_invoice', icon: '🧾', label: 'Накладная' },
            ];
            console.log('✅ Навигация для начальника склада обновлена');
        }

        // Директор — добавляем вкладку "Складские запасы"
        if (typeof ROLE_NAV !== 'undefined' && ROLE_NAV.director) {
            const hasStock = ROLE_NAV.director.some(item => item.id === 'director_stock');
            if (!hasStock) {
                ROLE_NAV.director.push({ id: 'director_stock', icon: '📦', label: 'Складские запасы' });
                console.log('✅ Вкладка "Складские запасы" добавлена для директора');
            }
        }

        // ============================================================
        // 3. ПЕРЕОПРЕДЕЛЕНИЕ loadTab
        // ============================================================
        const originalLoadTab = window.loadTab;
        if (originalLoadTab) {
            window.loadTab = function(tabId, role) {
                // Проверяем, относится ли вкладка к складу или директорскому просмотру
                if (tabId.startsWith('stock_') || tabId === 'director_stock') {
                    const container = getContentContainer(role);
                    if (container) {
                        renderStockTab(tabId, container, role);
                        return;
                    }
                }
                // Иначе вызываем оригинальную функцию
                originalLoadTab(tabId, role);
            };
            console.log('✅ loadTab переопределён для складских вкладок');
        }

        function getContentContainer(role) {
            const map = {
                warehouse: document.getElementById('warehouseContent'),
                director: document.getElementById('directorContent'),
            };
            return map[role];
        }

        // ============================================================
        // 4. РЕНДЕРИНГ ВКЛАДОК
        // ============================================================
        function renderStockTab(tabId, container, role) {
            const isReadOnly = (role === 'director');

            container.innerHTML = '';

            const title = document.createElement('h3');
            title.style.cssText = 'color:#004b87;margin-bottom:16px;';
            title.textContent = getTabLabel(tabId);
            container.appendChild(title);

            if (tabId === 'stock_base') {
                renderBaseTab(container, isReadOnly);
            } else if (tabId === 'stock_income') {
                renderIncomeTab(container, isReadOnly);
            } else if (tabId === 'stock_expense') {
                renderExpenseTab(container, isReadOnly);
            } else if (tabId === 'stock_reserve') {
                renderReserveTab(container, isReadOnly);
            } else if (tabId === 'stock_contracts') {
                renderContractsTab(container, isReadOnly);
            } else if (tabId === 'stock_invoice') {
                renderInvoiceTab(container, isReadOnly);
            } else if (tabId === 'director_stock') {
                renderDirectorStock(container);
            }
        }

        function getTabLabel(tabId) {
            const labels = {
                'stock_base': 'База материалов',
                'stock_income': 'Приход',
                'stock_expense': 'Расход',
                'stock_reserve': 'Резерв',
                'stock_contracts': 'Контракты',
                'stock_invoice': 'Накладная',
                'director_stock': 'Складские запасы (просмотр)',
            };
            return labels[tabId] || 'Склад';
        }

        // ============================================================
        // 5. ОТДЕЛЬНЫЕ ВКЛАДКИ
        // ============================================================

        // База материалов
        function renderBaseTab(container, readOnly) {
            let html = `
                <div style="margin-bottom:16px;">
                    ${!readOnly ? '<button onclick="addMaterialStock()" style="padding:8px 16px;background:#004b87;color:white;border:none;border-radius:8px;cursor:pointer;">+ Добавить материал</button>' : ''}
                </div>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <thead><tr style="background:#f8fafc;border-bottom:2px solid #e0e4ea;">
                        <th style="padding:8px 12px;text-align:left;">Наименование</th>
                        <th style="padding:8px 12px;text-align:left;">Кол-во</th>
                        <th style="padding:8px 12px;text-align:left;">Объём</th>
                        <th style="padding:8px 12px;text-align:left;">Резерв</th>
                        <th style="padding:8px 12px;text-align:left;">Контракт</th>
                        <th style="padding:8px 12px;text-align:left;">Выделение</th>
                        ${!readOnly ? '<th style="padding:8px 12px;text-align:left;">Действия</th>' : ''}
                    </tr></thead>
                    <tbody>
            `;
            const data = window.materialsData;
            if (data.length === 0) {
                html += `<tr><td colspan="${readOnly ? 6 : 7}" style="padding:20px;text-align:center;color:#888;">Нет материалов</td></tr>`;
            } else {
                data.forEach((item, i) => {
                    html += `
                        <tr style="border-bottom:1px solid #f0f2f5;">
                            <td style="padding:8px 12px;">${item.name}</td>
                            <td style="padding:8px 12px;">${item.quantity}</td>
                            <td style="padding:8px 12px;">${item.volume || '-'}</td>
                            <td style="padding:8px 12px;">${item.reserve || 0}</td>
                            <td style="padding:8px 12px;">${item.contract || '-'}</td>
                            <td style="padding:8px 12px;">${item.allocation || 0}</td>
                            ${!readOnly ? `
                            <td style="padding:8px 12px;">
                                <button onclick="editMatStock(${i})" style="padding:4px 10px;background:#f0f4fa;border:1px solid #d0d7e2;border-radius:6px;font-size:12px;cursor:pointer;margin-right:4px;">Изменить</button>
                                <button onclick="deleteMatStock(${i})" style="padding:4px 10px;background:#fee;border:1px solid #f5c6cb;border-radius:6px;font-size:12px;color:#c62828;cursor:pointer;">Удалить</button>
                            </td>` : ''}
                        </tr>
                    `;
                });
            }
            html += `</tbody></table>`;
            container.innerHTML = html;

            if (!readOnly) {
                window.addMaterialStock = function() {
                    const name = prompt('Наименование:');
                    if (!name) return;
                    const quantity = prompt('Количество:');
                    if (!quantity) return;
                    const volume = prompt('Объём (необязательно):') || '';
                    const contract = prompt('Контракт (необязательно):') || '';
                    window.materialsData.push({ name, quantity: parseFloat(quantity), volume, contract, reserve: 0, allocation: 0 });
                    saveMaterials();
                    reloadCurrentTab();
                    showToast('Материал добавлен');
                };

                window.editMatStock = function(index) {
                    const item = window.materialsData[index];
                    const name = prompt('Наименование:', item.name);
                    if (name === null) return;
                    const quantity = prompt('Количество:', item.quantity);
                    if (quantity === null) return;
                    const volume = prompt('Объём:', item.volume || '');
                    if (volume === null) return;
                    const contract = prompt('Контракт:', item.contract || '');
                    if (contract === null) return;
                    window.materialsData[index] = { ...item, name: name.trim(), quantity: parseFloat(quantity), volume: volume.trim(), contract: contract.trim() };
                    saveMaterials();
                    reloadCurrentTab();
                    showToast('Обновлено');
                };

                window.deleteMatStock = function(index) {
                    if (confirm('Удалить материал?')) {
                        window.materialsData.splice(index, 1);
                        saveMaterials();
                        reloadCurrentTab();
                        showToast('Удалено');
                    }
                };
            }
        }

        // Приход
        function renderIncomeTab(container, readOnly) {
            if (readOnly) {
                container.innerHTML = '<p style="color:#888;">Только просмотр. Для внесения изменений переключитесь на роль начальника склада.</p>';
                return;
            }
            const contractOptions = window.contractsData.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
            container.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <input type="text" id="incName" placeholder="Наименование" style="padding:8px 12px;border:1px solid #d0d7e2;border-radius:8px;">
                    <input type="number" id="incQty" placeholder="Количество" style="padding:8px 12px;border:1px solid #d0d7e2;border-radius:8px;">
                    <input type="text" id="incVol" placeholder="Объём (необязательно)" style="padding:8px 12px;border:1px solid #d0d7e2;border-radius:8px;">
                    <select id="incContract" style="padding:8px 12px;border:1px solid #d0d7e2;border-radius:8px;">
                        <option value="">Без контракта</option>
                        ${contractOptions}
                    </select>
                </div>
                <button onclick="processIncomeStock()" style="margin-top:16px;padding:8px 16px;background:#2e7d32;color:white;border:none;border-radius:8px;cursor:pointer;">Принять</button>
            `;
            window.processIncomeStock = function() {
                const name = document.getElementById('incName').value.trim();
                const qty = parseFloat(document.getElementById('incQty').value);
                if (!name || !qty) return showToast('Заполните наименование и количество');
                const volume = document.getElementById('incVol').value.trim();
                const contract = document.getElementById('incContract').value;
                const existing = window.materialsData.find(m => m.name.toLowerCase() === name.toLowerCase());
                if (existing) {
                    existing.quantity += qty;
                    if (volume) existing.volume = volume;
                    if (contract) existing.contract = contract;
                } else {
                    window.materialsData.push({ name, quantity: qty, volume, contract, reserve: 0, allocation: 0 });
                }
                saveMaterials();
                reloadCurrentTab();
                showToast('Приход оформлен');
            };
        }

        // Расход
        function renderExpenseTab(container, readOnly) {
            if (readOnly) {
                container.innerHTML = '<p style="color:#888;">Только просмотр.</p>';
                return;
            }
            const options = window.materialsData.map((m, i) => `<option value="${i}">${m.name} (доступно: ${m.quantity - m.reserve})</option>`).join('');
            container.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <select id="expMat" style="padding:8px 12px;border:1px solid #d0d7e2;border-radius:8px;">${options || '<option>Нет материалов</option>'}</select>
                    <input type="number" id="expQty" placeholder="Количество" style="padding:8px 12px;border:1px solid #d0d7e2;border-radius:8px;">
                </div>
                <button onclick="processExpenseStock()" style="margin-top:16px;padding:8px 16px;background:#c62828;color:white;border:none;border-radius:8px;cursor:pointer;">Списать</button>
            `;
            window.processExpenseStock = function() {
                const idx = parseInt(document.getElementById('expMat').value);
                const qty = parseFloat(document.getElementById('expQty').value);
                if (isNaN(idx) || idx < 0 || !window.materialsData[idx]) return showToast('Выберите материал');
                if (!qty || qty <= 0) return showToast('Введите количество');
                const item = window.materialsData[idx];
                if (qty > item.quantity) return showToast('Недостаточно материала');
                item.quantity -= qty;
                saveMaterials();
                reloadCurrentTab();
                showToast('Списано');
            };
        }

        // Резерв
        function renderReserveTab(container, readOnly) {
            if (readOnly) {
                container.innerHTML = '<p style="color:#888;">Только просмотр резервов.</p><div style="margin-top:16px;">' +
                    window.materialsData.filter(m => m.reserve > 0).map(m => `<div style="padding:6px 0;border-bottom:1px solid #f0f2f5;">${m.name}: зарезервировано ${m.reserve} из ${m.quantity}</div>`).join('') ||
                    '<p style="color:#888;">Нет резервов</p>' +
                    '</div>';
                return;
            }
            const options = window.materialsData.map((m, i) => `<option value="${i}">${m.name} (доступно: ${m.quantity - m.reserve})</option>`).join('');
            container.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <select id="resMat" style="padding:8px 12px;border:1px solid #d0d7e2;border-radius:8px;">${options || '<option>Нет материалов</option>'}</select>
                    <input type="number" id="resQty" placeholder="Количество" style="padding:8px 12px;border:1px solid #d0d7e2;border-radius:8px;">
                </div>
                <button onclick="processReserveStock()" style="margin-top:16px;padding:8px 16px;background:#f5a623;color:white;border:none;border-radius:8px;cursor:pointer;">Зарезервировать</button>
                <div style="margin-top:16px;">
                    <h4 style="color:#004b87;">Текущие резервы</h4>
                    ${window.materialsData.filter(m => m.reserve > 0).map(m => `<div style="padding:6px 0;border-bottom:1px solid #f0f2f5;">${m.name}: ${m.reserve} из ${m.quantity}</div>`).join('') || '<p style="color:#888;">Нет резервов</p>'}
                </div>
            `;
            window.processReserveStock = function() {
                const idx = parseInt(document.getElementById('resMat').value);
                const qty = parseFloat(document.getElementById('resQty').value);
                if (isNaN(idx) || idx < 0 || !window.materialsData[idx]) return showToast('Выберите материал');
                if (!qty || qty <= 0) return showToast('Введите количество');
                const item = window.materialsData[idx];
                const available = item.quantity - item.reserve;
                if (qty > available) return showToast(`Доступно: ${available}`);
                item.reserve += qty;
                saveMaterials();
                reloadCurrentTab();
                showToast('Резерв создан');
            };
        }

        // Контракты
        function renderContractsTab(container, readOnly) {
            let html = `
                <div style="margin-bottom:16px;">
                    ${!readOnly ? '<button onclick="addContractStock()" style="padding:8px 16px;background:#004b87;color:white;border:none;border-radius:8px;cursor:pointer;">+ Добавить контракт</button>' : ''}
                </div>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <thead><tr style="background:#f8fafc;border-bottom:2px solid #e0e4ea;">
                        <th style="padding:8px 12px;text-align:left;">Название</th>
                        <th style="padding:8px 12px;text-align:left;">Сумма</th>
                        <th style="padding:8px 12px;text-align:left;">Срок</th>
                        ${!readOnly ? '<th style="padding:8px 12px;text-align:left;">Действия</th>' : ''}
                    </tr></thead>
                    <tbody>
            `;
            const data = window.contractsData;
            if (data.length === 0) {
                html += `<tr><td colspan="${readOnly ? 3 : 4}" style="padding:20px;text-align:center;color:#888;">Нет контрактов</td></tr>`;
            } else {
                data.forEach((c, i) => {
                    html += `
                        <tr style="border-bottom:1px solid #f0f2f5;">
                            <td style="padding:8px 12px;">${c.name}</td>
                            <td style="padding:8px 12px;">${c.amount.toLocaleString()} ₽</td>
                            <td style="padding:8px 12px;">${c.date}</td>
                            ${!readOnly ? `
                            <td style="padding:8px 12px;">
                                <button onclick="editContractStock(${i})" style="padding:4px 10px;background:#f0f4fa;border:1px solid #d0d7e2;border-radius:6px;font-size:12px;cursor:pointer;margin-right:4px;">Изменить</button>
                                <button onclick="deleteContractStock(${i})" style="padding:4px 10px;background:#fee;border:1px solid #f5c6cb;border-radius:6px;font-size:12px;color:#c62828;cursor:pointer;">Удалить</button>
                            </td>` : ''}
                        </tr>
                    `;
                });
            }
            html += `</tbody></table>`;
            container.innerHTML = html;

            if (!readOnly) {
                window.addContractStock = function() {
                    const name = prompt('Название:');
                    if (!name) return;
                    const amount = prompt('Сумма:');
                    if (!amount) return;
                    const date = prompt('Срок (ГГГГ-ММ-ДД):');
                    if (!date) return;
                    window.contractsData.push({ name, amount: parseFloat(amount), date });
                    saveContracts();
                    reloadCurrentTab();
                    showToast('Контракт добавлен');
                };
                window.editContractStock = function(index) {
                    const c = window.contractsData[index];
                    const name = prompt('Название:', c.name);
                    if (name === null) return;
                    const amount = prompt('Сумма:', c.amount);
                    if (amount === null) return;
                    const date = prompt('Срок:', c.date);
                    if (date === null) return;
                    window.contractsData[index] = { name: name.trim(), amount: parseFloat(amount), date: date.trim() };
                    saveContracts();
                    reloadCurrentTab();
                    showToast('Обновлено');
                };
                window.deleteContractStock = function(index) {
                    if (confirm('Удалить контракт?')) {
                        window.contractsData.splice(index, 1);
                        saveContracts();
                        reloadCurrentTab();
                        showToast('Удалено');
                    }
                };
            }
        }

        // Накладная
        function renderInvoiceTab(container, readOnly) {
            if (readOnly) {
                container.innerHTML = '<p style="color:#888;">Формирование накладной доступно только для редактирования.</p>';
                return;
            }
            if (!window.invoiceItems) window.invoiceItems = [];
            const options = window.materialsData.map((m, i) => `<option value="${i}">${m.name} (доступно: ${m.quantity - m.reserve})</option>`).join('');

            function updateInvoiceList() {
                const list = document.getElementById('invoiceList');
                if (!list) return;
                if (window.invoiceItems.length === 0) {
                    list.innerHTML = '<p style="color:#888;">Нет позиций</p>';
                    return;
                }
                list.innerHTML = window.invoiceItems.map((item, idx) => `
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f2f5;">
                        <span>${item.name} x ${item.quantity}</span>
                        <button onclick="removeInvoiceItemStock(${idx})" style="padding:2px 8px;background:#fee;border:1px solid #f5c6cb;border-radius:4px;font-size:12px;color:#c62828;cursor:pointer;">Удалить</button>
                    </div>
                `).join('');
            }

            container.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <select id="invMat" style="padding:8px 12px;border:1px solid #d0d7e2;border-radius:8px;">${options || '<option>Нет материалов</option>'}</select>
                    <input type="number" id="invQty" placeholder="Количество" style="padding:8px 12px;border:1px solid #d0d7e2;border-radius:8px;">
                </div>
                <button onclick="addToInvoiceStock()" style="margin-top:12px;padding:8px 16px;background:#004b87;color:white;border:none;border-radius:8px;cursor:pointer;">Добавить в накладную</button>
                <div id="invoiceItems" style="margin-top:16px;">
                    <h4 style="color:#004b87;">Список позиций</h4>
                    <div id="invoiceList"></div>
                </div>
                <button onclick="generateInvoiceStock()" style="margin-top:16px;padding:8px 16px;background:#2e7d32;color:white;border:none;border-radius:8px;cursor:pointer;">Сформировать накладную</button>
            `;

            window.addToInvoiceStock = function() {
                const idx = parseInt(document.getElementById('invMat').value);
                const qty = parseFloat(document.getElementById('invQty').value);
                if (isNaN(idx) || idx < 0 || !window.materialsData[idx]) return showToast('Выберите материал');
                if (!qty || qty <= 0) return showToast('Введите количество');
                const item = window.materialsData[idx];
                const available = item.quantity - item.reserve;
                if (qty > available) return showToast(`Доступно: ${available}`);
                window.invoiceItems.push({ name: item.name, quantity: qty, index: idx });
                document.getElementById('invQty').value = '';
                updateInvoiceList();
                showToast('Добавлено');
            };

            window.removeInvoiceItemStock = function(idx) {
                window.invoiceItems.splice(idx, 1);
                updateInvoiceList();
                showToast('Удалено');
            };

            window.generateInvoiceStock = function() {
                if (window.invoiceItems.length === 0) return showToast('Нет позиций');
                const printWindow = window.open('', '_blank', 'width=800,height=600');
                printWindow.document.write(`
                    <html><head><title>Накладная</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        h1 { color: #004b87; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                        th { background: #f0f4fa; }
                        .footer { margin-top: 40px; text-align: center; color: #888; font-size: 12px; }
                    </style>
                    </head>
                    <body>
                        <h1>Накладная</h1>
                        <p>Дата: ${new Date().toLocaleDateString()}</p>
                        <table>
                            <thead><tr><th>Наименование</th><th>Количество</th></tr></thead>
                            <tbody>${window.invoiceItems.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td></tr>`).join('')}</tbody>
                        </table>
                        <div class="footer">ЦМТО Кунцево PRO</div>
                    </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
                window.invoiceItems = [];
                updateInvoiceList();
                showToast('Накладная сформирована');
            };
            updateInvoiceList();
        }

        // Для директора: просмотр склада
        function renderDirectorStock(container) {
            renderBaseTab(container, true);
            const summary = document.createElement('div');
            summary.style.cssText = 'margin-top:20px;padding:16px;background:#f8fafc;border-radius:12px;';
            const totalItems = window.materialsData.length;
            const totalQuantity = window.materialsData.reduce((sum, m) => sum + m.quantity, 0);
            const totalReserve = window.materialsData.reduce((sum, m) => sum + (m.reserve || 0), 0);
            summary.innerHTML = `
                <h4 style="color:#004b87;">Сводка</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:8px;">
                    <div><strong>Всего материалов:</strong> ${totalItems}</div>
                    <div><strong>Общее количество:</strong> ${totalQuantity}</div>
                    <div><strong>Зарезервировано:</strong> ${totalReserve}</div>
                </div>
            `;
            container.appendChild(summary);
        }

        // ============================================================
        // 6. ПЕРЕЗАГРУЗКА ТЕКУЩЕЙ ВКЛАДКИ
        // ============================================================
        function reloadCurrentTab() {
            const activeNav = document.querySelector('#bottomNav .nav-item.active');
            if (activeNav) {
                const tabId = activeNav.dataset.tab;
                const role = currentUser.role;
                if (tabId && role && typeof window.loadTab === 'function') {
                    window.loadTab(tabId, role);
                }
            }
        }

        // ============================================================
        // 7. ЗАПУСК
        // ============================================================
        try {
            const role = currentUser.role;
            // Перезагружаем только если роль warehouse или director и активна складская вкладка
            if (role === 'warehouse' || role === 'director') {
                const activeNav = document.querySelector('#bottomNav .nav-item.active');
                if (activeNav) {
                    const tabId = activeNav.dataset.tab;
                    if (tabId && (tabId.startsWith('stock_') || tabId === 'director_stock') && typeof window.loadTab === 'function') {
                        setTimeout(function() {
                            window.loadTab(tabId, role);
                        }, 100);
                    }
                }
            }
            console.log('✅ Складское обновление успешно загружено');
        } catch (e) {
            console.error('❌ Ошибка при загрузке обновления:', e);
        }

        if (typeof showToast === 'function') {
            setTimeout(function() {
                showToast('Складской модуль активирован');
            }, 600);
        }
    }

    waitForApp();

})();