// scripts/extensions/third-party/EbbinghausTrainer/src/tabs/wordlists.js
import { data } from '../data.js';

export function buildTabWordListsHTML(){
  const wl = data().Word_Lists || {};
  const names = Object.keys(wl).sort((a,b)=>{
    const na = Number(String(a).replace('List',''))||0;
    const nb = Number(String(b).replace('List',''))||0;
    return na-nb;
  });
  const rows = names.map(name=>{
    const words = wl[name] || [];
    return `<tr>
      <td style="padding:8px 10px;white-space:nowrap;">${name}</td>
      <td style="padding:8px 10px;">${words.length?words.join(', '):'…'}</td>
    </tr>`;
  }).join('');

  return `
  <div style="border:1px solid rgba(255,255,255,0.25);border-radius:8px;padding:10px;">
    <div style="max-height:240px;overflow:auto;-webkit-overflow-scrolling:touch;">
      <div style="overflow-x:auto;">
        <table style="border-collapse:collapse;min-width:520px;background:rgba(255,255,255,0.03);">
          <thead style="background:rgba(255,255,255,0.07);position:sticky;top:0;">
            <tr>
              <th style="text-align:left;padding:6px 10px;color:#fff;">ListName</th>
              <th style="text-align:left;padding:6px 10px;color:#fff;">Words</th>
            </tr>
          </thead>
          <tbody>${rows || `<tr><td style="padding:8px 10px;color:#aaa;" colspan="2">还没有任何 List</td></tr>`}</tbody>
        </table>
      </div>
    </div>
  </div>
  `;
}
