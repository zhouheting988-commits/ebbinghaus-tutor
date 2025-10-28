// scripts/extensions/third-party/EbbinghausTrainer/src/data.js
//
// 负责：
//  - 保存所有持久化数据（localStorage）
//  - 提供对四张表的增删改查
//  - 暴露 data() 给别的模块用
//
// 说明：
//  我们在这里把 Day1 ~ Day25 的复习计划一次性写死到 defaultData 里
//  并把 STORAGE_KEY 升级成 v3，这样会强制生成一份全新的本地存档，保证表里不只显示到 Day5
//

// ---------------------------
// 存档 key（改成 v3，强制刷新）
// ---------------------------
const STORAGE_KEY = 'EbbinghausTrainerData_v3';

// ---------------------------
// 默认数据骨架
// ---------------------------
//
// Vocabulary_Mastery:
//   每一天（Day_1, Day_2, ...）都会有这几个等级桶：
//     Level_0_New / Level_1 / Level_2 / Level_3 / Level_4 / Level_5_Mastered_Today
//
// Word_Lists:
//   List1 / List2 / ...，每天结束时把 “今天完全掌握(到 Level_5_Today)” 的词打包进去
//
// Ebbinghaus_Schedule:
//   固定计划表（Round 1 用的）
//   NewList: 今天新背哪一组
//   Review:  今天要复习哪些旧List
//
// Study_Control:
//   Current_Day:   现在进行到第几天
//   Current_Round: 现在是第几轮(1=单词本体, 2=短语, 3=整句+知识点)
//
// ---------------------------

const defaultData = {
    Vocabulary_Mastery: {
        // 这里先留空。真正用时会按 Current_Day 动态 ensure 今日桶
        // 例如 "Day_1": { Level_0_New:[], Level_1:[], ... }
    },

    Word_Lists: {
        // 结束某天时会把 L5_Today 打包成 ListN 存在这里
        // e.g. "List1": ["create","help",...]
    },

    // ✅ 这是你给的 Day1~Day25 计划表，完整写入
    Ebbinghaus_Schedule: {
        "1":  { NewList: "List1",  Review: [] },
        "2":  { NewList: "List2",  Review: ["List1"] },
        "3":  { NewList: "List3",  Review: ["List1", "List2"] },
        "4":  { NewList: "List4",  Review: ["List2", "List3"] },
        "5":  { NewList: "List5",  Review: ["List1", "List3", "List4"] },
        "6":  { NewList: "List6",  Review: ["List2", "List4", "List5"] },
        "7":  { NewList: "List7",  Review: ["List3", "List5", "List6"] },
        "8":  { NewList: "List8",  Review: ["List1", "List4", "List6", "List7"] },
        "9":  { NewList: "List9",  Review: ["List2", "List5", "List7", "List8"] },
        "10": { NewList: "List10", Review: ["List3", "List6", "List8", "List9"] },

        // 从第11天开始，不是“继续出List11,12…”，
        // 而是回收利用旧List，继续排复习
        "11": { NewList: "List4",  Review: ["List7", "List9", "List10"] },
        "12": { NewList: "List5",  Review: ["List8", "List10"] },
        "13": { NewList: "List6",  Review: ["List9"] },
        "14": { NewList: "List7",  Review: ["List10"] },
        "15": { NewList: "List8",  Review: [] },
        "16": { NewList: "List1",  Review: ["List9"] },
        "17": { NewList: "List2",  Review: ["List10"] },
        "18": { NewList: "List3",  Review: [] },
        "19": { NewList: "List4",  Review: [] },
        "20": { NewList: "List5",  Review: [] },
        "21": { NewList: "List6",  Review: [] },
        "22": { NewList: "List7",  Review: [] },
        "23": { NewList: "List8",  Review: [] },
        "24": { NewList: "List9",  Review: [] },
        "25": { NewList: "List10", Review: [] },
    },

    Study_Control: {
        Current_Day:   1,
        Current_Round: 1, // 1 = 第一轮(单词本体), 2 = 第二轮(短语), 3 = 第三轮(整句+知识点)
    },
};

// ---------------------------
// 内存镜像
// ---------------------------
let EbbData = null;

// ---------------------------
// deepClone（兼容旧浏览器）
// ---------------------------
function deepClone(obj) {
    if (window.structuredClone) return window.structuredClone(obj);
    return JSON.parse(JSON.stringify(obj));
}

// ---------------------------
// 载入 / 保存 本地存档
// ---------------------------
function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            console.log('[EbbinghausTrainer] No existing data, init defaultData (v3).');
            EbbData = deepClone(defaultData);
            saveData();
        } else {
            EbbData = JSON.parse(raw);

            // 安全兜底：如果老存档里缺了我们新加的字段（比如 Current_Round），就补上
            if (!EbbData.Study_Control) {
                EbbData.Study_Control = deepClone(defaultData.Study_Control);
            } else {
                if (EbbData.Study_Control.Current_Day == null) {
                    EbbData.Study_Control.Current_Day = 1;
                }
                if (EbbData.Study_Control.Current_Round == null) {
                    EbbData.Study_Control.Current_Round = 1;
                }
            }

            if (!EbbData.Ebbinghaus_Schedule) {
                EbbData.Ebbinghaus_Schedule = deepClone(defaultData.Ebbinghaus_Schedule);
            }

            console.log('[EbbinghausTrainer] Data loaded from localStorage:', EbbData);
        }
    } catch (err) {
        console.error('[EbbinghausTrainer] loadData error, fallback to default:', err);
        EbbData = deepClone(defaultData);
        saveData();
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(EbbData));
    } catch (err) {
        console.error('[EbbinghausTrainer] saveData error:', err);
    }
}

// ---------------------------
// 保证“今天的桶”存在
// 例：Current_Day=3 → "Day_3"
// 如果没有就自动创建那6个数组
// ---------------------------
function ensureTodayBucket() {
    const dayNum = EbbData.Study_Control.Current_Day;
    const dayKey = 'Day_' + dayNum;

    if (!EbbData.Vocabulary_Mastery[dayKey]) {
        EbbData.Vocabulary_Mastery[dayKey] = {
            Level_0_New: [],
            Level_1: [],
            Level_2: [],
            Level_3: [],
            Level_4: [],
            Level_5_Mastered_Today: [],
        };
    }
    return dayKey;
}

// ---------------------------
// 操作函数：往今天的 Level_0_New 里塞一批新词
// 你以后可以用你的快速回复让“教官”调用这个逻辑
// ---------------------------
function addNewWordsToToday(wordListArray) {
    const dayKey = ensureTodayBucket();
    const bucket = EbbData.Vocabulary_Mastery[dayKey];

    for (const w of wordListArray) {
        const word = String(w).trim();
        if (!word) continue;
        if (!bucket.Level_0_New.includes(word)) {
            bucket.Level_0_New.push(word);
        }
    }
    saveData();
}

// ---------------------------
// 操作函数：降级一个词
// 规则：
//  - 把它从今天的各级别里删掉
//  - 丢回今天的 Level_0_New
//  - 从所有 Word_Lists 里踢掉（它不再算“毕业了”）
// ---------------------------
function downgradeWordToToday(word) {
    const dayKey = ensureTodayBucket();
    const bucket = EbbData.Vocabulary_Mastery[dayKey];

    const levels = [
        'Level_0_New','Level_1','Level_2','Level_3','Level_4','Level_5_Mastered_Today'
    ];

    // 先从所有层级里移除
    for (const lv of levels) {
        const idx = bucket[lv].indexOf(word);
        if (idx !== -1) {
            bucket[lv].splice(idx, 1);
        }
    }

    // 丢回 Level_0_New
    if (!bucket.Level_0_New.includes(word)) {
        bucket.Level_0_New.push(word);
    }

    // 再从所有毕业 List 里除名
    for (const listName of Object.keys(EbbData.Word_Lists)) {
        const arr = EbbData.Word_Lists[listName];
        const idx2 = arr.indexOf(word);
        if (idx2 !== -1) {
            arr.splice(idx2, 1);
        }
    }

    saveData();
}

// ---------------------------
// 操作函数：结束今天 -> 打包今天的 Level_5_Mastered_Today
// 步骤：
//   1) 把今天 L5_Mastered_Today 打成 List{DayN}
//   2) 清空今天的 L5_Mastered_Today
//   3) Current_Day +1
// ---------------------------
function finalizeTodayAndAdvance() {
    const todayNum = EbbData.Study_Control.Current_Day;
    const dayKey = ensureTodayBucket();
    const bucket = EbbData.Vocabulary_Mastery[dayKey];

    const grads = [...bucket.Level_5_Mastered_Today];
    const listName = 'List' + todayNum;

    if (grads.length > 0) {
        EbbData.Word_Lists[listName] = grads;
    }

    // 清空今天的 L5
    bucket.Level_5_Mastered_Today = [];

    // 推进到下一天
    EbbData.Study_Control.Current_Day = todayNum + 1;

    saveData();
}

// ---------------------------
// 轮次控制：第几轮（1/2/3）
// ---------------------------
function nextRound() {
    const sc = EbbData.Study_Control;
    if (sc.Current_Round >= 3) {
        sc.Current_Round = 1;
    } else {
        sc.Current_Round += 1;
    }
    saveData();
    return sc.Current_Round;
}

function setRound(roundNum) {
    const n = parseInt(roundNum, 10);
    if ([1,2,3].includes(n)) {
        EbbData.Study_Control.Current_Round = n;
        saveData();
    }
    return EbbData.Study_Control.Current_Round;
}

function getRound() {
    return EbbData.Study_Control.Current_Round;
}

// ---------------------------
// 给别的模块拿快照用
// ---------------------------
function getTodaySnapshot() {
    const sc = EbbData.Study_Control;
    const todayNum = sc.Current_Day;
    const dayKey = ensureTodayBucket();
    const bucket = EbbData.Vocabulary_Mastery[dayKey];

    const sched = EbbData.Ebbinghaus_Schedule[String(todayNum)] || {
        NewList: '(未定义)',
        Review: []
    };

    return {
        currentDay: todayNum,
        currentRound: sc.Current_Round,
        todayLevels: {
            L0: bucket.Level_0_New.length,
            L1: bucket.Level_1.length,
            L2: bucket.Level_2.length,
            L3: bucket.Level_3.length,
            L4: bucket.Level_4.length,
            L5_Today: bucket.Level_5_Mastered_Today.length,
        },
        schedule: {
            NewList: sched.NewList,
            Review: sched.Review.slice(), // array
        },
    };
}

// 一个小工具：生成“10月 / 25”这种日历badge用的信息
function buildDateBadgeHTML() {
    const d = new Date();
    const month = (d.getMonth() + 1).toString().padStart(2,'0'); // "10"
    const day   = d.getDate().toString().padStart(2,'0');        // "25"

    return `
    <div style="
        background:#d62828;
        color:#fff;
        border-radius:8px;
        padding:6px 10px;
        font-weight:600;
        display:flex;
        flex-direction:column;
        line-height:1.2;
        font-size:14px;
        min-width:3.5em;
        text-align:center;
        box-shadow:0 4px 10px rgba(0,0,0,0.5);
    ">
        <div style="font-size:12px;">${month}月</div>
        <div style="font-size:16px;">${day}</div>
    </div>`;
}

// ---------------------------
// initData(): 对外暴露给 index.js 调的初始化入口
// ---------------------------
function initData() {
    loadData();
    // 暴露到全局(可选，方便控制台调试)
    window.EbbinghausDataAPI = {
        data: () => EbbData,
        saveData,
        addNewWordsToToday,
        downgradeWordToToday,
        finalizeTodayAndAdvance,
        getTodaySnapshot,
        ensureTodayBucket,
        nextRound,
        setRound,
        getRound,
        buildDateBadgeHTML,
    };
}

// ---------------------------
// 其他模块会用到的导出
// ---------------------------
export {
  initData,
  getTodaySnapshot,
  getRound,
  getScheduleForRound,
  buildLLMStatusString,
  nextRound,
  setRound,
  ensureTodayBucket,
  addNewWordsToToday,
  downgradeWordToToday,
  finalizeTodayAndAdvance,
  functionData as data,
  buildDateBadgeHTML
};

// 给别的模块拉当前整包数据用：
function functionData() {
    return EbbData;
}
