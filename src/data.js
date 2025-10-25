// scripts/extensions/third-party/EbbinghausTrainer/src/data.js
const EXT_NAME = 'EbbinghausTrainer';
const STORAGE_KEY = 'EbbinghausTrainerData_v2';

const defaultData = {
  Vocabulary_Mastery: {},
  Word_Lists: {},
  // —— 第一轮固定复习计划：按你给的 1~25 天表 ——
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

  // 回收阶段（不再新增 List11..，而是轮查旧 List）
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
  "25": { NewList: "List10", Review: [] }
},
  Study_Control: {
    Current_Day: 1,
    Current_Round: 1,  // 1:单词, 2:短语, 3:句子
  },
};

let EbbData = null;

function deepClone(o){ return window.structuredClone ? structuredClone(o) : JSON.parse(JSON.stringify(o)); }

export function initData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    EbbData = raw ? JSON.parse(raw) : deepClone(defaultData);
    saveData();
  }catch(e){
    console.error('[Ebbinghaus] load error:', e);
    EbbData = deepClone(defaultData);
    saveData();
  }
}

export function saveData(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(EbbData)); }
  catch(e){ console.error('[Ebbinghaus] save error:', e); }
}

export function data(){ return EbbData; }

// 工具
export function ensureTodayBucket(){
  const day = EbbData.Study_Control.Current_Day;
  const key = 'Day_' + day;
  if(!EbbData.Vocabulary_Mastery[key]){
    EbbData.Vocabulary_Mastery[key] = {
      Level_0_New: [], Level_1: [], Level_2: [], Level_3: [], Level_4: [], Level_5_Mastered_Today: []
    };
  }
  return key;
}

// 轮次
export function getRound(){ return EbbData.Study_Control.Current_Round || 1; }
export function setRound(n){ EbbData.Study_Control.Current_Round = Math.min(3, Math.max(1, n)); saveData(); }
export function nextRound(){ setRound(getRound() % 3 + 1); }

// 操作（保留原流程）
export function addNewWordsToToday(list){
  const key = ensureTodayBucket();
  const b = EbbData.Vocabulary_Mastery[key];
  list.forEach(w=>{
    const s = String(w||'').trim(); if(!s) return;
    if(!b.Level_0_New.includes(s)) b.Level_0_New.push(s);
  });
  saveData();
}

export function downgradeWordToToday(word){
  const key = ensureTodayBucket();
  const b = EbbData.Vocabulary_Mastery[key];
  ["Level_0_New","Level_1","Level_2","Level_3","Level_4","Level_5_Mastered_Today"].forEach(lv=>{
    const i = b[lv].indexOf(word); if(i>-1) b[lv].splice(i,1);
  });
  if(!b.Level_0_New.includes(word)) b.Level_0_New.push(word);
  Object.keys(EbbData.Word_Lists).forEach(name=>{
    const arr = EbbData.Word_Lists[name]; const j = arr.indexOf(word);
    if(j>-1) arr.splice(j,1);
  });
  saveData();
}

export function finalizeTodayAndAdvance(){
  const today = EbbData.Study_Control.Current_Day;
  const key = ensureTodayBucket();
  const b = EbbData.Vocabulary_Mastery[key];
  const grads = [...b.Level_5_Mastered_Today];
  if(grads.length) EbbData.Word_Lists['List'+today] = grads;
  b.Level_5_Mastered_Today = [];
  EbbData.Study_Control.Current_Day = today + 1;
  saveData();
}

// 今日摘要（给 UI 用）
export function getTodaySnapshot(){
  const day = EbbData.Study_Control.Current_Day;
  const key = ensureTodayBucket();
  const b = EbbData.Vocabulary_Mastery[key];
  const sch = EbbData.Ebbinghaus_Schedule[String(day)] || { NewList:'(未定义)', Review:[] };
  return {
    currentDay: day,
    todayLevels: {
      L0:b.Level_0_New.length, L1:b.Level_1.length, L2:b.Level_2.length, L3:b.Level_3.length, L4:b.Level_4.length, L5_Today:b.Level_5_Mastered_Today.length
    },
    schedule: sch,
    round: getRound(),
  };
}
