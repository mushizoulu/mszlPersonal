# 个人网站使用说明

这是一个静态个人网站项目，已经接入 GitHub 自动部署和 Cloudflare Pages。

当前线上地址：
- `https://mszl-studio.com`
- `https://www.mszl-studio.com`

## 主要文件

- `index.html`：首页
- `blog.html`：博客列表页
- `post.html`：博客正文页
- `works.html`：翻译作品列表页
- `picks.html`：推荐清单列表页
- `pick-post.html`：推荐文章正文页
- `site-data.js`：基础内容数据
- `styles.css`：样式
- `script.js`：首页交互
- `content/manifest.js`：子文件夹内容登记表

## 现在的内容结构

网站内容分成两层：

- `site-data.js`
基础内容。站点能直接运行的默认数据都在这里。

- `content/`
后续新增内容放这里，便于长期维护。

目前推荐使用的子文件夹：

- `content/works/`
- `content/posts/`
- `content/picks/`

## 更新网站的最简单流程

1. 修改内容文件
2. 上传到 GitHub 仓库
3. 等 Cloudflare Pages 自动部署
4. 打开网站检查是否更新成功

如果你只是新增内容，优先改 `content/` 里的文件。

## manifest.js 是做什么的

[content/manifest.js](/C:/Users/USER/OneDrive/ドキュメント/个人网站制作/content/manifest.js) 用来登记所有要自动读取的子文件夹内容文件。

比如：

```js
window.siteContentFiles = [
  "content/works/new-releases.js",
  "content/posts/posts-20260528.js",
  "content/picks/picks-20260528.js"
];

window.siteContentChunks = window.siteContentChunks || [];
```

注意：

- 每新增一个内容文件，都要把路径写进 `content/manifest.js`
- 数组里写在前面的文件，会更早被加载
- 如果文件里用了 `mode: "prepend"`，它的内容会优先显示

## 博客模板

推荐在 `content/posts/` 下新建一个 `.js` 文件，例如：

- `content/posts/posts-20260528.js`

写法如下：

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
      date: "2026-05-28",
      excerpt: "这里写摘要。",
      body: [
        "这里是正文第一段。",
        "这里是正文第二段。",
        "这里是正文第三段。"
      ]
    }
  ]
});
```

字段说明：

- `slug`：文章唯一名字，只用英文小写、数字、短横线
- `category`：分类，比如 `Blogging`、`Translation`、`Affiliate`
- `title`：文章标题
- `date`：日期，格式 `YYYY-MM-DD`
- `excerpt`：摘要
- `body`：正文，每一段一行
- `locales`：显示到哪些语言版本
- `mode`：`prepend` 放前面，`append` 放后面

## 翻译作品模板

推荐在 `content/works/` 下新建一个 `.js` 文件，例如：

- `content/works/new-releases-20260528.js`

写法如下：

```js
window.siteContentChunks = window.siteContentChunks || [];

window.siteContentChunks.push({
  locales: ["zh-Hans", "zh-Hant", "ja"],
  mode: "prepend",
  works: [
    {
      tag: "Translation",
      title: "作品标题",
      meta: ["原作者 / 社团名", "作品类型", "补充标签"],
      copy: "这里写简介。",
      link: "https://www.dlsite.com/..."
    }
  ]
});
```

字段说明：

- `tag`：标签，比如 `Translation`、`Editing`、`ASMR`
- `title`：作品标题
- `meta`：补充信息数组
- `copy`：作品简介
- `link`：作品链接
- `locales`：显示到哪些语言版本
- `mode`：`prepend` 放前面，`append` 放后面

## 推荐清单模板

推荐在 `content/picks/` 下新建一个 `.js` 文件，例如：

- `content/picks/picks-20260528.js`

写法如下：

```js
window.siteContentChunks = window.siteContentChunks || [];

window.siteContentChunks.push({
  locales: ["zh-Hans", "zh-Hant", "ja"],
  mode: "prepend",
  picks: [
    {
      slug: "my-pick-item",
      tag: "Reading",
      title: "推荐标题",
      meta: "这里写一句简短说明。",
      copy: "这里写首页和推荐列表会显示的简介。",
      productLink: "https://商品购买链接",
      body: [
        "这里是推荐文章第一段。",
        "这里是推荐文章第二段。",
        "这里是推荐文章第三段。"
      ]
    }
  ]
});
```

字段说明：

- `slug`：推荐文章唯一名字
- `tag`：分类标签，比如 `Reading`、`Writing`、`Learning`
- `title`：推荐标题
- `meta`：一句短说明
- `copy`：摘要
- `productLink`：商品购买链接
- `body`：完整推荐文章正文
- `locales`：显示到哪些语言版本
- `mode`：`prepend` 放前面，`append` 放后面

## 最省事的用法

如果你不想每次从头写，最简单的方法是：

1. 找一个旧文件
2. 复制一份
3. 改成你的新内容
4. 把新文件路径登记到 `content/manifest.js`
5. 上传到 GitHub

## 需要特别注意的地方

- `slug` 不要重复
- 链接必须是完整网址，比如 `https://...`
- 每一段正文都要写在引号里
- 最后一行不要少括号
- 新增子文件夹内容后，一定要同步更新 `content/manifest.js`

## 缓存提醒

网站已经加了更积极的更新策略，但如果你刚发布完内容，偶尔仍可能需要：

- 强制刷新浏览器
- 或在 Cloudflare 清一次缓存

这属于发布后的排查手段，不是每次都必须做。
