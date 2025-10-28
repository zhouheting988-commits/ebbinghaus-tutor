// scripts/extensions/third-party/EbbinghausTrainer/src/toolbar.js
// 负责把「🎓」按钮插到 SillyTavern 顶部工具栏里，并在点击时打开 overlay

let hatButtonEl = null;
let started = false;

/**
 * insertTopButton(showFn)
 * showFn: 点击学士帽时调用，比如 showOverlay()
 */
export function insertTopButton(showFn) {
    // 防止重复启动多次轮询
    if (started) return;
    started = true;

    let tries = 0;
    const maxTries = 100;   // 最多试 100 次
    const intervalMs = 200; // 每 200ms 看一次

    const timer = setInterval(() => {
        tries++;

        // 如果按钮已经在 DOM 里了，就不用再管
        if (hatButtonEl && document.body.contains(hatButtonEl)) {
            clearInterval(timer);
            return;
        }

        // 找一个已经存在的顶栏按钮，拿它的 parentNode 当容器
        // 这些选择器是 SillyTavern 常见的顶栏按钮 id/class
        const probe =
            document.querySelector('#extensions-settings-button') ||
            document.querySelector('#sys-settings-button') ||
            document.querySelector('.extensions-settings-button') ||
            document.querySelector('.menu_button');

        if (!probe || !probe.parentNode) {
            // 还没渲染出来 -> 等下一轮
            if (tries >= maxTries) {
                clearInterval(timer);
                console.warn('[EbbinghausTrainer] 顶栏未找到，未能插入学士帽按钮。');
            }
            return;
        }

        // 找到了顶栏容器
        clearInterval(timer);
        const toolbarParent = probe.parentNode;

        // 创建我们自己的学士帽按钮
        hatButtonEl = document.createElement('div');
        hatButtonEl.id = 'ebb_toolbar_btn';
        hatButtonEl.className = 'menu_button';
        hatButtonEl.style.display = 'flex';
        hatButtonEl.style.alignItems = 'center';
        hatButtonEl.style.justifyContent = 'center';
        hatButtonEl.style.minWidth = '32px';
        hatButtonEl.style.minHeight = '32px';
        hatButtonEl.style.padding = '6px';
        hatButtonEl.style.borderRadius = '6px';
        hatButtonEl.style.cursor = 'pointer';
        hatButtonEl.style.userSelect = 'none';

        // 金色帽子 / 和别的图标一样大小，跟你现在 UI 一致
        hatButtonEl.innerHTML = `
            <span style="
                font-size:18px;
                line-height:18px;
                filter: brightness(1.2);
            ">🎓</span>
        `;

        // 点击 => 打开总面板
        hatButtonEl.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            try {
                if (typeof showFn === 'function') {
                    showFn();
                } else {
                    console.warn('[EbbinghausTrainer] showFn 不是函数，无法打开面板。');
                }
            } catch (err) {
                console.error('[EbbinghausTrainer] 打开面板时出错:', err);
            }
        }, true);

        // 把按钮挂到顶栏（默认加在最后，和你之前位置一致）
        toolbarParent.appendChild(hatButtonEl);

        console.log('[EbbinghausTrainer] 学士帽入口已成功插入顶栏。');
    }, intervalMs);
}
