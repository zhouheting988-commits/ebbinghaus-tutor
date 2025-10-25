// scripts/extensions/third-party/EbbinghausTrainer/src/toolbar.js
export function insertTopButton(onClick){
  // 找到现有顶栏任意按钮当作锚点（与你之前一致）
  const tryInsert = ()=>{
    const probe =
      document.querySelector('#extensions-settings-button') ||
      document.querySelector('#sys-settings-button') ||
      document.querySelector('.extensions-settings-button') ||
      document.querySelector('.menu_button');
    if(!probe || !probe.parentNode) return false;

    // 已存在就不重复插
    if(document.getElementById('ebb_toolbar_btn')) return true;

    const btn = document.createElement('div');
    btn.id = 'ebb_toolbar_btn';
    btn.className = 'menu_button';
    Object.assign(btn.style,{
      display:'flex',alignItems:'center',justifyContent:'center',
      minWidth:'32px',minHeight:'32px',padding:'6px',borderRadius:'6px',cursor:'pointer',userSelect:'none'
    });
    btn.innerHTML = `<span style="font-size:18px;line-height:18px;filter:brightness(1.2);">🎓</span>`;
    btn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); onClick && onClick(); }, true);
    probe.parentNode.appendChild(btn);
    return true;
  };

  let i=0, t=setInterval(()=>{
    if(tryInsert() || ++i>100) clearInterval(t);
  }, 200);
}
