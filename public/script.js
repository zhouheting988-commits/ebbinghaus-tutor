// 全局变量来存储表格数据
let allTables = {};
let isEditMode = false;

// 页面加载时立即获取数据并渲染
document.addEventListener('DOMContentLoaded', loadTables);

// --- 事件监听 ---
document.getElementById('editBtn').addEventListener('click', toggleEditMode);
document.getElementById('saveBtn').addEventListener('click', saveTables);
document.getElementById('cancelBtn').addEventListener('click', () => {
    toggleEditMode(); // 取消编辑
    loadTables(); // 重新加载原始数据
});


// ---核心函数---

// 从后台获取所有表格数据
async function loadTables() {
    try {
        const response = await fetch('/extensions/Ebbinghaus Tutor/gettables');
        if (!response.ok) throw new Error('Failed to fetch tables');
        allTables = await response.json();
        renderAllTables();
    } catch (error) {
        console.error('Error loading tables:', error);
    }
}

// 将更新后的表格数据保存到后台
async function saveTables() {
    try {
        // 从HTML表格中读取数据，更新allTables对象
        parseTableToData('mastery-table-container', 'Vocabulary_Mastery');
        parseTableToData('lists-table-container', 'Word_Lists');
        parseTableToData('schedule-table-container', 'Ebbinghaus_Schedule');
        parseTableToData('control-table-container', 'Study_Control');

        const response = await fetch('/extensions/Ebbinghaus Tutor/savetables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allTables)
        });

        if (!response.ok) throw new Error('Failed to save tables');
        
        alert('Tables saved successfully!');
        toggleEditMode(); // 退出编辑模式
    } catch (error) {
        console.error('Error saving tables:', error);
        alert('Error saving tables. Check console for details.');
    }
}

// 渲染所有表格
function renderAllTables() {
    renderTable(allTables.Vocabulary_Mastery, 'mastery-table-container');
    renderTable(allTables.Word_Lists, 'lists-table-container');
    renderTable(allTables.Ebbinghaus_Schedule, 'schedule-table-container');
    renderTable(allTables.Study_Control, 'control-table-container');
}

// 通用的表格渲染函数
function renderTable(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (!data || data.length === 0) return;

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headers = Object.keys(data[0]);

    // 创建表头
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // 创建表体
    data.forEach(rowData => {
        const row = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = rowData[header];
            td.setAttribute('data-key', header);
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
}

// 切换编辑模式
function toggleEditMode() {
    isEditMode = !isEditMode;
    const editableCells = document.querySelectorAll('td');
    editableCells.forEach(cell => {
        cell.contentEditable = isEditMode;
    });

    document.getElementById('editBtn').classList.toggle('hidden');
    document.getElementById('saveBtn').classList.toggle('hidden');
    document.getElementById('cancelBtn').classList.toggle('hidden');
}

// 从HTML表格解析数据回JS对象
function parseTableToData(containerId, tableName) {
    const table = document.getElementById(containerId).querySelector('table');
    if (!table) return;

    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const newData = [];

    rows.forEach(row => {
        const rowData = {};
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            rowData[headers[index]] = cell.textContent;
        });
        newData.push(rowData);
    });

    allTables[tableName] = newData;
}


// --- 辅助函数 ---

// Tab切换逻辑
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}
