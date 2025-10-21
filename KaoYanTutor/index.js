// 这是插件的后端部分，运行在服务器上
// 它的主要工作是提供一些接口，让前端或者AI能够安全地读写记忆表格

// 引入SillyTavern的插件API
const { extension, onMemoryTableGet, onMemoryTableSet, onMemoryTableDelete } = require('../../../extensions.js');

// 这是一个通用的函数，用来读取记忆表格中指定单元格的内容
// AI会通过调用这个函数来获取数据
const readCell = async (tableName, rowId, colId) => {
    try {
        // onMemoryTableGet 是SillyTavern提供的读取表格的函数
        const table = await onMemoryTableGet(tableName);
        if (table && table.rows && table.rows[rowId] && table.rows[rowId][colId] !== undefined) {
            // 如果找到了对应的单元格，就返回它的内容
            return table.rows[rowId][colId];
        }
        // 如果没找到，返回一个空字符串，防止出错
        return "";
    } catch (error) {
        console.error(`[KaoYanTutor] Error reading cell: ${tableName}[${rowId}][${colId}]`, error);
        return null; // 出错了返回null
    }
};

// 这是一个通用的函数，用来向记忆表格中指定的单元格写入内容
// AI会通过调用这个函数来更新进度
const writeCell = async (tableName, rowId, colId, content) => {
    try {
        // onMemoryTableSet 是SillyTavern提供的写入表格的函数
        await onMemoryTableSet(tableName, rowId, colId, content);
        return { success: true, message: `Wrote to ${tableName}[${rowId}][${colId}] successfully.` };
    } catch (error) {
        console.error(`[KaoYanTutor] Error writing to cell: ${tableName}[${rowId}][${colId}]`, error);
        return { success: false, message: `Failed to write to cell.` };
    }
};

// 定义插件的名称，必须和文件夹名一致
const name = "KaoYanTutor";
// 定义插件的设置，这里我们不需要设置，所以是空的
const settings = {};

// 插件的主函数，当SillyTavern启动时会运行这里
const onStart = async () => {
    console.log("[KaoYanTutor] Plugin started successfully.");
    // 这里可以添加一些初始化代码，但我们暂时不需要
};

// 这个函数是用来处理前端（script.js）发来的请求的
// 比如前端想获取当前是第几天，就会发一个请求过来
const onCall = async (req, res) => {
    // 从请求中获取要执行的操作类型
    const { action, params } = req.body;

    switch (action) {
        // 如果请求是'getStudyState' (获取学习状态)
        case 'getStudyState':
            try {
                // 读取'Study_Control'表格中'0'行'Value'列的内容，也就是Current_Day
                const currentDay = await readCell('Study_Control', '0', 'Value');
                // 将结果发送回前端
                res.send({ currentDay: currentDay || '1' });
            } catch (error) {
                res.status(500).send({ error: 'Failed to get study state.' });
            }
            break;
        
        // 你可以根据需要在这里添加更多的case来处理其他请求
        // 比如，未来可以做一个'endDay'的自动化操作
        
        default:
            res.status(400).send({ error: `Unknown action: ${action}` });
    }
};

// 将我们定义的功能导出，让SillyTavern能够使用它们
module.exports = {
    name,
    settings,
    onStart,
    onCall,
    // 我们将读写函数也暴露出来，这样AI就可以通过特殊的指令来调用它们
    api: {
        readCell,
        writeCell,
    },
};
