import { data } from '../data.js';

export function buildTabScheduleHTML(){
  const sch = data().Ebbinghaus_Schedule;
  const days = Object.keys(sch).map(Number).sort((a,b)=>a-b);

  const rows = days.map(day=>{
    const conf = sch[String(day)];
    const r = conf.Review || [];
    const col = i => (r[i] || '…');
    return `
      <tr>
        <td style="padding:8px 10px;white-space:nowrap;">${day}</td>
        <td style="padding:8px 10px;white-space:nowrap;">${conf.NewList || ''}</td>
        <td style="padding:8px 10px;white-space:nowrap;">${col(0)}</td>
        <td style="padding:8px 10px;white-space:nowrap;">${col(1)}</td>
        <td style="padding:8px 10px;white-space:nowrap;">${col(2)}</td>
        <td style="padding:8px 10px;white-space:nowrap;">${col(3)}</td>
      </tr>
    `;
  }).join('');

  return `
  <div style="color:#ddd;font-size:14px;line-height:1.4;margin-bottom:8px;">
    每天要学的新词(NewList) + 要复习的旧词组(Review列)。支持上下/左右滑动查看全部。
  </div>

  <div style="border:1px solid rgba(255,255,255,0.25);border-radius:8px;padding:10px;">
    <div style="max-height:240px;overflow:auto;-webkit-overflow-scrolling:touch;">
      <div style="overflow-x:auto;">
        <table style="border-collapse:collapse;min-width:640px;background:rgba(255,255,255,0.03);">
          <thead style="background:rgba(255,255,255,0.07);position:sticky;top:0;">
            <tr>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Day</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">NewList</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Review1</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Review2</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Review3</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Review4</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `;
}
