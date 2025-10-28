// scripts/extensions/third-party/EbbinghausTrainer/src/data.js
//
// 职责：
// - 管本地存档(localStorage)
// - 记录词汇掌握、List、复习计划
// - 控制当前天数 / 当前轮次
// - 生成给 UI 和 给 AI 用的状态

// 存档 key
const STORAGE_KEY = 'EbbinghausTrainerData_v3';

// ---------------------------
// 默认数据骨架
// ---------------------------
const defaultData = {
  Vocabulary_Mastery: {
    // 动态按天补，例如 "Day_1": { Level_0_New:[], ... }
  },

  Word_Lists: {
    // e.g. "List1": ["create","help",...]
  },

  // 第1轮（单词）25天长线
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
    "25": { NewList: "List10", Review: [] }
  },

  Study_Control: {
    Current_Day:   1,
    Current_Round: 1 // 1=单词(25天),2=短语(5天),3=句子(5天)
  }
};

// ---------------------------
// 第2轮 / 第3轮：5天冲刺表（不进本地存档，是固定模板）
// ---------------------------
const Round2_Schedule = {
  "1": { NewList: "List1", Review: [] },
  "2": { NewList: "List2", Review: ["List1"] },
  "3": { NewList: "List3", Review: ["List1", "List2"] },
  "4": { NewList: "List4", Review: ["List2", "List3"] },
  "5": { NewList: "List5", Review: ["List3", "List4"] }
};

const Round3_Schedule = {
  "1": { NewList: "List1", Review: [] },
  "2": { NewList: "List2", Review: ["List1"] },
  "3": { NewList: "List3", Review: ["List1", "List2"] },
  "4": { NewList: "List4", Review: ["List2", "List3"] },
  "5": { NewList: "List5", Review: ["List3", "List4"] }
};

// ---------------------------
// 内存镜像
// ---------------------------
let EbbData = null;

// ---------------------------
// 工具: deepClone
// ---------------------------
function deepClone(obj) {
  if (window.structuredClone) return window.structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------
// 载入 / 保存
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

      // 兜底：保证 Study_Control 存在并且字段不为 null
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

      // 兜底：保证长线表存在
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
// 确保“今天的桶”存在（Day_n -> Level_0_New...）
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
      Level_5_Mastered_Today: []
    };
  }
  return dayKey;
}

// ---------------------------
// 往今天塞一批新词
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
// 降级一个词（丢回 Level_0_New）
// ---------------------------
function downgradeWordToToday(word) {
  const dayKey = ensureTodayBucket();
  const bucket = EbbData.Vocabulary_Mastery[dayKey];

  const levels = [
    'Level_0_New',
    'Level_1',
    'Level_2',
    'Level_3',
    'Level_4',
    'Level_5_Mastered_Today'
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
// 结束今天 -> 打包今天的 L5 成 ListN -> 天数+1
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

  // 清空今天L5
  bucket.Level_5_Mastered_Today = [];

  // 推进到下一天
  EbbData.Study_Control.Current_Day = todayNum + 1;

  saveData();
}

// ---------------------------
// 轮次控制
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
  if ([1, 2, 3].includes(n)) {
    EbbData.Study_Control.Current_Round = n;
    saveData();
  }
  return EbbData.Study_Control.Current_Round;
}

function getRound() {
  return EbbData.Study_Control.Current_Round;
}

// ---------------------------
// 根据轮次拿对应复习计划（给“复习计划”tab用）
// ---------------------------
function getScheduleForRound(roundNum) {
  if (roundNum === 1) {
    return {
      plan: EbbData.Ebbinghaus_Schedule,
      totalDays: 25
    };
  }
  if (roundNum === 2) {
    return {
      plan: Round2_Schedule,
      totalDays: 5
    };
  }
  return {
    plan: Round3_Schedule,
    totalDays: 5
  };
}

// ---------------------------
// 给 UI 汇总今天快照
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
      L5_Today: bucket.Level_5_Mastered_Today.length
    },
    schedule: {
      NewList: sched.NewList,
      Review: sched.Review.slice()
    }
  };
}

// ---------------------------
// 日期小红块
// ---------------------------
function buildDateBadgeHTML() {
  const d = new Date();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');

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
    </div>
  `;
}

// ---------------------------
// 给 AI 用的“学习状态”文本
// ---------------------------
function buildLLMStatusString() {
  const snap = getTodaySnapshot();

  const roundDescMap = {
    1: '单词记忆轮（Round 1）',
    2: '短语巩固轮（Round 2）',
    3: '句子表达轮（Round 3）'
  };

  const roundDesc = roundDescMap[snap.currentRound] || ('Round ' + snap.currentRound);
  const todayNew = snap.schedule.NewList || '';
  const todayReview = (snap.schedule.Review && snap.schedule.Review.length)
    ? snap.schedule.Review.join(', ')
    : '(无复习任务)';

  return `
[学习状态]
- 今天是第 ${snap.currentDay} 天
- 当前学习阶段：${roundDesc}
- 今日主背清单：${todayNew}
- 今日复习清单：${todayReview}
请在对话中根据这个状态来引导和监督学习，不要丢失这个上下文。
  `.trim();
}

// ---------------------------
// initData：启动时调用
//  - 读本地存档
//  - 把一堆操作函数挂到 window 方便别的模块用
// ---------------------------
function initData() {
  loadData();

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
    getScheduleForRound,
    buildLLMStatusString,
    buildDateBadgeHTML
  };
}

// ---------------------------
// 方便其它模块直接拿整包 EbbData
// ---------------------------
function functionData() {
  return EbbData;
}

// ---------------------------
// 导出
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
