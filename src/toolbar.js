// scripts/extensions/third-party/EbbinghausTrainer/src/toolbar.js
// （复原版）只尝试一次往顶栏塞学士帽按钮，不做轮询

let hatButtonEl = null;

/**
 * insertTopButton(showFn)
 *  - showFn：点击学士帽时要执行的函数（我们传的是 showOverlay）
 */
export function insertTopButton(showFn) {
    // 如果按钮已经在页面上，就别重复插了
    if (hatButtonEl && document.body.contains(hatButtonEl)) {
        return;
    }

    // 找一个已经存在的顶栏按钮，用它的父节点当容器
    // 这些 selector 在 SillyTavern 顶栏基本都会出现至少一个
    const probe =
        document.querySelector('#extensions-settings-button') ||
        document.querySelector('#sys-settings-button') ||
        document.querySelector('.extensions-settings-button') ||
        document.querySelector('.menu_button');

    if (!probe || !probe.parentNode) {
        console.warn('[EbbinghausTrainer] 顶栏还没准备好，学士帽暂时没法插进去。');
        return;
    }

    const toolbarParent = probe.parentNode;

    // 创建按钮本体
    const btn = document.createElement('div');
    btn.id = 'ebb_toolbar_btn';
    btn.className = 'menu_button';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.minWidth = '32px';
    btn.style.minHeight = '32px';
    btn.style.padding = '6px';
    btn.style.borderRadius = '6px';
    btn.style.cursor = 'pointer';
    btn.style.userSelect = 'none';

    // 学士帽图标（保持你喜欢的样子）
    btn.innerHTML = `
        <span style="
            font-size:18px;
            line-height:18px;
            filter: brightness(1.2);
        ">🎓</span>
    `;

    // 点击 => 打开总面板
    btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        try {
            if (typeof showFn === 'function') {
                showFn();
            } else {
                console.warn('[EbbinghausTrainer] showFn 不是函数，没法打开面板。');
            }
        } catch (err) {
            console.error('[EbbinghausTrainer] 打开面板时出错:', err);
        }
    }, true);

    // 插进顶栏
    toolbarParent.appendChild(btn);

    hatButtonEl = btn;
    console.log('[EbbinghausTrainer] 学士帽入口已插入。');
}
