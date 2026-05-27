# 个人网站使用说明

这是一个静态个人网站项目，已经接入 Cloudflare Pages 和 GitHub 自动部署。

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
- `site-data.js`：网站内容数据
- `styles.css`：样式
- `script.js`：首页与全站交互

## 以后最常改哪里

现在网站内容分成两层：

- `site-data.js`：原有基础内容
- `content/`：后续新增内容

如果你以后继续加新作品、新推荐、新博客，优先往 `content/` 里放。

## 更新网站的最简单流程

1. 在本地修改 `content/` 里的内容文件，或按需要修改 `site-data.js`
2. 把改好的文件上传到 GitHub 仓库
3. 等 Cloudflare Pages 自动部署
4. 打开网站检查是否更新成功

你现在不需要再手动上传到 Cloudflare。

## 内容结构说明

网站内容主要分成这几个部分：

- `posts`：博客
- `works`：翻译作品
- `picks`：推荐清单

新增内容现在可以放进这些子文件夹：

- `content/works/`
- `content/posts/`
- `content/picks/`

页面会先读取 `site-data.js`，再自动读取 `content/manifest.js` 里登记的内容文件并合并进去。

如果你要让一个新增内容同时出现在简体、繁体、日文版本里，可以在内容文件里写：

```js
{
  locales: ["zh-Hans", "zh-Hant", "ja"]
}
```

## 博客模板

在 `posts` 里新增一条，格式如下：

```js
{
  slug: "my-new-post",
  category: "Blogging",
  title: "这篇博客的标题",
  date: "2026-05-27",
  excerpt: "这里写摘要，会显示在首页和博客列表。",
  body: [
    "这里是正文第一段。",
    "这里是正文第二段。",
    "这里是正文第三段。"
  ]
}
```

填写规则：

- `slug`：这篇文章的唯一名字，只用英文小写、数字、短横线
- `category`：文章分类，比如 `Translation`、`Blogging`、`Affiliate`
- `title`：文章标题
- `date`：日期，格式是 `YYYY-MM-DD`
- `excerpt`：摘要
- `body`：正文，每一段单独写成一行字符串

## 翻译作品模板

如果要新增到子文件夹，推荐在 `content/works/` 下新建一个 `.js` 文件，格式如下：

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

填写规则：

- `tag`：作品标签，比如 `Translation`、`Editing`、`In Progress`
- `title`：作品标题
- `meta`：显示在作品标题下方的补充信息
- `copy`：作品简介
- `link`：DLsite 商品页链接
- `locales`：要显示到哪些语言版本
- `mode`：`prepend` 代表放到最前面，`append` 代表加到最后面

## 推荐清单模板

在 `picks` 里新增一条，格式如下：

```js
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
```

填写规则：

- `slug`：推荐文章的唯一名字
- `tag`：分类标签，比如 `Reading`、`Writing`、`Learning`
- `title`：推荐标题
- `meta`：一句简短补充说明
- `copy`：摘要
- `productLink`：商品购买链接
- `body`：完整推荐文章正文

## 最省事的写法

如果你不想每次从头写，最简单的方法是：

1. 找一条旧博客、旧作品或旧推荐
2. 复制整条
3. 改成你的新内容
4. 保存
5. 上传到 GitHub

如果你是新增作品，最省事的是直接复制：

- `content/works/new-releases.js`

## 需要特别注意的地方

- 每一条内容后面的逗号要保留
- `body` 里的每一段都要用英文双引号包住
- 链接必须是完整网址，例如 `https://...`
- `slug` 不要和已有内容重复
- 新增到 `content/` 的文件后，记得同时把文件路径写进 `content/manifest.js`

## 当前部署方式

- GitHub：保存网站文件
- Cloudflare Pages：自动部署网站
- 自定义域名：`mszl-studio.com`

只要 GitHub 仓库更新，网站就会自动同步更新。
