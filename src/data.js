// scripts/extensions/third-party/EbbinghausTrainer/src/data.js

const STORAGE_KEY = 'EbbinghausTrainerData_v2';

// -------------------------
// 内存镜像
// -------------------------
let EbbData = null;

// -------------------------
// 你固定下来的默认存档结构
// -------------------------
const defaultData = {
    Vocabulary_Mastery: {
        // Day_xx: { Level_0_New:[], Level_1:[], ... }
    },

    // 每天结束后会把当天掌握好的词打包成 ListX
    Word_Lists: {
        // "List1": ["xxx","yyy",...]
    },

    // 这是艾宾浩斯复习计划（Round1 大周期）
    // Day -> { NewList: 'ListX', Review: ['ListY','ListZ', ...] }
    Ebbinghaus_Schedule: {
        "1":  { NewList: "List1",  Review: [] },
        "2":  { NewList: "List2",  Review: ["List1"] },
        "3":  { NewList: "List3",  Review: ["List1","List2"] },
        "4":  { NewList: "List4",  Review: ["List2","List3"] },
        "5":  { NewList: "List5",  Review: ["List1","List3","List4"] },
        "6":  { NewList: "List6",  Review: ["List2","List4","List5"] },
        "7":  { NewList: "List7",  Review: ["List3","List5","List6"] },
        "8":  { NewList: "List8",  Review: ["List1","List4","List6","List7"] },
        "9":  { NewList: "List9",  Review: ["List2","List5","List7","List8"] },
        "10": { NewList: "List10", Review: ["List3","List6","List8","List9"] },

        "11": { NewList: "List4",  Review: ["List7","List9","List10"] },
        "12": { NewList: "List5",  Review: ["List8","List10"] },
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

    // 学习控制：今天是第几天 + 现在在第几轮
    Study_Control: {
        Current_Day: 1,      // 你可以之后手动改
        Current_Round: 1,    // 1=单词, 2=短语, 3=整句
    },
};

// -------------------------
// 小工具：深拷贝
// -------------------------
function deepClone(obj){
    if (window.structuredClone) return structuredClone(obj);
    return JSON.parse(JSON.stringify(obj));
}

// -------------------------
// 读 / 写 本地存储
// -------------------------
function loadData(){
    try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(!raw){
            EbbData = deepClone(defaultData);
            saveData();
        }else{
            EbbData = JSON.parse(raw);

            // 容错：万一老存档没有这些字段
            if(!EbbData.Study_Control){
                EbbData.Study_Control = deepClone(defaultData.Study_Control);
            }
            if(EbbData.Study_Control.Current_Round == null){
                EbbData.Study_Control.Current_Round = 1;
            }
        }
    }catch(err){
        console.error('[EbbinghausTrainer] loadData error:', err);
        EbbData = deepClone(defaultData);
        saveData();
    }
}

function saveData(){
    try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(EbbData));
    }catch(err){
        console.error('[EbbinghausTrainer] saveData error:', err);
    }
}

// -------------------------
// 确保“今天”的桶存在
// -------------------------
function ensureTodayBucket(){
    const dayNum = EbbData.Study_Control.Current_Day;
    const dayKey = 'Day_' + dayNum;
    if(!EbbData.Vocabulary_Mastery[dayKey]){
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

// -------------------------
// Round 相关
// -------------------------
function getRound(){
    return EbbData.Study_Control.Current_Round || 1;
}

function setRound(n){
    const v = Number(n);
    if([1,2,3].includes(v)){
        EbbData.Study_Control.Current_Round = v;
        saveData();
    }
}

function nextRound(){
    let v = getRound();
    v = v >= 3 ? 1 : (v+1);
    setRound(v);
}

// -------------------------
// UI会用到的摘要：今天第几天+当日等级数量+今天该复习哪些List
// -------------------------
function getTodaySnapshot(){
    const sc = EbbData.Study_Control;
    const todayNum = sc.Current_Day;
    const dayKey = ensureTodayBucket();
    const bucket = EbbData.Vocabulary_Mastery[dayKey];

    const sched = EbbData.Ebbinghaus_Schedule[String(todayNum)] || { NewList:'', Review:[] };

    return {
        currentDay: todayNum,
        round: getRound(),
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
            Review: sched.Review || [],
        },
    };
}

// -------------------------
// 对外导出
// -------------------------
export function initData(){
    if(!EbbData) loadData();
}

export function data(){
    if(!EbbData) loadData();
    return EbbData;
}

export { saveData, getRound, setRound, nextRound, getTodaySnapshot, ensureTodayBucket };
