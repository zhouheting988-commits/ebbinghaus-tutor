// scripts/extensions/third-party/EbbinghausTrainer/src/data.js

const STORAGE_KEY = 'EbbinghausTrainerData_v2';

const defaultData = {
  Vocabulary_Mastery: {
    // 会按需动态补，比如 Day_1 / Day_2... 里放 Level_0_New/Level_1/.../Level_5_Mastered_Today
  },

  Word_Lists: {
    // "List1": ["wordA","wordB", ...]  // 毕业词会存进来
  },

  Ebbinghaus_Schedule: {
    // 这是我们现在用的 Day1~Day25 计划（你已经加好了25天的那版）
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

  Study_Control: {
    Current_Day: 1,      // 你哪一天
    Current_Round: 1,    // 现在默认是第1轮（单词释义阶段）
                         // Round 1 = 单词释义
                         // Round 2 = 短语搭配
                         // Round 3 = 句子+知识点
  },
};

// 内存镜像
let EbbData = null;

// 载入本地
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      EbbData = JSON.parse(raw);
    } else {
      EbbData = structuredClone(defaultData);
      saveData();
    }
  } catch (e) {
    console.error('[EbbinghausTrainer] loadData error', e);
    EbbData = structuredClone(defaultData);
    saveData();
  }

  // 容错：如果老存档里没有 Current_Round，就补成1
  if (!EbbData.Study_Control) {
    EbbData.Study_Control = { Current_Day: 1, Current_Round: 1 };
  } else {
    if (EbbData.Study_Control.Current_Day == null) {
      EbbData.Study_Control.Current_Day = 1;
    }
    if (EbbData.Study_Control.Current_Round == null) {
      EbbData.Study_Control.Current_Round = 1;
    }
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(EbbData));
  } catch (e) {
    console.error('[EbbinghausTrainer] saveData error', e);
  }
}

// 工具：保证今天的 Day_xx 桶存在
function ensureTodayBucket() {
  const sc = EbbData.Study_Control;
  const dayKey = 'Day_' + sc.Current_Day;
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

// 给 overlay 用
function getStudyControl() {
  return EbbData.Study_Control;
}

function getSchedule() {
  return EbbData.Ebbinghaus_Schedule;
}

function data() {
  return EbbData;
}

// 改轮次：下一轮
function nextRound() {
  const sc = getStudyControl();
  if (sc.Current_Round >= 3) {
    sc.Current_Round = 1;
  } else {
    sc.Current_Round += 1;
  }
  saveData();
  return sc.Current_Round;
}

// 改轮次：设成指定轮
function setRound(roundNum) {
  const sc = getStudyControl();
  sc.Current_Round = roundNum;
  saveData();
}

// 导出
export {
  loadData,
  saveData,
  ensureTodayBucket,
  getStudyControl,
  getSchedule,
  data,
  nextRound,
  setRound,
  STORAGE_KEY,
  defaultData,
  initData,
};

// initData 负责在 index.js 里调用
function initData() {
  loadData();
}
