# むしぞる中尉个人网站

这是一个不需要构建步骤的静态个人网站。GitHub 仓库的 `main` 分支由 Cloudflare Pages 自动发布。

线上地址：

- <https://mszl-studio.com>
- <https://www.mszl-studio.com>

仓库只包含网站发布所需的文件。日文输入法开发任务的原始目录不属于本仓库；本地用于审计的复制文件也不会被网页加载。

## 架构总览

页面采用“HTML 壳层 + 运行时 JavaScript + 分块数据”的结构：

```text
当前页面 HTML
  └─ asset-version.js       设置全站资源版本号
      └─ asset-loader.js    加载带版本参数的 CSS、共享脚本和当前页面脚本
          ├─ styles.css
          ├─ site-data.js    基础站点文案和三种站点语言
          ├─ share-utils.js  共享按钮和分享 URL
          ├─ content/manifest.js
          ├─ content-loader.js
          │   └─ content/**/*.js  内容分块，合并进 window.siteData
          └─ 当前页面脚本       script.js / blog.js / works.js ...
```

仓库是纯前端项目，没有 `package.json`、打包器或后端 API。HTML 先提供稳定的 DOM 容器，脚本在浏览器中读取数据并渲染页面。各 HTML 入口都通过 `asset-loader.js` 加载公共资源；隐私政策页不指定页面脚本。

### 资源版本和缓存

- `asset-version.js` 写入 `window.__ASSET_VERSION__`，当前版本为 `20260914b`。
- `asset-loader.js` 给 CSS、JS 和内容文件统一追加 `?v=<版本号>`，并按照依赖顺序串行加载脚本。
- `content-loader.js` 在内容文件加载完后解析分块并通知 `window.siteDataReady`；页面脚本等待这个 Promise 后再渲染。
- 修改 CSS、JavaScript、站点数据或 `content/` 内容后，必须更新 `asset-version.js`，否则浏览器或 CDN 可能继续使用旧资源。

## 页面入口和职责

| 文件 | 页面 | 主要职责 |
| --- | --- | --- |
| `index.html` + `script.js` | 首页 | 主视觉、统计卡、最新发布、翻译作品、推荐清单、博客摘要、关于我、联系和首页分享区 |
| `works.html` + `works.js` | 翻译作品列表 | 按当前语言分页，每页最多 `itemLimit`（当前为 10）部作品 |
| `blog.html` + `blog.js` | 博客列表 | 按当前语言分页，每页最多 10 篇文章，并把页码写回 URL |
| `picks.html` + `picks.js` | 推荐清单列表 | 显示推荐摘要、商品链接和分页 |
| `post.html` + `post.js` | 博客正文 | 从 `?slug=` 查找文章，渲染段落、图片、表格和上一篇/下一篇导航 |
| `pick-post.html` + `pick-post.js` | 推荐正文 | 从 `?slug=` 查找推荐文章，渲染正文、商品链接和分享区 |
| `privacy/index.html` | 隐私政策 | 静态展示简体中文、繁體中文、日本語、English 四种政策文本；不接入站点语言切换 |
| `japanese-input/index.html` + `app.mjs` | 日文输入试打 | 独立的浏览器输入原型，见下文 |

所有普通页面的语言按钮使用 `localStorage` 的 `site-locale` 保存选择，站点目前提供 `zh-Hans`、`zh-Hant`、`ja` 三种版本。页脚统一链接到 `/privacy`。

## 数据和内容加载

### 基础数据

`site-data.js` 创建全局对象 `window.siteData`，主要字段是：

- `itemLimit`：列表页分页大小，当前为 10。
- `locales`：`zh-Hans`、`zh-Hant`、`ja` 的站点文案和内容数组。
- 每个语言对象包含 `site`、`nav`、`switcher`、`buttons`、各页面说明、`share`、`works`、`posts`、`picks`。

首页另外限制最多显示 9 部翻译作品和 12 篇博客摘要；列表页使用 `itemLimit` 分页。首页“建站天数”由 `script.js` 根据 `2026-05-27` 计算，作品数和博客数直接取当前语言数组长度。

### 内容分块

长期内容放在以下目录：

- `content/works/`：翻译作品，目前登记 `new-releases.js`。
- `content/posts/`：博客文章，按日期拆分为多个文件。
- `content/picks/`：推荐文章。
- `content/manifest.js`：唯一的加载登记表。

每个内容文件先确保数组存在，再向 `window.siteContentChunks` 推入一个分块：

```js
window.siteContentChunks = window.siteContentChunks || [];

window.siteContentChunks.push({
  locales: ["zh-Hans", "zh-Hant", "ja"],
  mode: "prepend",
  posts: [
    {
      slug: "my-new-post",
      category: "Blogging",
      title: "文章标题",
      date: "2026-09-15",
      excerpt: "列表摘要。",
      body: ["正文第一段。", "正文第二段。"]
    }
  ]
});
```

`content/manifest.js` 中的路径按顺序加载。`mode` 只有两种含义：`prepend` 把分块放到对应数组前面，`append` 放到末尾；未填写或填写其他值时按 `append` 处理。也可以使用单个 `locale` 字段代替 `locales`，但新内容建议明确写出三种语言。

新增内容必须同时完成两步：

1. 在 `content/posts/`、`content/works/` 或 `content/picks/` 新建/修改文件。
2. 将相对路径登记到 `content/manifest.js`。

如果没有登记，文件不会被浏览器请求，页面也不会看到内容。`slug` 必须在同一内容类型中唯一，只使用英文小写字母、数字和短横线。

### 内容字段

- 博客：`slug`、`category`、`title`、`date`、`excerpt`、`body`。
- 作品：`tag`、`title`、`meta`（数组）、`copy`、`link`，可选 `linkLabel`。
- 推荐：`slug`、`tag`、`title`、`meta`、`copy`、`productLink`、`body`。

`body` 可以混合使用字符串段落和结构化块：

```js
body: [
  "普通段落",
  { type: "image", src: "https://example.com/image.jpg", alt: "图片说明", caption: "可选说明" },
  { type: "table", headers: ["列 1", "列 2"], rows: [["A1", "A2"], ["B1", "B2"]] }
]
```

正文脚本会把段落、图片和表格分别渲染为 DOM，并为正文图片启用懒加载。文章详情页和推荐详情页都通过 URL 的 `slug` 参数定位记录；作品和推荐商品链接应使用完整的 `https://...` 地址。

## 日文输入试打页

`japanese-input/` 是嵌入个人网站的独立功能目录，不依赖主站的 `site-data.js`。它有自己的 HTML、CSS 和 ES 模块：

- `index.html`：页面壳层、六语言下拉选择框、试打区、状态面板、键位图、回放诊断和隐私政策链接。
- `app.mjs`：页面控制器。维护本地语言、DOM 文案、键盘事件、复制、导出/导入和候选演示；语言选择保存到 `localStorage` 的 `kana-locale`。
- `src/core.mjs`：纯状态机。处理英数、平假名、片假名三种内部模式，以及行键、段键、修饰键、退格、撤销、候选和提交。
- `src/mapping.mjs`：数字小键盘行映射、`F/D/G/A/S` 段映射、浊点/半浊点/小假名和假名字形转换。
- `src/replay.mjs`：事件日志的版本、大小限制、校验、序列化和回放。
- `style.css`：试打页布局、键盘图、状态颜色、语言选择器和移动端断点。

试打页目前有 `zh-Hans`、`zh-Hant`、`ja`、`en`、`es`、`ko` 六种界面语言，互不改变主站的三语言数据。浏览器原型只在试打文本框获得焦点时捕获按键，不接管系统级键盘；使用时应切换系统输入为英数，并使用带数字小键盘的实体键盘。候选词是演示数据，不是真实 IME 接口。

核心按键规则由 `mapping.mjs` 和 `core.mjs` 共同决定：数字小键盘选择行，`F/D/G/A/S` 选择段；`W/E/R/T` 负责小假名、促音、半浊点和浊点；`X/C` 输入日文标点，`NumpadSubtract` 输入长音，`NumpadDecimal` 退格，`NumpadAdd` 请求变换，`Caps Lock` 循环切换内部模式。导出日志为版本 2，最多 10,000 个事件或 10 MB。

## 分享、隐私和部署配置

- `share-utils.js` 提供 X、Threads、微博和复制链接四种操作。首页、博客正文和推荐正文通过同一模块渲染，只传入当前语言的按钮文案与分享内容。
- `privacy/index.html` 是完全静态的政策页；它不使用主站内容数据或语言按钮，只展示页面内置的四种政策文本。
- `_headers` 为根页面、HTML、版本文件、JS、CSS、`content/` 和 `japanese-input/` 分别设置 `Cache-Control`。入口和版本文件使用 `no-store`，脚本、样式和内容使用重新验证策略。
- 推送到 `main` 后由 Cloudflare Pages 自动部署。仓库没有需要执行的构建命令，发布目录就是仓库根目录。

## 日常维护流程

1. 根据页面职责修改正确的 HTML、脚本、样式、`site-data.js` 或 `content/` 文件。
2. 新增内容时登记 `content/manifest.js`，检查 `slug`、链接和三种站点语言是否齐全。
3. 修改 CSS、JS、数据或内容后更新 `asset-version.js` 的版本号。
4. 本地通过 HTTP 服务打开页面，检查首页、列表分页、详情页 `?slug=`、语言切换、分享按钮和 `/privacy`。
5. 对 JavaScript/ES 模块运行语法检查，并在试打页实际输入 `Numpad 6 → F → D`，确认 `か → き`、退格、撤销和语言下拉单正常。
6. 提交并推送 `main`，等待 Cloudflare Pages 完成部署；线上仍显示旧内容时先确认版本号，再强制刷新浏览器或清理 CDN 缓存。

可用的本地语法检查示例（Windows PowerShell）：

```powershell
node --check .\script.js
node --check .\blog.js
node --check .\works.js
node --check .\picks.js
node --check .\post.js
node --check .\pick-post.js
node --check .\japanese-input\app.mjs
node --check .\japanese-input\src\core.mjs
node --check .\japanese-input\src\mapping.mjs
node --check .\japanese-input\src\replay.mjs
```

## 目录速览

```text
.
├─ index.html / script.js
├─ blog.html / blog.js
├─ works.html / works.js
├─ picks.html / picks.js
├─ post.html / post.js
├─ pick-post.html / pick-post.js
├─ privacy/index.html
├─ asset-version.js
├─ asset-loader.js
├─ content-loader.js
├─ site-data.js
├─ share-utils.js
├─ styles.css
├─ _headers
├─ content/
│  ├─ manifest.js
│  ├─ posts/
│  ├─ works/
│  └─ picks/
└─ japanese-input/
   ├─ index.html
   ├─ app.mjs
   ├─ style.css
   └─ src/core.mjs / mapping.mjs / replay.mjs
```

`japanese-input-source/`、`japanese-input-source-manifest.json` 等本地复制和审计文件位于网站制作工作目录时，只用于保留来源证据，不是公开站点的运行时依赖。维护网站时应始终在本仓库副本中修改，并保持原日文输入法开发目录不变。
