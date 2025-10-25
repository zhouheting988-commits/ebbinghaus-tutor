// scripts/extensions/third-party/EbbinghausTrainer/src/tabs/schedule.js
import { data } from '../data.js';

export function buildTabScheduleHTML(){
  const sch = data().Ebbinghaus_Schedule;

  // 左四列：Day / NewList / Review1 / Review2
  const leftRows = [];
  // 右两列：Review3 / Review4（根据你给的表最多到 Review4）
  const rightRows = [];

  const days = Object.keys(sch).map(Number).sort((a,b)=>a-b);
  for(const day of days){
    const conf = sch[String(day)];
    const rev = conf.Review || [];
    leftRows.push(`
      <tr>
        <td style="padding:8px 10px;">${day}</td>
        <td style="padding:8px 10px;white-space:nowrap;">${conf.NewList||''}</td>
        <td style="padding:8px 10px;white-space:nowrap;">${rev[0]||'…'}</td>
        <td style="padding:8px 10px;white-space:nowrap;">${rev[1]||'…'}</td>
      </tr>
    `);
    rightRows.push(`
      <tr>
        <td style="padding:8px 10px;white-space:nowrap;">${rev[2]||'…'}</td>
        <td style="padding:8px 10px;white-space:nowrap;">${rev[3]||'…'}</td>
      </tr>
    `);
  }

  return `
  <div style="color:#ddd;font-size:14px;line-height:1.4;margin-bottom:8px;">
    每天要学的新词(NewList) + 要复习的旧词组(Review列)。可左右滑动查看全部列。
  </div>

  <div style="border:1px solid rgba(255,255,255,0.25);border-radius:8px;padding:10px;">
    <div style="max-height:240px;overflow:auto;-webkit-overflow-scrolling:touch;">
      <div style="display:flex;gap:12px;overflow-x:auto;flex-wrap:nowrap;">
        <table style="border-collapse:collapse;min-width:320px;background:rgba(255,255,255,0.03);">
          <thead style="background:rgba(255,255,255,0.07);position:sticky;top:0;">
            <tr>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Day</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">NewList</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Review1</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Review2</th>
            </tr>
          </thead>
          <tbody>${leftRows.join('')}</tbody>
        </table>

        <table style="border-collapse:collapse;min-width:220px;background:rgba(255,255,255,0.03);">
          <thead style="background:rgba(255,255,255,0.07);position:sticky;top:0;">
            <tr>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Review3</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Review4</th>
            </tr>
          </thead>
          <tbody>${rightRows.join('')}</tbody>
        </table>
      </div>
    </div>
  </div>
  `;
}
