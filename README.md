# 个人网站部署说明

这是一个纯静态网站，可以直接部署到 Cloudflare Pages。

## 当前主要文件

- [index.html](/C:/Users/USER/OneDrive/ドキュメント/个人网站制作/index.html)
- [blog.html](/C:/Users/USER/OneDrive/ドキュメント/个人网站制作/blog.html)
- [post.html](/C:/Users/USER/OneDrive/ドキュメント/个人网站制作/post.html)
- [works.html](/C:/Users/USER/OneDrive/ドキュメント/个人网站制作/works.html)
- [picks.html](/C:/Users/USER/OneDrive/ドキュメント/个人网站制作/picks.html)
- [pick-post.html](/C:/Users/USER/OneDrive/ドキュメント/个人网站制作/pick-post.html)
- [site-data.js](/C:/Users/USER/OneDrive/ドキュメント/个人网站制作/site-data.js)
- [styles.css](/C:/Users/USER/OneDrive/ドキュメント/个人网站制作/styles.css)

## 你以后主要改哪里

- 改网站内容：`site-data.js`
- 改页面结构：`index.html`、`blog.html`、`post.html`、`works.html`、`picks.html`、`pick-post.html`
- 改样式：`styles.css`

## 最常见的内容更新

- 新增博客：在 `site-data.js` 的 `posts` 里新增一项
- 新增翻译作品：在 `site-data.js` 的 `works` 里新增一项
- 新增推荐商品：在 `site-data.js` 的 `picks` 里新增一项
- 替换商品购买页：把 `productLink` 或 `link` 改成真实链接
- 改联系方式和网站介绍：修改 `site.contactCopy`、`site.contactEmail`、`site.about`

## 上传到 GitHub 前

保证仓库根目录下至少有这些文件：

- `index.html`
- `styles.css`
- `site-data.js`

你当前这个项目已经符合 Cloudflare Pages 的静态站要求，不需要额外构建。

## Cloudflare Pages 推荐设置

- Production branch: `main`
- Build command: `exit 0`
- Build output directory: `.`

## 现在的状态

这个网站已经包含：

- 首页
- 博客列表页
- 博客文章页
- 翻译作品列表页
- 推荐清单列表页
- 推荐文章页
- 简体 / 繁体 / 日本语切换

## 下一步

你接下来只需要：

1. 创建 GitHub 仓库
2. 把当前目录文件上传到仓库
3. 在 Cloudflare Pages 里连接这个仓库并部署

如果你把 GitHub 仓库准备好，我可以继续一步一步带你完成 Cloudflare Pages 的实际部署。
