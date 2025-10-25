// scripts/extensions/third-party/EbbinghausTrainer/src/tabs/vocabulary.js
import { data } from '../data.js';

export function buildTabVocabularyHTML(){
  const vm = data().Vocabulary_Mastery || {};
  const dayKeys = Object.keys(vm).sort((a,b)=>{
    const na = Number(a.split('_')[1]||0), nb = Number(b.split('_')[1]||0);
    return na-nb;
  });

  const rows = dayKeys.map(k=>{
    const b = vm[k];
    const day = k.replace('Day_','Day ');
    const cell = (arr)=> (arr && arr.length ? arr.join(', ') : '…');
    return `<tr>
      <td style="padding:8px 10px;white-space:nowrap;">${day}</td>
      <td style="padding:8px 10px;">${cell(b.Level_0_New)}</td>
      <td style="padding:8px 10px;">${cell(b.Level_1)}</td>
      <td style="padding:8px 10px;">${cell(b.Level_2)}</td>
      <td style="padding:8px 10px;">${cell(b.Level_3)}</td>
      <td style="padding:8px 10px;">${cell(b.Level_4)}</td>
      <td style="padding:8px 10px;">${cell(b.Level_5_Mastered_Today)}</td>
    </tr>`;
  }).join('');

  return `
  <div style="border:1px solid rgba(255,255,255,0.25);border-radius:8px;padding:10px;">
    <div style="max-height:240px;overflow:auto;-webkit-overflow-scrolling:touch;">
      <div style="overflow-x:auto;">
        <table style="border-collapse:collapse;min-width:720px;background:rgba(255,255,255,0.03);">
          <thead style="background:rgba(255,255,255,0.07);position:sticky;top:0;">
            <tr>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Day</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Level_0_New（新词/答错）</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Level_1</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Level_2</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Level_3</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Level_4</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Level_5</th>
            </tr>
          </thead>
          <tbody>${rows || `<tr><td style="padding:8px 10px;color:#aaa;" colspan="7">还没有任何 Day 记录</td></tr>`}</tbody>
        </table>
      </div>
    </div>
  </div>
  `;
}
