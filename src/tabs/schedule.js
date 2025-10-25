// scripts/extensions/third-party/EbbinghausTrainer/src/tabs/schedule.js
import { data } from '../data.js';

export function buildTabScheduleHTML(){
  const sch = data().Ebbinghaus_Schedule;
  const days = Object.keys(sch).map(Number).sort((a,b)=>a-b);

  const rows = days.map(day=>{
    const conf = sch[String(day)] || { NewList:'', Review:[] };
    const r = conf.Review || [];
    const cell = (v)=> `<td style="padding:8px 10px;white-space:nowrap;">${v || '…'}</td>`;
    return `
      <tr>
        ${cell(day)}
        ${cell(conf.NewList)}
        ${cell(r[0])}
        ${cell(r[1])}
        ${cell(r[2])}
        ${cell(r[3])}
      </tr>`;
  }).join('');

  return `
  <div style="border:1px solid rgba(255,255,255,0.25);border-radius:8px;padding:10px;">
    <!-- 纵向滚动容器 -->
    <div style="
      height:56vh;                 /* 固定高度，确保能向下滑到 Day 25 */
      overflow-y:auto;             /* 竖向滚动交给这里 */
      overscroll-behavior:contain; /* 避免外层卡片抢滚动 */
      -webkit-overflow-scrolling:touch;
    ">
      <!-- 横向滚动容器 -->
      <div style="overflow-x:auto; -webkit-overflow-scrolling:touch;">
        <table style="border-collapse:collapse; min-width:720px; width:100%; background:rgba(255,255,255,0.03);">
          <thead style="background:rgba(255,255,255,0.07); position:sticky; top:0; z-index:1;">
            <tr>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Day</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">NewList</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Review1</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Review2</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Review3</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Review4</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  </div>
`;
}
