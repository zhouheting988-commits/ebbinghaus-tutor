// scripts/extensions/third-party/EbbinghausTrainer/src/toolbar.js
// 负责把 🎓 学士帽按钮插入 SillyTavern 顶部工具栏，并在点击时调用 showOverlay()

let hatButtonEl = null;
let injected = false;      // 确保只插一次
let observerStarted = false;

/**
 * 这个函数用来找到 SillyTavern 顶栏按钮的父容器
 * 我们会尝试多种常见选择器，只要抓到其中任意一个按钮，
 * 就用那个按钮的 parentNode 当插入点。
 */
function findToolbarContainer() {
    const probe =
        document.querySelector('#extensions-settings-button') ||
        document.querySelector('#sys-settings-button') ||
        document.querySelector('.extensions-settings-button') ||
        document.querySelector('.menu_button');

    if (probe && probe.parentNode) {
        return probe.parentNode;
    }
    return null;
}

/**
 * 真正把按钮插进去
 */
function addHatButton(showFn) {
    if (injected) return; // 已经插过就别重复
    const toolbarParent = findToolbarContainer();
    if (!toolbarParent) return; // 现在还没出现，等下一次

    // 创建按钮 DOM
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

    // 和你喜欢的那顶小金学士帽保持一致
    btn.innerHTML = `
        <span style="
            font-size:18px;
            line-height:18px;
            filter: brightness(1.2);
        ">🎓</span>
    `;

    // 点击 -> 打开面板
    btn.addEventListener('click', (ev) => {
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

    toolbarParent.appendChild(btn);

    hatButtonEl = btn;
    injected = true;
    console.log('[EbbinghausTrainer] 🎓 学士帽入口已插入。');
}

/**
 * 对外主入口：
 * - 尝试立刻插一次
 * - 如果失败（顶栏还没出来），就开启 MutationObserver 持续观察 DOM
 */
export function insertTopButton(showFn) {
    // 1. 先尝试直接插
    addHatButton(showFn);
    if (injected) {
        exposeDebug(showFn);
        return;
    }

    // 2. 如果还没插成功，启动观察器，等顶栏出现
    if (observerStarted) {
        exposeDebug(showFn);
        return;
    }
    observerStarted = true;

    const observer = new MutationObserver(() => {
        if (injected) {
            observer.disconnect();
            return;
        }
        addHatButton(showFn);
        if (injected) {
            observer.disconnect();
            console.log('[EbbinghausTrainer] MutationObserver 观察到顶栏后，已成功插入按钮。');
        }
    });

    // 监听整个 document.body，因为顶栏一般都是后面 append 进 body 里的
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    exposeDebug(showFn);
}

/**
 * 调试辅助：在控制台手动救援
 * 以后如果你刷新完仍然没看到帽子，
 * 打开浏览器控制台，输入：
 *   window.__ebbDebug.forceInsertHatButton()
 * 就能强行再跑 addHatButton()。
 */
function exposeDebug(showFn) {
    window.__ebbDebug = {
        forceInsertHatButton() {
            console.log('[EbbinghausTrainer] 手动尝试强制插入学士帽按钮…');
            injected = false; // 允许重试
            addHatButton(showFn);
            if (!injected) {
                console.warn('[EbbinghausTrainer] 仍未找到顶栏容器，可能选择器又变了。');
            }
        }
    };
}
